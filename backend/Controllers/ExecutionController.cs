using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Data;
using AvIntelOS.Api.Models.Entities;

namespace AvIntelOS.Api.Controllers;

[ApiController]
[Route("api/v1/execution")]
public class ExecutionController : ControllerBase
{
    private readonly AvIntelDbContext _db;

    public ExecutionController(AvIntelDbContext db)
    {
        _db = db;
    }

    // GET api/v1/execution/constraints
    [HttpGet("constraints")]
    public async Task<IActionResult> GetConstraints()
    {
        var constraints = await _db.ExecutionItems
            .Where(i => i.ItemType == "constraint")
            .OrderByDescending(i => i.PriorityScore)
            .ToListAsync();

        var primary = constraints.FirstOrDefault();

        return Ok(new
        {
            primary_constraint = primary?.Title ?? "None identified",
            weekly_priority_count = constraints.Count,
            reallocation_readiness = constraints.Any(c => c.Status == "open") ? "blocked" : "ready",
            execution_capacity = constraints.Count(c => c.Status == "resolved") + "/" + constraints.Count,
            roadmap_discipline = constraints.All(c => c.Status != "open") ? "on_track" : "at_risk"
        });
    }

    // GET api/v1/execution/blockers
    [HttpGet("blockers")]
    public async Task<IActionResult> GetBlockers([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var blockers = await _db.ExecutionItems
            .Where(i => i.ItemType == "blocker")
            .OrderByDescending(i => i.Severity)
            .ThenByDescending(i => i.PriorityScore)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new
            {
                i.Id,
                i.Title,
                i.Description,
                i.Severity,
                i.Status,
                owner_name = i.OwnerName,
                confidence_level = i.ConfidenceLevel
            })
            .ToListAsync();

        return Ok(blockers);
    }

    // GET api/v1/execution/priorities
    [HttpGet("priorities")]
    public async Task<IActionResult> GetPriorities([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var priorities = await _db.ExecutionItems
            .Where(i => i.ItemType == "quarterly_priority")
            .OrderByDescending(i => i.PriorityScore)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new
            {
                i.Id,
                i.Title,
                i.Status,
                priority_score = i.PriorityScore,
                scale_safety = i.ScaleSafety,
                confidence_level = i.ConfidenceLevel,
                i.Quarter
            })
            .ToListAsync();

        return Ok(priorities);
    }

    // GET api/v1/execution/initiatives
    [HttpGet("initiatives")]
    public async Task<IActionResult> GetInitiatives([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var initiatives = await _db.ExecutionItems
            .Where(i => i.ItemType == "initiative")
            .OrderByDescending(i => i.PriorityScore)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new
            {
                i.Id,
                i.Title,
                scale_safety = i.ScaleSafety,
                priority_label = i.PriorityLabel,
                priority_score = i.PriorityScore,
                expected_lift = i.ExpectedLift,
                owner_name = i.OwnerName,
                confidence_level = i.ConfidenceLevel
            })
            .ToListAsync();

        return Ok(initiatives);
    }

    // POST api/v1/execution/items
    [HttpPost("items")]
    public async Task<IActionResult> CreateItem([FromBody] ExecutionItem item)
    {
        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;

        _db.ExecutionItems.Add(item);
        await _db.SaveChangesAsync();

        return CreatedAtAction(null, new { item.Id, created_at = item.CreatedAt });
    }

    // PATCH api/v1/execution/items/{id}
    [HttpPatch("items/{id}")]
    public async Task<IActionResult> UpdateItem(int id, [FromBody] Dictionary<string, object> updates)
    {
        var item = await _db.ExecutionItems.FindAsync(id);
        if (item == null) return NotFound();

        if (updates.ContainsKey("title")) item.Title = updates["title"]?.ToString() ?? item.Title;
        if (updates.ContainsKey("description")) item.Description = updates["description"]?.ToString();
        if (updates.ContainsKey("status")) item.Status = updates["status"]?.ToString() ?? item.Status;
        if (updates.ContainsKey("priority_label")) item.PriorityLabel = updates["priority_label"]?.ToString();
        if (updates.ContainsKey("owner_name")) item.OwnerName = updates["owner_name"]?.ToString();
        if (updates.ContainsKey("scale_safety")) item.ScaleSafety = updates["scale_safety"]?.ToString();

        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { item.Id, updated_at = item.UpdatedAt });
    }

    // PATCH api/v1/execution/items/{id}/resolve
    [HttpPatch("items/{id}/resolve")]
    public async Task<IActionResult> ResolveItem(int id)
    {
        var item = await _db.ExecutionItems.FindAsync(id);
        if (item == null) return NotFound();

        item.Status = "resolved";
        item.ResolvedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { item.Id, resolved_at = item.ResolvedAt });
    }
}
