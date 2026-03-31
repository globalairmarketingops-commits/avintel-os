import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import Topbar from "../components/layout/Topbar";

export default function PPCPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: kpis, isLoading: kpisLoading } = useQuery({ queryKey: ["ppc-kpis"], queryFn: api.getPpcKpis });
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({ queryKey: ["ppc-campaigns"], queryFn: api.getPpcCampaigns });
  const { data: modelPerformance, isLoading: modelPerfLoading } = useQuery({ queryKey: ["ppc-model-performance"], queryFn: api.getPpcModelPerformance });
  const { data: searchTerms, isLoading: searchTermsLoading } = useQuery({ queryKey: ["ppc-search-terms"], queryFn: api.getPpcSearchTerms });
  const { data: wasteAnalysis } = useQuery({ queryKey: ["ppc-waste-analysis"], queryFn: api.getPpcWasteAnalysis });
  const { data: retargeting, isLoading: retargetingLoading } = useQuery({ queryKey: ["ppc-retargeting"], queryFn: api.getPpcRetargeting });
  const { data: auctionInsights, isLoading: auctionLoading } = useQuery({ queryKey: ["ppc-auction-insights"], queryFn: api.getPpcAuctionInsights });
  const { data: _competitivePositioning } = useQuery({ queryKey: ["ppc-competitive-positioning"], queryFn: api.getPpcCompetitivePositioning });
  const { data: _negativeKeywords } = useQuery({ queryKey: ["ppc-negative-keywords"], queryFn: api.getPpcNegativeKeywords });

  const isLoading = kpisLoading || campaignsLoading || modelPerfLoading || searchTermsLoading || retargetingLoading || auctionLoading;

  return (
    <>
      <Topbar pageTitle="PPC Intelligence" />

      <div className="page-hero">
        <div className="hero-eyebrow">GlobalAir.com / Av/IntelOS</div>
        <h1 className="hero-title">PPC Intelligence Command</h1>
        <p className="hero-sub">
          Paid search efficiency, campaign structure governance, search term
          quality, retargeting architecture, and competitive impression share —
          all tied to CPQI discipline.
        </p>
      </div>

      <div className="tab-bar">
        <div className="tab-bar-inner">
          {[
            { id: "overview", label: "Overview" },
            { id: "queue", label: "Opportunity Queue" },
            { id: "structure", label: "Campaign Structure" },
            { id: "searchterms", label: "Search Terms" },
            { id: "retargeting", label: "Retargeting" },
            { id: "competitive", label: "Competitive" },
            { id: "trust", label: "Trust" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div style={{ textAlign: "center", padding: "32px 0", color: "var(--navy)", fontSize: 14 }}>Loading data...</div>}
      <div className="page-body">
        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div>
            <div className="section-label mb-16">PPC KPIs</div>
            <div className="metric-grid-5 mb-20">
              <div className="metric-card">
                <div className="m-label">QI from PPC</div>
                <div className="m-value">{kpis?.qi_count ?? "—"}</div>
                <div className="m-sub">
                  <span className={kpis?.qi_trend_direction === "up" ? "up" : "down"}>{kpis?.qi_trend_direction === "up" ? "▲" : "▼"} {kpis?.qi_trend ?? "—"}</span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${kpis?.qi_confidence?.toLowerCase() ?? "confirmed"}`}>{kpis?.qi_confidence ?? "—"}</span>
                </div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">CPQI</div>
                <div className="m-value">{kpis?.cpqi ?? "—"}</div>
                <div className="m-sub">
                  <span className={kpis?.cpqi_trend_direction === "up" ? "up" : "down"}>{kpis?.cpqi_trend_direction === "up" ? "▲" : "▼"} {kpis?.cpqi_trend ?? "—"}</span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${kpis?.cpqi_confidence?.toLowerCase() ?? "probable"}`}>{kpis?.cpqi_confidence ?? "—"}</span>
                </div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Piston IS Priority Models</div>
                <div className="m-value m-warn">{kpis?.piston_is ?? "—"}</div>
                <div className="m-sub">
                  <span className={kpis?.piston_is_trend_direction === "up" ? "up" : "down"}>{kpis?.piston_is_trend_direction === "up" ? "▲" : "▼"} {kpis?.piston_is_trend ?? "—"}</span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${kpis?.piston_is_confidence?.toLowerCase() ?? "confirmed"}`}>{kpis?.piston_is_confidence ?? "—"}</span>
                </div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Search Term Quality Rate</div>
                <div className="m-value m-warn">{kpis?.search_term_quality ?? "—"}</div>
                <div className="m-sub">
                  <span className={kpis?.stq_trend_direction === "up" ? "up" : "down"}>{kpis?.stq_trend_direction === "up" ? "▲" : "▼"} {kpis?.stq_trend ?? "—"}</span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${kpis?.stq_confidence?.toLowerCase() ?? "probable"}`}>{kpis?.stq_confidence ?? "—"}</span>
                </div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Scale Safety</div>
                <div className="m-value m-bad">{kpis?.scale_safety ?? "—"}</div>
                <div className="m-sub">
                  <span className="down">{kpis?.scale_safety_sub ?? "—"}</span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${kpis?.scale_safety_confidence?.toLowerCase() ?? "confirmed"}`}>{kpis?.scale_safety_confidence ?? "—"}</span>
                </div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
            </div>

            <div
              style={{
                background: "#fff5f5",
                border: "1px solid rgba(211,47,47,.2)",
                borderLeft: "4px solid var(--red)",
                borderRadius: "var(--radius)",
                padding: "12px 16px",
                marginBottom: 16,
                fontSize: 13,
                color: "var(--navy)",
              }}
            >
              {wasteAnalysis?.scale_safety_message ?? "⚠ Scale Safety: Loading..."}
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-title">Campaign Layer Summary</div>
                <div className="soft-list">
                  {(campaigns ?? []).map((c: any, i: number) => (
                    <div className="soft-row" key={i}>
                      <span className="row-label">{c.layer ?? "—"}</span>
                      <span className="row-value">{c.summary ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-title">CPQI Trend (7-Day)</div>
                <div className="chart-shell">
                  <div className="gridlines" />
                  <div className="line-wrap">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke="#d32f2f"
                        strokeWidth="2.5"
                        points="0,30 17,32 33,34 50,36 67,37 83,37 100,38"
                      />
                      <polyline
                        fill="none"
                        stroke="#102297"
                        strokeWidth="2.5"
                        points="0,55 17,52 33,50 50,48 67,46 83,44 100,42"
                      />
                    </svg>
                  </div>
                </div>
                <div className="legend-row">
                  <span>
                    <span
                      className="legend-dot"
                      style={{ background: "var(--red)" }}
                    />
                    <span className="legend-label">CPQI trend</span>
                  </span>
                  <span>
                    <span
                      className="legend-dot"
                      style={{ background: "var(--navy)" }}
                    />
                    <span className="legend-label">QI volume</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── OPPORTUNITY QUEUE TAB ── */}
        {activeTab === "queue" && (
          <div>
            <div className="section-label mb-16">PPC Opportunity Queue</div>

            {(wasteAnalysis?.opportunities ?? []).map((opp: any, i: number) => (
              <div className={`opp-card${opp.pinned ? " pinned" : ""}`} key={i}>
                <div className="opp-header">
                  <div className="opp-signal">
                    [Score {opp.score ?? "—"}] {opp.signal ?? "—"}
                  </div>
                  <div className="opp-badges">
                    {opp.badge && <span className={`badge-${opp.badge_class ?? "ppc"}`}>{opp.badge}</span>}
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

        {/* ── CAMPAIGN STRUCTURE TAB ── */}
        {activeTab === "structure" && (
          <div>
            <div className="section-label mb-16">
              Campaign Layer Architecture
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Layer</th>
                    <th>Focus</th>
                    <th>Spend</th>
                    <th>CPQI</th>
                    <th>IS</th>
                    <th>Recommendation</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(campaigns ?? []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="td-primary">{row.layer ?? "—"}</td>
                      <td>{row.focus ?? "—"}</td>
                      <td>{row.spend ?? "—"}</td>
                      <td className={row.cpqi_class ?? ""}>{row.cpqi ?? "—"}</td>
                      <td>{row.is ?? "—"}</td>
                      <td>{row.recommendation ?? "—"}</td>
                      <td><span className={`conf-${row.confidence?.toLowerCase() ?? "probable"}`}>{row.confidence ?? "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="section-label mb-16" style={{ marginTop: 20 }}>
              Model-Level Performance
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Category</th>
                    <th>Spend</th>
                    <th>CPQI</th>
                    <th>CVR</th>
                    <th>IS</th>
                    <th>Lost IS</th>
                    <th>Auction Overlap</th>
                    <th>Action</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(modelPerformance ?? []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="td-primary">{row.model ?? "—"}</td>
                      <td>{row.category ?? "—"}</td>
                      <td>{row.spend ?? "—"}</td>
                      <td className={row.cpqi_class ?? ""}>{row.cpqi ?? "—"}</td>
                      <td>{row.cvr ?? "—"}</td>
                      <td className={row.is_class ?? ""}>{row.is ?? "—"}</td>
                      <td>{row.lost_is ?? "—"}</td>
                      <td>{row.auction_overlap ?? "—"}</td>
                      <td>{row.action ?? "—"}</td>
                      <td><span className={`conf-${row.confidence?.toLowerCase() ?? "probable"}`}>{row.confidence ?? "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SEARCH TERMS TAB ── */}
        {activeTab === "searchterms" && (
          <div>
            <div className="section-label mb-16">
              Search Term Quality Analysis
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Term</th>
                    <th>Bucket</th>
                    <th>Spend</th>
                    <th>Conversions</th>
                    <th>Quality</th>
                    <th>Issue</th>
                    <th>Action</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(searchTerms ?? []).map((row: any, i: number) => (
                    <tr key={i} style={row.is_leakage ? { background: "#fff5f5" } : undefined}>
                      <td className="td-primary">{row.term ?? "—"}</td>
                      <td><span className={`badge-${row.bucket_class ?? "organic"}`}>{row.bucket ?? "—"}</span></td>
                      <td>{row.spend ?? "—"}</td>
                      <td>{row.conversions ?? "—"}</td>
                      <td className={row.quality_class ?? ""}>{row.quality ?? "—"}</td>
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

        {/* ── RETARGETING TAB ── */}
        {activeTab === "retargeting" && (
          <div>
            <div className="section-label mb-16">
              Retargeting Audience Architecture
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Audience</th>
                    <th>Size</th>
                    <th>Window</th>
                    <th>CVR</th>
                    <th>Role</th>
                    <th>Issue</th>
                    <th>Action</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(retargeting ?? []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="td-primary">{row.audience ?? "—"}</td>
                      <td>{row.size ?? "—"}</td>
                      <td>{row.window ?? "—"}</td>
                      <td className={row.cvr_class ?? ""}>{row.cvr ?? "—"}</td>
                      <td>{row.role ?? "—"}</td>
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

        {/* ── COMPETITIVE TAB ── */}
        {activeTab === "competitive" && (
          <div>
            <div className="section-label mb-16">
              Competitive Impression Share — vs Controller
            </div>
            <div className="table-wrap mb-16">
              <table>
                <thead>
                  <tr>
                    <th>Zone</th>
                    <th>GlobalAir IS</th>
                    <th>Controller IS</th>
                    <th>Overlap</th>
                    <th>Action</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(auctionInsights ?? []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="td-primary">{row.zone ?? "—"}</td>
                      <td className={row.globalair_is_class ?? ""}>{row.globalair_is ?? "—"}</td>
                      <td className={row.controller_is_class ?? ""}>{row.controller_is ?? "—"}</td>
                      <td>{row.overlap ?? "—"}</td>
                      <td>{row.action ?? "—"}</td>
                      <td><span className={`conf-${row.confidence?.toLowerCase() ?? "probable"}`}>{row.confidence ?? "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TRUST TAB ── */}
        {activeTab === "trust" && (
          <div className="grid-2">
            <div className="card">
              <div className="card-title">PPC Trust Status</div>
              <div className="trust-module">
                <div className="trust-module-title">Confirmed blockers</div>
                <ul>
                  <li>
                    Jet expansion blocked — conversion truth not clean enough
                  </li>
                  <li>
                    Offline close feedback incomplete — CRM and call loop not
                    closed
                  </li>
                  <li>
                    Call tracking coverage only 74% — partial attribution
                  </li>
                </ul>
              </div>
              <div className="trust-module">
                <div className="trust-module-title">Safe to scale</div>
                <ul>
                  <li>
                    Piston model exact-match (Cessna 172, SR22) — CONFIRMED
                  </li>
                  <li>Brand defense campaigns — always-on and stable</li>
                  <li>
                    7-day listing-viewer retargeting — strong CVR signal
                  </li>
                </ul>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Saved Views</div>
              <div className="saved-views-list">
                <div className="saved-view-btn">
                  <div className="sv-name">Weekly PPC Priorities</div>
                  <div className="sv-desc">
                    Top spend shifts, leak fixes, and model attack zones.
                  </div>
                </div>
                <div className="saved-view-btn">
                  <div className="sv-name">Piston Domination</div>
                  <div className="sv-desc">
                    Priority piston models, impression share pressure, and
                    scale pockets.
                  </div>
                </div>
                <div className="saved-view-btn">
                  <div className="sv-name">Board-Safe PPC View</div>
                  <div className="sv-desc">
                    Confirmed paid demand, efficiency, and scale-safe areas
                    only.
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
