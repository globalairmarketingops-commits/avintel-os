import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Topbar from "../components/layout/Topbar";
import { api } from "../services/api";

type TabKey = "overview" | "conversions" | "opportunities" | "channels" | "landing" | "events" | "trust";

function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 56);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

export default function GA4Page() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [dateRange, setDateRange] = useState(getDefaultDateRange);

  // ─── API Queries ───
  const { data: qualityMetrics, isLoading: metricsLoading } = useQuery({ queryKey: ["ga4-quality-metrics"], queryFn: api.getGa4QualityMetrics });
  const { data: channels, isLoading: channelsLoading } = useQuery({ queryKey: ["ga4-channels"], queryFn: api.getGa4Channels });
  const { data: landingPages, isLoading: landingLoading } = useQuery({ queryKey: ["ga4-landing-pages"], queryFn: api.getGa4LandingPages });
  const { data: events, isLoading: eventsLoading } = useQuery({ queryKey: ["ga4-events"], queryFn: api.getGa4Events });
  const { data: measurementTrust, isLoading: trustLoading } = useQuery({ queryKey: ["ga4-measurement-trust"], queryFn: api.getGa4MeasurementTrust });
  const { data: propertyHealth } = useQuery({ queryKey: ["ga4-property-health"], queryFn: api.getGa4PropertyHealth });
  const { data: convSummary, isLoading: convSummaryLoading } = useQuery({ queryKey: ["conversions-summary"], queryFn: api.getConversionsSummary });
  const { data: convByChannel } = useQuery({ queryKey: ["conversions-by-channel"], queryFn: api.getConversionsByChannel });
  const { data: convByCategory } = useQuery({ queryKey: ["conversions-by-category"], queryFn: api.getConversionsByCategory });
  const { data: _convTrend } = useQuery({ queryKey: ["conversions-trend"], queryFn: api.getConversionsTrend });
  const { data: opportunities, isLoading: oppsLoading } = useQuery({ queryKey: ["dashboard-opportunities"], queryFn: api.getOpportunities });

  return (
    <>
      <Topbar pageTitle="GA4 Analytics Hub" />

      <div className="page-hero">
        <div className="hero-eyebrow">GlobalAir.com / Av/IntelOS</div>
        <h1 className="hero-title">GA4 Analytics Hub</h1>
        <p className="hero-sub">
          Measurement integrity, clean session analysis, channel attribution,
          landing page performance, event tier governance, and contamination
          controls.
        </p>
      </div>

      <div className="tab-bar">
        <div className="tab-bar-inner">
          {(
            [
              ["overview", "Overview"],
              ["conversions", "All Conversions"],
              ["opportunities", "Opportunities"],
              ["channels", "Channels"],
              ["landing", "Landing Pages"],
              ["events", "Events"],
              ["trust", "Trust"],
            ] as [TabKey, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              className={`tab-btn${activeTab === key ? " active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="page-body">
        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div>
            <div className="section-label mb-16">GA4 Measurement KPIs</div>
            {metricsLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
            <div className="grid-5 mb-20">
              <div className="metric-card">
                <div className="m-label">Real Engagement Rate</div>
                <div className="m-value m-warn">{qualityMetrics?.real_engagement_rate?.value ?? "—"}</div>
                <div className="m-sub">
                  <span className="up">{"\u25B2"} {qualityMetrics?.real_engagement_rate?.delta ?? "—"}</span>
                </div>
                <div style={{ marginTop: "6px" }}>
                  <span className={`conf-${(qualityMetrics?.real_engagement_rate?.confidence ?? "probable").toLowerCase()}`}>{qualityMetrics?.real_engagement_rate?.confidence ?? "PROBABLE"}</span>
                </div>
                <div className="m-sub" style={{ marginTop: "5px" }}>
                  {qualityMetrics?.real_engagement_rate?.note ?? "Clean session logic"}
                </div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Reported Engagement</div>
                <div className="m-value m-bad">{qualityMetrics?.reported_engagement_rate?.value ?? "—"}</div>
                <div className="m-sub">
                  <span className="flat">{qualityMetrics?.reported_engagement_rate?.delta ?? "Contaminated \u2014 do not use"}</span>
                </div>
                <div style={{ marginTop: "6px" }}>
                  <span className={`conf-${(qualityMetrics?.reported_engagement_rate?.confidence ?? "probable").toLowerCase()}`}>{qualityMetrics?.reported_engagement_rate?.confidence ?? "PROBABLE"}</span>
                </div>
                <div className="m-sub" style={{ marginTop: "5px" }}>
                  {qualityMetrics?.reported_engagement_rate?.note ?? "Native GA4 \u2014 unsafe"}
                </div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Clean Sessions</div>
                <div className="m-value">{qualityMetrics?.clean_sessions?.value ?? "—"}</div>
                <div className="m-sub">
                  <span className="up">{"\u25B2"} {qualityMetrics?.clean_sessions?.delta ?? "—"}</span>
                </div>
                <div style={{ marginTop: "6px" }}>
                  <span className={`conf-${(qualityMetrics?.clean_sessions?.confidence ?? "probable").toLowerCase()}`}>{qualityMetrics?.clean_sessions?.confidence ?? "PROBABLE"}</span>
                </div>
                <div className="m-sub" style={{ marginTop: "5px" }}>
                  {qualityMetrics?.clean_sessions?.note ?? "GA4 filtered traffic"}
                </div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Validation Coverage</div>
                <div className="m-value m-warn">{qualityMetrics?.validation_coverage?.value ?? "—"}</div>
                <div className="m-sub">
                  <span className="up">{"\u25B2"} {qualityMetrics?.validation_coverage?.delta ?? "—"}</span>
                </div>
                <div style={{ marginTop: "6px" }}>
                  <span className={`conf-${(qualityMetrics?.validation_coverage?.confidence ?? "confirmed").toLowerCase()}`}>{qualityMetrics?.validation_coverage?.confidence ?? "CONFIRMED"}</span>
                </div>
                <div className="m-sub" style={{ marginTop: "5px" }}>
                  {qualityMetrics?.validation_coverage?.note ?? "Event QA registry"}
                </div>
                <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Attribution Integrity</div>
                <div className="m-value m-bad">{qualityMetrics?.attribution_integrity?.value ?? "Diagnose"}</div>
                <div className="m-sub">
                  <span className="down">{qualityMetrics?.attribution_integrity?.delta ?? "2 blockers active"}</span>
                </div>
                <div style={{ marginTop: "6px" }}>
                  <span className={`conf-${(qualityMetrics?.attribution_integrity?.confidence ?? "confirmed").toLowerCase()}`}>{qualityMetrics?.attribution_integrity?.confidence ?? "CONFIRMED"}</span>
                </div>
                <div className="m-sub" style={{ marginTop: "5px" }}>
                  {qualityMetrics?.attribution_integrity?.note ?? "GA4 + call tracking audit"}
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
                marginBottom: "16px",
                fontSize: "13px",
                color: "var(--navy)",
              }}
            >
              {"\u26A0"} {propertyHealth?.contamination_warning ?? `GA4 Contamination Active Since June 2023 \u2014 Email_Open_ events inflate reported engagement to ${qualityMetrics?.reported_engagement_rate?.value ?? "17.3%"}. Real engagement estimate: ${qualityMetrics?.real_engagement_rate?.value ?? "68.9%"}. Do not use native engagement for decisioning.`}
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-title">
                  Channel Performance {"\u2014"} Clean Sessions
                </div>
                <div className="soft-list">
                  {(channels ?? []).slice(0, 6).map((ch: any, i: number) => (
                    <div className="soft-row" key={ch.id ?? i}>
                      <span className="row-label">
                        {ch.channel ?? "—"}{ch.contaminated ? ` \u26A0` : ""}
                      </span>
                      <span className={`row-value${ch.contaminated ? " m-bad" : ch.warning ? " m-warn" : ""}`}>
                        {ch.sessions != null ? `${ch.sessions.toLocaleString()} sessions` : ""}{ch.conversions != null ? ` \u00B7 ${ch.conversions} conversions` : ""}{ch.note ? ` \u00B7 ${ch.note}` : ""}
                        {ch.confidence && !ch.contaminated && !ch.warning ? <>{" \u00B7 "}<span className={`conf-${ch.confidence.toLowerCase()}`}>{ch.confidence}</span></> : ""}
                      </span>
                    </div>
                  ))}
                  {(!channels || channels.length === 0) && (
                    <div style={{ padding: "8px", color: "var(--text-muted)", fontSize: "13px" }}>No channel data available.</div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-title">Top Landing Page Issues</div>
                <div className="soft-list">
                  {(landingPages ?? []).slice(0, 4).map((lp: any, i: number) => (
                    <div className="soft-row" key={lp.id ?? i}>
                      <span
                        className="row-label"
                        style={{ fontFamily: "monospace", fontSize: "11px" }}
                      >
                        {lp.page ?? lp.path ?? "—"}
                      </span>
                      <span className={`row-value${lp.cvr_class ? ` ${lp.cvr_class}` : ""}`}>
                        {lp.cvr ?? "—"} CVR{lp.note ? ` \u00B7 ${lp.note}` : ""}
                      </span>
                    </div>
                  ))}
                  {(!landingPages || landingPages.length === 0) && (
                    <div style={{ padding: "8px", color: "var(--text-muted)", fontSize: "13px" }}>No landing page data available.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ALL CONVERSIONS TAB ── */}
        {activeTab === "conversions" && (
          <div>
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
            <div className="grid-5 mb-20">
              <div className="metric-card">
                <div className="m-label">Total All Conversions</div>
                <div className="m-value">{convSummary?.total?.value ?? "—"}</div>
                <div className="m-sub"><span className="up">{"\u25B2"} {convSummary?.total?.delta ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(convSummary?.total?.confidence ?? "probable").toLowerCase()}`}>{convSummary?.total?.confidence ?? "PROBABLE"}</span></div>
                <div className="m-sub" style={{ marginTop: "5px" }}>{convSummary?.total?.note ?? "GA4 + Google Ads"}</div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">GA4 All Conversions</div>
                <div className="m-value">{convSummary?.ga4?.value ?? "—"}</div>
                <div className="m-sub"><span className="up">{"\u25B2"} {convSummary?.ga4?.delta ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(convSummary?.ga4?.confidence ?? "probable").toLowerCase()}`}>{convSummary?.ga4?.confidence ?? "PROBABLE"}</span></div>
                <div className="m-sub" style={{ marginTop: "5px" }}>{convSummary?.ga4?.note ?? "All channels"}</div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Google Ads All Conversions</div>
                <div className="m-value">{convSummary?.google_ads?.value ?? "—"}</div>
                <div className="m-sub"><span className="up">{"\u25B2"} {convSummary?.google_ads?.delta ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(convSummary?.google_ads?.confidence ?? "probable").toLowerCase()}`}>{convSummary?.google_ads?.confidence ?? "PROBABLE"}</span></div>
                <div className="m-sub" style={{ marginTop: "5px" }}>{convSummary?.google_ads?.note ?? "Piston only \u2014 jets on hold"}</div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Overall CVR</div>
                <div className="m-value">{convSummary?.cvr?.value ?? "—"}</div>
                <div className="m-sub"><span className="up">{"\u25B2"} {convSummary?.cvr?.delta ?? "—"}</span></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(convSummary?.cvr?.confidence ?? "probable").toLowerCase()}`}>{convSummary?.cvr?.confidence ?? "PROBABLE"}</span></div>
                <div className="m-sub" style={{ marginTop: "5px" }}>{convSummary?.cvr?.note ?? "Signal unconfirmed"}</div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Signal Status</div>
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
              {"\u26A0"} Showing "All Conversions" {"\u2014"} this mirrors the GA4 and Google Ads "All Conversions" filter, not filtered key events. Key events and conversion definitions need rebuild before scaling decisions.
            </div>

            <div className="section-label mb-16">All Conversions by Channel / Source</div>
            <div className="table-wrap mb-20">
              <table>
                <thead>
                  <tr><th>Source</th><th>Channel / Campaign</th><th>All Conversions</th><th>Sessions / Clicks</th><th>CVR</th><th>Confidence</th></tr>
                </thead>
                <tbody>
                  {(convByChannel ?? []).map((ch: any, i: number) => (
                    <tr key={ch.id ?? i} style={ch.contaminated ? { background: "#fff5f5" } : ch.on_hold ? { opacity: 0.5 } : undefined}>
                      <td><span className={`badge-${ch.source_badge ?? "ga4"}`}>{ch.source ?? "GA4"}</span></td>
                      <td className="td-primary">{ch.channel ?? "—"}{ch.contaminated ? " \u26A0" : ""}</td>
                      <td>{ch.conversions ?? 0}</td>
                      <td>{ch.sessions ?? ch.clicks ?? 0}</td>
                      <td>{ch.cvr ?? "\u2014"}</td>
                      <td><span className={`conf-${(ch.confidence ?? "probable").toLowerCase()}`}>{ch.confidence ?? "PROBABLE"}</span></td>
                    </tr>
                  ))}
                  {(!convByChannel || convByChannel.length === 0) && (
                    <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>No channel data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="section-label mb-16">All Conversions by Category</div>
            <div className="table-wrap mb-20">
              <table>
                <thead>
                  <tr><th>Category</th><th>GA4 All Conversions</th><th>Google Ads All Conversions</th><th>Total</th><th>Sessions</th><th>CVR</th><th>Confidence</th></tr>
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

            <div className="section-label mb-16">All Conversions Trend {"\u2014"} 8 Weeks</div>
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
                Positive trend across both sources. Piston-only on Google Ads {"\u2014"} jet conversions will appear once campaign is unpaused and conversion signal validated.
              </div>
            </div>
          </div>
        )}

        {/* ── OPPORTUNITIES TAB ── */}
        {activeTab === "opportunities" && (
          <div>
            <div className="section-label mb-16">GA4 Opportunity Queue</div>
            {oppsLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}

            {(opportunities ?? []).map((opp: any, i: number) => (
              <div key={opp.id ?? i} className={`opp-card${opp.pinned ? " pinned" : ""}`}>
                <div className="opp-header">
                  <div className="opp-signal">{opp.signal ?? opp.title ?? "—"}</div>
                  <div className="opp-badges">
                    {opp.badge && <span className={`badge-${opp.badge_class ?? "ga4"}`}>{opp.badge}</span>}
                    {opp.confidence && <span className={`conf-${opp.confidence.toLowerCase()}`}>{opp.confidence}</span>}
                    {opp.priority && <span className={`pri-${opp.priority.toLowerCase()}`}>{opp.priority}</span>}
                  </div>
                </div>
                <div className="opp-gap">{opp.gap ?? opp.description ?? ""}</div>
                {(opp.owner || opp.time_to_impact || opp.action || opp.lift_expected) && (
                  <div className="opp-meta">
                    {opp.owner && <div className="opp-meta-item"><div className="opp-meta-label">Owner</div><div className="opp-meta-value">{opp.owner}</div></div>}
                    {opp.time_to_impact && <div className="opp-meta-item"><div className="opp-meta-label">Time to Impact</div><div className="opp-meta-value">{opp.time_to_impact}</div></div>}
                    {opp.action && <div className="opp-meta-item"><div className="opp-meta-label">Action</div><div className="opp-meta-value">{opp.action}</div></div>}
                    {opp.lift_expected && <div className="opp-meta-item"><div className="opp-meta-label">Lift Expected</div><div className="opp-meta-value">{opp.lift_expected}</div></div>}
                  </div>
                )}
              </div>
            ))}
            {(!opportunities || opportunities.length === 0) && !oppsLoading && (
              <div style={{ padding: "12px", color: "var(--text-muted)", fontSize: "13px" }}>No opportunities available.</div>
            )}
          </div>
        )}

        {/* ── CHANNELS TAB ── */}
        {activeTab === "channels" && (
          <div>
            <div className="section-label mb-16">
              Channel Attribution Table {"\u2014"} Use clean engagement only
            </div>
            {channelsLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Channel</th>
                    <th>Sessions</th>
                    <th>Eng Rate (Reported)</th>
                    <th>Eng Rate (Real)</th>
                    <th>Conversions</th>
                    <th>Revenue</th>
                    <th>Clean?</th>
                    <th>Confidence</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {(channels ?? []).map((ch: any, i: number) => (
                    <tr key={ch.id ?? i} style={ch.contaminated || ch.warning ? { background: "#fff5f5" } : undefined}>
                      <td className="td-primary">{ch.channel ?? "—"}{ch.contaminated || ch.warning ? ` \u26A0` : ""}</td>
                      <td>{ch.sessions?.toLocaleString() ?? "—"}</td>
                      <td>{ch.contaminated ? <span className="m-bad">{ch.eng_rate_reported ?? "—"} {"\u2014"} unsafe</span> : (ch.eng_rate_reported ?? "—")}</td>
                      <td>{ch.eng_rate_real ?? "—"}</td>
                      <td>{ch.conversions ?? "—"}</td>
                      <td>{ch.revenue ?? "—"}</td>
                      <td>
                        {ch.contaminated ? (
                          <span style={{ color: "var(--red)", fontWeight: 700 }}>{"\u2717"} Contaminated</span>
                        ) : ch.warning ? (
                          <span className="conf-possible">{"\u26A0"} Risk</span>
                        ) : (
                          <span className="conf-confirmed">{"\u2713"} Clean</span>
                        )}
                      </td>
                      <td><span className={`conf-${(ch.confidence ?? "probable").toLowerCase()}`}>{ch.confidence ?? "PROBABLE"}</span></td>
                      <td>{ch.note ?? "—"}</td>
                    </tr>
                  ))}
                  {(!channels || channels.length === 0) && !channelsLoading && (
                    <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--text-muted)" }}>No channel data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── LANDING PAGES TAB ── */}
        {activeTab === "landing" && (
          <div>
            <div className="section-label mb-16">Landing Page Performance</div>
            {landingLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Category</th>
                    <th>Impressions</th>
                    <th>Sessions</th>
                    <th>CVR</th>
                    <th>Bounce</th>
                    <th>Issue</th>
                    <th>Action</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(landingPages ?? []).map((lp: any, i: number) => (
                    <tr key={lp.id ?? i}>
                      <td className="td-code">{lp.page ?? lp.path ?? "—"}</td>
                      <td>{lp.category ?? "—"}</td>
                      <td>{lp.impressions ?? "—"}</td>
                      <td>{lp.sessions ?? "—"}</td>
                      <td className={lp.cvr_class ?? ""}>{lp.cvr ?? "—"}</td>
                      <td className={lp.bounce_class ?? ""}>{lp.bounce ?? "—"}</td>
                      <td>{lp.issue ?? "—"}</td>
                      <td>{lp.action ?? "—"}</td>
                      <td><span className={`conf-${(lp.confidence ?? "probable").toLowerCase()}`}>{lp.confidence ?? "PROBABLE"}</span></td>
                    </tr>
                  ))}
                  {(!landingPages || landingPages.length === 0) && !landingLoading && (
                    <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--text-muted)" }}>No landing page data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── EVENTS TAB ── */}
        {activeTab === "events" && (
          <div>
            <div className="section-label mb-16">Event Tier Registry</div>
            {eventsLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Tier</th>
                    <th>Value Weight</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {(events ?? []).map((evt: any, i: number) => (
                    <tr key={evt.id ?? i} style={evt.review_required ? { background: "#fff5f5" } : undefined}>
                      <td className="td-primary">{evt.event ?? evt.name ?? "—"}</td>
                      <td><span className={`conf-${(evt.tier_class ?? "confirmed").toLowerCase()}`}>{evt.tier ?? "—"}</span></td>
                      <td>{evt.value_weight ?? "—"}</td>
                      <td><span className={`status-pill status-${evt.status_class ?? "good"}`}>{evt.status ?? "—"}</span></td>
                      <td>{evt.owner ?? "—"}</td>
                      <td>{evt.note ?? "—"}</td>
                    </tr>
                  ))}
                  {(!events || events.length === 0) && !eventsLoading && (
                    <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>No event data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TRUST TAB ── */}
        {activeTab === "trust" && (
          <>
          {trustLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
          <div className="grid-2">
            <div className="card">
              <div className="card-title">
                {"\uD83D\uDD12"} Measurement Trust Status
              </div>
              <div className="trust-module">
                <div className="trust-module-title">Confirmed blockers</div>
                <ul>
                  {(measurementTrust?.blockers ?? [
                    "GA4 engagement contaminated since June 2023 \u2014 Email_Open_ still active",
                    "Call tracking coverage incomplete at 74%",
                    "Paid conversion validation still unfinished in some segments",
                  ]).map((b: string, i: number) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
              <div className="trust-module">
                <div className="trust-module-title">Decision rules</div>
                <ul>
                  {(measurementTrust?.decision_rules ?? [
                    "Use clean-only engagement estimates for optimization",
                    "Do not reference native GA4 engagement rates in any report to Jeffrey",
                    "Tier 1 events only for optimization signals \u2014 never Tier 3",
                  ]).map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="card">
              <div className="card-title">Saved Views {"\u2014"} GA4</div>
              <div className="saved-views-list">
                {(measurementTrust?.saved_views ?? [
                  { name: "Measurement Integrity", desc: "Clean traffic, contamination alerts, and validation blockers." },
                  { name: "Clean Traffic Only", desc: "Directional channel and landing analysis using clean-only logic." },
                  { name: "Confirmed Signals Only", desc: "Confirmed measurement inputs only \u2014 Jeffrey-safe." },
                ]).map((sv: any, i: number) => (
                  <div className="saved-view-btn" key={i}>
                    <div className="sv-name">{sv.name}</div>
                    <div className="sv-desc">{sv.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </>
  );
}
