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

type TabKey = "overview" | "weekly" | "monthly" | "quarterly" | "initiatives" | "trust";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "weekly", label: "Weekly Priorities" },
  { key: "monthly", label: "Budget & Channels" },
  { key: "quarterly", label: "Quarterly Projects" },
  { key: "initiatives", label: "Initiative Board" },
  { key: "trust", label: "Trust" },
];

export default function CadencePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // ─── API Queries ───
  const { data: constraints, isLoading: constraintsLoading } = useQuery({ queryKey: ["execution-constraints"], queryFn: api.getConstraints });
  const { data: blockers } = useQuery({ queryKey: ["execution-blockers"], queryFn: api.getBlockers });
  const { data: priorities } = useQuery({ queryKey: ["execution-priorities"], queryFn: api.getPriorities });
  const { data: initiatives } = useQuery({ queryKey: ["execution-initiatives"], queryFn: api.getInitiatives });

  return (
    <>
      <Topbar pageTitle="Execution Cadence" />

      <div className="page-hero">
        <div className="hero-eyebrow">GlobalAir.com / Av/IntelOS</div>
        <h1 className="hero-title">Execution System &amp; Operating Cadence</h1>
        <p className="hero-sub">
          Weekly priorities, bottleneck diagnosis, budget reallocation logic,
          channel scoring, quarterly projects, and initiative control board.
        </p>
      </div>

      <div className="tab-bar">
        <div className="tab-bar-inner">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab-btn${activeTab === t.key ? " active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="page-body">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div>
            <div className="section-label mb-16">Operating KPIs</div>
            {constraintsLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
            <div className="metric-grid-5 mb-20">
              <div className="metric-card">
                <div className="m-label">Primary Constraint</div>
                <div className={`m-value ${constraints?.primary_constraint_class ?? "m-bad"}`} style={{ fontSize: 18 }}>{rv(constraints?.primary_constraint)}</div>
                <div className="m-sub">{constraints?.primary_constraint_sub ?? "Unchanged this week"}</div>
                <div style={{ marginTop: 6 }}><span className={`conf-${(constraints?.primary_constraint_confidence ?? "confirmed").toLowerCase()}`}>{(constraints?.primary_constraint_confidence ?? "CONFIRMED").toUpperCase()}</span></div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Weekly Priority Count</div>
                <div className="m-value">{rv(constraints?.weekly_priority_count)}</div>
                <div className="m-sub">{constraints?.weekly_priority_sub ?? "At cap — no additions"}</div>
                <div style={{ marginTop: 6 }}><span className={`conf-${(constraints?.weekly_priority_confidence ?? "confirmed").toLowerCase()}`}>{(constraints?.weekly_priority_confidence ?? "CONFIRMED").toUpperCase()}</span></div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Reallocation Readiness</div>
                <div className={`m-value ${constraints?.reallocation_class ?? "m-warn"}`}>{rv(constraints?.reallocation ?? constraints?.reallocation_readiness)}</div>
                <div className="m-sub"><span className="up" dangerouslySetInnerHTML={{ __html: constraints?.reallocation_trend ?? "&#9650; +1 segment" }} /></div>
                <div style={{ marginTop: 6 }}><span className={`conf-${(constraints?.reallocation_confidence ?? "probable").toLowerCase()}`}>{(constraints?.reallocation_confidence ?? "PROBABLE").toUpperCase()}</span></div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Execution Capacity</div>
                <div className={`m-value ${constraints?.capacity_class ?? "m-warn"}`}>{rv(constraints?.capacity ?? constraints?.execution_capacity)}</div>
                <div className="m-sub"><span className={constraints?.capacity_trend_dir ?? "down"}>{constraints?.capacity_sub ?? "1 blocker active"}</span></div>
                <div style={{ marginTop: 6 }}><span className={`conf-${(constraints?.capacity_confidence ?? "probable").toLowerCase()}`}>{(constraints?.capacity_confidence ?? "PROBABLE").toUpperCase()}</span></div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Roadmap Discipline</div>
                <div className={`m-value ${constraints?.discipline_class ?? "m-good"}`}>{rv(constraints?.discipline ?? constraints?.roadmap_discipline)}</div>
                <div className="m-sub"><span className="up" dangerouslySetInnerHTML={{ __html: constraints?.discipline_trend ?? "&#9650; +0.7 pts MoM" }} /></div>
                <div style={{ marginTop: 6 }}><span className={`conf-${(constraints?.discipline_confidence ?? "probable").toLowerCase()}`}>{(constraints?.discipline_confidence ?? "PROBABLE").toUpperCase()}</span></div>
                <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
              </div>
            </div>

            <div className="section-label mb-16">Active Bottlenecks</div>
            <div className="grid-2 mb-20">
              <div className="space-y">
                {(blockers ?? []).filter((_: any, idx: number) => idx % 2 === 0).map((b: any, i: number) => (
                  <div className={`incident-card ${b.severity === "broken" ? "broken" : "warning"}`} key={i}>
                    <div className="inc-header">
                      <div className="inc-title">{rv(b.title)}</div>
                      <span className={`conf-${(b.confidence ?? b.confidence_level ?? "confirmed").toLowerCase()}`}>{(b.confidence ?? b.confidence_level ?? "CONFIRMED").toUpperCase()}</span>
                    </div>
                    <div className="inc-body">{rv(b.body ?? b.description)}</div>
                    {(b.implication || b.implication_text) && <div className="inc-meta"><span>{rv(b.implication ?? b.implication_text)}</span></div>}
                  </div>
                ))}
              </div>
              <div className="space-y">
                {(blockers ?? []).filter((_: any, idx: number) => idx % 2 === 1).map((b: any, i: number) => (
                  <div className={`incident-card ${b.severity === "broken" ? "broken" : "warning"}`} key={i}>
                    <div className="inc-header">
                      <div className="inc-title">{rv(b.title)}</div>
                      <span className={`conf-${(b.confidence ?? b.confidence_level ?? "probable").toLowerCase()}`}>{(b.confidence ?? b.confidence_level ?? "PROBABLE").toUpperCase()}</span>
                    </div>
                    <div className="inc-body">{rv(b.body ?? b.description)}</div>
                    {(b.implication || b.implication_text) && <div className="inc-meta"><span>{rv(b.implication ?? b.implication_text)}</span></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WEEKLY PRIORITIES */}
        {activeTab === "weekly" && (
          <div>
            <div className="section-label mb-16">This Week — {priorities?.length ?? 3} Locked Priorities</div>

            {(priorities ?? []).map((p: any, i: number) => (
              <div className="priority-card pinned" key={i}>
                <div className="pc-header">
                  <div className="pc-title">{rv(p.title)}</div>
                  <div className="pc-badges">
                    {p.badge && <span className={`badge-${p.badge_class ?? "organic"}`}>{p.badge}</span>}
                    <span className={`conf-${(p.confidence ?? "confirmed").toLowerCase()}`}>{(p.confidence ?? "CONFIRMED").toUpperCase()}</span>
                    <span className={`pri-${(p.priority ?? "now").toLowerCase()}`}>{p.priority ?? "Now"}</span>
                    {p.score != null && <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{p.score}</span>}
                  </div>
                </div>
                <div className="pc-body">{rv(p.body ?? p.description)}</div>
                {p.meta && (
                  <div className="pc-meta">
                    {(p.meta as any[]).map((m: any, j: number) => (
                      <div className="pc-meta-item" key={j}><div className="pc-meta-label">{rv(m.label)}</div><div className="pc-meta-value">{rv(m.value)}</div></div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* BUDGET & CHANNELS */}
        {activeTab === "monthly" && (
          <div>
            <div className="section-label mb-16">Budget Reallocation — This Month</div>
            <div className="mb-20">
              <div className="shift-card">
                <div className="flex-between">
                  <div style={{ fontSize: 12 }}><span style={{ fontWeight: 700 }}>From:</span> Broad non-brand paid</div>
                  <span className="shift-arrow">&rarr;</span>
                  <div style={{ fontSize: 12 }}><span style={{ fontWeight: 700 }}>To:</span> High-intent piston model clusters</div>
                  <div><span className="conf-confirmed">CONFIRMED</span></div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  Amount: <strong>$1.2K / week</strong> &middot; Reason: Higher inquiry density and cleaner conversion truth. Keep shift only if CPQI improves without volume collapse.
                </div>
              </div>
              <div className="shift-card">
                <div className="flex-between">
                  <div style={{ fontSize: 12 }}><span style={{ fontWeight: 700 }}>From:</span> Evening spend (after 8 PM)</div>
                  <span className="shift-arrow">&rarr;</span>
                  <div style={{ fontSize: 12 }}><span style={{ fontWeight: 700 }}>To:</span> Tue–Thu midday windows</div>
                  <div><span className="conf-probable">PROBABLE</span></div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  Amount: <strong>$0.1K / week</strong> &middot; Reason: Evening efficiency materially worse than core dayparts.
                </div>
              </div>
              <div className="shift-card" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                <div className="flex-between">
                  <div style={{ fontSize: 12 }}><span style={{ fontWeight: 700 }}>From:</span> Low-yield social prospecting</div>
                  <span className="shift-arrow">&rarr;</span>
                  <div style={{ fontSize: 12 }}><span style={{ fontWeight: 700 }}>To:</span> Retargeting / lifecycle audiences</div>
                  <div><span className="conf-possible">POSSIBLE</span></div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  Amount: <strong>$500 / week</strong> &middot; Scale only if assisted path value improves. Do not act yet.
                </div>
              </div>
            </div>

            <div className="section-label mb-16">Channel Score Matrix</div>
            {[
              { channel: "SEO", width: "78%", bg: "var(--navy)", total: 39, rec: "Scale", recClass: "rec-scale" },
              { channel: "PPC", width: "76%", bg: "var(--blue)", total: 38, rec: "Scale", recClass: "rec-scale" },
              { channel: "Lifecycle", width: "66%", bg: "var(--violet)", total: 33, rec: "Refine", recClass: "rec-refine" },
              { channel: "Retargeting", width: "54%", bg: "var(--cyan)", total: 27, rec: "Refine", recClass: "rec-refine" },
              { channel: "Social Authority", width: "46%", bg: "var(--amber)", total: 23, rec: "Hold", recClass: "rec-hold" },
              { channel: "Events", width: "40%", bg: "var(--text-faint)", total: 20, rec: "Hold", recClass: "rec-hold" },
            ].map((row) => (
              <div className="channel-score-row" key={row.channel}>
                <span className="cs-channel">{row.channel}</span>
                <div className="cs-bar-wrap">
                  <div className="cs-bar" style={{ width: row.width, background: row.bg }} />
                </div>
                <span className="cs-total">{row.total}</span>
                <span className={`cs-rec ${row.recClass}`}>{row.rec}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-faint)" }}>
              Scored on Revenue Impact, Efficiency, Scalability, Competitive Leverage,
              Operational Complexity (max 50)
            </div>
          </div>
        )}

        {/* QUARTERLY PROJECTS */}
        {activeTab === "quarterly" && (
          <div>
            <div className="section-label mb-16">Quarterly Projects — Control Board</div>

            <div className="qp-card" style={{ borderLeft: "3px solid var(--green-dark)" }}>
              <div className="qp-header">
                <div className="qp-title">QP-001 — Piston Demand Capture Expansion</div>
                <div className="pc-badges">
                  <span className="stage-pill">Scale</span>
                  <span className="conf-confirmed">CONFIRMED</span>
                  <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>94</span>
                </div>
              </div>
              <div className="qp-body">
                Increase qualified inquiries from high-intent piston clusters. Owner: PPC +
                SEO &middot; Timeline: 90 days &middot; Dependency: Landing page fixes + query cluster
                map &middot; Measurement: +20% qualified inquiries / stable CPQI &middot; Risk: Scaling
                before conversion confidence fully clean in edge segments.
              </div>
            </div>

            <div className="qp-card" style={{ borderLeft: "3px solid var(--red)" }}>
              <div className="qp-header">
                <div className="qp-title">QP-002 — Measurement Integrity Closure</div>
                <div className="pc-badges">
                  <span className="stage-pill">Controlled Launch</span>
                  <span className="conf-confirmed">CONFIRMED</span>
                  <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 14, fontWeight: 700, color: "var(--red)" }}>97</span>
                </div>
              </div>
              <div className="qp-body">
                Raise confidence in paid and offline attribution before broader expansion.
                Owner: Analytics + DevOps &middot; Timeline: 60 days &middot; Measurement: Validation
                coverage &gt;90% &middot; Risk: Slow technical support delays budget decisions.
              </div>
            </div>

            <div className="qp-card" style={{ borderLeft: "3px solid var(--amber)" }}>
              <div className="qp-header">
                <div className="qp-title">QP-003 — Broker Retention and ARPA Lift</div>
                <div className="pc-badges">
                  <span className="stage-pill">Refine</span>
                  <span className="conf-probable">PROBABLE</span>
                  <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>88</span>
                </div>
              </div>
              <div className="qp-body">
                Protect and expand advertiser revenue in at-risk and mid-tier accounts.
                Owner: Sales / Retention &middot; Timeline: 90 days &middot; Measurement: +15%
                advertiser revenue / reduced churn &middot; Risk: Weak offline close data blunts
                renewal proof.
              </div>
            </div>

            <div className="qp-card" style={{ borderLeft: "3px solid var(--text-faint)", background: "#fffbeb" }}>
              <div className="qp-header">
                <div className="qp-title">QP-004 — Authority Content to Commerce Routing</div>
                <div className="pc-badges">
                  <span className="stage-pill" style={{ background: "var(--bg-soft)", color: "var(--text-muted)" }}>Proposal</span>
                  <span className="conf-possible">POSSIBLE</span>
                  <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-muted)" }}>72</span>
                </div>
              </div>
              <div className="qp-body">
                Turn research-stage traffic into stronger downstream inquiry paths. Owner:
                Content + Lifecycle &middot; Timeline: 90 days &middot; Risk: Assist value remains too
                modeled in some cohorts. Do not scale until attribution improves.
              </div>
            </div>
          </div>
        )}

        {/* INITIATIVES */}
        {activeTab === "initiatives" && (
          <div>
            <div className="section-label mb-16">Initiative Control Board</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Initiative</th>
                    <th>Stage</th>
                    <th>Owner</th>
                    <th>Priority</th>
                    <th>Score</th>
                    <th>Expected Impact</th>
                    <th>Stop-Loss</th>
                    <th>Blocker</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(initiatives ?? []).map((ini: any, i: number) => (
                    <tr key={i} style={ini.highlight ? { background: "#fffbeb" } : {}}>
                      <td className="td-primary">{rv(ini.initiative ?? ini.title)}</td>
                      <td><span className="stage-pill" style={ini.stage_style ?? {}}>{rv(ini.stage ?? ini.scale_safety)}</span></td>
                      <td>{rv(ini.owner ?? ini.owner_name)}</td>
                      <td><span className={`pri-${(ini.priority ?? "now").toLowerCase()}`}>{ini.priority ?? "Now"}</span></td>
                      <td style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, color: ini.score_color ?? "var(--navy)" }}>{ini.score ?? "—"}</td>
                      <td>{rv(ini.expected_impact ?? ini.expected_lift)}</td>
                      <td>{rv(ini.stop_loss)}</td>
                      <td>{rv(ini.blocker, "None")}</td>
                      <td><span className={`conf-${(ini.confidence ?? "confirmed").toLowerCase()}`}>{(ini.confidence ?? "CONFIRMED").toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TRUST */}
        {activeTab === "trust" && (
          <div className="grid-2">
            <div className="card">
              <div className="card-title">Execution Trust Status</div>
              <div className="trust-module">
                <div className="trust-module-title">Confirmed constraints</div>
                <ul>
                  <li>Jet scale and some reallocation decisions blocked by conversion validation gaps</li>
                  <li>Some initiatives still depend on shared dev and analytics support</li>
                  <li>Random acts of marketing decreasing but some initiatives still lack kill rules</li>
                </ul>
              </div>
              <div className="trust-module">
                <div className="trust-module-title">Operating rules</div>
                <ul>
                  <li>Maximum 3 active priorities at any time — no additions mid-sprint</li>
                  <li>Every initiative needs: hypothesis, expected lift, stop-loss, owner, and kill condition</li>
                  <li>Scale only where conversion signal is confirmed — no speculation</li>
                </ul>
              </div>
            </div>
            <div className="card">
              <div className="card-title">Saved Views</div>
              <div className="saved-views-list">
                <div className="saved-view-btn">
                  <div className="sv-name">Weekly Operator View</div>
                  <div className="sv-desc">Top 3 priorities, blockers, reallocations, and stop-losses.</div>
                </div>
                <div className="saved-view-btn">
                  <div className="sv-name">Budget Reallocation</div>
                  <div className="sv-desc">Channel shifts, segment pressure, and scale discipline.</div>
                </div>
                <div className="saved-view-btn">
                  <div className="sv-name">Board-Safe Operating View</div>
                  <div className="sv-desc">Confirmed priorities, resource focus, and revenue guardrails.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
