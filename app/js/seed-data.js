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

    Store.markInitialized();
    console.log('[AvIntelOS] Seed data initialized successfully.');
  }

  return { initialize };
})();
