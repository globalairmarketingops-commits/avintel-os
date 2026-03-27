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

    // ── Part D: Competitive Alerts ──
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
