/* =====================================================================
   AvIntelOS — Page: Broker Command
   Broker health, movement, renewal risk, upsell opportunities
   ===================================================================== */

const BrokerCommand = (() => {

  function render(container) {
    const summary = Store.get('intel_broker_summary') || {};
    const health = Store.get('intel_broker_health') || [];
    const movement = Store.get('intel_broker_movement') || [];
    const renewal = Store.get('intel_broker_renewal_risk') || [];
    const upsell = Store.get('intel_broker_upsell') || [];

    let html = '<div class="domain-page">';

    html += Components.sectionHeader('Broker Command', 'Broker health, performance, renewal risk, and upsell opportunities');

    // Response latency warning
    html += Components.alertBanner(
      '<strong>Response latency capture NOT ACTIVE</strong> — broker health scores exclude response-time weighting. Integration with broker response tracking in development.',
      'warning'
    );

    // ── Part A: Broker Summary Strip ──
    html += Components.partHeader('PART A', 'Broker Summary');
    html += '<div class="row-grid row-grid-4">';
    html += Components.kpiTile('Active Brokers', Components.formatNumber(summary.active_brokers), {
      delta: summary.brokers_delta, trend: summary.brokers_trend, confidence: summary.confidence, metricId: 'broker_count'
    });
    html += Components.kpiTile('High-Risk Brokers', Components.formatNumber(summary.high_risk_brokers), {
      delta: summary.risk_delta, trend: summary.risk_trend, confidence: summary.confidence, metricId: 'renewal_risk'
    });
    html += Components.kpiTile('Avg Inquiry Quality', Components.formatPct(summary.avg_inquiry_quality), {
      delta: summary.quality_delta, trend: summary.quality_trend, confidence: summary.confidence, metricId: 'inquiry_quality'
    });
    html += Components.kpiTile('Avg Response Latency', summary.avg_response_latency + 'h', {
      delta: summary.latency_delta, trend: summary.latency_trend, confidence: 'UNCONFIRMED', metricId: 'response_latency'
    });
    html += '</div>';

    // ── Part B: Broker Health Table ──
    html += Components.partHeader('PART B', 'Broker Health');
    const healthRows = health.map(b => ({
      ...b,
      _confidence: b.confidence || 'PROBABLE'
    }));
    html += Components.table(
      [
        { key: 'broker_name', label: 'Broker' },
        { key: 'category_mix', label: 'Category Mix', render: (val) => val || '—' },
        { key: 'inquiry_volume', label: 'Inquiries', render: (val) => Components.formatNumber(val) },
        { key: 'inquiry_quality', label: 'Inquiry Quality', render: (val) => Components.formatPct(val) },
        { key: 'response_latency', label: 'Response Latency', render: (val) => val ? val + 'h' : '—' },
        { key: 'listing_quality', label: 'Listing Quality', render: (val) => Components.formatPct(val) },
        { key: 'package_utilization', label: 'Package Util.', render: (val) => Components.formatPct(val) },
        { key: 'revenue_trend', label: 'Revenue Trend', render: (val) => trendBadge(val) },
        { key: 'renewal_date', label: 'Renewal Date', render: (val) => Components.formatDate(val) },
        { key: 'health_score', label: 'Health Score', render: (val) => healthScoreBadge(val) },
        { key: 'confidence', label: 'Confidence', render: (val) => Confidence.badge(val) }
      ],
      healthRows,
      { id: 'tbl-broker-health', sortable: true, csvFilename: 'Broker_Health' }
    );

    // ── Part C: Broker Movement Feed ──
    html += Components.partHeader('PART C', 'Broker Movement Feed');
    const movementRows = movement.map(m => ({
      ...m,
      _confidence: m.confidence || 'PROBABLE'
    }));
    html += Components.table(
      [
        { key: 'broker_name', label: 'Broker' },
        { key: 'direction', label: 'Direction', render: (val) => directionBadge(val) },
        { key: 'category', label: 'Category' },
        { key: 'reason', label: 'Reason' },
        { key: 'date', label: 'Date', render: (val) => Components.formatDate(val) },
        { key: 'revenue_impact', label: 'Revenue Impact', render: (val) => Components.formatCurrency(val) }
      ],
      movementRows,
      { id: 'tbl-broker-movement', sortable: true, csvFilename: 'Broker_Movement' }
    );

    // ── Part D: Renewal Risk Board ──
    html += Components.partHeader('PART D', 'Renewal Risk Board');
    const renewalRows = renewal.map(r => ({
      ...r,
      _confidence: r.confidence || 'PROBABLE'
    }));
    html += Components.table(
      [
        { key: 'broker', label: 'Broker' },
        { key: 'renewal_date', label: 'Renewal Date', render: (val) => Components.formatDate(val) },
        { key: 'inquiry_trend', label: 'Inquiry Trend', render: (val) => trendBadge(val) },
        { key: 'visibility_trend', label: 'Visibility Trend', render: (val) => trendBadge(val) },
        { key: 'utilization_trend', label: 'Utilization Trend', render: (val) => trendBadge(val) },
        { key: 'risk_score', label: 'Risk Score', render: (val) => riskScoreBadge(val) },
        { key: 'primary_reason', label: 'Primary Reason' }
      ],
      renewalRows,
      { id: 'tbl-broker-renewal', sortable: true, csvFilename: 'Broker_Renewal_Risk' }
    );

    // ── Part E: Upsell Opportunity Board ──
    html += Components.partHeader('PART E', 'Upsell Opportunity Board');
    const upsellRows = upsell.map(u => ({
      ...u,
      _confidence: u.confidence || 'PROBABLE'
    }));
    html += Components.table(
      [
        { key: 'broker', label: 'Broker' },
        { key: 'current_tier', label: 'Current Tier' },
        { key: 'unused_features', label: 'Unused Features' },
        { key: 'visibility_loss', label: 'Visibility Loss', render: (val) => Components.formatPct(val) },
        { key: 'demand_opportunity', label: 'Demand Opportunity' },
        { key: 'upsell_reason', label: 'Why Upsell?' }
      ],
      upsellRows,
      { id: 'tbl-broker-upsell', sortable: true, csvFilename: 'Broker_Upsell_Opportunities' }
    );

    html += '</div>';
    container.innerHTML = html;
  }

  function trendBadge(val) {
    if (val === 'up') return Components.badge('↑ Up', 'green');
    if (val === 'down') return Components.badge('↓ Down', 'red');
    return Components.badge('→ Flat', 'blue');
  }

  function directionBadge(val) {
    if (val === 'inbound') return Components.badge('→ Inbound', 'green');
    if (val === 'outbound') return Components.badge('← Outbound', 'red');
    return Components.badge(val, 'blue');
  }

  function healthScoreBadge(score) {
    if (score >= 8) return Components.badge(`${score}/10 STRONG`, 'green');
    if (score >= 6) return Components.badge(`${score}/10 STABLE`, 'blue');
    if (score >= 4) return Components.badge(`${score}/10 AT RISK`, 'amber');
    return Components.badge(`${score}/10 CRITICAL`, 'red');
  }

  function riskScoreBadge(score) {
    if (score >= 7) return Components.badge(`${score}/10 HIGH`, 'red');
    if (score >= 4) return Components.badge(`${score}/10 MED`, 'amber');
    return Components.badge(`${score}/10 LOW`, 'green');
  }

  return { render };
})();
