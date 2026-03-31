using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AvIntelOS.Api.Models.Entities;

// ── gsc_query_snapshots ─────────────────────────────────────────────────

public class GscQuerySnapshot
{
    [Key]
    public long Id { get; set; }

    public DateOnly SnapshotDate { get; set; }

    [Required, MaxLength(500)]
    public string Query { get; set; } = string.Empty;

    public int Clicks { get; set; }
    public int Impressions { get; set; }
    public decimal? AvgPosition { get; set; }

    [MaxLength(30)]
    public string? Category { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public decimal? CtrPct { get; private set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "CONFIRMED";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = "api_direct";

    public DateTime? SourceFreshness { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ── gsc_page_snapshots ──────────────────────────────────────────────────

public class GscPageSnapshot
{
    [Key]
    public long Id { get; set; }

    public DateOnly SnapshotDate { get; set; }

    [Required, MaxLength(500)]
    public string PageUrl { get; set; } = string.Empty;

    public int Clicks { get; set; }
    public int Impressions { get; set; }
    public decimal? AvgPosition { get; set; }

    [MaxLength(30)]
    public string? Category { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public decimal? CtrPct { get; private set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "CONFIRMED";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = "api_direct";

    public DateTime? SourceFreshness { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ── gsc_portfolio_summary ───────────────────────────────────────────────

public class GscPortfolioSummary
{
    [Key]
    public int Id { get; set; }

    public DateOnly SnapshotDate { get; set; }

    public int TotalKeywords { get; set; }
    public int MonthlyClicks { get; set; }
    public decimal? AvgPosition { get; set; }
    public decimal? AvgCtr { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "CONFIRMED";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = "api_direct";

    public DateTime? SourceFreshness { get; set; }
    public DateTime CreatedAt { get; set; }
}
