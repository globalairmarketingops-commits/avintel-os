-- ============================================================================
-- Av/IntelOS — Azure SQL Schema v1.0
-- GlobalAir.com Intelligence, Measurement, and Growth Command System
-- ============================================================================
-- Eleven Modules:
--   01. Intelligence Dashboard — cross-domain KPIs, opportunities, leakage
--   02. GA4 Analytics Hub — channels, landing pages, events, contamination
--   03. Organic Intelligence — GSC queries, pages, portfolio, competitive SERP
--   04. Execution Cadence — constraints, blockers, initiatives, priorities
--   05. PPC Intelligence — campaigns, search terms, waste, auction insights
--   5A. SEO Playbook — plays, model hubs, category matrix
--   5B. Email Lifecycle — sequences, scoring, deliverability
--   5C. Social Authority — platform mix, broker spotlights
--   5D. Event Revenue — revenue products, partnerships, content capture
--   06. Content & Channel — articles, pillars, refresh queue
--   07. Data Health — sources, ingestion, alerts, crawler access
-- ============================================================================
-- Database: AvIntelOS | Compatibility: Azure SQL / SQL Server 2019+
-- Schema: dbo | Collation: SQL_Latin1_General_CP1_CI_AS
-- ============================================================================

SET COMPATIBILITY_LEVEL = 150; -- SQL Server 2019

-- ============================================================================
-- GROUP A: SYSTEM TABLES
-- ============================================================================

-- Users: Entra ID-linked accounts with role-based access
CREATE TABLE [dbo].[users] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [entra_id] NVARCHAR(128) NOT NULL UNIQUE,
    [display_name] NVARCHAR(100) NOT NULL,
    [email] NVARCHAR(255) NOT NULL UNIQUE,
    [role] NVARCHAR(20) NOT NULL DEFAULT 'viewer'
        CONSTRAINT [ck_users_role] CHECK ([role] IN ('operator', 'editor', 'viewer')),
    [is_active] BIT NOT NULL DEFAULT 1,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
-- MODULE: System | operator=Casey, editor=Clay, viewer=Jeffrey
CREATE NONCLUSTERED INDEX [idx_users_active] ON [dbo].[users]([is_active], [role]);


-- User Preferences: saved view state per user
CREATE TABLE [dbo].[user_preferences] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [user_id] INT NOT NULL CONSTRAINT [fk_prefs_user] REFERENCES [dbo].[users]([id]) ON DELETE CASCADE,
    [current_role_view] NVARCHAR(20) NOT NULL DEFAULT 'casey'
        CONSTRAINT [ck_prefs_role_view] CHECK ([current_role_view] IN ('casey', 'clay', 'jeffrey')),
    [date_range] NVARCHAR(10) NOT NULL DEFAULT '30d'
        CONSTRAINT [ck_prefs_date_range] CHECK ([date_range] IN ('7d', '14d', '30d', '90d', 'ytd')),
    [compare_mode] NVARCHAR(10) NOT NULL DEFAULT 'wow'
        CONSTRAINT [ck_prefs_compare] CHECK ([compare_mode] IN ('wow', 'mom', 'qoq', 'yoy')),
    [category_filter] NVARCHAR(20) NOT NULL DEFAULT 'all'
        CONSTRAINT [ck_prefs_category] CHECK ([category_filter] IN ('all', 'piston', 'jet', 'turboprop', 'helicopter')),
    [signal_clean_only] BIT NOT NULL DEFAULT 1,
    [contam_banner_visible] BIT NOT NULL DEFAULT 1,
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE UNIQUE NONCLUSTERED INDEX [idx_prefs_user] ON [dbo].[user_preferences]([user_id]);


-- Data Sources: external connector registry
CREATE TABLE [dbo].[data_sources] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [source_key] NVARCHAR(50) NOT NULL UNIQUE,
    [display_name] NVARCHAR(100) NOT NULL,
    [connection_status] NVARCHAR(20) NOT NULL DEFAULT 'not_connected'
        CONSTRAINT [ck_sources_status] CHECK ([connection_status] IN ('connected', 'pending', 'not_connected', 'error', 'unmaintained')),
    [sla_hours] INT NULL,
    [last_successful_sync] DATETIME2(7) NULL,
    [last_sync_attempt] DATETIME2(7) NULL,
    [last_error] NVARCHAR(500) NULL,
    [records_last_sync] INT NULL,
    [owner] NVARCHAR(100) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
-- MODULE: Data Health (07) | Trust-control layer for all other modules
CREATE NONCLUSTERED INDEX [idx_sources_status] ON [dbo].[data_sources]([connection_status]);


-- Ingestion Logs: pipeline run history
CREATE TABLE [dbo].[ingestion_logs] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [source_id] INT NOT NULL CONSTRAINT [fk_ingestion_source] REFERENCES [dbo].[data_sources]([id]),
    [started_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    [completed_at] DATETIME2(7) NULL,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'running'
        CONSTRAINT [ck_ingestion_status] CHECK ([status] IN ('running', 'success', 'partial', 'failed')),
    [records_processed] INT NOT NULL DEFAULT 0,
    [records_inserted] INT NOT NULL DEFAULT 0,
    [records_updated] INT NOT NULL DEFAULT 0,
    [records_skipped] INT NOT NULL DEFAULT 0,
    [error_message] NVARCHAR(MAX) NULL,
    [trigger_type] NVARCHAR(20) NOT NULL DEFAULT 'scheduled'
        CONSTRAINT [ck_ingestion_trigger] CHECK ([trigger_type] IN ('scheduled', 'manual', 'webhook')),
    [function_name] NVARCHAR(100) NULL,
    [duration_ms] INT NULL
);
-- MODULE: Data Health (07)
CREATE NONCLUSTERED INDEX [idx_ingestion_source_date] ON [dbo].[ingestion_logs]([source_id], [started_at] DESC);


-- System Health: infrastructure checks
CREATE TABLE [dbo].[system_health] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [check_type] NVARCHAR(50) NOT NULL,
    [check_name] NVARCHAR(100) NOT NULL,
    [status] NVARCHAR(20) NOT NULL
        CONSTRAINT [ck_health_status] CHECK ([status] IN ('healthy', 'degraded', 'down')),
    [latency_ms] INT NULL,
    [details] NVARCHAR(500) NULL,
    [last_checked] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE NONCLUSTERED INDEX [idx_health_status] ON [dbo].[system_health]([status]);


-- ============================================================================
-- GROUP B: GA4 / ANALYTICS TABLES
-- ============================================================================

-- GA4 Channel Snapshots: daily channel-level metrics
CREATE TABLE [dbo].[ga4_channel_snapshots] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [snapshot_date] DATE NOT NULL,
    [channel] NVARCHAR(50) NOT NULL,
    [sessions] INT NOT NULL DEFAULT 0,
    [users] INT NOT NULL DEFAULT 0,
    [engagement_rate] DECIMAL(5,2) NULL,
    [conversions] INT NOT NULL DEFAULT 0,
    [revenue] DECIMAL(12,2) NOT NULL DEFAULT 0,
    [bounce_rate] DECIMAL(5,2) NULL,
    [avg_session_duration] DECIMAL(8,2) NULL,
    [qi_per_100_sessions] AS (CASE WHEN [sessions] > 0 THEN (CAST([conversions] AS FLOAT) / [sessions]) * 100 ELSE 0 END) PERSISTED,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'POSSIBLE'
        CONSTRAINT [ck_ga4chan_conf] CHECK ([confidence_level] IN ('CONFIRMED', 'PROBABLE', 'POSSIBLE')),
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed'
        CONSTRAINT [ck_ga4chan_src] CHECK ([data_source] IN ('windsor_live', 'api_direct', 'csv_upload', 'manual', 'calculated', 'seed')),
    [source_freshness] DATETIME2(7) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
-- MODULE: GA4 Analytics Hub (02)
CREATE UNIQUE NONCLUSTERED INDEX [idx_ga4chan_date_channel] ON [dbo].[ga4_channel_snapshots]([snapshot_date], [channel]);


-- GA4 Landing Pages: daily landing page metrics
CREATE TABLE [dbo].[ga4_landing_pages] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [snapshot_date] DATE NOT NULL,
    [page_path] NVARCHAR(500) NOT NULL,
    [sessions] INT NOT NULL DEFAULT 0,
    [bounce_rate] DECIMAL(5,2) NULL,
    [avg_time_seconds] DECIMAL(8,2) NULL,
    [conversions] INT NOT NULL DEFAULT 0,
    [category] NVARCHAR(30) NULL
        CONSTRAINT [ck_ga4lp_cat] CHECK ([category] IN ('piston', 'jet', 'turboprop', 'helicopter', 'fbo', 'content', 'other')),
    [impressions] INT NULL,
    [ctr] DECIMAL(5,2) NULL,
    [cvr_pct] AS (CASE WHEN [sessions] > 0 THEN (CAST([conversions] AS FLOAT) / [sessions]) * 100 ELSE 0 END) PERSISTED,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'POSSIBLE'
        CONSTRAINT [ck_ga4lp_conf] CHECK ([confidence_level] IN ('CONFIRMED', 'PROBABLE', 'POSSIBLE')),
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed'
        CONSTRAINT [ck_ga4lp_src] CHECK ([data_source] IN ('windsor_live', 'api_direct', 'csv_upload', 'manual', 'calculated', 'seed')),
    [source_freshness] DATETIME2(7) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE UNIQUE NONCLUSTERED INDEX [idx_ga4lp_date_page] ON [dbo].[ga4_landing_pages]([snapshot_date], [page_path]);
CREATE NONCLUSTERED INDEX [idx_ga4lp_category] ON [dbo].[ga4_landing_pages]([category], [snapshot_date]);


-- GA4 Events: event-level data with contamination flag
CREATE TABLE [dbo].[ga4_events] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [snapshot_date] DATE NOT NULL,
    [event_name] NVARCHAR(100) NOT NULL,
    [event_count] INT NOT NULL DEFAULT 0,
    [tier] TINYINT NULL
        CONSTRAINT [ck_ga4evt_tier] CHECK ([tier] IN (1, 2, 3)),
    [is_contaminated] BIT NOT NULL DEFAULT 0,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'POSSIBLE'
        CONSTRAINT [ck_ga4evt_conf] CHECK ([confidence_level] IN ('CONFIRMED', 'PROBABLE', 'POSSIBLE')),
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
-- MODULE: GA4 Analytics Hub (02) | Tier 1=validated, 2=probable, 3=modeled
CREATE NONCLUSTERED INDEX [idx_ga4evt_date] ON [dbo].[ga4_events]([snapshot_date], [is_contaminated]);


-- GA4 Property Health: configuration and contamination status
CREATE TABLE [dbo].[ga4_property_health] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [property_id] NVARCHAR(20) NOT NULL,
    [contamination_status] NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CONSTRAINT [ck_ga4prop_contam] CHECK ([contamination_status] IN ('ACTIVE', 'RESOLVED', 'UNKNOWN')),
    [contamination_start] DATE NULL DEFAULT '2023-06-01',
    [real_engagement_rate] DECIMAL(5,2) NULL DEFAULT 69.0,
    [reported_engagement_rate] DECIMAL(5,2) NULL DEFAULT 17.0,
    [enhanced_conversions] NVARCHAR(20) NOT NULL DEFAULT 'UNCONFIRMED'
        CONSTRAINT [ck_ga4prop_ec] CHECK ([enhanced_conversions] IN ('CONFIRMED', 'UNCONFIRMED', 'NOT_ACTIVE')),
    [conversion_signal] NVARCHAR(20) NOT NULL DEFAULT 'UNCONFIRMED'
        CONSTRAINT [ck_ga4prop_conv] CHECK ([conversion_signal] IN ('CONFIRMED', 'UNCONFIRMED')),
    [gtm_server_count] INT NULL DEFAULT 8,
    [gtm_deployment_status] NVARCHAR(20) NULL DEFAULT 'INCONSISTENT'
        CONSTRAINT [ck_ga4prop_gtm] CHECK ([gtm_deployment_status] IN ('CONSISTENT', 'INCONSISTENT', 'UNKNOWN')),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);


-- GA4 Contamination Exclusions: event patterns to filter
CREATE TABLE [dbo].[ga4_contamination_exclusions] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [pattern] NVARCHAR(100) NOT NULL,
    [reason] NVARCHAR(255) NOT NULL,
    [added_date] DATE NOT NULL DEFAULT CAST(SYSUTCDATETIME() AS DATE),
    [is_active] BIT NOT NULL DEFAULT 1
);


-- ============================================================================
-- GROUP C: SEARCH CONSOLE TABLES
-- ============================================================================

-- GSC Query Snapshots: daily query-level search data
CREATE TABLE [dbo].[gsc_query_snapshots] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [snapshot_date] DATE NOT NULL,
    [query] NVARCHAR(500) NOT NULL,
    [clicks] INT NOT NULL DEFAULT 0,
    [impressions] INT NOT NULL DEFAULT 0,
    [avg_position] DECIMAL(5,2) NULL,
    [category] NVARCHAR(30) NULL,
    [ctr_pct] AS (CASE WHEN [impressions] > 0 THEN (CAST([clicks] AS FLOAT) / [impressions]) * 100 ELSE 0 END) PERSISTED,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'CONFIRMED'
        CONSTRAINT [ck_gscq_conf] CHECK ([confidence_level] IN ('CONFIRMED', 'PROBABLE', 'POSSIBLE')),
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'api_direct',
    [source_freshness] DATETIME2(7) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
-- MODULE: Organic Intelligence (03)
CREATE NONCLUSTERED INDEX [idx_gscq_date] ON [dbo].[gsc_query_snapshots]([snapshot_date]);
CREATE NONCLUSTERED INDEX [idx_gscq_category] ON [dbo].[gsc_query_snapshots]([category], [snapshot_date]);


-- GSC Page Snapshots: daily page-level search data
CREATE TABLE [dbo].[gsc_page_snapshots] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [snapshot_date] DATE NOT NULL,
    [page_url] NVARCHAR(500) NOT NULL,
    [clicks] INT NOT NULL DEFAULT 0,
    [impressions] INT NOT NULL DEFAULT 0,
    [avg_position] DECIMAL(5,2) NULL,
    [category] NVARCHAR(30) NULL,
    [ctr_pct] AS (CASE WHEN [impressions] > 0 THEN (CAST([clicks] AS FLOAT) / [impressions]) * 100 ELSE 0 END) PERSISTED,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'api_direct',
    [source_freshness] DATETIME2(7) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE UNIQUE NONCLUSTERED INDEX [idx_gscp_date_page] ON [dbo].[gsc_page_snapshots]([snapshot_date], [page_url]);


-- GSC Portfolio Summary: daily aggregate search metrics
CREATE TABLE [dbo].[gsc_portfolio_summary] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [snapshot_date] DATE NOT NULL UNIQUE,
    [total_keywords] INT NOT NULL DEFAULT 0,
    [monthly_clicks] INT NOT NULL DEFAULT 0,
    [avg_position] DECIMAL(5,2) NULL,
    [avg_ctr] DECIMAL(5,2) NULL,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'api_direct',
    [source_freshness] DATETIME2(7) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);


-- ============================================================================
-- GROUP D: GOOGLE ADS TABLES
-- ============================================================================

-- Ads Campaign Snapshots: daily campaign metrics
CREATE TABLE [dbo].[ads_campaign_snapshots] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [snapshot_date] DATE NOT NULL,
    [campaign_name] NVARCHAR(200) NOT NULL,
    [spend] DECIMAL(10,2) NOT NULL DEFAULT 0,
    [clicks] INT NOT NULL DEFAULT 0,
    [impressions] INT NOT NULL DEFAULT 0,
    [conversions] INT NOT NULL DEFAULT 0,
    [campaign_status] NVARCHAR(20) NOT NULL DEFAULT 'Active'
        CONSTRAINT [ck_adscmp_status] CHECK ([campaign_status] IN ('Active', 'Paused', 'On Hold', 'Removed')),
    [category] NVARCHAR(30) NULL,
    [impression_share] DECIMAL(5,2) NULL,
    [search_is_lost_budget] DECIMAL(5,2) NULL,
    [search_is_lost_rank] DECIMAL(5,2) NULL,
    [ctr_pct] AS (CASE WHEN [impressions] > 0 THEN (CAST([clicks] AS FLOAT) / [impressions]) * 100 ELSE 0 END) PERSISTED,
    [cpqi] AS (CASE WHEN [conversions] > 0 THEN [spend] / [conversions] ELSE 0 END) PERSISTED,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE'
        CONSTRAINT [ck_adscmp_conf] CHECK ([confidence_level] IN ('CONFIRMED', 'PROBABLE', 'POSSIBLE')),
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [source_freshness] DATETIME2(7) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
-- MODULE: PPC Intelligence (05)
CREATE UNIQUE NONCLUSTERED INDEX [idx_adscmp_date_name] ON [dbo].[ads_campaign_snapshots]([snapshot_date], [campaign_name]);
CREATE NONCLUSTERED INDEX [idx_adscmp_category] ON [dbo].[ads_campaign_snapshots]([category], [snapshot_date]);


-- Ads Ad Group Snapshots: daily ad group detail
CREATE TABLE [dbo].[ads_adgroup_snapshots] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [snapshot_date] DATE NOT NULL,
    [campaign_name] NVARCHAR(200) NOT NULL,
    [adgroup_name] NVARCHAR(200) NOT NULL,
    [spend] DECIMAL(10,2) NOT NULL DEFAULT 0,
    [clicks] INT NOT NULL DEFAULT 0,
    [impressions] INT NOT NULL DEFAULT 0,
    [conversions] INT NOT NULL DEFAULT 0,
    [ctr_pct] AS (CASE WHEN [impressions] > 0 THEN (CAST([clicks] AS FLOAT) / [impressions]) * 100 ELSE 0 END) PERSISTED,
    [cpqi] AS (CASE WHEN [conversions] > 0 THEN [spend] / [conversions] ELSE 0 END) PERSISTED,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [source_freshness] DATETIME2(7) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE NONCLUSTERED INDEX [idx_adsag_date] ON [dbo].[ads_adgroup_snapshots]([snapshot_date]);


-- Ads Search Terms: search term report with waste classification
CREATE TABLE [dbo].[ads_search_terms] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [snapshot_date] DATE NOT NULL,
    [search_term] NVARCHAR(500) NOT NULL,
    [campaign_name] NVARCHAR(200) NULL,
    [impressions] INT NOT NULL DEFAULT 0,
    [clicks] INT NOT NULL DEFAULT 0,
    [spend] DECIMAL(10,2) NOT NULL DEFAULT 0,
    [conversions] INT NOT NULL DEFAULT 0,
    [waste_reason] NVARCHAR(200) NULL,
    [action] NVARCHAR(20) NULL
        CONSTRAINT [ck_adsst_action] CHECK ([action] IN ('Add Negative', 'Monitor', 'Keep')),
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
-- MODULE: PPC Intelligence (05)
CREATE NONCLUSTERED INDEX [idx_adsst_date] ON [dbo].[ads_search_terms]([snapshot_date]);


-- Ads Auction Insights: weekly competitive data
CREATE TABLE [dbo].[ads_auction_insights] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [week_start] DATE NOT NULL,
    [competitor] NVARCHAR(100) NOT NULL DEFAULT 'Controller.com',
    [impression_share] DECIMAL(5,2) NULL,
    [overlap_rate] DECIMAL(5,2) NULL,
    [position_above_rate] DECIMAL(5,2) NULL,
    [outranking_share] DECIMAL(5,2) NULL,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [source_freshness] DATETIME2(7) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE UNIQUE NONCLUSTERED INDEX [idx_adsai_week_comp] ON [dbo].[ads_auction_insights]([week_start], [competitor]);


-- ============================================================================
-- GROUP E: OPPORTUNITY & INTELLIGENCE TABLES
-- ============================================================================

-- Opportunities: scored cross-domain opportunity signals
CREATE TABLE [dbo].[opportunities] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [domain] NVARCHAR(30) NOT NULL
        CONSTRAINT [ck_opp_domain] CHECK ([domain] IN ('seo', 'ppc', 'revenue', 'broker', 'inventory', 'content', 'competitive', 'measurement', 'email', 'social', 'event')),
    [title] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX) NULL,
    [priority_score] INT NOT NULL DEFAULT 50,
    [expected_lift] NVARCHAR(100) NULL,
    [time_to_impact] NVARCHAR(50) NULL,
    [owner_user_id] INT NULL CONSTRAINT [fk_opp_owner] REFERENCES [dbo].[users]([id]),
    [owner_name] NVARCHAR(100) NULL,
    [blocker] NVARCHAR(255) NULL,
    [dependencies] NVARCHAR(500) NULL,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'open'
        CONSTRAINT [ck_opp_status] CHECK ([status] IN ('open', 'in_progress', 'resolved', 'deferred')),
    [priority_label] NVARCHAR(10) NOT NULL DEFAULT 'next'
        CONSTRAINT [ck_opp_priority] CHECK ([priority_label] IN ('now', 'next', 'later')),
    [scale_safety] NVARCHAR(30) NULL
        CONSTRAINT [ck_opp_scale] CHECK ([scale_safety] IN ('scale', 'optimize_carefully', 'diagnostic_only', 'blocked')),
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'POSSIBLE'
        CONSTRAINT [ck_opp_conf] CHECK ([confidence_level] IN ('CONFIRMED', 'PROBABLE', 'POSSIBLE')),
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    [resolved_at] DATETIME2(7) NULL
);
-- MODULE: Intelligence Dashboard (01)
CREATE NONCLUSTERED INDEX [idx_opp_status_priority] ON [dbo].[opportunities]([status], [priority_score] DESC);
CREATE NONCLUSTERED INDEX [idx_opp_domain] ON [dbo].[opportunities]([domain], [status]);


-- Opportunity Signals: individual data signals feeding scoring
CREATE TABLE [dbo].[opportunity_signals] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [opportunity_id] INT NOT NULL CONSTRAINT [fk_oppsig_opp] REFERENCES [dbo].[opportunities]([id]) ON DELETE CASCADE,
    [signal_type] NVARCHAR(50) NOT NULL,
    [signal_value] DECIMAL(12,4) NULL,
    [signal_label] NVARCHAR(255) NULL,
    [detected_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'POSSIBLE'
);
CREATE NONCLUSTERED INDEX [idx_oppsig_opp] ON [dbo].[opportunity_signals]([opportunity_id]);


-- Competitive Benchmarks: category defensibility scores
CREATE TABLE [dbo].[competitive_benchmarks] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [category] NVARCHAR(50) NOT NULL UNIQUE,
    [defensibility_score] INT NOT NULL DEFAULT 50,
    [rank_stability] DECIMAL(5,2) NULL,
    [cpc_pressure] NVARCHAR(10) NULL
        CONSTRAINT [ck_compbm_cpc] CHECK ([cpc_pressure] IN ('Low', 'Medium', 'High')),
    [content_depth] INT NULL,
    [listing_depth] INT NULL,
    [repeat_audience_pct] DECIMAL(5,2) NULL,
    [trend] NVARCHAR(10) NULL
        CONSTRAINT [ck_compbm_trend] CHECK ([trend] IN ('rising', 'stable', 'falling')),
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [source_freshness] DATETIME2(7) NULL,
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);


-- Competitive Features: GlobalAir vs Controller comparison
CREATE TABLE [dbo].[competitive_features] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [feature_name] NVARCHAR(100) NOT NULL UNIQUE,
    [globalair_has] BIT NOT NULL DEFAULT 0,
    [controller_has] BIT NOT NULL DEFAULT 0,
    [advantage] NVARCHAR(20) NOT NULL DEFAULT 'none'
        CONSTRAINT [ck_compft_adv] CHECK ([advantage] IN ('globalair', 'controller', 'none')),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);


-- ============================================================================
-- GROUP F: CONTENT & CHANNEL TABLES
-- ============================================================================

-- Content Pillars: strategy definitions
CREATE TABLE [dbo].[content_pillars] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [pillar_name] NVARCHAR(100) NOT NULL UNIQUE,
    [target_mix_pct] DECIMAL(5,2) NULL,
    [pillar_type] NVARCHAR(20) NOT NULL DEFAULT 'evergreen'
        CONSTRAINT [ck_pillar_type] CHECK ([pillar_type] IN ('evergreen', 'news')),
    [is_active] BIT NOT NULL DEFAULT 1,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);


-- Content Articles: article-level performance
CREATE TABLE [dbo].[content_articles] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [title] NVARCHAR(255) NOT NULL,
    [url_path] NVARCHAR(500) NOT NULL UNIQUE,
    [pillar_id] INT NULL CONSTRAINT [fk_article_pillar] REFERENCES [dbo].[content_pillars]([id]),
    [category] NVARCHAR(30) NULL,
    [publish_date] DATE NULL,
    [last_refresh_date] DATE NULL,
    [sessions_30d] INT NOT NULL DEFAULT 0,
    [engagement_rate] DECIMAL(5,2) NULL,
    [conversions_30d] INT NOT NULL DEFAULT 0,
    [bounce_rate] DECIMAL(5,2) NULL,
    [has_cta_module] BIT NOT NULL DEFAULT 0,
    [cta_ctr] DECIMAL(5,2) NULL,
    [refresh_priority] NVARCHAR(10) NULL
        CONSTRAINT [ck_article_refpri] CHECK ([refresh_priority] IN ('high', 'medium', 'low')),
    [expected_lift_from_refresh] NVARCHAR(50) NULL,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [source_freshness] DATETIME2(7) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
-- MODULE: Content & Channel (06)
CREATE NONCLUSTERED INDEX [idx_article_pillar] ON [dbo].[content_articles]([pillar_id]);


-- Content Refresh Queue: articles flagged for update
CREATE TABLE [dbo].[content_refresh_queue] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [article_id] INT NOT NULL CONSTRAINT [fk_refresh_article] REFERENCES [dbo].[content_articles]([id]) ON DELETE CASCADE,
    [reason] NVARCHAR(255) NOT NULL,
    [months_since_update] INT NULL,
    [expected_lift_pct] DECIMAL(5,2) NULL,
    [refresh_actions] NVARCHAR(500) NULL,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'queued'
        CONSTRAINT [ck_refresh_status] CHECK ([status] IN ('queued', 'in_progress', 'completed')),
    [owner_name] NVARCHAR(100) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    [completed_at] DATETIME2(7) NULL
);


-- ============================================================================
-- GROUP G: SEO TABLES
-- ============================================================================

-- SEO Plays: strategic plays with scoring
CREATE TABLE [dbo].[seo_plays] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [play_title] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX) NULL,
    [category] NVARCHAR(30) NULL,
    [priority_score] INT NOT NULL DEFAULT 50,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'proposed'
        CONSTRAINT [ck_seoplay_status] CHECK ([status] IN ('proposed', 'active', 'completed', 'deferred')),
    [priority_label] NVARCHAR(10) NOT NULL DEFAULT 'next'
        CONSTRAINT [ck_seoplay_pri] CHECK ([priority_label] IN ('now', 'next', 'later')),
    [owner_name] NVARCHAR(100) NULL,
    [impact_description] NVARCHAR(255) NULL,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);


-- SEO Model Hubs: model hub page system status
CREATE TABLE [dbo].[seo_model_hubs] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [make] NVARCHAR(50) NOT NULL,
    [model] NVARCHAR(100) NOT NULL,
    [category] NVARCHAR(30) NOT NULL,
    [hub_status] NVARCHAR(20) NOT NULL DEFAULT 'planned'
        CONSTRAINT [ck_seohub_status] CHECK ([hub_status] IN ('live_strong', 'live_moderate', 'live_thin', 'planned', 'not_started')),
    [commercial_page_status] NVARCHAR(20) NULL,
    [research_page_status] NVARCHAR(20) NULL,
    [comparison_page_status] NVARCHAR(20) NULL,
    [ownership_page_status] NVARCHAR(20) NULL,
    [content_gaps] NVARCHAR(500) NULL,
    [build_urgency] NVARCHAR(10) NULL
        CONSTRAINT [ck_seohub_urgency] CHECK ([build_urgency] IN ('now', 'next', 'later')),
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
-- MODULE: SEO Playbook (5A)
CREATE UNIQUE NONCLUSTERED INDEX [idx_seohub_make_model] ON [dbo].[seo_model_hubs]([make], [model]);


-- ============================================================================
-- GROUP H: PPC ANALYSIS TABLES
-- ============================================================================

-- PPC Waste Analysis: aggregate waste metrics
CREATE TABLE [dbo].[ppc_waste_analysis] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [snapshot_date] DATE NOT NULL UNIQUE,
    [total_spend] DECIMAL(10,2) NOT NULL DEFAULT 0,
    [irrelevant_spend] DECIMAL(10,2) NOT NULL DEFAULT 0,
    [wasted_clicks] INT NOT NULL DEFAULT 0,
    [negative_kw_coverage_pct] DECIMAL(5,2) NULL,
    [negatives_added_count] INT NOT NULL DEFAULT 0,
    [waste_pct] AS (CASE WHEN [total_spend] > 0 THEN (CAST([irrelevant_spend] AS FLOAT) / [total_spend]) * 100 ELSE 0 END) PERSISTED,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);


-- PPC Negative Keywords: additions and impact
CREATE TABLE [dbo].[ppc_negative_keywords] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [term] NVARCHAR(200) NOT NULL,
    [campaign_name] NVARCHAR(200) NULL,
    [match_type] NVARCHAR(10) NOT NULL DEFAULT 'exact'
        CONSTRAINT [ck_negkw_match] CHECK ([match_type] IN ('exact', 'phrase', 'broad')),
    [waste_reason] NVARCHAR(200) NULL,
    [estimated_monthly_waste] DECIMAL(10,2) NULL,
    [added_date] DATE NOT NULL DEFAULT CAST(SYSUTCDATETIME() AS DATE),
    [added_by] NVARCHAR(100) NULL
);


-- ============================================================================
-- GROUP I: EMAIL TABLES
-- ============================================================================

-- Email Sequences: lifecycle sequence definitions
CREATE TABLE [dbo].[email_sequences] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [sequence_name] NVARCHAR(100) NOT NULL UNIQUE,
    [trigger_behavior] NVARCHAR(255) NULL,
    [audience_segment] NVARCHAR(50) NULL,
    [audience_size] INT NULL,
    [score_range] NVARCHAR(20) NULL,
    [email_count] INT NULL,
    [cadence_description] NVARCHAR(100) NULL,
    [objective] NVARCHAR(100) NULL,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'missing'
        CONSTRAINT [ck_emailseq_status] CHECK ([status] IN ('healthy', 'needs_work', 'missing', 'planned')),
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);


-- Email Performance: send-level metrics
CREATE TABLE [dbo].[email_performance] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [send_date] DATE NOT NULL,
    [email_product] NVARCHAR(50) NOT NULL
        CONSTRAINT [ck_emailperf_prod] CHECK ([email_product] IN ('avblast', 'airmail', 'brokernet_daily', 'whats_new', 'breaking_news')),
    [send_volume] INT NOT NULL DEFAULT 0,
    [delivered] INT NULL,
    [opens] INT NULL,
    [clicks] INT NULL,
    [unsubscribes] INT NULL,
    [bounces] INT NULL,
    [spam_complaints] INT NULL,
    [qi_attributed] INT NOT NULL DEFAULT 0,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [source_freshness] DATETIME2(7) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
-- MODULE: Email Lifecycle (5B)
CREATE NONCLUSTERED INDEX [idx_emailperf_date] ON [dbo].[email_performance]([send_date], [email_product]);


-- Email Servers: infrastructure health
CREATE TABLE [dbo].[email_servers] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [server_hostname] NVARCHAR(100) NOT NULL UNIQUE,
    [purpose] NVARCHAR(100) NOT NULL,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'active'
        CONSTRAINT [ck_emailsrv_status] CHECK ([status] IN ('active', 'inactive', 'decommissioned')),
    [spf_status] NVARCHAR(10) NOT NULL DEFAULT 'unknown'
        CONSTRAINT [ck_emailsrv_spf] CHECK ([spf_status] IN ('pass', 'fail', 'unknown', 'N/A')),
    [dkim_status] NVARCHAR(10) NOT NULL DEFAULT 'unknown'
        CONSTRAINT [ck_emailsrv_dkim] CHECK ([dkim_status] IN ('pass', 'fail', 'unknown', 'N/A')),
    [dmarc_status] NVARCHAR(10) NOT NULL DEFAULT 'unknown'
        CONSTRAINT [ck_emailsrv_dmarc] CHECK ([dmarc_status] IN ('pass', 'fail', 'unknown', 'N/A')),
    [dmarc_policy] NVARCHAR(20) NULL,
    [risk_level] NVARCHAR(10) NULL
        CONSTRAINT [ck_emailsrv_risk] CHECK ([risk_level] IN ('low', 'moderate', 'high')),
    [last_checked] DATETIME2(7) NULL,
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);


-- ============================================================================
-- GROUP J: REVENUE & BROKER TABLES
-- ============================================================================

-- Revenue Streams: breakdown by product
CREATE TABLE [dbo].[revenue_streams] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [stream_name] NVARCHAR(100) NOT NULL UNIQUE,
    [amount] DECIMAL(12,2) NOT NULL DEFAULT 0,
    [pct_of_total] DECIMAL(5,2) NULL,
    [trend] NVARCHAR(10) NULL
        CONSTRAINT [ck_revstr_trend] CHECK ([trend] IN ('up', 'flat', 'down')),
    [period] NVARCHAR(20) NOT NULL DEFAULT 'monthly',
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'POSSIBLE',
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [source_freshness] DATETIME2(7) NULL,
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);


-- Brokers: master records
CREATE TABLE [dbo].[brokers] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [broker_name] NVARCHAR(200) NOT NULL UNIQUE,
    [category_mix] NVARCHAR(255) NULL,
    [tier] NVARCHAR(20) NULL
        CONSTRAINT [ck_broker_tier] CHECK ([tier] IN ('Premium', 'Standard', 'Basic')),
    [inquiry_volume_30d] INT NULL,
    [inquiry_quality_score] INT NULL,
    [response_latency_hours] DECIMAL(5,2) NULL,
    [listing_quality_score] INT NULL,
    [package_utilization_pct] DECIMAL(5,2) NULL,
    [revenue_current] DECIMAL(10,2) NULL,
    [revenue_prior] DECIMAL(10,2) NULL,
    [revenue_trend] NVARCHAR(10) NULL
        CONSTRAINT [ck_broker_revtrend] CHECK ([revenue_trend] IN ('up', 'flat', 'declining')),
    [renewal_date] DATE NULL,
    [health_score] INT NULL,
    [risk_score] INT NULL,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [source_freshness] DATETIME2(7) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE NONCLUSTERED INDEX [idx_broker_risk] ON [dbo].[brokers]([risk_score] DESC);
CREATE NONCLUSTERED INDEX [idx_broker_renewal] ON [dbo].[brokers]([renewal_date]);


-- Broker Health Snapshots: periodic health scoring
CREATE TABLE [dbo].[broker_health_snapshots] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [broker_id] INT NOT NULL CONSTRAINT [fk_bhs_broker] REFERENCES [dbo].[brokers]([id]) ON DELETE CASCADE,
    [snapshot_date] DATE NOT NULL,
    [listing_count] INT NULL,
    [avg_quality] INT NULL,
    [stale_ratio] DECIMAL(5,4) NULL,
    [avg_cvr] DECIMAL(5,2) NULL,
    [hidden_price_rate] DECIMAL(5,4) NULL,
    [photo_deficiency_rate] DECIMAL(5,4) NULL,
    [health_score] INT NULL,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE UNIQUE NONCLUSTERED INDEX [idx_bhs_broker_date] ON [dbo].[broker_health_snapshots]([broker_id], [snapshot_date]);


-- Broker Renewal Risk: predictive risk assessment
CREATE TABLE [dbo].[broker_renewal_risk] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [broker_id] INT NOT NULL CONSTRAINT [fk_brr_broker] REFERENCES [dbo].[brokers]([id]) ON DELETE CASCADE,
    [renewal_date] DATE NULL,
    [inquiry_trend] NVARCHAR(10) NULL
        CONSTRAINT [ck_brr_inqtrend] CHECK ([inquiry_trend] IN ('up', 'flat', 'declining')),
    [visibility_trend] NVARCHAR(10) NULL
        CONSTRAINT [ck_brr_vistrend] CHECK ([visibility_trend] IN ('up', 'flat', 'declining')),
    [utilization_trend] NVARCHAR(10) NULL
        CONSTRAINT [ck_brr_utiltrend] CHECK ([utilization_trend] IN ('up', 'flat', 'declining')),
    [risk_score] INT NOT NULL DEFAULT 0,
    [primary_reason] NVARCHAR(255) NULL,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE NONCLUSTERED INDEX [idx_brr_risk] ON [dbo].[broker_renewal_risk]([risk_score] DESC);


-- Advertiser Accounts: revenue and risk tracking
CREATE TABLE [dbo].[advertiser_accounts] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [broker_id] INT NULL CONSTRAINT [fk_advacct_broker] REFERENCES [dbo].[brokers]([id]),
    [advertiser_name] NVARCHAR(200) NOT NULL,
    [tier] NVARCHAR(20) NULL
        CONSTRAINT [ck_advacct_tier] CHECK ([tier] IN ('Premium', 'Standard', 'Basic')),
    [revenue_current] DECIMAL(10,2) NULL,
    [revenue_prior] DECIMAL(10,2) NULL,
    [renewal_date] DATE NULL,
    [risk_score] INT NULL,
    [utilization_pct] DECIMAL(5,2) NULL,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [source_freshness] DATETIME2(7) NULL,
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE NONCLUSTERED INDEX [idx_advacct_risk] ON [dbo].[advertiser_accounts]([risk_score] DESC);


-- ============================================================================
-- GROUP K: INVENTORY & MARKET TABLES
-- ============================================================================

-- Listings: aircraft listing records
CREATE TABLE [dbo].[listings] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [listing_id] NVARCHAR(20) NOT NULL UNIQUE,
    [broker_id] INT NULL CONSTRAINT [fk_listing_broker] REFERENCES [dbo].[brokers]([id]),
    [category] NVARCHAR(30) NOT NULL,
    [make_model] NVARCHAR(200) NOT NULL,
    [photo_count] INT NOT NULL DEFAULT 0,
    [spec_completeness] INT NULL,
    [price_visible] BIT NOT NULL DEFAULT 0,
    [last_refresh] DATE NULL,
    [quality_score] INT NULL,
    [detail_views_30d] INT NOT NULL DEFAULT 0,
    [inquiries_30d] INT NOT NULL DEFAULT 0,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'active'
        CONSTRAINT [ck_listing_status] CHECK ([status] IN ('active', 'sold', 'archived')),
    [cvr_pct] AS (CASE WHEN [detail_views_30d] > 0 THEN (CAST([inquiries_30d] AS FLOAT) / [detail_views_30d]) * 100 ELSE 0 END) PERSISTED,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [source_freshness] DATETIME2(7) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE NONCLUSTERED INDEX [idx_listing_broker] ON [dbo].[listings]([broker_id]);
CREATE NONCLUSTERED INDEX [idx_listing_category] ON [dbo].[listings]([category], [status]);


-- Market Demand Models: model-level demand and opportunity
CREATE TABLE [dbo].[market_demand_models] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [make] NVARCHAR(50) NOT NULL,
    [model] NVARCHAR(100) NOT NULL,
    [category] NVARCHAR(30) NOT NULL,
    [demand_momentum] INT NULL,
    [inventory_count] INT NULL,
    [avg_listing_quality] INT NULL,
    [imbalance_score] DECIMAL(5,2) NULL,
    [organic_rank_trend] NVARCHAR(15) NULL
        CONSTRAINT [ck_mdm_orgtrend] CHECK ([organic_rank_trend] IN ('improving', 'stable', 'declining')),
    [paid_cpc_trend] NVARCHAR(15) NULL
        CONSTRAINT [ck_mdm_cpctrend] CHECK ([paid_cpc_trend] IN ('rising', 'stable', 'falling')),
    [opportunity_score] INT NULL,
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [source_freshness] DATETIME2(7) NULL,
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE UNIQUE NONCLUSTERED INDEX [idx_mdm_make_model] ON [dbo].[market_demand_models]([make], [model]);


-- Market Demand Categories: category-level growth signals
CREATE TABLE [dbo].[market_demand_categories] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [category] NVARCHAR(30) NOT NULL UNIQUE,
    [query_growth_pct] DECIMAL(5,2) NULL,
    [ppc_growth_pct] DECIMAL(5,2) NULL,
    [listing_view_growth_pct] DECIMAL(5,2) NULL,
    [repeat_interest_growth_pct] DECIMAL(5,2) NULL,
    [opportunity_state] NVARCHAR(20) NULL
        CONSTRAINT [ck_mdc_oppstate] CHECK ([opportunity_state] IN ('Accelerating', 'Expanding', 'Stable', 'Mixed', 'Contracting')),
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE',
    [data_source] NVARCHAR(50) NOT NULL DEFAULT 'seed',
    [source_freshness] DATETIME2(7) NULL,
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);


-- ============================================================================
-- GROUP L: ALERT & NOTIFICATION TABLES
-- ============================================================================

-- Alert Rules: configurable threshold rules
CREATE TABLE [dbo].[alert_rules] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [rule_name] NVARCHAR(100) NOT NULL UNIQUE,
    [metric_key] NVARCHAR(50) NOT NULL,
    [operator] NVARCHAR(10) NOT NULL
        CONSTRAINT [ck_alertrule_op] CHECK ([operator] IN ('gt', 'lt', 'gte', 'lte', 'delta_gt', 'delta_lt')),
    [threshold_value] DECIMAL(12,4) NOT NULL,
    [severity] NVARCHAR(10) NOT NULL DEFAULT 'warning'
        CONSTRAINT [ck_alertrule_sev] CHECK ([severity] IN ('info', 'warning', 'critical')),
    [module] NVARCHAR(30) NOT NULL,
    [cooldown_hours] INT NOT NULL DEFAULT 24,
    [notification_channel] NVARCHAR(20) NULL
        CONSTRAINT [ck_alertrule_notif] CHECK ([notification_channel] IN ('teams', 'email', 'both', 'none')),
    [is_active] BIT NOT NULL DEFAULT 1,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);


-- Alerts: generated alert instances
CREATE TABLE [dbo].[alerts] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [rule_id] INT NULL CONSTRAINT [fk_alert_rule] REFERENCES [dbo].[alert_rules]([id]),
    [alert_type] NVARCHAR(30) NOT NULL
        CONSTRAINT [ck_alert_type] CHECK ([alert_type] IN ('winner', 'loser', 'integrity', 'sla_breach', 'contamination', 'connector_failure', 'risk')),
    [severity] NVARCHAR(10) NOT NULL DEFAULT 'info'
        CONSTRAINT [ck_alert_sev] CHECK ([severity] IN ('info', 'warning', 'critical')),
    [module] NVARCHAR(30) NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX) NULL,
    [related_entity_type] NVARCHAR(50) NULL,
    [related_entity_id] NVARCHAR(50) NULL,
    [is_resolved] BIT NOT NULL DEFAULT 0,
    [resolved_by] NVARCHAR(100) NULL,
    [resolved_at] DATETIME2(7) NULL,
    [resolution_notes] NVARCHAR(MAX) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()
);
-- MODULE: Data Health (07), Intelligence Dashboard (01)
CREATE NONCLUSTERED INDEX [idx_alert_unresolved] ON [dbo].[alerts]([is_resolved], [severity], [created_at] DESC);
CREATE NONCLUSTERED INDEX [idx_alert_module] ON [dbo].[alerts]([module], [is_resolved]);


-- ============================================================================
-- GROUP M: EXECUTION TABLE
-- ============================================================================

-- Execution Items: constraints, blockers, initiatives, quarterly priorities
CREATE TABLE [dbo].[execution_items] (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [item_type] NVARCHAR(20) NOT NULL
        CONSTRAINT [ck_exec_type] CHECK ([item_type] IN ('constraint', 'blocker', 'initiative', 'quarterly_priority')),
    [title] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX) NULL,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'open'
        CONSTRAINT [ck_exec_status] CHECK ([status] IN ('open', 'in_progress', 'resolved', 'deferred', 'blocked')),
    [severity] NVARCHAR(10) NULL
        CONSTRAINT [ck_exec_sev] CHECK ([severity] IN ('info', 'warning', 'critical')),
    [priority_score] INT NULL,
    [priority_label] NVARCHAR(10) NULL
        CONSTRAINT [ck_exec_pri] CHECK ([priority_label] IN ('now', 'next', 'later')),
    [quarter] NVARCHAR(10) NULL,
    [owner_name] NVARCHAR(100) NULL,
    [dependencies] NVARCHAR(500) NULL,
    [expected_lift] NVARCHAR(100) NULL,
    [time_to_impact] NVARCHAR(50) NULL,
    [scale_safety] NVARCHAR(30) NULL
        CONSTRAINT [ck_exec_scale] CHECK ([scale_safety] IN ('scale', 'controlled_launch', 'refine', 'proposal', 'blocked')),
    [confidence_level] NVARCHAR(20) NOT NULL DEFAULT 'PROBABLE'
        CONSTRAINT [ck_exec_conf] CHECK ([confidence_level] IN ('CONFIRMED', 'PROBABLE', 'POSSIBLE')),
    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    [resolved_at] DATETIME2(7) NULL
);
-- MODULE: Execution Cadence (04)
CREATE NONCLUSTERED INDEX [idx_exec_type_status] ON [dbo].[execution_items]([item_type], [status]);
CREATE NONCLUSTERED INDEX [idx_exec_priority] ON [dbo].[execution_items]([priority_score] DESC);


-- ============================================================================
-- SEED DATA: GA4 Contamination Exclusion
-- ============================================================================

INSERT INTO [dbo].[ga4_contamination_exclusions] ([pattern], [reason], [added_date], [is_active])
VALUES ('Email_Open_%', 'GA4 email open tracking pixel contamination since June 2023. Inflates session count and deflates engagement rate.', '2023-06-01', 1);


-- ============================================================================
-- SEED DATA: Data Sources
-- ============================================================================

INSERT INTO [dbo].[data_sources] ([source_key], [display_name], [connection_status], [sla_hours], [owner])
VALUES
    ('ga4', 'Google Analytics 4', 'pending', 6, 'Casey Jones'),
    ('gsc', 'Google Search Console', 'pending', 24, 'Casey Jones'),
    ('google_ads', 'Google Ads', 'pending', 6, 'Casey Jones'),
    ('windsor', 'Windsor.ai', 'pending', 24, 'Casey Jones'),
    ('crm', 'CRM/Inquiry System', 'not_connected', NULL, NULL),
    ('callrail', 'CallRail', 'not_connected', NULL, NULL),
    ('semrush', 'SEMrush', 'not_connected', 72, NULL),
    ('spyfu', 'SpyFu', 'not_connected', 72, NULL),
    ('clarity', 'Microsoft Clarity', 'unmaintained', NULL, NULL),
    ('simpli_fi', 'Simpli.fi', 'not_connected', NULL, NULL),
    ('email_platform', 'Email Platform', 'pending', 12, 'Sydney Eldridge');


-- ============================================================================
-- SEED DATA: Content Pillars
-- ============================================================================

INSERT INTO [dbo].[content_pillars] ([pillar_name], [target_mix_pct], [pillar_type])
VALUES
    ('Aircraft Buying Guides', 30.0, 'evergreen'),
    ('Market Analysis', 15.0, 'evergreen'),
    ('Operating Costs & Ownership', 20.0, 'evergreen'),
    ('Aviation Lifestyle', 15.0, 'evergreen'),
    ('News & Intelligence', 20.0, 'news');


-- ============================================================================
-- SEED DATA: Email Servers
-- ============================================================================

INSERT INTO [dbo].[email_servers] ([server_hostname], [purpose], [status], [spf_status], [dkim_status], [dmarc_status])
VALUES
    ('mail.aircraft-listings.com', 'Legacy broadcast', 'active', 'unknown', 'unknown', 'unknown'),
    ('bms2.aircraft-listings.com', 'BrokerNet sends', 'active', 'unknown', 'unknown', 'unknown'),
    ('bms4.aircraft-listings.com', 'BrokerNet sends', 'active', 'unknown', 'unknown', 'unknown'),
    ('mail.globalair.com', 'Primary sends', 'active', 'unknown', 'unknown', 'unknown'),
    ('mail2.globalair.com', 'Overflow/secondary', 'active', 'unknown', 'unknown', 'unknown'),
    ('mail.ganmail.com', 'Internal (GanMail)', 'active', 'N/A', 'N/A', 'N/A');


-- ============================================================================
-- SEED DATA: GA4 Property Health
-- ============================================================================

INSERT INTO [dbo].[ga4_property_health] ([property_id], [contamination_status], [contamination_start], [real_engagement_rate], [reported_engagement_rate], [enhanced_conversions], [conversion_signal])
VALUES ('G-K0N37V9FEB', 'ACTIVE', '2023-06-01', 69.0, 17.0, 'UNCONFIRMED', 'UNCONFIRMED');


-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
