/* =====================================================================
   AvIntelOS — Page 5: PPC & Paid Analytics
   Campaign performance, spend efficiency, conversion signal status
   ===================================================================== */

const PPCAnalytics = (() => {

  function render(container) {
    const campaigns = Store.get('intel_ppc_campaigns') || [];

    // Compute KPIs from active campaigns only
    const active = campaigns.filter(c => c.status !== 'On Hold');
    let totalSpend = 0, totalClicks = 0, totalConversions = 0;
    active.forEach(c => {
      totalSpend += c.spend || 0;
      totalClicks += c.clicks || 0;
      totalConversions += c.conversions || 0;
    });
    const avgCpqi = totalConversions > 0 ? totalSpend / totalConversions : 0;

    let html = '<div class="domain-page">';

    html += Components.sectionHeader('PPC & Paid Analytics', 'Campaign performance, spend efficiency, and conversion signal status');

    // Jets ON HOLD warning
    html += Components.alertBanner(
      '<strong>Jets campaign ON HOLD</strong> — do not launch until piston conversion signal is confirmed clean. Conversion signal: UNCONFIRMED. No spend scaling until tracking integrity is verified.',
      'warning'
    );

    // ── Part A: KPI Overview ──
    html += Components.partHeader('PART A', 'KPI Overview (Active Campaigns)');
    html += '<div class="row-grid row-grid-4">';
    html += Components.kpiTile('Total Spend', Components.formatCurrency(totalSpend), { confidence: 'PROBABLE', metricId: 'cpqi', subtitle: '30-day period' });
    html += Components.kpiTile('Total Clicks', Components.formatNumber(totalClicks), { confidence: 'PROBABLE', metricId: 'ctr' });
    html += Components.kpiTile('Total Conversions', Components.formatNumber(totalConversions), { confidence: 'PROBABLE', metricId: 'conversion_rate' });
    html += Components.kpiTile('Avg CPQI', Components.formatCurrency(avgCpqi), { confidence: 'PROBABLE', metricId: 'cpqi' });
    html += '</div>';

    // ── Part B: Campaign Performance ──
    html += Components.partHeader('PART B', 'Campaign Performance');
    html += Components.table(
      [
        { key: 'campaign', label: 'Campaign' },
        { key: 'spend', label: 'Spend', render: (val) => Components.formatCurrency(val) },
        { key: 'clicks', label: 'Clicks', render: (val) => Components.formatNumber(val) },
        { key: 'impressions', label: 'Impressions', render: (val) => Components.formatNumber(val) },
        { key: 'ctr', label: 'CTR', render: (val) => Components.formatPct(val) },
        { key: 'conversions', label: 'Conversions', render: (val) => Components.formatNumber(val) },
        { key: 'cpqi', label: 'CPQI', render: (val) => val > 0 ? Components.formatCurrency(val) : '—' },
        { key: 'status', label: 'Status', render: (val) => Components.badge(val, val === 'Active' ? 'green' : 'amber') },
        { key: 'confidence', label: 'Confidence', render: (val) => Confidence.badge(val) }
      ],
      campaigns,
      { id: 'tbl-ppc', sortable: true, csvFilename: 'PPC_Campaigns' }
    );

    html += '</div>';
    container.innerHTML = html;
  }

  return { render };
})();
