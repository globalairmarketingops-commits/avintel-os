/* =====================================================================
   AvIntelOS — Seed Data & First-Launch Initialization
   Runs exactly once on first load. Populates all intel_* keys.
   ===================================================================== */

const SeedData = (() => {
  function initialize() {
    if (Store.isInitialized()) return;
    console.log('[AvIntelOS] First launch — initializing seed data...');

    // Settings
    Store.set('intel_settings', {
      current_role: 'casey',
      date_range: '30d',
      compare_mode: 'wow',
      category_filter: 'all',
      signal_clean_only: true,
      contam_banner_visible: true
    });

    // Dashboard KPIs
    Store.set('intel_dashboard_kpis', {
      qi_volume: { value: 142, delta: '+12', trend: 'up', confidence: 'PROBABLE', period: '30d', source: 'seed' },
      cpqi: { value: 67, delta: '-$8', trend: 'up', confidence: 'PROBABLE', period: '30d', source: 'seed' },
      revenue_mrr: { value: 48500, delta: '+$2,100', trend: 'up', confidence: 'POSSIBLE', period: 'current', source: 'seed' },
      site_health_score: { value: 62, max: 100, confidence: 'POSSIBLE', source: 'seed' },
      last_updated: '2026-03-21T12:00:00Z'
    });

    // Prime Directive Health
    Store.set('intel_prime_directive', [
      { id: 1, name: 'QI Growth', metric: '142 QI/mo', status: 'amber', confidence: 'PROBABLE', detail: 'Signal unconfirmed — actual QI may differ' },
      { id: 2, name: 'At-Risk Broker', metric: '1 account', status: 'red', confidence: 'CONFIRMED', detail: 'Midwest Piston Sales — renewal April 5' },
      { id: 3, name: 'Advertiser Revenue', metric: '$48.5K MRR', status: 'amber', confidence: 'POSSIBLE', detail: 'ARPA baseline not established' },
      { id: 4, name: 'Media Hub Authority', metric: '0 evergreen/wk', status: 'red', confidence: 'CONFIRMED', detail: '100% reactive content — redirect in progress' },
      { id: 5, name: 'Ops Discipline', metric: 'Sprint 1', status: 'green', confidence: 'CONFIRMED', detail: 'Scrum adopted March 23, 2026' }
    ]);

    // Top 10 Movers
    Store.set('intel_movers', [
      { metric: 'Organic CTR', value: '3.2%', delta: -0.4, deltaLabel: '-0.4%' },
      { metric: 'Cessna CPC', value: '$2.84', delta: 0.31, deltaLabel: '+$0.31' },
      { metric: 'Helicopter Position', value: '1.8', delta: -0.3, deltaLabel: '-0.3 (better)' },
      { metric: 'Piston Sessions', value: '4,210', delta: -180, deltaLabel: '-180' },
      { metric: 'Email Open Rate', value: '24.1%', delta: 1.2, deltaLabel: '+1.2%' },
      { metric: 'Bounce Rate (Jets)', value: '38%', delta: -3, deltaLabel: '-3% (better)' },
      { metric: 'Controller Overlap', value: '72.1%', delta: 0.8, deltaLabel: '+0.8%' },
      { metric: 'Featured Fill Rate', value: '70%', delta: 5, deltaLabel: '+5%' },
      { metric: 'Content Pipeline', value: '2 in-progress', delta: 1, deltaLabel: '+1' },
      { metric: 'Beechcraft Position', value: '7.1', delta: 1.2, deltaLabel: '+1.2 (worse)' }
    ]);

    // GA4 Channel Data
    Store.set('intel_ga4_channels', [
      { channel: 'Organic Search', sessions: 28400, users: 21200, engagement_rate: 71.2, conversions: 89, revenue: 0, confidence: 'PROBABLE', _confidence: 'PROBABLE' },
      { channel: 'Direct', sessions: 12800, users: 9600, engagement_rate: 68.5, conversions: 42, revenue: 0, confidence: 'PROBABLE', _confidence: 'PROBABLE' },
      { channel: 'Paid Search', sessions: 8200, users: 7100, engagement_rate: 64.8, conversions: 28, revenue: 0, confidence: 'PROBABLE', _confidence: 'PROBABLE' },
      { channel: 'Email', sessions: 5600, users: 4800, engagement_rate: 52.1, conversions: 12, revenue: 0, confidence: 'POSSIBLE', _confidence: 'POSSIBLE' },
      { channel: 'Referral', sessions: 3200, users: 2800, engagement_rate: 58.3, conversions: 8, revenue: 0, confidence: 'PROBABLE', _confidence: 'PROBABLE' },
      { channel: 'Social', sessions: 2100, users: 1900, engagement_rate: 45.6, conversions: 3, revenue: 0, confidence: 'PROBABLE', _confidence: 'PROBABLE' }
    ]);

    // GA4 Landing Pages
    Store.set('intel_ga4_landing_pages', [
      { page: '/helicopters-for-sale', sessions: 4200, bounce_rate: 32, avg_time: 185, conversions: 18, cvr: 0.43, category: 'helicopter', confidence: 'PROBABLE', _confidence: 'PROBABLE' },
      { page: '/cessna-aircraft-for-sale', sessions: 3800, bounce_rate: 35, avg_time: 162, conversions: 14, cvr: 0.37, category: 'piston', confidence: 'PROBABLE', _confidence: 'PROBABLE' },
      { page: '/private-jets-for-sale', sessions: 3200, bounce_rate: 41, avg_time: 148, conversions: 8, cvr: 0.25, category: 'jet', confidence: 'PROBABLE', _confidence: 'PROBABLE' },
      { page: '/beechcraft-for-sale', sessions: 2100, bounce_rate: 38, avg_time: 155, conversions: 6, cvr: 0.29, category: 'piston', confidence: 'PROBABLE', _confidence: 'PROBABLE' },
      { page: '/turboprop-aircraft', sessions: 1800, bounce_rate: 36, avg_time: 170, conversions: 5, cvr: 0.28, category: 'turboprop', confidence: 'PROBABLE', _confidence: 'PROBABLE' },
      { page: '/spec', sessions: 6400, bounce_rate: 68, avg_time: 42, conversions: 0, cvr: 0, category: 'all', confidence: 'CONFIRMED', _confidence: 'CONFIRMED' }
    ]);

    // GSC Keyword Portfolio
    Store.set('intel_gsc_portfolio', {
      total_keywords: 201432,
      monthly_clicks: 157200,
      avg_position: 24.8,
      avg_ctr: 2.1,
      confidence: 'CONFIRMED',
      last_updated: '2026-03-20T00:00:00Z'
    });

    // GSC Category Breakdown
    Store.set('intel_gsc_categories', [
      { category: 'Jets', keywords: 42100, clicks: 31200, impressions: 1850000, avg_position: 18.4, ctr: 1.7 },
      { category: 'Piston', keywords: 68200, clicks: 52400, impressions: 2200000, avg_position: 22.1, ctr: 2.4 },
      { category: 'Helicopter', keywords: 28400, clicks: 34600, impressions: 980000, avg_position: 8.2, ctr: 3.5 },
      { category: 'Turboprop', keywords: 18900, clicks: 12800, impressions: 680000, avg_position: 28.6, ctr: 1.9 },
      { category: 'FBO/Airport', keywords: 22300, clicks: 14200, impressions: 520000, avg_position: 15.3, ctr: 2.7 },
      { category: 'Other', keywords: 21532, clicks: 12000, impressions: 440000, avg_position: 32.1, ctr: 2.7 }
    ]);

    // Competitive Intelligence
    Store.set('intel_competitive_overlap', {
      globalair_only: 48200,
      controller_only: 25300,
      overlap: 52100,
      total_market: 125600,
      confidence: 'PROBABLE',
      last_updated: '2026-03-18T00:00:00Z'
    });

    Store.set('intel_competitive_auction', [
      { week: '2026-03-03', impression_share: 42.1, overlap_rate: 68.2, position_above: 31.5 },
      { week: '2026-03-10', impression_share: 40.8, overlap_rate: 69.1, position_above: 33.2 },
      { week: '2026-03-17', impression_share: 43.5, overlap_rate: 67.8, position_above: 30.1 }
    ]);

    Store.set('intel_competitive_features', [
      { feature: 'BrokerNet', globalair: true, controller: false, advantage: 'globalair' },
      { feature: 'Verified Listings', globalair: true, controller: false, advantage: 'globalair' },
      { feature: 'Editorial Content', globalair: true, controller: false, advantage: 'globalair' },
      { feature: 'AEO Optimization', globalair: false, controller: false, advantage: 'none' },
      { feature: 'Geofencing (Simpli.fi)', globalair: true, controller: false, advantage: 'globalair' },
      { feature: 'Airport Resource Center', globalair: true, controller: false, advantage: 'globalair' },
      { feature: 'Listing Volume', globalair: false, controller: true, advantage: 'controller' },
      { feature: 'Budget (estimated)', globalair: false, controller: true, advantage: 'controller' }
    ]);

    // PPC Analytics
    Store.set('intel_ppc_campaigns', [
      { campaign: 'Cessna (Piston)', spend: 2250, clicks: 792, impressions: 18400, ctr: 4.3, conversions: 12, cpqi: 187.50, status: 'Active', confidence: 'PROBABLE', _confidence: 'PROBABLE' },
      { campaign: 'Beechcraft (Piston)', spend: 2250, clicks: 684, impressions: 16200, ctr: 4.2, conversions: 9, cpqi: 250.00, status: 'Active', confidence: 'PROBABLE', _confidence: 'PROBABLE' },
      { campaign: 'Cirrus (Piston)', spend: 2250, clicks: 756, impressions: 15800, ctr: 4.8, conversions: 11, cpqi: 204.55, status: 'Active', confidence: 'PROBABLE', _confidence: 'PROBABLE' },
      { campaign: 'Jets', spend: 0, clicks: 0, impressions: 0, ctr: 0, conversions: 0, cpqi: 0, status: 'On Hold', confidence: 'CONFIRMED', _confidence: 'CONFIRMED' }
    ]);

    // Content Performance
    Store.set('intel_content_pillars', [
      { pillar: 'Aircraft Buying Guides', articles: 2, sessions: 1200, engagement_rate: 78.4, conversions: 4 },
      { pillar: 'Market Analysis', articles: 8, sessions: 4800, engagement_rate: 65.2, conversions: 2 },
      { pillar: 'Operating Costs & Ownership', articles: 1, sessions: 800, engagement_rate: 82.1, conversions: 3 },
      { pillar: 'Aviation Lifestyle', articles: 12, sessions: 6200, engagement_rate: 54.8, conversions: 1 },
      { pillar: 'News & Intelligence', articles: 142, sessions: 28400, engagement_rate: 42.6, conversions: 5 }
    ]);

    // Data Health
    Store.set('intel_health_connectors', {
      google_ads: { status: 'pending', last_check: null },
      ga4: { status: 'pending', last_check: null },
      gsc: { status: 'pending', last_check: null },
      semrush: { status: 'pending', last_check: null },
      spyfu: { status: 'pending', last_check: null },
      clarity: { status: 'unmaintained', last_check: '2022-06-01T00:00:00Z' },
      simpli_fi: { status: 'pending', last_check: null }
    });

    Store.set('intel_health_ga4', {
      property_id: 'G-K0N37V9FEB',
      contamination_status: 'ACTIVE',
      contamination_start: '2023-06-01',
      real_engagement_rate: 69,
      reported_engagement_rate: 17,
      enhanced_conversions: 'UNCONFIRMED',
      conversion_signal: 'UNCONFIRMED'
    });

    Store.set('intel_health_crawlers', {
      GPTBot: { status: 'blocked', owner: 'Thomas Galla' },
      ClaudeBot: { status: 'blocked', owner: 'Thomas Galla' },
      PerplexityBot: { status: 'blocked', owner: 'Thomas Galla' },
      YouBot: { status: 'blocked', owner: 'Thomas Galla' },
      CCBot: { status: 'blocked', owner: 'Thomas Galla' },
      'Google-Extended': { status: 'blocked', owner: 'Thomas Galla' }
    });

    Store.set('intel_health_email', [
      { server: 'mail.aircraft-listings.com', purpose: 'Legacy broadcast', status: 'active', spf: 'unknown', dkim: 'unknown', dmarc: 'unknown' },
      { server: 'bms2.aircraft-listings.com', purpose: 'BrokerNet sends', status: 'active', spf: 'unknown', dkim: 'unknown', dmarc: 'unknown' },
      { server: 'bms4.aircraft-listings.com', purpose: 'BrokerNet sends', status: 'active', spf: 'unknown', dkim: 'unknown', dmarc: 'unknown' },
      { server: 'mail.globalair.com', purpose: 'Primary sends', status: 'active', spf: 'unknown', dkim: 'unknown', dmarc: 'unknown' },
      { server: 'mail2.globalair.com', purpose: 'Overflow/secondary', status: 'active', spf: 'unknown', dkim: 'unknown', dmarc: 'unknown' },
      { server: 'mail.ganmail.com', purpose: 'Internal (GanMail)', status: 'active', spf: 'N/A', dkim: 'N/A', dmarc: 'N/A' }
    ]);

    // Windsor cache seed (empty)
    Store.set('windsor_cache', {
      google_ads: { timestamp: null, data: null },
      ga4: { timestamp: null, data: null },
      gsc: { timestamp: null, data: null },
      semrush: { timestamp: null, data: null },
      spyfu: { timestamp: null, data: null },
      clarity: { timestamp: null, data: null },
      simpli_fi: { timestamp: null, data: null }
    });

    // ---- Revenue Intelligence ----
    Store.set('intel_revenue_summary', {
      total_revenue: { value: 412000, label: 'Total Revenue', confidence: 'POSSIBLE', source: 'mvs_estimate', trend: 'up', delta: '+3.2%' },
      arpa: { value: 1850, label: 'ARPA', confidence: 'POSSIBLE', source: 'mvs_estimate', trend: 'flat', delta: '+0.4%' },
      retention_rate: { value: 0.82, label: 'Retention Rate', confidence: 'POSSIBLE', source: 'manual_estimate', trend: 'down', delta: '-2.1%' },
      renewal_risk_count: { value: 7, label: 'At-Risk Renewals', confidence: 'PROBABLE', source: 'manual_estimate', trend: 'up', delta: '+2' },
      last_updated: '2026-03-27T12:00:00Z'
    });
    Store.set('intel_revenue_streams', [
      { stream: 'Aircraft Listings', amount: 198000, pct_of_total: 48.1, trend: 'up', confidence: 'POSSIBLE' },
      { stream: 'Featured Placements', amount: 87000, pct_of_total: 21.1, trend: 'up', confidence: 'POSSIBLE' },
      { stream: 'Display Advertising', amount: 52000, pct_of_total: 12.6, trend: 'flat', confidence: 'POSSIBLE' },
      { stream: 'BrokerNet Subscriptions', amount: 41000, pct_of_total: 10.0, trend: 'up', confidence: 'POSSIBLE' },
      { stream: 'Sponsorships & Events', amount: 22000, pct_of_total: 5.3, trend: 'up', confidence: 'POSSIBLE' },
      { stream: 'FBO/Airport Services', amount: 12000, pct_of_total: 2.9, trend: 'flat', confidence: 'POSSIBLE' }
    ]);
    Store.set('intel_revenue_per_qi', [
      { category: 'Jets', qis: 84, revenue: 142000, rev_per_qi: 1690, trend: 'up', confidence: 'POSSIBLE' },
      { category: 'Piston', qis: 312, revenue: 128000, rev_per_qi: 410, trend: 'flat', confidence: 'POSSIBLE' },
      { category: 'Helicopter', qis: 67, revenue: 78000, rev_per_qi: 1164, trend: 'up', confidence: 'POSSIBLE' },
      { category: 'Turboprop', qis: 41, revenue: 52000, rev_per_qi: 1268, trend: 'flat', confidence: 'POSSIBLE' },
      { category: 'FBO/Airport', qis: 18, revenue: 12000, rev_per_qi: 667, trend: 'up', confidence: 'POSSIBLE' }
    ]);
    Store.set('intel_revenue_accounts', [
      { advertiser: 'Elliott Aviation', tier: 'Premium', revenue_current: 28500, revenue_prior: 27200, renewal_date: '2026-06-15', risk_score: 12, utilization_pct: 91, confidence: 'PROBABLE' },
      { advertiser: 'Textron Aviation', tier: 'Premium', revenue_current: 24800, revenue_prior: 26100, renewal_date: '2026-05-01', risk_score: 38, utilization_pct: 74, confidence: 'PROBABLE' },
      { advertiser: 'JetAviva', tier: 'Standard', revenue_current: 18200, revenue_prior: 17900, renewal_date: '2026-07-20', risk_score: 8, utilization_pct: 85, confidence: 'PROBABLE' },
      { advertiser: 'Premier Aircraft Sales', tier: 'Standard', revenue_current: 14600, revenue_prior: 16800, renewal_date: '2026-04-30', risk_score: 62, utilization_pct: 45, confidence: 'PROBABLE' },
      { advertiser: 'Wipaire Inc', tier: 'Basic', revenue_current: 8400, revenue_prior: 9100, renewal_date: '2026-05-15', risk_score: 48, utilization_pct: 52, confidence: 'PROBABLE' }
    ]);
    Store.set('intel_revenue_risk', [
      { advertiser: 'Premier Aircraft Sales', renewal_date: '2026-04-30', revenue_trend: 'declining', inquiry_trend: 'declining', utilization: 45, risk_score: 62, confidence: 'PROBABLE' },
      { advertiser: 'Wipaire Inc', renewal_date: '2026-05-15', revenue_trend: 'declining', inquiry_trend: 'flat', utilization: 52, risk_score: 48, confidence: 'PROBABLE' },
      { advertiser: 'Textron Aviation', renewal_date: '2026-05-01', revenue_trend: 'declining', inquiry_trend: 'flat', utilization: 74, risk_score: 38, confidence: 'PROBABLE' }
    ]);
    Store.set('intel_revenue_reconciliation', {
      billing_value: null, mvs_value: 412000, manual_value: 0, delta: null, completeness_pct: 48, freshness: '2026-03-27', status: 'MVS only — Billing/CRM not connected', confidence: 'POSSIBLE'
    });

    // ---- Broker Command Center ----
    Store.set('intel_broker_summary', {
      active_brokers: { value: 223, label: 'Active Brokers', confidence: 'PROBABLE', trend: 'flat', delta: '+1' },
      high_risk_brokers: { value: 14, label: 'High-Risk Brokers', confidence: 'PROBABLE', trend: 'up', delta: '+3' },
      avg_inquiry_quality: { value: 72, label: 'Avg Inquiry Quality', confidence: 'PROBABLE', trend: 'flat', delta: '-1.2%' },
      avg_response_latency: { value: null, label: 'Avg Response Latency', confidence: 'POSSIBLE', trend: 'unknown', delta: 'N/A' },
      last_updated: '2026-03-27T12:00:00Z'
    });
    Store.set('intel_broker_health', [
      { broker_name: 'Elliott Aviation', category_mix: 'Jets, Turboprop', inquiry_volume: 48, inquiry_quality: 88, response_latency: null, listing_quality: 92, package_utilization: 91, revenue_trend: 'up', renewal_date: '2026-06-15', health_score: 89, confidence: 'PROBABLE' },
      { broker_name: 'JetAviva', category_mix: 'Jets', inquiry_volume: 36, inquiry_quality: 82, response_latency: null, listing_quality: 87, package_utilization: 85, revenue_trend: 'up', renewal_date: '2026-07-20', health_score: 84, confidence: 'PROBABLE' },
      { broker_name: 'Premier Aircraft Sales', category_mix: 'Piston', inquiry_volume: 22, inquiry_quality: 64, response_latency: null, listing_quality: 58, package_utilization: 45, revenue_trend: 'declining', renewal_date: '2026-04-30', health_score: 42, confidence: 'PROBABLE' },
      { broker_name: 'Wipaire Inc', category_mix: 'Piston, Amphibious', inquiry_volume: 15, inquiry_quality: 71, response_latency: null, listing_quality: 65, package_utilization: 52, revenue_trend: 'declining', renewal_date: '2026-05-15', health_score: 51, confidence: 'PROBABLE' },
      { broker_name: 'Helistream', category_mix: 'Helicopter', inquiry_volume: 28, inquiry_quality: 78, response_latency: null, listing_quality: 81, package_utilization: 68, revenue_trend: 'flat', renewal_date: '2026-08-01', health_score: 72, confidence: 'PROBABLE' }
    ]);
    Store.set('intel_broker_movement', [
      { broker_name: 'SkyTech Aviation', direction: 'to Controller', category: 'Piston', reason: 'Price pressure, perceived higher traffic', date: '2026-02-15', revenue_impact: -12400 },
      { broker_name: 'Atlas Air Sales', direction: 'from Controller', category: 'Jets', reason: 'Stale listings, better GlobalAir lead quality', date: '2026-03-01', revenue_impact: 18600 }
    ]);
    Store.set('intel_broker_renewal_risk', [
      { broker: 'Premier Aircraft Sales', renewal_date: '2026-04-30', inquiry_trend: 'declining', visibility_trend: 'declining', utilization_trend: 'declining', risk_score: 62, primary_reason: 'Declining inquiries + low utilization' },
      { broker: 'Wipaire Inc', renewal_date: '2026-05-15', inquiry_trend: 'flat', visibility_trend: 'declining', utilization_trend: 'declining', risk_score: 48, primary_reason: 'Declining visibility + underusing premium features' }
    ]);
    Store.set('intel_broker_upsell', [
      { broker: 'Helistream', current_tier: 'Standard', unused_features: 'Featured Placement, Social Spotlight', visibility_loss: '8% IS decline in helicopter', demand_opportunity: 'Helicopter demand +12% MoM', upsell_reason: 'Strong demand + declining visibility = premium placement opportunity' },
      { broker: 'JetAviva', current_tier: 'Standard', unused_features: 'BrokerNet Premium, Geofencing', visibility_loss: '3% IS decline in jets', demand_opportunity: 'Stable jet demand', upsell_reason: 'High health score + untapped BrokerNet features' }
    ]);

    // ---- Inventory & Listing Intelligence ----
    Store.set('intel_inventory_summary', {
      active_listings: { value: 4847, label: 'Active Listings', confidence: 'PROBABLE', trend: 'flat', delta: '+12' },
      stale_listings: { value: 892, label: 'Stale Listings', confidence: 'PROBABLE', trend: 'up', delta: '+47' },
      avg_listing_quality: { value: 64, label: 'Avg Listing Quality', confidence: 'POSSIBLE', trend: 'flat', delta: '-0.8' },
      avg_listing_cvr: { value: 2.1, label: 'Avg Listing CVR %', confidence: 'PROBABLE', trend: 'flat', delta: '+0.1%' },
      last_updated: '2026-03-27T12:00:00Z'
    });
    Store.set('intel_inventory_listings', [
      { listing_id: 'GA-2847', broker: 'Elliott Aviation', category: 'Jets', make_model: 'Citation CJ3+', photo_count: 42, spec_completeness: 96, price_visible: true, last_refresh: '2026-03-25', quality_score: 94, detail_views: 1240, inquiries: 38, cvr: 3.06, confidence: 'PROBABLE' },
      { listing_id: 'GA-3102', broker: 'JetAviva', category: 'Jets', make_model: 'Phenom 300E', photo_count: 38, spec_completeness: 92, price_visible: true, last_refresh: '2026-03-24', quality_score: 91, detail_views: 980, inquiries: 28, cvr: 2.86, confidence: 'PROBABLE' },
      { listing_id: 'GA-1456', broker: 'Premier Aircraft Sales', category: 'Piston', make_model: 'Cessna 182T', photo_count: 8, spec_completeness: 64, price_visible: false, last_refresh: '2026-02-18', quality_score: 38, detail_views: 420, inquiries: 4, cvr: 0.95, confidence: 'PROBABLE' },
      { listing_id: 'GA-2201', broker: 'Wipaire Inc', category: 'Piston', make_model: 'Cessna 206H', photo_count: 14, spec_completeness: 78, price_visible: true, last_refresh: '2026-03-10', quality_score: 68, detail_views: 310, inquiries: 8, cvr: 2.58, confidence: 'PROBABLE' },
      { listing_id: 'GA-4455', broker: 'Helistream', category: 'Helicopter', make_model: 'Bell 407GXi', photo_count: 22, spec_completeness: 85, price_visible: true, last_refresh: '2026-03-22', quality_score: 82, detail_views: 560, inquiries: 18, cvr: 3.21, confidence: 'PROBABLE' }
    ]);
    Store.set('intel_inventory_broker_health', [
      { broker: 'Elliott Aviation', listing_count: 48, avg_quality: 91, stale_ratio: 0.04, avg_cvr: 2.94, hidden_price_rate: 0.02, photo_deficiency: 0.00 },
      { broker: 'JetAviva', listing_count: 32, avg_quality: 87, stale_ratio: 0.06, avg_cvr: 2.72, hidden_price_rate: 0.03, photo_deficiency: 0.03 },
      { broker: 'Helistream', listing_count: 18, avg_quality: 79, stale_ratio: 0.11, avg_cvr: 2.88, hidden_price_rate: 0.06, photo_deficiency: 0.06 },
      { broker: 'Wipaire Inc', listing_count: 24, avg_quality: 65, stale_ratio: 0.21, avg_cvr: 2.14, hidden_price_rate: 0.17, photo_deficiency: 0.13 },
      { broker: 'Premier Aircraft Sales', listing_count: 15, avg_quality: 42, stale_ratio: 0.33, avg_cvr: 1.12, hidden_price_rate: 0.40, photo_deficiency: 0.27 }
    ]);
    Store.set('intel_inventory_premium_lift', [
      { tier: 'Premium', avg_detail_views: 890, avg_cvr: 3.24, avg_inquiries: 24, avg_quality: 88, lift_vs_baseline: '+1.42%' },
      { tier: 'Standard', avg_detail_views: 340, avg_cvr: 1.82, avg_inquiries: 7, avg_quality: 58, lift_vs_baseline: 'baseline' }
    ]);
    Store.set('intel_inventory_missing_impact', {
      priced_cvr: 2.64, hidden_price_cvr: 0.91, hidden_price_penalty: -1.73,
      high_photo_cvr: 2.98, low_photo_cvr: 1.24, low_photo_penalty: -1.74,
      complete_spec_cvr: 2.82, incomplete_spec_cvr: 1.48, incomplete_spec_penalty: -1.34
    });

    // ---- Market Demand & Opportunity Map ----
    Store.set('intel_market_summary', {
      rising_models: { value: 8, label: 'Rising Models', confidence: 'PROBABLE', trend: 'up', delta: '+2' },
      rising_categories: { value: 3, label: 'Rising Categories', confidence: 'PROBABLE', trend: 'flat', delta: '0' },
      regional_hotspots: { value: 5, label: 'Regional Hotspots', confidence: 'PROBABLE', trend: 'up', delta: '+1' },
      imbalance_alerts: { value: 4, label: 'Imbalance Alerts', confidence: 'PROBABLE', trend: 'up', delta: '+2' },
      last_updated: '2026-03-27T12:00:00Z'
    });
    Store.set('intel_market_models', [
      { make: 'Cirrus', model: 'SR22', category: 'Piston', demand_momentum: 84, inventory_count: 42, avg_listing_quality: 72, imbalance_score: 2.0, organic_rank_trend: 'improving', paid_cpc_trend: 'rising', opportunity_score: 88, confidence: 'PROBABLE' },
      { make: 'Cessna', model: '182 Skylane', category: 'Piston', demand_momentum: 76, inventory_count: 68, avg_listing_quality: 58, imbalance_score: 1.1, organic_rank_trend: 'stable', paid_cpc_trend: 'stable', opportunity_score: 72, confidence: 'PROBABLE' },
      { make: 'Beechcraft', model: 'Bonanza A36', category: 'Piston', demand_momentum: 71, inventory_count: 31, avg_listing_quality: 64, imbalance_score: 2.3, organic_rank_trend: 'declining', paid_cpc_trend: 'rising', opportunity_score: 78, confidence: 'PROBABLE' },
      { make: 'Pilatus', model: 'PC-12', category: 'Turboprop', demand_momentum: 68, inventory_count: 18, avg_listing_quality: 88, imbalance_score: 3.8, organic_rank_trend: 'improving', paid_cpc_trend: 'rising', opportunity_score: 82, confidence: 'PROBABLE' },
      { make: 'Robinson', model: 'R44', category: 'Helicopter', demand_momentum: 62, inventory_count: 54, avg_listing_quality: 71, imbalance_score: 1.1, organic_rank_trend: 'stable', paid_cpc_trend: 'stable', opportunity_score: 58, confidence: 'PROBABLE' }
    ]);
    Store.set('intel_market_categories', [
      { category: 'Piston', query_growth: 14.2, ppc_growth: 8.7, listing_view_growth: 11.3, repeat_interest_growth: 16.8, opportunity_state: 'Expanding' },
      { category: 'Turboprop', query_growth: 9.1, ppc_growth: 12.4, listing_view_growth: 7.2, repeat_interest_growth: 8.9, opportunity_state: 'Expanding' },
      { category: 'Helicopter', query_growth: 4.8, ppc_growth: 2.1, listing_view_growth: 3.9, repeat_interest_growth: 5.2, opportunity_state: 'Stable' },
      { category: 'Jets', query_growth: 6.2, ppc_growth: -1.8, listing_view_growth: 4.1, repeat_interest_growth: 7.4, opportunity_state: 'Mixed' },
      { category: 'FBO/Airport', query_growth: 18.4, ppc_growth: 0, listing_view_growth: 22.1, repeat_interest_growth: 28.6, opportunity_state: 'Accelerating' }
    ]);
    Store.set('intel_market_emerging', [
      { model: 'Cirrus SR22T', growth_30d: 22.4, growth_90d: 38.1, competitive_gap: 'Large — Controller weak', content_gap: 'Missing ownership guide', listing_gap: 'Adequate inventory', alert_status: 'active' },
      { model: 'Pilatus PC-12 NGX', growth_30d: 18.7, growth_90d: 31.2, competitive_gap: 'Medium — contested', content_gap: 'Missing comparison page', listing_gap: 'Low inventory', alert_status: 'active' },
      { model: 'Diamond DA62', growth_30d: 15.2, growth_90d: 24.8, competitive_gap: 'Large — both weak', content_gap: 'No model page', listing_gap: 'Very low inventory', alert_status: 'watch' }
    ]);
    Store.set('intel_market_imbalance', [
      { category_model: 'Pilatus PC-12', demand_score: 68, quality_inventory: 18, imbalance_score: 3.8, interpretation: 'Strong demand, thin quality inventory — broker acquisition opportunity' },
      { category_model: 'Beechcraft Bonanza A36', demand_score: 71, quality_inventory: 31, imbalance_score: 2.3, interpretation: 'Rising demand outpacing listing refresh — content + listing quality push needed' },
      { category_model: 'Cirrus SR22', demand_score: 84, quality_inventory: 42, imbalance_score: 2.0, interpretation: 'High demand, moderate inventory — paid + SEO intensification zone' },
      { category_model: 'Diamond DA62', demand_score: 52, quality_inventory: 6, imbalance_score: 8.7, interpretation: 'Emerging demand, near-zero inventory — early content play, broker outreach' }
    ]);

    Store.markInitialized();
    console.log('[AvIntelOS] Seed data initialized successfully.');
  }

  return { initialize };
})();
