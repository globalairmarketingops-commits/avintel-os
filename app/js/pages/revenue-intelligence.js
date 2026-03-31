/* =====================================================================
   AvIntelOS — Page: Revenue Intelligence
   Revenue summary, streams, per-QI analysis, account performance, renewal risk
   ===================================================================== */

const RevenueIntelligence = (() => {

  function render(container) {
    const summary = Store.get('intel_revenue_summary') || {};
    const streams = Store.get('intel_revenue_streams') || [];
    const revenuePerQi = Store.get('intel_revenue_per_qi') || [];
    const accounts = Store.get('intel_revenue_accounts') || [];
    const renewal = Store.get('intel_revenue_risk') || [];
    const reconciliation = Store.get('intel_revenue_reconciliation') || {};

    let html = '<div class="domain-page">';

    // Revenue truth hierarchy banner
    html += Components.alertBanner(
      '<strong>Revenue truth hierarchy:</strong> Billing/CRM > MVS > Manual. CRM/billing connection currently BLOCKED — revenue data sourced from MVS and estimates.',
      'warning'
    );

    html += Components.sectionHeader('Revenue Intelligence', 'Total revenue, streams, retention, and renewal risk management');

    // ── Part A: Revenue Summary Strip ──
    html += Components.partHeader('PART A', 'Revenue Summary');
    html += '<div class="row-grid row-grid-4">';
    html += Components.kpiTile('Total Revenue', Components.formatCurrency(summary.total_revenue), {
      delta: summary.delta, trend: summary.trend, confidence: summary.confidence, metricId: 'revenue'
    });
    html += Components.kpiTile('ARPA', Components.formatCurrency(summary.arpa), {
      delta: summary.arpa_delta, trend: summary.arpa_trend, confidence: summary.confidence, metricId: 'arpa'
    });
    html += Components.kpiTile('Retention Rate', Components.formatPct(summary.retention_rate), {
      delta: summary.retention_delta, trend: summary.retention_trend, confidence: summary.confidence, metricId: 'retention'
    });
    html += Components.kpiTile('Renewal Risk Count', Components.formatNumber(summary.risk_count), {
      delta: summary.risk_delta, trend: summary.risk_trend, confidence: summary.confidence, metricId: 'renewal_risk'
    });
    html += '</div>';

    // ── Part B: Revenue by Stream ──
    html += Components.partHeader('PART B', 'Revenue by Stream');
    const streamRows = streams.map(s => ({
      ...s,
      _confidence: s.confidence || 'PROBABLE'
    }));
    html += Components.table(
      [
        { key: 'stream', label: 'Stream' },
        { key: 'amount', label: 'Amount', render: (val) => Components.formatCurrency(val) },
        { key: 'pct_of_total', label: '% of Total', render: (val) => Components.formatPct(val) },
        { key: 'trend', label: 'Trend', render: (val) => trendBadge(val) },
        { key: 'confidence', label: 'Confidence', render: (val) => Confidence.badge(val) }
      ],
      streamRows,
      { id: 'tbl-revenue-streams', sortable: true, csvFilename: 'Revenue_Streams' }
    );
    if (streams.length > 0) {
      html += Components.barChart(
        streams.map(s => ({ label: s.stream, value: s.amount, displayValue: Components.formatCurrency(s.amount) })),
        { colorClass: 'bar-fill-green' }
      );
    }

    // ── Part C: Revenue per QI by Category ──
    html += Components.partHeader('PART C', 'Revenue per QI by Category');
    const revPerQiRows = revenuePerQi.map(r => ({
      ...r,
      _confidence: r.confidence || 'PROBABLE'
    }));
    html += Components.table(
      [
        { key: 'category', label: 'Category' },
        { key: 'qis', label: 'QIs', render: (val) => Components.formatNumber(val) },
        { key: 'revenue', label: 'Revenue', render: (val) => Components.formatCurrency(val) },
        { key: 'rev_per_qi', label: 'Rev/QI', render: (val) => Components.formatCurrency(val) },
        { key: 'trend', label: 'Trend', render: (val) => trendBadge(val) },
        { key: 'confidence', label: 'Confidence', render: (val) => Confidence.badge(val) }
      ],
      revPerQiRows,
      { id: 'tbl-revenue-per-qi', sortable: true, csvFilename: 'Revenue_Per_QI' }
    );

    // ── Part D: Account Tier Performance ──
    html += Components.partHeader('PART D', 'Account Tier Performance');
    const accountRows = accounts.map(a => ({
      ...a,
      _confidence: a.confidence || 'PROBABLE'
    }));
    html += Components.table(
      [
        { key: 'advertiser', label: 'Advertiser' },
        { key: 'tier', label: 'Tier' },
        { key: 'revenue_current', label: 'Current Revenue', render: (val) => Components.formatCurrency(val) },
        { key: 'revenue_prior', label: 'Prior Revenue', render: (val) => Components.formatCurrency(val) },
        { key: 'renewal_date', label: 'Renewal Date', render: (val) => Components.formatDate(val) },
        { key: 'risk_score', label: 'Risk Score', render: (val) => riskScoreBadge(val) },
        { key: 'utilization_pct', label: 'Utilization', render: (val) => Components.formatPct(val) },
        { key: 'confidence', label: 'Confidence', render: (val) => Confidence.badge(val) }
      ],
      accountRows,
      { id: 'tbl-revenue-accounts', sortable: true, csvFilename: 'Account_Tier_Performance' }
    );

    // ── Part E: Renewal Risk Queue ──
    html += Components.partHeader('PART E', 'Renewal Risk Queue');
    const highRisk = renewal.filter(r => r.risk_score >= 7);
    if (highRisk.length > 0) {
      html += Components.alertBanner(
        `<strong>${highRisk.length} high-risk renewal(s)</strong> — ${highRisk.map(r => r.advertiser).join(', ')}`,
        'error'
      );
    }
    const renewalRows = renewal.map(r => ({
      ...r,
      _confidence: r.confidence || 'PROBABLE'
    }));
    html += Components.table(
      [
        { key: 'advertiser', label: 'Advertiser' },
        { key: 'renewal_date', label: 'Renewal Date', render: (val) => Components.formatDate(val) },
        { key: 'revenue_trend', label: 'Revenue Trend', render: (val) => trendBadge(val) },
        { key: 'inquiry_trend', label: 'Inquiry Trend', render: (val) => trendBadge(val) },
        { key: 'utilization', label: 'Utilization', render: (val) => Components.formatPct(val) },
        { key: 'risk_score', label: 'Risk Score', render: (val) => riskScoreBadge(val) },
        { key: 'confidence', label: 'Confidence', render: (val) => Confidence.badge(val) }
      ],
      renewalRows,
      { id: 'tbl-renewal-risk', sortable: true, csvFilename: 'Renewal_Risk_Queue' }
    );

    // ── Revenue Reconciliation ──
    html += Components.partHeader('PART F', 'Revenue Reconciliation');
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">';
    html += Components.kpiTile('Billing/CRM', Components.formatCurrency(reconciliation.billing_value), { confidence: 'CONFIRMED' });
    html += Components.kpiTile('MVS Value', Components.formatCurrency(reconciliation.mvs_value), { confidence: 'PROBABLE' });
    html += Components.kpiTile('Manual Adjustment', Components.formatCurrency(reconciliation.manual_value), { confidence: 'UNCONFIRMED' });
    html += Components.kpiTile('Delta', Components.formatCurrency(reconciliation.delta), { confidence: 'PROBABLE' });
    html += Components.kpiTile('Completeness', Components.formatPct(reconciliation.completeness_pct), { confidence: 'CONFIRMED' });
    html += '</div>';

    html += '</div>';
    container.innerHTML = html;
  }

  function trendBadge(val) {
    if (val === 'up') return Components.badge('↑ Up', 'green');
    if (val === 'down') return Components.badge('↓ Down', 'red');
    return Components.badge('→ Flat', 'blue');
  }

  function riskScoreBadge(score) {
    if (score >= 7) return Components.badge(`${score}/10 HIGH`, 'red');
    if (score >= 4) return Components.badge(`${score}/10 MED`, 'amber');
    return Components.badge(`${score}/10 LOW`, 'green');
  }

  return { render };
})();
