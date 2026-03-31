using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AvIntelOS.Api.Models.Entities;

// ── ga4_channel_snapshots ───────────────────────────────────────────────

public class Ga4ChannelSnapshot
{
    [Key]
    public long Id { get; set; }

    public DateOnly SnapshotDate { get; set; }

    [Required, MaxLength(50)]
    public string Channel { get; set; } = string.Empty;

    public int Sessions { get; set; }
    public int Users { get; set; }
    public decimal? EngagementRate { get; set; }
    public int Conversions { get; set; }
    public decimal Revenue { get; set; }
    public decimal? BounceRate { get; set; }
    public decimal? AvgSessionDuration { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public decimal? QiPer100Sessions { get; private set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "CONFIRMED";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime? SourceFreshness { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ── ga4_landing_pages ───────────────────────────────────────────────────

public class Ga4LandingPage
{
    [Key]
    public long Id { get; set; }

    public DateOnly SnapshotDate { get; set; }

    [Required, MaxLength(500)]
    public string PagePath { get; set; } = string.Empty;

    public int Sessions { get; set; }
    public decimal? BounceRate { get; set; }
    public decimal? AvgTimeSeconds { get; set; }
    public int Conversions { get; set; }

    [MaxLength(30)]
    public string? Category { get; set; }

    public int? Impressions { get; set; }
    public decimal? Ctr { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public decimal? CvrPct { get; private set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "CONFIRMED";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime? SourceFreshness { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ── ga4_events ──────────────────────────────────────────────────────────

public class Ga4Event
{
    [Key]
    public long Id { get; set; }

    public DateOnly SnapshotDate { get; set; }

    [Required, MaxLength(100)]
    public string EventName { get; set; } = string.Empty;

    public int EventCount { get; set; }
    public byte? Tier { get; set; }
    public bool IsContaminated { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "CONFIRMED";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}

// ── ga4_property_health ─────────────────────────────────────────────────

public class Ga4PropertyHealth
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string PropertyId { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string ContaminationStatus { get; set; } = "UNKNOWN";

    public DateOnly? ContaminationStart { get; set; }
    public decimal? RealEngagementRate { get; set; }
    public decimal? ReportedEngagementRate { get; set; }

    [Required, MaxLength(20)]
    public string EnhancedConversions { get; set; } = "UNCONFIRMED";

    [Required, MaxLength(20)]
    public string ConversionSignal { get; set; } = "UNCONFIRMED";

    public int? GtmServerCount { get; set; }

    [MaxLength(20)]
    public string? GtmDeploymentStatus { get; set; }

    public DateTime UpdatedAt { get; set; }
}

// ── ga4_contamination_exclusions ────────────────────────────────────────

public class Ga4ContaminationExclusion
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Pattern { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string Reason { get; set; } = string.Empty;

    public DateOnly AddedDate { get; set; }
    public bool IsActive { get; set; } = true;
}
