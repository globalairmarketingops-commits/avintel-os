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

    // ── Part A2: Decision Confidence Bar ──
    const allConf = Object.values(kpis).filter(k => k && k.confidence);
    const confirmed = allConf.filter(k => k.confidence === 'CONFIRMED').length;
    const probable = allConf.filter(k => k.confidence === 'PROBABLE').length;
    const possible = allConf.filter(k => k.confidence === 'POSSIBLE').length;
    const total = allConf.length || 1;
    const confPct = Math.round((confirmed / total) * 100);
    const probPct = Math.round((probable / total) * 100);
    const possPct = Math.round((possible / total) * 100);

    html += `<div style="margin:20px 0 24px 0;">`;
    html += Components.partHeader('A2', 'Decision Confidence');
    html += `<div style="display:flex;align-items:center;gap:16px;margin-top:8px;">`;
    html += `<div style="flex:1;height:28px;border-radius:6px;overflow:hidden;display:flex;background:var(--ga-off-white);">`;
    if (confPct > 0) html += `<div style="width:${confPct}%;background:var(--ga-green);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--ga-navy);">${confPct}%</div>`;
    if (probPct > 0) html += `<div style="width:${probPct}%;background:#F59E0B;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--ga-charcoal);">${probPct}%</div>`;
    if (possPct > 0) html += `<div style="width:${possPct}%;background:var(--ga-muted-light);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--ga-charcoal);">${possPct}%</div>`;
    html += `</div>`;
    html += `<span style="font-size:13px;font-weight:600;color:var(--ga-navy);white-space:nowrap;">Decision Confidence: ${confPct}%</span>`;
    html += `</div></div>`;

    // ── Part A3: Scale Safety Flag ──
    const healthGA4 = Store.get('intel_health_ga4') || {};
    const healthConnectors = Store.get('intel_health_connectors') || {};
    const callTrackingActive = false; // Known: NOT ACTIVE
    const crmConnected = false; // Known: BLOCKED
    const conversionConfirmed = healthGA4.conversion_signal === 'confirmed';
    const ga4Clean = healthGA4.contamination_status !== 'ACTIVE';

    let safetyLevel = 'green';
    let safetyLabel = 'Safe to Scale';
    let safetyDetail = 'Core attribution signals passing.';

    if (!conversionConfirmed || !callTrackingActive) {
      safetyLevel = 'yellow';
      safetyLabel = 'Diagnose First';
      safetyDetail = 'Conversion signal unconfirmed or call tracking inactive.';
    }
    if (!crmConnected && !callTrackingActive && !conversionConfirmed) {
      safetyLevel = 'red';
      safetyLabel = 'Tracking Compromised';
      safetyDetail = 'CRM blocked, call tracking inactive, conversion signal unconfirmed. Attribution unreliable for scaling decisions.';
    }

    const safetyColors = { green: 'var(--ga-green)', yellow: '#F59E0B', red: 'var(--ga-red)' };
    const safetyTextColors = { green: 'var(--ga-navy)', yellow: 'var(--ga-charcoal)', red: '#FFFFFF' };

    html += `<div style="margin:0 0 24px 0;">`;
    html += Components.partHeader('A3', 'Scale Safety');
    html += `<div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:var(--ga-radius);background:${safetyColors[safetyLevel]};margin-top:8px;">`;
    html += `<span style="font-size:20px;">${safetyLevel === 'green' ? '&#9989;' : safetyLevel === 'yellow' ? '&#9888;' : '&#9940;'}</span>`;
    html += `<div>`;
    html += `<div style="font-family:var(--ga-font-display);font-weight:700;font-size:15px;color:${safetyTextColors[safetyLevel]};">${safetyLabel}</div>`;
    html += `<div style="font-size:12px;color:${safetyTextColors[safetyLevel]};opacity:0.85;margin-top:2px;">${safetyDetail}</div>`;
    html += `</div></div></div>`;

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

    // ── Part E: Top 5 Revenue Actions ──
    html += Components.partHeader('PART E', 'Top 5 Revenue Actions');
    const revenueActions = [
      { action: 'Lock QI definition and activate CallRail', impact: 'Unlocks true CPQI and phone attribution (~90% of buyer activity)', urgency: 'Critical', owner: 'Casey / Dev' },
      { action: 'Confirm conversion signal on piston campaigns', impact: 'Enables Jets campaign launch and spend scaling', urgency: 'Critical', owner: 'Casey' },
      { action: 'Unblock CRM/billing integration', impact: 'Revenue truth, ARPA, and offline conversion loop', urgency: 'High', owner: 'Dev / Clay' },
      { action: 'Defend at-risk piston broker (Premier Aircraft)', impact: 'Protect ~$14.6K revenue, prevent Controller migration', urgency: 'High', owner: 'Ian / Casey' },
      { action: 'Deploy GTM consistently across all 8 servers', impact: 'Fix tag gaps, enable enhanced conversions audit', urgency: 'Medium', owner: 'Thomas Galla' }
    ];
    html += `<div style="display:grid;gap:10px;margin-top:12px;">`;
    revenueActions.forEach((a, i) => {
      const urgencyColor = a.urgency === 'Critical' ? 'var(--ga-red)' : a.urgency === 'High' ? '#F59E0B' : 'var(--ga-blue)';
      html += `<div style="display:flex;align-items:flex-start;gap:12px;padding:12px 16px;background:var(--ga-off-white);border-radius:var(--ga-radius);border-left:3px solid ${urgencyColor};">`;
      html += `<span style="font-family:var(--ga-font-display);font-weight:700;font-size:18px;color:var(--ga-navy);min-width:24px;">${i + 1}</span>`;
      html += `<div style="flex:1;">`;
      html += `<div style="font-weight:600;font-size:13px;color:var(--ga-navy);">${a.action}</div>`;
      html += `<div style="font-size:12px;color:var(--ga-charcoal);margin-top:3px;">${a.impact}</div>`;
      html += `<div style="display:flex;gap:8px;margin-top:6px;">`;
      html += `<span style="font-size:10px;padding:2px 8px;border-radius:10px;background:${urgencyColor};color:${a.urgency === 'Critical' ? '#fff' : 'var(--ga-charcoal)'};">${a.urgency}</span>`;
      html += `<span style="font-size:10px;color:var(--ga-muted);">Owner: ${a.owner}</span>`;
      html += `</div></div></div>`;
    });
    html += `</div>`;

    html += '</div>';
    container.innerHTML = html;
  }

  function statusLabel(status) {
    const labels = { green: 'On Track', amber: 'At Risk', red: 'Critical' };
    return labels[status] || status;
  }

  return { render };
})();
