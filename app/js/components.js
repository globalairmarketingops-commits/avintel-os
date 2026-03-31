/* =====================================================================
   AvIntelOS — Shared UI Components
   Extends AvEngineOS component set with: CSV export, Send to Engine,
   confidence badges, metric tooltips, charts, extended date picker,
   contamination banner, role switcher, top movers strip.
   ===================================================================== */

const Components = (() => {

  /* ---- KPI Tile ---- */
  function kpiTile(label, value, opts = {}) {
    const { delta, trend, confidence, topDriverLabel, topDriverRoute, subtitle, metricId } = opts;
    const trendArrow = trend === 'up' ? '&#9650;' : trend === 'down' ? '&#9660;' : '&#9654;';
    const trendClass = trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-flat';
    const confBadge = confidence ? Confidence.badge(confidence) : '';
    const tooltip = metricId ? MetricsRegistry.tooltip(metricId) : '';
    const topDriver = topDriverLabel ? `<a class="top-driver-link" onclick="Router.navigate('${topDriverRoute || ''}')" title="View top driver">${topDriverLabel}</a>` : '';
    const deltaHtml = delta != null ? `<span class="kpi-delta ${trendClass}">${trendArrow} ${delta}</span>` : '';
    const roleVisible = confidence ? RoleFilter.shouldShow(confidence) : true;
    if (!roleVisible) return '';
    return `
      <div class="kpi-tile" role="group" aria-label="${label}: ${value}. ${confidence || ''}">
        <div class="kpi-label">${label} ${tooltip} ${confBadge}</div>
        <div class="kpi-value">${value}</div>
        ${subtitle ? `<div class="kpi-subtitle">${subtitle}</div>` : ''}
        <div class="kpi-footer">${deltaHtml} ${topDriver}</div>
      </div>`;
  }

  /* ---- Status Card ---- */
  function statusCard(name, status, opts = {}) {
    const { owner, cod, ticket, lastUpdated, onClick } = opts;
    const statusLower = (status || '').toLowerCase().replace(/\s+/g, '_');
    const colorMap = {
      clean: 'green', confirmed: 'green', active: 'green', live: 'green', resolved: 'green', unblocked: 'green',
      unconfirmed: 'red', not_active: 'red', blocked: 'red', contaminated: 'red',
      in_progress: 'amber', being_replaced: 'amber', pending: 'amber'
    };
    const color = colorMap[statusLower] || 'red';
    return `
      <div class="status-card status-${color}" ${onClick ? `onclick="${onClick}"` : ''} role="button" tabindex="0"
           aria-label="${name}: ${status}. Owner: ${owner || 'Unassigned'}">
        <div class="status-header">
          <span class="status-dot status-dot-${color}"></span>
          <span class="status-name">${name}</span>
        </div>
        <div class="status-pill status-pill-${color}">${status}</div>
        <div class="status-meta">
          ${owner ? `<div>Owner: ${owner}</div>` : ''}
          ${cod ? `<div class="status-cod">COD: ${cod}</div>` : ''}
          ${lastUpdated ? `<div>Updated: ${formatDate(lastUpdated)}</div>` : ''}
        </div>
      </div>`;
  }

  /* ---- Badge ---- */
  function badge(text, color = 'blue') {
    return `<span class="ga-badge ga-badge-${color}">${text}</span>`;
  }

  function domainBadge(domain) {
    const colors = { ppc: 'green', seo: 'blue', listings: 'amber', monetization: 'red', competitive: 'red', content: 'blue', ga4: 'green' };
    return badge((domain || '').toUpperCase(), colors[domain] || 'blue');
  }

  /* ---- Sortable Table ---- */
  function table(columns, rows, opts = {}) {
    const { id, sortable, onRowClick, checkboxes, emptyMessage, csvFilename } = opts;
    // Apply role filter
    const filteredRows = RoleFilter.filterRows(rows);
    if (!filteredRows || filteredRows.length === 0) {
      return emptyState('&#128203;', emptyMessage || 'No data available.', '', null);
    }
    const tableId = id || 'table-' + Math.random().toString(36).slice(2, 8);
    let html = '';
    // Panel header with CSV export
    if (csvFilename) {
      html += `<div class="panel-actions" style="margin-bottom:8px;justify-content:flex-end;display:flex;">
        ${csvExportButton(tableId, csvFilename)}
      </div>`;
    }
    html += `<div class="table-wrapper"><table class="ga-table" id="${tableId}"><thead><tr>`;
    if (checkboxes) html += '<th style="width:36px;text-align:center;"><input type="checkbox" aria-label="Select all"></th>';
    columns.forEach(col => {
      const sortAttr = sortable ? `class="sortable" data-col="${col.key}" onclick="Components.sortTable('${tableId}','${col.key}')"` : '';
      html += `<th ${sortAttr} scope="col">${col.label}</th>`;
    });
    html += '</tr></thead><tbody>';
    filteredRows.forEach((row, i) => {
      const rowClass = row._rowClass || '';
      const clickAttr = onRowClick ? `onclick="${onRowClick}(${i})" class="clickable ${rowClass}"` : `class="${rowClass}"`;
      html += `<tr ${clickAttr} data-idx="${i}">`;
      if (checkboxes) html += `<td style="text-align:center;"><input type="checkbox" value="${row.id || i}" aria-label="Select row"></td>`;
      columns.forEach(col => {
        const val = col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—');
        html += `<td>${val}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }

  let sortState = {};
  function sortTable(tableId, colKey) {
    const tbl = document.getElementById(tableId);
    if (!tbl) return;
    const dir = sortState[tableId + colKey] === 'asc' ? 'desc' : 'asc';
    sortState[tableId + colKey] = dir;
    const tbody = tbl.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const colIdx = Array.from(tbl.querySelectorAll('thead th')).findIndex(th => th.dataset.col === colKey);
    if (colIdx < 0) return;
    rows.sort((a, b) => {
      let va = a.cells[colIdx]?.textContent.trim() || '';
      let vb = b.cells[colIdx]?.textContent.trim() || '';
      const na = parseFloat(va.replace(/[^0-9.\-]/g, ''));
      const nb = parseFloat(vb.replace(/[^0-9.\-]/g, ''));
      if (!isNaN(na) && !isNaN(nb)) return dir === 'asc' ? na - nb : nb - na;
      return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    rows.forEach(r => tbody.appendChild(r));
    tbl.querySelectorAll('thead th').forEach(th => th.removeAttribute('aria-sort'));
    const th = tbl.querySelector(`thead th[data-col="${colKey}"]`);
    if (th) th.setAttribute('aria-sort', dir === 'asc' ? 'ascending' : 'descending');
  }

  /* ---- Modal ---- */
  function modal(title, bodyHtml, opts = {}) {
    const { actions, id, wide } = opts;
    const modalId = id || 'modal-' + Math.random().toString(36).slice(2, 8);
    let actionsHtml = '';
    if (actions) {
      actionsHtml = '<div class="modal-actions">' + actions.map(a =>
        `<button class="btn ${a.class || 'btn-primary'}" onclick="${a.onClick}">${a.label}</button>`
      ).join('') + '</div>';
    }
    return `
      <div class="modal-overlay" id="${modalId}" role="dialog" aria-modal="true" aria-labelledby="${modalId}-title" onclick="Components.closeModal('${modalId}')">
        <div class="modal-content ${wide ? 'modal-wide' : ''}" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h2 id="${modalId}-title">${title}</h2>
            <button class="modal-close" onclick="Components.closeModal('${modalId}')" aria-label="Close">&times;</button>
          </div>
          <div class="modal-body">${bodyHtml}</div>
          ${actionsHtml}
        </div>
      </div>`;
  }

  function showModal(html) {
    const container = document.getElementById('modal-container');
    if (container) {
      container.innerHTML = html;
      const overlay = container.querySelector('.modal-overlay');
      if (overlay) {
        const firstFocusable = overlay.querySelector('input, select, textarea, button:not(.modal-close)');
        if (firstFocusable) setTimeout(() => firstFocusable.focus(), 50);
        overlay.addEventListener('keydown', trapFocus);
        overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') { const id = overlay.id; if (id) closeModal(id); } });
      }
    }
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const modalEl = e.currentTarget.querySelector('.modal-content');
    if (!modalEl) return;
    const focusables = modalEl.querySelectorAll('input, select, textarea, button, [tabindex]:not([tabindex="-1"])');
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  /* ---- Gauge ---- */
  function gauge(value, max, opts = {}) {
    const { label, unit, thresholds } = opts;
    const pct = Math.round((value / max) * 100) || 0;
    let color = 'var(--ga-green)';
    if (thresholds) {
      if (pct < thresholds.red) color = 'var(--ga-red)';
      else if (pct < thresholds.amber) color = 'var(--ga-amber)';
    }
    const circumference = 2 * Math.PI * 40;
    const dashoffset = circumference * (1 - pct / 100);
    return `
      <div class="gauge-container" aria-label="${label || ''}: ${pct}%">
        <svg viewBox="0 0 100 100" class="gauge-svg">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--ga-border)" stroke-width="8"/>
          <circle cx="50" cy="50" r="40" fill="none" stroke="${color}" stroke-width="8"
                  stroke-dasharray="${circumference}" stroke-dashoffset="${dashoffset}"
                  stroke-linecap="round" transform="rotate(-90 50 50)"/>
        </svg>
        <div class="gauge-text">
          <span class="gauge-value">${pct}${unit || '%'}</span>
          ${label ? `<span class="gauge-label">${label}</span>` : ''}
        </div>
      </div>`;
  }

  /* ---- Extended Date Range Picker (no 90-day cap) ---- */
  function dateRangePickerExtended(current) {
    const settings = Store.get('intel_settings') || {};
    current = current || settings.date_range || '30d';
    const compareMode = settings.compare_mode || 'wow';
    const ranges = ['7d', '30d', '90d', '180d', '365d', 'all', 'custom'];
    const labels = { '7d': '7D', '30d': '30D', '90d': '90D', '180d': '180D', '365d': '1Y', 'all': 'ALL', 'custom': 'Custom' };
    return `
      <div style="display:flex;align-items:center;gap:8px;">
        <div class="date-range-picker" role="group" aria-label="Date range">
          ${ranges.map(r => `<button class="dr-btn ${r === current ? 'dr-active' : ''}" data-range="${r}" onclick="Components.setDateRange('${r}')">${labels[r]}</button>`).join('')}
        </div>
        <div class="date-range-picker" role="group" aria-label="Compare mode">
          <button class="dr-btn ${compareMode === 'wow' ? 'dr-active' : ''}" onclick="Components.setCompareMode('wow')">WoW</button>
          <button class="dr-btn ${compareMode === 'mom' ? 'dr-active' : ''}" onclick="Components.setCompareMode('mom')">MoM</button>
          <button class="dr-btn ${compareMode === 'qoq' ? 'dr-active' : ''}" onclick="Components.setCompareMode('qoq')">QoQ</button>
          <button class="dr-btn ${compareMode === 'yoy' ? 'dr-active' : ''}" onclick="Components.setCompareMode('yoy')">YoY</button>
        </div>
      </div>`;
  }

  function setDateRange(range) {
    if (range === 'custom') { showCustomDateRange(); return; }
    const settings = Store.get('intel_settings') || {};
    settings.date_range = range;
    Store.set('intel_settings', settings);
    document.querySelectorAll('.dr-btn[data-range]').forEach(b => b.classList.toggle('dr-active', b.dataset.range === range));
    Events.log('intel_daterange_change', { range, compare_mode: settings.compare_mode });
  }

  function setCompareMode(mode) {
    const settings = Store.get('intel_settings') || {};
    settings.compare_mode = mode;
    Store.set('intel_settings', settings);
    document.getElementById('topbar-date-range').innerHTML = dateRangePickerExtended(settings.date_range);
    Events.log('intel_daterange_change', { range: settings.date_range, compare_mode: mode });
  }

  function showCustomDateRange() {
    const today = new Date().toISOString().split('T')[0];
    const ninetyAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    showModal(modal('Custom Date Range', `
      <div class="form-group"><label class="form-label">Start Date</label><input class="form-input" type="date" id="dr-start" value="${ninetyAgo}"></div>
      <div class="form-group"><label class="form-label">End Date</label><input class="form-input" type="date" id="dr-end" value="${today}" max="${today}"></div>
      <p style="font-size:11px;color:var(--ga-muted);margin-top:8px;">No date limit — AvIntelOS supports full historical analysis.</p>
    `, { id: 'modal-daterange', actions: [
      { label: 'Cancel', class: 'btn-ghost', onClick: "Components.closeModal('modal-daterange')" },
      { label: 'Apply Range', class: 'btn-primary', onClick: 'Components.applyCustomDateRange()' }
    ]}));
  }

  function applyCustomDateRange() {
    const start = document.getElementById('dr-start')?.value;
    const end = document.getElementById('dr-end')?.value;
    if (!start || !end) return;
    const days = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
    if (days < 0) { showToast('Start date must be before end date.', 'error'); return; }
    const settings = Store.get('intel_settings') || {};
    settings.date_range = 'custom';
    settings.custom_start = start;
    settings.custom_end = end;
    Store.set('intel_settings', settings);
    closeModal('modal-daterange');
    showToast(`Custom range: ${start} to ${end} (${Math.round(days)} days)`, 'success');
    Events.log('intel_daterange_change', { range: 'custom', start_date: start, end_date: end });
    document.getElementById('topbar-date-range').innerHTML = dateRangePickerExtended('custom');
  }

  /* ---- Category Filter ---- */
  function categoryFilter() {
    const settings = Store.get('intel_settings') || {};
    const current = settings.category_filter || 'all';
    const cats = ['all', 'jet', 'piston', 'helicopter', 'turboprop', 'fbo'];
    return `
      <select class="cat-filter" onchange="Components.setCategoryFilter(this.value)" aria-label="Category filter">
        ${cats.map(c => `<option value="${c}" ${c === current ? 'selected' : ''}>${c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>`).join('')}
      </select>`;
  }

  function setCategoryFilter(val) {
    const settings = Store.get('intel_settings') || {};
    settings.category_filter = val;
    Store.set('intel_settings', settings);
    Events.log('intel_filter_change', { filter_type: 'category', filter_value: val });
    Router.navigate(Router.getCurrent());
  }

  /* ---- Signal Clean Toggle ---- */
  function signalCleanToggle() {
    const settings = Store.get('intel_settings') || {};
    const isOn = settings.signal_clean_only !== false;
    return `
      <label class="toggle-label" title="Exclude Email_Open_ contaminated data">
        <input type="checkbox" class="toggle-input" ${isOn ? 'checked' : ''} onchange="Components.setSignalClean(this.checked)">
        <span class="toggle-switch"></span>
        <span class="toggle-text">Signal Clean</span>
      </label>`;
  }

  function setSignalClean(val) {
    const settings = Store.get('intel_settings') || {};
    settings.signal_clean_only = val;
    Store.set('intel_settings', settings);
    Events.log('intel_filter_change', { filter_type: 'signal_clean', filter_value: val });
    Router.navigate(Router.getCurrent());
  }

  /* ---- Contamination Banner ---- */
  function contamBanner() {
    return `
      <div class="contam-banner" role="alert">
        <span class="contam-banner-icon">&#9888;</span>
        <div class="contam-banner-text">
          <strong>GA4 Data Contamination Active</strong> — Email_Open_ events (Measurement Protocol) have inflated sessions since June 2023.
          Real engagement rate: <strong>~69%</strong> (reported: ~17%). Signal Clean mode excludes contaminated data.
        </div>
      </div>`;
  }

  /* ---- CSV Export Button ---- */
  function csvExportButton(tableId, filename) {
    return `<button class="csv-export-btn" onclick="Components.exportTableCSV('${tableId}', '${filename}')" title="Export to CSV">&#128229; CSV</button>`;
  }

  function exportTableCSV(tableId, filename) {
    const tbl = document.getElementById(tableId);
    if (!tbl) { showToast('Table not found for export.', 'error'); return; }
    const rows = Array.from(tbl.querySelectorAll('tr'));
    const csvLines = rows.map(row => {
      const cells = Array.from(row.querySelectorAll('th, td'));
      return cells.map(cell => {
        let text = cell.textContent.trim().replace(/"/g, '""');
        if (text.includes(',') || text.includes('"') || text.includes('\n')) text = `"${text}"`;
        return text;
      }).join(',');
    });
    const csv = csvLines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `AvIntelOS_${filename}_${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${rows.length - 1} rows to CSV`, 'success');
    Events.log('intel_csv_export', { table: tableId, filename, rows: rows.length - 1 });
  }

  /* ---- Send to Engine Button ---- */
  function sendToEngineButton(data) {
    const encoded = encodeURIComponent(JSON.stringify(data));
    return `<button class="send-to-engine-btn" onclick="Components.sendToEngine(decodeURIComponent('${encoded}'))" title="Create opportunity in AvEngineOS">&#9654; Send to Engine</button>`;
  }

  function sendToEngine(dataStr) {
    try {
      const data = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
      const opp = {
        id: 'OPP-INTEL-' + Date.now().toString(36).toUpperCase(),
        domain: data.domain || 'seo',
        name: data.name || 'Insight from AvIntelOS',
        diagnosis: data.diagnosis || '',
        action: data.action || 'Review in AvEngineOS',
        owner: data.owner || 'Casey',
        eta: data.eta || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        stop_loss: data.stop_loss || null,
        success_metric: data.success_metric || '',
        cod: data.cod || '',
        sprint: data.sprint || '',
        impact: data.impact || 5,
        urgency: data.urgency || 5,
        effort: data.effort || 3,
        status: 'Open',
        category: data.category || '',
        source: 'AvIntelOS'
      };
      // Write to AvEngineOS opportunity queue
      const key = `engine_opp_${opp.domain}`;
      const arr = Store.get(key) || [];
      arr.push(opp);
      Store.set(key, arr);
      showToast(`Opportunity sent to AvEngineOS: ${opp.name}`, 'success');
      Events.log('intel_send_to_engine', { opportunity_id: opp.id, domain: opp.domain, name: opp.name });
    } catch (e) {
      console.error('sendToEngine error:', e);
      showToast('Failed to send to AvEngineOS.', 'error');
    }
  }

  /* ---- Top 10 Movers Strip ---- */
  function topMoversStrip(items) {
    if (!items || items.length === 0) return '';
    return `
      <div class="movers-strip">
        ${items.map(item => {
          const trendClass = item.delta > 0 ? 'trend-up' : item.delta < 0 ? 'trend-down' : 'trend-flat';
          const arrow = item.delta > 0 ? '&#9650;' : item.delta < 0 ? '&#9660;' : '&#9654;';
          return `
            <div class="mover-card">
              <div class="mover-metric">${item.metric}</div>
              <div class="mover-value">${item.value}</div>
              <div class="mover-delta ${trendClass}">${arrow} ${item.deltaLabel || item.delta}</div>
            </div>`;
        }).join('')}
      </div>`;
  }

  /* ---- Bar Chart (CSS-only) ---- */
  function barChart(data, opts = {}) {
    const { maxValue, colorClass } = opts;
    const max = maxValue || Math.max(...data.map(d => d.value), 1);
    return `
      <div class="bar-chart">
        ${data.map(d => {
          const pct = Math.round((d.value / max) * 100);
          const fill = d.color || colorClass || 'bar-fill-navy';
          return `
            <div class="bar-row">
              <div class="bar-label">${d.label}</div>
              <div class="bar-track">
                <div class="bar-fill ${fill}" style="width:${pct}%">
                  ${pct > 20 ? `<span class="bar-value">${d.displayValue || d.value}</span>` : ''}
                </div>
              </div>
              ${pct <= 20 ? `<span class="bar-value-outside">${d.displayValue || d.value}</span>` : ''}
            </div>`;
        }).join('')}
      </div>`;
  }

  /* ---- Sparkline (SVG) ---- */
  function sparkline(points, opts = {}) {
    if (!points || points.length < 2) return '';
    const { width = 80, height = 24, color = 'var(--ga-blue)', strokeWidth = 1.5 } = opts;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    const step = width / (points.length - 1);
    const pathPoints = points.map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return `<span class="sparkline-container"><svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <path d="${pathPoints}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
    </svg></span>`;
  }

  /* ---- Windsor Staleness Dot ---- */
  function windsorDot(connectorKey) {
    const status = Windsor.getStatus(connectorKey);
    const age = Windsor.getCacheAge(connectorKey);
    if (status === 'pending') return '<span class="windsor-dot windsor-dot-red" title="Not connected">&#9679; PENDING</span>';
    if (status === 'fresh') return `<span class="windsor-dot windsor-dot-green" title="Refreshed ${Math.round(age)}h ago">&#9679;</span>`;
    if (status === 'aging') return `<span class="windsor-dot windsor-dot-amber" title="Data aging — ${Math.round(age)}h ago">&#9679;</span>`;
    return `<span class="windsor-dot windsor-dot-red" title="STALE — ${Math.round(age)}h ago">&#9679; STALE</span>`;
  }

  /* ---- Empty State ---- */
  function emptyState(icon, message, ctaText, ctaAction) {
    return `
      <div class="empty-state">
        <div class="empty-icon">${icon}</div>
        <div class="empty-message">${message}</div>
        ${ctaText ? `<button class="btn btn-primary" onclick="${ctaAction || ''}">${ctaText}</button>` : ''}
      </div>`;
  }

  /* ---- Toast ---- */
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast-visible'));
    setTimeout(() => { toast.classList.remove('toast-visible'); setTimeout(() => toast.remove(), 300); }, 3000);
  }

  /* ---- Section Headers ---- */
  function sectionHeader(title, subtitle) {
    return `<div class="section-header"><h2 class="section-title">${title}</h2>${subtitle ? `<p class="section-subtitle">${subtitle}</p>` : ''}</div>`;
  }

  function partHeader(partLabel, title) {
    return `<div class="part-header"><span class="part-label">${partLabel}</span><h3 class="part-title">${title}</h3></div>`;
  }

  /* ---- Alert Banner ---- */
  function alertBanner(message, type = 'error') {
    return `<div class="alert-banner alert-${type}" role="alert">${message}</div>`;
  }

  /* ---- Panel Header ---- */
  function panelHeader(title, actions) {
    return `<div class="panel-header"><h3 class="panel-title">${title}</h3><div class="panel-actions">${actions || ''}</div></div>`;
  }

  /* ---- Helpers ---- */
  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatCurrency(val) {
    if (val == null || isNaN(val)) return '—';
    return '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function formatPct(val) {
    if (val == null || isNaN(val)) return '—';
    return Number(val).toFixed(1) + '%';
  }

  function formatNumber(val) {
    if (val == null || isNaN(val)) return '—';
    return Number(val).toLocaleString('en-US');
  }

  function statusColor(status) {
    const s = (status || '').toLowerCase().replace(/\s+/g, '_');
    const map = { open: 'blue', in_progress: 'amber', blocked: 'red', shipped: 'green', verified: 'green', resolved: 'green',
      fresh: 'green', aging: 'amber', stale: 'red', pending: 'amber', connected: 'green', disconnected: 'red' };
    return map[s] || 'blue';
  }

  return {
    kpiTile, statusCard, badge, domainBadge, table, sortTable,
    modal, showModal, closeModal, gauge,
    dateRangePickerExtended, setDateRange, setCompareMode, showCustomDateRange, applyCustomDateRange,
    categoryFilter, setCategoryFilter, signalCleanToggle, setSignalClean,
    contamBanner, csvExportButton, exportTableCSV,
    sendToEngineButton, sendToEngine, topMoversStrip, barChart, sparkline,
    windsorDot, emptyState, showToast, sectionHeader, partHeader, panelHeader, alertBanner,
    formatDate, formatCurrency, formatPct, formatNumber, statusColor
  };
})();
