using System.ComponentModel.DataAnnotations;

namespace AvIntelOS.Api.Models.Entities;

// ── seo_plays ───────────────────────────────────────────────────────────

public class SeoPlay
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(255)]
    public string PlayTitle { get; set; } = string.Empty;

    public string? Description { get; set; }

    [MaxLength(30)]
    public string? Category { get; set; }

    public int PriorityScore { get; set; } = 50;

    [Required, MaxLength(20)]
    public string Status { get; set; } = "proposed";

    [Required, MaxLength(10)]
    public string PriorityLabel { get; set; } = "next";

    [MaxLength(100)]
    public string? OwnerName { get; set; }

    [MaxLength(255)]
    public string? ImpactDescription { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// ── seo_model_hubs ──────────────────────────────────────────────────────

public class SeoModelHub
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Make { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Model { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string Category { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string HubStatus { get; set; } = "not_started";

    [MaxLength(20)]
    public string? CommercialPageStatus { get; set; }

    [MaxLength(20)]
    public string? ResearchPageStatus { get; set; }

    [MaxLength(20)]
    public string? ComparisonPageStatus { get; set; }

    [MaxLength(20)]
    public string? OwnershipPageStatus { get; set; }

    [MaxLength(500)]
    public string? ContentGaps { get; set; }

    [MaxLength(10)]
    public string? BuildUrgency { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    public DateTime UpdatedAt { get; set; }
}
