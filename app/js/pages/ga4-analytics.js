/* =====================================================================
   AvIntelOS — Page 2: GA4 Analytics Hub
   Channel breakdown, landing page performance, engagement analysis
   ===================================================================== */

const GA4Analytics = (() => {

  function render(container) {
    const channels = Store.get('intel_ga4_channels') || [];
    const landingPages = Store.get('intel_ga4_landing_pages') || [];
    const settings = Store.get('intel_settings') || {};
    const catFilter = settings.category_filter || 'all';

    // Compute KPI aggregates from channels
    let totalSessions = 0, totalUsers = 0, totalConversions = 0, weightedEngagement = 0;
    channels.forEach(c => {
      totalSessions += c.sessions || 0;
      totalUsers += c.users || 0;
      totalConversions += c.conversions || 0;
      weightedEngagement += (c.sessions || 0) * (c.engagement_rate || 0);
    });
    const avgEngagement = totalSessions > 0 ? weightedEngagement / totalSessions : 0;

    // Filter landing pages by category
    const filteredPages = catFilter === 'all' ? landingPages : landingPages.filter(p => p.category === catFilter);

    let html = '<div class="domain-page">';

    // Contamination banner
    html += Components.contamBanner();

    html += Components.sectionHeader('GA4 Analytics Hub', 'Traffic, engagement, and conversion analysis');

    // ── Part A: KPI Overview ──
    html += Components.partHeader('PART A', 'KPI Overview');
    html += '<div class="row-grid row-grid-4">';
    html += Components.kpiTile('Sessions', Components.formatNumber(totalSessions), { confidence: 'PROBABLE', metricId: 'sessions' });
    html += Components.kpiTile('Users', Components.formatNumber(totalUsers), { confidence: 'PROBABLE' });
    html += Components.kpiTile('Engagement Rate', Components.formatPct(avgEngagement), { confidence: 'PROBABLE', metricId: 'engagement_rate_clean', subtitle: 'Signal Clean (Email_Open_ excluded)' });
    html += Components.kpiTile('Conversions', Components.formatNumber(totalConversions), { confidence: 'PROBABLE', metricId: 'conversion_rate' });
    html += '</div>';

    // ── Part B: Channel Breakdown ──
    html += Components.partHeader('PART B', 'Channel Breakdown');
    html += Components.table(
      [
        { key: 'channel', label: 'Channel' },
        { key: 'sessions', label: 'Sessions', render: (val) => Components.formatNumber(val) },
        { key: 'users', label: 'Users', render: (val) => Components.formatNumber(val) },
        { key: 'engagement_rate', label: 'Engagement Rate', render: (val) => Components.formatPct(val) },
        { key: 'conversions', label: 'Conversions', render: (val) => Components.formatNumber(val) },
        { key: 'confidence', label: 'Confidence', render: (val) => Confidence.badge(val) }
      ],
      channels,
      { id: 'tbl-ga4-channels', sortable: true, csvFilename: 'GA4_Channels' }
    );

    // ── Part C: Channel Sessions Chart ──
    html += Components.partHeader('PART C', 'Channel Sessions');
    html += Components.barChart(
      channels.map(c => ({ label: c.channel, value: c.sessions, displayValue: Components.formatNumber(c.sessions) })),
      { colorClass: 'bar-fill-navy' }
    );

    // ── Part D: Landing Page Performance ──
    html += Components.partHeader('PART D', 'Landing Page Performance');
    html += `<div style="margin-bottom:12px;">${Components.categoryFilter()}</div>`;
    html += Components.table(
      [
        { key: 'page', label: 'Page' },
        { key: 'sessions', label: 'Sessions', render: (val) => Components.formatNumber(val) },
        { key: 'bounce_rate', label: 'Bounce Rate', render: (val) => Components.formatPct(val) },
        { key: 'avg_time', label: 'Avg Time (s)', render: (val) => val != null ? val + 's' : '—' },
        { key: 'conversions', label: 'Conversions', render: (val) => Components.formatNumber(val) },
        { key: 'cvr', label: 'CVR', render: (val) => Components.formatPct(val) },
        { key: 'category', label: 'Category', render: (val) => Components.badge(val, 'blue') },
        { key: 'confidence', label: 'Confidence', render: (val) => Confidence.badge(val) }
      ],
      filteredPages,
      { id: 'tbl-ga4-pages', sortable: true, csvFilename: 'GA4_Landing_Pages' }
    );

    html += '</div>';
    container.innerHTML = html;
  }

  return { render };
})();
