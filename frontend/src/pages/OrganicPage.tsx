import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import Topbar from "../components/layout/Topbar";

export default function OrganicPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: kpis, isLoading: kpisLoading } = useQuery({ queryKey: ["organic-kpis"], queryFn: api.getOrganicKpis });
  const { data: queryClusters, isLoading: clustersLoading } = useQuery({ queryKey: ["organic-query-clusters"], queryFn: api.getQueryClusters });
  const { data: modelPages, isLoading: modelPagesLoading } = useQuery({ queryKey: ["organic-model-pages"], queryFn: api.getModelPages });
  const { data: portfolio } = useQuery({ queryKey: ["organic-portfolio"], queryFn: api.getPortfolio });
  const { data: categories, isLoading: categoriesLoading } = useQuery({ queryKey: ["organic-categories"], queryFn: api.getOrganicCategories });
  const { data: competitiveSerp, isLoading: serpLoading } = useQuery({ queryKey: ["organic-competitive-serp"], queryFn: api.getCompetitiveSerp });
  const { data: demandMismatch, isLoading: mismatchLoading } = useQuery({ queryKey: ["organic-demand-mismatch"], queryFn: api.getDemandMismatch });
  const { data: contentAssist, isLoading: contentLoading } = useQuery({ queryKey: ["organic-content-assist"], queryFn: api.getContentAssist });

  const isLoading = kpisLoading || clustersLoading || modelPagesLoading || categoriesLoading || serpLoading || mismatchLoading || contentLoading;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "queue", label: "Opportunity Queue" },
    { id: "serp", label: "SERP & Commercial Pages" },
    { id: "models", label: "Model Coverage" },
    { id: "competitive", label: "Competitive" },
    { id: "content", label: "Content Assist" },
    { id: "trust", label: "Trust" },
  ];

  return (
    <>
      <Topbar pageTitle="Organic Intelligence" />

      {/* PAGE HERO */}
      <div className="page-hero">
        <div className="hero-eyebrow">GlobalAir.com / Av/IntelOS</div>
        <h1 className="hero-title">Organic Intelligence</h1>
        <p className="hero-sub">
          Commercial CTR performance, model hub coverage, query cluster analysis,
          competitive gap mapping, and content assist attribution.
        </p>
      </div>

      {/* TAB BAR */}
      <div className="tab-bar">
        <div className="tab-bar-inner">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`tab-btn${activeTab === t.id ? " active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* PAGE BODY */}
      {isLoading && <div style={{ textAlign: "center", padding: "32px 0", color: "var(--navy)", fontSize: 14 }}>Loading data...</div>}
      <div className="page-body">

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === "overview" && (
          <div>
            <div className="section-label mb-16">Organic Intelligence KPIs</div>
            <div className="metric-grid-5 mb-20">
              <div className="metric-card">
                <div className="m-label">Organic QI</div>
                <div className="m-value">{kpis?.qi_count ?? "—"}</div>
                <div className="m-sub"><span className={kpis?.qi_trend_direction === "up" ? "up" : "down"}>{kpis?.qi_trend_direction === "up" ? "▲" : "▼"} {kpis?.qi_trend ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${kpis?.qi_confidence?.toLowerCase() ?? "probable"}`}>{kpis?.qi_confidence ?? "—"}</span></div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Organic-Assisted QI</div>
                <div className="m-value m-warn">{kpis?.assisted_qi_count ?? "—"}</div>
                <div className="m-sub"><span className={kpis?.assisted_qi_trend_direction === "up" ? "up" : "down"}>{kpis?.assisted_qi_trend_direction === "up" ? "▲" : "▼"} {kpis?.assisted_qi_trend ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${kpis?.assisted_qi_confidence?.toLowerCase() ?? "probable"}`}>{kpis?.assisted_qi_confidence ?? "—"}</span></div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">CTR Priority Commercial</div>
                <div className="m-value m-bad">{kpis?.ctr_commercial ?? "—"}</div>
                <div className="m-sub"><span className={kpis?.ctr_trend_direction === "up" ? "up" : "down"}>{kpis?.ctr_trend_direction === "up" ? "▲" : "▼"} {kpis?.ctr_trend ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${kpis?.ctr_confidence?.toLowerCase() ?? "confirmed"}`}>{kpis?.ctr_confidence ?? "—"}</span></div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Share vs Competitors</div>
                <div className="m-value m-warn">{kpis?.competitor_share ?? "—"}</div>
                <div className="m-sub"><span className={kpis?.share_trend_direction === "up" ? "up" : "down"}>{kpis?.share_trend_direction === "up" ? "▲" : "▼"} {kpis?.share_trend ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${kpis?.share_confidence?.toLowerCase() ?? "probable"}`}>{kpis?.share_confidence ?? "—"}</span></div>
                <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Demand/Inventory Mismatch</div>
                <div className="m-value m-warn">{kpis?.demand_mismatch ?? "—"}</div>
                <div className="m-sub"><span className={kpis?.mismatch_trend_direction === "up" ? "up" : "down"}>{kpis?.mismatch_trend_direction === "up" ? "▲" : "▼"} {kpis?.mismatch_trend ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${kpis?.mismatch_confidence?.toLowerCase() ?? "probable"}`}>{kpis?.mismatch_confidence ?? "—"}</span></div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-title">Query Clusters — Performance</div>
                <div className="soft-list">
                  {(queryClusters ?? []).map((c: any, i: number) => (
                    <div className="soft-row" key={i}>
                      <span className="row-label">{c.cluster ?? "—"}</span>
                      <span className={`row-value${c.status_class ? ` ${c.status_class}` : ""}`}>{c.summary ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-title">Organic QI Trend (7-Day)</div>
                <div className="chart-shell">
                  <div className="gridlines"></div>
                  <div className="line-wrap">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline
                        fill="rgba(16,34,151,.1)"
                        stroke="#102297"
                        strokeWidth="3"
                        points="0,68 17,64 33,60 50,55 67,51 83,47 100,38"
                      />
                    </svg>
                  </div>
                </div>
                <div className="legend-row">
                  <span>
                    <span className="legend-dot" style={{ background: "var(--navy)" }}></span>
                    <span className="legend-label">{portfolio?.qi_trend_label ?? "Organic QI: —"}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== OPPORTUNITY QUEUE TAB ==================== */}
        {activeTab === "queue" && (
          <div>
            <div className="section-label mb-16">Organic Opportunity Queue</div>

            {(demandMismatch ?? []).map((opp: any, i: number) => (
              <div className={`opp-card${opp.pinned ? " pinned" : ""}${opp.do_not_act ? " do-not-act" : ""}`} key={i}>
                <div className="opp-header">
                  <div className="opp-signal">{opp.do_not_act ? "⚠ Do Not Act Yet — " : ""}[Score {opp.score ?? "—"}] {opp.signal ?? "—"}</div>
                  <div className="opp-badges">
                    {opp.badge && <span className={`badge-${opp.badge_class ?? "organic"}`}>{opp.badge}</span>}
                    <span className={`conf-${opp.confidence?.toLowerCase() ?? "probable"}`}>{opp.confidence ?? "—"}</span>
                    <span className={`pri-${opp.priority?.toLowerCase() ?? "next"}`}>{opp.priority ?? "—"}</span>
                  </div>
                </div>
                <div className="opp-gap">{opp.gap ?? "—"}</div>
                {opp.meta && (
                  <div className="opp-meta">
                    {opp.meta.map((m: any, j: number) => (
                      <div className="opp-meta-item" key={j}>
                        <div className="opp-meta-label">{m.label ?? "—"}</div>
                        <div className="opp-meta-value">{m.value ?? "—"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ==================== SERP & COMMERCIAL PAGES TAB ==================== */}
        {activeTab === "serp" && (
          <div>
            <div className="section-label mb-16">Commercial Pages — SERP Performance</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Type</th>
                    <th>Make / Model</th>
                    <th>Impressions</th>
                    <th>CTR</th>
                    <th>Position</th>
                    <th>Inquiry Rate</th>
                    <th>Issue</th>
                    <th>Action</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(competitiveSerp ?? []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="td-code">{row.page ?? "—"}</td>
                      <td>{row.type ?? "—"}</td>
                      <td>{row.make_model ?? "—"}</td>
                      <td>{row.impressions ?? "—"}</td>
                      <td className={row.ctr_class ?? ""}>{row.ctr ?? "—"}</td>
                      <td>{row.position ?? "—"}</td>
                      <td>{row.inquiry_rate ?? "—"}</td>
                      <td>{row.issue ?? "—"}</td>
                      <td>{row.action ?? "—"}</td>
                      <td><span className={`conf-${row.confidence?.toLowerCase() ?? "probable"}`}>{row.confidence ?? "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== MODEL COVERAGE TAB ==================== */}
        {activeTab === "models" && (
          <div>
            <div className="section-label mb-16">Priority Model Hub Coverage</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Make</th>
                    <th>Model</th>
                    <th>Class</th>
                    <th>Demand</th>
                    <th>Inventory</th>
                    <th>Page Status</th>
                    <th>Opportunity</th>
                    <th>Action</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(modelPages ?? []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td>{row.make ?? "—"}</td>
                      <td className="td-primary">{row.model ?? "—"}</td>
                      <td>{row.class ?? "—"}</td>
                      <td className={row.demand_class ?? ""}>{row.demand ?? "—"}</td>
                      <td className={row.inventory_class ?? ""}>{row.inventory ?? "—"}</td>
                      <td>{row.page_status ?? "—"}</td>
                      <td>{row.opportunity ?? "—"}</td>
                      <td>{row.action ?? "—"}</td>
                      <td><span className={`conf-${row.confidence?.toLowerCase() ?? "probable"}`}>{row.confidence ?? "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== COMPETITIVE TAB ==================== */}
        {activeTab === "competitive" && (
          <div>
            <div className="section-label mb-16">Organic Competitive Landscape</div>
            <div className="table-wrap mb-16">
              <table>
                <thead>
                  <tr>
                    <th>Competitor</th>
                    <th>Type</th>
                    <th>Cluster</th>
                    <th>GlobalAir Share</th>
                    <th>Competitor Share</th>
                    <th>Gap</th>
                    <th>Win Probability</th>
                    <th>Response</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(categories ?? []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="td-primary">{row.competitor ?? "—"}</td>
                      <td>{row.type ?? "—"}</td>
                      <td>{row.cluster ?? "—"}</td>
                      <td>{row.globalair_share ?? "—"}</td>
                      <td className={row.competitor_share_class ?? ""}>{row.competitor_share ?? "—"}</td>
                      <td>{row.gap ?? "—"}</td>
                      <td className={row.win_probability_class ?? ""}>{row.win_probability ?? "—"}</td>
                      <td>{row.response ?? "—"}</td>
                      <td><span className={`conf-${row.confidence?.toLowerCase() ?? "probable"}`}>{row.confidence ?? "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== CONTENT ASSIST TAB ==================== */}
        {activeTab === "content" && (
          <div>
            <div className="section-label mb-16">Content Assist Paths</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Type</th>
                    <th>Sessions</th>
                    <th>Assist Rate</th>
                    <th>Path Strength</th>
                    <th>Issue</th>
                    <th>Action</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(contentAssist) ? contentAssist : contentAssist?.paths ?? []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="td-code">{row.page ?? "—"}</td>
                      <td>{row.type ?? "—"}</td>
                      <td>{row.sessions ?? "—"}</td>
                      <td className={row.assist_rate_class ?? ""}>{row.assist_rate ?? "—"}</td>
                      <td>{row.path_strength ?? "—"}</td>
                      <td>{row.issue ?? "—"}</td>
                      <td>{row.action ?? "—"}</td>
                      <td><span className={`conf-${row.confidence?.toLowerCase() ?? "probable"}`}>{row.confidence ?? "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TRUST TAB ==================== */}
        {activeTab === "trust" && (
          <div>
            <div className="grid-2">
              <div className="card">
                <div className="card-title">Organic Trust Status</div>
                <div className="trust-module">
                  <div className="trust-module-title">Confirmed blockers</div>
                  <ul>
                    <li>Assisted organic conversion confidence remains partial on content pages</li>
                    <li>Inventory completeness by model is still not fully normalized</li>
                    <li>Competitor overlap is directional outside core tracked clusters</li>
                  </ul>
                </div>
                <div className="trust-module">
                  <div className="trust-module-title">Decision rules</div>
                  <ul>
                    <li>Act on confirmed CTR leaks and commercial page weaknesses first</li>
                    <li>Do not overbuild authority content without clear commercial handoff</li>
                    <li>Treat thin inventory opportunities as broker-recruitment problems, not just SEO problems</li>
                  </ul>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Saved Views</div>
                <div className="saved-views-list">
                  <div className="saved-view-btn">
                    <div className="sv-name">Weekly Organic Priorities</div>
                    <div className="sv-desc">Pinned fixes, CTR leaks, and model-level attack zones.</div>
                  </div>
                  <div className="saved-view-btn">
                    <div className="sv-name">CTR Leak Fixes</div>
                    <div className="sv-desc">High-impression low-CTR commercial pages and query leakage.</div>
                  </div>
                  <div className="saved-view-btn">
                    <div className="sv-name">Controller Attack Zones</div>
                    <div className="sv-desc">Model clusters where GlobalAir can realistically gain share.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
