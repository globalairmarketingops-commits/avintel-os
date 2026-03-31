using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Data;

namespace AvIntelOS.Api.Controllers;

[ApiController]
[Route("api/v1")]
public class SystemController : ControllerBase
{
    private readonly AvIntelDbContext _db;

    public SystemController(AvIntelDbContext db)
    {
        _db = db;
    }

    // GET api/v1/me
    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        return Ok(new
        {
            id = 1,
            display_name = "Casey Jones",
            email = "casey@globalair.com",
            role = "operator",
            preferences = new
            {
                current_role_view = "casey",
                date_range = "30d",
                compare_mode = "wow",
                category_filter = "all",
                signal_clean_only = true
            }
        });
    }

    // PATCH api/v1/me/preferences
    [HttpPatch("me/preferences")]
    public IActionResult UpdatePreferences([FromBody] Dictionary<string, object> preferences)
    {
        return Ok(new { updated_at = DateTime.UtcNow });
    }

    // GET api/v1/data-sources
    [HttpGet("data-sources")]
    public async Task<IActionResult> GetDataSources([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var sources = await _db.DataSources
            .OrderBy(s => s.DisplayName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new
            {
                s.Id,
                source_key = s.SourceKey,
                display_name = s.DisplayName,
                connection_status = s.ConnectionStatus,
                sla_hours = s.SlaHours,
                last_successful_sync = s.LastSuccessfulSync,
                last_error = s.LastError
            })
            .ToListAsync();

        return Ok(sources);
    }

    // GET api/v1/ingestion-logs
    [HttpGet("ingestion-logs")]
    public async Task<IActionResult> GetIngestionLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var logs = await _db.IngestionLogs
            .OrderByDescending(l => l.StartedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new
            {
                l.Id,
                source_key = l.DataSource.SourceKey,
                started_at = l.StartedAt,
                completed_at = l.CompletedAt,
                l.Status,
                records_processed = l.RecordsProcessed,
                trigger_type = l.TriggerType,
                duration_ms = l.DurationMs
            })
            .ToListAsync();

        return Ok(logs);
    }

    // GET api/v1/system-health
    [HttpGet("system-health")]
    public async Task<IActionResult> GetSystemHealth()
    {
        var checks = await _db.SystemHealthChecks
            .OrderBy(c => c.CheckType)
            .Select(c => new
            {
                check_type = c.CheckType,
                check_name = c.CheckName,
                c.Status,
                latency_ms = c.LatencyMs,
                c.Details,
                last_checked = c.LastChecked
            })
            .ToListAsync();

        return Ok(checks);
    }

    // GET api/v1/alerts
    [HttpGet("alerts")]
    public async Task<IActionResult> GetAlerts([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var alerts = await _db.Alerts
            .Where(a => !a.IsResolved)
            .OrderByDescending(a => a.Severity)
            .ThenByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                a.Id,
                alert_type = a.AlertType,
                a.Severity,
                a.Module,
                a.Title,
                a.Description,
                is_resolved = a.IsResolved,
                created_at = a.CreatedAt
            })
            .ToListAsync();

        return Ok(alerts);
    }

    // PATCH api/v1/alerts/{id}/resolve
    [HttpPatch("alerts/{id}/resolve")]
    public async Task<IActionResult> ResolveAlert(int id)
    {
        var alert = await _db.Alerts.FindAsync(id);
        if (alert == null) return NotFound();

        alert.IsResolved = true;
        alert.ResolvedAt = DateTime.UtcNow;
        alert.ResolvedBy = "casey@globalair.com";
        await _db.SaveChangesAsync();

        return Ok(new
        {
            alert.Id,
            resolved_at = alert.ResolvedAt,
            resolved_by = alert.ResolvedBy
        });
    }

    // GET api/v1/metrics-registry
    [HttpGet("metrics-registry")]
    public IActionResult GetMetricsRegistry()
    {
        var metrics = new[]
        {
            new { id = "qi", name = "Qualified Inquiries", definition = "Confirmed buyer contact form submissions or verified phone calls", formula = "form_submits + verified_calls", source = "GA4 + CRM", unit = "count", whyItMatters = "Primary revenue signal — every QI represents a potential aircraft transaction" },
            new { id = "cpqi", name = "Cost Per QI", definition = "Total ad spend divided by qualified inquiries", formula = "total_spend / qi_count", source = "Google Ads + GA4", unit = "currency", whyItMatters = "Efficiency metric — determines if paid acquisition is sustainable" },
            new { id = "revenue", name = "Monthly Revenue", definition = "Total advertiser revenue collected", formula = "sum(advertiser_payments)", source = "CRM", unit = "currency", whyItMatters = "Top-line business health" },
            new { id = "broker_risk_index", name = "Broker Risk Index", definition = "Weighted score of broker churn signals", formula = "weighted(inquiry_trend, utilization, renewal_proximity)", source = "Internal", unit = "score", whyItMatters = "Early warning for advertiser churn — protects revenue base" },
            new { id = "authority_score", name = "Authority Score", definition = "Composite domain authority vs Controller.com", formula = "weighted(organic_share, content_depth, brand_mentions)", source = "GSC + Ahrefs", unit = "score", whyItMatters = "Long-term competitive moat against Controller.com" },
            new { id = "organic_qi", name = "Organic QI", definition = "Qualified inquiries from organic search channel", formula = "qi WHERE channel='organic'", source = "GA4", unit = "count", whyItMatters = "Free acquisition — highest margin channel" },
            new { id = "organic_sessions", name = "Organic Sessions", definition = "Sessions from organic search", formula = "sessions WHERE channel='organic'", source = "GA4", unit = "count", whyItMatters = "Top-of-funnel organic health" },
            new { id = "organic_ctr", name = "Organic CTR", definition = "Click-through rate from search results", formula = "clicks / impressions", source = "GSC", unit = "percentage", whyItMatters = "SERP competitiveness signal" },
            new { id = "avg_position", name = "Avg Position", definition = "Average search ranking across tracked queries", formula = "avg(position)", source = "GSC", unit = "position", whyItMatters = "Visibility benchmark vs Controller.com" },
            new { id = "ppc_qi", name = "PPC QI", definition = "Qualified inquiries from paid search", formula = "qi WHERE channel='paid_search'", source = "Google Ads + GA4", unit = "count", whyItMatters = "Paid acquisition volume" },
            new { id = "ppc_spend", name = "PPC Spend", definition = "Total Google Ads spend", formula = "sum(campaign_spend)", source = "Google Ads", unit = "currency", whyItMatters = "Budget consumption tracking" },
            new { id = "impression_share", name = "Impression Share", definition = "Percentage of eligible impressions captured", formula = "impressions / eligible_impressions", source = "Google Ads", unit = "percentage", whyItMatters = "Market coverage — how much demand we capture" },
            new { id = "search_term_quality", name = "Search Term Quality", definition = "Percentage of search terms that are relevant", formula = "relevant_terms / total_terms", source = "Google Ads", unit = "percentage", whyItMatters = "Waste prevention — irrelevant terms burn budget" },
            new { id = "waste_pct", name = "Waste Percentage", definition = "Spend on irrelevant search terms", formula = "irrelevant_spend / total_spend", source = "Google Ads", unit = "percentage", whyItMatters = "Direct budget leakage metric" },
            new { id = "email_assisted_qi", name = "Email Assisted QI", definition = "QI where email was in the conversion path", formula = "qi WHERE path CONTAINS email", source = "GA4", unit = "count", whyItMatters = "Email contribution to revenue pipeline" },
            new { id = "email_open_rate", name = "Email Open Rate", definition = "Percentage of delivered emails opened", formula = "opens / delivered", source = "Email Platform", unit = "percentage", whyItMatters = "Subject line and sender reputation health" },
            new { id = "email_click_rate", name = "Email Click Rate", definition = "Percentage of delivered emails clicked", formula = "clicks / delivered", source = "Email Platform", unit = "percentage", whyItMatters = "Content relevance and CTA effectiveness" },
            new { id = "deliverability_rate", name = "Deliverability Rate", definition = "Percentage of emails reaching inbox", formula = "delivered / sent", source = "Email Platform", unit = "percentage", whyItMatters = "Infrastructure health — failed delivery = lost audience" },
            new { id = "content_assisted_qi", name = "Content Assisted QI", definition = "QI where content page was in the path", formula = "qi WHERE path CONTAINS content_page", source = "GA4", unit = "count", whyItMatters = "Content ROI — justifies editorial investment" },
            new { id = "evergreen_mix", name = "Evergreen Mix", definition = "Percentage of content that is evergreen vs news", formula = "evergreen_articles / total_articles", source = "CMS", unit = "percentage", whyItMatters = "Content durability — evergreen compounds, news decays" },
            new { id = "cta_coverage", name = "CTA Coverage", definition = "Percentage of articles with conversion modules", formula = "articles_with_cta / total_articles", source = "CMS", unit = "percentage", whyItMatters = "Every article without a CTA is a missed conversion opportunity" },
            new { id = "social_assisted_qi", name = "Social Assisted QI", definition = "QI where social was in the conversion path", formula = "qi WHERE path CONTAINS social", source = "GA4", unit = "count", whyItMatters = "Social contribution to pipeline" },
            new { id = "content_mix_compliance", name = "Content Mix Compliance", definition = "Adherence to 80/20 buyer-intent content mix", formula = "buyer_intent_posts / total_posts", source = "Sendible", unit = "percentage", whyItMatters = "Prevents social from drifting into vanity content" },
            new { id = "engagement_rate", name = "Engagement Rate", definition = "Real engagement rate excluding Email_Open contamination", formula = "engaged_sessions / total_sessions (clean)", source = "GA4", unit = "percentage", whyItMatters = "True site engagement — contaminated rate (~69%) masks real (~17%)" },
            new { id = "bounce_rate", name = "Bounce Rate", definition = "Sessions with no engagement", formula = "bounced_sessions / total_sessions", source = "GA4", unit = "percentage", whyItMatters = "Landing page quality signal" },
            new { id = "conversion_rate", name = "Conversion Rate", definition = "Sessions resulting in qualified inquiry", formula = "qi / sessions", source = "GA4", unit = "percentage", whyItMatters = "Funnel efficiency — are visitors becoming buyers" },
            new { id = "data_freshness", name = "Data Freshness", definition = "Hours since last successful data sync", formula = "now - last_sync", source = "System", unit = "hours", whyItMatters = "Stale data leads to wrong decisions" },
            new { id = "decision_confidence", name = "Decision Confidence", definition = "Percentage of metrics with CONFIRMED confidence", formula = "confirmed_metrics / total_metrics", source = "System", unit = "percentage", whyItMatters = "Ensures we never present assumptions as facts" },
            new { id = "sla_compliance", name = "SLA Compliance", definition = "Percentage of data sources within freshness SLA", formula = "sources_within_sla / total_sources", source = "System", unit = "percentage", whyItMatters = "Operational discipline — SLA breaches degrade trust" },
            new { id = "event_roi", name = "Event ROI", definition = "Revenue attributed to events vs event cost", formula = "event_revenue / event_cost", source = "CRM + Finance", unit = "ratio", whyItMatters = "Justifies event investment and booth spend" },
            new { id = "sponsor_close_rate", name = "Sponsor Close Rate", definition = "Percentage of sponsorship proposals that close", formula = "closed_sponsorships / proposals_sent", source = "CRM", unit = "percentage", whyItMatters = "Sales effectiveness for event monetization" }
        };

        return Ok(metrics);
    }
}
