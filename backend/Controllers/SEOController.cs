using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Data;
using AvIntelOS.Api.Models.Entities;

namespace AvIntelOS.Api.Controllers;

[ApiController]
[Route("api/v1/seo")]
public class SEOController : ControllerBase
{
    private readonly AvIntelDbContext _db;

    public SEOController(AvIntelDbContext db)
    {
        _db = db;
    }

    // GET api/v1/seo/status
    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var totalPlays = await _db.SeoPlays.CountAsync();
        var activePlays = await _db.SeoPlays.CountAsync(p => p.Status == "active");
        var hubsQueued = await _db.SeoModelHubs.CountAsync(h => h.HubStatus == "planned" || h.HubStatus == "not_started");

        return Ok(new
        {
            priority_categories = new { value = activePlays, total = totalPlays, confidence = "CONFIRMED" },
            model_hubs_queued = new { value = hubsQueued, confidence = "CONFIRMED" },
            page_velocity = new { value = 0, confidence = "POSSIBLE" },
            internal_linking_risk = new { value = "unknown", confidence = "POSSIBLE" },
            technical_safety = new { value = "nominal", confidence = "PROBABLE" }
        });
    }

    // GET api/v1/seo/plays
    [HttpGet("plays")]
    public async Task<IActionResult> GetPlays([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var plays = await _db.SeoPlays
            .OrderByDescending(p => p.PriorityScore)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                play_title = p.PlayTitle,
                p.Description,
                p.Category,
                priority_score = p.PriorityScore,
                p.Status,
                priority_label = p.PriorityLabel,
                owner_name = p.OwnerName,
                confidence_level = p.ConfidenceLevel
            })
            .ToListAsync();

        return Ok(plays);
    }

    // GET api/v1/seo/category-matrix
    [HttpGet("category-matrix")]
    public async Task<IActionResult> GetCategoryMatrix()
    {
        var benchmarks = await _db.CompetitiveBenchmarks
            .Select(b => new
            {
                b.Category,
                demand = b.DefensibilityScore,
                supply = b.ListingDepth ?? 0,
                ctr = b.RankStability ?? 0,
                complexity = b.ContentDepth ?? 0,
                operations = b.CpcPressure,
                priority = b.DefensibilityScore >= 60 ? "high" : b.DefensibilityScore >= 30 ? "medium" : "low"
            })
            .ToListAsync();

        return Ok(benchmarks);
    }

    // GET api/v1/seo/model-hubs
    [HttpGet("model-hubs")]
    public async Task<IActionResult> GetModelHubs([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var hubs = await _db.SeoModelHubs
            .OrderBy(h => h.BuildUrgency == "high" ? 0 : h.BuildUrgency == "medium" ? 1 : 2)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(h => new
            {
                h.Make,
                h.Model,
                h.Category,
                hub_status = h.HubStatus,
                content_gaps = h.ContentGaps,
                build_urgency = h.BuildUrgency,
                confidence_level = h.ConfidenceLevel
            })
            .ToListAsync();

        return Ok(hubs);
    }

    // GET api/v1/seo/technical-controls
    [HttpGet("technical-controls")]
    public IActionResult GetTechnicalControls()
    {
        var controls = new[]
        {
            new { control_name = "Canonical Tags", status = "pass", description = "All model pages have correct canonicals", risk_level = "low" },
            new { control_name = "robots.txt", status = "pass", description = "No critical pages blocked", risk_level = "low" },
            new { control_name = "XML Sitemap", status = "pass", description = "Sitemap submitted and indexed", risk_level = "low" },
            new { control_name = "Core Web Vitals", status = "warning", description = "LCP above 2.5s on some model pages", risk_level = "moderate" },
            new { control_name = "Schema Markup", status = "fail", description = "Product/Vehicle schema not implemented", risk_level = "high" },
            new { control_name = "Internal Linking", status = "warning", description = "Model hub cross-linking incomplete", risk_level = "moderate" },
            new { control_name = "AI Crawler Access", status = "fail", description = "Blocked — T2 ticket pending (Thomas Galla)", risk_level = "high" },
            new { control_name = "llms.txt", status = "fail", description = "Not built — needed for AEO strategy", risk_level = "moderate" },
            new { control_name = "HTTPS", status = "pass", description = "All pages served over HTTPS", risk_level = "low" },
            new { control_name = "Mobile Responsiveness", status = "pass", description = "All templates mobile-responsive", risk_level = "low" }
        };

        return Ok(controls);
    }

    // GET api/v1/seo/competitive-opportunity
    [HttpGet("competitive-opportunity")]
    public async Task<IActionResult> GetCompetitiveOpportunity()
    {
        var benchmarks = await _db.CompetitiveBenchmarks
            .Select(b => new
            {
                term_type = b.Category,
                share = b.DefensibilityScore,
                opportunity = 100 - b.DefensibilityScore,
                action = b.DefensibilityScore < 30 ? "attack" : b.DefensibilityScore < 60 ? "compete" : "defend"
            })
            .ToListAsync();

        return Ok(benchmarks);
    }

    // POST api/v1/seo/plays
    [HttpPost("plays")]
    public async Task<IActionResult> CreatePlay([FromBody] SeoPlay play)
    {
        play.CreatedAt = DateTime.UtcNow;
        play.UpdatedAt = DateTime.UtcNow;

        _db.SeoPlays.Add(play);
        await _db.SaveChangesAsync();

        return CreatedAtAction(null, new { play.Id, created_at = play.CreatedAt });
    }

    // PATCH api/v1/seo/plays/{id}
    [HttpPatch("plays/{id}")]
    public async Task<IActionResult> UpdatePlay(int id, [FromBody] Dictionary<string, object> updates)
    {
        var play = await _db.SeoPlays.FindAsync(id);
        if (play == null) return NotFound();

        if (updates.ContainsKey("play_title")) play.PlayTitle = updates["play_title"]?.ToString() ?? play.PlayTitle;
        if (updates.ContainsKey("description")) play.Description = updates["description"]?.ToString();
        if (updates.ContainsKey("status")) play.Status = updates["status"]?.ToString() ?? play.Status;
        if (updates.ContainsKey("priority_label")) play.PriorityLabel = updates["priority_label"]?.ToString() ?? play.PriorityLabel;
        if (updates.ContainsKey("owner_name")) play.OwnerName = updates["owner_name"]?.ToString();

        play.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { play.Id, updated_at = play.UpdatedAt });
    }
}
