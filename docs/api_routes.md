# api_routes.md — Av/IntelOS API Endpoint Manifest

Base URL: `/api/v1`
Auth: Microsoft Entra ID (Bearer token)
Format: JSON
Pagination: `?page=1&pageSize=25` on all list endpoints
Filtering: Query params on list endpoints (see filter columns per table)
Date ranges: `?from=2026-01-01&to=2026-03-30` on all analytics endpoints
Role projection: API reads role from Entra ID claims. Viewer (Jeffrey) responses filter to CONFIRMED only. Editor (Clay) sees CONFIRMED + PROBABLE. Operator (Casey) sees all.
Confidence envelope: Every response includes `meta: { confidence_summary: { confirmed: N, probable: N, possible: N }, freshness: "ISO8601" }`

---

## Shared / System Endpoints

| Method | Path | Auth | Description | Response Shape |
|--------|------|------|-------------|---------------|
| GET | `/me` | Any | Current user profile + role + preferences | `{ id, display_name, email, role, preferences: { current_role_view, date_range, compare_mode, category_filter, signal_clean_only } }` |
| PATCH | `/me/preferences` | Any | Update user preferences | `{ updated_at }` |
| GET | `/data-sources` | Any | All external source statuses | `[{ id, source_key, display_name, connection_status, sla_hours, last_successful_sync, last_error }]` |
| GET | `/ingestion-logs` | Operator | Recent ingestion runs | `[{ id, source_key, started_at, completed_at, status, records_processed, trigger_type, duration_ms }]` |
| GET | `/system-health` | Operator | Infrastructure health checks | `[{ check_type, check_name, status, latency_ms, details, last_checked }]` |
| GET | `/alerts` | Any | Active alerts (filtered by role) | `[{ id, alert_type, severity, module, title, description, is_resolved, created_at }]` |
| PATCH | `/alerts/:id/resolve` | Operator | Resolve an alert with notes | `{ id, resolved_at, resolved_by }` |
| GET | `/metrics-registry` | Any | All metric definitions | `[{ id, name, definition, formula, source, unit, whyItMatters }]` |

---

## Module 01 — Intelligence Dashboard

| Method | Path | Auth | Description | Response Shape |
|--------|------|------|-------------|---------------|
| GET | `/dashboard/kpis` | Any | Cross-domain KPI strip | `{ qi: { value, delta, trend, confidence }, cpqi: {...}, revenue: {...}, broker_risk_index: {...}, authority_score: {...} }` |
| GET | `/dashboard/prime-directive` | Any | Prime Directive health status | `[{ id, name, metric, status, confidence, detail }]` |
| GET | `/dashboard/movers` | Any | Top 10 metric movers | `[{ metric, value, delta, deltaLabel }]` |
| GET | `/dashboard/opportunities` | Any | Scored opportunity queue | `[{ id, domain, title, priority_score, expected_lift, time_to_impact, owner_name, blocker, status, confidence_level }]` |
| GET | `/dashboard/action-framework` | Any | Fast wins + strategic moves + blockers | `{ fast_wins: [...], strategic_moves: [...], blockers: [...] }` |
| GET | `/dashboard/leakage-map` | Any | High-impression low-CTR pages | `[{ page_path, impressions, ctr, sessions, conversions, leakage_type }]` |
| GET | `/dashboard/competitive-zones` | Any | Attack/Compete/Build/Monitor zones | `{ attack: [...], compete: [...], build: [...], monitor: [...] }` |
| GET | `/dashboard/data-trust` | Any | Domain signal mix and confidence audit | `{ decision_confidence_pct, confirmed_count, probable_count, possible_count, domain_breakdown: [...] }` |
| GET | `/dashboard/qi-trend` | Any | QI trend over time | `[{ date, qi_count, confidence }]` |

---

## Module 02 — GA4 Analytics Hub

| Method | Path | Auth | Description | Response Shape |
|--------|------|------|-------------|---------------|
| GET | `/ga4/quality-metrics` | Any | Data quality KPI strip | `{ real_engagement_rate, reported_engagement_rate, clean_sessions, validation_coverage, attribution_integrity }` |
| GET | `/ga4/channels` | Any | Channel performance (clean) | `[{ channel, sessions, users, engagement_rate, conversions, qi_per_100, confidence_level }]` |
| GET | `/ga4/landing-pages` | Any | Landing page performance with issues | `[{ page_path, sessions, bounce_rate, conversions, cvr_pct, category, impressions, ctr, confidence_level }]` |
| GET | `/ga4/events` | Any | Event quality registry by tier | `[{ event_name, event_count, tier, is_contaminated, confidence_level }]` |
| GET | `/ga4/property-health` | Any | GA4 property config and contamination | `{ property_id, contamination_status, real_engagement_rate, reported_engagement_rate, enhanced_conversions, conversion_signal }` |
| GET | `/ga4/contamination-exclusions` | Any | Active exclusion patterns | `[{ pattern, reason, is_active }]` |
| GET | `/ga4/measurement-trust` | Any | Measurement trust status card | `{ contamination_active, blockers: [...], confidence_guide: {...} }` |

---

## Module 03 — Organic Intelligence

| Method | Path | Auth | Description | Response Shape |
|--------|------|------|-------------|---------------|
| GET | `/organic/kpis` | Any | Organic KPI strip | `{ organic_qi, organic_assisted_qi, ctr_priority_commercial, share_vs_competitors, demand_inventory_mismatch }` |
| GET | `/organic/query-clusters` | Any | Query cluster performance | `[{ query, clicks, impressions, avg_position, ctr_pct, category, confidence_level }]` |
| GET | `/organic/model-pages` | Any | Model page performance matrix | `[{ page_url, category, impressions, ctr_pct, avg_position, sessions, conversions }]` |
| GET | `/organic/portfolio` | Any | GSC portfolio summary | `{ total_keywords, monthly_clicks, avg_position, avg_ctr, confidence_level }` |
| GET | `/organic/categories` | Any | GSC category breakdown | `[{ category, keywords, clicks, impressions, avg_position, ctr }]` |
| GET | `/organic/competitive-serp` | Any | Competitive SERP benchmark | `[{ competitor, share_pct, ctr_prominence, zone }]` |
| GET | `/organic/demand-mismatch` | Any | Demand vs inventory mismatch signals | `[{ make_model, demand_score, inventory_count, imbalance_score }]` |
| GET | `/organic/content-assist` | Any | Content-assisted conversion paths | `{ content_assist_rate, paths: [...] }` |

---

## Module 04 — Execution Cadence

| Method | Path | Auth | Description | Response Shape |
|--------|------|------|-------------|---------------|
| GET | `/execution/constraints` | Any | Weekly constraint status | `{ primary_constraint, weekly_priority_count, reallocation_readiness, execution_capacity, roadmap_discipline }` |
| GET | `/execution/blockers` | Any | Blocking issues with severity | `[{ id, title, description, severity, status, owner_name, confidence_level }]` |
| GET | `/execution/priorities` | Any | Quarterly priority status | `[{ id, title, status, priority_score, scale_safety, confidence_level, quarter }]` |
| GET | `/execution/initiatives` | Any | Execution initiative table | `[{ id, title, scale_safety, priority_label, priority_score, expected_lift, owner_name, confidence_level }]` |
| POST | `/execution/items` | Operator | Create execution item | `{ id, created_at }` |
| PATCH | `/execution/items/:id` | Operator | Update execution item | `{ id, updated_at }` |
| PATCH | `/execution/items/:id/resolve` | Operator | Resolve an execution item | `{ id, resolved_at }` |

---

## Module 05 — PPC Intelligence

| Method | Path | Auth | Description | Response Shape |
|--------|------|------|-------------|---------------|
| GET | `/ppc/kpis` | Any | PPC KPI strip | `{ qi_from_ppc, cpqi, piston_is, search_term_quality, scale_safety }` |
| GET | `/ppc/campaigns` | Any | Campaign layer summary | `[{ campaign_name, spend, clicks, impressions, ctr_pct, conversions, cpqi, impression_share, campaign_status, category, confidence_level }]` |
| GET | `/ppc/model-performance` | Any | Model-level PPC performance | `[{ model, spend, cpqi, ctr_pct, impression_share, category }]` |
| GET | `/ppc/search-terms` | Any | Search term report with waste | `[{ search_term, campaign_name, impressions, clicks, spend, conversions, waste_reason, action }]` |
| GET | `/ppc/waste-analysis` | Any | Aggregate waste metrics | `{ total_spend, irrelevant_spend, waste_pct, wasted_clicks, negative_kw_coverage_pct }` |
| GET | `/ppc/retargeting` | Any | Retargeting audience segments | `[{ audience_name, audience_size, window_days, conversion_rate }]` |
| GET | `/ppc/auction-insights` | Any | Weekly auction insights vs competitors | `[{ week_start, competitor, impression_share, overlap_rate, position_above_rate }]` |
| GET | `/ppc/competitive-positioning` | Any | Competitive zone breakdown | `{ head_terms: {...}, manufacturer_terms: {...}, model_terms: {...}, conquesting: {...} }` |
| GET | `/ppc/negative-keywords` | Any | Negative keyword additions | `[{ term, campaign_name, match_type, waste_reason, added_date }]` |

---

## Module 5A — SEO Playbook

| Method | Path | Auth | Description | Response Shape |
|--------|------|------|-------------|---------------|
| GET | `/seo/status` | Any | SEO status KPI strip | `{ priority_categories, model_hubs_queued, page_velocity, internal_linking_risk, technical_safety }` |
| GET | `/seo/plays` | Any | Priority plays with scores | `[{ id, play_title, description, category, priority_score, status, priority_label, owner_name, confidence_level }]` |
| GET | `/seo/category-matrix` | Any | Category priority matrix | `[{ category, demand, supply, ctr, complexity, operations, priority }]` |
| GET | `/seo/model-hubs` | Any | Model hub priority list | `[{ make, model, category, hub_status, content_gaps, build_urgency, confidence_level }]` |
| GET | `/seo/technical-controls` | Any | Technical SEO control status | `[{ control_name, status, description, risk_level }]` |
| GET | `/seo/competitive-opportunity` | Any | Competitive SEO opportunity matrix | `[{ term_type, share, opportunity, action }]` |
| POST | `/seo/plays` | Operator | Create SEO play | `{ id, created_at }` |
| PATCH | `/seo/plays/:id` | Operator | Update SEO play | `{ id, updated_at }` |

---

## Module 5B — Email Lifecycle

| Method | Path | Auth | Description | Response Shape |
|--------|------|------|-------------|---------------|
| GET | `/email/kpis` | Any | Email lifecycle KPI strip | `{ email_assisted_qi, return_visit_rate, score_progression, retargeting_sync, lifecycle_attribution, newsletter_segmentation }` |
| GET | `/email/sequences` | Any | Lifecycle sequence health | `[{ sequence_name, trigger_behavior, audience_segment, audience_size, score_range, email_count, objective, status, confidence_level }]` |
| GET | `/email/scoring-tiers` | Any | Lead scoring tier definitions | `[{ tier_name, score_range, temperature, description, actions }]` |
| GET | `/email/retargeting-segments` | Any | Retargeting audience segment sync | `[{ segment_name, audience_size, sync_status, signal_quality }]` |
| GET | `/email/attribution-blockers` | Any | Attribution blocker tracking | `[{ blocker_name, coverage_pct, description, severity }]` |
| GET | `/email/performance` | Any | Email send performance | `[{ send_date, email_product, send_volume, delivered, opens, clicks, qi_attributed, confidence_level }]` |
| GET | `/email/servers` | Any | Email server deliverability | `[{ server_hostname, purpose, status, spf_status, dkim_status, dmarc_status, risk_level }]` |
| GET | `/email/newsletter-segments` | Any | Newsletter segmentation status | `[{ segment_name, audience_criteria, content_focus, segmentation_status }]` |

---

## Module 5C — Social Authority

| Method | Path | Auth | Description | Response Shape |
|--------|------|------|-------------|---------------|
| GET | `/social/kpis` | Any | Social KPI strip | `{ social_assisted_qi, content_mix_compliance, youtube_velocity, broker_spotlight_coverage, email_capture_rate, authority_integrity }` |
| GET | `/social/platform-guidelines` | Any | Platform content guidelines | `[{ platform, category_focus, tone, role, notes }]` |
| GET | `/social/content-buckets` | Any | Content bucket distribution | `[{ bucket_name, current_pct, target_pct, status }]` |
| GET | `/social/broker-spotlights` | Any | Broker spotlight coverage | `[{ broker_name, spotlight_status, interest_level, platforms, category_fit }]` |
| GET | `/social/event-coverage` | Any | Event content coverage calendar | `[{ event_name, phases: [...], content_types: [...] }]` |
| GET | `/social/loop-metrics` | Any | Loop doctrine performance | `{ email_capture_from_social, profile_to_site_rate, video_completion_rate, follower_growth }` |

---

## Module 5D — Event Revenue

| Method | Path | Auth | Description | Response Shape |
|--------|------|------|-------------|---------------|
| GET | `/events/kpis` | Any | Event KPI strip | `{ revenue_target_coverage, pre_event_meeting_fill, on_site_tagged_leads, sponsor_close_rate, content_yield, attribution_integrity }` |
| GET | `/events/revenue-products` | Any | Revenue product lines | `[{ product_name, revenue_type, target_quarterly, actual_quarterly, sales_status }]` |
| GET | `/events/pre-event-status` | Any | Pre-event system status | `[{ event_name, days_out, meeting_scheduler, outreach, geo_retargeting, page_status }]` |
| GET | `/events/on-site-doctrine` | Any | On-site execution checklist | `[{ checklist_item, status, compliance_pct }]` |
| GET | `/events/post-event-status` | Any | Post-event follow-up discipline | `[{ event_name, recap_status, lead_followup_pct, retargeting_active, roi_review_status }]` |
| GET | `/events/partnerships` | Any | Partnership/sponsorship bundles | `[{ partner_type, bundle_name, components: [...], status }]` |
| GET | `/events/content-capture` | Any | Content capture requirements | `[{ content_type, target_per_event, actual_avg, gap }]` |
| GET | `/events/attribution` | Any | Event attribution metrics | `[{ metric_name, value, confidence_level }]` |

---

## Module 06 — Content & Channel

| Method | Path | Auth | Description | Response Shape |
|--------|------|------|-------------|---------------|
| GET | `/content/kpis` | Any | Content KPI strip | `{ evergreen_mix, news_mix, content_assisted_qi, production_velocity, attribution_confidence, cta_coverage }` |
| GET | `/content/articles` | Any | Article category performance | `[{ id, title, url_path, pillar_name, category, sessions_30d, engagement_rate, conversions_30d, has_cta_module, cta_ctr, confidence_level }]` |
| GET | `/content/pillars` | Any | Pillar performance summary | `[{ pillar_name, articles, total_sessions, avg_engagement_rate, conversions, cta_coverage_pct }]` |
| GET | `/content/refresh-queue` | Any | Refresh queue priority list | `[{ article_title, months_since_update, expected_lift_pct, refresh_actions, status, owner_name }]` |
| GET | `/content/attribution-paths` | Any | Content attribution path analysis | `[{ path_description, strength, confidence_level }]` |
| GET | `/content/production-balance` | Any | Evergreen vs news production balance | `{ evergreen_target, evergreen_actual, news_target, news_actual, gap_assessment }` |

---

## Module 07 — Data Health

| Method | Path | Auth | Description | Response Shape |
|--------|------|------|-------------|---------------|
| GET | `/health/overview` | Any | Overall health KPI strip | `{ decision_safe_sources, critical_incidents, freshness_sla_compliance, pages_fully_safe, remediation_ownership, board_safe_rendering }` |
| GET | `/health/incidents` | Any | Critical incidents with scores | `[{ id, title, description, severity, score, module, confidence_level }]` |
| GET | `/health/source-freshness` | Any | Source freshness and SLA table | `[{ source_key, display_name, sla_hours, actual_age_hours, sla_status, decision_safety, confidence_level }]` |
| GET | `/health/crawlers` | Any | AI crawler access status | `[{ crawler_name, status, owner, ticket_id, priority }]` |
| GET | `/health/email-deliverability` | Any | Email server deliverability | `[{ server_hostname, purpose, spf_status, dkim_status, dmarc_status, risk_level }]` |
| GET | `/health/page-trust` | Any | Page-level trust assignments | `[{ page_number, page_name, trust_status, issues: [...], rendering_rules: [...] }]` |
| GET | `/health/trust-registry` | Any | System trust registry | `{ role_rendering_rules: {...}, contamination_alerts: [...], board_safe_mode: {...} }` |
| GET | `/health/freshness-trend` | Any | Source freshness trend over time | `[{ source_key, readings: [{ date, age_hours, sla_status }] }]` |

---

## Ingestion Triggers

| Method | Path | Auth | Description | Response Shape |
|--------|------|------|-------------|---------------|
| POST | `/ingestion/ga4` | Operator | Trigger GA4 data pull | `{ job_id, started_at }` |
| POST | `/ingestion/gsc` | Operator | Trigger GSC data pull | `{ job_id, started_at }` |
| POST | `/ingestion/google-ads` | Operator | Trigger Google Ads data pull | `{ job_id, started_at }` |
| POST | `/ingestion/windsor` | Operator | Trigger Windsor aggregation | `{ job_id, started_at }` |
| POST | `/ingestion/refresh-all` | Operator | Trigger full refresh across all sources | `{ jobs: [{ source, job_id, started_at }] }` |

---

## Export

| Method | Path | Auth | Description | Response Shape |
|--------|------|------|-------------|---------------|
| GET | `/export/:module/:format` | Operator | Export module data as CSV or PDF | Binary file download. `:module` = dashboard, ga4, organic, ppc, seo, email, social, events, content, health, execution. `:format` = csv, pdf. |

---

*Location: 12_TECH_STACK_AND_AI/AvINTELOS/docs/api_routes.md*
