/* =====================================================================
   AvIntelOS — Page 7: Data Health & System Status
   Connector status, GA4 property health, AI crawlers, email infra
   ===================================================================== */

const DataHealth = (() => {

  function render(container) {
    const connectors = Store.get('intel_health_connectors') || {};
    const ga4 = Store.get('intel_health_ga4') || {};
    const crawlers = Store.get('intel_health_crawlers') || {};
    const emailServers = Store.get('intel_health_email') || [];

    let html = '<div class="domain-page">';

    html += Components.sectionHeader('Data Health & System Status', 'Connector status, signal integrity, infrastructure health');

    // ── Part A: Connector Status ──
    html += Components.partHeader('PART A', 'Connector Status');
    html += '<div class="row-grid row-grid-4">';

    const connectorLabels = {
      google_ads: 'Google Ads',
      ga4: 'GA4',
      gsc: 'Google Search Console',
      semrush: 'SEMrush',
      spyfu: 'SpyFu',
      clarity: 'Microsoft Clarity',
      simpli_fi: 'Simpli.fi'
    };

    Object.entries(connectorLabels).forEach(([key, label]) => {
      const conn = connectors[key] || {};
      const status = (conn.status || 'pending').replace(/_/g, ' ');
      html += Components.statusCard(label, status.charAt(0).toUpperCase() + status.slice(1), {
        lastUpdated: conn.last_check
      });
    });
    html += '</div>';

    // ── Part B: GA4 Property Health ──
    html += Components.partHeader('PART B', 'GA4 Property Health');
    html += '<div class="row-grid row-grid-2">';

    // Left column: key health items
    html += '<div style="display:flex;flex-direction:column;gap:12px;">';
    html += Components.kpiTile('Property ID', ga4.property_id || '—', { confidence: 'CONFIRMED' });
    html += Components.kpiTile('Contamination Status', ga4.contamination_status || '—', {
      confidence: 'CONFIRMED',
      subtitle: ga4.contamination_start ? 'Since ' + ga4.contamination_start : ''
    });
    html += Components.kpiTile('Conversion Signal', ga4.conversion_signal || '—', { confidence: 'CONFIRMED' });
    html += Components.kpiTile('Enhanced Conversions', ga4.enhanced_conversions || '—', { confidence: 'CONFIRMED' });
    html += '</div>';

    // Right column: engagement rate gauge
    html += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;">';
    html += Components.gauge(ga4.real_engagement_rate || 0, 100, {
      label: 'Real Engagement', unit: '%', thresholds: { red: 30, amber: 60 }
    });
    html += `<div style="font-size:13px;color:var(--ga-muted);text-align:center;">
      Reported: <span style="color:var(--ga-red);font-weight:700;">${ga4.reported_engagement_rate || 0}%</span> (contaminated)<br>
      Actual: <span style="color:var(--ga-green-dark);font-weight:700;">${ga4.real_engagement_rate || 0}%</span> (clean)
    </div>`;
    html += '</div>';
    html += '</div>';

    // ── Part C: AI Crawler Access ──
    html += Components.partHeader('PART C', 'AI Crawler Access');
    const crawlerRows = Object.entries(crawlers).map(([name, data]) => ({
      crawler: name,
      status: data.status || 'unknown',
      owner: data.owner || '—',
      _confidence: 'CONFIRMED'
    }));
    html += Components.table(
      [
        { key: 'crawler', label: 'Crawler' },
        { key: 'status', label: 'Status', render: (val) => Components.badge(val, val === 'blocked' ? 'red' : 'green') },
        { key: 'owner', label: 'Owner' }
      ],
      crawlerRows,
      { id: 'tbl-crawlers', sortable: true, csvFilename: 'AI_Crawlers' }
    );

    html += Components.alertBanner(
      'All AI crawlers currently blocked at robots.txt and WAF level. T2 ticket scoped — owner: Thomas Galla (BluegrassNet). Unblocking required for AEO visibility.',
      'warning'
    );

    // ── Part D: Email Infrastructure ──
    html += Components.partHeader('PART D', 'Email Infrastructure');
    const emailRows = emailServers.map(s => ({
      ...s,
      _confidence: 'CONFIRMED'
    }));
    html += Components.table(
      [
        { key: 'server', label: 'Server' },
        { key: 'purpose', label: 'Purpose' },
        { key: 'status', label: 'Status', render: (val) => Components.badge(val, val === 'active' ? 'green' : 'amber') },
        { key: 'spf', label: 'SPF', render: (val) => protocolBadge(val) },
        { key: 'dkim', label: 'DKIM', render: (val) => protocolBadge(val) },
        { key: 'dmarc', label: 'DMARC', render: (val) => protocolBadge(val) }
      ],
      emailRows,
      { id: 'tbl-email', sortable: true, csvFilename: 'Email_Infrastructure' }
    );

    html += '</div>';
    container.innerHTML = html;
  }

  function protocolBadge(val) {
    if (!val || val === 'unknown') return Components.badge('Unknown', 'amber');
    if (val === 'N/A') return Components.badge('N/A', 'blue');
    if (val === 'pass' || val === 'valid') return Components.badge(val, 'green');
    return Components.badge(val, 'red');
  }

  return { render };
})();
