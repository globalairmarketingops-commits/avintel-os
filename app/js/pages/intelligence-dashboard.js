/* =====================================================================
   AvIntelOS — Page 1: Intelligence Dashboard
   Prime Directive health, KPI overview, top movers, decision layer
   ===================================================================== */

const IntelDashboard = (() => {

  function render(container) {
    const kpis = Store.get('intel_dashboard_kpis') || {};
    const primeDirective = Store.get('intel_prime_directive') || [];
    const movers = Store.get('intel_movers') || [];

    const qi = kpis.qi_volume || {};
    const cpqi = kpis.cpqi || {};
    const revenue = kpis.revenue_mrr || {};
    const health = kpis.site_health_score || {};

    let html = '<div class="domain-page">';

    // Contamination banner
    html += Components.contamBanner();

    // Section header
    html += Components.sectionHeader('Intelligence Dashboard', 'GlobalAir.com Marketing Operations Command Center');

    // ── Part A: KPI Overview ──
    html += Components.partHeader('PART A', 'KPI Overview');
    html += '<div class="row-grid row-grid-4">';
    html += Components.kpiTile('QI Volume', Components.formatNumber(qi.value), {
      delta: qi.delta, trend: qi.trend, confidence: qi.confidence, metricId: 'qi',
      subtitle: qi.period ? qi.period + ' period' : ''
    });
    html += Components.kpiTile('CPQI', Components.formatCurrency(qi.value ? cpqi.value : cpqi.value), {
      delta: cpqi.delta, trend: cpqi.trend, confidence: cpqi.confidence, metricId: 'cpqi'
    });
    html += Components.kpiTile('Revenue MRR', Components.formatCurrency(revenue.value), {
      delta: revenue.delta, trend: revenue.trend, confidence: revenue.confidence, metricId: 'revenue'
    });
    // Site Health Score — gauge inside a kpi-tile wrapper
    const healthVisible = health.confidence ? RoleFilter.shouldShow(health.confidence) : true;
    if (healthVisible) {
      html += `<div class="kpi-tile" role="group" aria-label="Site Health Score: ${health.value || 0}%">
        <div class="kpi-label">SITE HEALTH ${health.confidence ? Confidence.badge(health.confidence) : ''}</div>
        ${Components.gauge(health.value || 0, health.max || 100, { label: 'Health', unit: '%', thresholds: { red: 40, amber: 70 } })}
      </div>`;
    }
    html += '</div>';

    // ── Part B: Prime Directive Health ──
    html += Components.partHeader('PART B', 'Prime Directive Health');
    html += '<div class="row-grid row-grid-5">';
    primeDirective.forEach(item => {
      if (!item.confidence || RoleFilter.shouldShow(item.confidence)) {
        html += Components.statusCard(item.name, statusLabel(item.status), {
          owner: item.detail,
          lastUpdated: kpis.last_updated
        });
      }
    });
    html += '</div>';

    // ── Part C: Top 10 Movers ──
    html += Components.partHeader('PART C', 'Top 10 Movers');
    html += Components.topMoversStrip(movers);

    // ── Part D: Decision Layer ──
    const redItems = primeDirective.filter(item => item.status === 'red');
    if (redItems.length > 0) {
      html += Components.partHeader('PART D', 'Decision Layer — Immediate Action Required');
      redItems.forEach(item => {
        html += Components.alertBanner(
          `<strong>${item.name}:</strong> ${item.detail} <span style="font-size:11px;color:var(--ga-muted);margin-left:8px;">Metric: ${item.metric}</span>`,
          'error'
        );
      });
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function statusLabel(status) {
    const labels = { green: 'On Track', amber: 'At Risk', red: 'Critical' };
    return labels[status] || status;
  }

  return { render };
})();
