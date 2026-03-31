using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Data;
using AvIntelOS.Api.Models.Entities;

namespace AvIntelOS.Api.Services;

public class WindsorIngestionService
{
    private readonly IHttpClientFactory _httpFactory;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _config;
    private readonly ILogger<WindsorIngestionService> _logger;

    private const string BASE_URL = "https://connectors.windsor.ai/all";

    public WindsorIngestionService(
        IHttpClientFactory httpFactory,
        IServiceScopeFactory scopeFactory,
        IConfiguration config,
        ILogger<WindsorIngestionService> logger)
    {
        _httpFactory = httpFactory;
        _scopeFactory = scopeFactory;
        _config = config;
        _logger = logger;
    }

    private string GetApiKey()
    {
        return _config["Windsor:ApiKey"]
            ?? Environment.GetEnvironmentVariable("WINDSOR_API_KEY")
            ?? throw new InvalidOperationException("Windsor API key not configured");
    }

    // ═══════════════════════════════════════════════════════════
    // GA4 Ingestion via Windsor
    // ═══════════════════════════════════════════════════════════
    public async Task<WindsorIngestionResult> IngestGa4Async(DateOnly? from = null, DateOnly? to = null)
    {
        var dateFrom = from ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        var dateTo = to ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

        var url = $"{BASE_URL}?api_key={GetApiKey()}"
            + $"&connector=google_analytics_4"
            + $"&date_from={dateFrom:yyyy-MM-dd}"
            + $"&date_to={dateTo:yyyy-MM-dd}"
            + $"&fields=source,medium,campaign,date,sessions,conversions,engaged_sessions,bounce_rate,new_users";

        return await FetchAndStoreGa4(url, dateFrom, dateTo);
    }

    private async Task<WindsorIngestionResult> FetchAndStoreGa4(string url, DateOnly dateFrom, DateOnly dateTo)
    {
        var client = _httpFactory.CreateClient();
        var result = new WindsorIngestionResult { Source = "ga4" };

        try
        {
            var response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadFromJsonAsync<WindsorResponse>();
            if (json?.Data == null || json.Data.Count == 0)
            {
                result.Status = "completed";
                result.Message = "No GA4 data returned from Windsor";
                return result;
            }

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AvIntelDbContext>();

            // Aggregate by channel + date
            var grouped = json.Data
                .GroupBy(r => new { Channel = MapToChannel(r), Date = r.GetDate() })
                .Where(g => g.Key.Date.HasValue);

            int inserted = 0;
            foreach (var group in grouped)
            {
                var snapDate = group.Key.Date!.Value;
                var channel = group.Key.Channel;

                var existing = await db.Ga4ChannelSnapshots
                    .FirstOrDefaultAsync(s => s.SnapshotDate == snapDate && s.Channel == channel);

                if (existing != null) continue; // Don't overwrite

                var snap = new Ga4ChannelSnapshot
                {
                    SnapshotDate = snapDate,
                    Channel = channel,
                    Sessions = (int)group.Sum(r => r.GetDecimal("sessions")),
                    Conversions = (int)group.Sum(r => r.GetDecimal("conversions")),
                    BounceRate = group.Average(r => r.GetDecimal("bounce_rate")),
                    ConfidenceLevel = "CONFIRMED",
                    CreatedAt = DateTime.UtcNow
                };

                db.Ga4ChannelSnapshots.Add(snap);
                inserted++;
            }

            await db.SaveChangesAsync();
            await LogIngestion(db, "ga4", inserted, "completed");

            result.RowsInserted = inserted;
            result.Status = "completed";
            result.Message = $"Ingested {inserted} GA4 channel snapshots ({dateFrom} to {dateTo})";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Windsor GA4 ingestion failed");
            result.Status = "failed";
            result.Message = ex.Message;
        }

        return result;
    }

    // ═══════════════════════════════════════════════════════════
    // Google Ads Ingestion via Windsor
    // ═══════════════════════════════════════════════════════════
    public async Task<WindsorIngestionResult> IngestGoogleAdsAsync(DateOnly? from = null, DateOnly? to = null)
    {
        var dateFrom = from ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        var dateTo = to ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

        var url = $"{BASE_URL}?api_key={GetApiKey()}"
            + $"&connector=google_ads"
            + $"&date_from={dateFrom:yyyy-MM-dd}"
            + $"&date_to={dateTo:yyyy-MM-dd}"
            + $"&fields=campaign,date,spend,impressions,clicks,conversions,cost_per_conversion";

        return await FetchAndStoreAds(url, dateFrom, dateTo);
    }

    private async Task<WindsorIngestionResult> FetchAndStoreAds(string url, DateOnly dateFrom, DateOnly dateTo)
    {
        var client = _httpFactory.CreateClient();
        var result = new WindsorIngestionResult { Source = "google_ads" };

        try
        {
            var response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadFromJsonAsync<WindsorResponse>();
            if (json?.Data == null || json.Data.Count == 0)
            {
                result.Status = "completed";
                result.Message = "No Google Ads data returned from Windsor";
                return result;
            }

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AvIntelDbContext>();

            // Aggregate by campaign + date
            var grouped = json.Data
                .GroupBy(r => new { Campaign = r.GetString("campaign"), Date = r.GetDate() })
                .Where(g => g.Key.Date.HasValue && !string.IsNullOrEmpty(g.Key.Campaign));

            int inserted = 0;
            foreach (var group in grouped)
            {
                var snapDate = group.Key.Date!.Value;
                var campaign = group.Key.Campaign!;

                var existing = await db.AdsCampaignSnapshots
                    .FirstOrDefaultAsync(s => s.SnapshotDate == snapDate && s.CampaignName == campaign);

                if (existing != null) continue;

                // Determine category from campaign name
                var category = InferCategory(campaign);

                var snap = new AdsCampaignSnapshot
                {
                    SnapshotDate = snapDate,
                    CampaignName = campaign,
                    Category = category,
                    Spend = group.Sum(r => r.GetDecimal("spend")),
                    Impressions = (int)group.Sum(r => r.GetDecimal("impressions")),
                    Clicks = (int)group.Sum(r => r.GetDecimal("clicks")),
                    Conversions = (int)group.Sum(r => r.GetDecimal("conversions")),
                    ConfidenceLevel = "CONFIRMED",
                    CreatedAt = DateTime.UtcNow
                };

                db.AdsCampaignSnapshots.Add(snap);
                inserted++;
            }

            await db.SaveChangesAsync();
            await LogIngestion(db, "google_ads", inserted, "completed");

            result.RowsInserted = inserted;
            result.Status = "completed";
            result.Message = $"Ingested {inserted} Ads campaign snapshots ({dateFrom} to {dateTo})";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Windsor Google Ads ingestion failed");
            result.Status = "failed";
            result.Message = ex.Message;
        }

        return result;
    }

    // ═══════════════════════════════════════════════════════════
    // GSC Ingestion via Windsor
    // ═══════════════════════════════════════════════════════════
    public async Task<WindsorIngestionResult> IngestGscAsync(DateOnly? from = null, DateOnly? to = null)
    {
        var dateFrom = from ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        var dateTo = to ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-3)); // GSC lags 2-3 days

        var url = $"{BASE_URL}?api_key={GetApiKey()}"
            + $"&connector=google_search_console"
            + $"&date_from={dateFrom:yyyy-MM-dd}"
            + $"&date_to={dateTo:yyyy-MM-dd}"
            + $"&fields=query,page,date,impressions,clicks,position";

        return await FetchAndStoreGsc(url, dateFrom, dateTo);
    }

    private async Task<WindsorIngestionResult> FetchAndStoreGsc(string url, DateOnly dateFrom, DateOnly dateTo)
    {
        var client = _httpFactory.CreateClient();
        var result = new WindsorIngestionResult { Source = "gsc" };

        try
        {
            var response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadFromJsonAsync<WindsorResponse>();
            if (json?.Data == null || json.Data.Count == 0)
            {
                result.Status = "completed";
                result.Message = "No GSC data returned from Windsor";
                return result;
            }

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AvIntelDbContext>();

            // Store as query snapshots
            var grouped = json.Data
                .Where(r => r.GetDate().HasValue)
                .GroupBy(r => new { Query = r.GetString("query"), Date = r.GetDate()!.Value });

            int inserted = 0;
            foreach (var group in grouped)
            {
                var query = group.Key.Query ?? "(unknown)";

                var existing = await db.GscQuerySnapshots
                    .FirstOrDefaultAsync(s => s.SnapshotDate == group.Key.Date && s.Query == query);

                if (existing != null) continue;

                var snap = new GscQuerySnapshot
                {
                    SnapshotDate = group.Key.Date,
                    Query = query,
                    Impressions = (int)group.Sum(r => r.GetDecimal("impressions")),
                    Clicks = (int)group.Sum(r => r.GetDecimal("clicks")),
                    AvgPosition = (decimal)group.Average(r => (double)r.GetDecimal("position")),
                    ConfidenceLevel = "CONFIRMED",
                    CreatedAt = DateTime.UtcNow
                };

                db.GscQuerySnapshots.Add(snap);
                inserted++;
            }

            await db.SaveChangesAsync();
            await LogIngestion(db, "gsc", inserted, "completed");

            result.RowsInserted = inserted;
            result.Status = "completed";
            result.Message = $"Ingested {inserted} GSC query snapshots ({dateFrom} to {dateTo})";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Windsor GSC ingestion failed");
            result.Status = "failed";
            result.Message = ex.Message;
        }

        return result;
    }

    // ═══════════════════════════════════════════════════════════
    // Refresh All Sources
    // ═══════════════════════════════════════════════════════════
    public async Task<List<WindsorIngestionResult>> IngestAllAsync(DateOnly? from = null, DateOnly? to = null)
    {
        var results = new List<WindsorIngestionResult>
        {
            await IngestGa4Async(from, to),
            await IngestGoogleAdsAsync(from, to),
            await IngestGscAsync(from, to)
        };
        return results;
    }

    // ═══════════════════════════════════════════════════════════
    // Helpers
    // ═══════════════════════════════════════════════════════════
    private static string MapToChannel(WindsorRow row)
    {
        var medium = row.GetString("medium")?.ToLowerInvariant() ?? "";
        var source = row.GetString("source")?.ToLowerInvariant() ?? "";

        if (medium == "cpc" || medium == "ppc") return "Paid Search";
        if (medium == "organic") return "Organic Search";
        if (medium == "email") return "Email";
        if (medium == "social" || source.Contains("facebook") || source.Contains("linkedin") || source.Contains("instagram"))
            return "Social";
        if (medium == "referral") return "Referral";
        if (medium == "(none)" && source == "(direct)") return "Direct";
        return "Other";
    }

    private static string InferCategory(string campaignName)
    {
        var lower = campaignName.ToLowerInvariant();
        if (lower.Contains("piston") || lower.Contains("cessna") || lower.Contains("beech") || lower.Contains("piper") || lower.Contains("cirrus") || lower.Contains("mooney"))
            return "piston";
        if (lower.Contains("jet") || lower.Contains("citation") || lower.Contains("gulfstream") || lower.Contains("phenom") || lower.Contains("learjet"))
            return "jet";
        if (lower.Contains("heli") || lower.Contains("robinson") || lower.Contains("bell") || lower.Contains("airbus h"))
            return "helicopter";
        if (lower.Contains("turbo") || lower.Contains("king air") || lower.Contains("pilatus") || lower.Contains("tbm"))
            return "turboprop";
        return "general";
    }

    private async Task LogIngestion(AvIntelDbContext db, string sourceKey, int rows, string status)
    {
        var source = await db.DataSources.FirstOrDefaultAsync(s => s.SourceKey == sourceKey);
        if (source == null) return;

        // Update last ingestion on source
        source.LastSuccessfulSync = DateTime.UtcNow;
        source.LastSyncAttempt = DateTime.UtcNow;
        source.ConnectionStatus = status == "completed" ? "connected" : "error";

        db.IngestionLogs.Add(new IngestionLog
        {
            SourceId = source.Id,
            StartedAt = DateTime.UtcNow,
            CompletedAt = DateTime.UtcNow,
            Status = status,
            RecordsInserted = rows,
            TriggerType = "manual"
        });

        await db.SaveChangesAsync();
    }
}

// ═══════════════════════════════════════════════════════════
// Windsor API Response Models
// ═══════════════════════════════════════════════════════════
public class WindsorResponse
{
    public List<WindsorRow> Data { get; set; } = new();
}

public class WindsorRow : Dictionary<string, JsonElement>
{
    public string? GetString(string key)
    {
        if (!ContainsKey(key)) return null;
        var el = this[key];
        return el.ValueKind == JsonValueKind.String ? el.GetString() : el.ToString();
    }

    public decimal GetDecimal(string key)
    {
        if (!ContainsKey(key)) return 0;
        var el = this[key];
        return el.ValueKind switch
        {
            JsonValueKind.Number => el.GetDecimal(),
            JsonValueKind.String => decimal.TryParse(el.GetString(), out var d) ? d : 0,
            _ => 0
        };
    }

    public DateOnly? GetDate()
    {
        var dateStr = GetString("date");
        if (string.IsNullOrEmpty(dateStr)) return null;
        return DateOnly.TryParse(dateStr, out var d) ? d : null;
    }
}

public class WindsorIngestionResult
{
    public string Source { get; set; } = "";
    public string Status { get; set; } = "pending";
    public string Message { get; set; } = "";
    public int RowsInserted { get; set; }
}
