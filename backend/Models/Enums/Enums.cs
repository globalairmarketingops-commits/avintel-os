namespace AvIntelOS.Api.Models.Enums;

// ── System ──────────────────────────────────────────────────────────────

public enum UserRole
{
    Viewer,
    Editor,
    Operator
}

public enum RoleView
{
    Casey,
    Clay,
    Jeffrey
}

public enum DateRangeOption
{
    Days7,
    Days14,
    Days30,
    Days90,
    Ytd
}

public enum CompareMode
{
    Wow,
    Mom,
    Qoq,
    Yoy
}

public enum CategoryFilter
{
    All,
    Piston,
    Jet,
    Turboprop,
    Helicopter
}

public enum ConnectionStatus
{
    Connected,
    Pending,
    NotConnected,
    Error,
    Unmaintained
}

public enum IngestionStatus
{
    Running,
    Success,
    Partial,
    Failed
}

public enum TriggerType
{
    Scheduled,
    Manual,
    Webhook
}

public enum HealthStatus
{
    Healthy,
    Degraded,
    Down
}

// ── GA4 ─────────────────────────────────────────────────────────────────

public enum ConfidenceLevel
{
    Confirmed,
    Probable,
    Possible
}

public enum ContaminationStatus
{
    Active,
    Resolved,
    Unknown
}

public enum VerificationStatus
{
    Confirmed,
    Unconfirmed,
    NotActive
}

public enum ConversionSignal
{
    Confirmed,
    Unconfirmed
}

public enum GtmDeploymentStatus
{
    Consistent,
    Inconsistent,
    Unknown
}

// ── Categories ──────────────────────────────────────────────────────────

public enum AircraftCategory
{
    Piston,
    Jet,
    Turboprop,
    Helicopter,
    Fbo,
    Content,
    Other
}

// ── Google Ads ───────────────────────────────────────────────────────────

public enum CampaignStatus
{
    Active,
    Paused,
    OnHold,
    Removed
}

public enum SearchTermAction
{
    AddNegative,
    Monitor,
    Keep
}

// ── Opportunity / Execution ─────────────────────────────────────────────

public enum OpportunityDomain
{
    Seo,
    Ppc,
    Revenue,
    Broker,
    Inventory,
    Content,
    Competitive,
    Measurement,
    Email,
    Social,
    Event
}

public enum OpportunityStatus
{
    Open,
    InProgress,
    Resolved,
    Deferred
}

public enum PriorityLabel
{
    Now,
    Next,
    Later
}

public enum ScaleSafety
{
    Scale,
    OptimizeCarefully,
    DiagnosticOnly,
    Blocked,
    ControlledLaunch,
    Refine,
    Proposal
}

public enum FeatureAdvantage
{
    Globalair,
    Controller,
    None
}

// ── Content ─────────────────────────────────────────────────────────────

public enum PillarType
{
    Evergreen,
    News
}

public enum RefreshPriority
{
    High,
    Medium,
    Low
}

public enum RefreshStatus
{
    Queued,
    InProgress,
    Completed
}

// ── SEO ─────────────────────────────────────────────────────────────────

public enum SeoPlayStatus
{
    Proposed,
    Active,
    Completed,
    Deferred
}

public enum HubStatus
{
    LiveStrong,
    LiveModerate,
    LiveThin,
    Planned,
    NotStarted
}

// ── PPC ─────────────────────────────────────────────────────────────────

public enum NegativeMatchType
{
    Exact,
    Phrase,
    Broad
}

// ── Email ───────────────────────────────────────────────────────────────

public enum EmailSequenceStatus
{
    Healthy,
    NeedsWork,
    Missing,
    Planned
}

public enum EmailProduct
{
    Avblast,
    Airmail,
    BrokernetDaily,
    WhatsNew,
    BreakingNews
}

public enum ServerStatus
{
    Active,
    Inactive,
    Decommissioned
}

public enum DnsRecordStatus
{
    Pass,
    Fail,
    Unknown,
    NA
}

public enum RiskLevel
{
    Low,
    Moderate,
    High
}

// ── Revenue / Broker ────────────────────────────────────────────────────

public enum TrendDirection
{
    Up,
    Flat,
    Down,
    Declining
}

public enum BrokerTier
{
    Premium,
    Standard,
    Basic
}

public enum CpcPressure
{
    Low,
    Medium,
    High
}

public enum StabilityTrend
{
    Rising,
    Stable,
    Falling
}

// ── Inventory ───────────────────────────────────────────────────────────

public enum ListingStatus
{
    Active,
    Sold,
    Archived
}

public enum OrganicRankTrend
{
    Improving,
    Stable,
    Declining
}

public enum PaidCpcTrend
{
    Rising,
    Stable,
    Falling
}

public enum OpportunityState
{
    Accelerating,
    Expanding,
    Stable,
    Mixed,
    Contracting
}

// ── Alerts ──────────────────────────────────────────────────────────────

public enum AlertOperator
{
    Gt,
    Lt,
    Gte,
    Lte,
    DeltaGt,
    DeltaLt
}

public enum Severity
{
    Info,
    Warning,
    Critical
}

public enum NotificationChannel
{
    Teams,
    Email,
    Both,
    None
}

public enum AlertType
{
    Winner,
    Loser,
    Integrity,
    SlaBreach,
    Contamination,
    ConnectorFailure,
    Risk
}

// ── Execution ───────────────────────────────────────────────────────────

public enum ExecutionItemType
{
    Constraint,
    Blocker,
    Initiative,
    QuarterlyPriority
}

public enum ExecutionItemStatus
{
    Open,
    InProgress,
    Resolved,
    Deferred,
    Blocked
}
