using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Data;

namespace AvIntelOS.Api.Controllers;

[ApiController]
[Route("api/v1/content")]
public class ContentController : ControllerBase
{
    private readonly AvIntelDbContext _db;

    public ContentController(AvIntelDbContext db)
    {
        _db = db;
    }

    // GET api/v1/content/kpis
    [HttpGet("kpis")]
    public async Task<IActionResult> GetKpis()
    {
        var totalArticles = await _db.ContentArticles.CountAsync();
        var withCta = await _db.ContentArticles.CountAsync(a => a.HasCtaModule);
        var totalConversions = await _db.ContentArticles.SumAsync(a => a.Conversions30d);

        var pillars = await _db.ContentPillars.ToListAsync();
        var evergreenCount = pillars.Count(p => p.PillarType == "evergreen");
        var newsCount = pillars.Count(p => p.PillarType == "news");
        var total = evergreenCount + newsCount;

        return Ok(new
        {
            evergreen_mix = new { value = total > 0 ? Math.Round((decimal)evergreenCount / total * 100, 1) : 0, confidence = "CONFIRMED" },
            news_mix = new { value = total > 0 ? Math.Round((decimal)newsCount / total * 100, 1) : 0, confidence = "CONFIRMED" },
            content_assisted_qi = new { value = totalConversions, confidence = "PROBABLE" },
            production_velocity = new { value = 0, confidence = "POSSIBLE" },
            attribution_confidence = new { value = "PROBABLE", confidence = "CONFIRMED" },
            cta_coverage = new { value = totalArticles > 0 ? Math.Round((decimal)withCta / totalArticles * 100, 1) : 0, confidence = "CONFIRMED" }
        });
    }

    // GET api/v1/content/articles
    [HttpGet("articles")]
    public async Task<IActionResult> GetArticles([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var articles = await _db.ContentArticles
            .Include(a => a.Pillar)
            .OrderByDescending(a => a.Sessions30d)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                a.Id,
                a.Title,
                url_path = a.UrlPath,
                pillar_name = a.Pillar != null ? a.Pillar.PillarName : null,
                a.Category,
                sessions_30d = a.Sessions30d,
                engagement_rate = a.EngagementRate,
                conversions_30d = a.Conversions30d,
                has_cta_module = a.HasCtaModule,
                cta_ctr = a.CtaCtr,
                confidence_level = a.ConfidenceLevel
            })
            .ToListAsync();

        return Ok(articles);
    }

    // GET api/v1/content/pillars
    [HttpGet("pillars")]
    public async Task<IActionResult> GetPillars()
    {
        var pillars = await _db.ContentPillars
            .Include(p => p.Articles)
            .Select(p => new
            {
                pillar_name = p.PillarName,
                articles = p.Articles.Count,
                total_sessions = p.Articles.Sum(a => a.Sessions30d),
                avg_engagement_rate = p.Articles.Any() ? p.Articles.Average(a => a.EngagementRate) : 0,
                conversions = p.Articles.Sum(a => a.Conversions30d),
                cta_coverage_pct = p.Articles.Any()
                    ? Math.Round((decimal)p.Articles.Count(a => a.HasCtaModule) / p.Articles.Count * 100, 1)
                    : 0
            })
            .ToListAsync();

        return Ok(pillars);
    }

    // GET api/v1/content/refresh-queue
    [HttpGet("refresh-queue")]
    public async Task<IActionResult> GetRefreshQueue([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var queue = await _db.ContentRefreshQueues
            .Include(r => r.Article)
            .OrderByDescending(r => r.ExpectedLiftPct)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                article_title = r.Article.Title,
                months_since_update = r.MonthsSinceUpdate,
                expected_lift_pct = r.ExpectedLiftPct,
                refresh_actions = r.RefreshActions,
                r.Status,
                owner_name = r.OwnerName
            })
            .ToListAsync();

        return Ok(queue);
    }

    // GET api/v1/content/attribution-paths
    [HttpGet("attribution-paths")]
    public IActionResult GetAttributionPaths()
    {
        var paths = new[]
        {
            new { path_description = "Organic Search -> Model Hub -> Listing View -> Inquiry", strength = "strong", confidence_level = "PROBABLE" },
            new { path_description = "AvBlast Email -> Resource Article -> Listing View -> Inquiry", strength = "moderate", confidence_level = "PROBABLE" },
            new { path_description = "Social Post -> Listing Page -> Inquiry", strength = "moderate", confidence_level = "POSSIBLE" },
            new { path_description = "Direct -> Buyer Guide -> Spec Comparison -> Inquiry", strength = "strong", confidence_level = "PROBABLE" },
            new { path_description = "PPC Ad -> Landing Page -> Inquiry", strength = "strong", confidence_level = "CONFIRMED" },
            new { path_description = "Referral -> Resource Center -> Multiple Listings -> Inquiry", strength = "moderate", confidence_level = "POSSIBLE" }
        };

        return Ok(paths);
    }

    // GET api/v1/content/production-balance
    [HttpGet("production-balance")]
    public async Task<IActionResult> GetProductionBalance()
    {
        var pillars = await _db.ContentPillars.Include(p => p.Articles).ToListAsync();

        var evergreenArticles = pillars.Where(p => p.PillarType == "evergreen").SelectMany(p => p.Articles).Count();
        var newsArticles = pillars.Where(p => p.PillarType == "news").SelectMany(p => p.Articles).Count();
        var total = evergreenArticles + newsArticles;

        return Ok(new
        {
            evergreen_target = 80,
            evergreen_actual = total > 0 ? Math.Round((decimal)evergreenArticles / total * 100, 1) : 0,
            news_target = 20,
            news_actual = total > 0 ? Math.Round((decimal)newsArticles / total * 100, 1) : 0,
            gap_assessment = total == 0 ? "no_data" :
                evergreenArticles * 100 / total >= 75 ? "on_track" : "needs_correction"
        });
    }
}
