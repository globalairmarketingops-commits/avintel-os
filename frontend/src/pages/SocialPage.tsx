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

type TabKey =
  | "overview"
  | "channels"
  | "buckets"
  | "listing"
  | "broker"
  | "events"
  | "loop"
  | "measurement";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "channels", label: "Channels" },
  { key: "buckets", label: "Content Buckets" },
  { key: "listing", label: "Opportunity Queue" },
  { key: "broker", label: "Broker Spotlight" },
  { key: "events", label: "Event Amplification" },
  { key: "loop", label: "Social Loop" },
  { key: "measurement", label: "Measurement" },
];

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  return (
    <>
      <Topbar pageTitle="Social Authority" />

      <div className="page-hero">
        <div className="hero-eyebrow">GlobalAir.com / Av/IntelOS</div>
        <h1 className="hero-title">Social Authority Command</h1>
        <p className="hero-sub">
          70/20/10 content compliance, channel performance, content bucket
          balance, broker spotlight system, event amplification, and
          social-to-lifecycle loop integrity.
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
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "channels" && <ChannelsTab />}
        {activeTab === "buckets" && <BucketsTab />}
        {activeTab === "listing" && <ListingTab />}
        {activeTab === "broker" && <BrokerTab />}
        {activeTab === "events" && <EventsTab />}
        {activeTab === "loop" && <LoopTab />}
        {activeTab === "measurement" && <MeasurementTab />}
      </div>
    </>
  );
}

/* ── Overview Tab ─────────────────────────────────────────────── */
function OverviewTab() {
  const { data: kpis, isLoading } = useQuery({ queryKey: ["social-kpis"], queryFn: api.getSocialKpis });
  const { data: contentBuckets } = useQuery({ queryKey: ["social-content-buckets"], queryFn: api.getSocialContentBuckets });

  return (
    <>
      <div className="section-label mb-16">Social Authority KPIs</div>
      {isLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
      <div className="metric-grid-6 mb-20">
        <div className="metric-card">
          <div className="m-label">Social-Assisted QI</div>
          <div className="m-value">{rv(kpis?.social_assisted_qi)}</div>
          <div className="m-sub">
            <span className="up" dangerouslySetInnerHTML={{ __html: kpis?.social_assisted_qi_trend ?? "&#9650; +8.4% MoM" }} />
          </div>
          <div style={{ marginTop: 6 }}>
            <span className={`conf-${(kpis?.social_assisted_qi_confidence ?? "probable").toLowerCase()}`}>{(kpis?.social_assisted_qi_confidence ?? "PROBABLE").toUpperCase()}</span>
          </div>
          <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
        </div>
        <div className="metric-card">
          <div className="m-label">70/20/10 Compliance</div>
          <div className={`m-value ${kpis?.compliance_class ?? "m-warn"}`}>{rv(kpis?.compliance ?? kpis?.content_mix_compliance)}</div>
          <div className="m-sub">{kpis?.compliance_sub ?? "Authority mix close"}</div>
          <div style={{ marginTop: 6 }}>
            <span className={`conf-${(kpis?.compliance_confidence ?? "confirmed").toLowerCase()}`}>{(kpis?.compliance_confidence ?? "CONFIRMED").toUpperCase()}</span>
          </div>
          <div className="m-date">As of Mar 30, 2026</div>
        </div>
        <div className="metric-card">
          <div className="m-label">YouTube Long-Form Velocity</div>
          <div className={`m-value ${kpis?.youtube_velocity_class ?? "m-bad"}`}>{rv(kpis?.youtube_velocity)}</div>
          <div className="m-sub">{kpis?.youtube_velocity_sub ?? "Target: 2+/mo"}</div>
          <div style={{ marginTop: 6 }}>
            <span className={`conf-${(kpis?.youtube_velocity_confidence ?? "confirmed").toLowerCase()}`}>{(kpis?.youtube_velocity_confidence ?? "CONFIRMED").toUpperCase()}</span>
          </div>
          <div className="m-date">As of Mar 30, 2026</div>
        </div>
        <div className="metric-card">
          <div className="m-label">Broker Spotlight Coverage</div>
          <div className={`m-value ${kpis?.broker_spotlight_class ?? "m-warn"}`}>{rv(kpis?.broker_spotlight ?? kpis?.broker_spotlight_coverage)}</div>
          <div className="m-sub">
            <span className="up" dangerouslySetInnerHTML={{ __html: kpis?.broker_spotlight_trend ?? "&#9650; +1 broker MoM" }} />
          </div>
          <div style={{ marginTop: 6 }}>
            <span className={`conf-${(kpis?.broker_spotlight_confidence ?? "probable").toLowerCase()}`}>{(kpis?.broker_spotlight_confidence ?? "PROBABLE").toUpperCase()}</span>
          </div>
          <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
        </div>
        <div className="metric-card">
          <div className="m-label">Email Capture from Social</div>
          <div className={`m-value ${kpis?.email_capture_class ?? "m-warn"}`}>{rv(kpis?.email_capture ?? kpis?.email_capture_rate)}</div>
          <div className="m-sub">
            <span className="up" dangerouslySetInnerHTML={{ __html: kpis?.email_capture_trend ?? "&#9650; +0.9 pts MoM" }} />
          </div>
          <div style={{ marginTop: 6 }}>
            <span className={`conf-${(kpis?.email_capture_confidence ?? "probable").toLowerCase()}`}>{(kpis?.email_capture_confidence ?? "PROBABLE").toUpperCase()}</span>
          </div>
          <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
        </div>
        <div className="metric-card">
          <div className="m-label">Authority Positioning Integrity</div>
          <div className={`m-value ${kpis?.authority_class ?? "m-bad"}`}>{rv(kpis?.authority ?? kpis?.authority_integrity)}</div>
          <div className="m-sub">{kpis?.authority_sub ?? "2 channel drifts active"}</div>
          <div style={{ marginTop: 6 }}>
            <span className={`conf-${(kpis?.authority_confidence ?? "confirmed").toLowerCase()}`}>{(kpis?.authority_confidence ?? "CONFIRMED").toUpperCase()}</span>
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
        &#9888; Authority Drift: Some channels still behave too much like listing
        repost feeds instead of aviation media surfaces. Social is not a listing
        distribution channel &mdash; it is an aviation intelligence and authority
        platform.
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Priority Opportunity Queue</div>
          <div className="opp-card pinned" style={{ marginBottom: 8 }}>
            <div className="opp-header">
              <div className="opp-signal">
                [Score 95] Social leans too close to listing repost behavior
              </div>
              <div className="opp-badges">
                <span className="conf-confirmed">CONFIRMED</span>
                <span className="pri-now">Now</span>
              </div>
            </div>
            <div className="opp-gap">
              Re-anchor weekly planning around authority and education first.
              Listing content reframed through market, model, or ownership
              context.
            </div>
          </div>
          <div className="opp-card pinned" style={{ marginBottom: 8 }}>
            <div className="opp-header">
              <div className="opp-signal">
                [Score 94] YouTube long-form below required cadence
              </div>
              <div className="opp-badges">
                <span className="conf-confirmed">CONFIRMED</span>
                <span className="pri-now">Now</span>
              </div>
            </div>
            <div className="opp-gap">
              Target is 2 long-form authority videos per month. YouTube supports
              SEO, retargeting, email capture, and authority positioning
              simultaneously.
            </div>
          </div>
          <div className="opp-card pinned" style={{ marginBottom: 0 }}>
            <div className="opp-header">
              <div className="opp-signal">
                [Score 93] Broker spotlight underused relative to retention and
                differentiation value
              </div>
              <div className="opp-badges">
                <span className="conf-confirmed">CONFIRMED</span>
                <span className="pri-now">Now</span>
              </div>
            </div>
            <div className="opp-gap">
              Operationalize a monthly broker spotlight series with LinkedIn
              distribution and email amplification.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            Content Bucket Balance &mdash; Current vs Target
          </div>
          <div className="soft-list">
            {(contentBuckets ?? []).map((b: any, i: number) => (
              <div className="soft-row" key={i}>
                <span className="row-label">{b.bucket ?? "—"}</span>
                <span className={`row-value ${b.value_class ?? ""}`} dangerouslySetInnerHTML={{ __html: b.summary ?? "—" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Channels Tab ─────────────────────────────────────────────── */
function ChannelsTab() {
  const { data: platformGuidelines } = useQuery({ queryKey: ["social-platform-guidelines"], queryFn: api.getSocialPlatformGuidelines });

  return (
    <>
      <div className="section-label mb-16">
        Channel Performance &mdash; Social Platforms
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Platform</th>
              <th>Role</th>
              <th>Content Rules</th>
              <th>Current Status</th>
              <th>Issue</th>
              <th>Action</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {(platformGuidelines ?? []).map((p: any, i: number) => (
              <tr key={i}>
                <td className="td-primary">{p.platform ?? "—"}</td>
                <td>{p.role ?? "—"}</td>
                <td>{p.content_rules ?? "—"}</td>
                <td className={p.status_class ?? ""}>{p.current_status ?? "—"}</td>
                <td>{p.issue ?? "—"}</td>
                <td>{p.action ?? "—"}</td>
                <td><span className={`conf-${(p.confidence ?? "confirmed").toLowerCase()}`}>{(p.confidence ?? "CONFIRMED").toUpperCase()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Buckets Tab ──────────────────────────────────────────────── */
function BucketsTab() {
  const { data: contentBuckets } = useQuery({ queryKey: ["social-content-buckets"], queryFn: api.getSocialContentBuckets });

  return (
    <>
      <div className="section-label mb-16">Content Bucket Intelligence</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bucket</th>
              <th>Current Share</th>
              <th>Target Role</th>
              <th>Issue</th>
              <th>Action</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {(contentBuckets ?? []).map((b: any, i: number) => (
              <tr key={i}>
                <td className={`td-primary ${b.name_class ?? ""}`}>{b.bucket ?? "—"}</td>
                <td className={b.share_class ?? ""}>{b.current_share ?? "—"}</td>
                <td>{b.target_role ?? "—"}</td>
                <td>{b.issue ?? "—"}</td>
                <td>{b.action ?? "—"}</td>
                <td><span className={`conf-${(b.confidence ?? "confirmed").toLowerCase()}`}>{(b.confidence ?? "CONFIRMED").toUpperCase()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Opportunity Queue Tab ────────────────────────────────────── */
function ListingTab() {
  return (
    <>
      <div className="section-label mb-16">Full Opportunity Queue</div>

      <div className="opp-card pinned">
        <div className="opp-header">
          <div className="opp-signal">
            [Score 95] Social still leans too close to listing repost behavior
          </div>
          <div className="opp-badges">
            <span className="badge-gen">Authority Gap</span>
            <span className="conf-confirmed">CONFIRMED</span>
            <span className="pri-now">Now</span>
          </div>
        </div>
        <div className="opp-gap">
          Channel discipline slips when inventory content is easier to publish
          quickly. Authority positioning depends on market intelligence framing.
          Listing-heavy behavior reduces perceived scale.
        </div>
        <div className="opp-meta">
          <div className="opp-meta-item">
            <div className="opp-meta-label">Owner</div>
            <div className="opp-meta-value">Social Lead</div>
          </div>
          <div className="opp-meta-item">
            <div className="opp-meta-label">Time to Impact</div>
            <div className="opp-meta-value">Immediate</div>
          </div>
          <div className="opp-meta-item">
            <div className="opp-meta-label">Lift</div>
            <div className="opp-meta-value">Compounding brand gravity</div>
          </div>
        </div>
      </div>

      <div className="opp-card pinned">
        <div className="opp-header">
          <div className="opp-signal">
            [Score 94] YouTube long-form authority is below required cadence
          </div>
          <div className="opp-badges">
            <span className="badge-gen">Channel Discipline</span>
            <span className="conf-confirmed">CONFIRMED</span>
            <span className="pri-now">Now</span>
          </div>
        </div>
        <div className="opp-gap">
          Target is 2 long-form videos per month minimum. Video production
          treated as occasional output instead of a planned authority lane.
          YouTube supports SEO, retargeting, email capture, and authority
          positioning.
        </div>
      </div>

      <div className="opp-card pinned">
        <div className="opp-header">
          <div className="opp-signal">
            [Score 93] Broker spotlight underused &mdash; major untapped
            retention layer
          </div>
          <div className="opp-badges">
            <span className="badge-rev">Broker Visibility</span>
            <span className="conf-confirmed">CONFIRMED</span>
            <span className="pri-now">Now</span>
          </div>
        </div>
        <div className="opp-gap">
          No persistent monthly spotlight system with distribution discipline.
          Broker visibility strengthens loyalty and differentiates against
          Controller. LinkedIn + email amplification is underused.
        </div>
      </div>

      <div className="opp-card pinned">
        <div className="opp-header">
          <div className="opp-signal">
            [Score 92] Events attended but amplification structure inconsistent
          </div>
          <div className="opp-badges">
            <span className="badge-gen">Event Amplification</span>
            <span className="conf-confirmed">CONFIRMED</span>
            <span className="pri-now">Now</span>
          </div>
        </div>
        <div className="opp-gap">
          Events should produce authority content, broker visibility, and recap
          value across before/during/after phases. Unstructured event posting
          leaves ROI on the table.
        </div>
      </div>

      <div className="opp-card">
        <div className="opp-header">
          <div className="opp-signal">
            [Score 85] Not every major social piece feeds email capture and
            retargeting loop
          </div>
          <div className="opp-badges">
            <span className="badge-gen">Social Loop</span>
            <span className="conf-probable">PROBABLE</span>
            <span className="pri-next">Next</span>
          </div>
        </div>
        <div className="opp-gap">
          Social content creates attention, but downstream audience sync and
          capture logic are not universal across all content types.
        </div>
      </div>
    </>
  );
}

/* ── Broker Spotlight Tab ─────────────────────────────────────── */
function BrokerTab() {
  const { data: brokerSpotlights } = useQuery({ queryKey: ["social-broker-spotlights"], queryFn: api.getSocialBrokerSpotlights });

  return (
    <>
      <div className="section-label mb-16">Broker Spotlight System</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Broker</th>
              <th>Spotlight Status</th>
              <th>Inventory Support</th>
              <th>Promotion Stack</th>
              <th>Issue</th>
              <th>Action</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {(brokerSpotlights ?? []).map((b: any, i: number) => (
              <tr key={i}>
                <td className="td-primary">{b.broker ?? "—"}</td>
                <td className={b.spotlight_class ?? ""}>{b.spotlight_status ?? "—"}</td>
                <td className={b.inventory_class ?? ""}>{b.inventory_support ?? "—"}</td>
                <td>{b.promotion_stack ?? "—"}</td>
                <td>{b.issue ?? "—"}</td>
                <td>{b.action ?? "—"}</td>
                <td><span className={`conf-${(b.confidence ?? "probable").toLowerCase()}`}>{(b.confidence ?? "PROBABLE").toUpperCase()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Event Amplification Tab ──────────────────────────────────── */
function EventsTab() {
  const { data: eventCoverage } = useQuery({ queryKey: ["social-event-coverage"], queryFn: api.getSocialEventCoverage });

  return (
    <>
      <div className="section-label mb-16">
        Event Amplification System &mdash; 3-Phase Model
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Pre-Event</th>
              <th>Live Event</th>
              <th>Post-Event</th>
              <th>Issue</th>
              <th>Action</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {(eventCoverage ?? []).map((e: any, i: number) => (
              <tr key={i}>
                <td className="td-primary">{e.event ?? "—"}</td>
                <td className={e.pre_class ?? ""}>{e.pre_event ?? "—"}</td>
                <td>{e.live_event ?? "—"}</td>
                <td>{e.post_event ?? "—"}</td>
                <td>{e.issue ?? "—"}</td>
                <td>{e.action ?? "—"}</td>
                <td><span className={`conf-${(e.confidence ?? "confirmed").toLowerCase()}`}>{(e.confidence ?? "CONFIRMED").toUpperCase()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Social Loop Tab ──────────────────────────────────────────── */
function LoopTab() {
  const { data: loopMetrics } = useQuery({ queryKey: ["social-loop-metrics"], queryFn: api.getSocialLoopMetrics });
  void loopMetrics; // available for future dynamic rendering

  return (
    <>
      <div className="section-label mb-16">
        Social &rarr; Email &rarr; PPC Compounding Loop
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title">
          Loop Doctrine &mdash; Required for every major authority asset
        </div>
        <div className="soft-list">
          <div className="soft-row">
            <span className="row-label">Step 1</span>
            <span className="row-value">
              Publish authority content with deliberate email capture CTA
            </span>
          </div>
          <div className="soft-row">
            <span className="row-label">Step 2</span>
            <span className="row-value">
              Captured contacts enter model-specific lifecycle sequence
            </span>
          </div>
          <div className="soft-row">
            <span className="row-label">Step 3</span>
            <span className="row-value">
              Social audience syncs to Google Ads / Meta / YouTube retargeting
            </span>
          </div>
          <div className="soft-row">
            <span className="row-label">Step 4</span>
            <span className="row-value">
              Retargeting mirrors email content themes for the same user
            </span>
          </div>
          <div className="soft-row">
            <span className="row-label">Step 5</span>
            <span className="row-value">
              High-score users enter abandoned-inquiry or urgency sequences
            </span>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card-plain">
          <div className="card-title">Loop Gaps &mdash; Current State</div>
          <div className="soft-list">
            {(loopMetrics?.gaps ?? [
              { label: "Email capture architecture", value: "Not mandatory in all briefs yet", value_class: "m-warn" },
              { label: "Retargeting audience from social", value: "86% synced — 14% gap", value_class: "m-warn" },
              { label: "Creative mirroring between email and paid", value: "Partially implemented", value_class: "m-warn" },
              { label: "Score-aware suppression after inquiry", value: "Not yet universal", value_class: "m-bad" },
            ]).map((g: any, i: number) => (
              <div className="soft-row" key={i}>
                <span className="row-label">{g.label ?? "—"}</span>
                <span className={`row-value ${g.value_class ?? ""}`} dangerouslySetInnerHTML={{ __html: g.value ?? "—" }} />
              </div>
            ))}
          </div>
        </div>

        <div className="card-plain">
          <div className="card-title">First-Party Capture from Social</div>
          <div className="chart-shell">
            <div className="gridlines" />
            <div className="line-wrap">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  fill="rgba(16,34,151,.1)"
                  stroke="#102297"
                  strokeWidth="3"
                  points="0,80 17,74 33,68 50,58 67,50 83,44 100,38"
                />
              </svg>
            </div>
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            Email capture rate: 4.2% current &rarr; target 6%+ with mandatory
            CTA architecture
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Measurement Tab ──────────────────────────────────────────── */
function MeasurementTab() {
  const { data: loopMetrics } = useQuery({ queryKey: ["social-loop-metrics"], queryFn: api.getSocialLoopMetrics });
  void loopMetrics; // measurement registry data available via loop metrics

  return (
    <>
      <div className="section-label mb-16">Social Measurement Registry</div>
      <div className="table-wrap mb-16">
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current</th>
              <th>Confidence</th>
              <th>Issue</th>
              <th>Next Move</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="td-primary">Social-assisted inquiries</td>
              <td>21</td>
              <td>
                <span className="conf-probable">PROBABLE</span>
              </td>
              <td>
                Primary KPI is directionally useful, but still not fully
                board-safe.
              </td>
              <td>
                Separate confirmed influence from directional authority
                contribution.
              </td>
            </tr>
            <tr>
              <td className="td-primary">
                Profile visit &rarr; site click rate
              </td>
              <td>18%</td>
              <td>
                <span className="conf-confirmed">CONFIRMED</span>
              </td>
              <td>
                Healthy, but differs materially by content bucket.
              </td>
              <td>Benchmark by content bucket and channel role.</td>
            </tr>
            <tr>
              <td className="td-primary">Video completion rate</td>
              <td>34%</td>
              <td>
                <span className="conf-probable">PROBABLE</span>
              </td>
              <td>
                Useful for long-form authority, but sample size still too thin.
              </td>
              <td>
                Increase cadence before drawing hard channel conclusions.
              </td>
            </tr>
            <tr>
              <td className="td-primary">Email capture from social</td>
              <td>4.2%</td>
              <td>
                <span className="conf-probable">PROBABLE</span>
              </td>
              <td>
                Improving, but many assets still lack deliberate capture
                architecture.
              </td>
              <td>
                Make email capture mandatory in all major content briefs.
              </td>
            </tr>
            <tr>
              <td className="td-primary">Follower growth</td>
              <td>+6.8%</td>
              <td>
                <span className="conf-confirmed">CONFIRMED</span>
              </td>
              <td>
                Useful context, but not a primary success lens.
              </td>
              <td>
                Keep tertiary only unless tied to business impact.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
