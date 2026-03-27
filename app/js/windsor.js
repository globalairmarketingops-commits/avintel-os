/* =====================================================================
   AvIntelOS — Windsor.ai Integration Layer
   Fetches live data from /api/data/ endpoints and updates localStorage.
   Falls back to seed data if API is unavailable.
   ===================================================================== */

const Windsor = (() => {
  const CACHE_KEY = 'windsor_cache';
  const CACHE_TTL_HOURS = 24;
  const STALE_THRESHOLD_HOURS = 48;
  const API_BASE = 'data';

  // Maps endpoint slugs to static JSON filenames
  const DATA_FILES = {
    'ga4-channels':  'ga4_channels.json',
    'google-ads':    'google_ads_campaigns.json',
    'gsc-portfolio': 'gsc_portfolio.json',
    'gsc-top-pages': 'gsc_top_pages.json',
    'meta':          'meta.json'
  };

  const CONNECTORS = {
    google_ads: { label: 'Google Ads', icon: '&#128176;' },
    ga4:        { label: 'GA4',        icon: '&#128202;' },
    gsc:        { label: 'Search Console', icon: '&#128269;' },
    semrush:    { label: 'SEMrush',    icon: '&#128200;' },
    spyfu:      { label: 'SpyFu',      icon: '&#128373;' },
    clarity:    { label: 'Microsoft Clarity', icon: '&#128065;' },
    simpli_fi:  { label: 'Simpli.fi',  icon: '&#127919;' }
  };

  // ── Cache helpers ──────────────────────────────────────────────────

  function getCache() {
    const cache = Store.get(CACHE_KEY);
    if (cache) return cache;
    const defaults = {};
    Object.keys(CONNECTORS).forEach(k => { defaults[k] = { timestamp: null, data: null }; });
    return defaults;
  }

  function getCachedData(connector) {
    const cache = getCache();
    return cache[connector]?.data || null;
  }

  function getCacheAge(connector) {
    const cache = getCache();
    const ts = cache[connector]?.timestamp;
    if (!ts) return null;
    return (Date.now() - new Date(ts).getTime()) / (1000 * 60 * 60);
  }

  function isStale(connector) {
    const age = getCacheAge(connector);
    if (age === null) return true;
    return age > STALE_THRESHOLD_HOURS;
  }

  function isFresh(connector) {
    const age = getCacheAge(connector);
    if (age === null) return false;
    return age <= CACHE_TTL_HOURS;
  }

  function getStatus(connector) {
    const age = getCacheAge(connector);
    if (age === null) return 'pending';
    if (age <= CACHE_TTL_HOURS) return 'fresh';
    if (age <= STALE_THRESHOLD_HOURS) return 'aging';
    return 'stale';
  }

  function updateCache(connector, data) {
    const cache = getCache();
    cache[connector] = {
      timestamp: new Date().toISOString(),
      data: data
    };
    Store.set(CACHE_KEY, cache);
  }

  // ── API fetch helper ───────────────────────────────────────────────

  async function fetchEndpoint(endpoint) {
    try {
      const filename = DATA_FILES[endpoint] || endpoint;
      const response = await fetch(`${API_BASE}/${filename}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (e) {
      console.warn(`[Windsor] Failed to fetch ${endpoint}:`, e.message);
      return null;
    }
  }

  // ── GA4 fetch + transform ──────────────────────────────────────────

  async function fetchGA4() {
    const raw = await fetchEndpoint('ga4-channels');
    if (!raw || !raw.data) {
      console.warn('[Windsor] GA4 fetch failed — using cached/seed data');
      return getCachedData('ga4');
    }

    // Transform to intel_ga4_channels shape
    const channels = raw.data.map(ch => ({
      channel: ch.default_channel_group,
      sessions: ch.sessions,
      users: ch.totalusers,
      engagement_rate: parseFloat((ch.engagement_rate * 100).toFixed(1)),
      conversions: ch.conversions,
      revenue: 0,
      confidence: 'CONFIRMED',
      _confidence: 'CONFIRMED'
    }));

    Store.set('intel_ga4_channels', channels);
    updateCache('ga4', raw.data);

    // Update dashboard KPIs from GA4 data
    const totalSessions = channels.reduce((s, c) => s + c.sessions, 0);
    const totalConversions = channels.reduce((s, c) => s + c.conversions, 0);
    const totalEngaged = raw.data.reduce((s, c) => s + (c.engaged_sessions || 0), 0);
    const realEngagement = totalSessions > 0 ? ((totalEngaged / totalSessions) * 100).toFixed(1) : 0;

    // Update GA4 health with real engagement rate
    const healthGa4 = Store.get('intel_health_ga4') || {};
    healthGa4.real_engagement_rate = parseFloat(realEngagement);
    Store.set('intel_health_ga4', healthGa4);

    // Update dashboard KPIs
    const kpis = Store.get('intel_dashboard_kpis') || {};
    kpis.qi_volume = {
      value: totalConversions,
      delta: '',
      trend: 'stable',
      confidence: 'CONFIRMED',
      period: '30d',
      source: 'windsor_ga4'
    };
    kpis.site_health_score = {
      value: Math.round(parseFloat(realEngagement)),
      max: 100,
      confidence: 'CONFIRMED',
      source: 'windsor_ga4'
    };
    kpis.last_updated = new Date().toISOString();
    Store.set('intel_dashboard_kpis', kpis);

    // Update connector health
    updateConnectorHealth('ga4', 'connected');

    console.log(`[Windsor] GA4 data loaded: ${channels.length} channels, ${totalConversions} conversions`);
    return raw.data;
  }

  // ── Google Ads fetch + transform ───────────────────────────────────

  async function fetchGoogleAds() {
    const raw = await fetchEndpoint('google-ads');
    if (!raw || !raw.data) {
      console.warn('[Windsor] Google Ads fetch failed — using cached/seed data');
      return getCachedData('google_ads');
    }

    // Transform to intel_ppc_campaigns shape
    const campaigns = raw.data.map(c => ({
      campaign: c.campaign.replace(/\*\*/g, '').trim(),
      spend: 0,  // spend not in current API response — marked unknown
      clicks: c.clicks,
      impressions: c.impressions,
      ctr: parseFloat((c.ctr * 100).toFixed(1)),
      conversions: Math.round(c.conversions || 0),
      cpqi: c.cost_per_conversion ? parseFloat(c.cost_per_conversion.toFixed(2)) : 0,
      status: c.campaign.includes('Jets') ? 'On Hold' : 'Active',
      confidence: 'CONFIRMED',
      _confidence: 'CONFIRMED',
      category: c.category || 'unknown'
    }));

    Store.set('intel_ppc_campaigns', campaigns);
    updateCache('google_ads', raw.data);

    // Update dashboard CPQI
    const activeCampaigns = campaigns.filter(c => c.status === 'Active');
    const totalSpend = activeCampaigns.reduce((s, c) => s + c.spend, 0);
    const totalConv = activeCampaigns.reduce((s, c) => s + c.conversions, 0);
    const cpqi = totalConv > 0 ? Math.round(totalSpend / totalConv) : 0;

    const kpis = Store.get('intel_dashboard_kpis') || {};
    kpis.cpqi = {
      value: cpqi || kpis.cpqi?.value || 0,
      delta: '',
      trend: 'stable',
      confidence: cpqi > 0 ? 'CONFIRMED' : 'PROBABLE',
      period: '30d',
      source: 'windsor_google_ads'
    };
    Store.set('intel_dashboard_kpis', kpis);

    // Update connector health
    updateConnectorHealth('google_ads', 'connected');

    console.log(`[Windsor] Google Ads data loaded: ${campaigns.length} campaigns`);
    return raw.data;
  }

  // ── GSC fetch + transform ──────────────────────────────────────────

  async function fetchGSC() {
    const [portfolio, topPages] = await Promise.all([
      fetchEndpoint('gsc-portfolio'),
      fetchEndpoint('gsc-top-pages')
    ]);

    if (!portfolio || !portfolio.summary) {
      console.warn('[Windsor] GSC fetch failed — using cached/seed data');
      return getCachedData('gsc');
    }

    // Transform portfolio to intel_gsc_portfolio shape
    Store.set('intel_gsc_portfolio', {
      total_keywords: 0,  // not available from aggregate query
      monthly_clicks: portfolio.summary.total_clicks,
      avg_position: parseFloat(portfolio.summary.avg_position.toFixed(1)),
      avg_ctr: parseFloat((portfolio.summary.avg_ctr * 100).toFixed(1)),
      confidence: 'CONFIRMED',
      last_updated: portfolio.fetched_at
    });

    // Build category breakdown from top pages
    if (topPages && topPages.data) {
      const categories = {};
      topPages.data.forEach(p => {
        const cat = p.category || 'other';
        if (!categories[cat]) {
          categories[cat] = { category: cat, keywords: 0, clicks: 0, impressions: 0, positions: [], ctrs: [] };
        }
        categories[cat].keywords++;
        categories[cat].clicks += p.clicks;
        categories[cat].impressions += p.impressions;
        categories[cat].positions.push(p.position);
        categories[cat].ctrs.push(p.ctr);
      });

      const categoryData = Object.values(categories)
        .filter(c => c.category !== 'homepage' && c.category !== 'airport')
        .map(c => ({
          category: c.category.charAt(0).toUpperCase() + c.category.slice(1),
          keywords: c.keywords,
          clicks: c.clicks,
          impressions: c.impressions,
          avg_position: parseFloat((c.positions.reduce((a, b) => a + b, 0) / c.positions.length).toFixed(1)),
          ctr: parseFloat(((c.clicks / c.impressions) * 100).toFixed(1))
        }))
        .sort((a, b) => b.clicks - a.clicks);

      Store.set('intel_gsc_categories', categoryData);

      // Also build GA4 landing pages from GSC top pages (best available proxy)
      const landingPages = topPages.data
        .filter(p => p.page.includes('/aircraft-for-sale/'))
        .slice(0, 20)
        .map(p => ({
          page: p.page.replace('https://www.globalair.com', ''),
          sessions: p.clicks,  // using GSC clicks as proxy for sessions
          bounce_rate: 0,
          avg_time: 0,
          conversions: 0,
          cvr: 0,
          category: p.category || 'all',
          confidence: 'PROBABLE',
          _confidence: 'PROBABLE'
        }));

      Store.set('intel_ga4_landing_pages', landingPages);
    }

    updateCache('gsc', portfolio);
    updateConnectorHealth('gsc', 'connected');

    console.log(`[Windsor] GSC data loaded: ${portfolio.summary.total_clicks.toLocaleString()} clicks, ${portfolio.summary.avg_position.toFixed(1)} avg position`);
    return portfolio;
  }

  // ── Unconnected connectors ─────────────────────────────────────────

  function fetchSEMrush() {
    console.log('[Windsor] SEMrush — not connected');
    updateConnectorHealth('semrush', 'not_connected');
    return null;
  }

  function fetchSpyFu() {
    console.log('[Windsor] SpyFu — not connected');
    updateConnectorHealth('spyfu', 'not_connected');
    return null;
  }

  function fetchClarity() {
    console.log('[Windsor] Clarity — not connected');
    updateConnectorHealth('clarity', 'not_connected');
    return null;
  }

  function fetchSimpliFi() {
    console.log('[Windsor] Simpli.fi — not connected');
    updateConnectorHealth('simpli_fi', 'not_connected');
    return null;
  }

  // ── Connector health updater ───────────────────────────────────────

  function updateConnectorHealth(connectorKey, status) {
    const connectors = Store.get('intel_health_connectors') || {};
    connectors[connectorKey] = {
      status: status,
      last_check: new Date().toISOString()
    };
    Store.set('intel_health_connectors', connectors);
  }

  // ── Refresh all connected sources ──────────────────────────────────

  async function refreshAll() {
    console.log('[Windsor] Refreshing all connected data sources...');
    const results = await Promise.allSettled([
      fetchGA4(),
      fetchGoogleAds(),
      fetchGSC()
    ]);

    // Mark unconnected
    fetchSEMrush();
    fetchSpyFu();
    fetchClarity();
    fetchSimpliFi();

    const succeeded = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.filter(r => r.status === 'rejected' || !r.value).length;
    console.log(`[Windsor] Refresh complete: ${succeeded} succeeded, ${failed} failed/unavailable`);

    // Update movers with real data
    updateMovers();

    return { succeeded, failed };
  }

  // ── Update top movers from live data ───────────────────────────────

  function updateMovers() {
    const gscPortfolio = Store.get('intel_gsc_portfolio');
    const channels = Store.get('intel_ga4_channels');
    const campaigns = Store.get('intel_ppc_campaigns');

    const movers = [];

    if (gscPortfolio) {
      movers.push({ metric: 'GSC Avg Position', value: gscPortfolio.avg_position?.toString() || 'N/A', delta: 0, deltaLabel: 'Live data' });
      movers.push({ metric: 'GSC Monthly Clicks', value: (gscPortfolio.monthly_clicks || 0).toLocaleString(), delta: 0, deltaLabel: 'Live data' });
      movers.push({ metric: 'GSC Avg CTR', value: (gscPortfolio.avg_ctr || 0) + '%', delta: 0, deltaLabel: 'Live data' });
    }

    if (channels) {
      const organic = channels.find(c => c.channel === 'Organic Search');
      const paid = channels.find(c => c.channel === 'Paid Search');
      if (organic) movers.push({ metric: 'Organic Sessions', value: organic.sessions.toLocaleString(), delta: 0, deltaLabel: 'Live data' });
      if (paid) movers.push({ metric: 'Paid Sessions', value: paid.sessions.toLocaleString(), delta: 0, deltaLabel: 'Live data' });
    }

    if (campaigns) {
      campaigns.filter(c => c.status === 'Active').forEach(c => {
        movers.push({ metric: `${c.campaign} CTR`, value: c.ctr + '%', delta: 0, deltaLabel: 'Live data' });
      });
    }

    if (movers.length > 0) {
      Store.set('intel_movers', movers.slice(0, 10));
    }
  }

  // ── Fetch data freshness metadata ──────────────────────────────────

  async function getDataMeta() {
    return await fetchEndpoint('meta');
  }

  // ── Public API ─────────────────────────────────────────────────────

  function getConnectors() {
    return CONNECTORS;
  }

  function getAllStatuses() {
    const statuses = {};
    Object.keys(CONNECTORS).forEach(k => {
      statuses[k] = {
        ...CONNECTORS[k],
        status: getStatus(k),
        age: getCacheAge(k),
        stale: isStale(k)
      };
    });
    return statuses;
  }

  return {
    getCache, getCachedData, getCacheAge,
    isStale, isFresh, getStatus, getAllStatuses, getConnectors,
    fetchGA4, fetchGoogleAds, fetchGSC, fetchSEMrush, fetchSpyFu, fetchClarity, fetchSimpliFi,
    updateCache, refreshAll, getDataMeta,
    CACHE_TTL_HOURS, STALE_THRESHOLD_HOURS
  };
})();
