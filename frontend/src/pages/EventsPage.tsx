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
  | "tiers"
  | "revenue"
  | "pre"
  | "onsite"
  | "post"
  | "partners"
  | "content"
  | "measurement";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "tiers", label: "Event Tiers" },
  { key: "revenue", label: "Revenue Design" },
  { key: "pre", label: "Pre-Event" },
  { key: "onsite", label: "On-Site" },
  { key: "post", label: "Post-Event" },
  { key: "partners", label: "Partners" },
  { key: "content", label: "Content Yield" },
  { key: "measurement", label: "Measurement" },
];

/* ------------------------------------------------------------------ */
/*  TAB PANELS                                                        */
/* ------------------------------------------------------------------ */

function OverviewTab() {
  const { data: kpis, isLoading } = useQuery({ queryKey: ["events-kpis"], queryFn: api.getEventsKpis });

  return (
    <>
      <div className="section-label mb-16">Event Revenue KPIs</div>
      {isLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}
      <div className="metric-grid-6 mb-20">
        <div className="metric-card">
          <div className="m-label">Revenue Target Coverage</div>
          <div className={`m-value ${kpis?.revenue_target_class ?? "m-warn"}`}>{rv(kpis?.revenue_target ?? kpis?.revenue_target_coverage)}</div>
          <div className="m-sub" dangerouslySetInnerHTML={{ __html: kpis?.revenue_target_sub ?? "Target: 2x cost &middot; <span class='up'>&#9650; +0.2x MoM</span>" }} />
          <div style={{ marginTop: 6 }}>
            <span className={`conf-${(kpis?.revenue_target_confidence ?? "probable").toLowerCase()}`}>{(kpis?.revenue_target_confidence ?? "PROBABLE").toUpperCase()}</span>
          </div>
          <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
        </div>
        <div className="metric-card">
          <div className="m-label">Pre-Event Meeting Fill</div>
          <div className={`m-value ${kpis?.meeting_fill_class ?? "m-warn"}`}>{rv(kpis?.meeting_fill ?? kpis?.pre_event_meeting_fill)}</div>
          <div className="m-sub">
            <span className="up" dangerouslySetInnerHTML={{ __html: kpis?.meeting_fill_trend ?? "&#9650; +11 pts MoM" }} />
          </div>
          <div style={{ marginTop: 6 }}>
            <span className={`conf-${(kpis?.meeting_fill_confidence ?? "confirmed").toLowerCase()}`}>{(kpis?.meeting_fill_confidence ?? "CONFIRMED").toUpperCase()}</span>
          </div>
          <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
        </div>
        <div className="metric-card">
          <div className="m-label">On-Site Tagged Leads</div>
          <div className="m-value">{rv(kpis?.tagged_leads ?? kpis?.on_site_tagged_leads)}</div>
          <div className="m-sub">
            <span className="up" dangerouslySetInnerHTML={{ __html: kpis?.tagged_leads_trend ?? "&#9650; +19% vs prior" }} />
          </div>
          <div style={{ marginTop: 6 }}>
            <span className={`conf-${(kpis?.tagged_leads_confidence ?? "probable").toLowerCase()}`}>{(kpis?.tagged_leads_confidence ?? "PROBABLE").toUpperCase()}</span>
          </div>
          <div className="m-date">As of Mar 30, 2026</div>
        </div>
        <div className="metric-card">
          <div className="m-label">Sponsor Bundle Close Rate</div>
          <div className={`m-value ${kpis?.sponsor_close_class ?? "m-warn"}`}>{rv(kpis?.sponsor_close ?? kpis?.sponsor_close_rate)}</div>
          <div className="m-sub">
            <span className="up" dangerouslySetInnerHTML={{ __html: kpis?.sponsor_close_trend ?? "&#9650; +4 pts MoM" }} />
          </div>
          <div style={{ marginTop: 6 }}>
            <span className={`conf-${(kpis?.sponsor_close_confidence ?? "probable").toLowerCase()}`}>{(kpis?.sponsor_close_confidence ?? "PROBABLE").toUpperCase()}</span>
          </div>
          <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
        </div>
        <div className="metric-card">
          <div className="m-label">Content Yield per Event</div>
          <div className={`m-value ${kpis?.content_yield_class ?? "m-warn"}`}>{rv(kpis?.content_yield)}</div>
          <div className="m-sub">
            <span className="up" dangerouslySetInnerHTML={{ __html: kpis?.content_yield_trend ?? "&#9650; +9 pts MoM" }} />
          </div>
          <div style={{ marginTop: 6 }}>
            <span className={`conf-${(kpis?.content_yield_confidence ?? "confirmed").toLowerCase()}`}>{(kpis?.content_yield_confidence ?? "CONFIRMED").toUpperCase()}</span>
          </div>
          <div className="m-date">Month: Mar 1 – Mar 30, 2026</div>
        </div>
        <div className="metric-card">
          <div className="m-label">Event Attribution Integrity</div>
          <div className={`m-value ${kpis?.attribution_class ?? "m-bad"}`}>{rv(kpis?.attribution ?? kpis?.attribution_integrity)}</div>
          <div className="m-sub">{kpis?.attribution_sub ?? "2 blockers active"}</div>
          <div style={{ marginTop: 6 }}>
            <span className={`conf-${(kpis?.attribution_confidence ?? "confirmed").toLowerCase()}`}>{(kpis?.attribution_confidence ?? "CONFIRMED").toUpperCase()}</span>
          </div>
          <div className="m-date">As of Mar 30, 2026</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Priority Opportunity Queue</div>
          <div className="opp-card pinned" style={{ marginBottom: 8 }}>
            <div className="opp-header">
              <div className="opp-signal">
                [Score 96] Too much event value won or lost before arriving on-site
              </div>
              <div className="opp-badges">
                <span className="conf-confirmed">CONFIRMED</span>
                <span className="pri-now">Now</span>
              </div>
            </div>
            <div className="opp-gap">
              Standardize a 30–45 day event launch system: email campaign, broker
              outreach, social countdown, event landing page, and geo-targeted PPC
              before every Tier 1 or 2 event.
            </div>
          </div>
          <div className="opp-card pinned" style={{ marginBottom: 0 }}>
            <div className="opp-header">
              <div className="opp-signal">
                [Score 94] On-site activity risks behaving like attendance instead of
                monetization
              </div>
              <div className="opp-badges">
                <span className="conf-confirmed">CONFIRMED</span>
                <span className="pri-now">Now</span>
              </div>
            </div>
            <div className="opp-gap">
              QR + landing + CRM tagging should be universal. Treat every event as an
              on-site sales and capture engine.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Execution System Status</div>
          <div className="soft-list">
            <div className="soft-row">
              <span className="row-label">Pre-Event (30–45 day launch)</span>
              <span className="row-value m-warn">Partial — not universal</span>
            </div>
            <div className="soft-row">
              <span className="row-label">On-Site QR lead capture</span>
              <span className="row-value m-warn">Improving — not universal</span>
            </div>
            <div className="soft-row">
              <span className="row-label">Broker pitch system</span>
              <span className="row-value m-warn">Partial — varies by event</span>
            </div>
            <div className="soft-row">
              <span className="row-label">Post-Event 7-day review</span>
              <span className="row-value m-warn">Partial — discipline drops</span>
            </div>
            <div className="soft-row">
              <span className="row-label">30-day ROI review</span>
              <span className="row-value m-bad">54% completion rate</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TiersTab() {
  return (
    <>
      <div className="section-label mb-16">Event Tier Classification</div>
      <div className="grid-3">
        <div
          className="card-plain"
          style={{ borderLeft: "4px solid var(--red)" }}
        >
          <div className="card-title">Tier 1 — Anchor Events</div>
          <div className="soft-list">
            <div className="soft-row">
              <span className="row-label">Examples</span>
              <span className="row-value">
                NBAA BACE, NBAA S&amp;D, AERO Friedrichshafen
              </span>
            </div>
            <div className="soft-row">
              <span className="row-label">Lead time required</span>
              <span className="row-value">45 days minimum</span>
            </div>
            <div className="soft-row">
              <span className="row-label">Revenue design</span>
              <span className="row-value">
                Full sponsor bundle menu + VIP meetings
              </span>
            </div>
            <div className="soft-row">
              <span className="row-label">Content yield target</span>
              <span className="row-value">
                Full 5-asset stack + broker interviews
              </span>
            </div>
          </div>
        </div>

        <div
          className="card-plain"
          style={{ borderLeft: "4px solid var(--amber)" }}
        >
          <div className="card-title">Tier 2 — Mid-Scale Events</div>
          <div className="soft-list">
            <div className="soft-row">
              <span className="row-label">Examples</span>
              <span className="row-value">
                Regional aviation shows, broker conferences
              </span>
            </div>
            <div className="soft-row">
              <span className="row-label">Lead time required</span>
              <span className="row-value">30 days minimum</span>
            </div>
            <div className="soft-row">
              <span className="row-label">Revenue design</span>
              <span className="row-value">
                Selected packages + follow-up playbook
              </span>
            </div>
            <div className="soft-row">
              <span className="row-label">Content yield target</span>
              <span className="row-value">
                Short video + recap + photo library
              </span>
            </div>
          </div>
        </div>

        <div
          className="card-plain"
          style={{ borderLeft: "4px solid var(--text-faint)" }}
        >
          <div className="card-title">Tier 3 — Local / Opportunistic</div>
          <div className="soft-list">
            <div className="soft-row">
              <span className="row-label">Examples</span>
              <span className="row-value">
                FBO open houses, community events
              </span>
            </div>
            <div className="soft-row">
              <span className="row-label">Lead time required</span>
              <span className="row-value">2 weeks minimum</span>
            </div>
            <div className="soft-row">
              <span className="row-label">Revenue design</span>
              <span className="row-value">Relationship building only</span>
            </div>
            <div className="soft-row">
              <span className="row-label">Content yield target</span>
              <span className="row-value">1–2 short pieces</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function RevenueTab() {
  const { data: revenueProducts } = useQuery({ queryKey: ["events-revenue-products"], queryFn: api.getEventsRevenueProducts });

  return (
    <>
      <div className="section-label mb-16">Revenue Package Architecture</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Type</th>
              <th>Revenue Target</th>
              <th>Current</th>
              <th>Issue</th>
              <th>Action</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {(revenueProducts ?? []).map((r: any, i: number) => (
              <tr key={i}>
                <td className="td-primary">{r.package ?? "—"}</td>
                <td>{r.type ?? "—"}</td>
                <td>{r.revenue_target ?? "—"}</td>
                <td className={r.current_class ?? ""}>{r.current ?? "—"}</td>
                <td>{r.issue ?? "—"}</td>
                <td>{r.action ?? "—"}</td>
                <td><span className={`conf-${(r.confidence ?? "confirmed").toLowerCase()}`}>{(r.confidence ?? "CONFIRMED").toUpperCase()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PreEventTab() {
  const { data: preEventStatus } = useQuery({ queryKey: ["events-pre-event-status"], queryFn: api.getEventsPreEventStatus });

  return (
    <>
      <div className="section-label mb-16">
        Pre-Event System — 30–45 Day Launch Checklist
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            [Score 96] Pre-Event System — Partially Operationalized
          </div>
          <div className="soft-list">
            {(preEventStatus ?? []).map((p: any, i: number) => (
              <div className="soft-row" key={i}>
                <span className="row-label">{p.item ?? "—"}</span>
                <span className={`row-value ${p.value_class ?? ""}`}>{p.status ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            Expected Lift from Full Pre-Event Execution
          </div>
          <div className="note-text" style={{ marginBottom: 12 }}>
            Pre-event strategy is the most important phase. Most event value is
            won or lost before GlobalAir even arrives on-site.
          </div>
          <div className="soft-list">
            <div className="soft-row">
              <span className="row-label">Conservative lift on meeting fill</span>
              <span className="row-value">+10%</span>
            </div>
            <div className="soft-row">
              <span className="row-label">Expected lift on meeting fill</span>
              <span className="row-value m-good">+20%</span>
            </div>
            <div className="soft-row">
              <span className="row-label">Aggressive lift</span>
              <span className="row-value">+30%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function OnSiteTab() {
  const { data: onSiteDoctrine } = useQuery({ queryKey: ["events-on-site-doctrine"], queryFn: api.getEventsOnSiteDoctrine });

  return (
    <>
      <div className="section-label mb-16">On-Site Execution System</div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title">
          Doctrine: You are not there to have a booth — you are there to sell and
          capture
        </div>
        <div className="soft-list">
          {(onSiteDoctrine ?? []).map((d: any, i: number) => (
            <div className="soft-row" key={i}>
              <span className="row-label">{d.item ?? "—"}</span>
              <span className={`row-value ${d.value_class ?? ""}`}>{d.status ?? "—"}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="note-text">
        Action: Ban clipboard collection and enforce QR landing workflow only.
        Use a scripted value pitch with standardized bundle menu. Assign explicit
        floor-selling owner before travel. Owner: Events Lead + Revenue. Time to
        Impact: Immediate.
      </div>
    </>
  );
}

function PostEventTab() {
  const { data: postEventStatus } = useQuery({ queryKey: ["events-post-event-status"], queryFn: api.getEventsPostEventStatus });

  return (
    <>
      <div className="section-label mb-16">Post-Event Follow-Up System</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Stage</th>
              <th>System</th>
              <th>Current State</th>
              <th>Issue</th>
              <th>Action</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {(postEventStatus ?? []).map((p: any, i: number) => (
              <tr key={i}>
                <td className="td-primary">{p.stage ?? "—"}</td>
                <td>{p.system ?? "—"}</td>
                <td className={p.state_class ?? ""}>{p.current_state ?? "—"}</td>
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

function PartnersTab() {
  const { data: partnerships } = useQuery({ queryKey: ["events-partnerships"], queryFn: api.getEventsPartnerships });

  return (
    <>
      <div className="section-label mb-16">Partner Bundle Architecture</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Partner Type</th>
              <th>Opportunity</th>
              <th>Bundle Name</th>
              <th>Issue</th>
              <th>Action</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {(partnerships ?? []).map((p: any, i: number) => (
              <tr key={i}>
                <td className="td-primary">{p.partner_type ?? "—"}</td>
                <td>{p.opportunity ?? "—"}</td>
                <td>{p.bundle_name ?? "—"}</td>
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

function ContentYieldTab() {
  const { data: contentCapture } = useQuery({ queryKey: ["events-content-capture"], queryFn: api.getEventsContentCapture });

  return (
    <>
      <div className="section-label mb-16">
        Content Multiplier — Per-Event Output Targets
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Target</th>
              <th>Current Avg</th>
              <th>Issue</th>
              <th>Action</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {(contentCapture ?? []).map((c: any, i: number) => (
              <tr key={i}>
                <td className="td-primary">{c.asset ?? "—"}</td>
                <td>{c.target ?? "—"}</td>
                <td className={c.current_class ?? ""}>{c.current_avg ?? "—"}</td>
                <td>{c.issue ?? "—"}</td>
                <td>{c.action ?? "—"}</td>
                <td><span className={`conf-${(c.confidence ?? "confirmed").toLowerCase()}`}>{(c.confidence ?? "CONFIRMED").toUpperCase()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MeasurementTab() {
  const { data: attribution } = useQuery({ queryKey: ["events-attribution"], queryFn: api.getEventsAttribution });

  return (
    <>
      <div className="section-label mb-16">Event Measurement Registry</div>
      <div className="table-wrap">
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
            {(attribution ?? []).map((a: any, i: number) => (
              <tr key={i}>
                <td className="td-primary">{a.metric ?? "—"}</td>
                <td className={a.current_class ?? ""}>{a.current ?? "—"}</td>
                <td><span className={`conf-${(a.confidence ?? "probable").toLowerCase()}`}>{(a.confidence ?? "PROBABLE").toUpperCase()}</span></td>
                <td>{a.issue ?? "—"}</td>
                <td>{a.next_move ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                         */
/* ------------------------------------------------------------------ */

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  return (
    <>
      <Topbar pageTitle="Event Revenue" />

      <div className="page-hero">
        <div className="hero-eyebrow">GlobalAir.com / Av/IntelOS</div>
        <h1 className="hero-title">Event Revenue Command</h1>
        <p className="hero-sub">
          Pre-event pipeline execution, on-site monetization systems, broker and
          advertiser bundle management, content multiplier yield, and event ROI
          attribution.
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
        {activeTab === "tiers" && <TiersTab />}
        {activeTab === "revenue" && <RevenueTab />}
        {activeTab === "pre" && <PreEventTab />}
        {activeTab === "onsite" && <OnSiteTab />}
        {activeTab === "post" && <PostEventTab />}
        {activeTab === "partners" && <PartnersTab />}
        {activeTab === "content" && <ContentYieldTab />}
        {activeTab === "measurement" && <MeasurementTab />}
      </div>
    </>
  );
}
