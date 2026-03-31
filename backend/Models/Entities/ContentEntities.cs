using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AvIntelOS.Api.Models.Entities;

// ── content_pillars ─────────────────────────────────────────────────────

public class ContentPillar
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string PillarName { get; set; } = string.Empty;

    public decimal? TargetMixPct { get; set; }

    [Required, MaxLength(20)]
    public string PillarType { get; set; } = "evergreen";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    // Navigation
    public ICollection<ContentArticle> Articles { get; set; } = new List<ContentArticle>();
}

// ── content_articles ────────────────────────────────────────────────────

public class ContentArticle
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string UrlPath { get; set; } = string.Empty;

    public int? PillarId { get; set; }

    [MaxLength(30)]
    public string? Category { get; set; }

    public DateOnly? PublishDate { get; set; }
    public DateOnly? LastRefreshDate { get; set; }
    public int Sessions30d { get; set; }
    public decimal? EngagementRate { get; set; }
    public int Conversions30d { get; set; }
    public decimal? BounceRate { get; set; }
    public bool HasCtaModule { get; set; }
    public decimal? CtaCtr { get; set; }

    [MaxLength(10)]
    public string? RefreshPriority { get; set; }

    [MaxLength(50)]
    public string? ExpectedLiftFromRefresh { get; set; }

    [Required, MaxLength(20)]
    public string ConfidenceLevel { get; set; } = "CONFIRMED";

    [Required, MaxLength(50)]
    public string DataSource { get; set; } = string.Empty;

    public DateTime? SourceFreshness { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(PillarId))]
    public ContentPillar? Pillar { get; set; }

    public ICollection<ContentRefreshQueue> RefreshQueue { get; set; } = new List<ContentRefreshQueue>();
}

// ── content_refresh_queue ───────────────────────────────────────────────

public class ContentRefreshQueue
{
    [Key]
    public int Id { get; set; }

    public int ArticleId { get; set; }

    [Required, MaxLength(255)]
    public string Reason { get; set; } = string.Empty;

    public int? MonthsSinceUpdate { get; set; }
    public decimal? ExpectedLiftPct { get; set; }

    [MaxLength(500)]
    public string? RefreshActions { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "queued";

    [MaxLength(100)]
    public string? OwnerName { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(ArticleId))]
    public ContentArticle Article { get; set; } = null!;
}
