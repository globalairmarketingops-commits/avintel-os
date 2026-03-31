using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Data;

namespace AvIntelOS.Api.Controllers;

[ApiController]
[Route("api/v1/social")]
public class SocialController : ControllerBase
{
    private readonly AvIntelDbContext _db;

    public SocialController(AvIntelDbContext db)
    {
        _db = db;
    }

    // GET api/v1/social/kpis
    [HttpGet("kpis")]
    public IActionResult GetKpis()
    {
        return Ok(new
        {
            social_assisted_qi = new { value = 0, confidence = "POSSIBLE" },
            content_mix_compliance = new { value = 0, confidence = "POSSIBLE" },
            youtube_velocity = new { value = 0, confidence = "POSSIBLE" },
            broker_spotlight_coverage = new { value = 0, confidence = "POSSIBLE" },
            email_capture_rate = new { value = 0, confidence = "POSSIBLE" },
            authority_integrity = new { value = "nominal", confidence = "PROBABLE" }
        });
    }

    // GET api/v1/social/platform-guidelines
    [HttpGet("platform-guidelines")]
    public IActionResult GetPlatformGuidelines()
    {
        var guidelines = new[]
        {
            new { platform = "Facebook", category_focus = "Piston, Turboprop, FBO", tone = "Accessible, community-driven", role = "Listing distribution, broker spotlights, event promotion", notes = "Largest audience — primary listing showcase" },
            new { platform = "Instagram", category_focus = "All categories — visual emphasis", tone = "Aspirational, visual-first", role = "Ramp photography, aircraft beauty shots, Reels", notes = "Keaton owns Reels production via Canva" },
            new { platform = "LinkedIn", category_focus = "Jet, Turboprop, Industry", tone = "Professional, authoritative", role = "Industry thought leadership, Ian Lumpp content, market insights", notes = "B2B audience — broker and advertiser engagement" },
            new { platform = "YouTube", category_focus = "All categories", tone = "Educational, expert", role = "Walkarounds, market reports, podcast clips", notes = "Longest content shelf life — SEO value" },
            new { platform = "X (Twitter)", category_focus = "Breaking news, events", tone = "Concise, timely", role = "Event live coverage, breaking aviation news", notes = "Low priority — monitor only" }
        };

        return Ok(guidelines);
    }

    // GET api/v1/social/content-buckets
    [HttpGet("content-buckets")]
    public IActionResult GetContentBuckets()
    {
        var buckets = new[]
        {
            new { bucket_name = "Listing Spotlights", current_pct = 45, target_pct = 40, status = "over" },
            new { bucket_name = "Buyer Education / Guides", current_pct = 15, target_pct = 25, status = "under" },
            new { bucket_name = "Market Intelligence", current_pct = 10, target_pct = 15, status = "under" },
            new { bucket_name = "Broker / Dealer Spotlights", current_pct = 5, target_pct = 10, status = "under" },
            new { bucket_name = "Events & Shows", current_pct = 15, target_pct = 5, status = "over" },
            new { bucket_name = "Brand / Culture", current_pct = 10, target_pct = 5, status = "over" }
        };

        return Ok(buckets);
    }

    // GET api/v1/social/broker-spotlights
    [HttpGet("broker-spotlights")]
    public async Task<IActionResult> GetBrokerSpotlights()
    {
        var brokers = await _db.Brokers
            .OrderByDescending(b => b.HealthScore)
            .Take(20)
            .Select(b => new
            {
                broker_name = b.BrokerName,
                spotlight_status = "not_scheduled",
                interest_level = b.Tier == "premium" ? "high" : "medium",
                platforms = new[] { "Facebook", "LinkedIn" },
                category_fit = b.CategoryMix
            })
            .ToListAsync();

        return Ok(brokers);
    }

    // GET api/v1/social/event-coverage
    [HttpGet("event-coverage")]
    public IActionResult GetEventCoverage()
    {
        var events = new[]
        {
            new
            {
                event_name = "AERO Friedrichshafen 2026",
                phases = new[] { "pre_event", "live_coverage", "post_event" },
                content_types = new[] { "countdown_posts", "booth_photos", "walkthrough_video", "recap_article", "lead_followup" }
            },
            new
            {
                event_name = "EAA AirVenture Oshkosh 2026",
                phases = new[] { "pre_event", "live_coverage", "post_event" },
                content_types = new[] { "preview_guide", "daily_highlights", "exhibitor_spotlights", "ramp_photos", "recap_video" }
            },
            new
            {
                event_name = "NBAA-BACE 2026",
                phases = new[] { "pre_event", "live_coverage", "post_event" },
                content_types = new[] { "meeting_scheduler", "booth_previews", "live_social", "deal_announcements", "roi_review" }
            }
        };

        return Ok(events);
    }

    // GET api/v1/social/loop-metrics
    [HttpGet("loop-metrics")]
    public IActionResult GetLoopMetrics()
    {
        return Ok(new
        {
            email_capture_from_social = new { value = 0, trend = "flat", confidence = "POSSIBLE" },
            profile_to_site_rate = new { value = 0, trend = "flat", confidence = "POSSIBLE" },
            video_completion_rate = new { value = 0, trend = "flat", confidence = "POSSIBLE" },
            follower_growth = new { value = 0, trend = "flat", confidence = "POSSIBLE" }
        });
    }
}
