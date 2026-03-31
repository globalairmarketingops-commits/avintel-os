using System.ComponentModel.DataAnnotations;

namespace AvIntelOS.Api.Models.Entities;

// ── execution_items ─────────────────────────────────────────────────────

public class ExecutionItem
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string ItemType { get; set; } = "initiative";

    [Required, MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "open";

    [MaxLength(10)]
    public string? Severity { get; set; }

    public int? PriorityScore { get; set; }

    [MaxLength(10)]
    public string? PriorityLabel { get; set; }

    [MaxLength(10)]
    public string? Quarter { get; set; }

    [MaxLength(100)]
    public string? OwnerName { get; set; }

    [MaxLength(500)]
    public string? Dependencies { get; set; }

    [MaxLength(100)]
    public string? ExpectedLift { get; set; }

    [MaxLength(50)]
    public string? TimeToImpact { get; set; }

    [MaxLength(30)]
    public string? ScaleSafety { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
