import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Topbar from "../components/layout/Topbar";
import { api } from "../services/api";

/** Safely extract a renderable value — guards against API returning objects instead of strings */
function rv(v: any, fallback = "—"): string {
  if (v == null) return fallback;
  if (typeof v === "object") return v?.value ?? v?.Value ?? v?.title ?? v?.Title ?? v?.name ?? v?.Name ?? fallback;
  return String(v);
}

type ViewTab =
  | "overview"
  | "connectors"
  | "ga4"
  | "crawlers"
  | "email"
  | "freshness"
  | "ownership"
  | "impact";

const tabs: { id: ViewTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "connectors", label: "Connectors" },
  { id: "ga4", label: "GA4 & Incidents" },
  { id: "crawlers", label: "AI Crawlers" },
  { id: "email", label: "Email Health" },
  { id: "freshness", label: "Freshness SLA" },
  { id: "ownership", label: "Page Impact Map" },
  { id: "impact", label: "Trust" },
];

export default function HealthPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>("overview");

  // ─── API Queries ───
  const { data: overview, isLoading: overviewLoading } = useQuery({ queryKey: ["health-overview"], queryFn: api.getHealthOverview });
  const { data: incidents } = useQuery({ queryKey: ["health-incidents"], queryFn: api.getHealthIncidents });
  const { data: sourceFreshness } = useQuery({ queryKey: ["health-source-freshness"], queryFn: api.getHealthSourceFreshness });
  const { data: crawlers } = useQuery({ queryKey: ["health-crawlers"], queryFn: api.getHealthCrawlers });
  const { data: emailDeliverability } = useQuery({ queryKey: ["health-email-deliverability"], queryFn: api.getHealthEmailDeliverability });
  const { data: pageTrust } = useQuery({ queryKey: ["health-page-trust"], queryFn: api.getHealthPageTrust });
  const { data: _trustRegistry } = useQuery({ queryKey: ["health-trust-registry"], queryFn: api.getHealthTrustRegistry });
  const { data: freshnessTrend } = useQuery({ queryKey: ["health-freshness-trend"], queryFn: api.getHealthFreshnessTrend });
  void freshnessTrend; // available for future chart rendering

  return (
    <>
      <Topbar pageTitle="Data Health" />

      {/* PAGE HERO */}
      <div className="page-hero">
        <div className="hero-eyebrow">GlobalAir.com / Av/IntelOS</div>
        <h1 className="hero-title">Data Health &amp; System Status</h1>
        <p className="hero-sub">
          Source trust registry, connector freshness SLA board, active incidents,
          AI crawler access status, email deliverability, and page-level decision
          safety mapping.
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
      <div className="page-body">
        {/* ────── OVERVIEW ────── */}
        {activeTab === "overview" && (
          <div>
            <div className="section-label mb-16">System Health KPIs</div>
            {overviewLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
            <div className="metric-grid-6 mb-20">
              <div className="metric-card">
                <div className="m-label">Decision-Safe Sources</div>
                <div className={`m-value ${overview?.decision_safe_class ?? "m-warn"}`}>{rv(overview?.decision_safe ?? overview?.decision_safe_sources)}</div>
                <div className="m-sub">{overview?.decision_safe_sub ?? "2 blocked"}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${(overview?.decision_safe_confidence ?? "confirmed").toLowerCase()}`}>{(overview?.decision_safe_confidence ?? "CONFIRMED").toUpperCase()}</span>
                </div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Critical Incidents</div>
                <div className={`m-value ${overview?.incidents_class ?? "m-bad"}`}>{rv(overview?.critical_incidents)}</div>
                <div className="m-sub">{overview?.incidents_sub ?? "+1 vs last review"}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${(overview?.incidents_confidence ?? "confirmed").toLowerCase()}`}>{(overview?.incidents_confidence ?? "CONFIRMED").toUpperCase()}</span>
                </div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Freshness SLA Compliance</div>
                <div className={`m-value ${overview?.freshness_class ?? "m-warn"}`}>{rv(overview?.freshness_sla ?? overview?.freshness_sla_compliance)}</div>
                <div className="m-sub">{overview?.freshness_sub ?? "-6 pts WoW"}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${(overview?.freshness_confidence ?? "probable").toLowerCase()}`}>{(overview?.freshness_confidence ?? "PROBABLE").toUpperCase()}</span>
                </div>
                <div className="m-date">Week: Mar 23 – Mar 29, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Pages Fully Safe</div>
                <div className={`m-value ${overview?.pages_safe_class ?? "m-bad"}`}>{rv(overview?.pages_safe ?? overview?.pages_fully_safe)}</div>
                <div className="m-sub">{overview?.pages_safe_sub ?? "2 degraded"}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${(overview?.pages_safe_confidence ?? "confirmed").toLowerCase()}`}>{(overview?.pages_safe_confidence ?? "CONFIRMED").toUpperCase()}</span>
                </div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Remediation Ownership</div>
                <div className={`m-value ${overview?.remediation_class ?? "m-good"}`}>{rv(overview?.remediation ?? overview?.remediation_ownership)}</div>
                <div className="m-sub">{overview?.remediation_sub ?? "+9 pts MoM"}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${(overview?.remediation_confidence ?? "probable").toLowerCase()}`}>{(overview?.remediation_confidence ?? "PROBABLE").toUpperCase()}</span>
                </div>
                <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Board-Safe Rendering</div>
                <div className={`m-value ${overview?.board_safe_class ?? "m-warn"}`}>{rv(overview?.board_safe ?? overview?.board_safe_rendering)}</div>
                <div className="m-sub">{overview?.board_safe_sub ?? "Jeffrey-safe: confirmed only"}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${(overview?.board_safe_confidence ?? "confirmed").toLowerCase()}`}>{(overview?.board_safe_confidence ?? "CONFIRMED").toUpperCase()}</span>
                </div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
            </div>

            <div className="section-label mb-16">Active Critical Incidents</div>

            {(incidents ?? []).map((inc: any, i: number) => (
              <div className={`incident-card ${inc.severity === "broken" ? "broken" : "warning"}`} key={i} style={i > 0 ? { marginTop: 10 } : {}}>
                <div className="inc-header">
                  <div className="inc-title" dangerouslySetInnerHTML={{ __html: inc.title ?? "—" }} />
                  <span className={`conf-${(inc.confidence ?? inc.confidence_level ?? "confirmed").toLowerCase()}`}>{(inc.confidence ?? inc.confidence_level ?? "CONFIRMED").toUpperCase()}</span>
                </div>
                <div className="inc-body">{rv(inc.body ?? inc.description)}</div>
                {(inc.meta || inc.module) && (
                  <div className="inc-meta">
                    {Array.isArray(inc.meta) ? (inc.meta as any[]).map((m: any, j: number) => (
                      <span key={j} dangerouslySetInnerHTML={{ __html: typeof m === "string" ? m : m?.label ?? m?.title ?? m?.value ?? "—" }} />
                    )) : inc.module ? <span>{rv(inc.module)}</span> : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ────── CONNECTORS ────── */}
        {activeTab === "connectors" && (
          <div>
            <div className="section-label mb-16">Data Connector Status</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Connector</th>
                    <th>Category</th>
                    <th>Expected Cadence</th>
                    <th>Last Sync</th>
                    <th>Sync Age</th>
                    <th>SLA</th>
                    <th>Status</th>
                    <th>Decision State</th>
                    <th>Owner</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(sourceFreshness ?? []).map((s: any, i: number) => (
                    <tr key={i} style={s.highlight ? { background: "#fff5f5" } : {}}>
                      <td className="td-primary" dangerouslySetInnerHTML={{ __html: s.connector ?? "—" }} />
                      <td>{s.category ?? "—"}</td>
                      <td>{s.expected_cadence ?? "—"}</td>
                      <td dangerouslySetInnerHTML={{ __html: s.last_sync ?? "—" }} />
                      <td className={s.age_class ?? ""}>{s.sync_age ?? "—"}</td>
                      <td><span className={`status-pill status-${s.sla_class ?? "warn"}`}>{s.sla ?? "—"}</span></td>
                      <td><span className={`status-pill status-${s.status_class ?? "warn"}`}>{s.status ?? "—"}</span></td>
                      <td className={s.decision_class ?? ""}>{s.decision_state ?? "—"}</td>
                      <td>{s.owner ?? "—"}</td>
                      <td>
                        <span className={`conf-${(s.confidence ?? "confirmed").toLowerCase()}`}>{(s.confidence ?? "CONFIRMED").toUpperCase()}</span>
                        {s.confidence_note && <div style={{ fontSize: 11, marginTop: 2 }}>{s.confidence_note}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ────── GA4 & INCIDENTS ────── */}
        {activeTab === "ga4" && (
          <div>
            <div className="section-label mb-16">
              GA4 Contamination — Active Since June 2023
            </div>
            <div className="grid-2 mb-16">
              <div className="card card-red">
                <div className="card-title">
                  Contamination Status — Do Not Use for Decisioning
                </div>
                <div className="soft-list">
                  <div className="soft-row">
                    <span className="row-label">Reported engagement rate</span>
                    <span className="row-value m-bad">17.3% — unsafe</span>
                  </div>
                  <div className="soft-row">
                    <span className="row-label">Real engagement estimate</span>
                    <span className="row-value m-good">68.9% — use this</span>
                  </div>
                  <div className="soft-row">
                    <span className="row-label">Root cause</span>
                    <span className="row-value">
                      Email_Open_ Measurement Protocol hits
                    </span>
                  </div>
                  <div className="soft-row">
                    <span className="row-label">Channels affected</span>
                    <span className="row-value m-bad">
                      Direct, Email — unsafe. Others: directional
                    </span>
                  </div>
                  <div className="soft-row">
                    <span className="row-label">Jeffrey-safe</span>
                    <span className="row-value m-bad">
                      No — suppress native engagement for ownership reporting
                    </span>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-title">Incident Trend (Open Count)</div>
                <div className="chart-shell">
                  <div className="gridlines" />
                  <div className="line-wrap">
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <polyline
                        fill="none"
                        stroke="#d32f2f"
                        strokeWidth="3"
                        points="0,30 17,30 33,25 50,25 67,25 83,25 100,25"
                      />
                      <polyline
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="4,2"
                        points="0,50 17,50 33,50 50,50 67,50 83,50 100,50"
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
                    <span className="legend-label">Critical incidents</span>
                  </span>
                  <span>
                    <span
                      className="legend-dot"
                      style={{ background: "var(--amber)" }}
                    />
                    <span className="legend-label">Target = 2 max</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────── AI CRAWLERS ────── */}
        {activeTab === "crawlers" && (
          <div>
            <div className="section-label mb-16">
              AI Crawler Access — All Blocked (Ticket CR-4471)
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
              &#x1F534; All 6 tracked AI crawlers are currently blocked by
              robots.txt and/or WAF configuration. This is a strategic visibility
              problem — GlobalAir is losing discoverability in AI answer surfaces
              (ChatGPT, Perplexity, Claude, Google AI Overviews). Ticket CR-4471
              is open. Validation required post-fix.
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Crawler</th>
                    <th>Status</th>
                    <th>Robots State</th>
                    <th>Ticket</th>
                    <th>Owner</th>
                    <th>Opened</th>
                    <th>Business Risk</th>
                    <th>Next Step</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(crawlers ?? []).map((c: any, i: number) => (
                    <tr key={i} style={c.highlight !== false ? { background: "#fff5f5" } : {}}>
                      <td className="td-primary">{c.crawler ?? "—"}</td>
                      <td><span className={`status-pill status-${c.status_class ?? "bad"}`}>{c.status ?? "—"}</span></td>
                      <td className={c.robots_class ?? "m-bad"}>{c.robots_state ?? "—"}</td>
                      <td>{c.ticket ?? "—"}</td>
                      <td>{c.owner ?? "—"}</td>
                      <td>{c.opened ?? "—"}</td>
                      <td className={c.risk_class ?? ""}>{c.business_risk ?? "—"}</td>
                      <td>{c.next_step ?? "—"}</td>
                      <td><span className={`conf-${(c.confidence ?? "confirmed").toLowerCase()}`}>{(c.confidence ?? "CONFIRMED").toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ────── EMAIL HEALTH ────── */}
        {activeTab === "email" && (
          <div>
            <div className="section-label mb-16">
              Email Deliverability &amp; Domain Health
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>SPF</th>
                    <th>DKIM</th>
                    <th>DMARC</th>
                    <th>Deliverability</th>
                    <th>Inbox Risk</th>
                    <th>Sequences Affected</th>
                    <th>Revenue Risk</th>
                    <th>Status</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(emailDeliverability ?? []).map((e: any, i: number) => (
                    <tr key={i} style={e.highlight ? { background: "#fff5f5" } : {}}>
                      <td className="td-primary">{e.domain ?? "—"}</td>
                      <td className={e.spf_class ?? ""}>{e.spf ?? "—"}</td>
                      <td className={e.dkim_class ?? ""}>{e.dkim ?? "—"}</td>
                      <td className={e.dmarc_class ?? ""}>{e.dmarc ?? "—"}</td>
                      <td className={e.deliverability_class ?? ""}>{e.deliverability ?? "—"}</td>
                      <td className={e.inbox_risk_class ?? ""}>{e.inbox_risk ?? "—"}</td>
                      <td>{e.sequences_affected ?? "—"}</td>
                      <td className={e.revenue_risk_class ?? ""}>{e.revenue_risk ?? "—"}</td>
                      <td><span className={`status-pill status-${e.status_class ?? "warn"}`}>{e.status ?? "—"}</span></td>
                      <td><span className={`conf-${(e.confidence ?? "confirmed").toLowerCase()}`}>{(e.confidence ?? "CONFIRMED").toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="note-text" style={{ marginTop: 12 }}>
              &#x26A0; news.globalair.com has no DMARC record. This increases
              inbox delivery risk for AvBlast newsletter distribution.
              Remediation required before any major list sends.
            </div>
          </div>
        )}

        {/* ────── FRESHNESS SLA ────── */}
        {activeTab === "freshness" && (
          <div>
            <div className="section-label mb-16">Freshness SLA Board</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Expected Cadence</th>
                    <th>Actual Age</th>
                    <th>SLA Breach</th>
                    <th>Trend</th>
                    <th>Status</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(sourceFreshness ?? []).map((s: any, i: number) => (
                    <tr key={i} style={s.highlight ? { background: "#fff5f5" } : {}}>
                      <td className="td-primary">{s.source ?? s.connector ?? "—"}</td>
                      <td>{s.expected_cadence ?? "—"}</td>
                      <td className={s.age_class ?? ""}>{s.actual_age ?? s.sync_age ?? "—"}</td>
                      <td className={s.breach_class ?? ""}>{s.sla_breach ?? s.sla ?? "—"}</td>
                      <td className={s.trend_class ?? ""}>{s.trend ?? "—"}</td>
                      <td><span className={`status-pill status-${s.status_class ?? "warn"}`}>{s.status ?? "—"}</span></td>
                      <td><span className={`conf-${(s.confidence ?? "confirmed").toLowerCase()}`}>{(s.confidence ?? "CONFIRMED").toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ────── PAGE IMPACT MAP ────── */}
        {activeTab === "ownership" && (
          <div>
            <div className="section-label mb-16">
              Page Impact Map — Decision Safety by Dashboard Page
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Affected Widgets</th>
                    <th>Source Issue</th>
                    <th>Render State</th>
                    <th>Decision State</th>
                    <th>Next Move</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(pageTrust ?? []).map((p: any, i: number) => (
                    <tr key={i} style={p.highlight ? { background: "#fff5f5" } : {}}>
                      <td className="td-primary">{p.page ?? "—"}</td>
                      <td>{p.affected_widgets ?? "—"}</td>
                      <td>{p.source_issue ?? "—"}</td>
                      <td>{p.render_state ?? "—"}</td>
                      <td className={p.decision_class ?? ""}>{p.decision_state ?? "—"}</td>
                      <td>{p.next_move ?? "—"}</td>
                      <td><span className={`conf-${(p.confidence ?? "confirmed").toLowerCase()}`}>{(p.confidence ?? "CONFIRMED").toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ────── TRUST ────── */}
        {activeTab === "impact" && (
          <div className="grid-2">
            <div className="card">
              <div className="card-title">&#x1F512; System Trust Registry</div>
              <div className="trust-module">
                <div className="trust-module-title">
                  Decision-safe sources (8/15)
                </div>
                <ul>
                  <li>
                    CRM Opportunity Feedback — NOT CONNECTED
                  </li>
                  <li>Search Console — CONFIRMED &middot; Within SLA</li>
                  <li>Email Platform Health — PENDING SETUP</li>
                  <li>Call tracking — PENDING SETUP (CallRail being configured)</li>
                </ul>
              </div>
              <div className="trust-module">
                <div className="trust-module-title">
                  Blocked / diagnostic-only sources
                </div>
                <ul>
                  <li>GA4 engagement — contaminated since June 2023</li>
                  <li>Google Ads via Windsor — SLA breached 10h 59m</li>
                  <li>SpyFu — NOT CONNECTED</li>
                  <li>Identity stitching — only 43% cross-session coverage</li>
                </ul>
              </div>
            </div>
            <div className="card">
              <div className="card-title">Saved Views</div>
              <div className="saved-views-list">
                <button className="saved-view-btn">
                  <div className="sv-name">Weekly Integrity Control</div>
                  <div className="sv-desc">
                    Top blockers, page impact, and what is unsafe to use.
                  </div>
                </button>
                <button className="saved-view-btn">
                  <div className="sv-name">Crawler War Room</div>
                  <div className="sv-desc">
                    AI crawler blocks, tickets, and ownership status.
                  </div>
                </button>
                <button className="saved-view-btn">
                  <div className="sv-name">Board-Safe Systems View</div>
                  <div className="sv-desc">
                    Confirmed-only system risk and page safety summary.
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
      </div>
    </>
  );
}
