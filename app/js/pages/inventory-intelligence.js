/* =====================================================================
   AvIntelOS — Page: Inventory Intelligence
   Listing quality, broker inventory health, premium lift, stale inventory
   ===================================================================== */

const InventoryIntelligence = (() => {

  function render(container) {
    const summary = Store.get('intel_inventory_summary') || {};
    const listings = Store.get('intel_inventory_listings') || [];
    const brokerHealth = Store.get('intel_inventory_broker_health') || [];
    const premiumLift = Store.get('intel_inventory_premium_lift') || {};
    const missingImpact = Store.get('intel_inventory_missing_impact') || {};

    let html = '<div class="domain-page">';

    // Metadata normalization warning
    html += Components.alertBanner(
      '<strong>Listing metadata normalization PENDING</strong> — quality scores are preliminary. Full accuracy pending completion of spec normalization across all brokers.',
      'warning'
    );

    html += Components.sectionHeader('Inventory Intelligence', 'Listing quality, health, premium performance, and missing data impact');

    // ── Part A: Inventory Summary Strip ──
    html += Components.partHeader('PART A', 'Inventory Summary');
    html += '<div class="row-grid row-grid-4">';
    html += Components.kpiTile('Active Listings', Components.formatNumber(summary.active_listings), {
      delta: summary.listings_delta, trend: summary.listings_trend, confidence: summary.confidence, metricId: 'listing_volume'
    });
    html += Components.kpiTile('Stale Listings', Components.formatNumber(summary.stale_listings), {
      delta: summary.stale_delta, trend: summary.stale_trend, confidence: summary.confidence, metricId: 'stale_inventory'
    });
    html += Components.kpiTile('Avg Listing Quality', Components.formatPct(summary.avg_listing_quality), {
      delta: summary.quality_delta, trend: summary.quality_trend, confidence: summary.confidence, metricId: 'listing_quality'
    });
    html += Components.kpiTile('Avg Listing CVR', Components.formatPct(summary.avg_listing_cvr), {
      delta: summary.cvr_delta, trend: summary.cvr_trend, confidence: summary.confidence, metricId: 'conversion_rate'
    });
    html += '</div>';

    // ── Part B: Listing Quality Table ──
    html += Components.partHeader('PART B', 'Listing Quality');
    const listingRows = listings.map(l => ({
      ...l,
      _confidence: l.confidence || 'PROBABLE'
    }));
    html += Components.table(
      [
        { key: 'listing_id', label: 'Listing ID' },
        { key: 'broker', label: 'Broker' },
        { key: 'category', label: 'Category' },
        { key: 'make_model', label: 'Make/Model' },
        { key: 'photo_count', label: 'Photos' },
        { key: 'spec_completeness', label: 'Spec Complete', render: (val) => Components.formatPct(val) },
        { key: 'price_visible', label: 'Price Visible', render: (val) => val ? 'Yes' : 'No' },
        { key: 'last_refresh', label: 'Last Refresh', render: (val) => Components.formatDate(val) },
        { key: 'quality_score', label: 'Quality Score', render: (val) => qualityScoreBadge(val) },
        { key: 'detail_views', label: 'Views', render: (val) => Components.formatNumber(val) },
        { key: 'inquiries', label: 'Inquiries', render: (val) => Components.formatNumber(val) },
        { key: 'cvr', label: 'CVR', render: (val) => Components.formatPct(val) },
        { key: 'confidence', label: 'Confidence', render: (val) => Confidence.badge(val) }
      ],
      listingRows,
      { id: 'tbl-inventory-listings', sortable: true, csvFilename: 'Listing_Quality' }
    );

    // ── Part C: Broker Inventory Health ──
    html += Components.partHeader('PART C', 'Broker Inventory Health');
    const brokerRows = brokerHealth.map(b => ({
      ...b,
      _confidence: b.confidence || 'PROBABLE'
    }));
    html += Components.table(
      [
        { key: 'broker', label: 'Broker' },
        { key: 'listing_count', label: 'Listing Count', render: (val) => Components.formatNumber(val) },
        { key: 'avg_quality', label: 'Avg Quality', render: (val) => Components.formatPct(val) },
        { key: 'stale_ratio', label: 'Stale Ratio', render: (val) => Components.formatPct(val) },
        { key: 'avg_cvr', label: 'Avg CVR', render: (val) => Components.formatPct(val) },
        { key: 'hidden_price_rate', label: 'Hidden Price Rate', render: (val) => Components.formatPct(val) },
        { key: 'photo_deficiency', label: 'Photo Deficiency', render: (val) => Components.formatPct(val) }
      ],
      brokerRows,
      { id: 'tbl-inventory-broker', sortable: true, csvFilename: 'Broker_Inventory_Health' }
    );

    // ── Part D: Premium vs Standard Panel ──
    html += Components.partHeader('PART D', 'Premium vs Standard Listing Performance');
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">';

    // Premium tier
    html += '<div>';
    html += '<h4 style="color:var(--ga-navy);font-weight:700;margin-bottom:12px;">Premium Listings</h4>';
    html += '<div style="display:flex;flex-direction:column;gap:10px;">';
    html += Components.kpiTile('Count', Components.formatNumber(premiumLift.premium_count), { confidence: 'PROBABLE' });
    html += Components.kpiTile('Avg Quality', Components.formatPct(premiumLift.premium_avg_quality), { confidence: 'PROBABLE' });
    html += Components.kpiTile('Avg CVR', Components.formatPct(premiumLift.premium_avg_cvr), { confidence: 'PROBABLE' });
    html += Components.kpiTile('Avg Views', Components.formatNumber(premiumLift.premium_avg_views), { confidence: 'PROBABLE' });
    html += '</div>';
    html += '</div>';

    // Standard tier
    html += '<div>';
    html += '<h4 style="color:var(--ga-navy);font-weight:700;margin-bottom:12px;">Standard Listings</h4>';
    html += '<div style="display:flex;flex-direction:column;gap:10px;">';
    html += Components.kpiTile('Count', Components.formatNumber(premiumLift.standard_count), { confidence: 'PROBABLE' });
    html += Components.kpiTile('Avg Quality', Components.formatPct(premiumLift.standard_avg_quality), { confidence: 'PROBABLE' });
    html += Components.kpiTile('Avg CVR', Components.formatPct(premiumLift.standard_avg_cvr), { confidence: 'PROBABLE' });
    html += Components.kpiTile('Avg Views', Components.formatNumber(premiumLift.standard_avg_views), { confidence: 'PROBABLE' });
    html += '</div>';
    html += '</div>';

    html += '</div>';

    // ── Part E: Missing Data Impact ──
    html += Components.partHeader('PART E', 'Missing Data Impact on CVR');
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;">';
    html += '<div>';
    html += '<h5 style="color:var(--ga-navy);font-weight:700;margin-bottom:8px;">Price Visibility</h5>';
    html += Components.barChart([
      { label: 'Price Visible', value: missingImpact.priced_cvr || 0, displayValue: Components.formatPct(missingImpact.priced_cvr) },
      { label: 'Price Hidden', value: missingImpact.hidden_price_cvr || 0, displayValue: Components.formatPct(missingImpact.hidden_price_cvr) }
    ], { colorClass: 'bar-fill-green' });
    html += '</div>';
    html += '<div>';
    html += '<h5 style="color:var(--ga-navy);font-weight:700;margin-bottom:8px;">Photo Quality</h5>';
    html += Components.barChart([
      { label: 'High Photos (5+)', value: missingImpact.high_photo_cvr || 0, displayValue: Components.formatPct(missingImpact.high_photo_cvr) },
      { label: 'Low Photos (<5)', value: missingImpact.low_photo_cvr || 0, displayValue: Components.formatPct(missingImpact.low_photo_cvr) }
    ], { colorClass: 'bar-fill-green' });
    html += '</div>';
    html += '<div>';
    html += '<h5 style="color:var(--ga-navy);font-weight:700;margin-bottom:8px;">Specification Completeness</h5>';
    html += Components.barChart([
      { label: 'Complete Specs', value: missingImpact.complete_spec_cvr || 0, displayValue: Components.formatPct(missingImpact.complete_spec_cvr) },
      { label: 'Incomplete Specs', value: missingImpact.incomplete_spec_cvr || 0, displayValue: Components.formatPct(missingImpact.incomplete_spec_cvr) }
    ], { colorClass: 'bar-fill-green' });
    html += '</div>';
    html += '</div>';

    html += '</div>';
    container.innerHTML = html;
  }

  function qualityScoreBadge(score) {
    if (score >= 8) return Components.badge(`${(score * 10).toFixed(0)}% EXCELLENT`, 'green');
    if (score >= 6) return Components.badge(`${(score * 10).toFixed(0)}% GOOD`, 'blue');
    if (score >= 4) return Components.badge(`${(score * 10).toFixed(0)}% FAIR`, 'amber');
    return Components.badge(`${(score * 10).toFixed(0)}% POOR`, 'red');
  }

  return { render };
})();
