using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Data;

namespace AvIntelOS.Api.Controllers;

[ApiController]
[Route("api/v1/organic")]
public class OrganicController : ControllerBase
{
    private readonly AvIntelDbContext _db;

    public OrganicController(AvIntelDbContext db)
    {
        _db = db;
    }

    // GET api/v1/organic/kpis
    [HttpGet("kpis")]
    public async Task<IActionResult> GetKpis()
    {
        var portfolio = await _db.GscPortfolioSummaries
            .OrderByDescending(p => p.SnapshotDate)
            .FirstOrDefaultAsync();

        return Ok(new
        {
            organic_qi = new { value = 0, confidence = "POSSIBLE" },
            organic_assisted_qi = new { value = 0, confidence = "POSSIBLE" },
            ctr_priority_commercial = new { value = portfolio?.AvgCtr ?? 0, confidence = portfolio != null ? "CONFIRMED" : "POSSIBLE" },
            share_vs_competitors = new { value = 0, confidence = "POSSIBLE" },
            demand_inventory_mismatch = new { value = 0, confidence = "POSSIBLE" }
        });
    }

    // GET api/v1/organic/query-clusters
    [HttpGet("query-clusters")]
    public async Task<IActionResult> GetQueryClusters([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var latestDate = await _db.GscQuerySnapshots
            .MaxAsync(q => (DateOnly?)q.SnapshotDate);

        if (!latestDate.HasValue)
            return Ok(Array.Empty<object>());

        var queries = await _db.GscQuerySnapshots
            .Where(q => q.SnapshotDate == latestDate.Value)
            .OrderByDescending(q => q.Clicks)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(q => new
            {
                q.Query,
                q.Clicks,
                q.Impressions,
                avg_position = q.AvgPosition,
                ctr_pct = q.CtrPct,
                q.Category,
                confidence_level = q.ConfidenceLevel
            })
            .ToListAsync();

        return Ok(queries);
    }

    // GET api/v1/organic/model-pages
    [HttpGet("model-pages")]
    public async Task<IActionResult> GetModelPages([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var latestDate = await _db.GscPageSnapshots
            .MaxAsync(p => (DateOnly?)p.SnapshotDate);

        if (!latestDate.HasValue)
            return Ok(Array.Empty<object>());

        var pages = await _db.GscPageSnapshots
            .Where(p => p.SnapshotDate == latestDate.Value)
            .OrderByDescending(p => p.Impressions)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                page_url = p.PageUrl,
                p.Category,
                p.Impressions,
                ctr_pct = p.CtrPct,
                avg_position = p.AvgPosition,
                sessions = p.Clicks,
                conversions = 0
            })
            .ToListAsync();

        return Ok(pages);
    }

    // GET api/v1/organic/portfolio
    [HttpGet("portfolio")]
    public async Task<IActionResult> GetPortfolio()
    {
        var portfolio = await _db.GscPortfolioSummaries
            .OrderByDescending(p => p.SnapshotDate)
            .FirstOrDefaultAsync();

        if (portfolio == null)
            return Ok(new { total_keywords = 0, monthly_clicks = 0, avg_position = 0, avg_ctr = 0, confidence_level = "POSSIBLE" });

        return Ok(new
        {
            total_keywords = portfolio.TotalKeywords,
            monthly_clicks = portfolio.MonthlyClicks,
            avg_position = portfolio.AvgPosition,
            avg_ctr = portfolio.AvgCtr,
            confidence_level = portfolio.ConfidenceLevel
        });
    }

    // GET api/v1/organic/categories
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var latestDate = await _db.GscQuerySnapshots
            .MaxAsync(q => (DateOnly?)q.SnapshotDate);

        if (!latestDate.HasValue)
            return Ok(Array.Empty<object>());

        var categories = await _db.GscQuerySnapshots
            .Where(q => q.SnapshotDate == latestDate.Value && q.Category != null)
            .GroupBy(q => q.Category)
            .Select(g => new
            {
                category = g.Key,
                keywords = g.Count(),
                clicks = g.Sum(q => q.Clicks),
                impressions = g.Sum(q => q.Impressions),
                avg_position = g.Average(q => q.AvgPosition),
                ctr = g.Sum(q => q.Impressions) > 0
                    ? (decimal)g.Sum(q => q.Clicks) / g.Sum(q => q.Impressions) * 100
                    : 0
            })
            .ToListAsync();

        return Ok(categories);
    }

    // GET api/v1/organic/competitive-serp
    [HttpGet("competitive-serp")]
    public async Task<IActionResult> GetCompetitiveSerp()
    {
        var benchmarks = await _db.CompetitiveBenchmarks
            .Select(b => new
            {
                competitor = b.Category,
                share_pct = b.RankStability,
                ctr_prominence = b.DefensibilityScore,
                zone = b.DefensibilityScore >= 60 ? "defend" : b.DefensibilityScore >= 30 ? "compete" : "attack"
            })
            .ToListAsync();

        return Ok(benchmarks);
    }

    // GET api/v1/organic/demand-mismatch
    [HttpGet("demand-mismatch")]
    public async Task<IActionResult> GetDemandMismatch([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var models = await _db.MarketDemandModels
            .Where(m => m.ImbalanceScore > 0)
            .OrderByDescending(m => m.ImbalanceScore)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new
            {
                make_model = m.Make + " " + m.Model,
                demand_score = m.DemandMomentum,
                inventory_count = m.InventoryCount,
                imbalance_score = m.ImbalanceScore
            })
            .ToListAsync();

        return Ok(models);
    }

    // GET api/v1/organic/content-assist
    [HttpGet("content-assist")]
    public async Task<IActionResult> GetContentAssist()
    {
        var articles = await _db.ContentArticles
            .Where(a => a.Conversions30d > 0)
            .OrderByDescending(a => a.Conversions30d)
            .Take(20)
            .Select(a => new
            {
                a.Title,
                url = a.UrlPath,
                conversions = a.Conversions30d,
                sessions = a.Sessions30d
            })
            .ToListAsync();

        var totalArticles = await _db.ContentArticles.CountAsync();
        var assistingArticles = await _db.ContentArticles.CountAsync(a => a.Conversions30d > 0);
        var rate = totalArticles > 0 ? Math.Round((decimal)assistingArticles / totalArticles * 100, 1) : 0m;

        return Ok(new
        {
            content_assist_rate = rate,
            paths = articles
        });
    }
}
