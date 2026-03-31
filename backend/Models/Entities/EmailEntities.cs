using System.ComponentModel.DataAnnotations;

namespace AvIntelOS.Api.Models.Entities;

// ── email_sequences ─────────────────────────────────────────────────────

public class EmailSequence
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string SequenceName { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? TriggerBehavior { get; set; }

    [MaxLength(50)]
    public string? AudienceSegment { get; set; }

    public int? AudienceSize { get; set; }

    [MaxLength(20)]
    public string? ScoreRange { get; set; }

    public int? EmailCount { get; set; }

    [MaxLength(100)]
    public string? CadenceDescription { get; set; }

    [MaxLength(100)]
    public string? Objective { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "planned";

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    public DateTime UpdatedAt { get; set; }
}

// ── email_performance ───────────────────────────────────────────────────

public class EmailPerformance
{
    [Key]
    public long Id { get; set; }

    public DateOnly SendDate { get; set; }

    [Required, MaxLength(50)]
    public string EmailProduct { get; set; } = string.Empty;

    public int SendVolume { get; set; }
    public int? Delivered { get; set; }
    public int? Opens { get; set; }
    public int? Clicks { get; set; }
    public int? Unsubscribes { get; set; }
    public int? Bounces { get; set; }
    public int? SpamComplaints { get; set; }
    public int QiAttributed { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "PROBABLE";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime? SourceFreshness { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ── email_servers ───────────────────────────────────────────────────────

public class EmailServer
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string ServerHostname { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Purpose { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Status { get; set; } = "active";

    [Required, MaxLength(10)]
    public string SpfStatus { get; set; } = "unknown";

    [Required, MaxLength(10)]
    public string DkimStatus { get; set; } = "unknown";

    [Required, MaxLength(10)]
    public string DmarcStatus { get; set; } = "unknown";

    [MaxLength(20)]
    public string? DmarcPolicy { get; set; }

    [MaxLength(10)]
    public string? RiskLevel { get; set; }

    public DateTime? LastChecked { get; set; }
    public DateTime UpdatedAt { get; set; }
}
