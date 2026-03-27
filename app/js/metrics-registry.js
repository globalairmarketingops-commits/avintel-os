/* =====================================================================
   AvIntelOS — Metrics & Definitions Registry
   Single source of truth for every metric displayed in AvIntelOS.
   Each metric: id, name, definition, formula, source, unit, whyItMatters.
   ===================================================================== */

const MetricsRegistry = (() => {
  const metrics = {
    qi: {
      id: 'qi', name: 'Qualified Inquiries (QI)',
      definition: 'Total buyer inquiries that meet qualification criteria — form submissions and connected phone calls exceeding 90 seconds.',
      formula: 'Form Submissions + Qualified Phone Calls (≥90s)',
      source: 'GA4 + CallRail (when active)',
      unit: 'count',
      whyItMatters: 'Primary volume metric. Every marketing initiative must trace back to QI growth.'
    },
    cpqi: {
      id: 'cpqi', name: 'Cost Per Qualified Inquiry (CPQI)',
      definition: 'Total paid spend divided by qualified inquiries in the same period.',
      formula: 'Total Spend / QI',
      source: 'Google Ads + GA4',
      unit: 'currency',
      whyItMatters: 'Primary efficiency metric. Rising CPQI without rising QI volume signals bid inefficiency or quality degradation.'
    },
    arpa: {
      id: 'arpa', name: 'Average Revenue Per Account (ARPA)',
      definition: 'Total advertiser revenue divided by number of active accounts.',
      formula: 'Total Advertiser Revenue / Active Accounts',
      source: 'Billing/CRM (when available)',
      unit: 'currency',
      whyItMatters: 'Advertiser health metric. Growth indicates successful upsells and retention.'
    },
    engagement_rate_clean: {
      id: 'engagement_rate_clean', name: 'Engagement Rate (Clean)',
      definition: 'GA4 engagement rate excluding Email_Open_ contaminated sessions. Real rate is ~69% vs reported ~17%.',
      formula: 'Engaged Sessions (excl. Email_Open_) / Total Sessions (excl. Email_Open_)',
      source: 'GA4 (filtered)',
      unit: 'percent',
      whyItMatters: 'True site engagement. Contaminated rate misleads decisions — always use the clean metric.'
    },
    ctr: {
      id: 'ctr', name: 'Click-Through Rate (CTR)',
      definition: 'Percentage of impressions that resulted in a click.',
      formula: 'Clicks / Impressions × 100',
      source: 'GSC (organic) / Google Ads (paid)',
      unit: 'percent',
      whyItMatters: 'Measures ad/listing relevance. Declining CTR on stable impressions signals content freshness or SERP displacement issues.'
    },
    avg_position: {
      id: 'avg_position', name: 'Average Position',
      definition: 'Average ranking position in Google search results for tracked queries.',
      formula: 'Sum of Positions / Number of Queries',
      source: 'GSC',
      unit: 'number',
      whyItMatters: 'Lower is better. Position 1-3 captures 60%+ of organic clicks.'
    },
    impression_share: {
      id: 'impression_share', name: 'Impression Share',
      definition: 'Percentage of total available impressions captured by GlobalAir ads.',
      formula: 'Impressions / Total Eligible Impressions × 100',
      source: 'Google Ads Auction Insights',
      unit: 'percent',
      whyItMatters: 'Measures competitive visibility. A weekly drop of 5+ points vs Controller signals a bid or budget issue.'
    },
    sov: {
      id: 'sov', name: 'Share of Voice (SOV)',
      definition: 'Combined organic and paid visibility share for target keywords vs competitors.',
      formula: '(Organic Impressions + Paid Impressions) / Total Market Impressions',
      source: 'GSC + Google Ads + SEMrush',
      unit: 'percent',
      whyItMatters: 'Comprehensive competitive position metric. SOV tracks whether GlobalAir is winning or losing ground overall.'
    },
    revenue: {
      id: 'revenue', name: 'Revenue',
      definition: 'Total advertiser revenue across all streams: listings, featured, display, BrokerNet, sponsorships, FBO, events.',
      formula: 'Sum of all revenue streams',
      source: 'Billing/CRM (when available)',
      unit: 'currency',
      whyItMatters: 'Top-line business health. Revenue retention is Prime Directive #3.'
    },
    sessions: {
      id: 'sessions', name: 'Sessions',
      definition: 'Total site visits as measured by GA4, excluding Email_Open_ contamination when signal clean mode is active.',
      formula: 'GA4 session count (filtered)',
      source: 'GA4',
      unit: 'count',
      whyItMatters: 'Volume indicator. Session trends by channel reveal where traffic growth or decline is occurring.'
    },
    bounce_rate: {
      id: 'bounce_rate', name: 'Bounce Rate',
      definition: 'Percentage of sessions with no engagement (single page, <10 seconds, no events).',
      formula: 'Non-Engaged Sessions / Total Sessions × 100',
      source: 'GA4',
      unit: 'percent',
      whyItMatters: 'High bounce on landing pages indicates poor ad-to-page alignment or UX issues.'
    },
    conversion_rate: {
      id: 'conversion_rate', name: 'Conversion Rate',
      definition: 'Percentage of sessions resulting in a qualified inquiry.',
      formula: 'QI / Sessions × 100',
      source: 'GA4 + Google Ads',
      unit: 'percent',
      whyItMatters: 'Measures funnel efficiency. Conversion rate × traffic = total QI output.'
    },
    revenue_total: {
      id: 'revenue_total', name: 'Total Advertiser Revenue',
      definition: 'Total invoiced advertiser revenue in period by product stream. Source hierarchy: Billing/CRM > MVS > Manual.',
      formula: 'Sum of invoiced amounts by stream',
      source: 'Billing/CRM, MVS, Manual',
      unit: 'currency',
      whyItMatters: 'Top-line business health by stream. Prime Directive #3 metric.'
    },
    retention_rate: {
      id: 'retention_rate', name: 'Advertiser Retention Rate',
      definition: 'Percentage of advertisers retained at renewal. Core monetization health metric.',
      formula: 'retained_advertisers / advertisers_up_for_renewal',
      source: 'Billing/CRM',
      unit: 'percentage',
      whyItMatters: 'Signals advertiser satisfaction and product-market fit. Declining retention blocks scaling.'
    },
    revenue_per_qi: {
      id: 'revenue_per_qi', name: 'Revenue Per Qualified Inquiry',
      definition: 'Attributable revenue divided by qualified inquiries. Remains PROBABLE until CRM integration is live and reconciled.',
      formula: 'attributable_revenue / qualified_inquiries',
      source: 'Billing/CRM + QI events',
      unit: 'currency',
      whyItMatters: 'Links buyer demand (QI) to monetization. Bridges marketing and revenue accountability.'
    },
    revenue_delta_integrity: {
      id: 'revenue_delta_integrity', name: 'Revenue Delta Integrity',
      definition: 'Measures reconciliation gap between billing and MVS. High delta = investigation required.',
      formula: 'abs(billing_value - mvs_value) / billing_value',
      source: 'Billing/CRM, MVS',
      unit: 'percentage',
      whyItMatters: 'Data quality checkpoint. Flags when billing and analytics systems diverge.'
    },
    broker_health_score: {
      id: 'broker_health_score', name: 'Broker Health Score',
      definition: 'Weighted composite of inquiry quality, response speed, listing quality, revenue trend, and renewal risk.',
      formula: 'weighted(inquiry_quality, response_speed, listing_quality, revenue_trend, renewal_risk)',
      source: 'CRM, Listing DB, Inquiry Events',
      unit: 'score_0_100',
      whyItMatters: 'Single-number indicator of broker viability. Flags at-risk renewals for intervention.'
    },
    renewal_risk_score: {
      id: 'renewal_risk_score', name: 'Renewal Risk Score',
      definition: 'Composite risk indicator combining inquiry decline, visibility loss, low package utilization, and renewal proximity.',
      formula: 'weighted(inquiry_decline, visibility_loss, low_utilization, renewal_proximity)',
      source: 'CRM, Billing',
      unit: 'score_0_100',
      whyItMatters: 'Predictive indicator of churn. High scores trigger account recovery playbooks.'
    },
    package_utilization: {
      id: 'package_utilization', name: 'Package Utilization',
      definition: 'Percentage of premium features actively used by an advertiser.',
      formula: 'premium_features_used / premium_features_available',
      source: 'Account System',
      unit: 'percentage',
      whyItMatters: 'Indicates feature adoption and perceived value. Low utilization suggests support or messaging gap.'
    },
    listing_quality_score: {
      id: 'listing_quality_score', name: 'Listing Quality Score',
      definition: 'Weighted score of photo completeness, spec completeness, price presence, freshness, and media richness.',
      formula: 'weighted(photos, specs, price_visible, freshness, media_richness)',
      source: 'Listing DB',
      unit: 'score_0_100',
      whyItMatters: 'Directly impacts buyer engagement. High quality listings convert 2–3× better.'
    },
    stale_inventory_ratio: {
      id: 'stale_inventory_ratio', name: 'Stale Inventory Ratio',
      definition: 'Percentage of listings past freshness threshold.',
      formula: 'stale_listings / total_listings',
      source: 'Listing DB',
      unit: 'percentage',
      whyItMatters: 'Signals listing maintenance gaps. Stale inventory reduces platform credibility and buyer trust.'
    },
    listing_cvr: {
      id: 'listing_cvr', name: 'Listing Conversion Rate',
      definition: 'Inquiries generated per listing detail view.',
      formula: 'listing_inquiries / listing_detail_views',
      source: 'GA4 + Listing DB',
      unit: 'percentage',
      whyItMatters: 'Measures how compelling individual listings are to buyers viewing them.'
    },
    premium_listing_lift: {
      id: 'premium_listing_lift', name: 'Premium Listing Lift',
      definition: 'CVR difference between premium and standard listings.',
      formula: 'premium_cvr - standard_cvr',
      source: 'Listing DB + GA4',
      unit: 'percentage_delta',
      whyItMatters: 'Quantifies monetization upside from premium features. Powers upsell messaging.'
    },
    demand_momentum: {
      id: 'demand_momentum', name: 'Demand Momentum Score',
      definition: 'Weighted recent growth in organic queries, PPC search terms, listing views, and repeat visits for a model/category.',
      formula: 'weighted(query_growth, ppc_term_growth, listing_view_growth, repeat_visit_growth)',
      source: 'GSC, Google Ads, GA4',
      unit: 'score_0_100',
      whyItMatters: 'Signals emerging buyer interest. Guides content and media investment decisions.'
    },
    demand_inventory_imbalance: {
      id: 'demand_inventory_imbalance', name: 'Demand-to-Inventory Imbalance',
      definition: 'Ratio of buyer demand score to available quality inventory. High = opportunity or risk.',
      formula: 'demand_score / quality_inventory_count',
      source: 'GSC, Listing DB',
      unit: 'ratio',
      whyItMatters: 'Identifies supply-demand gaps. High imbalance = broker acquisition + content opportunity.'
    },
    emerging_model_opportunity: {
      id: 'emerging_model_opportunity', name: 'Emerging Model Opportunity Score',
      definition: 'Composite of demand growth, commercial intent, and competitive weakness for a model.',
      formula: 'demand_growth × commercial_intent × competitive_weakness',
      source: 'GSC, SEMrush, Google Ads',
      unit: 'score_0_100',
      whyItMatters: 'Flags highest-ROI content and broker recruitment targets.'
    },
    decision_confidence_pct: {
      id: 'decision_confidence_pct', name: 'Decision Confidence %',
      definition: 'Percentage of KPI stack currently sourced from CONFIRMED data.',
      formula: 'confirmed_kpis / total_rendered_kpis',
      source: 'Confidence Model',
      unit: 'percentage',
      whyItMatters: 'Tracks data quality maturity. <70% signals measurement gaps blocking scaling decisions.'
    },
    search_term_waste: {
      id: 'search_term_waste', name: 'Search Term Waste Rate',
      definition: 'Percentage of paid spend on irrelevant or non-buyer-intent queries.',
      formula: 'irrelevant_spend / total_spend',
      source: 'Google Ads Search Terms',
      unit: 'percentage',
      whyItMatters: 'Indicates budget efficiency. High waste signals negative keyword or bidding strategy gaps.'
    },
    category_defensibility: {
      id: 'category_defensibility', name: 'Category Defensibility Score',
      definition: 'Combined rank stability, CPC pressure, content depth, listing depth, and repeat audience strength vs Controller.',
      formula: 'weighted(rank_stability, cpc_pressure_inv, content_depth, listing_depth, repeat_audience)',
      source: 'GSC, Google Ads, SEMrush',
      unit: 'score_0_100',
      whyItMatters: 'Measures competitive moat per category. Low scores signal vulnerability vs Controller.'
    },
    content_assist_rate: {
      id: 'content_assist_rate', name: 'Content Assist Rate',
      definition: 'Percentage of QIs where a content touch occurred in the conversion path.',
      formula: 'content_assisted_qis / total_qis',
      source: 'GA4 Attribution',
      unit: 'percentage',
      whyItMatters: 'Validates editorial content ROI. Guides content investment sizing.'
    },
    friction_score: {
      id: 'friction_score', name: 'Friction Score',
      definition: 'Normalized composite of form drop-off, speed issues, low CTA interaction, and high return-to-search.',
      formula: 'normalized(dropoff + speed_penalty + low_cta + high_return_to_search)',
      source: 'GA4, Clarity',
      unit: 'score_0_100',
      whyItMatters: 'Identifies UX conversion barriers. Drives landing page optimization roadmap.'
    }
  };

  function lookup(id) {
    return metrics[id] || null;
  }

  function tooltip(id) {
    const m = metrics[id];
    if (!m) return '';
    return `<span class="metric-tooltip-trigger">?<div class="metric-tooltip-popup">
      <div class="metric-tooltip-title">${m.name}</div>
      <div>${m.definition}</div>
      <div style="margin-top:6px;font-style:italic;color:var(--ga-green);">Why it matters: ${m.whyItMatters}</div>
    </div></span>`;
  }

  function getAll() {
    return metrics;
  }

  return { lookup, tooltip, getAll };
})();
