/* =====================================================================
   AvIntelOS — Page 3: Organic Intelligence
   GSC keyword portfolio, category performance, search visibility
   ===================================================================== */

const OrganicIntel = (() => {

  function render(container) {
    const portfolio = Store.get('intel_gsc_portfolio') || {};
    const categories = Store.get('intel_gsc_categories') || [];
    const settings = Store.get('intel_settings') || {};
    const catFilter = settings.category_filter || 'all';

    const filteredCats = catFilter === 'all' ? categories :
      categories.filter(c => c.category.toLowerCase() === catFilter);

    let html = '<div class="domain-page">';

    html += Components.sectionHeader('Organic Intelligence', 'Google Search Console keyword portfolio and category performance');

    // ── Part A: GSC Portfolio ──
    html += Components.partHeader('PART A', 'GSC Portfolio');
    html += '<div class="row-grid row-grid-4">';
    html += Components.kpiTile('Total Keywords', Components.formatNumber(portfolio.total_keywords), { confidence: portfolio.confidence });
    html += Components.kpiTile('Monthly Clicks', Components.formatNumber(portfolio.monthly_clicks), { confidence: portfolio.confidence, metricId: 'ctr' });
    html += Components.kpiTile('Avg Position', portfolio.avg_position != null ? portfolio.avg_position.toFixed(1) : '—', { confidence: portfolio.confidence, metricId: 'avg_position' });
    html += Components.kpiTile('Avg CTR', Components.formatPct(portfolio.avg_ctr), { confidence: portfolio.confidence, metricId: 'ctr' });
    html += '</div>';

    // Freshness indicator
    html += `<div style="font-size:12px;color:var(--ga-muted);margin-bottom:20px;display:flex;align-items:center;gap:8px;">
      ${Components.windsorDot('gsc')} Last updated: ${Components.formatDate(portfolio.last_updated)}
    </div>`;

    // ── Part B: Category Breakdown ──
    html += Components.partHeader('PART B', 'Category Breakdown');
    html += `<div style="margin-bottom:12px;">${Components.categoryFilter()}</div>`;
    html += Components.table(
      [
        { key: 'category', label: 'Category', render: (val) => Components.badge(val, 'blue') },
        { key: 'keywords', label: 'Keywords', render: (val) => Components.formatNumber(val) },
        { key: 'clicks', label: 'Clicks', render: (val) => Components.formatNumber(val) },
        { key: 'impressions', label: 'Impressions', render: (val) => Components.formatNumber(val) },
        { key: 'avg_position', label: 'Avg Position', render: (val) => val != null ? val.toFixed(1) : '—' },
        { key: 'ctr', label: 'CTR', render: (val) => Components.formatPct(val) }
      ],
      filteredCats,
      { id: 'tbl-gsc-categories', sortable: true, csvFilename: 'GSC_Categories' }
    );

    // ── Part C: Clicks by Category ──
    html += Components.partHeader('PART C', 'Clicks by Category');
    html += Components.barChart(
      filteredCats.map(c => ({ label: c.category, value: c.clicks, displayValue: Components.formatNumber(c.clicks) })),
      { colorClass: 'bar-fill-blue' }
    );

    html += '</div>';
    container.innerHTML = html;
  }

  return { render };
})();
