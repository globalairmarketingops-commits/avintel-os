using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Data;

namespace AvIntelOS.Api.Controllers;

[ApiController]
[Route("api/v1/ga4")]
public class GA4Controller : ControllerBase
{
    private readonly AvIntelDbContext _db;

    public GA4Controller(AvIntelDbContext db)
    {
        _db = db;
    }

    // GET api/v1/ga4/quality-metrics
    [HttpGet("quality-metrics")]
    public async Task<IActionResult> GetQualityMetrics()
    {
        var health = await _db.Ga4PropertyHealths.FirstOrDefaultAsync();

        if (health == null)
            return Ok(new
            {
                real_engagement_rate = (decimal?)null,
                reported_engagement_rate = (decimal?)null,
                clean_sessions = 0,
                validation_coverage = 0,
                attribution_integrity = "UNCONFIRMED"
            });

        return Ok(new
        {
            real_engagement_rate = health.RealEngagementRate,
            reported_engagement_rate = health.ReportedEngagementRate,
            clean_sessions = 0,
            validation_coverage = 0,
            attribution_integrity = health.ConversionSignal
        });
    }

    // GET api/v1/ga4/channels
    [HttpGet("channels")]
    public async Task<IActionResult> GetChannels([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var latestDate = await _db.Ga4ChannelSnapshots
            .MaxAsync(s => (DateOnly?)s.SnapshotDate);

        if (!latestDate.HasValue)
            return Ok(Array.Empty<object>());

        var channels = await _db.Ga4ChannelSnapshots
            .Where(s => s.SnapshotDate == latestDate.Value)
            .OrderByDescending(s => s.Sessions)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new
            {
                s.Channel,
                s.Sessions,
                s.Users,
                engagement_rate = s.EngagementRate,
                s.Conversions,
                qi_per_100 = s.QiPer100Sessions,
                confidence_level = s.ConfidenceLevel
            })
            .ToListAsync();

        return Ok(channels);
    }

    // GET api/v1/ga4/landing-pages
    [HttpGet("landing-pages")]
    public async Task<IActionResult> GetLandingPages([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var latestDate = await _db.Ga4LandingPages
            .MaxAsync(p => (DateOnly?)p.SnapshotDate);

        if (!latestDate.HasValue)
            return Ok(Array.Empty<object>());

        var pages = await _db.Ga4LandingPages
            .Where(p => p.SnapshotDate == latestDate.Value)
            .OrderByDescending(p => p.Sessions)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                page_path = p.PagePath,
                p.Sessions,
                bounce_rate = p.BounceRate,
                p.Conversions,
                cvr_pct = p.CvrPct,
                p.Category,
                p.Impressions,
                ctr = p.Ctr,
                confidence_level = p.ConfidenceLevel
            })
            .ToListAsync();

        return Ok(pages);
    }

    // GET api/v1/ga4/events
    [HttpGet("events")]
    public async Task<IActionResult> GetEvents([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var latestDate = await _db.Ga4Events
            .MaxAsync(e => (DateOnly?)e.SnapshotDate);

        if (!latestDate.HasValue)
            return Ok(Array.Empty<object>());

        var events = await _db.Ga4Events
            .Where(e => e.SnapshotDate == latestDate.Value)
            .OrderByDescending(e => e.EventCount)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new
            {
                event_name = e.EventName,
                event_count = e.EventCount,
                e.Tier,
                is_contaminated = e.IsContaminated,
                confidence_level = e.ConfidenceLevel
            })
            .ToListAsync();

        return Ok(events);
    }

    // GET api/v1/ga4/property-health
    [HttpGet("property-health")]
    public async Task<IActionResult> GetPropertyHealth()
    {
        var health = await _db.Ga4PropertyHealths.FirstOrDefaultAsync();

        if (health == null)
            return Ok(new { property_id = "unknown", contamination_status = "UNKNOWN" });

        return Ok(new
        {
            property_id = health.PropertyId,
            contamination_status = health.ContaminationStatus,
            real_engagement_rate = health.RealEngagementRate,
            reported_engagement_rate = health.ReportedEngagementRate,
            enhanced_conversions = health.EnhancedConversions,
            conversion_signal = health.ConversionSignal
        });
    }

    // GET api/v1/ga4/contamination-exclusions
    [HttpGet("contamination-exclusions")]
    public async Task<IActionResult> GetContaminationExclusions()
    {
        var exclusions = await _db.Ga4ContaminationExclusions
            .Where(e => e.IsActive)
            .Select(e => new
            {
                e.Pattern,
                e.Reason,
                is_active = e.IsActive
            })
            .ToListAsync();

        return Ok(exclusions);
    }

    // GET api/v1/ga4/measurement-trust
    [HttpGet("measurement-trust")]
    public async Task<IActionResult> GetMeasurementTrust()
    {
        var health = await _db.Ga4PropertyHealths.FirstOrDefaultAsync();
        var isContaminated = health?.ContaminationStatus == "ACTIVE";

        return Ok(new
        {
            contamination_active = isContaminated,
            blockers = new[]
            {
                new { name = "Email_Open_ event contamination", status = isContaminated ? "active" : "resolved", since = "2023-06-01", impact = "Engagement rate inflated from ~17% to ~69%" },
                new { name = "Enhanced conversions", status = health?.EnhancedConversions ?? "UNCONFIRMED", since = (string?)null, impact = "Conversion signal may undercount" },
                new { name = "GTM consistency across 8 servers", status = health?.GtmDeploymentStatus ?? "UNKNOWN", since = (string?)null, impact = "Tag firing gaps possible" },
                new { name = "gclid/UTM capture in CRM", status = "AWAITING_DEV", since = (string?)null, impact = "Cannot close offline conversion loop" }
            },
            confidence_guide = new
            {
                confirmed = "Verified data with clean signal",
                probable = "High-confidence estimate, minor gaps",
                possible = "Directional only — do not present as fact"
            }
        });
    }
}
