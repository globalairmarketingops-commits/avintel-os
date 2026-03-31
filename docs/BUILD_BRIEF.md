# BUILD_BRIEF.md — Av/IntelOS v2.0

## Identity
- **Product:** Av/IntelOS v2.0 — Intelligence, Measurement, and Growth Command System
- **Modules:** Intelligence Dashboard, GA4 Analytics Hub, Organic Intelligence, Execution Cadence, PPC Intelligence, SEO Playbook, Email Lifecycle, Social Authority, Event Revenue, Content & Channel, Data Health (11 modules, 55 tab surfaces)
- **Tier:** T1 — Blocks scaling, measurement integrity, and executive reporting
- **Sprint:** S5+ (target start once Dev Lead assigned and hard blockers clear)
- **Owner:** Casey Jones, Head of Marketing

## Objective
Rebuild Av/IntelOS as a production-grade Azure-hosted SPA that consolidates marketing intelligence, revenue attribution, operational control, and execution prioritization into a unified command system. Replaces 11 standalone HTML prototype pages with an integrated, real-time, database-backed application. The system serves as the intelligence and measurement layer of the AvOS platform — pulling signals from GA4, PPC, SEO, content, email, social, events, and system health, then converting those signals into role-aware, decision-safe actions.

## Architecture

### Azure Services
| Service | Purpose |
|---------|---------|
| Azure App Service | Frontend SPA + ASP.NET Core Web API hosting |
| Azure SQL Database | Primary relational data store |
| Azure Cache for Redis | Tiered metric cache (5min/30min/2h/12h), session cache |
| Azure Functions | Scheduled data ingestion (GA4, GSC, Google Ads, Windsor), alert evaluation, confidence decay |
| Azure Blob Storage | Exported reports, CSV uploads, static assets |
| Azure Key Vault | API keys, connection strings, service account credentials |
| Azure Application Insights | APM, error tracking, performance monitoring, ingestion telemetry |
| Azure Front Door | CDN for static assets, SSL termination, WAF (production only) |
| Azure DevOps | CI/CD pipelines (GitHub → Azure DevOps → staged deployment) |

### Stack
- **Backend:** ASP.NET Core 8 Web API (.NET 8 LTS — consistent with GlobalAir.com infrastructure. Never .php.)
- **Frontend:** React 18 SPA with TypeScript. Single codebase, shared navigation, 11 module routes.
- **Database:** Azure SQL (T-SQL, SQL Server 2019+). Schema defined in schema.sql.
- **Ingestion:** Azure Functions (.NET) on timer triggers for external API polling and alert evaluation.
- **Auth:** Microsoft Entra ID (Azure AD). SSO with existing Microsoft 365 accounts.
- **RBAC:** Operator (Casey — full access, all confidence levels), Editor (Clay — CONFIRMED + PROBABLE, no CRUD), Viewer (Jeffrey — CONFIRMED only, board-safe rendering).

### Environments
- Development → Staging → Production (3-tier, staging-first mandatory)
- Feature flags for phased module activation
- No direct-to-prod deployments

## Modules (1 line each)
1. **Intelligence Dashboard** — Cross-domain command center: aggregated KPIs, top opportunity signals, action framework, QI trend, opportunity queue, leakage map, competitive zones, data trust summary.
2. **GA4 Analytics Hub** — Measurement integrity layer: data quality metrics, clean vs contaminated channel performance, landing page issue detection, event quality registry, measurement trust status.
3. **Organic Intelligence** — Search performance command: organic QI, query clusters, model page performance matrix, competitive SERP benchmark, demand/inventory mismatch detection, content assist paths.
4. **Execution Cadence** — Operating discipline system: weekly constraint status, blocking issues with severity, quarterly priority tracking, execution initiative scoring, roadmap discipline metrics.
5. **PPC Intelligence** — Paid search command: PPC KPIs with scale safety, campaign layer summary, model-level performance, search term quality/waste detection, retargeting audiences, competitive positioning.
6. **SEO Playbook** — Organic strategy doctrine: priority plays with scoring, category priority matrix, model hub build queue, technical SEO controls, competitive opportunity matrix.
7. **Email Lifecycle** — Lifecycle intelligence: email-assisted QI, behavioral segment health, lifecycle sequence status, lead scoring tiers, retargeting audience sync, attribution blocker tracking.
8. **Social Authority** — Authority positioning command: social-assisted QI, 70/20/10 content mix compliance, platform-specific guidelines, broker spotlight coverage, event content capture, loop doctrine metrics.
9. **Event Revenue** — Event monetization command: revenue target coverage, pre-event meeting pipeline, on-site lead capture, post-event follow-up discipline, sponsor bundle performance, content yield tracking.
10. **Content & Channel** — Content performance intelligence: evergreen/news mix tracking, content-assisted QI, article category performance, production velocity, refresh queue prioritization, attribution path analysis.
11. **Data Health** — System trust control layer: decision-safe source count, critical incidents, freshness SLA compliance, page-level trust assignments, AI crawler access status, email deliverability, board-safe rendering control.

## Confidence System (Core Architectural Pattern)
Every data point in Av/IntelOS carries a confidence level computed at the data layer:
- **CONFIRMED** (green) — Sources: CRM, GA4 validated events, Stripe, call tracking, GSC, direct API
- **PROBABLE** (blue) — Sources: Weighted analytics, modeled signals, directional attribution, calculated metrics
- **POSSIBLE** (amber) — Sources: Partial data, composite models, seed data, exploratory measurements

**Decay rules:** CONFIRMED data older than 30 days decays to PROBABLE. PROBABLE data older than 60 days decays to POSSIBLE. Composite metrics take the MINIMUM confidence of their inputs.

**Role projection:** Operator (Casey) sees all three levels. Editor (Clay) sees CONFIRMED + PROBABLE. Viewer (Jeffrey) sees CONFIRMED only. Filtering enforced server-side — Jeffrey's API responses never contain PROBABLE or POSSIBLE data.

## Data Sources & Integrations
| Source | Connection | Frequency | State |
|--------|-----------|-----------|-------|
| GA4 Data API | Azure Function (timer) | Every 6h | Connected via Windsor — upgrade to direct API |
| Google Search Console | Azure Function (timer) | Every 12h | Connected via Windsor — upgrade to direct API |
| Google Ads API | Azure Function (timer) | Every 6h | Connected via Windsor — upgrade to direct API |
| Windsor.ai | Azure Function (daily) | Reconciliation | 3 connectors active (GA4, Google Ads, GSC) |
| GlobalAir .NET API | ASP.NET HttpClient | Nightly sync + on-demand | OPEN — .NET endpoint patterns needed from Clay |
| CRM/Inquiry System | Stub | AWAITING DEV | Graceful degradation — seed data, POSSIBLE confidence |
| CallRail | Stub | NOT ACTIVE | Surface "Call Tracking Inactive" warning |
| SEMrush/SpyFu | Stub | NOT CONNECTED | Windsor connector available but not linked |
| Email Platform | Azure Function (daily) | SMTP health checks | 6 mail servers, manual broadcast currently |
| Teams/SendGrid | Notification dispatch | Event-driven | Decision pending |

## Azure Functions (6)
1. **GA4IngestionFunction** — Timer `0 */6 * * *` — GA4 Data API with Email_Open_ exclusion hardcoded
2. **GSCIngestionFunction** — Timer `0 */12 * * *` — GSC API with category classification logic
3. **GoogleAdsIngestionFunction** — Timer `0 */6 * * *` — Google Ads API with campaign transformation
4. **WindsorAggregationFunction** — Timer `0 0 * * *` — Daily reconciliation/aggregation pull
5. **AlertEvaluationFunction** — Timer `*/15 * * * *` — Rule evaluation, alert dispatch, cooldown enforcement
6. **ConfidenceDecayFunction** — Timer `0 0 * * *` — Re-evaluate confidence based on 30d/60d age thresholds

## Constraints (Non-Negotiable)

### Design System
- Source of truth: `.claude/CLAUDE.md` (global) — canonical tokens override all skill files
- Navy: #102297 | Green: #97CB00 | Blue: #4782D3 | Red: #E8503A | Amber: #F59E0B
- RETIRED (build error if used): #0F1340, #63FB00, #1B2A4A, #2E75B6, #293594
- Fonts: Montserrat 700 (headings), DM Sans (body/UI), Instrument Serif (editorial only)
- Green = ONLY CTA button color. Never white text on green. Navy-tinted shadows only.
- WCAG 2.1 AA contrast required. 44px minimum tap target mobile.
- Pre-commit retired token linter mandatory — exit code 1 = build error.

### Data Integrity
- GA4 contaminated since June 2023 — filter Email_Open_ events from ALL engagement calculations
- Real engagement: ~69% vs ~17% reported — always use clean channel data
- Never present unconfirmed findings as facts (especially in Jeffrey/board-safe views)
- No spend scaling without confirmed conversion signal
- Page 07 (Data Health) is the trust-control layer — its connector status determines confidence labels system-wide

### Operational
- Backend is .NET (ASP.NET). Never reference .php.
- Safe-to-Scale logic: Scale / Optimize Carefully / Diagnostic Only / Blocked — derived from Data Health trust assessment
- Every KPI block displays source, last-refreshed timestamp, and confidence badge
- No mid-sprint scope changes
- Staging-first deployment mandatory

### Integration Constraints
- CRM gclid/UTM capture: AWAITING DEV — build must degrade gracefully with seed data
- Call tracking (CallRail): NOT ACTIVE — system works without it, surfaces persistent warning
- GlobalAir .NET API endpoint patterns: OPEN — confirm with Clay before API scaffold
- GTM deployment across 8 servers: UNCONFIRMED — affects GA4 data reliability
- Enhanced conversions: UNCONFIRMED — affects attribution quality

### Graceful Degradation
For every blocked integration: build the interface abstraction, implement a stub returning seed data with `confidence_level = 'POSSIBLE'` and `data_source = 'seed'`, show warning badge "Source not connected — showing estimated data". When integration unblocks, swap stub for real implementation without touching other code.

## Open Questions (Architecture-Affecting Only)
1. When will CRM gclid/UTM capture be completed? Blocks closed-loop attribution and Tier 1 conversion validation.
2. Will CallRail activate before or after launch? Affects Tier 1 event completeness and QI accuracy.
3. Final notification routing: Teams, SendGrid, or both? Affects alert dispatch architecture.
4. Is GlobalAir.com listing DB accessible via existing .NET API or does a new endpoint layer need building?
5. Existing Azure subscription/tenant, or provision from scratch?
6. Does CRM support webhook push or is polling required? Affects attribution latency.
7. QI source-of-truth hierarchy when CRM, GA4, call tracking, and offline sources disagree?
8. SEMrush vs SpyFu — which competitive data provider to connect first via Windsor?

## Hard Blockers
| Blocker | Owner | Must Resolve Before | Status |
|---------|-------|---------------------|--------|
| Dev Lead hire/assignment | Casey + Clay | Phase 2 (Shell Build) | OPEN |
| GitHub repository creation | Clay | Phase 2 | OPEN |
| Azure DevOps Pipeline config | Clay + Dev Lead | Phase 4 (Automated QA) | OPEN |
| Dev environment provisioning | Thomas Galla | Phase 4 | OPEN |
| Staging environment provisioning | Thomas Galla | Phase 5 (Manual QA) | OPEN |
| Windsor.ai API credentials | Casey | Phase 3 (Logic & Integration) | OPEN |
| GA4 Data API service account | Casey | Phase 3 | OPEN |
| .NET endpoint patterns for hub apps | Clay | Phase 3 | OPEN |

## File Manifest (Load Order for Claude Code)
| Order | File | Purpose |
|-------|------|---------|
| 1 | `BUILD_BRIEF.md` (this file) | Architecture context, constraints, module scope |
| 2 | `DATA_MODEL.md` | All entities, fields, computed metrics, relationships, enums, confidence rules |
| 3 | `schema.sql` | Azure SQL CREATE TABLE statements — run first to create database |
| 4 | `api_routes.md` | Endpoint manifest — implement these for the API layer |
| Ref | `../../Downloads/files/avintelOS_page*.html` | Visual reference — 11 updated prototype pages |
| Ref | `../app/js/seed-data.js` | Data shape inventory — canonical field definitions |
| Ref | `../app/js/confidence.js` | Confidence system — port to ConfidenceService.cs |
| Ref | `../app/js/metrics-registry.js` | Metric definitions — port to MetricsService.cs |
| Ref | `../app/js/role-filter.js` | Role filtering — port to RoleFilterService.cs |

## Build Phases (Claude Code Execution Order)
1. **Database** — Run schema.sql. Verify tables. Run seed scripts.
2. **API Layer** — Implement endpoints from api_routes.md. Reference DATA_MODEL.md for computed metrics. Implement ConfidenceService, RoleFilterService, MetricsService.
3. **Frontend Shell** — React SPA scaffold: routing (11 routes), shared nav, design tokens, auth wrapper (MSAL), RoleSwitcher component.
4. **Module Build (dependency order):**
   - Data Health (07) FIRST — trust-control layer
   - Dashboard (01) SECOND — forces shared components
   - GA4 (02) + Organic (03) + PPC (05) parallel — live data integrations
   - Content (06) — depends on GA4 landing page data
   - Execution Cadence (04) — mostly CRUD, independent
   - Strategy pages (5A–5D) last — depend on earlier data
5. **Alert Engine** — After all data sources are flowing.
6. **Integration** — Wire frontend → API. Connect Azure Functions. Test end-to-end.
7. **QA** — DevOps Protocol Part 11 exit criteria. All breakpoints. Accessibility. Analytics events.

---
*Location: 12_TECH_STACK_AND_AI/AvINTELOS/docs/BUILD_BRIEF.md*
