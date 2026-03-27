/* =====================================================================
   AvIntelOS — Page 6: Competitive Intelligence
   GlobalAir.com vs Controller.com — keyword overlap, auction, features
   ===================================================================== */

const CompetitiveIntel = (() => {

  function render(container) {
    const overlap = Store.get('intel_competitive_overlap') || {};
    const auction = Store.get('intel_competitive_auction') || [];
    const features = Store.get('intel_competitive_features') || [];

    const total = overlap.total_market || 1;

    let html = '<div class="domain-page">';

    html += Components.sectionHeader('Competitive Intelligence', 'GlobalAir.com vs Controller.com — keyword coverage, auction position, feature comparison');

    // ── Part A: Keyword Overlap ──
    html += Components.partHeader('PART A', 'Keyword Overlap');
    html += '<div class="row-grid row-grid-3">';
    html += Components.kpiTile('GlobalAir.com Only', Components.formatNumber(overlap.globalair_only), {
      confidence: overlap.confidence,
      subtitle: Components.formatPct((overlap.globalair_only || 0) / total * 100) + ' of market'
    });
    html += Components.kpiTile('Overlap', Components.formatNumber(overlap.overlap), {
      confidence: overlap.confidence,
      subtitle: Components.formatPct((overlap.overlap || 0) / total * 100) + ' shared keywords'
    });
    html += Components.kpiTile('Controller Only', Components.formatNumber(overlap.controller_only), {
      confidence: overlap.confidence,
      subtitle: Components.formatPct((overlap.controller_only || 0) / total * 100) + ' of market'
    });
    html += '</div>';
    html += `<div style="text-align:center;font-size:12px;color:var(--ga-muted);margin-top:-12px;margin-bottom:20px;">
      Total addressable keyword market: ${Components.formatNumber(total)} &nbsp;|&nbsp; Last updated: ${Components.formatDate(overlap.last_updated)}
    </div>`;

    // ── Part B: Auction Insights ──
    html += Components.partHeader('PART B', 'Auction Insights vs Controller.com');
    html += Components.table(
      [
        { key: 'week', label: 'Week' },
        { key: 'impression_share', label: 'Impression Share', render: (val) => Components.formatPct(val) },
        { key: 'overlap_rate', label: 'Overlap Rate', render: (val) => Components.formatPct(val) },
        { key: 'position_above', label: 'Position Above Rate', render: (val) => Components.formatPct(val) }
      ],
      auction,
      { id: 'tbl-auction', sortable: true, csvFilename: 'Auction_Insights' }
    );

    // ── Part C: Feature Comparison ──
    html += Components.partHeader('PART C', 'Feature Comparison');
    html += Components.table(
      [
        { key: 'feature', label: 'Feature' },
        { key: 'globalair', label: 'GlobalAir.com', render: (val) => val ? '<span style="color:var(--ga-green-dark);font-weight:700;font-size:16px;">&#10004;</span>' : '<span style="color:var(--ga-red);font-size:16px;">&#10008;</span>' },
        { key: 'controller', label: 'Controller.com', render: (val) => val ? '<span style="color:var(--ga-green-dark);font-weight:700;font-size:16px;">&#10004;</span>' : '<span style="color:var(--ga-red);font-size:16px;">&#10008;</span>' },
        { key: 'advantage', label: 'Advantage', render: (val) => {
          if (val === 'globalair') return Components.badge('GlobalAir', 'green');
          if (val === 'controller') return Components.badge('Controller', 'red');
          return Components.badge('Neither', 'amber');
        }}
      ],
      features,
      { id: 'tbl-features', sortable: false, csvFilename: 'Feature_Comparison' }
    );

    // ── Part D: Category Defensibility Score ──
    const categories = Store.get('intel_competitive_defensibility') || [];
    html += Components.partHeader('PART D', 'Category Defensibility Score');

    html += Components.alertBanner(
      '<strong>Category Defensibility:</strong> Combined rank stability, CPC pressure, content depth, listing depth, and repeat audience strength vs Controller. Score 0–100. Below 50 = vulnerable.',
      'info'
    );

    html += Components.table(
      [
        { key: 'category', label: 'Category' },
        { key: 'score', label: 'Defensibility', render: (val) => {
          const color = val >= 70 ? 'green' : val >= 50 ? 'amber' : 'red';
          return Components.badge(val + '/100', color);
        }},
        { key: 'rank_stability', label: 'Rank Stability', render: (val) => Components.formatPct(val) },
        { key: 'cpc_pressure', label: 'CPC Pressure', render: (val) => {
          const color = val === 'Low' ? 'green' : val === 'Medium' ? 'amber' : 'red';
          return Components.badge(val, color);
        }},
        { key: 'content_depth', label: 'Content Depth', render: (val) => Components.formatNumber(val) + ' articles' },
        { key: 'listing_depth', label: 'Listing Depth', render: (val) => Components.formatNumber(val) },
        { key: 'repeat_audience', label: 'Repeat Audience', render: (val) => Components.formatPct(val) },
        { key: 'trend', label: 'Trend', render: (val) => {
          if (val === 'rising') return '<span style="color:var(--ga-green-dark);">&#9650; Rising</span>';
          if (val === 'falling') return '<span style="color:var(--ga-red);">&#9660; Falling</span>';
          return '<span style="color:var(--ga-muted);">&#9654; Stable</span>';
        }},
        { key: 'confidence', label: 'Confidence', render: (val) => Confidence.badge(val) }
      ],
      categories,
      { id: 'tbl-defensibility', sortable: true, csvFilename: 'Category_Defensibility' }
    );

    // Vulnerability callout
    const vulnerable = categories.filter(c => c.score < 50);
    if (vulnerable.length > 0) {
      const names = vulnerable.map(v => v.category).join(', ');
      html += Components.alertBanner(
        '<strong>Vulnerable categories:</strong> ' + names + ' — score below 50. Prioritize content depth, listing quality, and negative keyword defense in these verticals.',
        'error'
      );
    }

    // ── Part E: Competitive Alerts ──
    html += Components.partHeader('PART E', 'Competitive Alerts');
    const alertLevel = detectImpressionShareDrop(auction);
    if (alertLevel === 'warning') {
      html += Components.alertBanner('Impression share dropped 5+ points week-over-week. Review bid strategy (P5) or budget reallocation (P9).', 'error');
    } else {
      html += Components.alertBanner('Competitive positioning stable. No 5-point impression share drops detected in trailing 3-week window.', 'info');
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function detectImpressionShareDrop(auction) {
    if (!auction || auction.length < 2) return 'stable';
    for (let i = 1; i < auction.length; i++) {
      const delta = auction[i - 1].impression_share - auction[i].impression_share;
      if (delta >= 5) return 'warning';
    }
    return 'stable';
  }

  return { render };
})();
