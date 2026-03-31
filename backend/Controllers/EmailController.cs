using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Data;

namespace AvIntelOS.Api.Controllers;

[ApiController]
[Route("api/v1/email")]
public class EmailController : ControllerBase
{
    private readonly AvIntelDbContext _db;

    public EmailController(AvIntelDbContext db)
    {
        _db = db;
    }

    // GET api/v1/email/kpis
    [HttpGet("kpis")]
    public async Task<IActionResult> GetKpis()
    {
        var totalQi = await _db.EmailPerformances.SumAsync(e => e.QiAttributed);
        var totalSent = await _db.EmailPerformances.SumAsync(e => e.SendVolume);
        var totalClicks = await _db.EmailPerformances.SumAsync(e => e.Clicks ?? 0);

        return Ok(new
        {
            email_assisted_qi = new { value = totalQi, confidence = "PROBABLE" },
            return_visit_rate = new { value = 0, confidence = "POSSIBLE" },
            score_progression = new { value = "not_active", confidence = "CONFIRMED" },
            retargeting_sync = new { value = "not_active", confidence = "CONFIRMED" },
            lifecycle_attribution = new { value = "not_built", confidence = "CONFIRMED" },
            newsletter_segmentation = new { value = "not_active", confidence = "CONFIRMED" }
        });
    }

    // GET api/v1/email/sequences
    [HttpGet("sequences")]
    public async Task<IActionResult> GetSequences([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var sequences = await _db.EmailSequences
            .OrderBy(s => s.SequenceName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new
            {
                sequence_name = s.SequenceName,
                trigger_behavior = s.TriggerBehavior,
                audience_segment = s.AudienceSegment,
                audience_size = s.AudienceSize,
                score_range = s.ScoreRange,
                email_count = s.EmailCount,
                s.Objective,
                s.Status,
                confidence_level = s.ConfidenceLevel
            })
            .ToListAsync();

        return Ok(sequences);
    }

    // GET api/v1/email/scoring-tiers
    [HttpGet("scoring-tiers")]
    public IActionResult GetScoringTiers()
    {
        var tiers = new[]
        {
            new { tier_name = "Hot", score_range = "80-100", temperature = "hot", description = "Active buyer — multiple listing views, form starts, repeat visits", actions = "Priority routing, sales alert, retargeting exclusion" },
            new { tier_name = "Warm", score_range = "50-79", temperature = "warm", description = "Engaged researcher — spec page views, content consumption, email clicks", actions = "Nurture sequence, listing recommendations, retargeting inclusion" },
            new { tier_name = "Cool", score_range = "20-49", temperature = "cool", description = "Early-stage browser — homepage visits, category browsing, newsletter subscriber", actions = "Educational content, market reports, broad retargeting" },
            new { tier_name = "Cold", score_range = "0-19", temperature = "cold", description = "Minimal engagement — single visit, no return, no email interaction", actions = "Re-engagement campaign after 30d, suppress from premium content" }
        };

        return Ok(tiers);
    }

    // GET api/v1/email/retargeting-segments
    [HttpGet("retargeting-segments")]
    public IActionResult GetRetargetingSegments()
    {
        var segments = new[]
        {
            new { segment_name = "High-Intent Listing Viewers", audience_size = 3200, sync_status = "not_active", signal_quality = "PROBABLE" },
            new { segment_name = "Form Abandoners", audience_size = 650, sync_status = "not_active", signal_quality = "PROBABLE" },
            new { segment_name = "Repeat Visitors (3+)", audience_size = 4800, sync_status = "not_active", signal_quality = "PROBABLE" },
            new { segment_name = "Newsletter Subscribers", audience_size = 28000, sync_status = "not_active", signal_quality = "CONFIRMED" },
            new { segment_name = "AvBlast Engaged", audience_size = 8500, sync_status = "not_active", signal_quality = "CONFIRMED" }
        };

        return Ok(segments);
    }

    // GET api/v1/email/attribution-blockers
    [HttpGet("attribution-blockers")]
    public IActionResult GetAttributionBlockers()
    {
        var blockers = new[]
        {
            new { blocker_name = "No CRM integration", coverage_pct = 0, description = "Cannot attribute email touches to closed deals", severity = "critical" },
            new { blocker_name = "No lead scoring", coverage_pct = 0, description = "Cannot differentiate buyer intent levels", severity = "critical" },
            new { blocker_name = "No UTM-to-CRM mapping", coverage_pct = 0, description = "Email click source lost at form submission", severity = "high" },
            new { blocker_name = "No offline conversion import", coverage_pct = 0, description = "Phone calls from email not tracked", severity = "high" },
            new { blocker_name = "Email_Open contamination in GA4", coverage_pct = 0, description = "Email open events inflate engagement metrics", severity = "moderate" }
        };

        return Ok(blockers);
    }

    // GET api/v1/email/performance
    [HttpGet("performance")]
    public async Task<IActionResult> GetPerformance([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var records = await _db.EmailPerformances
            .OrderByDescending(e => e.SendDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new
            {
                send_date = e.SendDate,
                email_product = e.EmailProduct,
                send_volume = e.SendVolume,
                e.Delivered,
                e.Opens,
                e.Clicks,
                qi_attributed = e.QiAttributed,
                confidence_level = e.ConfidenceLevel
            })
            .ToListAsync();

        return Ok(records);
    }

    // GET api/v1/email/servers
    [HttpGet("servers")]
    public async Task<IActionResult> GetServers()
    {
        var servers = await _db.EmailServers
            .Select(s => new
            {
                server_hostname = s.ServerHostname,
                s.Purpose,
                s.Status,
                spf_status = s.SpfStatus,
                dkim_status = s.DkimStatus,
                dmarc_status = s.DmarcStatus,
                risk_level = s.RiskLevel
            })
            .ToListAsync();

        return Ok(servers);
    }

    // GET api/v1/email/newsletter-segments
    [HttpGet("newsletter-segments")]
    public IActionResult GetNewsletterSegments()
    {
        var segments = new[]
        {
            new { segment_name = "Piston Buyers", audience_criteria = "Category interest: piston, recent listing views", content_focus = "Piston listings, market reports, ownership guides", segmentation_status = "not_active" },
            new { segment_name = "Jet Buyers", audience_criteria = "Category interest: jet, high engagement score", content_focus = "Jet listings, pre-buy guides, financing", segmentation_status = "not_active" },
            new { segment_name = "Turboprop Buyers", audience_criteria = "Category interest: turboprop", content_focus = "Turboprop listings, comparison articles", segmentation_status = "not_active" },
            new { segment_name = "Helicopter Buyers", audience_criteria = "Category interest: helicopter", content_focus = "Helicopter listings, operational guides", segmentation_status = "not_active" },
            new { segment_name = "Brokers & Dealers", audience_criteria = "Account type: advertiser", content_focus = "Market intelligence, platform updates, lead quality reports", segmentation_status = "not_active" },
            new { segment_name = "FBO Operators", audience_criteria = "FBO listing or interest signal", content_focus = "FBO directory updates, Ramp Ramble, ARC content", segmentation_status = "not_active" }
        };

        return Ok(segments);
    }
}
