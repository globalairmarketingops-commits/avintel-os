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

type TabKey = "overview" | "audiences" | "sequences" | "scoring" | "retargeting" | "newsletter" | "attribution" | "trust";

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // ─── API Queries ───
  const { data: kpis, isLoading: kpisLoading } = useQuery({ queryKey: ["email-kpis"], queryFn: api.getEmailKpis });
  const { data: sequences } = useQuery({ queryKey: ["email-sequences"], queryFn: api.getEmailSequences });
  const { data: scoringTiers } = useQuery({ queryKey: ["email-scoring-tiers"], queryFn: api.getEmailScoringTiers });
  const { data: retargetingSegments } = useQuery({ queryKey: ["email-retargeting-segments"], queryFn: api.getEmailRetargetingSegments });
  const { data: attributionBlockers } = useQuery({ queryKey: ["email-attribution-blockers"], queryFn: api.getEmailAttributionBlockers });
  const { data: performance } = useQuery({ queryKey: ["email-performance"], queryFn: api.getEmailPerformance });
  const { data: _servers } = useQuery({ queryKey: ["email-servers"], queryFn: api.getEmailServers });
  const { data: newsletterSegments } = useQuery({ queryKey: ["email-newsletter-segments"], queryFn: api.getEmailNewsletterSegments });

  return (
    <>
      <Topbar pageTitle="Email Lifecycle" />

      <div className="page-hero">
        <div className="hero-eyebrow">GlobalAir.com / Av/IntelOS</div>
        <h1 className="hero-title">Email Lifecycle Command</h1>
        <p className="hero-sub">Email-assisted inquiry performance, sequence architecture, behavioral scoring, retargeting sync, attribution integrity, and newsletter segmentation governance.</p>
      </div>

      <div className="tab-bar">
        <div className="tab-bar-inner">
          <button className={`tab-btn${activeTab === "overview" ? " active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
          <button className={`tab-btn${activeTab === "audiences" ? " active" : ""}`} onClick={() => setActiveTab("audiences")}>Audiences</button>
          <button className={`tab-btn${activeTab === "sequences" ? " active" : ""}`} onClick={() => setActiveTab("sequences")}>Sequences</button>
          <button className={`tab-btn${activeTab === "scoring" ? " active" : ""}`} onClick={() => setActiveTab("scoring")}>Scoring</button>
          <button className={`tab-btn${activeTab === "retargeting" ? " active" : ""}`} onClick={() => setActiveTab("retargeting")}>Retargeting Sync</button>
          <button className={`tab-btn${activeTab === "newsletter" ? " active" : ""}`} onClick={() => setActiveTab("newsletter")}>Newsletter</button>
          <button className={`tab-btn${activeTab === "attribution" ? " active" : ""}`} onClick={() => setActiveTab("attribution")}>Attribution</button>
          <button className={`tab-btn${activeTab === "trust" ? " active" : ""}`} onClick={() => setActiveTab("trust")}>Trust</button>
        </div>
      </div>

      <div className="page-body">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div id="tab-overview" className="tab-content active">
            <div className="section-label mb-16">Lifecycle KPIs</div>
            {kpisLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
            <div className="metric-grid-6 mb-20">
              <div className="metric-card">
                <div className="m-label">Email-Assisted QI</div>
                <div className="m-value">{rv(kpis?.email_assisted_qi)}</div>
                <div className="m-sub"><span className="up" dangerouslySetInnerHTML={{ __html: kpis?.email_assisted_qi_trend ?? "&#9650; +11.5% MoM" }} /></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(kpis?.email_assisted_qi_confidence ?? "probable").toLowerCase()}`}>{(kpis?.email_assisted_qi_confidence ?? "PROBABLE").toUpperCase()}</span></div>
                <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Return Visit Rate</div>
                <div className="m-value">{rv(kpis?.return_visit_rate)}</div>
                <div className="m-sub"><span className="up" dangerouslySetInnerHTML={{ __html: kpis?.return_visit_rate_trend ?? "&#9650; +4 pts MoM" }} /></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(kpis?.return_visit_rate_confidence ?? "confirmed").toLowerCase()}`}>{(kpis?.return_visit_rate_confidence ?? "CONFIRMED").toUpperCase()}</span></div>
                <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Score Progression Rate</div>
                <div className={`m-value ${kpis?.score_progression_class ?? "m-warn"}`}>{rv(kpis?.score_progression_rate ?? kpis?.score_progression)}</div>
                <div className="m-sub"><span className="up" dangerouslySetInnerHTML={{ __html: kpis?.score_progression_trend ?? "&#9650; +2 pts MoM" }} /></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(kpis?.score_progression_confidence ?? "probable").toLowerCase()}`}>{(kpis?.score_progression_confidence ?? "PROBABLE").toUpperCase()}</span></div>
                <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Retargeting Audience Sync</div>
                <div className={`m-value ${kpis?.retargeting_sync_class ?? "m-warn"}`}>{rv(kpis?.retargeting_sync)}</div>
                <div className="m-sub"><span className="up" dangerouslySetInnerHTML={{ __html: kpis?.retargeting_sync_trend ?? "&#9650; +6 pts MoM" }} /></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(kpis?.retargeting_sync_confidence ?? "probable").toLowerCase()}`}>{(kpis?.retargeting_sync_confidence ?? "PROBABLE").toUpperCase()}</span></div>
                <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Lifecycle Attribution</div>
                <div className={`m-value ${kpis?.lifecycle_attribution_class ?? "m-bad"}`}>{rv(kpis?.lifecycle_attribution)}</div>
                <div className="m-sub"><span className={kpis?.lifecycle_attribution_trend_dir ?? "down"} dangerouslySetInnerHTML={{ __html: kpis?.lifecycle_attribution_trend ?? "3 blockers active" }} /></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(kpis?.lifecycle_attribution_confidence ?? "confirmed").toLowerCase()}`}>{(kpis?.lifecycle_attribution_confidence ?? "CONFIRMED").toUpperCase()}</span></div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Newsletter Segmentation</div>
                <div className={`m-value ${kpis?.newsletter_segmentation_class ?? "m-warn"}`}>{rv(kpis?.newsletter_segmentation)}</div>
                <div className="m-sub"><span className="up" dangerouslySetInnerHTML={{ __html: kpis?.newsletter_segmentation_trend ?? "&#9650; +9 pts MoM" }} /></div>
                <div style={{ marginTop: "6px" }}><span className={`conf-${(kpis?.newsletter_segmentation_confidence ?? "probable").toLowerCase()}`}>{(kpis?.newsletter_segmentation_confidence ?? "PROBABLE").toUpperCase()}</span></div>
                <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
              </div>
            </div>

            <div style={{ background: "#fff5f5", border: "1px solid rgba(211,47,47,.2)", borderLeft: "4px solid var(--red)", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "var(--navy)" }}>
              &#9888; Lifecycle Attribution Integrity: Diagnose &mdash; gclid pass-through, user ID persistence, and offline broker tagging still limit board-safe lifecycle ROI reporting. Do not present lifecycle ROI as CONFIRMED to Jeffrey.
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-title">Top Opportunities This Week</div>
                <div className="opp-card pinned" style={{ marginBottom: "8px" }}>
                  <div className="opp-header">
                    <div className="opp-signal">[Score 95] Form-start users not being recovered aggressively enough</div>
                    <div className="opp-badges"><span className="conf-confirmed">CONFIRMED</span><span className="pri-now">Now</span></div>
                  </div>
                  <div className="opp-gap">Day 1 recovery, Day 3 FAQ/process reassurance, Day 7 broker trust reinforcement &mdash; all need tightening.</div>
                </div>
                <div className="opp-card pinned" style={{ marginBottom: 0 }}>
                  <div className="opp-header">
                    <div className="opp-signal">[Score 93] Model-interest nurture not deep enough on top aircraft pathways</div>
                    <div className="opp-badges"><span className="conf-confirmed">CONFIRMED</span><span className="pri-now">Now</span></div>
                  </div>
                  <div className="opp-gap">Viewed-model and PDF-download users need full listings/specs/trends/new-listing progression across priority models.</div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Sequence Health Summary</div>
                <div className="soft-list">
                  {(sequences ?? []).map((s: any, i: number) => (
                    <div className="soft-row" key={i}><span className="row-label">{s.name ?? "—"}</span><span className={`row-value ${s.value_class ?? ""}`} dangerouslySetInnerHTML={{ __html: s.summary ?? "—" }} /></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUDIENCES */}
        {activeTab === "audiences" && (
          <div id="tab-audiences" className="tab-content active">
            <div className="section-label mb-16">Audience Architecture &mdash; Tiered Segments</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Segment</th>
                    <th>Trigger Behavior</th>
                    <th>Score Range</th>
                    <th>Size (est.)</th>
                    <th>Sequence</th>
                    <th>Paid Sync</th>
                    <th>Issue</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(scoringTiers ?? []).map((t: any, i: number) => (
                    <tr key={i}>
                      <td className="td-primary">{t.segment ?? "—"}</td>
                      <td>{t.trigger ?? "—"}</td>
                      <td>{t.score_range ?? "—"}</td>
                      <td>{t.size ?? "—"}</td>
                      <td>{t.sequence ?? "—"}</td>
                      <td>{t.paid_sync ?? "—"}</td>
                      <td>{t.issue ?? "—"}</td>
                      <td><span className={`conf-${(t.confidence ?? "probable").toLowerCase()}`}>{(t.confidence ?? "PROBABLE").toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEQUENCES */}
        {activeTab === "sequences" && (
          <div id="tab-sequences" className="tab-content active">
            <div className="section-label mb-16">Sequence Performance</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Sequence</th>
                    <th>Trigger</th>
                    <th>Cadence</th>
                    <th>Goal</th>
                    <th>Assisted QI</th>
                    <th>Status</th>
                    <th>Issue</th>
                    <th>Action</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(performance ?? []).map((s: any, i: number) => (
                    <tr key={i}>
                      <td className="td-primary">{s.name ?? "—"}</td>
                      <td>{s.trigger ?? "—"}</td>
                      <td>{s.cadence ?? "—"}</td>
                      <td>{s.goal ?? "—"}</td>
                      <td className={s.qi_class ?? ""}>{s.assisted_qi ?? "—"}</td>
                      <td><span className={`status-pill status-${(s.status_class ?? "warn")}`}>{s.status ?? "—"}</span></td>
                      <td>{s.issue ?? "—"}</td>
                      <td>{s.action ?? "—"}</td>
                      <td><span className={`conf-${(s.confidence ?? "probable").toLowerCase()}`}>{(s.confidence ?? "PROBABLE").toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SCORING */}
        {activeTab === "scoring" && (
          <div id="tab-scoring" className="tab-content active">
            <div className="section-label mb-16">Behavioral Scoring Architecture</div>
            <div className="grid-3 mb-16">
              <div className="card-plain">
                <div className="card-title">Score 0&ndash;5 &mdash; Cold</div>
                <div className="soft-list">
                  <div className="soft-row"><span className="row-label">Behavior</span><span className="row-value">Single visit, no repeat</span></div>
                  <div className="soft-row"><span className="row-label">Cadence</span><span className="row-value">Newsletter / top-of-funnel only</span></div>
                  <div className="soft-row"><span className="row-label">Paid sync</span><span className="row-value">YouTube awareness only</span></div>
                </div>
              </div>
              <div className="card-plain" style={{ borderLeft: "4px solid var(--amber)" }}>
                <div className="card-title">Score 6&ndash;12 &mdash; Warm</div>
                <div className="soft-list">
                  <div className="soft-row"><span className="row-label">Behavior</span><span className="row-value">Multiple model views</span></div>
                  <div className="soft-row"><span className="row-label">Cadence</span><span className="row-value">Model interest reinforcement</span></div>
                  <div className="soft-row"><span className="row-label">Paid sync</span><span className="row-value">Google + Meta + YouTube</span></div>
                </div>
              </div>
              <div className="card-plain" style={{ borderLeft: "4px solid var(--green-dark)" }}>
                <div className="card-title">Score 13+ &mdash; Hot</div>
                <div className="soft-list">
                  <div className="soft-row"><span className="row-label">Behavior</span><span className="row-value">PDF download + model view 3+</span></div>
                  <div className="soft-row"><span className="row-label">Cadence</span><span className="row-value">Abandoned inquiry / high-urgency</span></div>
                  <div className="soft-row"><span className="row-label">Paid sync</span><span className="row-value">All channels &mdash; suppress after inquiry</span></div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-title">Scoring Gap &mdash; [Score 81] Score progression not yet operationalized in cadence control</div>
              <div className="opp-gap">Users are scored, but messaging and suppression still do not always adapt aggressively enough to score changes. Some sequence logic still looks more static than score-reactive.</div>
              <div className="note-text">Action: Tie email cadence, content density, and suppression logic more tightly to score-tier changes across all major sequences. Owner: Lifecycle Ops. Time to Impact: 2&ndash;4 weeks.</div>
            </div>
          </div>
        )}

        {/* RETARGETING SYNC */}
        {activeTab === "retargeting" && (
          <div id="tab-retargeting" className="tab-content active">
            <div className="section-label mb-16">Retargeting Audience Sync</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Segment</th>
                    <th>Destinations</th>
                    <th>Message Mirror</th>
                    <th>Issue</th>
                    <th>Action</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(retargetingSegments ?? []).map((r: any, i: number) => (
                    <tr key={i}>
                      <td className="td-primary">{r.segment ?? "—"}</td>
                      <td>{r.destinations ?? "—"}</td>
                      <td>{r.message_mirror ?? "—"}</td>
                      <td>{r.issue ?? "—"}</td>
                      <td>{r.action ?? "—"}</td>
                      <td><span className={`conf-${(r.confidence ?? "probable").toLowerCase()}`}>{(r.confidence ?? "PROBABLE").toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NEWSLETTER */}
        {activeTab === "newsletter" && (
          <div id="tab-newsletter" className="tab-content active">
            <div className="section-label mb-16">Newsletter Segmentation Status</div>
            <div className="card" style={{ marginBottom: "14px" }}>
              <div className="card-title">Segmentation Coverage &mdash; 61% &middot; Target: segment-first sends for all major categories</div>
              <div className="opp-gap">Moving away from one-newsletter-to-all. But some sends are still too broad. Piston, jet, finance, maintenance, and model-specific sends should diverge more clearly.</div>
              <div className="note-text">Action: Finalize segmented newsletter architecture and apply suppression rules so category-heavy users do not keep receiving irrelevant blasts. Owner: Lifecycle Lead. Time: 2&ndash;4 weeks.</div>
            </div>
            <div className="grid-3">
              {(newsletterSegments ?? []).map((ns: any, i: number) => (
                <div className="card-plain" key={i}>
                  <div className="card-title">{ns.name ?? "—"}</div>
                  <div className="soft-list">
                    <div className="soft-row"><span className="row-label">Audience</span><span className="row-value">{ns.audience ?? "—"}</span></div>
                    <div className="soft-row"><span className="row-label">Content</span><span className="row-value" dangerouslySetInnerHTML={{ __html: ns.content ?? "—" }} /></div>
                    <div className="soft-row"><span className="row-label">Status</span><span className={`row-value ${ns.status_class ?? ""}`} dangerouslySetInnerHTML={{ __html: ns.status ?? "—" }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ATTRIBUTION */}
        {activeTab === "attribution" && (
          <div id="tab-attribution" className="tab-content active">
            <div className="section-label mb-16">Attribution Layer Audit</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Layer</th>
                    <th>Status</th>
                    <th>Coverage</th>
                    <th>Issue</th>
                    <th>Next Move</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(attributionBlockers ?? []).map((a: any, i: number) => (
                    <tr key={i} style={a.highlight ? { background: "#fff5f5" } : {}}>
                      <td className="td-primary">{a.layer ?? "—"}</td>
                      <td><span className={`status-pill status-${a.status_class ?? "warn"}`}>{a.status ?? "—"}</span></td>
                      <td className={a.coverage_class ?? ""}>{a.coverage ?? "—"}</td>
                      <td>{a.issue ?? "—"}</td>
                      <td>{a.next_move ?? "—"}</td>
                      <td><span className={`conf-${(a.confidence ?? "probable").toLowerCase()}`}>{(a.confidence ?? "PROBABLE").toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TRUST */}
        {activeTab === "trust" && (
          <div id="tab-trust" className="tab-content active">
            <div className="grid-2">
              <div className="card">
                <div className="card-title">Lifecycle Trust Status</div>
                <div className="trust-module">
                  <div className="trust-module-title">Confirmed blockers</div>
                  <ul>
                    <li>gclid capture only 72% coverage &mdash; not yet universal</li>
                    <li>User ID persistence at 43% &mdash; biggest lifecycle measurement gap</li>
                    <li>Offline broker tagging at 29% &mdash; ROI claims remain partial</li>
                  </ul>
                </div>
                <div className="trust-module">
                  <div className="trust-module-title">Decision rules</div>
                  <ul>
                    <li>Lifecycle ROI should remain confidence-aware in all executive reporting</li>
                    <li>Email-assisted QI is PROBABLE &mdash; do not treat as CONFIRMED to Jeffrey</li>
                    <li>Return visit rate and score progression are CONFIRMED and safe to report</li>
                  </ul>
                </div>
              </div>
              <div className="card">
                <div className="card-title">Saved Views</div>
                <div className="saved-views-list">
                  <div className="saved-view-btn">
                    <div className="sv-name">Weekly Lifecycle Priorities</div>
                    <div className="sv-desc">Top sequence gaps, scoring drift, and nurture leaks.</div>
                  </div>
                  <div className="saved-view-btn">
                    <div className="sv-name">Abandoned Inquiry Recovery</div>
                    <div className="sv-desc">Form-start recovery and trust reinforcement flows.</div>
                  </div>
                  <div className="saved-view-btn">
                    <div className="sv-name">Attribution Risk</div>
                    <div className="sv-desc">Identity capture, gclid pass-through, and offline tagging gaps.</div>
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
