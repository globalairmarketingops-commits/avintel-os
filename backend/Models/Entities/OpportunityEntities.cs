using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AvIntelOS.Api.Models.Entities;

// ── opportunities ───────────────────────────────────────────────────────

public class Opportunity
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(30)]
    public string Domain { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int PriorityScore { get; set; } = 50;

    [MaxLength(100)]
    public string? ExpectedLift { get; set; }

    [MaxLength(50)]
    public string? TimeToImpact { get; set; }

    public int? OwnerUserId { get; set; }

    [MaxLength(100)]
    public string? OwnerName { get; set; }

    [MaxLength(255)]
    public string? Blocker { get; set; }

    [MaxLength(500)]
    public string? Dependencies { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "open";

    [Required, MaxLength(10)]
    public string PriorityLabel { get; set; } = "next";

    [MaxLength(30)]
    public string? ScaleSafety { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(OwnerUserId))]
    public User? OwnerUser { get; set; }

    public ICollection<OpportunitySignal> Signals { get; set; } = new List<OpportunitySignal>();
}

// ── opportunity_signals ─────────────────────────────────────────────────

public class OpportunitySignal
{
    [Key]
    public long Id { get; set; }

    public int OpportunityId { get; set; }

    [Required, MaxLength(50)]
    public string SignalType { get; set; } = string.Empty;

    public decimal? SignalValue { get; set; }

    [MaxLength(255)]
    public string? SignalLabel { get; set; }

    public DateTime DetectedAt { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    // Navigation
    [ForeignKey(nameof(OpportunityId))]
    public Opportunity Opportunity { get; set; } = null!;
}

// ── competitive_benchmarks ──────────────────────────────────────────────

public class CompetitiveBenchmark
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Category { get; set; } = string.Empty;

    public int DefensibilityScore { get; set; } = 50;
    public decimal? RankStability { get; set; }

    [MaxLength(10)]
    public string? CpcPressure { get; set; }

    public int? ContentDepth { get; set; }
    public int? ListingDepth { get; set; }
    public decimal? RepeatAudiencePct { get; set; }

    [MaxLength(10)]
    public string? Trend { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime? SourceFreshness { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// ── competitive_features ────────────────────────────────────────────────

public class CompetitiveFeature
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string FeatureName { get; set; } = string.Empty;

    public bool GlobalairHas { get; set; }
    public bool ControllerHas { get; set; }

    [Required, MaxLength(20)]
    public string Advantage { get; set; } = "none";

    public DateTime UpdatedAt { get; set; }
}
