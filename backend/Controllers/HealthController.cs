using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Data;

namespace AvIntelOS.Api.Controllers;

[ApiController]
[Route("api/v1/health")]
public class HealthController : ControllerBase
{
    private readonly AvIntelDbContext _db;

    public HealthController(AvIntelDbContext db)
    {
        _db = db;
    }

    // GET api/v1/health/overview
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        var totalSources = await _db.DataSources.CountAsync();
        var connectedSources = await _db.DataSources.CountAsync(s => s.ConnectionStatus == "connected");
        var criticalAlerts = await _db.Alerts.CountAsync(a => !a.IsResolved && a.Severity == "critical");

        return Ok(new
        {
            decision_safe_sources = new { value = connectedSources, total = totalSources, confidence = "CONFIRMED" },
            critical_incidents = new { value = criticalAlerts, confidence = "CONFIRMED" },
            freshness_sla_compliance = new { value = 0, confidence = "POSSIBLE" },
            pages_fully_safe = new { value = 0, confidence = "POSSIBLE" },
            remediation_ownership = new { value = "partial", confidence = "PROBABLE" },
            board_safe_rendering = new { value = "enabled", confidence = "CONFIRMED" }
        });
    }

    // GET api/v1/health/incidents
    [HttpGet("incidents")]
    public async Task<IActionResult> GetIncidents([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var incidents = await _db.Alerts
            .Where(a => a.Severity == "warning" || a.Severity == "critical")
            .OrderByDescending(a => a.Severity)
            .ThenByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                a.Id,
                a.Title,
                a.Description,
                a.Severity,
                score = 0,
                a.Module,
                confidence_level = "CONFIRMED"
            })
            .ToListAsync();

        return Ok(incidents);
    }

    // GET api/v1/health/source-freshness
    [HttpGet("source-freshness")]
    public async Task<IActionResult> GetSourceFreshness()
    {
        var sources = await _db.DataSources
            .Select(s => new
            {
                source_key = s.SourceKey,
                display_name = s.DisplayName,
                sla_hours = s.SlaHours,
                actual_age_hours = s.LastSuccessfulSync.HasValue
                    ? (int)Math.Round((DateTime.UtcNow - s.LastSuccessfulSync.Value).TotalHours)
                    : (int?)null,
                sla_status = s.SlaHours.HasValue && s.LastSuccessfulSync.HasValue
                    ? (DateTime.UtcNow - s.LastSuccessfulSync.Value).TotalHours <= s.SlaHours.Value
                        ? "within_sla"
                        : "breach"
                    : "unknown",
                decision_safety = s.ConnectionStatus == "connected" ? "safe" : "degraded",
                confidence_level = "CONFIRMED"
            })
            .ToListAsync();

        return Ok(sources);
    }

    // GET api/v1/health/crawlers
    [HttpGet("crawlers")]
    public IActionResult GetCrawlers()
    {
        var crawlers = new[]
        {
            new { crawler_name = "GPTBot (OpenAI)", status = "blocked", owner = "Thomas Galla", ticket_id = "T2-001", priority = "T2" },
            new { crawler_name = "ClaudeBot (Anthropic)", status = "blocked", owner = "Thomas Galla", ticket_id = "T2-001", priority = "T2" },
            new { crawler_name = "Google-Extended", status = "blocked", owner = "Thomas Galla", ticket_id = "T2-001", priority = "T2" },
            new { crawler_name = "Googlebot", status = "allowed", owner = "Thomas Galla", ticket_id = (string?)null, priority = "N/A" },
            new { crawler_name = "Bingbot", status = "allowed", owner = "Thomas Galla", ticket_id = (string?)null, priority = "N/A" },
            new { crawler_name = "PerplexityBot", status = "blocked", owner = "Thomas Galla", ticket_id = "T2-001", priority = "T2" }
        };

        return Ok(crawlers);
    }

    // GET api/v1/health/email-deliverability
    [HttpGet("email-deliverability")]
    public async Task<IActionResult> GetEmailDeliverability()
    {
        var servers = await _db.EmailServers
            .Select(s => new
            {
                server_hostname = s.ServerHostname,
                s.Purpose,
                spf_status = s.SpfStatus,
                dkim_status = s.DkimStatus,
                dmarc_status = s.DmarcStatus,
                risk_level = s.RiskLevel
            })
            .ToListAsync();

        return Ok(servers);
    }

    // GET api/v1/health/page-trust
    [HttpGet("page-trust")]
    public IActionResult GetPageTrust()
    {
        var pages = new[]
        {
            new { page_number = 1, page_name = "Intelligence Dashboard", trust_status = "partial", issues = new[] { "Conversion signal UNCONFIRMED", "CPQI based on unconfirmed data" }, rendering_rules = new[] { "Show PROBABLE badge on QI metrics", "Gray out CPQI if unconfirmed" } },
            new { page_number = 2, page_name = "GA4 Analytics Hub", trust_status = "degraded", issues = new[] { "Email_Open contamination active", "Enhanced conversions UNCONFIRMED" }, rendering_rules = new[] { "Show contamination banner", "Display real vs reported engagement" } },
            new { page_number = 3, page_name = "Organic Intelligence", trust_status = "healthy", issues = Array.Empty<string>(), rendering_rules = new[] { "Standard rendering" } },
            new { page_number = 4, page_name = "Execution Cadence", trust_status = "healthy", issues = Array.Empty<string>(), rendering_rules = new[] { "Standard rendering" } },
            new { page_number = 5, page_name = "PPC Intelligence", trust_status = "partial", issues = new[] { "Conversion signal UNCONFIRMED" }, rendering_rules = new[] { "Show PROBABLE badge on conversion metrics" } },
            new { page_number = 6, page_name = "Content & Channel", trust_status = "healthy", issues = Array.Empty<string>(), rendering_rules = new[] { "Standard rendering" } },
            new { page_number = 7, page_name = "Data Health", trust_status = "healthy", issues = Array.Empty<string>(), rendering_rules = new[] { "Standard rendering" } }
        };

        return Ok(pages);
    }

    // GET api/v1/health/trust-registry
    [HttpGet("trust-registry")]
    public IActionResult GetTrustRegistry()
    {
        return Ok(new
        {
            role_rendering_rules = new
            {
                jeffrey = new { label = "Viewer", filter = "CONFIRMED only", reason = "Board-safe — never present assumptions as facts" },
                clay = new { label = "Editor", filter = "CONFIRMED + PROBABLE", reason = "Operational context — peer-level technical framing" },
                casey = new { label = "Operator", filter = "All levels", reason = "Full signal access for decision-making" }
            },
            contamination_alerts = new[]
            {
                new { source = "GA4", issue = "Email_Open_ event contamination", since = "June 2023", impact = "Engagement rate inflated from ~17% to ~69%", action = "Always show clean vs contaminated comparison" }
            },
            board_safe_mode = new
            {
                enabled = true,
                description = "When Jeffrey role is active, only CONFIRMED data surfaces. PROBABLE/POSSIBLE metrics are hidden or clearly labeled.",
                override_allowed = false
            }
        });
    }

    // GET api/v1/health/freshness-trend
    [HttpGet("freshness-trend")]
    public IActionResult GetFreshnessTrend()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var trend = new[]
        {
            new
            {
                source_key = "ga4",
                readings = Enumerable.Range(0, 7).Select(i => new
                {
                    date = today.AddDays(-i).ToString("yyyy-MM-dd"),
                    age_hours = 6 + (i * 2),
                    sla_status = (6 + i * 2) <= 24 ? "within_sla" : "breach"
                }).ToArray()
            },
            new
            {
                source_key = "gsc",
                readings = Enumerable.Range(0, 7).Select(i => new
                {
                    date = today.AddDays(-i).ToString("yyyy-MM-dd"),
                    age_hours = 24 + (i * 4),
                    sla_status = (24 + i * 4) <= 48 ? "within_sla" : "breach"
                }).ToArray()
            },
            new
            {
                source_key = "google_ads",
                readings = Enumerable.Range(0, 7).Select(i => new
                {
                    date = today.AddDays(-i).ToString("yyyy-MM-dd"),
                    age_hours = 4 + (i * 1),
                    sla_status = (4 + i * 1) <= 12 ? "within_sla" : "breach"
                }).ToArray()
            }
        };

        return Ok(trend);
    }
}
