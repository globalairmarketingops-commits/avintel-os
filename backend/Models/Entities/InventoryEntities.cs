using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AvIntelOS.Api.Models.Entities;

// ── listings ────────────────────────────────────────────────────────────

public class Listing
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string ListingId { get; set; } = string.Empty;

    public int? BrokerId { get; set; }

    [Required, MaxLength(30)]
    public string Category { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string MakeModel { get; set; } = string.Empty;

    public int PhotoCount { get; set; }
    public int? SpecCompleteness { get; set; }
    public bool PriceVisible { get; set; }
    public DateOnly? LastRefresh { get; set; }
    public int? QualityScore { get; set; }
    public int DetailViews30d { get; set; }
    public int Inquiries30d { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "active";

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public decimal? CvrPct { get; private set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "CONFIRMED";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime? SourceFreshness { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(BrokerId))]
    public Broker? Broker { get; set; }
}

// ── market_demand_models ────────────────────────────────────────────────

public class MarketDemandModel
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Make { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Model { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string Category { get; set; } = string.Empty;

    public int? DemandMomentum { get; set; }
    public int? InventoryCount { get; set; }
    public int? AvgListingQuality { get; set; }
    public decimal? ImbalanceScore { get; set; }

    [MaxLength(15)]
    public string? OrganicRankTrend { get; set; }

    [MaxLength(15)]
    public string? PaidCpcTrend { get; set; }

    public int? OpportunityScore { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime? SourceFreshness { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// ── market_demand_categories ────────────────────────────────────────────

public class MarketDemandCategory
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(30)]
    public string Category { get; set; } = string.Empty;

    public decimal? QueryGrowthPct { get; set; }
    public decimal? PpcGrowthPct { get; set; }
    public decimal? ListingViewGrowthPct { get; set; }
    public decimal? RepeatInterestGrowthPct { get; set; }

    [MaxLength(20)]
    public string? OpportunityState { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime? SourceFreshness { get; set; }
    public DateTime UpdatedAt { get; set; }
}
