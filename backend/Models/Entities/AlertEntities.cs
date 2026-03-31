using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AvIntelOS.Api.Models.Entities;

// ── alert_rules ─────────────────────────────────────────────────────────

public class AlertRule
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string RuleName { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string MetricKey { get; set; } = string.Empty;

    [Required, MaxLength(10)]
    public string Operator { get; set; } = "gt";

    public decimal ThresholdValue { get; set; }

    [Required, MaxLength(10)]
    public string Severity { get; set; } = "info";

    [Required, MaxLength(30)]
    public string Module { get; set; } = string.Empty;

    public int CooldownHours { get; set; } = 24;

    [MaxLength(20)]
    public string? NotificationChannel { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    // Navigation
    public ICollection<Alert> Alerts { get; set; } = new List<Alert>();
}

// ── alerts ──────────────────────────────────────────────────────────────

public class Alert
{
    [Key]
    public int Id { get; set; }

    public int? RuleId { get; set; }

    [Required, MaxLength(30)]
    public string AlertType { get; set; } = string.Empty;

    [Required, MaxLength(10)]
    public string Severity { get; set; } = "info";

    [Required, MaxLength(30)]
    public string Module { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [MaxLength(50)]
    public string? RelatedEntityType { get; set; }

    [MaxLength(50)]
    public string? RelatedEntityId { get; set; }

    public bool IsResolved { get; set; }

    [MaxLength(100)]
    public string? ResolvedBy { get; set; }

    public DateTime? ResolvedAt { get; set; }
    public string? ResolutionNotes { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(RuleId))]
    public AlertRule? Rule { get; set; }
}
