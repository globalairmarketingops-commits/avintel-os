/* =====================================================================
   AvIntelOS — Page: Market Demand
   Model opportunities, category trends, emerging models, demand vs inventory
   ===================================================================== */

const MarketDemand = (() => {

  function render(container) {
    const summary = Store.get('intel_market_summary') || {};
    const models = Store.get('intel_market_models') || [];
    const categories = Store.get('intel_market_categories') || [];
    const emerging = Store.get('intel_market_emerging') || [];
    const imbalance = Store.get('intel_market_imbalance') || [];

    let html = '<div class="domain-page">';

    // Signal accuracy warning
    html += Components.alertBanner(
      '<strong>Market demand signals require locked model taxonomy and listing quality scores for full accuracy.</strong> Current scores are PROBABLE — based on query volume and listing availability. Awaiting spec normalization completion.',
      'warning'
    );

    html += Components.sectionHeader('Market Demand', 'Model opportunities, category trends, emerging demand, and supply-demand imbalances');

    // ── Part A: Market Summary Strip ──
    html += Components.partHeader('PART A', 'Market Summary');
    html += '<div class="row-grid row-grid-4">';
    html += Components.kpiTile('Top Rising Models', Components.formatNumber(summary.rising_models_count), {
      delta: summary.models_delta, trend: summary.models_trend, confidence: summary.confidence, metricId: 'emerging_demand'
    });
    html += Components.kpiTile('Rising Categories', Components.formatNumber(summary.rising_categories_count), {
      delta: summary.categories_delta, trend: summary.categories_trend, confidence: summary.confidence, metricId: 'category_demand'
    });
    html += Components.kpiTile('Regional Hotspots', Components.formatNumber(summary.regional_hotspots_count), {
      delta: summary.hotspots_delta, trend: summary.hotspots_trend, confidence: summary.confidence, metricId: 'regional_demand'
    });
    html += Components.kpiTile('Imbalance Alerts', Components.formatNumber(summary.imbalance_alerts_count), {
      delta: summary.imbalance_delta, trend: summary.imbalance_trend, confidence: summary.confidence, metricId: 'supply_demand'
    });
    html += '</div>';

    // ── Part B: Model Opportunity Table ──
    html += Components.partHeader('PART B', 'Model Opportunity Analysis');
    const modelRows = models.map(m => ({
      ...m,
      _confidence: m.confidence || 'PROBABLE'
    }));
    html += Components.table(
      [
        { key: 'make', label: 'Make' },
        { key: 'model', label: 'Model' },
        { key: 'category', label: 'Category' },
        { key: 'demand_momentum', label: 'Demand Momentum', render: (val) => momentumBadge(val) },
        { key: 'inventory_count', label: 'Inventory', render: (val) => Components.formatNumber(val) },
        { key: 'avg_listing_quality', label: 'Avg Quality', render: (val) => Components.formatPct(val) },
        { key: 'imbalance_score', label: 'Imbalance', render: (val) => imbalanceBadge(val) },
        { key: 'organic_rank_trend', label: 'SEO Rank', render: (val) => trendBadge(val) },
        { key: 'paid_cpc_trend', label: 'Paid CPC', render: (val) => trendBadge(val) },
        { key: 'opportunity_score', label: 'Opportunity', render: (val) => opportunityScoreBadge(val) },
        { key: 'confidence', label: 'Confidence', render: (val) => Confidence.badge(val) }
      ],
      modelRows,
      { id: 'tbl-market-models', sortable: true, csvFilename: 'Model_Opportunities' }
    );

    // ── Part C: Category Demand Trends ──
    html += Components.partHeader('PART C', 'Category Demand Trends');
    const categoryRows = categories.map(c => ({
      ...c,
      _confidence: c.confidence || 'PROBABLE'
    }));
    html += Components.table(
      [
        { key: 'category', label: 'Category' },
        { key: 'query_growth', label: 'Query Growth', render: (val) => Components.formatPct(val) },
        { key: 'ppc_growth', label: 'PPC Growth', render: (val) => Components.formatPct(val) },
        { key: 'listing_view_growth', label: 'Listing View Growth', render: (val) => Components.formatPct(val) },
        { key: 'repeat_interest_growth', label: 'Repeat Interest', render: (val) => Components.formatPct(val) },
        { key: 'opportunity_state', label: 'State', render: (val) => opportunityStateBadge(val) }
      ],
      categoryRows,
      { id: 'tbl-market-categories', sortable: true, csvFilename: 'Category_Demand_Trends' }
    );

    if (categories.length > 0) {
      html += Components.barChart(
        categories.map(c => ({ label: c.category, value: c.query_growth || 0, displayValue: Components.formatPct(c.query_growth) })),
        { colorClass: 'bar-fill-blue' }
      );
    }

    // ── Part D: Emerging Model Watchlist ──
    html += Components.partHeader('PART D', 'Emerging Model Watchlist');
    const emergingRows = emerging.map(e => ({
      ...e,
      _confidence: e.confidence || 'PROBABLE'
    }));
    html += Components.table(
      [
        { key: 'model', label: 'Model' },
        { key: 'growth_30d', label: '30D Growth', render: (val) => Components.formatPct(val) },
        { key: 'growth_90d', label: '90D Growth', render: (val) => Components.formatPct(val) },
        { key: 'competitive_gap', label: 'Competitive Gap', render: (val) => gapBadge(val) },
        { key: 'content_gap', label: 'Content Gap', render: (val) => gapBadge(val) },
        { key: 'listing_gap', label: 'Listing Gap', render: (val) => gapBadge(val) },
        { key: 'alert_status', label: 'Alert Status', render: (val) => alertStatusBadge(val) }
      ],
      emergingRows,
      { id: 'tbl-market-emerging', sortable: true, csvFilename: 'Emerging_Model_Watchlist' }
    );

    // ── Part E: Demand vs Inventory Imbalance ──
    html += Components.partHeader('PART E', 'Demand vs Inventory Imbalance');
    const imbalanceRows = imbalance.map(i => ({
      ...i,
      _confidence: i.confidence || 'PROBABLE'
    }));
    html += Components.table(
      [
        { key: 'category_model', label: 'Category / Model' },
        { key: 'demand_score', label: 'Demand Score', render: (val) => Components.formatNumber(val) },
        { key: 'quality_inventory', label: 'Quality Inventory', render: (val) => Components.formatNumber(val) },
        { key: 'imbalance_score', label: 'Imbalance Score', render: (val) => imbalanceBadge(val) },
        { key: 'interpretation', label: 'Interpretation' }
      ],
      imbalanceRows,
      { id: 'tbl-market-imbalance', sortable: true, csvFilename: 'Demand_Inventory_Imbalance' }
    );

    html += '</div>';
    container.innerHTML = html;
  }

  function momentumBadge(val) {
    if (val === 'accelerating') return Components.badge('↑↑ Accelerating', 'green');
    if (val === 'rising') return Components.badge('↑ Rising', 'blue');
    if (val === 'stable') return Components.badge('→ Stable', 'blue');
    if (val === 'declining') return Components.badge('↓ Declining', 'amber');
    return Components.badge(val, 'blue');
  }

  function trendBadge(val) {
    if (val === 'up') return Components.badge('↑ Up', 'green');
    if (val === 'down') return Components.badge('↓ Down', 'red');
    return Components.badge('→ Flat', 'blue');
  }

  function imbalanceBadge(score) {
    if (score >= 7) return Components.badge(`${score}/10 HIGH`, 'red');
    if (score >= 4) return Components.badge(`${score}/10 MED`, 'amber');
    return Components.badge(`${score}/10 LOW`, 'green');
  }

  function opportunityScoreBadge(score) {
    if (score >= 8) return Components.badge(`${score}/10 STRONG`, 'green');
    if (score >= 6) return Components.badge(`${score}/10 GOOD`, 'blue');
    if (score >= 4) return Components.badge(`${score}/10 FAIR`, 'amber');
    return Components.badge(`${score}/10 WEAK`, 'red');
  }

  function opportunityStateBadge(val) {
    if (val === 'explosive') return Components.badge('🔥 Explosive', 'red');
    if (val === 'strong') return Components.badge('Strong', 'green');
    if (val === 'growing') return Components.badge('Growing', 'blue');
    if (val === 'stable') return Components.badge('Stable', 'blue');
    if (val === 'declining') return Components.badge('Declining', 'amber');
    return Components.badge(val, 'blue');
  }

  function gapBadge(val) {
    if (val === 'high') return Components.badge('High Gap', 'red');
    if (val === 'medium') return Components.badge('Medium Gap', 'amber');
    return Components.badge('Low Gap', 'green');
  }

  function alertStatusBadge(val) {
    if (val === 'critical') return Components.badge('🚨 Critical', 'red');
    if (val === 'watch') return Components.badge('Watch', 'amber');
    return Components.badge('Monitor', 'blue');
  }

  return { render };
})();
