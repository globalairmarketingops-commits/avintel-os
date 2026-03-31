import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Topbar from "../components/layout/Topbar";
import { useRole } from "../contexts/RoleContext";
import { api } from "../services/api";

type TabKey = "overview" | "conversions" | "queue" | "leakage" | "competitive" | "trust";

interface SavedView {
  n: string;
  d: string;
}

const savedViewsByRole: Record<string, SavedView[]> = {
  casey: [
    { n: "Weekly Operator View", d: "Pinned opportunities, blockers, and fast wins." },
    { n: "Piston Growth Focus", d: "Model domination, demand gaps, and geo efficiency." },
    { n: "Churn Save Queue", d: "Broker risk, renewal timing, and ROI proof gaps." },
  ],
  clay: [
    { n: "Executive Efficiency View", d: "CPQI, revenue, blockers, and scale safety." },
    { n: "Revenue Risk", d: "Retention risk, concentration risk, and top actions." },
    { n: "Operational Blockers", d: "Data health and execution dependencies." },
  ],
  jeffrey: [
    { n: "Board-Safe Confirmed View", d: "Confirmed only. Revenue, inquiries, and risk." },
    { n: "Revenue + Risk", d: "Plain-language confirmed business trajectory." },
    { n: "Confirmed Only", d: "No modeled opportunity logic shown." },
  ],
};

function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 56); // 8 weeks
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const { currentRole } = useRole();
  const [dateRange, setDateRange] = useState(getDefaultDateRange);

  const views = savedViewsByRole[currentRole] ?? savedViewsByRole.casey;

  // ─── API Queries ───
  const { data: kpis, isLoading: kpisLoading } = useQuery({ queryKey: ["dashboard-kpis"], queryFn: api.getDashboardKpis });
  const { data: opportunities, isLoading: oppsLoading } = useQuery({ queryKey: ["dashboard-opportunities"], queryFn: api.getOpportunities });
  const { data: actionFramework, isLoading: actionsLoading } = useQuery({ queryKey: ["dashboard-action-framework"], queryFn: api.getActionFramework });
  const { data: _qiTrend } = useQuery({ queryKey: ["dashboard-qi-trend"], queryFn: api.getQiTrend });
  const { data: convSummary, isLoading: convSummaryLoading } = useQuery({ queryKey: ["conversions-summary"], queryFn: api.getConversionsSummary });
  const { data: convByChannel } = useQuery({ queryKey: ["conversions-by-channel"], queryFn: api.getConversionsByChannel });
  const { data: convByCategory } = useQuery({ queryKey: ["conversions-by-category"], queryFn: api.getConversionsByCategory });
  const { data: _convTrend } = useQuery({ queryKey: ["conversions-trend"], queryFn: api.getConversionsTrend });
  const { data: leakageMap, isLoading: leakageLoading } = useQuery({ queryKey: ["dashboard-leakage-map"], queryFn: api.getLeakageMap });
  const { data: competitiveZones, isLoading: compLoading } = useQuery({ queryKey: ["dashboard-competitive-zones"], queryFn: api.getCompetitiveZones });
  const { data: dataTrust, isLoading: trustLoading } = useQuery({ queryKey: ["dashboard-data-trust"], queryFn: api.getDataTrust });

  const isOverviewLoading = kpisLoading || oppsLoading || actionsLoading;

  return (
    <>
      <Topbar pageTitle="Intelligence Dashboard" />

      <div className="page-hero">
        <div className="hero-eyebrow">GlobalAir.com / Av/IntelOS</div>
        <h1 className="hero-title">Intelligence Dashboard</h1>
        <p className="hero-sub">Cross-domain signal aggregation, ranked opportunity queue, leakage map, competitive zones, and data trust status — all in one operator-safe view.</p>
      </div>

      <div className="tab-bar">
        <div className="tab-bar-inner">
          <button className={`tab-btn${activeTab === "overview" ? " active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
          <button className={`tab-btn${activeTab === "conversions" ? " active" : ""}`} onClick={() => setActiveTab("conversions")}>All Conversions</button>
          <button className={`tab-btn${activeTab === "queue" ? " active" : ""}`} onClick={() => setActiveTab("queue")}>Opportunity Queue</button>
          <button className={`tab-btn${activeTab === "leakage" ? " active" : ""}`} onClick={() => setActiveTab("leakage")}>Leakage Map</button>
          <button className={`tab-btn${activeTab === "competitive" ? " active" : ""}`} onClick={() => setActiveTab("competitive")}>Competitive Zones</button>
          <button className={`tab-btn${activeTab === "trust" ? " active" : ""}`} onClick={() => setActiveTab("trust")}>Data Trust</button>
        </div>
      </div>

      <div className="page-body">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div id="tab-overview" className="tab-content active">
            <div className="section-label mb-16">Key Performance Indicators</div>
            {isOverviewLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
            <div className="metric-grid-5 mb-20">
              <div className="metric-card">
                <div className="m-label">Qualified Inquiries</div>
                <div className="m-value">{kpis?.qi?.value ?? "—"}</div>
                <div className="m-sub"><span className={kpis?.qi?.trend === "down" ? "down" : "up"}>&#9650; {kpis?.qi?.delta != null ? `${kpis.qi.delta >= 0 ? "+" : ""}${kpis.qi.delta} WoW` : "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(kpis?.qi?.confidence ?? "possible").toLowerCase()}`}>{kpis?.qi?.confidence ?? "POSSIBLE"}</span></div>
                <div className="m-sub" style={{ marginTop: "5px" }}>{kpis?.qi?.note ?? "Seed estimate — CRM + call tracking not connected"}</div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">CPQI</div>
                <div className="m-value">{kpis?.cpqi?.value != null ? `$${kpis.cpqi.value}` : "—"}</div>
                <div className="m-sub"><span className={kpis?.cpqi?.trend === "down" ? "down" : "up"}>&#9650; {kpis?.cpqi?.delta != null ? `${kpis.cpqi.delta >= 0 ? "+" : ""}$${Math.abs(kpis.cpqi.delta)} WoW` : "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(kpis?.cpqi?.confidence ?? "probable").toLowerCase()}`}>{kpis?.cpqi?.confidence ?? "PROBABLE"}</span></div>
                <div className="m-sub" style={{ marginTop: "5px" }}>{kpis?.cpqi?.note ?? "Google Ads — conversion signal unconfirmed"}</div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Advertiser Revenue</div>
                <div className="m-value">{kpis?.revenue?.value != null ? kpis.revenue.value : "—"}</div>
                <div className="m-sub"><span className={kpis?.revenue?.trend === "down" ? "down" : "up"}>&#9650; {kpis?.revenue?.delta ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(kpis?.revenue?.confidence ?? "possible").toLowerCase()}`}>{kpis?.revenue?.confidence ?? "POSSIBLE"}</span></div>
                <div className="m-sub" style={{ marginTop: "5px" }}>{kpis?.revenue?.note ?? "MVS estimate — billing not connected"}</div>
                <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Broker Risk Index</div>
                <div className="m-value m-bad">{kpis?.broker_risk_index?.value ?? "—"}</div>
                <div className="m-sub"><span className="down">&#9660; {kpis?.broker_risk_index?.delta ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(kpis?.broker_risk_index?.confidence ?? "probable").toLowerCase()}`}>{kpis?.broker_risk_index?.confidence ?? "PROBABLE"}</span></div>
                <div className="m-sub" style={{ marginTop: "5px" }}>{kpis?.broker_risk_index?.note ?? "Seed estimate — CRM not connected"}</div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Authority vs Controller</div>
                <div className="m-value m-warn">{kpis?.authority_score?.value ?? "—"}</div>
                <div className="m-sub"><span className={kpis?.authority_score?.trend === "down" ? "down" : "up"}>&#9650; {kpis?.authority_score?.delta ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(kpis?.authority_score?.confidence ?? "possible").toLowerCase()}`}>{kpis?.authority_score?.confidence ?? "POSSIBLE"}</span></div>
                <div className="m-sub" style={{ marginTop: "5px" }}>{kpis?.authority_score?.note ?? "Composite model"}</div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
            </div>

            <div className="section-label mb-16">Top Opportunity Signals — Cross Domain</div>
            <div className="mb-20">
              {(opportunities ?? []).slice(0, 5).map((opp: any, i: number) => (
                <div className={`opp-card${opp.pinned ? " pinned" : ""}`} key={opp.id ?? i}>
                  <div className="opp-header">
                    <div className="opp-signal">{opp.signal ?? opp.title ?? "—"}</div>
                    <div className="opp-badges">
                      {opp.badge && <span className={`badge-${opp.badge_class ?? "data"}`}>{opp.badge}</span>}
                      {opp.confidence && <span className={`conf-${opp.confidence.toLowerCase()}`}>{opp.confidence}</span>}
                    </div>
                  </div>
                  <div className="opp-gap">{opp.gap ?? opp.description ?? ""}</div>
                </div>
              ))}
              {(!opportunities || opportunities.length === 0) && !oppsLoading && (
                <div style={{ padding: "12px", color: "var(--text-muted)", fontSize: "13px" }}>No opportunity signals available.</div>
              )}
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-title">Action Framework</div>
                <div className="action-block">
                  <div className="action-block-title">Fast wins</div>
                  <ul>
                    {(actionFramework?.fast_wins ?? []).map((item: any, i: number) => (
                      <li key={i}>{typeof item === "string" ? item : item?.Title ?? item?.title ?? "—"}</li>
                    ))}
                    {!actionFramework?.fast_wins && <>
                      <li>Rewrite high-impression / low-CTR titles</li>
                      <li>Tighten PPC dayparting</li>
                      <li>Remediate hidden-price listings</li>
                    </>}
                  </ul>
                </div>
                <div className="action-block">
                  <div className="action-block-title">Strategic moves</div>
                  <ul>
                    {(actionFramework?.strategic_moves ?? []).map((item: any, i: number) => (
                      <li key={i}>{typeof item === "string" ? item : item?.Title ?? item?.title ?? "—"}</li>
                    ))}
                    {!actionFramework?.strategic_moves && <>
                      <li>Recruit inventory into supply-constrained models</li>
                      <li>Protect at-risk broker renewals</li>
                      <li>Concentrate spend in high-converting geos</li>
                    </>}
                  </ul>
                </div>
                <div className="action-block">
                  <div className="action-block-title">Blockers to resolve</div>
                  <ul>
                    {(actionFramework?.blockers ?? []).map((item: any, i: number) => (
                      <li key={i}>{typeof item === "string" ? item : item?.Title ?? item?.title ?? item?.Blocker ?? "—"}</li>
                    ))}
                    {!actionFramework?.blockers && <>
                      <li>Validate paid conversion actions</li>
                      <li>Increase call-tracking coverage to 90%+</li>
                      <li>Separate confirmed vs modeled authority signals</li>
                    </>}
                  </ul>
                </div>
              </div>
              <div className="card">
                <div className="card-title">QI Trend</div>
                <div className="chart-shell">
                  <div className="gridlines"></div>
                  <div className="line-wrap">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline fill="rgba(16,34,151,.1)" stroke="#102297" strokeWidth="3" points="0,72 14,68 28,62 42,58 56,52 70,49 84,43 100,38" />
                      <polyline fill="none" stroke="#97CB00" strokeWidth="2.5" points="0,82 14,79 28,74 42,68 56,63 70,57 84,53 100,47" />
                    </svg>
                  </div>
                </div>
                <div className="legend-row">
                  <span><span className="legend-dot" style={{ background: "var(--navy)" }}></span><span className="legend-label">Direct QI (WoW)</span></span>
                  <span><span className="legend-dot" style={{ background: "var(--green)" }}></span><span className="legend-label">Assisted QI</span></span>
                </div>
                <div style={{ marginTop: "14px" }}>
                  <div className="card-title" style={{ marginBottom: "8px" }}>Saved Views</div>
                  <div className="saved-views-list" id="saved-views-list">
                    {views.map((v) => (
                      <div className="saved-view-btn" key={v.n}>
                        <div className="sv-name">{v.n}</div>
                        <div className="sv-desc">{v.d}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ALL CONVERSIONS */}
        {activeTab === "conversions" && (
          <div id="tab-conversions" className="tab-content active">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div className="section-label" style={{ margin: 0 }}>All Conversions — GA4 + Google Ads Combined</div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", color: "var(--navy)" }}>
                <label>From</label>
                <input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
                  style={{ padding: "4px 8px", border: "1px solid var(--border-soft)", borderRadius: "var(--radius-sm)", fontSize: "12px", fontFamily: "var(--font-mono)" }} />
                <label>To</label>
                <input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
                  style={{ padding: "4px 8px", border: "1px solid var(--border-soft)", borderRadius: "var(--radius-sm)", fontSize: "12px", fontFamily: "var(--font-mono)" }} />
                <button onClick={() => setDateRange(getDefaultDateRange())}
                  style={{ padding: "4px 10px", background: "var(--bg-soft)", border: "1px solid var(--border-soft)", borderRadius: "var(--radius-sm)", fontSize: "12px", cursor: "pointer" }}>
                  Reset
                </button>
              </div>
            </div>
            {convSummaryLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
            <div className="metric-grid-5 mb-20">
              <div className="metric-card">
                <div className="m-label">Total All Conversions</div>
                <div className="m-value">{convSummary?.total?.value ?? "—"}</div>
                <div className="m-sub"><span className="up">&#9650; {convSummary?.total?.delta ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(convSummary?.total?.confidence ?? "probable").toLowerCase()}`}>{convSummary?.total?.confidence ?? "PROBABLE"}</span></div>
                <div className="m-sub" style={{ marginTop: "5px" }}>{convSummary?.total?.note ?? "GA4 + Google Ads"}</div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">GA4 All Conversions</div>
                <div className="m-value">{convSummary?.ga4?.value ?? "—"}</div>
                <div className="m-sub"><span className="up">&#9650; {convSummary?.ga4?.delta ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(convSummary?.ga4?.confidence ?? "probable").toLowerCase()}`}>{convSummary?.ga4?.confidence ?? "PROBABLE"}</span></div>
                <div className="m-sub" style={{ marginTop: "5px" }}>{convSummary?.ga4?.note ?? "All channels combined"}</div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Google Ads All Conversions</div>
                <div className="m-value">{convSummary?.google_ads?.value ?? "—"}</div>
                <div className="m-sub"><span className="up">&#9650; {convSummary?.google_ads?.delta ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(convSummary?.google_ads?.confidence ?? "probable").toLowerCase()}`}>{convSummary?.google_ads?.confidence ?? "PROBABLE"}</span></div>
                <div className="m-sub" style={{ marginTop: "5px" }}>{convSummary?.google_ads?.note ?? "Piston campaigns only — jets on hold"}</div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Overall CVR</div>
                <div className="m-value">{convSummary?.cvr?.value ?? "—"}</div>
                <div className="m-sub"><span className="up">&#9650; {convSummary?.cvr?.delta ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(convSummary?.cvr?.confidence ?? "probable").toLowerCase()}`}>{convSummary?.cvr?.confidence ?? "PROBABLE"}</span></div>
                <div className="m-sub" style={{ marginTop: "5px" }}>{convSummary?.cvr?.note ?? "Conversion signal unconfirmed"}</div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Conversion Signal</div>
                <div className="m-value m-warn">{convSummary?.signal_status?.value ?? "Unconfirmed"}</div>
                <div className="m-sub"><span className="flat">{convSummary?.signal_status?.delta ?? "Blocking jet expansion"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(convSummary?.signal_status?.confidence ?? "confirmed").toLowerCase()}`}>{convSummary?.signal_status?.confidence ?? "CONFIRMED"}</span></div>
                <div className="m-sub" style={{ marginTop: "5px" }}>{convSummary?.signal_status?.note ?? "Validate before scaling"}</div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
            </div>

            <div
              style={{
                background: "#fffbeb",
                border: "1px solid rgba(245,158,11,.2)",
                borderLeft: "4px solid var(--amber)",
                borderRadius: "var(--radius)",
                padding: "12px 16px",
                marginBottom: "16px",
                fontSize: "13px",
                color: "var(--navy)",
              }}
            >
              &#9888; Conversion actions are unconfirmed. These numbers represent all tracked conversions across GA4 and Google Ads. Key events and conversion definitions need rebuild before scaling decisions.
            </div>

            <div className="section-label mb-16">Breakdown by Channel / Source</div>
            <div className="table-wrap mb-20">
              <table>
                <thead>
                  <tr><th>Source</th><th>Channel / Campaign</th><th>Conversions</th><th>Sessions / Clicks</th><th>CVR</th><th>Confidence</th></tr>
                </thead>
                <tbody>
                  {(convByChannel ?? []).map((ch: any, i: number) => (
                    <tr key={ch.id ?? i} style={ch.contaminated ? { background: "#fff5f5" } : ch.on_hold ? { opacity: 0.5 } : undefined}>
                      <td><span className={`badge-${ch.source_badge ?? "ga4"}`}>{ch.source ?? "GA4"}</span></td>
                      <td className="td-primary">{ch.channel ?? "—"}{ch.contaminated ? " \u26A0" : ""}</td>
                      <td>{ch.conversions ?? 0}</td>
                      <td>{ch.sessions ?? ch.clicks ?? 0}</td>
                      <td>{ch.cvr ?? "—"}</td>
                      <td><span className={`conf-${(ch.confidence ?? "probable").toLowerCase()}`}>{ch.confidence ?? "PROBABLE"}</span></td>
                    </tr>
                  ))}
                  {(!convByChannel || convByChannel.length === 0) && (
                    <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>No channel data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="section-label mb-16">Breakdown by Category</div>
            <div className="table-wrap mb-20">
              <table>
                <thead>
                  <tr><th>Category</th><th>GA4 Conversions</th><th>Google Ads Conversions</th><th>Total</th><th>Sessions</th><th>CVR</th><th>Confidence</th></tr>
                </thead>
                <tbody>
                  {(convByCategory ?? []).map((cat: any, i: number) => (
                    <tr key={cat.id ?? i}>
                      <td className="td-primary">{cat.category ?? "—"}</td>
                      <td>{cat.ga4_conversions ?? 0}</td>
                      <td>{cat.google_ads_conversions ?? 0}</td>
                      <td><strong>{cat.total ?? 0}</strong></td>
                      <td>{cat.sessions ?? 0}</td>
                      <td>{cat.cvr ?? "—"}</td>
                      <td><span className={`conf-${(cat.confidence ?? "probable").toLowerCase()}`}>{cat.confidence ?? "PROBABLE"}</span></td>
                    </tr>
                  ))}
                  {(!convByCategory || convByCategory.length === 0) && (
                    <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)" }}>No category data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="section-label mb-16">Conversion Trend — 8 Weeks</div>
            <div className="card">
              <div className="chart-shell" style={{ height: "200px" }}>
                <div className="gridlines"></div>
                <div className="line-wrap">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline fill="rgba(16,34,151,.1)" stroke="#102297" strokeWidth="3"
                      points="0,82 14,78 28,74 42,68 56,63 70,58 84,52 100,44" />
                    <polyline fill="none" stroke="#97CB00" strokeWidth="2.5"
                      points="0,88 14,84 28,82 42,78 56,74 70,70 84,66 100,60" />
                  </svg>
                </div>
              </div>
              <div className="legend-row">
                <span><span className="legend-dot" style={{ background: "var(--navy)" }}></span><span className="legend-label">GA4 All Conversions (WoW)</span></span>
                <span><span className="legend-dot" style={{ background: "var(--green)" }}></span><span className="legend-label">Google Ads All Conversions</span></span>
              </div>
              <div className="note-text" style={{ marginTop: "10px" }}>
                Positive trend across both sources. Piston-only on Google Ads — jet conversions will appear once campaign is unpaused and conversion signal validated.
              </div>
            </div>
          </div>
        )}

        {/* OPPORTUNITY QUEUE */}
        {activeTab === "queue" && (
          <div id="tab-queue" className="tab-content active">
            <div className="section-label mb-16">Ranked Opportunity Queue</div>
            {oppsLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}

            {(opportunities ?? []).map((opp: any, i: number) => (
              <div
                key={opp.id ?? i}
                className={`opp-card${opp.pinned ? " pinned" : ""}${opp.do_not_act ? " do-not-act" : ""}`}
                style={opp.priority === "next" ? { borderLeftColor: "var(--amber)" } : undefined}
              >
                <div className="opp-header">
                  <div className="opp-signal">{opp.do_not_act ? "\u26A0 Do Not Act Yet \u2014 " : ""}{opp.signal ?? opp.title ?? "—"}</div>
                  <div className="opp-badges">
                    {opp.badge && <span className={`badge-${opp.badge_class ?? "data"}`}>{opp.badge}</span>}
                    {opp.confidence && <span className={`conf-${opp.confidence.toLowerCase()}`}>{opp.confidence}</span>}
                    {opp.priority && <span className={`pri-${opp.priority.toLowerCase()}`}>{opp.priority}</span>}
                  </div>
                </div>
                <div className="opp-gap">{opp.gap ?? opp.description ?? ""}</div>
                {(opp.owner || opp.time_to_impact || opp.blocker || opp.dependency) && (
                  <div className="opp-meta">
                    {opp.owner && <div className="opp-meta-item"><div className="opp-meta-label">Owner</div><div className="opp-meta-value">{opp.owner}</div></div>}
                    {opp.time_to_impact && <div className="opp-meta-item"><div className="opp-meta-label">Time to Impact</div><div className="opp-meta-value">{opp.time_to_impact}</div></div>}
                    {opp.blocker && <div className="opp-meta-item"><div className="opp-meta-label">Blocker</div><div className="opp-meta-value">{opp.blocker}</div></div>}
                    {opp.dependency && <div className="opp-meta-item"><div className="opp-meta-label">Dependency</div><div className="opp-meta-value">{opp.dependency}</div></div>}
                  </div>
                )}
                {opp.lift && (
                  <div style={{ marginTop: "10px", background: "var(--bg-soft)", border: "1px solid var(--border-soft)", borderRadius: "var(--radius-sm)", padding: "10px" }}>
                    <div className="lift-row"><span className="lift-label">Conservative</span><span className="lift-value">{opp.lift.conservative ?? "—"}</span></div>
                    <div className="lift-row"><span className="lift-label">Expected</span><span className="lift-value expected">{opp.lift.expected ?? "—"}</span></div>
                    <div className="lift-row"><span className="lift-label">Aggressive</span><span className="lift-value">{opp.lift.aggressive ?? "—"}</span></div>
                  </div>
                )}
              </div>
            ))}
            {(!opportunities || opportunities.length === 0) && !oppsLoading && (
              <div style={{ padding: "12px", color: "var(--text-muted)", fontSize: "13px" }}>No opportunities available.</div>
            )}
          </div>
        )}

        {/* LEAKAGE MAP */}
        {activeTab === "leakage" && (
          <div id="tab-leakage" className="tab-content active">
            <div className="section-label mb-16">Leakage Map — Revenue leaving the system</div>
            {leakageLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Area</th><th>Issue</th><th>Why</th><th>Impact</th><th>Action</th><th>Confidence</th></tr>
                </thead>
                <tbody>
                  {(leakageMap ?? []).map((leak: any, i: number) => (
                    <tr key={leak.id ?? i}>
                      <td><span className={`badge-${leak.area_badge ?? "data"}`}>{leak.area ?? "—"}</span></td>
                      <td className="td-primary">{leak.issue ?? "—"}</td>
                      <td>{leak.why ?? "—"}</td>
                      <td>{leak.impact ?? "—"}</td>
                      <td>{leak.action ?? "—"}</td>
                      <td><span className={`conf-${(leak.confidence ?? "probable").toLowerCase()}`}>{leak.confidence ?? "PROBABLE"}</span></td>
                    </tr>
                  ))}
                  {(!leakageMap || leakageMap.length === 0) && !leakageLoading && (
                    <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>No leakage data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COMPETITIVE */}
        {activeTab === "competitive" && (
          <div id="tab-competitive" className="tab-content active">
            <div className="section-label mb-16">Competitive Zone Strategy vs Controller.com</div>
            {compLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
            <div className="grid-2 mb-20">
              <div>
                {(competitiveZones?.zones ?? [
                  { type: "attack", icon: "\uD83D\uDD34", title: "Model Terms \u2014 Attack", note: "Primary offensive zone for piston growth and share capture. Push 70\u201385% IS dominance on top piston models." },
                  { type: "compete", icon: "\uD83D\uDFE1", title: "Manufacturer Terms \u2014 Compete", note: "Improve CTR and landing-page alignment for make-level demand. Pursue parity through tight structure." },
                  { type: "build", icon: "\uD83D\uDFE2", title: "Authority \u2014 Build", note: "Win with ownership guides, comparisons, and broker visibility content. Intercept research-stage traffic." },
                  { type: "monitor", icon: "\u2B1C", title: "Head Terms \u2014 Monitor", note: "Maintain presence, avoid reckless spend on broad territory. Controller leads by volume." },
                ]).map((z: any, i: number) => (
                  <div className={`comp-zone ${z.type}`} key={i}>
                    <div className="comp-zone-title">{z.icon} {z.title}</div>
                    <div className="comp-zone-note">{z.note}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-title">Competitive Signals</div>
                <div className="soft-list">
                  {(competitiveZones?.signals ?? []).map((sig: any, i: number) => (
                    <div className="soft-row" key={i}>
                      <span className="row-label">{sig.label ?? "—"}</span>
                      <span className={`row-value${sig.trend === "up" ? " up" : sig.trend === "down" ? " down" : ""}`}>{sig.value ?? "—"}</span>
                    </div>
                  ))}
                  {(!competitiveZones?.signals || competitiveZones.signals.length === 0) && (
                    <div style={{ padding: "8px", color: "var(--text-muted)", fontSize: "13px" }}>No signals available.</div>
                  )}
                </div>
                <div className="note-text">{competitiveZones?.strategy_note ?? "Strategy: win on depth and specificity, not broad coverage. Every model-level win compounds faster than one generic term."}</div>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Zone</th><th>GlobalAir Position</th><th>Controller Position</th><th>Overlap</th><th>Response</th></tr></thead>
                <tbody>
                  {(competitiveZones?.zone_table ?? []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="td-primary">{row.zone ?? "—"}</td>
                      <td>{row.globalair_position ?? "—"}</td>
                      <td>{row.controller_position ?? "—"}</td>
                      <td>{row.overlap ?? "—"}</td>
                      <td>{row.response ?? "—"}</td>
                    </tr>
                  ))}
                  {(!competitiveZones?.zone_table || competitiveZones.zone_table.length === 0) && (
                    <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>No zone data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TRUST */}
        {activeTab === "trust" && (
          <div id="tab-trust" className="tab-content active">
            {trustLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
            <div className="grid-2">
              <div className="card">
                <div className="card-title">&#128274; Data Trust Status</div>
                <div className="trust-module">
                  <div className="trust-module-title">Confirmed blockers</div>
                  <ul>
                    {(dataTrust?.blockers ?? ["PPC conversion actions unconfirmed for jet expansion", "Call tracking coverage incomplete at 74%", "GA4 contamination remains active since June 2023"]).map((b: string, i: number) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
                <div className="trust-module">
                  <div className="trust-module-title">Watchlist</div>
                  <ul>
                    {(dataTrust?.watchlist ?? ["Content assist claims still modeled only", "Location-level paid data partially validated", "Authority composite not board-safe for Jeffrey reporting"]).map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ marginTop: "10px", background: "var(--navy-tint-soft)", border: "1px solid var(--navy-tint)", borderRadius: "var(--radius-sm)", padding: "10px", fontSize: "12px", color: "var(--navy)" }}>
                  {dataTrust?.jeffrey_note ?? "Jeffrey view: confirmed-only rendering with source and freshness metadata preserved. Modeled/POSSIBLE signals suppressed."}
                </div>
              </div>
              <div className="card">
                <div className="card-title">Domain Signal Mix</div>
                <div className="soft-list">
                  {(dataTrust?.signal_mix ?? [
                    { label: "Qualified Inquiries", confidence: "POSSIBLE" },
                    { label: "Advertiser Revenue", confidence: "POSSIBLE" },
                    { label: "Organic Share", confidence: "PROBABLE" },
                    { label: "Paid Signals", confidence: "PROBABLE" },
                    { label: "Broker Risk Index", confidence: "PROBABLE" },
                    { label: "Authority vs Controller", confidence: "POSSIBLE" },
                    { label: "Content Assist", confidence: "POSSIBLE" },
                  ]).map((sig: any, i: number) => (
                    <div className="soft-row" key={i}>
                      <span className="row-label">{sig.label}</span>
                      <span><span className={`conf-${sig.confidence.toLowerCase()}`}>{sig.confidence}</span></span>
                    </div>
                  ))}
                </div>
                <div className="note-text">{dataTrust?.decision_rules ?? "Decision rules: act on CONFIRMED signals first. Treat PROBABLE as directional for optimization. POSSIBLE signals require attribution cleanup before scaling."}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
