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

    // ── Part C: Search Term Waste Index ──
    const waste = Store.get('intel_ppc_search_term_waste') || {};
    const wasteTerms = Store.get('intel_ppc_waste_terms') || [];
    html += Components.partHeader('PART C', 'Search Term Waste Index');

    html += Components.alertBanner(
      '<strong>Search Term Waste Rate:</strong> Percentage of paid spend on irrelevant or non-buyer-intent queries. High waste signals negative keyword gaps. Source: Google Ads Search Terms report.',
      'info'
    );

    html += '<div class="row-grid row-grid-4">';
    html += Components.kpiTile('Waste Rate', Components.formatPct(waste.waste_rate), {
      confidence: waste.confidence || 'PROBABLE',
      metricId: 'search_term_waste',
      subtitle: 'Target: < 15%'
    });
    html += Components.kpiTile('Irrelevant Spend', Components.formatCurrency(waste.irrelevant_spend), {
      confidence: waste.confidence || 'PROBABLE',
      subtitle: 'of ' + Components.formatCurrency(waste.total_spend) + ' total'
    });
    html += Components.kpiTile('Wasted Clicks', Components.formatNumber(waste.wasted_clicks), {
      confidence: waste.confidence || 'PROBABLE',
      subtitle: waste.wasted_click_pct ? Components.formatPct(waste.wasted_click_pct) + ' of total clicks' : '—'
    });
    html += Components.kpiTile('Negative KW Coverage', Components.formatPct(waste.negative_kw_coverage), {
      confidence: waste.confidence || 'PROBABLE',
      subtitle: waste.negatives_added + ' negatives active'
    });
    html += '</div>';

    // Waste terms table
    html += Components.table(
      [
        { key: 'term', label: 'Search Term' },
        { key: 'impressions', label: 'Impressions', render: (val) => Components.formatNumber(val) },
        { key: 'clicks', label: 'Clicks', render: (val) => Components.formatNumber(val) },
        { key: 'spend', label: 'Spend', render: (val) => Components.formatCurrency(val) },
        { key: 'conversions', label: 'Conv.', render: (val) => Components.formatNumber(val) },
        { key: 'waste_reason', label: 'Waste Reason' },
        { key: 'action', label: 'Recommended Action', render: (val) => Components.badge(val, val === 'Add Negative' ? 'red' : 'amber') }
      ],
      wasteTerms,
      { id: 'tbl-search-waste', sortable: true, csvFilename: 'Search_Term_Waste' }
    );

    // Waste threshold alert
    if (waste.waste_rate && waste.waste_rate > 20) {
      html += Components.alertBanner(
        'Search Term Waste Rate exceeds 20% — immediate negative keyword audit required. Review P4 (search term harvesting) and P6 (negative keyword expansion).',
        'error'
      );
    }

    html += '</div>';
    container.innerHTML = html;
  }

  return { render };
})();
