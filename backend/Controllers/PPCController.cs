using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Data;

namespace AvIntelOS.Api.Controllers;

[ApiController]
[Route("api/v1/ppc")]
public class PPCController : ControllerBase
{
    private readonly AvIntelDbContext _db;

    public PPCController(AvIntelDbContext db)
    {
        _db = db;
    }

    // GET api/v1/ppc/kpis
    [HttpGet("kpis")]
    public async Task<IActionResult> GetKpis()
    {
        var latestDate = await _db.AdsCampaignSnapshots
            .MaxAsync(c => (DateOnly?)c.SnapshotDate);

        if (!latestDate.HasValue)
            return Ok(new
            {
                qi_from_ppc = 0,
                cpqi = 0m,
                piston_is = 0m,
                search_term_quality = 0m,
                scale_safety = "BLOCKED"
            });

        var campaigns = await _db.AdsCampaignSnapshots
            .Where(c => c.SnapshotDate == latestDate.Value)
            .ToListAsync();

        var totalQi = campaigns.Sum(c => c.Conversions);
        var totalSpend = campaigns.Sum(c => c.Spend);
        var cpqi = totalQi > 0 ? Math.Round(totalSpend / totalQi, 2) : 0m;
        var pistonCampaigns = campaigns.Where(c => c.Category == "piston").ToList();
        var pistonIs = pistonCampaigns.Any()
            ? pistonCampaigns.Average(c => c.ImpressionShare ?? 0)
            : 0m;

        return Ok(new
        {
            qi_from_ppc = totalQi,
            cpqi,
            piston_is = Math.Round(pistonIs, 1),
            search_term_quality = 0m,
            scale_safety = "BLOCKED"
        });
    }

    // GET api/v1/ppc/campaigns
    [HttpGet("campaigns")]
    public async Task<IActionResult> GetCampaigns([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var latestDate = await _db.AdsCampaignSnapshots
            .MaxAsync(c => (DateOnly?)c.SnapshotDate);

        if (!latestDate.HasValue)
            return Ok(Array.Empty<object>());

        var campaigns = await _db.AdsCampaignSnapshots
            .Where(c => c.SnapshotDate == latestDate.Value)
            .OrderByDescending(c => c.Spend)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new
            {
                campaign_name = c.CampaignName,
                c.Spend,
                c.Clicks,
                c.Impressions,
                ctr_pct = c.CtrPct,
                c.Conversions,
                cpqi = c.Cpqi,
                impression_share = c.ImpressionShare,
                campaign_status = c.CampaignStatus,
                c.Category,
                confidence_level = c.ConfidenceLevel
            })
            .ToListAsync();

        return Ok(campaigns);
    }

    // GET api/v1/ppc/model-performance
    [HttpGet("model-performance")]
    public async Task<IActionResult> GetModelPerformance()
    {
        var latestDate = await _db.AdsCampaignSnapshots
            .MaxAsync(c => (DateOnly?)c.SnapshotDate);

        if (!latestDate.HasValue)
            return Ok(Array.Empty<object>());

        var models = await _db.AdsCampaignSnapshots
            .Where(c => c.SnapshotDate == latestDate.Value && c.Category != null)
            .GroupBy(c => c.Category)
            .Select(g => new
            {
                model = g.Key,
                spend = g.Sum(c => c.Spend),
                cpqi = g.Sum(c => c.Conversions) > 0
                    ? g.Sum(c => c.Spend) / g.Sum(c => c.Conversions)
                    : 0,
                ctr_pct = g.Sum(c => c.Impressions) > 0
                    ? (decimal)g.Sum(c => c.Clicks) / g.Sum(c => c.Impressions) * 100
                    : 0,
                impression_share = g.Average(c => c.ImpressionShare),
                category = g.Key
            })
            .ToListAsync();

        return Ok(models);
    }

    // GET api/v1/ppc/search-terms
    [HttpGet("search-terms")]
    public async Task<IActionResult> GetSearchTerms([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var latestDate = await _db.AdsSearchTerms
            .MaxAsync(t => (DateOnly?)t.SnapshotDate);

        if (!latestDate.HasValue)
            return Ok(Array.Empty<object>());

        var terms = await _db.AdsSearchTerms
            .Where(t => t.SnapshotDate == latestDate.Value)
            .OrderByDescending(t => t.Spend)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new
            {
                search_term = t.SearchTerm,
                campaign_name = t.CampaignName,
                t.Impressions,
                t.Clicks,
                t.Spend,
                t.Conversions,
                waste_reason = t.WasteReason,
                action = t.Action
            })
            .ToListAsync();

        return Ok(terms);
    }

    // GET api/v1/ppc/waste-analysis
    [HttpGet("waste-analysis")]
    public async Task<IActionResult> GetWasteAnalysis()
    {
        var latest = await _db.PpcWasteAnalyses
            .OrderByDescending(w => w.SnapshotDate)
            .FirstOrDefaultAsync();

        if (latest == null)
            return Ok(new { total_spend = 0, irrelevant_spend = 0, waste_pct = 0, wasted_clicks = 0, negative_kw_coverage_pct = 0 });

        return Ok(new
        {
            total_spend = latest.TotalSpend,
            irrelevant_spend = latest.IrrelevantSpend,
            waste_pct = latest.WastePct,
            wasted_clicks = latest.WastedClicks,
            negative_kw_coverage_pct = latest.NegativeKwCoveragePct
        });
    }

    // GET api/v1/ppc/retargeting
    [HttpGet("retargeting")]
    public IActionResult GetRetargeting()
    {
        var segments = new[]
        {
            new { audience_name = "Listing Viewers — Piston (7d)", audience_size = 4200, window_days = 7, conversion_rate = 0.032 },
            new { audience_name = "Listing Viewers — Piston (30d)", audience_size = 12800, window_days = 30, conversion_rate = 0.018 },
            new { audience_name = "Spec Page Visitors — Jet", audience_size = 1800, window_days = 14, conversion_rate = 0.012 },
            new { audience_name = "Form Abandoners", audience_size = 650, window_days = 7, conversion_rate = 0.065 },
            new { audience_name = "Repeat Visitors (3+)", audience_size = 3200, window_days = 30, conversion_rate = 0.028 },
            new { audience_name = "Resource Center Readers", audience_size = 5600, window_days = 30, conversion_rate = 0.008 }
        };

        return Ok(segments);
    }

    // GET api/v1/ppc/auction-insights
    [HttpGet("auction-insights")]
    public async Task<IActionResult> GetAuctionInsights([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var insights = await _db.AdsAuctionInsights
            .OrderByDescending(a => a.WeekStart)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                week_start = a.WeekStart,
                a.Competitor,
                impression_share = a.ImpressionShare,
                overlap_rate = a.OverlapRate,
                position_above_rate = a.PositionAboveRate
            })
            .ToListAsync();

        return Ok(insights);
    }

    // GET api/v1/ppc/competitive-positioning
    [HttpGet("competitive-positioning")]
    public IActionResult GetCompetitivePositioning()
    {
        return Ok(new
        {
            head_terms = new { zone = "compete", our_is = 0.42, controller_is = 0.58, gap = -0.16, action = "Defend piston, concede jet until signal confirmed" },
            manufacturer_terms = new { zone = "build", our_is = 0.35, controller_is = 0.45, gap = -0.10, action = "Build Cessna/Beechcraft model hubs for organic lift" },
            model_terms = new { zone = "attack", our_is = 0.28, controller_is = 0.52, gap = -0.24, action = "High-intent terms — prioritize after conversion signal" },
            conquesting = new { zone = "monitor", our_is = 0.0, controller_is = 0.0, gap = 0.0, action = "Not active — requires validated CPQI baseline" }
        });
    }

    // GET api/v1/ppc/negative-keywords
    [HttpGet("negative-keywords")]
    public async Task<IActionResult> GetNegativeKeywords([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var negatives = await _db.PpcNegativeKeywords
            .OrderByDescending(n => n.AddedDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new
            {
                n.Term,
                campaign_name = n.CampaignName,
                match_type = n.MatchType,
                waste_reason = n.WasteReason,
                added_date = n.AddedDate
            })
            .ToListAsync();

        return Ok(negatives);
    }
}
