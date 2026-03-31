import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Topbar from "../components/layout/Topbar";
import { useRole } from "../contexts/RoleContext";
import { api } from "../services/api";

/** Safely extract a renderable value — guards against API returning objects instead of strings */
function rv(v: any, fallback = "—"): string {
  if (v == null) return fallback;
  if (typeof v === "object") return v?.value ?? v?.Value ?? v?.title ?? v?.Title ?? v?.name ?? v?.Name ?? fallback;
  return String(v);
}

type TabKey =
  | "overview"
  | "pillars"
  | "mix"
  | "articles"
  | "production"
  | "refresh"
  | "attribution"
  | "trust";

interface SavedView {
  n: string;
  d: string;
}

const savedViewsByRole: Record<string, SavedView[]> = {
  casey: [
    { n: "Weekly Content Priorities", d: "Pillar gaps, top leaking articles, and next production moves." },
    { n: "80/20 Compliance", d: "Evergreen vs news mix, velocity, and editorial balance." },
    { n: "Jadda Output Control", d: "Jadda production tracking, topic spread, and conversion contribution." },
  ],
  clay: [
    { n: "Executive Content Efficiency", d: "Pillar performance, QI assist, and production utilization." },
    { n: "Attribution Risk", d: "Content-to-QI confidence, assist-path blockers, and diagnostic-only areas." },
    { n: "Channel Reinforcement", d: "How content supports SEO, email, retargeting, and authority." },
  ],
  jeffrey: [
    { n: "Board-Safe Content View", d: "Confirmed pillar performance and strategic mix only." },
    { n: "Authority Growth", d: "Evergreen authority expansion and moat-building summary." },
    { n: "Confirmed Top Performers", d: "Highest-confidence articles and themes." },
  ],
};

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "pillars", label: "Pillars" },
  { key: "mix", label: "Mix Compliance" },
  { key: "articles", label: "Articles" },
  { key: "production", label: "Production (Jadda)" },
  { key: "refresh", label: "Refresh Queue" },
  { key: "attribution", label: "Attribution" },
  { key: "trust", label: "Trust" },
];

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const { currentRole } = useRole();

  const views = savedViewsByRole[currentRole] ?? savedViewsByRole.casey;

  // ─── API Queries ───
  const { data: kpis, isLoading: kpisLoading } = useQuery({ queryKey: ["content-kpis"], queryFn: api.getContentKpis });
  const { data: articles } = useQuery({ queryKey: ["content-articles"], queryFn: api.getContentArticles });
  const { data: pillars } = useQuery({ queryKey: ["content-pillars"], queryFn: api.getContentPillars });
  const { data: refreshQueue } = useQuery({ queryKey: ["content-refresh-queue"], queryFn: api.getContentRefreshQueue });
  const { data: attributionPaths } = useQuery({ queryKey: ["content-attribution-paths"], queryFn: api.getContentAttributionPaths });
  const { data: _productionBalance } = useQuery({ queryKey: ["content-production-balance"], queryFn: api.getContentProductionBalance });

  return (
    <>
      <Topbar pageTitle="Content &amp; Channel" />

      <div className="page-hero">
        <div className="hero-eyebrow">GlobalAir.com / Av/IntelOS</div>
        <h1 className="hero-title">Content &amp; Channel Performance</h1>
        <p className="hero-sub">
          Evergreen/news mix compliance, pillar performance, article-level
          attribution, Jadda output tracking, content refresh queue, and
          editorial intelligence.
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

      <div className="page-body">
        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div id="tab-overview" className="tab-content active">
            <div className="section-label mb-16">Content Performance KPIs</div>
            {kpisLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
            <div className="metric-grid-6 mb-20">
              <div className="metric-card">
                <div className="m-label">Evergreen Mix</div>
                <div className={`m-value ${kpis?.evergreen_mix_class ?? "m-warn"}`}>{rv(kpis?.evergreen_mix)}</div>
                <div className="m-sub">
                  <span className="up" dangerouslySetInnerHTML={{ __html: kpis?.evergreen_mix_trend ?? "&#9650; +6 pts MoM &middot; target 80%" }} />
                </div>
                <div style={{ marginTop: "6px" }}>
                  <span className={`conf-${(kpis?.evergreen_mix_confidence ?? "confirmed").toLowerCase()}`}>{(kpis?.evergreen_mix_confidence ?? "CONFIRMED").toUpperCase()}</span>
                </div>
                <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">News Mix</div>
                <div className={`m-value ${kpis?.news_mix_class ?? "m-warn"}`}>{rv(kpis?.news_mix)}</div>
                <div className="m-sub">
                  <span className="up" dangerouslySetInnerHTML={{ __html: kpis?.news_mix_trend ?? "&#9660; -6 pts MoM &middot; target 20%" }} />
                </div>
                <div style={{ marginTop: "6px" }}>
                  <span className={`conf-${(kpis?.news_mix_confidence ?? "confirmed").toLowerCase()}`}>{(kpis?.news_mix_confidence ?? "CONFIRMED").toUpperCase()}</span>
                </div>
                <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Content-Assisted QI</div>
                <div className="m-value">{rv(kpis?.content_assisted_qi)}</div>
                <div className="m-sub">
                  <span className="up" dangerouslySetInnerHTML={{ __html: kpis?.content_assisted_qi_trend ?? "&#9650; +12.8% MoM" }} />
                </div>
                <div style={{ marginTop: "6px" }}>
                  <span className={`conf-${(kpis?.content_assisted_qi_confidence ?? "probable").toLowerCase()}`}>{(kpis?.content_assisted_qi_confidence ?? "PROBABLE").toUpperCase()}</span>
                </div>
                <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Production Velocity</div>
                <div className="m-value">{rv(kpis?.production_velocity)}</div>
                <div className="m-sub">
                  <span className="up" dangerouslySetInnerHTML={{ __html: kpis?.production_velocity_trend ?? "&#9650; +2 articles" }} />
                </div>
                <div style={{ marginTop: "6px" }}>
                  <span className={`conf-${(kpis?.production_velocity_confidence ?? "confirmed").toLowerCase()}`}>{(kpis?.production_velocity_confidence ?? "CONFIRMED").toUpperCase()}</span>
                </div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">Attribution Confidence</div>
                <div className={`m-value ${kpis?.attribution_confidence_class ?? "m-bad"}`}>{rv(kpis?.attribution_confidence_value ?? kpis?.attribution_confidence)}</div>
                <div className="m-sub">{kpis?.attribution_confidence_sub ?? "2 blockers active"}</div>
                <div style={{ marginTop: "6px" }}>
                  <span className={`conf-${(kpis?.attribution_confidence_level ?? "confirmed").toLowerCase()}`}>{(kpis?.attribution_confidence_level ?? "CONFIRMED").toUpperCase()}</span>
                </div>
                <div className="m-date">As of Mar 30, 2026</div>
              </div>
              <div className="metric-card">
                <div className="m-label">CTA Module Coverage</div>
                <div className={`m-value ${kpis?.cta_coverage_class ?? "m-warn"}`}>{rv(kpis?.cta_coverage)}</div>
                <div className="m-sub">
                  <span className="up" dangerouslySetInnerHTML={{ __html: kpis?.cta_coverage_trend ?? "&#9650; +9 pts MoM" }} />
                </div>
                <div style={{ marginTop: "6px" }}>
                  <span className={`conf-${(kpis?.cta_coverage_confidence ?? "probable").toLowerCase()}`}>{(kpis?.cta_coverage_confidence ?? "PROBABLE").toUpperCase()}</span>
                </div>
                <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
              </div>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-title">Top Articles — Recent Performance</div>
                <div className="soft-list">
                  {(articles ?? []).slice(0, 5).map((a: any, i: number) => (
                    <div className="soft-row" key={i}>
                      <span className="row-label">{a.title ?? "—"}</span>
                      <span className={`row-value ${a.value_class ?? ""}`} dangerouslySetInnerHTML={{ __html: a.summary ?? "—" }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-title">Priority Opportunities This Sprint</div>
                <div className="opp-card pinned" style={{ marginBottom: "8px" }}>
                  <div className="opp-header">
                    <div className="opp-signal">[Score 94] Content mix still below 80% evergreen target</div>
                    <div className="opp-badges">
                      <span className="conf-confirmed">CONFIRMED</span>
                      <span className="pri-now">Now</span>
                    </div>
                  </div>
                  <div className="opp-gap">
                    Cap reactive/news output and redirect editorial effort into
                    evergreen buying guides, operating cost pages, and comparison
                    clusters.
                  </div>
                </div>
                <div className="opp-card pinned" style={{ marginBottom: 0 }}>
                  <div className="opp-header">
                    <div className="opp-signal">
                      [Score 91] High-performing content pages still under-route
                      into listings and inquiries
                    </div>
                    <div className="opp-badges">
                      <span className="conf-probable">PROBABLE</span>
                      <span className="pri-now">Now</span>
                    </div>
                  </div>
                  <div className="opp-gap">
                    Standardize CTA modules, related listings, comparison links,
                    and email capture on every high-performing evergreen article.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PILLARS ── */}
        {activeTab === "pillars" && (
          <div id="tab-pillars" className="tab-content active">
            <div className="section-label mb-16">Content Pillar Performance</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pillar</th>
                    <th>Articles</th>
                    <th>Sessions</th>
                    <th>Engagement</th>
                    <th>Conversions</th>
                    <th>Evergreen %</th>
                    <th>Role</th>
                    <th>Issue</th>
                    <th>Action</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(pillars ?? []).map((p: any, i: number) => (
                    <tr key={i}>
                      <td className={`td-primary ${p.name_class ?? ""}`}>{p.pillar ?? "—"}</td>
                      <td className={p.articles_class ?? ""}>{p.articles ?? "—"}</td>
                      <td className={p.sessions_class ?? ""}>{p.sessions ?? "—"}</td>
                      <td className={p.engagement_class ?? ""}>{p.engagement ?? "—"}</td>
                      <td className={p.conversions_class ?? ""}>{p.conversions ?? "—"}</td>
                      <td className={p.evergreen_class ?? ""}>{p.evergreen_pct ?? "—"}</td>
                      <td>{p.role ?? "—"}</td>
                      <td>{p.issue ?? "—"}</td>
                      <td>{p.action ?? "—"}</td>
                      <td><span className={`conf-${(p.confidence ?? "confirmed").toLowerCase()}`}>{(p.confidence ?? "CONFIRMED").toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── MIX COMPLIANCE ── */}
        {activeTab === "mix" && (
          <div id="tab-mix" className="tab-content active">
            <div className="section-label mb-16">80/20 Evergreen Mix Compliance</div>
            <div className="grid-2 mb-16">
              <div className="card">
                <div className="card-title">Current Mix vs Target</div>
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "5px" }}>
                    Evergreen — Current 74% &middot; Target 80%+
                  </div>
                  <div className="prog-bar">
                    <div className="prog-fill prog-amber" style={{ width: "74%" }} />
                  </div>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "5px" }}>
                    News / Reactive — Current 26% &middot; Target &le;20%
                  </div>
                  <div className="prog-bar">
                    <div className="prog-fill prog-red" style={{ width: "26%" }} />
                  </div>
                </div>
                <div className="note-text">
                  Progress is positive but still below doctrine target. News is
                  easier to publish quickly while evergreen production depends on
                  structured templates and topic discipline.
                </div>
              </div>
              <div className="card">
                <div className="card-title">Mix Opportunity — [Score 94]</div>
                <div className="soft-list">
                  <div className="soft-row">
                    <span className="row-label">Conservative lift</span>
                    <span className="row-value">+4 pts evergreen mix</span>
                  </div>
                  <div className="soft-row">
                    <span className="row-label">Expected lift</span>
                    <span className="row-value m-good">+8 pts evergreen mix</span>
                  </div>
                  <div className="soft-row">
                    <span className="row-label">Aggressive lift</span>
                    <span className="row-value">+12 pts evergreen mix</span>
                  </div>
                  <div className="soft-row">
                    <span className="row-label">Owner</span>
                    <span className="row-value">Content Lead</span>
                  </div>
                  <div className="soft-row">
                    <span className="row-label">Blocker</span>
                    <span className="row-value">Reactive requests still interrupt production</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ARTICLES ── */}
        {activeTab === "articles" && (
          <div id="tab-articles" className="tab-content active">
            <div className="section-label mb-16">Article Performance — Recent 30 Days</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Pillar</th>
                    <th>Published</th>
                    <th>Sessions</th>
                    <th>Engagement</th>
                    <th>Conversions</th>
                    <th>Assist Rate</th>
                    <th>Issue</th>
                    <th>Action</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(articles ?? []).map((a: any, i: number) => (
                    <tr key={i} style={a.highlight ? { background: "#fff5f5" } : {}}>
                      <td className="td-primary">{a.title ?? "—"}</td>
                      <td>{a.pillar ?? "—"}</td>
                      <td>{a.published ?? "—"}</td>
                      <td>{a.sessions ?? "—"}</td>
                      <td className={a.engagement_class ?? ""}>{a.engagement ?? "—"}</td>
                      <td className={a.conversions_class ?? ""}>{a.conversions ?? "—"}</td>
                      <td className={a.assist_class ?? ""}>{a.assist_rate ?? "—"}</td>
                      <td>{a.issue ?? "—"}</td>
                      <td>{a.action ?? "—"}</td>
                      <td><span className={`conf-${(a.confidence ?? "probable").toLowerCase()}`}>{(a.confidence ?? "PROBABLE").toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PRODUCTION (JADDA) ── */}
        {activeTab === "production" && (
          <div id="tab-production" className="tab-content active">
            <div className="section-label mb-16">Jadda Production Tracking — Weekly Output</div>
            <div className="table-wrap mb-16">
              <table>
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Evergreen Articles</th>
                    <th>News Articles</th>
                    <th>Primary Topics</th>
                    <th>Assisted Conversions</th>
                    <th>Note</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: "#fff5f5" }}>
                    <td>W1</td>
                    <td className="m-bad">1</td>
                    <td className="m-bad">2</td>
                    <td>News / market wrap / buyer guide</td>
                    <td>3</td>
                    <td>Output still leaned reactive.</td>
                    <td><span className="conf-confirmed">CONFIRMED</span></td>
                  </tr>
                  <tr>
                    <td>W2</td>
                    <td className="m-warn">2</td>
                    <td>1</td>
                    <td>Operating costs / comparisons / news</td>
                    <td className="m-warn">6</td>
                    <td>Mix improved.</td>
                    <td><span className="conf-confirmed">CONFIRMED</span></td>
                  </tr>
                  <tr>
                    <td>W3</td>
                    <td className="m-good">3</td>
                    <td className="m-good">0</td>
                    <td>Buying guide / ownership / comparison</td>
                    <td className="m-good">9</td>
                    <td>Best thematic balance so far.</td>
                    <td><span className="conf-probable">PROBABLE</span></td>
                  </tr>
                  <tr>
                    <td>W4</td>
                    <td className="m-warn">1</td>
                    <td className="m-warn">1</td>
                    <td>Market analysis / event recap</td>
                    <td className="m-warn">4</td>
                    <td>Balanced but lower commercial yield.</td>
                    <td><span className="conf-probable">PROBABLE</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="card-title">Production Guidance for Jadda — Priority Redirect</div>
              <div className="action-block">
                <div className="action-block-title">Evergreen priority (target 3-4/week)</div>
                <ul>
                  <li>Buying guides by aircraft model (Cessna 172, SR22, Archer, Bonanza A36)</li>
                  <li>Operating cost breakdowns for priority piston models</li>
                  <li>Comparison articles (SR22 vs A36, 172 vs Archer, etc.)</li>
                  <li>Ownership guides with annual cost, insurance, and maintenance content</li>
                </ul>
              </div>
              <div className="action-block">
                <div className="action-block-title">News cap (max 1/week)</div>
                <ul>
                  <li>Only publish news articles that tie into evergreen follow-up content</li>
                  <li>Event recaps must link to market insight articles, not stand alone</li>
                  <li>Industry news must include a buyer-relevant angle with CTA or related listing</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── REFRESH QUEUE ── */}
        {activeTab === "refresh" && (
          <div id="tab-refresh" className="tab-content active">
            <div className="section-label mb-16">Content Refresh Queue — Aging Evergreen Winners</div>
            <div className="card" style={{ marginBottom: "14px" }}>
              <div className="card-title">
                [Score 88] Monthly refresh queue — faster ROI than net-new production
              </div>
              <div className="opp-gap">
                Refresh work is not yet treated as a first-class editorial queue
                beside net-new production. Refreshes are often faster ROI than
                net-new content creation. Run a monthly refresh queue for aging
                evergreen winners with CTA, comparison, pricing-range, and
                internal-link updates.
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Pillar</th>
                    <th>Age</th>
                    <th>Refresh Type</th>
                    <th>Priority</th>
                    <th>Expected Lift</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(refreshQueue ?? []).map((r: any, i: number) => (
                    <tr key={i}>
                      <td className="td-primary">{r.title ?? "—"}</td>
                      <td>{r.pillar ?? "—"}</td>
                      <td>{r.age ?? "—"}</td>
                      <td>{r.refresh_type ?? "—"}</td>
                      <td><span className={`pri-${(r.priority ?? "now").toLowerCase()}`}>{r.priority ?? "Now"}</span></td>
                      <td>{r.expected_lift ?? "—"}</td>
                      <td><span className={`conf-${(r.confidence ?? "confirmed").toLowerCase()}`}>{(r.confidence ?? "CONFIRMED").toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ATTRIBUTION ── */}
        {activeTab === "attribution" && (
          <div id="tab-attribution" className="tab-content active">
            <div className="section-label mb-16">Content Attribution Path Analysis</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Attribution Path</th>
                    <th>Strength</th>
                    <th>Confidence</th>
                    <th>Issue</th>
                    <th>Next Move</th>
                  </tr>
                </thead>
                <tbody>
                  {(attributionPaths ?? []).map((a: any, i: number) => (
                    <tr key={i} style={a.highlight ? { background: "#fff5f5" } : {}}>
                      <td className="td-primary" dangerouslySetInnerHTML={{ __html: a.path ?? "—" }} />
                      <td className={a.strength_class ?? ""}>{a.strength ?? "—"}</td>
                      <td><span className={`conf-${(a.confidence ?? "probable").toLowerCase()}`}>{(a.confidence ?? "PROBABLE").toUpperCase()}</span></td>
                      <td>{a.issue ?? "—"}</td>
                      <td>{a.next_move ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TRUST ── */}
        {activeTab === "trust" && (
          <div id="tab-trust" className="tab-content active">
            <div className="grid-2">
              <div className="card">
                <div className="card-title">Content Attribution Trust Status</div>
                <div className="trust-module">
                  <div className="trust-module-title">Confirmed blockers</div>
                  <ul>
                    <li>Content-assisted QI attribution remains partial — not yet board-safe</li>
                    <li>Assist-path measurement is improving but CRM matching still partial</li>
                    <li>Some upper-funnel articles may be over-credited without stronger path validation</li>
                  </ul>
                </div>
                <div className="trust-module">
                  <div className="trust-module-title">Decision rules</div>
                  <ul>
                    <li>Keep content ROI labels confidence-aware — separate confirmed article wins from directional assist signals</li>
                    <li>News / Industry pillar conversions are too low to justify current production share</li>
                    <li>Do not present content-assisted QI as CONFIRMED to Jeffrey</li>
                  </ul>
                </div>
              </div>
              <div className="card">
                <div className="card-title">Saved Views</div>
                <div className="saved-views-list">
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
        )}
      </div>
    </>
  );
}
