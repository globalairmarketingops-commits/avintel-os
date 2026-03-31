using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Data;

namespace AvIntelOS.Api.Controllers;

[ApiController]
[Route("api/v1/events")]
public class EventsController : ControllerBase
{
    private readonly AvIntelDbContext _db;

    public EventsController(AvIntelDbContext db)
    {
        _db = db;
    }

    // GET api/v1/events/kpis
    [HttpGet("kpis")]
    public IActionResult GetKpis()
    {
        return Ok(new
        {
            revenue_target_coverage = new { value = 0, confidence = "POSSIBLE" },
            pre_event_meeting_fill = new { value = 0, confidence = "POSSIBLE" },
            on_site_tagged_leads = new { value = 0, confidence = "POSSIBLE" },
            sponsor_close_rate = new { value = 0, confidence = "POSSIBLE" },
            content_yield = new { value = 0, confidence = "POSSIBLE" },
            attribution_integrity = new { value = "not_built", confidence = "CONFIRMED" }
        });
    }

    // GET api/v1/events/revenue-products
    [HttpGet("revenue-products")]
    public async Task<IActionResult> GetRevenueProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var products = await _db.RevenueStreams
            .OrderByDescending(r => r.Amount)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                product_name = r.StreamName,
                revenue_type = r.Period,
                target_quarterly = 0m,
                actual_quarterly = r.Amount,
                sales_status = r.Trend
            })
            .ToListAsync();

        return Ok(products);
    }

    // GET api/v1/events/pre-event-status
    [HttpGet("pre-event-status")]
    public IActionResult GetPreEventStatus()
    {
        var events = new[]
        {
            new
            {
                event_name = "AERO Friedrichshafen 2026",
                days_out = -5,
                meeting_scheduler = "active",
                outreach = "complete",
                geo_retargeting = "active",
                page_status = "live"
            },
            new
            {
                event_name = "EAA AirVenture Oshkosh 2026",
                days_out = 115,
                meeting_scheduler = "not_started",
                outreach = "not_started",
                geo_retargeting = "planned",
                page_status = "not_started"
            },
            new
            {
                event_name = "NBAA-BACE 2026",
                days_out = 210,
                meeting_scheduler = "not_started",
                outreach = "not_started",
                geo_retargeting = "planned",
                page_status = "not_started"
            }
        };

        return Ok(events);
    }

    // GET api/v1/events/on-site-doctrine
    [HttpGet("on-site-doctrine")]
    public IActionResult GetOnSiteDoctrine()
    {
        var checklist = new[]
        {
            new { checklist_item = "Badge scanner configured and tested", status = "ready", compliance_pct = 100 },
            new { checklist_item = "Lead capture forms (tablet + paper backup)", status = "ready", compliance_pct = 100 },
            new { checklist_item = "Daily lead upload to CRM", status = "not_applicable", compliance_pct = 0 },
            new { checklist_item = "Social posting schedule (3x/day minimum)", status = "planned", compliance_pct = 50 },
            new { checklist_item = "Photo/video capture per session", status = "planned", compliance_pct = 50 },
            new { checklist_item = "Booth traffic counter", status = "not_ready", compliance_pct = 0 },
            new { checklist_item = "Competitor booth reconnaissance", status = "planned", compliance_pct = 25 },
            new { checklist_item = "End-of-day team debrief", status = "planned", compliance_pct = 50 }
        };

        return Ok(checklist);
    }

    // GET api/v1/events/post-event-status
    [HttpGet("post-event-status")]
    public IActionResult GetPostEventStatus()
    {
        var events = new[]
        {
            new
            {
                event_name = "Sun 'n Fun 2026",
                recap_status = "pending",
                lead_followup_pct = 0,
                retargeting_active = false,
                roi_review_status = "not_started"
            },
            new
            {
                event_name = "AERO Friedrichshafen 2026",
                recap_status = "not_started",
                lead_followup_pct = 0,
                retargeting_active = false,
                roi_review_status = "not_started"
            }
        };

        return Ok(events);
    }

    // GET api/v1/events/partnerships
    [HttpGet("partnerships")]
    public IActionResult GetPartnerships()
    {
        var partnerships = new[]
        {
            new
            {
                partner_type = "Title Sponsor",
                bundle_name = "Aviation Media Hub Presenting Sponsor",
                components = new[] { "Logo placement on all event pages", "AvBlast featured banner (4 issues)", "Booth co-location", "Social media package (12 posts)" },
                status = "available"
            },
            new
            {
                partner_type = "Content Partner",
                bundle_name = "Market Intelligence Series Sponsor",
                components = new[] { "Co-branded market reports", "Resource center placement", "Newsletter feature (2 issues)", "Podcast mention" },
                status = "available"
            },
            new
            {
                partner_type = "Event Sponsor",
                bundle_name = "Show Daily Sponsor",
                components = new[] { "Show daily banner ad", "Email blast to attendees", "Booth signage", "Lead list share" },
                status = "available"
            }
        };

        return Ok(partnerships);
    }

    // GET api/v1/events/content-capture
    [HttpGet("content-capture")]
    public IActionResult GetContentCapture()
    {
        var capture = new[]
        {
            new { content_type = "Booth Photos", target_per_event = 50, actual_avg = 30, gap = 20 },
            new { content_type = "Aircraft Walkaround Videos", target_per_event = 5, actual_avg = 2, gap = 3 },
            new { content_type = "Interview Clips", target_per_event = 8, actual_avg = 3, gap = 5 },
            new { content_type = "Social Stories/Reels", target_per_event = 15, actual_avg = 8, gap = 7 },
            new { content_type = "Recap Article", target_per_event = 1, actual_avg = 1, gap = 0 },
            new { content_type = "Attendee Testimonials", target_per_event = 5, actual_avg = 1, gap = 4 }
        };

        return Ok(capture);
    }

    // GET api/v1/events/attribution
    [HttpGet("attribution")]
    public IActionResult GetAttribution()
    {
        var metrics = new[]
        {
            new { metric_name = "Leads Captured On-Site", value = "0", confidence_level = "POSSIBLE" },
            new { metric_name = "Post-Event Inquiries (30d)", value = "0", confidence_level = "POSSIBLE" },
            new { metric_name = "Geo-Retargeting Impressions", value = "0", confidence_level = "POSSIBLE" },
            new { metric_name = "Landing Page Visits (Event)", value = "0", confidence_level = "POSSIBLE" },
            new { metric_name = "Meetings Booked", value = "0", confidence_level = "POSSIBLE" },
            new { metric_name = "Sponsorship Revenue Attributed", value = "0", confidence_level = "POSSIBLE" },
            new { metric_name = "Content Pieces Published", value = "0", confidence_level = "POSSIBLE" }
        };

        return Ok(metrics);
    }
}
