using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AvIntelOS.Api.Models.Entities;

// ── revenue_streams ─────────────────────────────────────────────────────

public class RevenueStream
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string StreamName { get; set; } = string.Empty;

    public decimal Amount { get; set; }
    public decimal? PctOfTotal { get; set; }

    [MaxLength(10)]
    public string? Trend { get; set; }

    [Required, MaxLength(20)]
    public string Period { get; set; } = "monthly";

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime? SourceFreshness { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// ── brokers ─────────────────────────────────────────────────────────────

public class Broker
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string BrokerName { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? CategoryMix { get; set; }

    [MaxLength(20)]
    public string? Tier { get; set; }

    public int? InquiryVolume30d { get; set; }
    public int? InquiryQualityScore { get; set; }
    public decimal? ResponseLatencyHours { get; set; }
    public int? ListingQualityScore { get; set; }
    public decimal? PackageUtilizationPct { get; set; }
    public decimal? RevenueCurrent { get; set; }
    public decimal? RevenuePrior { get; set; }

    [MaxLength(10)]
    public string? RevenueTrend { get; set; }

    public DateOnly? RenewalDate { get; set; }
    public int? HealthScore { get; set; }
    public int? RiskScore { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime? SourceFreshness { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public ICollection<BrokerHealthSnapshot> HealthSnapshots { get; set; } = new List<BrokerHealthSnapshot>();
    public ICollection<BrokerRenewalRisk> RenewalRisks { get; set; } = new List<BrokerRenewalRisk>();
    public ICollection<AdvertiserAccount> AdvertiserAccounts { get; set; } = new List<AdvertiserAccount>();
    public ICollection<Listing> Listings { get; set; } = new List<Listing>();
}

// ── broker_health_snapshots ─────────────────────────────────────────────

public class BrokerHealthSnapshot
{
    [Key]
    public long Id { get; set; }

    public int BrokerId { get; set; }
    public DateOnly SnapshotDate { get; set; }
    public int? ListingCount { get; set; }
    public int? AvgQuality { get; set; }
    public decimal? StaleRatio { get; set; }
    public decimal? AvgCvr { get; set; }
    public decimal? HiddenPriceRate { get; set; }
    public decimal? PhotoDeficiencyRate { get; set; }
    public int? HealthScore { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    public DateTime CreatedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(BrokerId))]
    public Broker Broker { get; set; } = null!;
}

// ── broker_renewal_risk ─────────────────────────────────────────────────

public class BrokerRenewalRisk
{
    [Key]
    public int Id { get; set; }

    public int BrokerId { get; set; }
    public DateOnly? RenewalDate { get; set; }

    [MaxLength(10)]
    public string? InquiryTrend { get; set; }

    [MaxLength(10)]
    public string? VisibilityTrend { get; set; }

    [MaxLength(10)]
    public string? UtilizationTrend { get; set; }

    public int RiskScore { get; set; }

    [MaxLength(255)]
    public string? PrimaryReason { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    public DateTime UpdatedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(BrokerId))]
    public Broker Broker { get; set; } = null!;
}

// ── advertiser_accounts ─────────────────────────────────────────────────

public class AdvertiserAccount
{
    [Key]
    public int Id { get; set; }

    public int? BrokerId { get; set; }

    [Required, MaxLength(200)]
    public string AdvertiserName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Tier { get; set; }

    public decimal? RevenueCurrent { get; set; }
    public decimal? RevenuePrior { get; set; }
    public DateOnly? RenewalDate { get; set; }
    public int? RiskScore { get; set; }
    public decimal? UtilizationPct { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime? SourceFreshness { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(BrokerId))]
    public Broker? Broker { get; set; }
}
