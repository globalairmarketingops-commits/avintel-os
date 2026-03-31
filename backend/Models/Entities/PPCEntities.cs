using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AvIntelOS.Api.Models.Entities;

// ── ppc_waste_analysis ──────────────────────────────────────────────────

public class PpcWasteAnalysis
{
    [Key]
    public int Id { get; set; }

    public DateOnly SnapshotDate { get; set; }

    public decimal TotalSpend { get; set; }
    public decimal IrrelevantSpend { get; set; }
    public int WastedClicks { get; set; }
    public decimal? NegativeKwCoveragePct { get; set; }
    public int NegativesAddedCount { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public decimal? WastePct { get; private set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}

// ── ppc_negative_keywords ───────────────────────────────────────────────

public class PpcNegativeKeyword
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Term { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? CampaignName { get; set; }

    [Required, MaxLength(10)]
    public string MatchType { get; set; } = "exact";

    [MaxLength(200)]
    public string? WasteReason { get; set; }

    public decimal? EstimatedMonthlyWaste { get; set; }

    public DateOnly AddedDate { get; set; }

    [MaxLength(100)]
    public string? AddedBy { get; set; }
}
