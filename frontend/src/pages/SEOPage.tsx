import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import Topbar from "../components/layout/Topbar";

type TabKey =
  | "overview"
  | "architecture"
  | "intent"
  | "linking"
  | "content"
  | "technical"
  | "competitive"
  | "measurement";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "architecture", label: "Architecture" },
  { key: "intent", label: "Category & Intent" },
  { key: "linking", label: "Model Hubs" },
  { key: "content", label: "Templates" },
  { key: "technical", label: "Technical" },
  { key: "competitive", label: "Competitive" },
  { key: "measurement", label: "Trust" },
];

export default function SEOPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const { data: status, isLoading: statusLoading } = useQuery({ queryKey: ["seo-status"], queryFn: api.getSeoStatus });
  const { data: plays, isLoading: playsLoading } = useQuery({ queryKey: ["seo-plays"], queryFn: api.getSeoPlays });
  const { data: categoryMatrix, isLoading: catLoading } = useQuery({ queryKey: ["seo-category-matrix"], queryFn: api.getSeoCategoryMatrix });
  const { data: modelHubs, isLoading: hubsLoading } = useQuery({ queryKey: ["seo-model-hubs"], queryFn: api.getSeoModelHubs });
  const { data: technicalControls, isLoading: techLoading } = useQuery({ queryKey: ["seo-technical-controls"], queryFn: api.getSeoTechnicalControls });
  const { data: competitiveOpportunity, isLoading: compLoading } = useQuery({ queryKey: ["seo-competitive-opportunity"], queryFn: api.getSeoCompetitiveOpportunity });

  const isLoading = statusLoading || playsLoading || catLoading || hubsLoading || techLoading || compLoading;

  return (
    <>
      <Topbar pageTitle="SEO Playbook" />

      <div className="page-hero">
        <div className="hero-eyebrow">GlobalAir.com / Av/IntelOS</div>
        <h1 className="hero-title">SEO Playbook Command</h1>
        <p className="hero-sub">
          Category prioritization, model hub buildout, internal linking
          governance, content templates, technical SEO controls, and competitive
          attack strategy.
        </p>
      </div>

      <div className="tab-bar">
        <div className="tab-bar-inner">
          {tabs.map((t) => (
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

      {isLoading && <div style={{ textAlign: "center", padding: "32px 0", color: "var(--navy)", fontSize: 14 }}>Loading data...</div>}
      <div className="page-body">
        {/* ───────────── OVERVIEW ───────────── */}
        {activeTab === "overview" && (
          <div>
            <div className="section-label mb-16">SEO Playbook KPIs</div>
            <div className="metric-grid-5 mb-20">
              <div className="metric-card">
                <div className="m-label">Priority Categories Locked</div>
                <div className="m-value">{status?.categories_locked ?? "—"}</div>
                <div className="m-sub">{status?.categories_sub ?? "—"}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${status?.categories_confidence?.toLowerCase() ?? "confirmed"}`}>{status?.categories_confidence ?? "—"}</span>
                </div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Model Hubs in Build Queue</div>
                <div className="m-value m-warn">{status?.model_hubs_count ?? "—"}</div>
                <div className="m-sub">
                  <span className={status?.model_hubs_trend_direction === "up" ? "up" : "down"}>{status?.model_hubs_trend_direction === "up" ? "▲" : "▼"} {status?.model_hubs_trend ?? "—"}</span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${status?.model_hubs_confidence?.toLowerCase() ?? "probable"}`}>{status?.model_hubs_confidence ?? "—"}</span>
                </div>
                <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Structured Page Velocity</div>
                <div className="m-value">{status?.page_velocity ?? "—"}</div>
                <div className="m-sub">{status?.page_velocity_sub ?? "—"}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${status?.page_velocity_confidence?.toLowerCase() ?? "confirmed"}`}>{status?.page_velocity_confidence ?? "—"}</span>
                </div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Internal Linking Risk</div>
                <div className="m-value m-warn">{status?.linking_risk ?? "—"}</div>
                <div className="m-sub">{status?.linking_risk_sub ?? "—"}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${status?.linking_risk_confidence?.toLowerCase() ?? "probable"}`}>{status?.linking_risk_confidence ?? "—"}</span>
                </div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Technical SEO Safety</div>
                <div className="m-value m-bad">{status?.technical_safety ?? "—"}</div>
                <div className="m-sub">{status?.technical_safety_sub ?? "—"}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`conf-${status?.technical_safety_confidence?.toLowerCase() ?? "confirmed"}`}>{status?.technical_safety_confidence ?? "—"}</span>
                </div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-title">Priority Plays — This Sprint</div>
                {(plays ?? []).filter((p: any) => p.priority === "Now").slice(0, 3).map((play: any, i: number) => (
                  <div className="opp-card pinned" style={{ marginBottom: i < 2 ? 8 : 0 }} key={i}>
                    <div className="opp-header">
                      <div className="opp-signal">
                        [Score {play.score ?? "—"}] {play.signal ?? "—"}
                      </div>
                      <div className="opp-badges">
                        <span className={`conf-${play.confidence?.toLowerCase() ?? "confirmed"}`}>{play.confidence ?? "—"}</span>
                        <span className={`pri-${play.priority?.toLowerCase() ?? "now"}`}>{play.priority ?? "—"}</span>
                      </div>
                    </div>
                    <div className="opp-gap">{play.gap ?? "—"}</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-title">Category Priority Matrix</div>
                <div className="soft-list">
                  {(categoryMatrix ?? []).map((cat: any, i: number) => (
                    <div className="soft-row" key={i}>
                      <span className="row-label">{cat.category ?? "—"}</span>
                      <span className={`row-value${cat.value_class ? ` ${cat.value_class}` : ""}`}>
                        {cat.summary ?? "—"} ·{" "}
                        <span className={`conf-${cat.confidence?.toLowerCase() ?? "probable"}`}>{cat.confidence ?? "—"}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───────────── ARCHITECTURE ───────────── */}
        {activeTab === "architecture" && (
          <div>
            <div className="section-label mb-16">
              SEO Plays — Full Doctrine
            </div>

            {(plays ?? []).map((play: any, i: number) => (
              <div className={`opp-card${play.pinned ? " pinned" : ""}`} key={i}>
                <div className="opp-header">
                  <div className="opp-signal">
                    [Score {play.score ?? "—"}] {play.signal ?? "—"}
                  </div>
                  <div className="opp-badges">
                    {play.badge && <span className={`badge-${play.badge_class ?? "organic"}`}>{play.badge}</span>}
                    <span className={`conf-${play.confidence?.toLowerCase() ?? "probable"}`}>{play.confidence ?? "—"}</span>
                    <span className={`pri-${play.priority?.toLowerCase() ?? "next"}`}>{play.priority ?? "—"}</span>
                  </div>
                </div>
                <div className="opp-gap">{play.gap ?? "—"}</div>
                {play.meta && (
                  <div className="opp-meta">
                    {play.meta.map((m: any, j: number) => (
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

        {/* ───────────── CATEGORY & INTENT ───────────── */}
        {activeTab === "intent" && (
          <div>
            <div className="section-label mb-16">
              Category Priority Scoring
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Revenue Contribution</th>
                    <th>Listing Volume</th>
                    <th>Broker Concentration</th>
                    <th>Competitive Gap</th>
                    <th>Organic Difficulty</th>
                    <th>PPC CPQI Signal</th>
                    <th>Recommendation</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(categoryMatrix ?? []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="td-primary">{row.category ?? "—"}</td>
                      <td className={row.revenue_class ?? ""}>{row.revenue_contribution ?? "—"}</td>
                      <td className={row.listing_class ?? ""}>{row.listing_volume ?? "—"}</td>
                      <td className={row.broker_class ?? ""}>{row.broker_concentration ?? "—"}</td>
                      <td className={row.gap_class ?? ""}>{row.competitive_gap ?? "—"}</td>
                      <td className={row.difficulty_class ?? ""}>{row.organic_difficulty ?? "—"}</td>
                      <td>{row.ppc_cpqi_signal ?? "—"}</td>
                      <td className={row.recommendation_class ?? ""}>{row.recommendation ?? "—"}</td>
                      <td><span className={`conf-${row.confidence?.toLowerCase() ?? "probable"}`}>{row.confidence ?? "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ───────────── MODEL HUBS ───────────── */}
        {activeTab === "linking" && (
          <div>
            <div className="section-label mb-16">Model Hub Status</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Commercial Page</th>
                    <th>Research Coverage</th>
                    <th>Link Depth</th>
                    <th>Priority</th>
                    <th>Action</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(modelHubs ?? []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="td-primary">{row.model ?? "—"}</td>
                      <td className={row.commercial_class ?? ""}>{row.commercial_page ?? "—"}</td>
                      <td className={row.research_class ?? ""}>{row.research_coverage ?? "—"}</td>
                      <td className={row.link_depth_class ?? ""}>{row.link_depth ?? "—"}</td>
                      <td><span className={`pri-${row.priority?.toLowerCase() ?? "next"}`}>{row.priority ?? "—"}</span></td>
                      <td>{row.action ?? "—"}</td>
                      <td><span className={`conf-${row.confidence?.toLowerCase() ?? "probable"}`}>{row.confidence ?? "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ───────────── TEMPLATES ───────────── */}
        {activeTab === "content" && (
          <div>
            <div className="section-label mb-16">Content Template System</div>
            <div className="grid-3">
              <div className="card-plain">
                <div className="card-title">Model Page Template</div>
                <div className="soft-list">
                  <div className="soft-row">
                    <span className="row-label">Required sections</span>
                    <span className="row-value">9 sections</span>
                  </div>
                  <div className="soft-row">
                    <span className="row-label">Velocity target</span>
                    <span className="row-value">2–3 / month</span>
                  </div>
                  <div className="soft-row">
                    <span className="row-label">Role</span>
                    <span className="row-value">
                      Commercial + authority hub
                    </span>
                  </div>
                </div>
                <div className="note-text">
                  Overview · Key specs · Market price range · Performance data ·
                  Pros/cons · Ownership considerations · Related listings · FAQs
                  · Internal links
                </div>
              </div>

              <div className="card-plain">
                <div className="card-title">Comparison Template</div>
                <div className="soft-list">
                  <div className="soft-row">
                    <span className="row-label">Required sections</span>
                    <span className="row-value">5 sections</span>
                  </div>
                  <div className="soft-row">
                    <span className="row-label">Velocity target</span>
                    <span className="row-value">1–2 / month</span>
                  </div>
                  <div className="soft-row">
                    <span className="row-label">Role</span>
                    <span className="row-value">
                      Comparative decision support
                    </span>
                  </div>
                </div>
                <div className="note-text">
                  Performance comparison · Cost comparison · Ownership
                  differences · Buyer persona fit · Linked listings
                </div>
              </div>

              <div className="card-plain">
                <div className="card-title">Ownership Guide Template</div>
                <div className="soft-list">
                  <div className="soft-row">
                    <span className="row-label">Required sections</span>
                    <span className="row-value">6 sections</span>
                  </div>
                  <div className="soft-row">
                    <span className="row-label">Velocity target</span>
                    <span className="row-value">1–3 / month</span>
                  </div>
                  <div className="soft-row">
                    <span className="row-label">Role</span>
                    <span className="row-value">
                      Research-stage capture + nurture
                    </span>
                  </div>
                </div>
                <div className="note-text">
                  Annual cost breakdown · Insurance ranges · Hangar costs ·
                  Maintenance intervals · Fuel burn · Financing overview
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───────────── TECHNICAL ───────────── */}
        {activeTab === "technical" && (
          <div>
            <div className="section-label mb-16">Technical SEO Controls</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Control</th>
                    <th>Current State</th>
                    <th>Risk if Ignored</th>
                    <th>Action</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(technicalControls ?? []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="td-primary">{row.control ?? "—"}</td>
                      <td className={row.state_class ?? ""}>{row.current_state ?? "—"}</td>
                      <td>{row.risk_if_ignored ?? "—"}</td>
                      <td>{row.action ?? "—"}</td>
                      <td><span className={`conf-${row.confidence?.toLowerCase() ?? "probable"}`}>{row.confidence ?? "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ───────────── COMPETITIVE ───────────── */}
        {activeTab === "competitive" && (
          <div>
            <div className="section-label mb-16">
              Competitive SEO Attack Map
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Zone</th>
                    <th>Controller Likely Strength</th>
                    <th>GlobalAir Angle</th>
                    <th>Response</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(competitiveOpportunity ?? []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="td-primary">{row.zone ?? "—"}</td>
                      <td className={row.strength_class ?? ""}>{row.controller_strength ?? "—"}</td>
                      <td>{row.globalair_angle ?? "—"}</td>
                      <td className={row.response_class ?? ""}>{row.response ?? "—"}</td>
                      <td><span className={`conf-${row.confidence?.toLowerCase() ?? "probable"}`}>{row.confidence ?? "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ───────────── TRUST ───────────── */}
        {activeTab === "measurement" && (
          <div className="grid-2">
            <div className="card">
              <div className="card-title">SEO Trust Status</div>
              <div className="trust-module">
                <div className="trust-module-title">Doctrine constraints</div>
                <ul>
                  <li>
                    No orphan pages — every research page must route to
                    commercial paths
                  </li>
                  <li>
                    Quality over quantity — templates control production quality
                  </li>
                  <li>
                    Do not chase Controller everywhere — win on depth and
                    specificity
                  </li>
                </ul>
              </div>
              <div className="trust-module">
                <div className="trust-module-title">Measurement gaps</div>
                <ul>
                  <li>
                    Assist-path confidence from authority content still partial
                  </li>
                  <li>
                    Competitor overlap is directional outside core tracked
                    clusters
                  </li>
                  <li>
                    Some gap scoring still directional — not CONFIRMED
                  </li>
                </ul>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Saved Views</div>
              <div className="saved-views-list">
                <div className="saved-view-btn">
                  <div className="sv-name">Weekly SEO Priorities</div>
                  <div className="sv-desc">
                    Top model pages, internal linking fixes, and content engine
                    actions.
                  </div>
                </div>
                <div className="saved-view-btn">
                  <div className="sv-name">Model Hub Buildout</div>
                  <div className="sv-desc">
                    Commercial + research page system for priority models.
                  </div>
                </div>
                <div className="saved-view-btn">
                  <div className="sv-name">Controller Gap Strategy</div>
                  <div className="sv-desc">
                    Where GlobalAir should attack, defend, or ignore.
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
