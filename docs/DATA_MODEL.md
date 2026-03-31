# Av/IntelOS Data Model Specification

**Document**: Complete data model for Av/IntelOS v2.0
**Source Files**: 11 updated HTML prototypes, seed-data.js, confidence.js, metrics-registry.js, role-filter.js
**Purpose**: Engineering dev brief for API & database schema design
**Audience**: Backend engineers, data architects, product engineers

---

## EXECUTIVE SUMMARY

Av/IntelOS is GlobalAir's centralized intelligence and operating-control application. The system orchestrates:
- Cross-domain KPI aggregation with confidence classification
- GA4/GSC/Google Ads analytics with contamination filtering
- PPC intelligence with scale safety and waste detection
- SEO playbook and organic intelligence
- Email lifecycle, social authority, event revenue, content performance
- Data health monitoring as the trust-control layer
- Role-aware rendering for Operator (Casey), Editor (Clay), Viewer (Jeffrey)

**37 Primary Tables** in 13 groups + **30+ Computed Metrics** + **6 Azure Functions** for ingestion and evaluation.

---

## CROSS-CUTTING COLUMN STANDARDS

Every table with metric data includes these standard columns:

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `confidence_level` | NVARCHAR(20) | Yes | 'POSSIBLE' | CHECK: CONFIRMED, PROBABLE, POSSIBLE |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | CHECK: windsor_live, api_direct, csv_upload, manual, calculated, seed |
| `source_freshness` | DATETIME2 | No | NULL | When upstream source last provided this data |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | Row creation timestamp |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | Last modification timestamp |

**Confidence classification rules** (from confidence.js):
- windsor_live, api_direct, csv_upload, manual → CONFIRMED
- calculated → PROBABLE
- seed, unknown → POSSIBLE
- Decay: CONFIRMED older than 30 days → PROBABLE. PROBABLE older than 60 days → POSSIBLE.
- Composite metrics: confidence = MIN(input confidences)

---

## 1. GROUP A — SYSTEM TABLES (5 tables)

### 1.1 users

**Definition**: Entra ID-linked user accounts with role-based access.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `entra_id` | NVARCHAR(128) | Yes | | UNIQUE — Microsoft Entra ID subject |
| `display_name` | NVARCHAR(100) | Yes | | |
| `email` | NVARCHAR(255) | Yes | | UNIQUE |
| `role` | NVARCHAR(20) | Yes | 'viewer' | CHECK: operator, editor, viewer |
| `is_active` | BIT | Yes | 1 | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Role mapping**: operator = Casey (full access, all confidence levels). editor = Clay (CONFIRMED + PROBABLE, no CRUD on execution items). viewer = Jeffrey (CONFIRMED only, board-safe rendering).

---

### 1.2 user_preferences

**Definition**: Per-user saved view preferences and display settings.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `user_id` | INT | FK → users.id | | |
| `current_role_view` | NVARCHAR(20) | Yes | 'casey' | CHECK: casey, clay, jeffrey |
| `date_range` | NVARCHAR(10) | Yes | '30d' | CHECK: 7d, 14d, 30d, 90d, ytd |
| `compare_mode` | NVARCHAR(10) | Yes | 'wow' | CHECK: wow, mom, qoq, yoy |
| `category_filter` | NVARCHAR(20) | Yes | 'all' | CHECK: all, piston, jet, turboprop, helicopter |
| `signal_clean_only` | BIT | Yes | 1 | Filter Email_Open_ contamination |
| `contam_banner_visible` | BIT | Yes | 1 | Show contamination warning banner |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

---

### 1.3 data_sources

**Definition**: Registry of all external data sources and their connection status.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `source_key` | NVARCHAR(50) | Yes | | UNIQUE — ga4, gsc, google_ads, windsor, crm, callrail, semrush, spyfu, clarity, simpli_fi, email_platform |
| `display_name` | NVARCHAR(100) | Yes | | |
| `connection_status` | NVARCHAR(20) | Yes | 'not_connected' | CHECK: connected, pending, not_connected, error, unmaintained |
| `sla_hours` | INT | No | NULL | Expected refresh SLA in hours |
| `last_successful_sync` | DATETIME2 | No | NULL | |
| `last_sync_attempt` | DATETIME2 | No | NULL | |
| `last_error` | NVARCHAR(500) | No | NULL | |
| `records_last_sync` | INT | No | NULL | |
| `owner` | NVARCHAR(100) | No | NULL | Responsible person for this connector |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Source:** Derived from `intel_health_connectors` seed data shape.

---

### 1.4 ingestion_logs

**Definition**: Pipeline run history for every data fetch operation.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | BIGINT IDENTITY | PK | Auto | |
| `source_id` | INT | FK → data_sources.id | | |
| `started_at` | DATETIME2 | Yes | GETUTCDATE() | |
| `completed_at` | DATETIME2 | No | NULL | |
| `status` | NVARCHAR(20) | Yes | 'running' | CHECK: running, success, partial, failed |
| `records_processed` | INT | No | 0 | |
| `records_inserted` | INT | No | 0 | |
| `records_updated` | INT | No | 0 | |
| `records_skipped` | INT | No | 0 | |
| `error_message` | NVARCHAR(MAX) | No | NULL | |
| `trigger_type` | NVARCHAR(20) | Yes | 'scheduled' | CHECK: scheduled, manual, webhook |
| `function_name` | NVARCHAR(100) | No | NULL | Azure Function name |
| `duration_ms` | INT | No | NULL | |

---

### 1.5 system_health

**Definition**: Infrastructure health checks for monitoring.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `check_type` | NVARCHAR(50) | Yes | | database, api, cache, storage, function, external_api |
| `check_name` | NVARCHAR(100) | Yes | | |
| `status` | NVARCHAR(20) | Yes | | CHECK: healthy, degraded, down |
| `latency_ms` | INT | No | NULL | |
| `details` | NVARCHAR(500) | No | NULL | |
| `last_checked` | DATETIME2 | Yes | GETUTCDATE() | |

---

## 2. GROUP B — GA4 / ANALYTICS TABLES (5 tables)

### 2.1 ga4_channel_snapshots

**Definition**: Daily channel-level traffic and engagement metrics from GA4.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | BIGINT IDENTITY | PK | Auto | |
| `snapshot_date` | DATE | Yes | | |
| `channel` | NVARCHAR(50) | Yes | | Organic Search, Direct, Paid Search, Email, Referral, Social |
| `sessions` | INT | Yes | 0 | |
| `users` | INT | Yes | 0 | |
| `engagement_rate` | DECIMAL(5,2) | No | NULL | Clean rate (Email_Open_ excluded) |
| `conversions` | INT | Yes | 0 | |
| `revenue` | DECIMAL(12,2) | No | 0 | |
| `bounce_rate` | DECIMAL(5,2) | No | NULL | |
| `avg_session_duration` | DECIMAL(8,2) | No | NULL | Seconds |
| `confidence_level` | NVARCHAR(20) | Yes | 'POSSIBLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Source:** `intel_ga4_channels` seed shape. Ingested by GA4IngestionFunction.
**Computed:** `qi_per_100_sessions` = CASE WHEN sessions > 0 THEN (CAST(conversions AS FLOAT) / sessions) * 100 ELSE 0 END (PERSISTED)
**UNIQUE:** (snapshot_date, channel)

---

### 2.2 ga4_landing_pages

**Definition**: Daily landing page performance with category classification.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | BIGINT IDENTITY | PK | Auto | |
| `snapshot_date` | DATE | Yes | | |
| `page_path` | NVARCHAR(500) | Yes | | URL path |
| `sessions` | INT | Yes | 0 | |
| `bounce_rate` | DECIMAL(5,2) | No | NULL | |
| `avg_time_seconds` | DECIMAL(8,2) | No | NULL | |
| `conversions` | INT | Yes | 0 | |
| `category` | NVARCHAR(30) | No | NULL | CHECK: piston, jet, turboprop, helicopter, fbo, content, other |
| `impressions` | INT | No | NULL | From GSC join |
| `ctr` | DECIMAL(5,2) | No | NULL | From GSC join |
| `confidence_level` | NVARCHAR(20) | Yes | 'POSSIBLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Source:** `intel_ga4_landing_pages` seed shape.
**Computed:** `cvr_pct` = CASE WHEN sessions > 0 THEN (CAST(conversions AS FLOAT) / sessions) * 100 ELSE 0 END (PERSISTED)
**UNIQUE:** (snapshot_date, page_path)

---

### 2.3 ga4_events

**Definition**: Event-level data for validation and contamination filtering.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | BIGINT IDENTITY | PK | Auto | |
| `snapshot_date` | DATE | Yes | | |
| `event_name` | NVARCHAR(100) | Yes | | |
| `event_count` | INT | Yes | 0 | |
| `tier` | TINYINT | No | NULL | CHECK: 1, 2, 3 — Tier 1 = validated, Tier 2 = probable, Tier 3 = modeled |
| `is_contaminated` | BIT | Yes | 0 | TRUE if event_name starts with Email_Open_ |
| `confidence_level` | NVARCHAR(20) | Yes | 'POSSIBLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Event tier definitions:**
- Tier 1 (Validated): qualified_inquiry, call_inquiry, broker_email_click
- Tier 2 (Probable): pdf_download, form_start
- Tier 3 (Modeled): model_view_3plus

---

### 2.4 ga4_property_health

**Definition**: GA4 property configuration and contamination status.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `property_id` | NVARCHAR(20) | Yes | | G-K0N37V9FEB |
| `contamination_status` | NVARCHAR(20) | Yes | 'ACTIVE' | CHECK: ACTIVE, RESOLVED, UNKNOWN |
| `contamination_start` | DATE | No | '2023-06-01' | |
| `real_engagement_rate` | DECIMAL(5,2) | No | 69.0 | |
| `reported_engagement_rate` | DECIMAL(5,2) | No | 17.0 | |
| `enhanced_conversions` | NVARCHAR(20) | Yes | 'UNCONFIRMED' | CHECK: CONFIRMED, UNCONFIRMED, NOT_ACTIVE |
| `conversion_signal` | NVARCHAR(20) | Yes | 'UNCONFIRMED' | CHECK: CONFIRMED, UNCONFIRMED |
| `gtm_server_count` | INT | No | 8 | |
| `gtm_deployment_status` | NVARCHAR(20) | No | 'INCONSISTENT' | CHECK: CONSISTENT, INCONSISTENT, UNKNOWN |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Source:** `intel_health_ga4` seed shape.

---

### 2.5 ga4_contamination_exclusions

**Definition**: Event name patterns to exclude from engagement calculations.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `pattern` | NVARCHAR(100) | Yes | | e.g., 'Email_Open_%' |
| `reason` | NVARCHAR(255) | Yes | | |
| `added_date` | DATE | Yes | GETUTCDATE() | |
| `is_active` | BIT | Yes | 1 | |

---

## 3. GROUP C — SEARCH CONSOLE TABLES (3 tables)

### 3.1 gsc_query_snapshots

**Definition**: Daily query-level search performance data.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | BIGINT IDENTITY | PK | Auto | |
| `snapshot_date` | DATE | Yes | | |
| `query` | NVARCHAR(500) | Yes | | |
| `clicks` | INT | Yes | 0 | |
| `impressions` | INT | Yes | 0 | |
| `avg_position` | DECIMAL(5,2) | No | NULL | |
| `category` | NVARCHAR(30) | No | NULL | Classified: piston, jet, turboprop, helicopter, fbo, other |
| `confidence_level` | NVARCHAR(20) | Yes | 'CONFIRMED' | GSC = always CONFIRMED source |
| `data_source` | NVARCHAR(50) | Yes | 'api_direct' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Computed:** `ctr_pct` = CASE WHEN impressions > 0 THEN (CAST(clicks AS FLOAT) / impressions) * 100 ELSE 0 END (PERSISTED)

---

### 3.2 gsc_page_snapshots

**Definition**: Daily page-level search performance data.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | BIGINT IDENTITY | PK | Auto | |
| `snapshot_date` | DATE | Yes | | |
| `page_url` | NVARCHAR(500) | Yes | | |
| `clicks` | INT | Yes | 0 | |
| `impressions` | INT | Yes | 0 | |
| `avg_position` | DECIMAL(5,2) | No | NULL | |
| `category` | NVARCHAR(30) | No | NULL | |
| `confidence_level` | NVARCHAR(20) | Yes | 'CONFIRMED' | |
| `data_source` | NVARCHAR(50) | Yes | 'api_direct' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Computed:** `ctr_pct` (same formula as gsc_query_snapshots)

---

### 3.3 gsc_portfolio_summary

**Definition**: Daily aggregate search portfolio metrics.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `snapshot_date` | DATE | Yes | | UNIQUE |
| `total_keywords` | INT | Yes | 0 | |
| `monthly_clicks` | INT | Yes | 0 | |
| `avg_position` | DECIMAL(5,2) | No | NULL | |
| `avg_ctr` | DECIMAL(5,2) | No | NULL | |
| `confidence_level` | NVARCHAR(20) | Yes | 'CONFIRMED' | |
| `data_source` | NVARCHAR(50) | Yes | 'api_direct' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Source:** `intel_gsc_portfolio` seed shape.

---

## 4. GROUP D — GOOGLE ADS TABLES (4 tables)

### 4.1 ads_campaign_snapshots

**Definition**: Daily campaign-level PPC performance metrics.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | BIGINT IDENTITY | PK | Auto | |
| `snapshot_date` | DATE | Yes | | |
| `campaign_name` | NVARCHAR(200) | Yes | | |
| `spend` | DECIMAL(10,2) | Yes | 0 | |
| `clicks` | INT | Yes | 0 | |
| `impressions` | INT | Yes | 0 | |
| `conversions` | INT | Yes | 0 | |
| `campaign_status` | NVARCHAR(20) | Yes | 'Active' | CHECK: Active, Paused, On Hold, Removed |
| `category` | NVARCHAR(30) | No | NULL | piston, jet, turboprop, helicopter, brand, retargeting |
| `impression_share` | DECIMAL(5,2) | No | NULL | |
| `search_impression_share_lost_budget` | DECIMAL(5,2) | No | NULL | |
| `search_impression_share_lost_rank` | DECIMAL(5,2) | No | NULL | |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Computed:**
- `ctr_pct` = CASE WHEN impressions > 0 THEN (CAST(clicks AS FLOAT) / impressions) * 100 ELSE 0 END (PERSISTED)
- `cpqi` = CASE WHEN conversions > 0 THEN spend / conversions ELSE 0 END (PERSISTED)
**UNIQUE:** (snapshot_date, campaign_name)
**Source:** `intel_ppc_campaigns` seed shape.

---

### 4.2 ads_adgroup_snapshots

**Definition**: Daily ad group level detail.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | BIGINT IDENTITY | PK | Auto | |
| `snapshot_date` | DATE | Yes | | |
| `campaign_name` | NVARCHAR(200) | Yes | | |
| `adgroup_name` | NVARCHAR(200) | Yes | | |
| `spend` | DECIMAL(10,2) | Yes | 0 | |
| `clicks` | INT | Yes | 0 | |
| `impressions` | INT | Yes | 0 | |
| `conversions` | INT | Yes | 0 | |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Computed:** `ctr_pct`, `cpqi` (same formulas)

---

### 4.3 ads_search_terms

**Definition**: Search term report with waste classification.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | BIGINT IDENTITY | PK | Auto | |
| `snapshot_date` | DATE | Yes | | |
| `search_term` | NVARCHAR(500) | Yes | | |
| `campaign_name` | NVARCHAR(200) | No | NULL | |
| `impressions` | INT | Yes | 0 | |
| `clicks` | INT | Yes | 0 | |
| `spend` | DECIMAL(10,2) | Yes | 0 | |
| `conversions` | INT | Yes | 0 | |
| `waste_reason` | NVARCHAR(200) | No | NULL | Jet intent, non-buyer, informational, rental, parts, career, simulator, tire-kicker |
| `action` | NVARCHAR(20) | No | NULL | CHECK: Add Negative, Monitor, Keep |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Source:** `intel_ppc_waste_terms` seed shape.

---

### 4.4 ads_auction_insights

**Definition**: Weekly auction insights data vs competitors (primarily Controller.com).

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `week_start` | DATE | Yes | | |
| `competitor` | NVARCHAR(100) | Yes | 'Controller.com' | |
| `impression_share` | DECIMAL(5,2) | No | NULL | |
| `overlap_rate` | DECIMAL(5,2) | No | NULL | |
| `position_above_rate` | DECIMAL(5,2) | No | NULL | |
| `outranking_share` | DECIMAL(5,2) | No | NULL | |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Source:** `intel_competitive_auction` seed shape.

---

## 5. GROUP E — OPPORTUNITY & INTELLIGENCE TABLES (4 tables)

### 5.1 opportunities

**Definition**: Scored, ranked opportunity signals across all domains.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `domain` | NVARCHAR(30) | Yes | | CHECK: seo, ppc, revenue, broker, inventory, content, competitive, measurement, email, social, event |
| `title` | NVARCHAR(255) | Yes | | |
| `description` | NVARCHAR(MAX) | No | NULL | |
| `priority_score` | INT | Yes | 50 | Range 0-100 |
| `expected_lift` | NVARCHAR(100) | No | NULL | e.g., '+15% CTR', '-$8 CPQI' |
| `time_to_impact` | NVARCHAR(50) | No | NULL | e.g., '7 days', '30 days', '90 days' |
| `owner_user_id` | INT | FK → users.id | NULL | |
| `owner_name` | NVARCHAR(100) | No | NULL | For display when user not in system |
| `blocker` | NVARCHAR(255) | No | NULL | |
| `dependencies` | NVARCHAR(500) | No | NULL | |
| `status` | NVARCHAR(20) | Yes | 'open' | CHECK: open, in_progress, resolved, deferred |
| `priority_label` | NVARCHAR(10) | Yes | 'next' | CHECK: now, next, later |
| `scale_safety` | NVARCHAR(30) | No | NULL | CHECK: scale, optimize_carefully, diagnostic_only, blocked |
| `confidence_level` | NVARCHAR(20) | Yes | 'POSSIBLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |
| `resolved_at` | DATETIME2 | No | NULL | |

---

### 5.2 opportunity_signals

**Definition**: Individual data signals feeding opportunity scoring.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | BIGINT IDENTITY | PK | Auto | |
| `opportunity_id` | INT | FK → opportunities.id | | |
| `signal_type` | NVARCHAR(50) | Yes | | e.g., ctr_drop, is_loss, waste_spike, qi_surge |
| `signal_value` | DECIMAL(12,4) | No | NULL | |
| `signal_label` | NVARCHAR(255) | No | NULL | |
| `detected_at` | DATETIME2 | Yes | GETUTCDATE() | |
| `confidence_level` | NVARCHAR(20) | Yes | 'POSSIBLE' | |

---

### 5.3 competitive_benchmarks

**Definition**: Category-level competitive defensibility scores.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `category` | NVARCHAR(50) | Yes | | UNIQUE |
| `defensibility_score` | INT | Yes | 50 | Range 0-100 |
| `rank_stability` | DECIMAL(5,2) | No | NULL | |
| `cpc_pressure` | NVARCHAR(10) | No | NULL | CHECK: Low, Medium, High |
| `content_depth` | INT | No | NULL | Number of content pages |
| `listing_depth` | INT | No | NULL | Number of active listings |
| `repeat_audience_pct` | DECIMAL(5,2) | No | NULL | |
| `trend` | NVARCHAR(10) | No | NULL | CHECK: rising, stable, falling |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Source:** `intel_competitive_defensibility` seed shape.

---

### 5.4 competitive_features

**Definition**: Feature comparison matrix GlobalAir vs Controller.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `feature_name` | NVARCHAR(100) | Yes | | UNIQUE |
| `globalair_has` | BIT | Yes | 0 | |
| `controller_has` | BIT | Yes | 0 | |
| `advantage` | NVARCHAR(20) | Yes | 'none' | CHECK: globalair, controller, none |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Source:** `intel_competitive_features` seed shape.

---

## 6. GROUP F — CONTENT & CHANNEL TABLES (3 tables)

### 6.1 content_pillars

**Definition**: Content pillar definitions and strategy.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `pillar_name` | NVARCHAR(100) | Yes | | UNIQUE |
| `target_mix_pct` | DECIMAL(5,2) | No | NULL | Target percentage of total content |
| `pillar_type` | NVARCHAR(20) | Yes | 'evergreen' | CHECK: evergreen, news |
| `is_active` | BIT | Yes | 1 | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Seed values:** Aircraft Buying Guides (evergreen), Market Analysis (evergreen), Operating Costs & Ownership (evergreen), Aviation Lifestyle (evergreen), News & Intelligence (news)

---

### 6.2 content_articles

**Definition**: Article-level content performance tracking.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `title` | NVARCHAR(255) | Yes | | |
| `url_path` | NVARCHAR(500) | Yes | | UNIQUE |
| `pillar_id` | INT | FK → content_pillars.id | NULL | |
| `category` | NVARCHAR(30) | No | NULL | piston, jet, turboprop, helicopter, general |
| `publish_date` | DATE | No | NULL | |
| `last_refresh_date` | DATE | No | NULL | |
| `sessions_30d` | INT | No | 0 | |
| `engagement_rate` | DECIMAL(5,2) | No | NULL | |
| `conversions_30d` | INT | No | 0 | |
| `bounce_rate` | DECIMAL(5,2) | No | NULL | |
| `has_cta_module` | BIT | Yes | 0 | |
| `cta_ctr` | DECIMAL(5,2) | No | NULL | |
| `refresh_priority` | NVARCHAR(10) | No | NULL | CHECK: high, medium, low |
| `expected_lift_from_refresh` | NVARCHAR(50) | No | NULL | |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Source:** `intel_content_pillars` seed shape (expanded to article level).

---

### 6.3 content_refresh_queue

**Definition**: Articles flagged for refresh with expected impact.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `article_id` | INT | FK → content_articles.id | | |
| `reason` | NVARCHAR(255) | Yes | | |
| `months_since_update` | INT | No | NULL | |
| `expected_lift_pct` | DECIMAL(5,2) | No | NULL | |
| `refresh_actions` | NVARCHAR(500) | No | NULL | Comma-separated: add_cta, update_pricing, add_comparisons, add_internal_links |
| `status` | NVARCHAR(20) | Yes | 'queued' | CHECK: queued, in_progress, completed |
| `owner_name` | NVARCHAR(100) | No | NULL | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |
| `completed_at` | DATETIME2 | No | NULL | |

---

## 7. GROUP G — SEO TABLES (2 tables)

### 7.1 seo_plays

**Definition**: SEO strategic plays with scoring and ownership.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `play_title` | NVARCHAR(255) | Yes | | |
| `description` | NVARCHAR(MAX) | No | NULL | |
| `category` | NVARCHAR(30) | No | NULL | piston, jet, turboprop, helicopter, technical, all |
| `priority_score` | INT | Yes | 50 | Range 0-100 |
| `status` | NVARCHAR(20) | Yes | 'proposed' | CHECK: proposed, active, completed, deferred |
| `priority_label` | NVARCHAR(10) | Yes | 'next' | CHECK: now, next, later |
| `owner_name` | NVARCHAR(100) | No | NULL | |
| `impact_description` | NVARCHAR(255) | No | NULL | |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

---

### 7.2 seo_model_hubs

**Definition**: Model hub page system status and build queue.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `make` | NVARCHAR(50) | Yes | | |
| `model` | NVARCHAR(100) | Yes | | |
| `category` | NVARCHAR(30) | Yes | | piston, jet, turboprop, helicopter |
| `hub_status` | NVARCHAR(20) | Yes | 'planned' | CHECK: live_strong, live_moderate, live_thin, planned, not_started |
| `commercial_page_status` | NVARCHAR(20) | No | NULL | |
| `research_page_status` | NVARCHAR(20) | No | NULL | |
| `comparison_page_status` | NVARCHAR(20) | No | NULL | |
| `ownership_page_status` | NVARCHAR(20) | No | NULL | |
| `content_gaps` | NVARCHAR(500) | No | NULL | |
| `build_urgency` | NVARCHAR(10) | No | NULL | CHECK: now, next, later |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

**UNIQUE:** (make, model)

---

## 8. GROUP H — PPC ANALYSIS TABLES (2 tables)

### 8.1 ppc_waste_analysis

**Definition**: Aggregate PPC waste metrics.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `snapshot_date` | DATE | Yes | | UNIQUE |
| `total_spend` | DECIMAL(10,2) | Yes | 0 | |
| `irrelevant_spend` | DECIMAL(10,2) | Yes | 0 | |
| `wasted_clicks` | INT | Yes | 0 | |
| `negative_kw_coverage_pct` | DECIMAL(5,2) | No | NULL | |
| `negatives_added_count` | INT | No | 0 | |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Computed:** `waste_pct` = CASE WHEN total_spend > 0 THEN (CAST(irrelevant_spend AS FLOAT) / total_spend) * 100 ELSE 0 END (PERSISTED)
**Source:** `intel_ppc_search_term_waste` seed shape.

---

### 8.2 ppc_negative_keywords

**Definition**: Negative keyword additions and their impact.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `term` | NVARCHAR(200) | Yes | | |
| `campaign_name` | NVARCHAR(200) | No | NULL | |
| `match_type` | NVARCHAR(10) | Yes | 'exact' | CHECK: exact, phrase, broad |
| `waste_reason` | NVARCHAR(200) | No | NULL | |
| `estimated_monthly_waste` | DECIMAL(10,2) | No | NULL | |
| `added_date` | DATE | Yes | GETUTCDATE() | |
| `added_by` | NVARCHAR(100) | No | NULL | |

---

## 9. GROUP I — EMAIL TABLES (3 tables)

### 9.1 email_sequences

**Definition**: Email lifecycle sequence definitions and health status.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `sequence_name` | NVARCHAR(100) | Yes | | UNIQUE |
| `trigger_behavior` | NVARCHAR(255) | No | NULL | e.g., 'PDF + model view 3+' |
| `audience_segment` | NVARCHAR(50) | No | NULL | active_evaluators, engaged_researchers, casual_researchers, post_inquiry |
| `audience_size` | INT | No | NULL | |
| `score_range` | NVARCHAR(20) | No | NULL | e.g., '13+', '6-12', '0-5' |
| `email_count` | INT | No | NULL | Number of emails in sequence |
| `cadence_description` | NVARCHAR(100) | No | NULL | e.g., 'Day 1/3/7/14' |
| `objective` | NVARCHAR(100) | No | NULL | e.g., 'Push to inquiry', 'Recover inquiry' |
| `status` | NVARCHAR(20) | Yes | 'missing' | CHECK: healthy, needs_work, missing, planned |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

---

### 9.2 email_performance

**Definition**: Email send-level performance metrics.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | BIGINT IDENTITY | PK | Auto | |
| `send_date` | DATE | Yes | | |
| `email_product` | NVARCHAR(50) | Yes | | CHECK: avblast, airmail, brokernet_daily, whats_new, breaking_news |
| `send_volume` | INT | Yes | 0 | |
| `delivered` | INT | No | NULL | |
| `opens` | INT | No | NULL | |
| `clicks` | INT | No | NULL | |
| `unsubscribes` | INT | No | NULL | |
| `bounces` | INT | No | NULL | |
| `spam_complaints` | INT | No | NULL | |
| `qi_attributed` | INT | No | 0 | Email-assisted QI |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

---

### 9.3 email_servers

**Definition**: Email server infrastructure health and deliverability.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `server_hostname` | NVARCHAR(100) | Yes | | UNIQUE |
| `purpose` | NVARCHAR(100) | Yes | | |
| `status` | NVARCHAR(20) | Yes | 'active' | CHECK: active, inactive, decommissioned |
| `spf_status` | NVARCHAR(10) | Yes | 'unknown' | CHECK: pass, fail, unknown, N/A |
| `dkim_status` | NVARCHAR(10) | Yes | 'unknown' | CHECK: pass, fail, unknown, N/A |
| `dmarc_status` | NVARCHAR(10) | Yes | 'unknown' | CHECK: pass, fail, unknown, N/A |
| `dmarc_policy` | NVARCHAR(20) | No | NULL | none, quarantine, reject |
| `risk_level` | NVARCHAR(10) | No | NULL | CHECK: low, moderate, high |
| `last_checked` | DATETIME2 | No | NULL | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Source:** `intel_health_email` seed shape.

---

## 10. GROUP J — REVENUE & BROKER TABLES (5 tables)

### 10.1 revenue_streams

**Definition**: Revenue breakdown by product stream.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `stream_name` | NVARCHAR(100) | Yes | | UNIQUE |
| `amount` | DECIMAL(12,2) | Yes | 0 | |
| `pct_of_total` | DECIMAL(5,2) | No | NULL | |
| `trend` | NVARCHAR(10) | No | NULL | CHECK: up, flat, down |
| `period` | NVARCHAR(20) | Yes | 'monthly' | |
| `confidence_level` | NVARCHAR(20) | Yes | 'POSSIBLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Seed values:** Aircraft Listings, Featured Placements, Display Advertising, BrokerNet Subscriptions, Sponsorships & Events, FBO/Airport Services

---

### 10.2 brokers

**Definition**: Broker/advertiser account master records.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `broker_name` | NVARCHAR(200) | Yes | | UNIQUE |
| `category_mix` | NVARCHAR(255) | No | NULL | e.g., 'Jets, Turboprop' |
| `tier` | NVARCHAR(20) | No | NULL | CHECK: Premium, Standard, Basic |
| `inquiry_volume_30d` | INT | No | NULL | |
| `inquiry_quality_score` | INT | No | NULL | Range 0-100 |
| `response_latency_hours` | DECIMAL(5,2) | No | NULL | |
| `listing_quality_score` | INT | No | NULL | Range 0-100 |
| `package_utilization_pct` | DECIMAL(5,2) | No | NULL | |
| `revenue_current` | DECIMAL(10,2) | No | NULL | |
| `revenue_prior` | DECIMAL(10,2) | No | NULL | |
| `revenue_trend` | NVARCHAR(10) | No | NULL | CHECK: up, flat, declining |
| `renewal_date` | DATE | No | NULL | |
| `health_score` | INT | No | NULL | Range 0-100 (computed composite) |
| `risk_score` | INT | No | NULL | Range 0-100 |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Source:** `intel_broker_health` + `intel_revenue_accounts` seed shapes merged.

---

### 10.3 broker_health_snapshots

**Definition**: Periodic broker health scoring for trend analysis.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | BIGINT IDENTITY | PK | Auto | |
| `broker_id` | INT | FK → brokers.id | | |
| `snapshot_date` | DATE | Yes | | |
| `listing_count` | INT | No | NULL | |
| `avg_quality` | INT | No | NULL | |
| `stale_ratio` | DECIMAL(5,4) | No | NULL | |
| `avg_cvr` | DECIMAL(5,2) | No | NULL | |
| `hidden_price_rate` | DECIMAL(5,4) | No | NULL | |
| `photo_deficiency_rate` | DECIMAL(5,4) | No | NULL | |
| `health_score` | INT | No | NULL | Range 0-100 |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

**UNIQUE:** (broker_id, snapshot_date)
**Source:** `intel_inventory_broker_health` seed shape.

---

### 10.4 broker_renewal_risk

**Definition**: Broker renewal risk assessment with predictive signals.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `broker_id` | INT | FK → brokers.id | | |
| `renewal_date` | DATE | No | NULL | |
| `inquiry_trend` | NVARCHAR(10) | No | NULL | CHECK: up, flat, declining |
| `visibility_trend` | NVARCHAR(10) | No | NULL | CHECK: up, flat, declining |
| `utilization_trend` | NVARCHAR(10) | No | NULL | CHECK: up, flat, declining |
| `risk_score` | INT | Yes | 0 | Range 0-100 |
| `primary_reason` | NVARCHAR(255) | No | NULL | |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Source:** `intel_broker_renewal_risk` seed shape.

---

### 10.5 advertiser_accounts

**Definition**: Advertiser account detail with revenue and risk tracking.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `broker_id` | INT | FK → brokers.id | NULL | |
| `advertiser_name` | NVARCHAR(200) | Yes | | |
| `tier` | NVARCHAR(20) | No | NULL | CHECK: Premium, Standard, Basic |
| `revenue_current` | DECIMAL(10,2) | No | NULL | |
| `revenue_prior` | DECIMAL(10,2) | No | NULL | |
| `renewal_date` | DATE | No | NULL | |
| `risk_score` | INT | No | NULL | Range 0-100 |
| `utilization_pct` | DECIMAL(5,2) | No | NULL | |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Source:** `intel_revenue_accounts` seed shape.

---

## 11. GROUP K — INVENTORY & MARKET TABLES (3 tables)

### 11.1 listings

**Definition**: Aircraft listing records from GlobalAir .NET API.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `listing_id` | NVARCHAR(20) | Yes | | UNIQUE — e.g., 'GA-2847' |
| `broker_id` | INT | FK → brokers.id | NULL | |
| `category` | NVARCHAR(30) | Yes | | piston, jet, turboprop, helicopter |
| `make_model` | NVARCHAR(200) | Yes | | |
| `photo_count` | INT | No | 0 | |
| `spec_completeness` | INT | No | NULL | Range 0-100 |
| `price_visible` | BIT | Yes | 0 | |
| `last_refresh` | DATE | No | NULL | |
| `quality_score` | INT | No | NULL | Range 0-100 |
| `detail_views_30d` | INT | No | 0 | |
| `inquiries_30d` | INT | No | 0 | |
| `status` | NVARCHAR(20) | Yes | 'active' | CHECK: active, sold, archived |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Computed:** `cvr_pct` = CASE WHEN detail_views_30d > 0 THEN (CAST(inquiries_30d AS FLOAT) / detail_views_30d) * 100 ELSE 0 END (PERSISTED)
**Source:** `intel_inventory_listings` seed shape.

---

### 11.2 market_demand_models

**Definition**: Model-level demand momentum and opportunity scoring.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `make` | NVARCHAR(50) | Yes | | |
| `model` | NVARCHAR(100) | Yes | | |
| `category` | NVARCHAR(30) | Yes | | |
| `demand_momentum` | INT | No | NULL | Range 0-100 |
| `inventory_count` | INT | No | NULL | |
| `avg_listing_quality` | INT | No | NULL | Range 0-100 |
| `imbalance_score` | DECIMAL(5,2) | No | NULL | demand_score / quality_inventory |
| `organic_rank_trend` | NVARCHAR(15) | No | NULL | CHECK: improving, stable, declining |
| `paid_cpc_trend` | NVARCHAR(15) | No | NULL | CHECK: rising, stable, falling |
| `opportunity_score` | INT | No | NULL | Range 0-100 |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

**UNIQUE:** (make, model)
**Source:** `intel_market_models` seed shape.

---

### 11.3 market_demand_categories

**Definition**: Category-level demand growth signals.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `category` | NVARCHAR(30) | Yes | | UNIQUE |
| `query_growth_pct` | DECIMAL(5,2) | No | NULL | |
| `ppc_growth_pct` | DECIMAL(5,2) | No | NULL | |
| `listing_view_growth_pct` | DECIMAL(5,2) | No | NULL | |
| `repeat_interest_growth_pct` | DECIMAL(5,2) | No | NULL | |
| `opportunity_state` | NVARCHAR(20) | No | NULL | CHECK: Accelerating, Expanding, Stable, Mixed, Contracting |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `data_source` | NVARCHAR(50) | Yes | 'seed' | |
| `source_freshness` | DATETIME2 | No | NULL | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Source:** `intel_market_categories` seed shape.

---

## 12. GROUP L — ALERT & NOTIFICATION TABLES (2 tables)

### 12.1 alert_rules

**Definition**: Configurable threshold rules for automated alert generation.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `rule_name` | NVARCHAR(100) | Yes | | UNIQUE |
| `metric_key` | NVARCHAR(50) | Yes | | References MetricsRegistry id |
| `operator` | NVARCHAR(10) | Yes | | CHECK: gt, lt, gte, lte, delta_gt, delta_lt |
| `threshold_value` | DECIMAL(12,4) | Yes | | |
| `severity` | NVARCHAR(10) | Yes | 'warning' | CHECK: info, warning, critical |
| `module` | NVARCHAR(30) | Yes | | Which page/module this rule applies to |
| `cooldown_hours` | INT | Yes | 24 | Min hours between repeat alerts for same rule |
| `notification_channel` | NVARCHAR(20) | No | NULL | CHECK: teams, email, both, none |
| `is_active` | BIT | Yes | 1 | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Example rules:**
- CPQI > $300 any active campaign → WARNING
- QI volume < 100 in 30d → CRITICAL
- Impression share drop > 5% WoW → WARNING
- Any connector stale > 48h → WARNING
- Confidence score < 50% → CRITICAL
- Broker renewal risk > 60 → WARNING

---

### 12.2 alerts

**Definition**: Generated alert instances.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `rule_id` | INT | FK → alert_rules.id | NULL | NULL for manually created alerts |
| `alert_type` | NVARCHAR(30) | Yes | | winner, loser, integrity, sla_breach, contamination, connector_failure, risk |
| `severity` | NVARCHAR(10) | Yes | 'info' | CHECK: info, warning, critical |
| `module` | NVARCHAR(30) | Yes | | dashboard, ga4, organic, cadence, ppc, seo, email, social, events, content, health |
| `title` | NVARCHAR(255) | Yes | | |
| `description` | NVARCHAR(MAX) | No | NULL | |
| `related_entity_type` | NVARCHAR(50) | No | NULL | |
| `related_entity_id` | NVARCHAR(50) | No | NULL | |
| `is_resolved` | BIT | Yes | 0 | |
| `resolved_by` | NVARCHAR(100) | No | NULL | |
| `resolved_at` | DATETIME2 | No | NULL | |
| `resolution_notes` | NVARCHAR(MAX) | No | NULL | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |

**Lifecycle:** Created (unresolved) → Acknowledged → Resolved (operator with notes). Unresolved critical/warning alerts surface in Dashboard action queue.

---

## 13. GROUP M — EXECUTION TABLE (1 table)

### 13.1 execution_items

**Definition**: Execution cadence items — constraints, blockers, initiatives, quarterly priorities.

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `id` | INT IDENTITY | PK | Auto | |
| `item_type` | NVARCHAR(20) | Yes | | CHECK: constraint, blocker, initiative, quarterly_priority |
| `title` | NVARCHAR(255) | Yes | | |
| `description` | NVARCHAR(MAX) | No | NULL | |
| `status` | NVARCHAR(20) | Yes | 'open' | CHECK: open, in_progress, resolved, deferred, blocked |
| `severity` | NVARCHAR(10) | No | NULL | CHECK: info, warning, critical |
| `priority_score` | INT | No | NULL | Range 0-100 |
| `priority_label` | NVARCHAR(10) | No | NULL | CHECK: now, next, later |
| `quarter` | NVARCHAR(10) | No | NULL | e.g., 'Q2-2026' |
| `owner_name` | NVARCHAR(100) | No | NULL | |
| `dependencies` | NVARCHAR(500) | No | NULL | |
| `expected_lift` | NVARCHAR(100) | No | NULL | |
| `time_to_impact` | NVARCHAR(50) | No | NULL | |
| `scale_safety` | NVARCHAR(30) | No | NULL | CHECK: scale, controlled_launch, refine, proposal, blocked |
| `confidence_level` | NVARCHAR(20) | Yes | 'PROBABLE' | |
| `created_at` | DATETIME2 | Yes | GETUTCDATE() | |
| `updated_at` | DATETIME2 | Yes | GETUTCDATE() | |
| `resolved_at` | DATETIME2 | No | NULL | |

---

## 14. COMPUTED METRICS REGISTRY

Ported from metrics-registry.js. These metrics are computed at the API layer, not stored as raw columns.

| Metric ID | Name | Formula | Sources | Unit | Confidence Rule |
|-----------|------|---------|---------|------|-----------------|
| qi | Qualified Inquiries | Form Submissions + Qualified Phone Calls (>=90s) | GA4 + CallRail | count | MIN(ga4, callrail) |
| cpqi | Cost Per QI | Total Spend / QI | Google Ads + GA4 | currency | PROBABLE (weighted) |
| arpa | Avg Revenue Per Account | Total Revenue / Active Accounts | Billing/CRM | currency | POSSIBLE until CRM live |
| engagement_rate_clean | Clean Engagement Rate | Engaged Sessions (excl Email_Open_) / Total Sessions (excl Email_Open_) | GA4 filtered | percent | PROBABLE |
| ctr | Click-Through Rate | Clicks / Impressions * 100 | GSC or Google Ads | percent | Source-dependent |
| avg_position | Average Position | Sum Positions / Query Count | GSC | number | CONFIRMED |
| impression_share | Impression Share | Impressions / Eligible Impressions * 100 | Google Ads | percent | PROBABLE |
| sov | Share of Voice | (Organic + Paid Impressions) / Total Market | GSC + Ads + SEMrush | percent | POSSIBLE |
| revenue | Total Revenue | Sum of all revenue streams | Billing/CRM | currency | POSSIBLE until CRM |
| sessions | Sessions | GA4 session count (filtered) | GA4 | count | PROBABLE |
| bounce_rate | Bounce Rate | Non-Engaged / Total Sessions * 100 | GA4 | percent | PROBABLE |
| conversion_rate | Conversion Rate | QI / Sessions * 100 | GA4 + Ads | percent | PROBABLE |
| retention_rate | Advertiser Retention Rate | Retained / Up for Renewal | Billing/CRM | percent | POSSIBLE |
| revenue_per_qi | Revenue Per QI | Revenue / QI | Billing/CRM + GA4 | currency | POSSIBLE |
| broker_health_score | Broker Health Score | weighted(inquiry, response, listing, revenue, renewal) | CRM + Listing DB | score 0-100 | PROBABLE |
| renewal_risk_score | Renewal Risk Score | weighted(inquiry_decline, visibility_loss, utilization, proximity) | CRM + Billing | score 0-100 | PROBABLE |
| listing_quality_score | Listing Quality Score | weighted(photos, specs, price, freshness, media) | Listing DB | score 0-100 | PROBABLE |
| demand_momentum | Demand Momentum | weighted(query_growth, ppc_growth, view_growth, repeat_growth) | GSC + Ads + GA4 | score 0-100 | PROBABLE |
| search_term_waste | Search Term Waste Rate | irrelevant_spend / total_spend | Google Ads | percent | PROBABLE |
| category_defensibility | Category Defensibility | weighted(rank, CPC, content, listing, audience) | GSC + Ads + SEMrush | score 0-100 | PROBABLE |
| content_assist_rate | Content Assist Rate | content_assisted_qis / total_qis | GA4 Attribution | percent | PROBABLE |
| decision_confidence_pct | Decision Confidence % | confirmed_kpis / total_rendered_kpis | Confidence Model | percent | CONFIRMED (meta) |
| friction_score | Friction Score | normalized(dropoff + speed + low_cta + return_to_search) | GA4 + Clarity | score 0-100 | POSSIBLE |

---

## 15. DATA HEALTH — AI CRAWLER ACCESS

Stored as configuration records in data_sources, but rendered separately on Page 07.

| Crawler | Status | Owner | Ticket | Priority |
|---------|--------|-------|--------|----------|
| GPTBot | blocked | Thomas Galla | CR-4471 | High |
| PerplexityBot | blocked | Thomas Galla | CR-4471 | High |
| ClaudeBot | blocked | Thomas Galla | CR-4471 | Medium-High |
| Google-Extended | blocked | Thomas Galla | CR-4471 | High |
| CCBot | blocked | Thomas Galla | CR-4471 | Medium |
| YouBot | blocked | Thomas Galla | CR-4471 | Medium |

**Source:** `intel_health_crawlers` seed shape.

---

## 16. ROLE-BASED DATA PROJECTION

Ported from role-filter.js. Enforced server-side in API responses.

| Role | Enum | Confidence Levels Visible | CRUD | Board-Safe | Notes |
|------|------|--------------------------|------|------------|-------|
| Operator | operator | CONFIRMED + PROBABLE + POSSIBLE | Full | No | Casey — sees everything |
| Editor | editor | CONFIRMED + PROBABLE | Read-only | No | Clay — no POSSIBLE data |
| Viewer | viewer | CONFIRMED only | Read-only | Yes | Jeffrey — board-safe rendering |

**Jeffrey-safe rendering rules:**
- Suppress all PROBABLE and POSSIBLE KPIs
- Hide opportunity signals with confidence < CONFIRMED
- Hide modeled metrics (Tier 3 events)
- Suppress contamination-affected engagement metrics
- Show only decision-safe data sources

---

## 17. KEY RELATIONSHIPS

```
users (1) ──→ (many) user_preferences
users (1) ──→ (many) opportunities [via owner_user_id]

data_sources (1) ──→ (many) ingestion_logs [via source_id]

brokers (1) ──→ (many) listings [via broker_id]
brokers (1) ──→ (many) broker_health_snapshots [via broker_id]
brokers (1) ──→ (many) broker_renewal_risk [via broker_id]
brokers (1) ──→ (many) advertiser_accounts [via broker_id]

content_pillars (1) ──→ (many) content_articles [via pillar_id]
content_articles (1) ──→ (many) content_refresh_queue [via article_id]

alert_rules (1) ──→ (many) alerts [via rule_id]
opportunities (1) ──→ (many) opportunity_signals [via opportunity_id]
```

---

## 18. ENUM REFERENCE

| Enum | Values |
|------|--------|
| confidence_level | CONFIRMED, PROBABLE, POSSIBLE |
| data_source | windsor_live, api_direct, csv_upload, manual, calculated, seed |
| user_role | operator, editor, viewer |
| role_view | casey, clay, jeffrey |
| date_range | 7d, 14d, 30d, 90d, ytd |
| compare_mode | wow, mom, qoq, yoy |
| category | piston, jet, turboprop, helicopter, fbo, content, other, all |
| trend | up, flat, down, declining, rising, stable, falling, improving |
| priority_label | now, next, later |
| severity | info, warning, critical |
| scale_safety | scale, optimize_carefully, diagnostic_only, blocked |
| opportunity_status | open, in_progress, resolved, deferred |
| campaign_status | Active, Paused, On Hold, Removed |
| connection_status | connected, pending, not_connected, error, unmaintained |
| ingestion_status | running, success, partial, failed |
| trigger_type | scheduled, manual, webhook |
| alert_type | winner, loser, integrity, sla_breach, contamination, connector_failure, risk |
| content_pillar_type | evergreen, news |
| hub_status | live_strong, live_moderate, live_thin, planned, not_started |
| email_sequence_status | healthy, needs_work, missing, planned |
| email_product | avblast, airmail, brokernet_daily, whats_new, breaking_news |
| auth_status | pass, fail, unknown, N/A |
| search_term_action | Add Negative, Monitor, Keep |
| execution_item_type | constraint, blocker, initiative, quarterly_priority |
| cpc_pressure | Low, Medium, High |
| opportunity_state | Accelerating, Expanding, Stable, Mixed, Contracting |
| contamination_status | ACTIVE, RESOLVED, UNKNOWN |
| conversion_signal | CONFIRMED, UNCONFIRMED |

---

*Location: 12_TECH_STACK_AND_AI/AvINTELOS/docs/DATA_MODEL.md*
