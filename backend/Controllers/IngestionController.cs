using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Data;
using AvIntelOS.Api.Models.Entities;
using AvIntelOS.Api.Services;

namespace AvIntelOS.Api.Controllers;

[ApiController]
[Route("api/v1/ingestion")]
public class IngestionController : ControllerBase
{
    private readonly AvIntelDbContext _db;
    private readonly WindsorIngestionService _windsor;

    public IngestionController(AvIntelDbContext db, WindsorIngestionService windsor)
    {
        _db = db;
        _windsor = windsor;
    }

    // POST api/v1/ingestion/ga4
    [HttpPost("ga4")]
    public async Task<IActionResult> TriggerGa4([FromQuery] DateOnly? from, [FromQuery] DateOnly? to)
    {
        var result = await _windsor.IngestGa4Async(from, to);
        return Ok(result);
    }

    // POST api/v1/ingestion/gsc
    [HttpPost("gsc")]
    public async Task<IActionResult> TriggerGsc([FromQuery] DateOnly? from, [FromQuery] DateOnly? to)
    {
        var result = await _windsor.IngestGscAsync(from, to);
        return Ok(result);
    }

    // POST api/v1/ingestion/google-ads
    [HttpPost("google-ads")]
    public async Task<IActionResult> TriggerGoogleAds([FromQuery] DateOnly? from, [FromQuery] DateOnly? to)
    {
        var result = await _windsor.IngestGoogleAdsAsync(from, to);
        return Ok(result);
    }

    // POST api/v1/ingestion/windsor — alias for refresh-all
    [HttpPost("windsor")]
    public async Task<IActionResult> TriggerWindsor([FromQuery] DateOnly? from, [FromQuery] DateOnly? to)
    {
        var results = await _windsor.IngestAllAsync(from, to);
        return Ok(new { sources = results });
    }

    // POST api/v1/ingestion/refresh-all
    [HttpPost("refresh-all")]
    public async Task<IActionResult> RefreshAll([FromQuery] DateOnly? from, [FromQuery] DateOnly? to)
    {
        var results = await _windsor.IngestAllAsync(from, to);
        return Ok(new { sources = results });
    }

    // POST api/v1/ingestion/crm-upload — manual CSV upload for CRM metrics
    [HttpPost("crm-upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CrmUpload([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file provided" });

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { error = "Only CSV files accepted" });

        using var reader = new StreamReader(file.OpenReadStream());
        var header = await reader.ReadLineAsync();
        if (string.IsNullOrEmpty(header))
            return BadRequest(new { error = "Empty file" });

        var cols = header.Split(',').Select(c => c.Trim().ToLowerInvariant()).ToArray();
        var rows = new List<Dictionary<string, string>>();

        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync();
            if (string.IsNullOrWhiteSpace(line)) continue;
            var vals = line.Split(',');
            var row = new Dictionary<string, string>();
            for (int i = 0; i < cols.Length && i < vals.Length; i++)
                row[cols[i]] = vals[i].Trim();
            rows.Add(row);
        }

        // Process broker health snapshots from CSV
        int brokersUpdated = 0;
        int listingsUpdated = 0;

        foreach (var row in rows)
        {
            // Broker metrics rows
            if (row.ContainsKey("broker_name") && row.ContainsKey("qualified_inquiries"))
            {
                var brokerName = row["broker_name"];
                var broker = await _db.Brokers.FirstOrDefaultAsync(b => b.BrokerName == brokerName);
                if (broker == null)
                {
                    broker = new Broker
                    {
                        BrokerName = brokerName,
                        CategoryMix = row.GetValueOrDefault("category", "piston"),
                        Tier = row.GetValueOrDefault("tier", "standard"),
                        DataSource = "crm_manual",
                        ConfidenceLevel = "CONFIRMED",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _db.Brokers.Add(broker);
                    await _db.SaveChangesAsync();
                }

                var snapDate = DateOnly.TryParse(row.GetValueOrDefault("date", ""), out var d)
                    ? d : DateOnly.FromDateTime(DateTime.UtcNow);

                // Update broker-level metrics
                broker.InquiryVolume30d = int.TryParse(row.GetValueOrDefault("qualified_inquiries", "0"), out var qi) ? qi : 0;
                broker.UpdatedAt = DateTime.UtcNow;
                broker.SourceFreshness = DateTime.UtcNow;

                _db.BrokerHealthSnapshots.Add(new BrokerHealthSnapshot
                {
                    BrokerId = broker.Id,
                    SnapshotDate = snapDate,
                    ListingCount = int.TryParse(row.GetValueOrDefault("active_listings", "0"), out var al) ? al : null,
                    AvgQuality = int.TryParse(row.GetValueOrDefault("avg_quality_score", ""), out var aq) ? aq : null,
                    HealthScore = int.TryParse(row.GetValueOrDefault("health_score", ""), out var hs) ? hs : null,
                    ConfidenceLevel = "CONFIRMED",
                    CreatedAt = DateTime.UtcNow
                });
                brokersUpdated++;
            }

            // Listing-level rows
            if (row.ContainsKey("listing_id") && row.ContainsKey("detail_views"))
            {
                var listingId = row["listing_id"];
                var listing = await _db.Listings.FirstOrDefaultAsync(l => l.ListingId == listingId);
                if (listing == null)
                {
                    var make = row.GetValueOrDefault("make", "");
                    var model = row.GetValueOrDefault("model", "");
                    listing = new Listing
                    {
                        ListingId = listingId,
                        MakeModel = $"{make} {model}".Trim(),
                        Category = row.GetValueOrDefault("category", "piston"),
                        PhotoCount = int.TryParse(row.GetValueOrDefault("photo_count", "0"), out var ph) ? ph : 0,
                        PriceVisible = row.GetValueOrDefault("price_visible", "true").ToLowerInvariant() == "true",
                        DataSource = "crm_manual",
                        Status = "active",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _db.Listings.Add(listing);
                }

                listing.DetailViews30d = int.TryParse(row.GetValueOrDefault("detail_views", "0"), out var dv) ? dv : 0;
                listing.Inquiries30d = int.TryParse(row.GetValueOrDefault("inquiries", "0"), out var inq) ? inq : 0;
                listing.UpdatedAt = DateTime.UtcNow;
                listing.SourceFreshness = DateTime.UtcNow;
                listingsUpdated++;
            }
        }

        await _db.SaveChangesAsync();
        await LogIngestion("crm_manual", brokersUpdated + listingsUpdated, "completed");

        return Ok(new
        {
            status = "completed",
            brokers_updated = brokersUpdated,
            listings_updated = listingsUpdated,
            total_rows = rows.Count,
            message = $"CRM upload processed: {brokersUpdated} broker snapshots, {listingsUpdated} listings"
        });
    }

    private async Task LogIngestion(string sourceKey, int rows, string status)
    {
        var source = await _db.DataSources.FirstOrDefaultAsync(s => s.SourceKey == sourceKey);
        if (source != null)
        {
            _db.IngestionLogs.Add(new IngestionLog
            {
                SourceId = source.Id,
                StartedAt = DateTime.UtcNow,
                CompletedAt = DateTime.UtcNow,
                Status = status,
                RecordsInserted = rows,
                TriggerType = "manual"
            });
            await _db.SaveChangesAsync();
        }
    }
}
