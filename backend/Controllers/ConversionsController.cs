using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Data;

namespace AvIntelOS.Api.Controllers;

[ApiController]
[Route("api/v1/conversions")]
public class ConversionsController : ControllerBase
{
    private readonly AvIntelDbContext _db;

    public ConversionsController(AvIntelDbContext db)
    {
        _db = db;
    }

    // GET api/v1/conversions/summary?from=2026-02-01&to=2026-03-30
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] DateOnly? from = null, [FromQuery] DateOnly? to = null)
    {
        var ga4Query = _db.Ga4ChannelSnapshots.AsQueryable();
        var adsQuery = _db.AdsCampaignSnapshots.AsQueryable();

        if (from.HasValue) { ga4Query = ga4Query.Where(s => s.SnapshotDate >= from.Value); adsQuery = adsQuery.Where(s => s.SnapshotDate >= from.Value); }
        if (to.HasValue) { ga4Query = ga4Query.Where(s => s.SnapshotDate <= to.Value); adsQuery = adsQuery.Where(s => s.SnapshotDate <= to.Value); }

        // Use latest date within range for summary
        var latestGa4Date = await ga4Query.MaxAsync(s => (DateOnly?)s.SnapshotDate);
        var latestAdsDate = await adsQuery.MaxAsync(s => (DateOnly?)s.SnapshotDate);

        var ga4Conversions = latestGa4Date.HasValue
            ? await ga4Query.Where(s => s.SnapshotDate == latestGa4Date.Value).SumAsync(s => s.Conversions) : 0;
        var adsConversions = latestAdsDate.HasValue
            ? await adsQuery.Where(s => s.SnapshotDate == latestAdsDate.Value).SumAsync(s => s.Conversions) : 0;

        return Ok(new
        {
            total_conversions = ga4Conversions + adsConversions,
            ga4_conversions = ga4Conversions,
            ads_conversions = adsConversions,
            ga4_snapshot_date = latestGa4Date,
            ads_snapshot_date = latestAdsDate,
            date_range = new { from = from?.ToString("yyyy-MM-dd"), to = to?.ToString("yyyy-MM-dd") },
            confidence = "PROBABLE",
            note = "All conversions — GA4 + Google Ads combined. Conversion actions unconfirmed for jet expansion."
        });
    }

    // GET api/v1/conversions/by-channel?from=&to=
    [HttpGet("by-channel")]
    public async Task<IActionResult> GetByChannel([FromQuery] DateOnly? from = null, [FromQuery] DateOnly? to = null)
    {
        var ga4Q = _db.Ga4ChannelSnapshots.AsQueryable();
        var adsQ = _db.AdsCampaignSnapshots.AsQueryable();
        if (from.HasValue) { ga4Q = ga4Q.Where(s => s.SnapshotDate >= from.Value); adsQ = adsQ.Where(s => s.SnapshotDate >= from.Value); }
        if (to.HasValue) { ga4Q = ga4Q.Where(s => s.SnapshotDate <= to.Value); adsQ = adsQ.Where(s => s.SnapshotDate <= to.Value); }

        var latestGa4Date = await ga4Q.MaxAsync(s => (DateOnly?)s.SnapshotDate);
        var latestAdsDate = await adsQ.MaxAsync(s => (DateOnly?)s.SnapshotDate);

        var channels = new List<object>();

        if (latestGa4Date.HasValue)
        {
            var ga4Channels = await ga4Q
                .Where(s => s.SnapshotDate == latestGa4Date.Value)
                .OrderByDescending(s => s.Conversions)
                .Select(s => new
                {
                    source = "GA4",
                    channel = s.Channel,
                    conversions = s.Conversions,
                    sessions = s.Sessions,
                    cvr_pct = s.Sessions > 0 ? Math.Round((decimal)s.Conversions / s.Sessions * 100, 2) : 0m,
                    confidence = s.ConfidenceLevel
                })
                .ToListAsync();

            channels.AddRange(ga4Channels);
        }

        if (latestAdsDate.HasValue)
        {
            var adsCampaigns = await adsQ
                .Where(s => s.SnapshotDate == latestAdsDate.Value && s.Conversions > 0)
                .OrderByDescending(s => s.Conversions)
                .Select(s => new
                {
                    source = "Google Ads",
                    channel = s.CampaignName,
                    conversions = s.Conversions,
                    sessions = s.Clicks,
                    cvr_pct = s.Clicks > 0 ? Math.Round((decimal)s.Conversions / s.Clicks * 100, 2) : 0m,
                    confidence = s.ConfidenceLevel
                })
                .ToListAsync();

            channels.AddRange(adsCampaigns);
        }

        return Ok(channels);
    }

    // GET api/v1/conversions/by-category?from=&to=
    [HttpGet("by-category")]
    public async Task<IActionResult> GetByCategory([FromQuery] DateOnly? from = null, [FromQuery] DateOnly? to = null)
    {
        var ga4Q = _db.Ga4LandingPages.AsQueryable();
        var adsQ = _db.AdsCampaignSnapshots.AsQueryable();
        if (from.HasValue) { ga4Q = ga4Q.Where(p => p.SnapshotDate >= from.Value); adsQ = adsQ.Where(s => s.SnapshotDate >= from.Value); }
        if (to.HasValue) { ga4Q = ga4Q.Where(p => p.SnapshotDate <= to.Value); adsQ = adsQ.Where(s => s.SnapshotDate <= to.Value); }

        var latestGa4Date = await ga4Q.MaxAsync(p => (DateOnly?)p.SnapshotDate);
        var latestAdsDate = await adsQ.MaxAsync(s => (DateOnly?)s.SnapshotDate);

        var categoryMap = new Dictionary<string, (int ga4, int ads, int sessions)>();

        if (latestGa4Date.HasValue)
        {
            var ga4Categories = await ga4Q
                .Where(p => p.SnapshotDate == latestGa4Date.Value && p.Category != null)
                .GroupBy(p => p.Category!)
                .Select(g => new { category = g.Key, conversions = g.Sum(p => p.Conversions), sessions = g.Sum(p => p.Sessions) })
                .ToListAsync();

            foreach (var c in ga4Categories)
            {
                categoryMap[c.category] = (c.conversions, 0, c.sessions);
            }
        }

        if (latestAdsDate.HasValue)
        {
            var adsCategories = await adsQ
                .Where(s => s.SnapshotDate == latestAdsDate.Value && s.Category != null)
                .GroupBy(s => s.Category!)
                .Select(g => new { category = g.Key, conversions = g.Sum(s => s.Conversions), clicks = g.Sum(s => s.Clicks) })
                .ToListAsync();

            foreach (var a in adsCategories)
            {
                if (categoryMap.ContainsKey(a.category))
                {
                    var existing = categoryMap[a.category];
                    categoryMap[a.category] = (existing.ga4, a.conversions, existing.sessions + a.clicks);
                }
                else
                {
                    categoryMap[a.category] = (0, a.conversions, a.clicks);
                }
            }
        }

        var result = categoryMap
            .Select(kvp => new
            {
                category = kvp.Key,
                ga4_conversions = kvp.Value.ga4,
                ads_conversions = kvp.Value.ads,
                total_conversions = kvp.Value.ga4 + kvp.Value.ads,
                total_sessions = kvp.Value.sessions,
                cvr_pct = kvp.Value.sessions > 0 ? Math.Round((decimal)(kvp.Value.ga4 + kvp.Value.ads) / kvp.Value.sessions * 100, 2) : 0m,
                confidence = "PROBABLE"
            })
            .OrderByDescending(x => x.total_conversions)
            .ToList();

        return Ok(result);
    }

    // GET api/v1/conversions/trend?from=&to=
    [HttpGet("trend")]
    public async Task<IActionResult> GetTrend([FromQuery] DateOnly? from = null, [FromQuery] DateOnly? to = null)
    {
        var ga4Q = _db.Ga4ChannelSnapshots.AsQueryable();
        var adsQ = _db.AdsCampaignSnapshots.AsQueryable();
        if (from.HasValue) { ga4Q = ga4Q.Where(s => s.SnapshotDate >= from.Value); adsQ = adsQ.Where(s => s.SnapshotDate >= from.Value); }
        if (to.HasValue) { ga4Q = ga4Q.Where(s => s.SnapshotDate <= to.Value); adsQ = adsQ.Where(s => s.SnapshotDate <= to.Value); }

        var ga4Trend = await ga4Q
            .GroupBy(s => s.SnapshotDate)
            .OrderBy(g => g.Key)
            .Select(g => new
            {
                date = g.Key,
                ga4_conversions = g.Sum(s => s.Conversions)
            })
            .ToListAsync();

        var adsTrend = await adsQ
            .GroupBy(s => s.SnapshotDate)
            .OrderBy(g => g.Key)
            .Select(g => new
            {
                date = g.Key,
                ads_conversions = g.Sum(s => s.Conversions)
            })
            .ToListAsync();

        // Merge on date
        var allDates = ga4Trend.Select(g => g.date)
            .Union(adsTrend.Select(a => a.date))
            .OrderBy(d => d)
            .ToList();

        var trend = allDates.Select(d =>
        {
            var ga4 = ga4Trend.FirstOrDefault(g => g.date == d)?.ga4_conversions ?? 0;
            var ads = adsTrend.FirstOrDefault(a => a.date == d)?.ads_conversions ?? 0;
            return new
            {
                date = d,
                ga4_conversions = ga4,
                ads_conversions = ads,
                total_conversions = ga4 + ads,
                confidence = "PROBABLE"
            };
        }).ToList();

        return Ok(trend);
    }
}
