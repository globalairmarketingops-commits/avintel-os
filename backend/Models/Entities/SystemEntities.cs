using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AvIntelOS.Api.Models.Enums;

namespace AvIntelOS.Api.Models.Entities;

// ── users ───────────────────────────────────────────────────────────────

public class User
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(128)]
    public string EntraId { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string DisplayName { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Role { get; set; } = "viewer";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public UserPreference? UserPreference { get; set; }
    public ICollection<Opportunity> OwnedOpportunities { get; set; } = new List<Opportunity>();
}

// ── user_preferences ────────────────────────────────────────────────────

public class UserPreference
{
    [Key]
    public int Id { get; set; }

    public int UserId { get; set; }

    [MaxLength(20)]
    public string CurrentRoleView { get; set; } = "casey";

    [MaxLength(10)]
    public string DateRange { get; set; } = "30d";

    [MaxLength(10)]
    public string CompareMode { get; set; } = "wow";

    [MaxLength(20)]
    public string CategoryFilter { get; set; } = "all";

    public bool SignalCleanOnly { get; set; } = true;
    public bool ContamBannerVisible { get; set; } = true;

    public DateTime UpdatedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}

// ── data_sources ────────────────────────────────────────────────────────

public class DataSource
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string SourceKey { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string DisplayName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string ConnectionStatus { get; set; } = "not_connected";

    public int? SlaHours { get; set; }
    public DateTime? LastSuccessfulSync { get; set; }
    public DateTime? LastSyncAttempt { get; set; }

    [MaxLength(500)]
    public string? LastError { get; set; }

    public int? RecordsLastSync { get; set; }

    [MaxLength(100)]
    public string? Owner { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public ICollection<IngestionLog> IngestionLogs { get; set; } = new List<IngestionLog>();
}

// ── ingestion_logs ──────────────────────────────────────────────────────

public class IngestionLog
{
    [Key]
    public long Id { get; set; }

    public int SourceId { get; set; }

    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "running";

    public int RecordsProcessed { get; set; }
    public int RecordsInserted { get; set; }
    public int RecordsUpdated { get; set; }
    public int RecordsSkipped { get; set; }

    public string? ErrorMessage { get; set; }

    [Required, MaxLength(20)]
    public string TriggerType { get; set; } = "scheduled";

    [MaxLength(100)]
    public string? FunctionName { get; set; }

    public int? DurationMs { get; set; }

    // Navigation
    [ForeignKey(nameof(SourceId))]
    public DataSource DataSource { get; set; } = null!;
}

// ── system_health ───────────────────────────────────────────────────────

public class SystemHealthCheck
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string CheckType { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string CheckName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Status { get; set; } = "healthy";

    public int? LatencyMs { get; set; }

    [MaxLength(500)]
    public string? Details { get; set; }

    public DateTime LastChecked { get; set; }
}
