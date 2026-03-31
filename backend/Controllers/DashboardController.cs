using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Data;

namespace AvIntelOS.Api.Controllers;

[ApiController]
[Route("api/v1/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly AvIntelDbContext _db;

    public DashboardController(AvIntelDbContext db)
    {
        _db = db;
    }

    // GET api/v1/dashboard/kpis
    [HttpGet("kpis")]
    public async Task<IActionResult> GetKpis()
    {
        var latestDate = await _db.Ga4ChannelSnapshots
            .MaxAsync(s => (DateOnly?)s.SnapshotDate);

        var totalQi = 0;
        var totalSpend = 0m;

        if (latestDate.HasValue)
        {
            totalQi = await _db.Ga4ChannelSnapshots
                .Where(s => s.SnapshotDate == latestDate.Value)
                .SumAsync(s => s.Conversions);

            totalSpend = await _db.AdsCampaignSnapshots
                .Where(s => s.SnapshotDate == latestDate.Value)
                .SumAsync(s => s.Spend);
        }

        var cpqi = totalQi > 0 ? totalSpend / totalQi : 0m;

        return Ok(new
        {
            qi = new { value = totalQi, delta = 0, trend = "flat", confidence = "PROBABLE" },
            cpqi = new { value = Math.Round(cpqi, 2), delta = 0, trend = "flat", confidence = "PROBABLE" },
            revenue = new { value = 0, delta = 0, trend = "flat", confidence = "POSSIBLE" },
            broker_risk_index = new { value = 0, delta = 0, trend = "flat", confidence = "POSSIBLE" },
            authority_score = new { value = 0, delta = 0, trend = "flat", confidence = "POSSIBLE" }
        });
    }

    // GET api/v1/dashboard/prime-directive
    [HttpGet("prime-directive")]
    public IActionResult GetPrimeDirective()
    {
        var directives = new[]
        {
            new { id = 1, name = "Increase Qualified Buyer Inquiries", metric = "QI Count + CPQI Efficiency", status = "at_risk", confidence = "PROBABLE", detail = "Conversion tracking unconfirmed — scaling blocked until signal validated" },
            new { id = 2, name = "Retain Key Single-Piston Broker", metric = "Broker Risk Index", status = "critical", confidence = "PROBABLE", detail = "At-risk account identified — retention plan required" },
            new { id = 3, name = "Grow Advertiser Revenue & Retention", metric = "ARPA + Churn Rate", status = "unknown", confidence = "POSSIBLE", detail = "ARPA and churn metrics not yet established" },
            new { id = 4, name = "Strengthen Aviation Media Hub Authority", metric = "Authority Score vs Controller.com", status = "in_progress", confidence = "PROBABLE", detail = "Content strategy redirecting — SEO model hubs planned" },
            new { id = 5, name = "Build Scalable Systems & Discipline", metric = "Sprint Velocity + SLA Compliance", status = "in_progress", confidence = "CONFIRMED", detail = "Scrum framework launched Sprint 1 — ceremonies active" }
        };

        return Ok(directives);
    }

    // GET api/v1/dashboard/movers
    [HttpGet("movers")]
    public async Task<IActionResult> GetMovers()
    {
        var latestDate = await _db.Ga4ChannelSnapshots
            .MaxAsync(s => (DateOnly?)s.SnapshotDate);

        var movers = new List<object>();

        if (latestDate.HasValue)
        {
            var channelMovers = await _db.Ga4ChannelSnapshots
                .Where(s => s.SnapshotDate == latestDate.Value)
                .OrderByDescending(s => s.Conversions)
                .Take(5)
                .Select(s => new
                {
                    metric = $"{s.Channel} QI",
                    value = s.Conversions,
                    delta = 0,
                    deltaLabel = "vs prior period"
                })
                .ToListAsync();

            movers.AddRange(channelMovers);
        }

        // Pad to 10 with static entries if needed
        while (movers.Count < 10)
        {
            movers.Add(new
            {
                metric = $"Metric {movers.Count + 1}",
                value = 0,
                delta = 0,
                deltaLabel = "vs prior period"
            });
        }

        return Ok(movers.Take(10));
    }

    // GET api/v1/dashboard/opportunities
    [HttpGet("opportunities")]
    public async Task<IActionResult> GetOpportunities([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var opportunities = await _db.Opportunities
            .OrderByDescending(o => o.PriorityScore)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new
            {
                o.Id,
                o.Domain,
                o.Title,
                priority_score = o.PriorityScore,
                expected_lift = o.ExpectedLift,
                time_to_impact = o.TimeToImpact,
                owner_name = o.OwnerName,
                o.Blocker,
                o.Status,
                confidence_level = o.ConfidenceLevel
            })
            .ToListAsync();

        return Ok(opportunities);
    }

    // GET api/v1/dashboard/action-framework
    [HttpGet("action-framework")]
    public async Task<IActionResult> GetActionFramework()
    {
        var opportunities = await _db.Opportunities
            .OrderByDescending(o => o.PriorityScore)
            .ToListAsync();

        var fastWins = opportunities
            .Where(o => o.PriorityLabel == "now" && o.Blocker == null)
            .Select(o => new { o.Id, o.Title, o.Domain, priority_score = o.PriorityScore, expected_lift = o.ExpectedLift, o.Status })
            .ToList();

        var strategicMoves = opportunities
            .Where(o => o.PriorityLabel == "next" || (o.PriorityLabel == "now" && o.Blocker != null))
            .Select(o => new { o.Id, o.Title, o.Domain, priority_score = o.PriorityScore, expected_lift = o.ExpectedLift, o.Status })
            .ToList();

        var blockers = opportunities
            .Where(o => o.Blocker != null && o.Status != "resolved")
            .Select(o => new { o.Id, o.Title, o.Domain, o.Blocker, o.Status })
            .ToList();

        return Ok(new { fast_wins = fastWins, strategic_moves = strategicMoves, blockers });
    }

    // GET api/v1/dashboard/leakage-map
    [HttpGet("leakage-map")]
    public async Task<IActionResult> GetLeakageMap([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var latestDate = await _db.Ga4LandingPages
            .MaxAsync(p => (DateOnly?)p.SnapshotDate);

        if (!latestDate.HasValue)
            return Ok(Array.Empty<object>());

        var leakagePages = await _db.Ga4LandingPages
            .Where(p => p.SnapshotDate == latestDate.Value && p.Impressions > 100 && p.Ctr < 0.02m)
            .OrderByDescending(p => p.Impressions)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                page_path = p.PagePath,
                p.Impressions,
                ctr = p.Ctr,
                p.Sessions,
                p.Conversions,
                leakage_type = p.Ctr < 0.01m ? "severe" : "moderate"
            })
            .ToListAsync();

        return Ok(leakagePages);
    }

    // GET api/v1/dashboard/competitive-zones
    [HttpGet("competitive-zones")]
    public async Task<IActionResult> GetCompetitiveZones()
    {
        var benchmarks = await _db.CompetitiveBenchmarks.ToListAsync();

        var attack = benchmarks.Where(b => b.DefensibilityScore < 30).Select(b => new { b.Category, defensibility = b.DefensibilityScore, b.CpcPressure }).ToList();
        var compete = benchmarks.Where(b => b.DefensibilityScore >= 30 && b.DefensibilityScore < 60).Select(b => new { b.Category, defensibility = b.DefensibilityScore, b.CpcPressure }).ToList();
        var build = benchmarks.Where(b => b.DefensibilityScore >= 60 && b.DefensibilityScore < 80).Select(b => new { b.Category, defensibility = b.DefensibilityScore, b.CpcPressure }).ToList();
        var monitor = benchmarks.Where(b => b.DefensibilityScore >= 80).Select(b => new { b.Category, defensibility = b.DefensibilityScore, b.CpcPressure }).ToList();

        return Ok(new { attack, compete, build, monitor });
    }

    // GET api/v1/dashboard/data-trust
    [HttpGet("data-trust")]
    public async Task<IActionResult> GetDataTrust()
    {
        var channelConfidence = await _db.Ga4ChannelSnapshots
            .GroupBy(c => c.ConfidenceLevel)
            .Select(g => new { level = g.Key, count = g.Count() })
            .ToListAsync();

        var confirmed = channelConfidence.FirstOrDefault(c => c.level == "CONFIRMED")?.count ?? 0;
        var probable = channelConfidence.FirstOrDefault(c => c.level == "PROBABLE")?.count ?? 0;
        var possible = channelConfidence.FirstOrDefault(c => c.level == "POSSIBLE")?.count ?? 0;
        var total = confirmed + probable + possible;
        var pct = total > 0 ? Math.Round((decimal)confirmed / total * 100, 1) : 0m;

        return Ok(new
        {
            decision_confidence_pct = pct,
            confirmed_count = confirmed,
            probable_count = probable,
            possible_count = possible,
            domain_breakdown = new[]
            {
                new { domain = "ga4", confirmed, probable, possible },
                new { domain = "gsc", confirmed = 0, probable = 0, possible = 0 },
                new { domain = "ppc", confirmed = 0, probable = 0, possible = 0 },
                new { domain = "email", confirmed = 0, probable = 0, possible = 0 }
            }
        });
    }

    // GET api/v1/dashboard/qi-trend
    [HttpGet("qi-trend")]
    public async Task<IActionResult> GetQiTrend()
    {
        var trend = await _db.Ga4ChannelSnapshots
            .GroupBy(s => s.SnapshotDate)
            .OrderBy(g => g.Key)
            .Select(g => new
            {
                date = g.Key,
                qi_count = g.Sum(s => s.Conversions),
                confidence = "PROBABLE"
            })
            .ToListAsync();

        return Ok(trend);
    }
}
