/* =====================================================================
   AvIntelOS — Page 7: Content & Channel Performance
   Content pillar analysis, 80/20 mix tracking
   ===================================================================== */

const ContentChannel = (() => {

  function render(container) {
    const pillars = Store.get('intel_content_pillars') || [];

    // Compute 80/20 mix
    let totalArticles = 0, newsArticles = 0;
    pillars.forEach(p => {
      totalArticles += p.articles || 0;
      if (p.pillar === 'News & Intelligence') newsArticles = p.articles || 0;
    });
    const newsPct = totalArticles > 0 ? (newsArticles / totalArticles * 100) : 0;
    const evergreenPct = 100 - newsPct;

    let html = '<div class="domain-page">';

    html += Components.sectionHeader('Content & Channel Performance', 'Content pillar analysis and 80/20 mix tracking');

    // 80/20 mix alert
    html += Components.alertBanner(
      `<strong>Content mix gap:</strong> Currently ${Math.round(newsPct)}% news/intelligence, ${Math.round(evergreenPct)}% buyer-intent evergreen. Target: 80% evergreen / 20% news. Redirect in progress — Jadda's briefs now route through Claude Code.`,
      'warning'
    );

    // ── Part A: Content Mix ──
    html += Components.partHeader('PART A', 'Content Mix');
    html += '<div class="row-grid row-grid-4">';
    html += Components.kpiTile('Total Articles', Components.formatNumber(totalArticles), { confidence: 'CONFIRMED' });
    html += Components.kpiTile('News Articles', Components.formatNumber(newsArticles), { confidence: 'CONFIRMED', subtitle: Math.round(newsPct) + '% of total' });
    html += Components.kpiTile('Evergreen Articles', Components.formatNumber(totalArticles - newsArticles), { confidence: 'CONFIRMED', subtitle: Math.round(evergreenPct) + '% of total' });
    html += Components.kpiTile('Target Mix', '80/20', { confidence: 'CONFIRMED', subtitle: 'Evergreen / News' });
    html += '</div>';

    // ── Part B: Content Pillar Performance ──
    html += Components.partHeader('PART B', 'Content Pillar Performance');
    html += Components.table(
      [
        { key: 'pillar', label: 'Pillar' },
        { key: 'articles', label: 'Articles', render: (val) => Components.formatNumber(val) },
        { key: 'sessions', label: 'Sessions', render: (val) => Components.formatNumber(val) },
        { key: 'engagement_rate', label: 'Engagement Rate', render: (val) => Components.formatPct(val) },
        { key: 'conversions', label: 'Conversions', render: (val) => Components.formatNumber(val) }
      ],
      pillars,
      { id: 'tbl-content', sortable: true, csvFilename: 'Content_Pillars' }
    );

    // ── Part C: Sessions by Pillar ──
    html += Components.partHeader('PART C', 'Sessions by Pillar');
    html += Components.barChart(
      pillars.map(p => ({ label: p.pillar, value: p.sessions, displayValue: Components.formatNumber(p.sessions) })),
      { colorClass: 'bar-fill-green' }
    );

    html += '</div>';
    container.innerHTML = html;
  }

  return { render };
})();
