using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AvIntelOS.Api.Models.Entities;

// ── ads_campaign_snapshots ──────────────────────────────────────────────

public class AdsCampaignSnapshot
{
    [Key]
    public long Id { get; set; }

    public DateOnly SnapshotDate { get; set; }

    [Required, MaxLength(200)]
    public string CampaignName { get; set; } = string.Empty;

    public decimal Spend { get; set; }
    public int Clicks { get; set; }
    public int Impressions { get; set; }
    public int Conversions { get; set; }

    [Required, MaxLength(20)]
    public string CampaignStatus { get; set; } = "Active";

    [MaxLength(30)]
    public string? Category { get; set; }

    public decimal? ImpressionShare { get; set; }
    public decimal? SearchIsLostBudget { get; set; }
    public decimal? SearchIsLostRank { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public decimal? CtrPct { get; private set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public decimal? Cpqi { get; private set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime? SourceFreshness { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ── ads_adgroup_snapshots ───────────────────────────────────────────────

public class AdsAdGroupSnapshot
{
    [Key]
    public long Id { get; set; }

    public DateOnly SnapshotDate { get; set; }

    [Required, MaxLength(200)]
    public string CampaignName { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string AdgroupName { get; set; } = string.Empty;

    public decimal Spend { get; set; }
    public int Clicks { get; set; }
    public int Impressions { get; set; }
    public int Conversions { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public decimal? CtrPct { get; private set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public decimal? Cpqi { get; private set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime? SourceFreshness { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ── ads_search_terms ────────────────────────────────────────────────────

public class AdsSearchTerm
{
    [Key]
    public long Id { get; set; }

    public DateOnly SnapshotDate { get; set; }

    [Required, MaxLength(500)]
    public string SearchTerm { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? CampaignName { get; set; }

    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public decimal Spend { get; set; }
    public int Conversions { get; set; }

    [MaxLength(200)]
    public string? WasteReason { get; set; }

    [MaxLength(20)]
    public string? Action { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}

// ── ads_auction_insights ────────────────────────────────────────────────

public class AdsAuctionInsight
{
    [Key]
    public int Id { get; set; }

    public DateOnly WeekStart { get; set; }

    [Required, MaxLength(100)]
    public string Competitor { get; set; } = "Controller.com";

    public decimal? ImpressionShare { get; set; }
    public decimal? OverlapRate { get; set; }
    public decimal? PositionAboveRate { get; set; }
    public decimal? OutrankingShare { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime? SourceFreshness { get; set; }
    public DateTime CreatedAt { get; set; }
}
