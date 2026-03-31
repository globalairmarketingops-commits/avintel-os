const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api/v1" : "http://localhost:5224/api/v1");

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

async function patchApi<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

async function postApi<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// ─── System ───
export const api = {
  getMe: () => fetchApi<any>("/me"),
  getDataSources: () => fetchApi<any[]>("/data-sources"),
  getIngestionLogs: () => fetchApi<any[]>("/ingestion-logs"),
  getSystemHealth: () => fetchApi<any[]>("/system-health"),
  getAlerts: () => fetchApi<any[]>("/alerts"),
  resolveAlert: (id: number, notes: string) => patchApi<any>(`/alerts/${id}/resolve`, { resolution_notes: notes }),
  getMetricsRegistry: () => fetchApi<any[]>("/metrics-registry"),

  // ─── Dashboard ───
  getDashboardKpis: () => fetchApi<any>("/dashboard/kpis"),
  getPrimeDirective: () => fetchApi<any[]>("/dashboard/prime-directive"),
  getMovers: () => fetchApi<any[]>("/dashboard/movers"),
  getOpportunities: () => fetchApi<any[]>("/dashboard/opportunities"),
  getActionFramework: () => fetchApi<any>("/dashboard/action-framework"),
  getLeakageMap: () => fetchApi<any[]>("/dashboard/leakage-map"),
  getCompetitiveZones: () => fetchApi<any>("/dashboard/competitive-zones"),
  getDataTrust: () => fetchApi<any>("/dashboard/data-trust"),
  getQiTrend: () => fetchApi<any[]>("/dashboard/qi-trend"),

  // ─── GA4 ───
  getGa4QualityMetrics: () => fetchApi<any>("/ga4/quality-metrics"),
  getGa4Channels: () => fetchApi<any[]>("/ga4/channels"),
  getGa4LandingPages: () => fetchApi<any[]>("/ga4/landing-pages"),
  getGa4Events: () => fetchApi<any[]>("/ga4/events"),
  getGa4PropertyHealth: () => fetchApi<any>("/ga4/property-health"),
  getGa4ContaminationExclusions: () => fetchApi<any[]>("/ga4/contamination-exclusions"),
  getGa4MeasurementTrust: () => fetchApi<any>("/ga4/measurement-trust"),

  // ─── Organic ───
  getOrganicKpis: () => fetchApi<any>("/organic/kpis"),
  getQueryClusters: () => fetchApi<any[]>("/organic/query-clusters"),
  getModelPages: () => fetchApi<any[]>("/organic/model-pages"),
  getPortfolio: () => fetchApi<any>("/organic/portfolio"),
  getOrganicCategories: () => fetchApi<any[]>("/organic/categories"),
  getCompetitiveSerp: () => fetchApi<any[]>("/organic/competitive-serp"),
  getDemandMismatch: () => fetchApi<any[]>("/organic/demand-mismatch"),
  getContentAssist: () => fetchApi<any>("/organic/content-assist"),

  // ─── Execution ───
  getConstraints: () => fetchApi<any>("/execution/constraints"),
  getBlockers: () => fetchApi<any[]>("/execution/blockers"),
  getPriorities: () => fetchApi<any[]>("/execution/priorities"),
  getInitiatives: () => fetchApi<any[]>("/execution/initiatives"),
  createExecutionItem: (item: Record<string, unknown>) => postApi<any>("/execution/items", item),
  updateExecutionItem: (id: number, updates: Record<string, unknown>) => patchApi<any>(`/execution/items/${id}`, updates),
  resolveExecutionItem: (id: number) => patchApi<any>(`/execution/items/${id}/resolve`, {}),

  // ─── PPC ───
  getPpcKpis: () => fetchApi<any>("/ppc/kpis"),
  getPpcCampaigns: () => fetchApi<any[]>("/ppc/campaigns"),
  getPpcModelPerformance: () => fetchApi<any[]>("/ppc/model-performance"),
  getPpcSearchTerms: () => fetchApi<any[]>("/ppc/search-terms"),
  getPpcWasteAnalysis: () => fetchApi<any>("/ppc/waste-analysis"),
  getPpcRetargeting: () => fetchApi<any[]>("/ppc/retargeting"),
  getPpcAuctionInsights: () => fetchApi<any[]>("/ppc/auction-insights"),
  getPpcCompetitivePositioning: () => fetchApi<any>("/ppc/competitive-positioning"),
  getPpcNegativeKeywords: () => fetchApi<any[]>("/ppc/negative-keywords"),

  // ─── SEO ───
  getSeoStatus: () => fetchApi<any>("/seo/status"),
  getSeoPlays: () => fetchApi<any[]>("/seo/plays"),
  getSeoCategoryMatrix: () => fetchApi<any[]>("/seo/category-matrix"),
  getSeoModelHubs: () => fetchApi<any[]>("/seo/model-hubs"),
  getSeoTechnicalControls: () => fetchApi<any[]>("/seo/technical-controls"),
  getSeoCompetitiveOpportunity: () => fetchApi<any[]>("/seo/competitive-opportunity"),
  createSeoPlay: (play: Record<string, unknown>) => postApi<any>("/seo/plays", play),
  updateSeoPlay: (id: number, updates: Record<string, unknown>) => patchApi<any>(`/seo/plays/${id}`, updates),

  // ─── Email ───
  getEmailKpis: () => fetchApi<any>("/email/kpis"),
  getEmailSequences: () => fetchApi<any[]>("/email/sequences"),
  getEmailScoringTiers: () => fetchApi<any[]>("/email/scoring-tiers"),
  getEmailRetargetingSegments: () => fetchApi<any[]>("/email/retargeting-segments"),
  getEmailAttributionBlockers: () => fetchApi<any[]>("/email/attribution-blockers"),
  getEmailPerformance: () => fetchApi<any[]>("/email/performance"),
  getEmailServers: () => fetchApi<any[]>("/email/servers"),
  getEmailNewsletterSegments: () => fetchApi<any[]>("/email/newsletter-segments"),

  // ─── Social ───
  getSocialKpis: () => fetchApi<any>("/social/kpis"),
  getSocialPlatformGuidelines: () => fetchApi<any[]>("/social/platform-guidelines"),
  getSocialContentBuckets: () => fetchApi<any[]>("/social/content-buckets"),
  getSocialBrokerSpotlights: () => fetchApi<any[]>("/social/broker-spotlights"),
  getSocialEventCoverage: () => fetchApi<any[]>("/social/event-coverage"),
  getSocialLoopMetrics: () => fetchApi<any>("/social/loop-metrics"),

  // ─── Events ───
  getEventsKpis: () => fetchApi<any>("/events/kpis"),
  getEventsRevenueProducts: () => fetchApi<any[]>("/events/revenue-products"),
  getEventsPreEventStatus: () => fetchApi<any[]>("/events/pre-event-status"),
  getEventsOnSiteDoctrine: () => fetchApi<any[]>("/events/on-site-doctrine"),
  getEventsPostEventStatus: () => fetchApi<any[]>("/events/post-event-status"),
  getEventsPartnerships: () => fetchApi<any[]>("/events/partnerships"),
  getEventsContentCapture: () => fetchApi<any[]>("/events/content-capture"),
  getEventsAttribution: () => fetchApi<any[]>("/events/attribution"),

  // ─── Content ───
  getContentKpis: () => fetchApi<any>("/content/kpis"),
  getContentArticles: () => fetchApi<any[]>("/content/articles"),
  getContentPillars: () => fetchApi<any[]>("/content/pillars"),
  getContentRefreshQueue: () => fetchApi<any[]>("/content/refresh-queue"),
  getContentAttributionPaths: () => fetchApi<any[]>("/content/attribution-paths"),
  getContentProductionBalance: () => fetchApi<any>("/content/production-balance"),

  // ─── Health ───
  getHealthOverview: () => fetchApi<any>("/health/overview"),
  getHealthIncidents: () => fetchApi<any[]>("/health/incidents"),
  getHealthSourceFreshness: () => fetchApi<any[]>("/health/source-freshness"),
  getHealthCrawlers: () => fetchApi<any[]>("/health/crawlers"),
  getHealthEmailDeliverability: () => fetchApi<any[]>("/health/email-deliverability"),
  getHealthPageTrust: () => fetchApi<any[]>("/health/page-trust"),
  getHealthTrustRegistry: () => fetchApi<any>("/health/trust-registry"),
  getHealthFreshnessTrend: () => fetchApi<any[]>("/health/freshness-trend"),

  // ─── Conversions ───
  getConversionsSummary: () => fetchApi<any>("/conversions/summary"),
  getConversionsByChannel: () => fetchApi<any[]>("/conversions/by-channel"),
  getConversionsByCategory: () => fetchApi<any[]>("/conversions/by-category"),
  getConversionsTrend: () => fetchApi<any[]>("/conversions/trend"),

  // ─── Ingestion ───
  triggerGa4Ingestion: () => postApi<any>("/ingestion/ga4", {}),
  triggerGscIngestion: () => postApi<any>("/ingestion/gsc", {}),
  triggerGoogleAdsIngestion: () => postApi<any>("/ingestion/google-ads", {}),
  triggerWindsorIngestion: () => postApi<any>("/ingestion/windsor", {}),
  triggerRefreshAll: () => postApi<any>("/ingestion/refresh-all", {}),
};
