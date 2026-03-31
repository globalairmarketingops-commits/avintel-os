// =====================================================================
// Av/IntelOS — Core Type Definitions
// =====================================================================

export type ConfidenceLevel = "CONFIRMED" | "PROBABLE" | "POSSIBLE";

export type DataSource =
  | "windsor_live"
  | "api_direct"
  | "csv_upload"
  | "manual"
  | "calculated"
  | "seed";

export type RoleKey = "casey" | "clay" | "jeffrey";

export type UserRole = "operator" | "editor" | "viewer";

export type PriorityLabel = "now" | "next" | "later";

export type Severity = "info" | "warning" | "critical";

export type ScaleSafety =
  | "scale"
  | "optimize_carefully"
  | "diagnostic_only"
  | "blocked";

export type Trend = "up" | "flat" | "down" | "declining" | "rising" | "stable" | "falling" | "improving";

export type Category = "piston" | "jet" | "turboprop" | "helicopter" | "fbo" | "content" | "other" | "all";

export type DateRange = "7d" | "14d" | "30d" | "90d" | "ytd";

export type CompareMode = "wow" | "mom" | "qoq" | "yoy";

export type ConnectionStatus = "connected" | "pending" | "not_connected" | "error" | "unmaintained";

export type AlertType = "winner" | "loser" | "integrity" | "sla_breach" | "contamination" | "connector_failure" | "risk";

export type OpportunityDomain =
  | "seo" | "ppc" | "revenue" | "broker" | "inventory"
  | "content" | "competitive" | "measurement" | "email" | "social" | "event";

// --- Shared data shapes ---

export interface KPIValue {
  value: number;
  delta: string;
  trend: Trend;
  confidence: ConfidenceLevel;
  period?: string;
  source?: DataSource;
}

export interface ConfidenceMeta {
  confidence_summary: {
    confirmed: number;
    probable: number;
    possible: number;
  };
  freshness: string;
}

export interface RoleConfig {
  label: string;
  title: string;
  showAll: boolean;
  hideProbable: boolean;
}

export interface UserPreferences {
  current_role_view: RoleKey;
  date_range: DateRange;
  compare_mode: CompareMode;
  category_filter: Category;
  signal_clean_only: boolean;
  contam_banner_visible: boolean;
}

export interface Opportunity {
  id: number;
  domain: OpportunityDomain;
  title: string;
  description?: string;
  priority_score: number;
  expected_lift?: string;
  time_to_impact?: string;
  owner_name?: string;
  blocker?: string;
  dependencies?: string;
  status: "open" | "in_progress" | "resolved" | "deferred";
  priority_label: PriorityLabel;
  scale_safety?: ScaleSafety;
  confidence_level: ConfidenceLevel;
}

export interface Alert {
  id: number;
  alert_type: AlertType;
  severity: Severity;
  module: string;
  title: string;
  description?: string;
  is_resolved: boolean;
  created_at: string;
}

export interface DataSourceStatus {
  id: number;
  source_key: string;
  display_name: string;
  connection_status: ConnectionStatus;
  sla_hours: number | null;
  last_successful_sync: string | null;
  last_error: string | null;
}

export interface NavRoute {
  key: string;
  path: string;
  label: string;
  icon: string;
  group: "intelligence" | "analytics" | "strategy" | "performance" | "system";
}
