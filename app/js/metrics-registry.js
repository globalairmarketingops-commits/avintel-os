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
