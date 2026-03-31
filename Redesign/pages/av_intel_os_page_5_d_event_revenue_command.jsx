import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  DollarSign,
  Filter,
  Gauge,
  Handshake,
  MapPinned,
  Megaphone,
  Mic,
  PlayCircle,
  QrCode,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Video,
  Workflow,
} from "lucide-react";
import {
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";

const savedViewsByRole = {
  casey: [
    { name: "Weekly Event Priorities", description: "Highest-value upcoming events, sponsor bundles, and lead-capture gaps.", mode: "weekly_priorities" },
    { name: "Pre-Event Pipeline", description: "Meeting scheduling, event pages, outreach, and geo retargeting readiness.", mode: "pre_event_pipeline" },
    { name: "On-Site Monetization", description: "Lead capture, broker pitch flow, and premium placement selling on the floor.", mode: "on_site_monetization" },
  ],
  clay: [
    { name: "Executive Event ROI", description: "Revenue design, broker/advertiser integration, and event payback control.", mode: "executive_roi" },
    { name: "Content Multiplier", description: "How events feed social, email, YouTube, and authority assets.", mode: "content_multiplier" },
    { name: "Measurement Risk", description: "Event-source attribution, lead tagging, and follow-up confidence gaps.", mode: "measurement_risk" },
  ],
  jeffrey: [
    { name: "Board-Safe Event View", description: "Confirmed event revenue, pipeline, and relationship outcomes only.", mode: "board_safe" },
    { name: "Broker & Advertiser Growth", description: "Upsell packages, sponsor value, and relationship leverage.", mode: "broker_advertiser_growth" },
    { name: "Critical Event Gaps", description: "Highest-risk event blockers only.", mode: "critical_gaps" },
  ],
} as const;

const roles = {
  casey: { label: "Casey Jones", title: "Head of Marketing", hideProbable: false },
  clay: { label: "Clay Martin", title: "COO", hideProbable: false },
  jeffrey: { label: "Jeffrey Carrithers", title: "CEO", hideProbable: true },
} as const;

type RoleKey = keyof typeof roles;
type Confidence = "CONFIRMED" | "PROBABLE" | "POSSIBLE";
type ViewTab = "overview" | "tiers" | "revenue" | "pre" | "onsite" | "post" | "partners" | "content" | "measurement";
type ComparePeriod = "WoW" | "MoM" | "90D";
type SavedViewMode =
  | "weekly_priorities"
  | "pre_event_pipeline"
  | "on_site_monetization"
  | "executive_roi"
  | "content_multiplier"
  | "measurement_risk"
  | "board_safe"
  | "broker_advertiser_growth"
  | "critical_gaps";
type OpportunityType =
  | "Event Tier"
  | "Revenue Design"
  | "Pre-Event"
  | "On-Site Execution"
  | "Post-Event Capture"
  | "Broker & Advertiser"
  | "Content Multiplier"
  | "Measurement Risk";

type KPI = {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaDirection: "up" | "down" | "flat";
  confidence: Confidence;
  source: string;
  freshness: string;
  detail: string;
  statusTone?: "good" | "warn" | "bad";
};

type Opportunity = {
  id: string;
  type: OpportunityType;
  signal: string;
  gap: string;
  likelyCause: string;
  whySurfaced: string[];
  expectedLift: { conservative: string; expected: string; aggressive: string };
  action: string;
  owner: string;
  dependency: string;
  blocker: string;
  confidence: Confidence;
  priority: "Now" | "Next" | "Later";
  priorityScore: number;
  timeToImpact: string;
  pinned?: boolean;
  doNotActYet?: boolean;
};

type EventTierRow = {
  tier: string;
  examples: string;
  objective: string;
  roiRule: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

type RevenueRow = {
  package: string;
  type: "Direct" | "Indirect";
  target: string;
  current: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

type ExecutionRow = {
  stage: string;
  system: string;
  currentState: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

type PartnerRow = {
  partnerType: string;
  opportunity: string;
  bundle: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

type ContentRow = {
  asset: string;
  target: string;
  current: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

type MeasurementRow = {
  metric: string;
  current: string;
  confidence: Confidence;
  issue: string;
  nextMove: string;
};

const opportunityTypes: OpportunityType[] = [
  "Event Tier",
  "Revenue Design",
  "Pre-Event",
  "On-Site Execution",
  "Post-Event Capture",
  "Broker & Advertiser",
  "Content Multiplier",
  "Measurement Risk",
];

const kpis: KPI[] = [
  {
    id: "E001",
    label: "Event Revenue Target Coverage",
    value: "1.6x cost",
    delta: "+0.2x MoM",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Event ROI planner",
    freshness: "Today",
    detail: "Improving, but still below the long-term doctrine of 2x event cost return minimum.",
    statusTone: "warn",
  },
  {
    id: "E002",
    label: "Pre-Event Meeting Fill",
    value: "63%",
    delta: "+11 pts MoM",
    deltaDirection: "up",
    confidence: "CONFIRMED",
    source: "Event meeting scheduler",
    freshness: "Today",
    detail: "Better scheduling discipline is emerging, but several anchor events still enter under-booked.",
    statusTone: "warn",
  },
  {
    id: "E003",
    label: "On-Site Tagged Leads",
    value: "148",
    delta: "+19% vs prior event set",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "CRM event tags",
    freshness: "Today",
    detail: "Lead capture is healthier, but QR/landing-based tagging still is not universal at every event.",
    statusTone: "good",
  },
  {
    id: "E004",
    label: "Sponsor Bundle Close Rate",
    value: "22%",
    delta: "+4 pts MoM",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Revenue event packages tracker",
    freshness: "Today",
    detail: "Sponsor and advertiser event bundles are working, but packaging remains under-systematized.",
    statusTone: "good",
  },
  {
    id: "E005",
    label: "Content Yield Per Major Event",
    value: "74%",
    delta: "+9 pts MoM",
    deltaDirection: "up",
    confidence: "CONFIRMED",
    source: "Event content checklist",
    freshness: "Today",
    detail: "Event output is improving, but not every major event yet produces the full required content stack.",
    statusTone: "warn",
  },
  {
    id: "E006",
    label: "Event Attribution Integrity",
    value: "Diagnose",
    delta: "2 blockers active",
    deltaDirection: "down",
    confidence: "CONFIRMED",
    source: "CRM + lifecycle event audit",
    freshness: "58 min ago",
    detail: "Event-source tagging and 30-day follow-up linkage remain incomplete enough that ROI claims should stay confidence-aware.",
    statusTone: "bad",
  },
];

const opportunities: Opportunity[] = [
  {
    id: "event-001",
    type: "Pre-Event",
    signal: "Too much event value is still won or lost before GlobalAir even arrives on-site",
    gap: "Some events still begin with under-booked calendars, underbuilt event pages, and weak pre-event audience warm-up.",
    likelyCause: "Pre-event planning is improving, but the 30–45 day system is not yet operationalized with the same rigor for every major event.",
    whySurfaced: [
      "Step 5D identifies pre-event strategy as the most important phase",
      "Meeting scheduling and event pages are inconsistent by event",
      "Geo/event retargeting still launches too late in some cases",
    ],
    expectedLift: { conservative: "+10% meeting fill", expected: "+20%", aggressive: "+30%" },
    action: "Standardize a 30–45 day event launch system: event email campaign, broker outreach, social countdown, event landing page, and geo-targeted PPC layer before every Tier 1 or Tier 2 event.",
    owner: "Marketing Ops",
    dependency: "Event runbook and production calendar",
    blocker: "Event preparation is still too dependent on manual coordination",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 96,
    timeToImpact: "Immediate",
    pinned: true,
  },
  {
    id: "event-002",
    type: "On-Site Execution",
    signal: "On-site activity still risks behaving like attendance instead of monetization",
    gap: "The event floor should function as a lead capture and premium placement sales environment, not just a visibility presence.",
    likelyCause: "Lead capture, pitch structure, and offer packaging are present, but not yet enforced as a hard operational system every time.",
    whySurfaced: [
      "Step 5D explicitly says you are not there to have a booth",
      "QR + landing + CRM tagging should be universal",
      "Event-exclusive placements and bundle sales remain underused",
    ],
    expectedLift: { conservative: "+10% tagged leads", expected: "+20%", aggressive: "+35%" },
    action: "Treat every event as an on-site sales and capture engine: QR lead capture, incentive-based email capture, model-interest tagging, and structured broker/advertiser upsell pitch on the floor.",
    owner: "Events Lead + Revenue",
    dependency: "QR landing flow and event scripts",
    blocker: "No universal floor-selling checklist yet",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 94,
    timeToImpact: "Immediate",
    pinned: true,
  },
  {
    id: "event-003",
    type: "Revenue Design",
    signal: "Event monetization packages are working but still not productized tightly enough",
    gap: "GlobalAir has direct revenue paths at events, but bundle structure and sponsor packaging are not yet systematic enough to maximize yield.",
    likelyCause: "Packages exist in practice, but there is not yet a universal tiered sales menu for every anchor event.",
    whySurfaced: [
      "Step 5D requires direct and indirect event revenue design",
      "Premium sponsorship, email placement, listing boosts, and spotlight bundles are all viable",
      "Long-term return target is at least 2x event cost",
    ],
    expectedLift: { conservative: "+1 package sold / event", expected: "+2", aggressive: "+4" },
    action: "Create tiered event packages for sponsors, brokers, and advertisers with consistent menus, pricing logic, and on-site sales language before each major event.",
    owner: "Revenue Lead",
    dependency: "Package matrix and pricing approval",
    blocker: "Event offers still vary too much by seller and event",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 93,
    timeToImpact: "1–2 weeks",
    pinned: true,
  },
  {
    id: "event-004",
    type: "Broker & Advertiser",
    signal: "Events are still underused as relationship leverage for brokers and advertisers",
    gap: "Events should deepen loyalty, renewals, visibility, and upsell conversations — not just create one-time impressions.",
    likelyCause: "Follow-up structure exists, but broker and advertiser integration is not yet fully packaged around event participation.",
    whySurfaced: [
      "Step 5D positions events as broker and advertiser integration environments",
      "Homepage placement, email, social spotlight, YouTube features, and listing boosts all fit event bundles",
      "Relationship leverage is still partially handled ad hoc",
    ],
    expectedLift: { conservative: "Stronger retention support", expected: "Higher upsell close rate", aggressive: "Event-led account expansion" },
    action: "Tie every anchor event to broker and advertiser bundle offers, visibility upsells, and post-event relationship follow-up plans with owners assigned.",
    owner: "Revenue + Partnerships",
    dependency: "Account list and package scripting",
    blocker: "No formal event-to-account expansion workflow yet",
    confidence: "PROBABLE",
    priority: "Next",
    priorityScore: 86,
    timeToImpact: "2–4 weeks",
    pinned: true,
  },
  {
    id: "event-005",
    type: "Content Multiplier",
    signal: "Not every major event yet produces the full content multiplier stack",
    gap: "Events should feed social, email, YouTube, and SEO after the floor ends, but output is still inconsistent.",
    likelyCause: "Capture expectations exist, but field execution and post-event packaging are not equally disciplined across all events.",
    whySurfaced: [
      "Step 5D requires 5+ short videos, 2 broker interviews, 1 market recap, aircraft features, and photography library",
      "Events are content multipliers, not just sales meetings",
      "Authority yield remains uneven across the calendar",
    ],
    expectedLift: { conservative: "More event content carryover", expected: "Longer ROI tail", aggressive: "Authority + pipeline compounding" },
    action: "Use a mandatory event content checklist and require post-event packaging into social, email, YouTube, and SEO assets within 7 days.",
    owner: "Content + Social",
    dependency: "Field capture crew and edit pipeline",
    blocker: "No universal publish checklist enforced after every event",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 91,
    timeToImpact: "1–2 weeks",
  },
  {
    id: "event-006",
    type: "Measurement Risk",
    signal: "Event ROI is directionally useful but not fully board-safe yet",
    gap: "Event leads, post-event inquiry lift, and advertiser revenue movement can be seen, but the full closed-loop influence is still partially incomplete.",
    likelyCause: "CRM event tagging is better than before, but 7-day and 30-day linkage into downstream pipeline is not complete enough across all sources.",
    whySurfaced: [
      "Step 5D requires 7-day and 30-day follow-up review",
      "Lead-source tagging and follow-up linkage remain partial",
      "Jeffrey-safe event ROI should remain confidence-aware until cleanup improves",
    ],
    expectedLift: { conservative: "Risk containment", expected: "Cleaner event ROI", aggressive: "Scale-safe event investment decisions" },
    action: "Keep event ROI reporting confidence-aware and separate confirmed direct event revenue from directional downstream influence until CRM/event attribution is tighter.",
    owner: "Analytics + Revenue Ops",
    dependency: "Event lead tagging and follow-up stitching",
    blocker: "Some post-event revenue movement remains unattributed or blended",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 90,
    timeToImpact: "Immediate",
    doNotActYet: true,
  },
];

const eventTierRows: EventTierRow[] = [
  {
    tier: "Tier 1 — Industry Anchor Events",
    examples: "NBAA, major expos, international shows",
    objective: "Broker relationships + brand authority + advertiser upsell",
    roiRule: "Highest relationship and sponsor leverage expected",
    issue: "Usually well attended, but not always fully monetized with package discipline.",
    action: "Run full pre-event, on-site, and post-event monetization workflow every time.",
    confidence: "CONFIRMED",
  },
  {
    tier: "Tier 2 — Regional Broker Events",
    examples: "Regional dealer and broker gatherings",
    objective: "Inventory acquisition + broker loyalty",
    roiRule: "Lower scale, strong relationship value",
    issue: "Good for relationship density, but often under-instrumented.",
    action: "Use structured meeting targets and broker expansion offers.",
    confidence: "PROBABLE",
  },
  {
    tier: "Tier 3 — Buyer-Focused Events",
    examples: "Buyer showcases, piston-oriented events",
    objective: "High-intent lead capture + piston demand acceleration",
    roiRule: "Lead and inquiry efficiency must dominate",
    issue: "High-intent value is strong, but capture and nurture follow-up must be tighter.",
    action: "Pair with immediate lifecycle and retargeting follow-up.",
    confidence: "CONFIRMED",
  },
  {
    tier: "Tier 4 — Sponsorship Visibility Events",
    examples: "Brand reinforcement and selective sponsorship moments",
    objective: "Brand reinforcement + content generation",
    roiRule: "Indirect return and authority value",
    issue: "Most likely to drift into vanity if not tied to content and pipeline outcomes.",
    action: "Attend only when content and relationship outputs are explicitly defined.",
    confidence: "PROBABLE",
  },
];

const revenueRows: RevenueRow[] = [
  {
    package: "Premium sponsorship packages",
    type: "Direct",
    target: "$18K / quarter",
    current: "$12.4K",
    issue: "Demand exists, but packaging remains inconsistent by event.",
    action: "Standardize package levels and pre-sell before attendance.",
    confidence: "CONFIRMED",
  },
  {
    package: "Event-based advertising bundles",
    type: "Direct",
    target: "$14K / quarter",
    current: "$8.9K",
    issue: "Advertiser bundle logic is underused post-event.",
    action: "Create sponsor/advertiser menus tied to every anchor event.",
    confidence: "PROBABLE",
  },
  {
    package: "Featured listing upgrades",
    type: "Direct",
    target: "$9K / quarter",
    current: "$6.2K",
    issue: "Sold opportunistically, not systematically.",
    action: "Bundle event-exclusive featured listing upgrades into floor pitch.",
    confidence: "PROBABLE",
  },
  {
    package: "Broker spotlight placement",
    type: "Direct",
    target: "$7K / quarter",
    current: "$3.8K",
    issue: "High-value visibility product, under-packaged.",
    action: "Tie spotlight placements to event visibility packages.",
    confidence: "CONFIRMED",
  },
  {
    package: "Lead acquisition + broker retention",
    type: "Indirect",
    target: "2.0x cost return",
    current: "1.6x",
    issue: "Trend is improving but still below doctrine target.",
    action: "Tighten follow-up and event-linked account expansion plans.",
    confidence: "PROBABLE",
  },
];

const executionRows: ExecutionRow[] = [
  {
    stage: "Pre-Event",
    system: "Event page + meeting scheduler + outreach + geo retargeting",
    currentState: "Partial",
    issue: "Pieces exist, but not every event runs the full 30–45 day setup.",
    action: "Make this a mandatory event launch checklist.",
    confidence: "CONFIRMED",
  },
  {
    stage: "On-Site",
    system: "QR lead capture + email incentive + model-interest tagging",
    currentState: "Improving",
    issue: "Still not universal across every event and booth environment.",
    action: "Ban clipboard collection and enforce QR landing workflow only.",
    confidence: "CONFIRMED",
  },
  {
    stage: "Broker pitch",
    system: "Inquiry-quality pitch + exclusive offers",
    currentState: "Partial",
    issue: "Pitch quality varies by team member and event.",
    action: "Use a scripted value pitch with standardized bundle menu.",
    confidence: "PROBABLE",
  },
  {
    stage: "Post-Event",
    system: "7-day recap + lead follow-up + retargeting + 30-day review",
    currentState: "Partial",
    issue: "Follow-up discipline drops after the event energy ends.",
    action: "Create automatic 7-day and 30-day post-event review tasks.",
    confidence: "CONFIRMED",
  },
];

const partnerRows: PartnerRow[] = [
  {
    partnerType: "Broker",
    opportunity: "Homepage placement + spotlight + listing feature",
    bundle: "Event-exclusive broker visibility stack",
    issue: "Strong retention and upsell value, but not fully productized.",
    action: "Sell as event package, not one-off add-ons.",
    confidence: "CONFIRMED",
  },
  {
    partnerType: "Advertiser",
    opportunity: "Email placement + event recap placement + sponsored visibility",
    bundle: "NBAA Visibility Package",
    issue: "High fit for anchor events, under-structured today.",
    action: "Use named sponsor bundles tied to each anchor event.",
    confidence: "PROBABLE",
  },
  {
    partnerType: "Manufacturers / ecosystem partners",
    opportunity: "Thought-leadership and event content tie-in",
    bundle: "Authority partner package",
    issue: "Promising authority play, but still exploratory.",
    action: "Pilot with one or two aligned partners before scaling.",
    confidence: "POSSIBLE",
  },
];

const contentRows: ContentRow[] = [
  {
    asset: "Short videos",
    target: "5+ per major event",
    current: "3.8 avg",
    issue: "Below spec on some events.",
    action: "Assign explicit short-form capture owner before travel.",
    confidence: "CONFIRMED",
  },
  {
    asset: "Broker interviews",
    target: "2 per major event",
    current: "1.2 avg",
    issue: "Underused relationship and authority asset.",
    action: "Book interviews before arrival and capture on-site.",
    confidence: "PROBABLE",
  },
  {
    asset: "Market recap",
    target: "1 per major event",
    current: "Often late",
    issue: "Recaps lose value when not packaged quickly.",
    action: "Publish within 7 days with market implications and partner mentions.",
    confidence: "CONFIRMED",
  },
  {
    asset: "Photography library",
    target: "Complete per major event",
    current: "Inconsistent",
    issue: "Photo capture is still too ad hoc.",
    action: "Use a shot list tied to post-event distribution needs.",
    confidence: "PROBABLE",
  },
];

const measurementRows: MeasurementRow[] = [
  {
    metric: "Tagged event leads",
    current: "148",
    confidence: "PROBABLE",
    issue: "Useful, but not all event-origin leads are tagged equally well.",
    nextMove: "Standardize CRM event-source tagging on every event flow.",
  },
  {
    metric: "Event-linked inquiry lift",
    current: "+13% / 30d",
    confidence: "PROBABLE",
    issue: "Directional but partially blended with other channels.",
    nextMove: "Separate direct event leads from downstream influenced inquiries.",
  },
  {
    metric: "Sponsor / advertiser revenue",
    current: "$31.3K quarter-to-date",
    confidence: "CONFIRMED",
    issue: "Direct revenue is visible, but package source labeling can be cleaner.",
    nextMove: "Use event package IDs across finance and CRM records.",
  },
  {
    metric: "Broker follow-up completion within 7 days",
    current: "69%",
    confidence: "CONFIRMED",
    issue: "Below where event momentum should be converted into account action.",
    nextMove: "Automate owner reminders and weekly follow-up review.",
  },
  {
    metric: "30-day event ROI review completion",
    current: "54%",
    confidence: "PROBABLE",
    issue: "Post-event closure discipline weakens over time.",
    nextMove: "Make 30-day review a required operating checkpoint.",
  },
];

const compareTrendData = {
  WoW: [
    { name: "Mon", value: 1.2 },
    { name: "Tue", value: 1.3 },
    { name: "Wed", value: 1.4 },
    { name: "Thu", value: 1.5 },
    { name: "Fri", value: 1.5 },
    { name: "Sat", value: 1.6 },
    { name: "Sun", value: 1.6 },
  ],
  MoM: [
    { name: "W1", value: 1.1 },
    { name: "W2", value: 1.3 },
    { name: "W3", value: 1.5 },
    { name: "W4", value: 1.6 },
  ],
  "90D": [
    { name: "Jan", value: 1.0 },
    { name: "Feb", value: 1.2 },
    { name: "Mar", value: 1.4 },
    { name: "Apr", value: 1.6 },
  ],
} as const;

const revenueChartData = revenueRows.map((row) => ({
  name: row.package.split(" ")[0],
  target: row.target.includes("$") ? Number(row.target.replace(/[^0-9.]/g, "")) : 20,
  current: row.current.includes("$") ? Number(row.current.replace(/[^0-9.]/g, "")) : Number(row.current.replace(/[^0-9.]/g, "")) || 16,
}));

function matchesConfidence(confidence: Confidence, hideProbable: boolean, filter: string) {
  if (hideProbable && confidence !== "CONFIRMED") return false;
  if (filter === "confirmed" && confidence !== "CONFIRMED") return false;
  if (filter === "probable" && !(confidence === "CONFIRMED" || confidence === "PROBABLE")) return false;
  if (filter === "possible" && confidence !== "POSSIBLE") return false;
  return true;
}

function confidenceClasses(confidence: Confidence) {
  if (confidence === "CONFIRMED") return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
  if (confidence === "PROBABLE") return "bg-sky-500/15 text-sky-300 border-sky-400/30";
  return "bg-amber-500/15 text-amber-300 border-amber-400/30";
}

function toneClasses(tone?: KPI["statusTone"]) {
  if (tone === "good") return "from-emerald-500/15 to-transparent border-emerald-500/20";
  if (tone === "bad") return "from-rose-500/15 to-transparent border-rose-500/20";
  return "from-amber-500/15 to-transparent border-amber-500/20";
}

function priorityClasses(priority: Opportunity["priority"]) {
  if (priority === "Now") return "bg-rose-500/15 text-rose-200 border-rose-400/30";
  if (priority === "Next") return "bg-amber-500/15 text-amber-200 border-amber-400/30";
  return "bg-slate-500/15 text-slate-200 border-slate-400/30";
}

function scoreClasses(score: number) {
  if (score >= 90) return "text-emerald-300";
  if (score >= 75) return "text-amber-300";
  return "text-slate-300";
}

function getSavedViewState(nextRole: RoleKey, mode: SavedViewMode | undefined) {
  switch (mode) {
    case "pre_event_pipeline":
      return {
        selectedTypes: ["Pre-Event", "Revenue Design"] as OpportunityType[],
        activeTab: "pre" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "probable",
        showPinnedOnly: true,
        showDoNotActYet: true,
      };
    case "on_site_monetization":
      return {
        selectedTypes: ["On-Site Execution", "Broker & Advertiser", "Revenue Design"] as OpportunityType[],
        activeTab: "onsite" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "probable",
        showPinnedOnly: true,
        showDoNotActYet: true,
      };
    case "executive_roi":
      return {
        selectedTypes: ["Revenue Design", "Post-Event Capture", "Broker & Advertiser"] as OpportunityType[],
        activeTab: "revenue" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "probable",
        showPinnedOnly: true,
        showDoNotActYet: false,
      };
    case "content_multiplier":
      return {
        selectedTypes: ["Content Multiplier", "Pre-Event", "Post-Event Capture"] as OpportunityType[],
        activeTab: "content" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "probable",
        showPinnedOnly: false,
        showDoNotActYet: true,
      };
    case "measurement_risk":
      return {
        selectedTypes: ["Measurement Risk", "Post-Event Capture"] as OpportunityType[],
        activeTab: "measurement" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "probable",
        showPinnedOnly: false,
        showDoNotActYet: true,
      };
    case "board_safe":
      return {
        selectedTypes: ["Revenue Design", "Broker & Advertiser", "Measurement Risk"] as OpportunityType[],
        activeTab: "measurement" as ViewTab,
        confidenceFilter: "confirmed",
        showPinnedOnly: true,
        showDoNotActYet: false,
      };
    case "broker_advertiser_growth":
      return {
        selectedTypes: ["Broker & Advertiser", "Revenue Design"] as OpportunityType[],
        activeTab: "partners" as ViewTab,
        confidenceFilter: "confirmed",
        showPinnedOnly: false,
        showDoNotActYet: false,
      };
    case "critical_gaps":
      return {
        selectedTypes: ["Pre-Event", "On-Site Execution", "Measurement Risk"] as OpportunityType[],
        activeTab: "overview" as ViewTab,
        confidenceFilter: "confirmed",
        showPinnedOnly: true,
        showDoNotActYet: false,
      };
    case "weekly_priorities":
    default:
      return {
        selectedTypes: opportunityTypes,
        activeTab: "overview" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "all",
        showPinnedOnly: false,
        showDoNotActYet: true,
      };
  }
}

export default function AvIntelOSPage5D() {
  const [role, setRole] = useState<RoleKey>("casey");
  const [dateRange, setDateRange] = useState("30d");
  const [comparePeriod, setComparePeriod] = useState<ComparePeriod>("WoW");
  const [activeTab, setActiveTab] = useState<ViewTab>("overview");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [selectedSavedView, setSelectedSavedView] = useState(savedViewsByRole.casey[0].name);
  const [selectedTypes, setSelectedTypes] = useState<OpportunityType[]>(opportunityTypes);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [showDoNotActYet, setShowDoNotActYet] = useState(true);
  const [search, setSearch] = useState("");
  const [openOpportunityId, setOpenOpportunityId] = useState<string | null>(null);

  const activeRole = roles[role];
  const savedViews = savedViewsByRole[role];

  const filteredKPIs = useMemo(() => kpis.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredOpportunities = useMemo(() => opportunities
    .filter((item) => {
      if (!matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)) return false;
      if (!selectedTypes.includes(item.type)) return false;
      if (showPinnedOnly && !item.pinned) return false;
      if (!showDoNotActYet && item.doNotActYet) return false;
      if (search && !`${item.signal} ${item.action} ${item.owner} ${item.type}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b.priorityScore - a.priorityScore), [activeRole.hideProbable, confidenceFilter, selectedTypes, showPinnedOnly, showDoNotActYet, search]);

  const filteredTiers = useMemo(() => eventTierRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredRevenue = useMemo(() => revenueRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredExecution = useMemo(() => executionRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredPartners = useMemo(() => partnerRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredContent = useMemo(() => contentRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredMeasurement = useMemo(() => measurementRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);

  const opportunitiesById = useMemo(() => new Map(opportunities.map((item) => [item.id, item])), []);
  const selectedOpportunity = openOpportunityId ? opportunitiesById.get(openOpportunityId) ?? null : null;
  const pinned = filteredOpportunities.filter((item) => item.pinned);

  function toggleType(type: OpportunityType) {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== type);
      }
      return [...prev, type];
    });
  }

  function applySavedView(viewName: string) {
    setSelectedSavedView(viewName);
    const selectedView = savedViews.find((item) => item.name === viewName);
    const nextState = getSavedViewState(role, selectedView?.mode as SavedViewMode | undefined);
    setSelectedTypes(nextState.selectedTypes);
    setActiveTab(nextState.activeTab);
    setConfidenceFilter(nextState.confidenceFilter);
    setShowPinnedOnly(nextState.showPinnedOnly);
    setShowDoNotActYet(nextState.showDoNotActYet);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
        <div className="mb-4 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Page structure</div>
              <div className="mt-1 text-sm text-slate-300">Event Revenue Command translates Step 5D into an operating surface: event tiering, revenue design, pre-event systemization, on-site execution, post-event capture, broker and advertiser integration, content leverage, and event ROI governance.</div>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewTab)} className="w-full xl:w-auto">
              <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0 xl:w-auto">
                <TabsTrigger value="overview" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Overview</TabsTrigger>
                <TabsTrigger value="tiers" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Event Tiers</TabsTrigger>
                <TabsTrigger value="revenue" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Revenue Model</TabsTrigger>
                <TabsTrigger value="pre" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Pre-Event</TabsTrigger>
                <TabsTrigger value="onsite" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">On-Site</TabsTrigger>
                <TabsTrigger value="post" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Post-Event</TabsTrigger>
                <TabsTrigger value="partners" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Broker & Advertiser</TabsTrigger>
                <TabsTrigger value="content" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Content Leverage</TabsTrigger>
                <TabsTrigger value="measurement" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Measurement & SOP</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-300/80">
                    <CalendarRange className="h-4 w-4" />
                    Av/IntelOS · Page 5D
                  </div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">Event Revenue Command</h1>
                  <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">Monetization, broker and advertiser leverage, lead capture, authority content, and post-event revenue control across the GlobalAir event system.</p>
                </div>
                <div className="grid gap-3 text-sm md:grid-cols-2 xl:min-w-[520px]">
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="text-slate-400">Role</span>
                    <Select value={role} onValueChange={(v) => {
                      const nextRole = v as RoleKey;
                      const nextView = savedViewsByRole[nextRole][0];
                      const nextState = getSavedViewState(nextRole, nextView.mode as SavedViewMode);
                      setRole(nextRole);
                      setSelectedSavedView(nextView.name);
                      setSelectedTypes(nextState.selectedTypes);
                      setActiveTab(nextState.activeTab);
                      setConfidenceFilter(nextState.confidenceFilter);
                      setShowPinnedOnly(nextState.showPinnedOnly);
                      setShowDoNotActYet(nextState.showDoNotActYet);
                    }}>
                      <SelectTrigger className="w-[190px] border-white/10 bg-slate-900/80"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casey">Casey Jones</SelectItem>
                        <SelectItem value="clay">Clay Martin</SelectItem>
                        <SelectItem value="jeffrey">Jeffrey Carrithers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="text-slate-400">Saved view</span>
                    <Select value={selectedSavedView} onValueChange={applySavedView}>
                      <SelectTrigger className="w-[230px] border-white/10 bg-slate-900/80"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {savedViews.map((view) => <SelectItem key={view.name} value={view.name}>{view.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="text-slate-400">Date range</span>
                    <Tabs value={dateRange} onValueChange={setDateRange} className="w-auto">
                      <TabsList className="bg-slate-900/80">
                        <TabsTrigger value="7d">7D</TabsTrigger>
                        <TabsTrigger value="30d">30D</TabsTrigger>
                        <TabsTrigger value="90d">90D</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="text-slate-400">Compare period</span>
                    <Tabs value={comparePeriod} onValueChange={(v) => setComparePeriod(v as ComparePeriod)} className="w-auto">
                      <TabsList className="bg-slate-900/80">
                        <TabsTrigger value="WoW">WoW</TabsTrigger>
                        <TabsTrigger value="MoM">MoM</TabsTrigger>
                        <TabsTrigger value="90D">90D</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-bold"><Target className="h-5 w-5 text-sky-300" /> Event Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Strategic doctrine</div>
                <div className="mt-2 font-semibold text-white">Events are not vanity spend.</div>
                <p className="mt-2 leading-6">They must strengthen broker relationships, acquire high-intent buyers, increase advertiser revenue, produce authority content, capture first-party data, shorten deal cycles, and increase platform gravity.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Core event return rule</div>
                <div className="mt-2 font-semibold text-white">Long-term event return target = minimum 2x event cost.</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><Filter className="h-5 w-5 text-sky-300" /> Event filters</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events, packages, blockers" className="border-white/10 bg-slate-950/80 pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {opportunityTypes.map((type) => {
                  const active = selectedTypes.includes(type);
                  return (
                    <button key={type} onClick={() => toggleType(type)} className={`rounded-full border px-3 py-1.5 text-sm transition ${active ? "border-sky-400/30 bg-sky-500/15 text-sky-200" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>
                      {type}
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div><div className="text-sm font-medium text-white">Pinned only</div><div className="text-xs text-slate-400">Weekly operator focus</div></div>
                  <Switch checked={showPinnedOnly} onCheckedChange={setShowPinnedOnly} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div><div className="text-sm font-medium text-white">Show do not act yet</div><div className="text-xs text-slate-400">Weak-confidence items</div></div>
                  <Switch checked={showDoNotActYet} onCheckedChange={setShowDoNotActYet} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div><div className="text-sm font-medium text-white">Confidence</div><div className="text-xs text-slate-400">Role-aware gate</div></div>
                  <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                    <SelectTrigger className="w-[170px] border-white/10 bg-slate-900/80"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="confirmed">Confirmed only</SelectItem>
                      <SelectItem value="probable">Probable +</SelectItem>
                      <SelectItem value="possible">Possible only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-bold"><Sparkles className="h-5 w-5 text-amber-300" /> Pinned this week</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {pinned.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-2"><div className="font-medium text-white">{item.type}</div><div className={`font-semibold ${scoreClasses(item.priorityScore)}`}>{item.priorityScore}</div></div>
                  <div className="mt-1 text-slate-300">{item.signal}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6 rounded-2xl border-amber-400/20 bg-amber-500/10 text-amber-50">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Event doctrine warning</AlertTitle>
          <AlertDescription>Do not treat events as attendance or brand theater. This page assumes revenue design, structured lead capture, broker and advertiser packaging, content multiplication, and 7-day / 30-day follow-up governance.</AlertDescription>
        </Alert>

        {activeTab === "overview" && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              {filteredKPIs.map((kpi) => (
                <Card key={kpi.id} className={`overflow-hidden rounded-3xl border bg-gradient-to-br ${toneClasses(kpi.statusTone)} bg-slate-900 text-slate-100 shadow-xl`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{kpi.id}</div>
                        <div className="mt-1 text-sm text-slate-300">{kpi.label}</div>
                      </div>
                      <Badge className={`border ${confidenceClasses(kpi.confidence)}`}>{kpi.confidence}</Badge>
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div className="text-3xl font-black tracking-tight">{kpi.value}</div>
                      <div className={`flex items-center gap-1 text-sm ${kpi.deltaDirection === "down" && kpi.statusTone !== "good" ? "text-rose-300" : "text-emerald-300"}`}>
                        {kpi.deltaDirection === "up" ? <TrendingUp className="h-4 w-4" /> : kpi.deltaDirection === "down" ? <TrendingDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span>{kpi.delta}</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-xs text-slate-400">
                      <div className="flex items-center justify-between gap-3"><span>Source</span><span className="text-right text-slate-300">{kpi.source}</span></div>
                      <div className="flex items-center justify-between gap-3"><span>Freshness</span><span className="text-slate-300">{kpi.freshness}</span></div>
                      <p className="pt-2 leading-5 text-slate-300">{kpi.detail}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
                <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-xl font-bold"><AlertTriangle className="h-5 w-5 text-amber-300" /> Top event opportunities</CardTitle><Button variant="ghost" className="rounded-xl border border-white/10 bg-white/5" onClick={() => setActiveTab("revenue")}>Open revenue model <ChevronRight className="ml-2 h-4 w-4" /></Button></div></CardHeader>
                <CardContent className="space-y-3">
                  {filteredOpportunities.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{item.type}</Badge>
                            <Badge className={`border ${priorityClasses(item.priority)}`}>{item.priority}</Badge>
                            <Badge className={`border ${confidenceClasses(item.confidence)}`}>{item.confidence}</Badge>
                            {item.pinned && <Badge className="border border-amber-400/30 bg-amber-500/15 text-amber-200">Pinned</Badge>}
                            {item.doNotActYet && <Badge className="border border-slate-400/30 bg-slate-500/15 text-slate-200">Do not act yet</Badge>}
                          </div>
                          <div className="mt-2 font-semibold text-white">{item.signal}</div>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{item.action}</p>
                        </div>
                        <div className="grid min-w-[210px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                          <div className="flex items-center justify-between"><span className="text-slate-400">Score</span><span className={scoreClasses(item.priorityScore)}>{item.priorityScore}</span></div>
                          <div className="flex items-center justify-between"><span className="text-slate-400">Time</span><span>{item.timeToImpact}</span></div>
                          <Button variant="ghost" className="justify-between rounded-xl border border-white/10 bg-white/5 hover:bg-white/10" onClick={() => setOpenOpportunityId(item.id)}>Why this surfaced <ChevronRight className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
                <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Gauge className="h-5 w-5 text-sky-300" /> Event return trend</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={compareTrendData[comparePeriod]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                        <YAxis stroke="rgba(255,255,255,0.45)" />
                        <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                        <Line type="monotone" dataKey="value" stroke="currentColor" className="text-sky-300" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Use <span className="font-semibold text-white">{comparePeriod}</span> for operating cadence. Long-term target remains minimum 2x event cost return.</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "tiers" && (
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><MapPinned className="h-5 w-5 text-sky-300" /> Event classification model</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {filteredTiers.map((row) => (
                <div key={row.tier} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.tier}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                  <div className="mt-2 text-sm text-slate-300">Examples: {row.examples}</div>
                  <div className="mt-1 text-sm text-slate-300">Objective: {row.objective}</div>
                  <div className="mt-1 text-sm text-slate-300">ROI rule: {row.roiRule}</div>
                  <div className="mt-2 text-sm text-slate-300">Issue: {row.issue}</div>
                  <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "revenue" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><DollarSign className="h-5 w-5 text-sky-300" /> Revenue model design</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredRevenue.map((row) => (
                  <div key={row.package} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.package}</div><Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.type}</Badge><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-2 text-sm text-slate-300">Target: {row.target} · Current: {row.current}</div>
                    <div className="mt-1 text-sm text-slate-300">Issue: {row.issue}</div>
                    <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-emerald-300" /> Package target vs current</CardTitle></CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                    <YAxis stroke="rgba(255,255,255,0.45)" />
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                    <Bar dataKey="target" fill="currentColor" className="text-amber-300" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="current" fill="currentColor" className="text-sky-300" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "pre" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Megaphone className="h-5 w-5 text-sky-300" /> 30–45 day pre-event stack</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredExecution.filter((row) => row.stage === "Pre-Event").map((row) => (
                  <div key={row.stage} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.system}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-2 text-sm text-slate-300">Current state: {row.currentState}</div>
                    <div className="mt-1 text-sm text-slate-300">Issue: {row.issue}</div>
                    <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                  </div>
                ))}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Required stack: “Who’s attending?” email, broker outreach, social countdown series, event landing page with scheduler + spotlight + featured aircraft, and PPC event geo layer.</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><CalendarRange className="h-5 w-5 text-amber-300" /> Pre-event doctrine</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">This phase is the most important. Most event waste happens before the team travels.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Major events should enter with meeting targets, audience warm-up, a dedicated event page, and geo/event retargeting already active.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">If an event launches without the pre-event stack, it should be treated as underprepared in the system.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "onsite" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><QrCode className="h-5 w-5 text-sky-300" /> On-site execution framework</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredExecution.filter((row) => row.stage !== "Pre-Event").map((row) => (
                  <div key={row.stage} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.stage}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-2 text-sm text-slate-300">System: {row.system}</div>
                    <div className="mt-1 text-sm text-slate-300">Current state: {row.currentState}</div>
                    <div className="mt-1 text-sm text-slate-300">Issue: {row.issue}</div>
                    <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Handshake className="h-5 w-5 text-emerald-300" /> Floor rule</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">You are not there to have a booth. You are there to capture leads, record content, strengthen relationships, and sell premium placements.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">No clipboard lead collection. Every lead should route through QR → event landing page → email capture incentive → model-interest selection → CRM tag: Event – [Name].</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Broker pitch must be structured: “Here’s how GlobalAir increases your inquiry quality,” followed by event-exclusive offers.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "post" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Workflow className="h-5 w-5 text-sky-300" /> Post-event revenue capture</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Within 7 days: event recap email, broker follow-up, retargeting ads to event visitors, highlighted listings discussed, and scheduled follow-up calls.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Within 30 days: review inquiry lift from event leads, advertiser revenue increase, and broker engagement growth.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">This phase decides whether event energy turns into revenue or evaporates.</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Clock3 className="h-5 w-5 text-amber-300" /> Follow-up discipline</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">7-day broker follow-up completion should become a non-negotiable KPI.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">30-day review should be a required checkpoint with lead volume, sponsor revenue, and broker relationship outcomes reviewed together.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Missed follow-up is not a small process miss — it is lost event monetization.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "partners" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-sky-300" /> Broker & advertiser integration</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredPartners.map((row) => (
                  <div key={row.partnerType} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.partnerType}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-2 text-sm text-slate-300">Opportunity: {row.opportunity}</div>
                    <div className="mt-1 text-sm text-slate-300">Bundle: {row.bundle}</div>
                    <div className="mt-1 text-sm text-slate-300">Issue: {row.issue}</div>
                    <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Briefcase className="h-5 w-5 text-emerald-300" /> Bundle doctrine</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Events allow upsells into homepage placement, email features, social spotlight, YouTube feature, and sponsored listing boosts.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Named packages such as an “NBAA Visibility Package” increase salability, clarity, and perceived value.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Relationship outcomes should be treated as monetization infrastructure, not soft benefits.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "content" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Video className="h-5 w-5 text-sky-300" /> Content multiplier engine</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredContent.map((row) => (
                  <div key={row.asset} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.asset}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-2 text-sm text-slate-300">Target: {row.target} · Current: {row.current}</div>
                    <div className="mt-1 text-sm text-slate-300">Issue: {row.issue}</div>
                    <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><PlayCircle className="h-5 w-5 text-amber-300" /> Content doctrine</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Every major event must produce: 5+ short videos, 2 broker interviews, 1 market recap, aircraft highlight features, and a photography library.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Those assets should feed social, email, YouTube, and SEO. Events are content multipliers.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">The event ends on the floor. The authority yield continues afterward only if packaging is immediate and disciplined.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "measurement" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="h-5 w-5 text-sky-300" /> Measurement framework</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredMeasurement.map((row) => (
                  <div key={row.metric} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.metric}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-2 text-sm text-slate-300">Current: {row.current}</div>
                    <div className="mt-1 text-sm text-slate-300">Issue: {row.issue}</div>
                    <div className="mt-1 text-sm text-slate-200">Next move: {row.nextMove}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><CheckCircle2 className="h-5 w-5 text-emerald-300" /> Operational SOP</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Before event:</span> event classification, budget rule, package matrix, event page, meetings, geo retargeting, outreach.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">On-site:</span> QR capture only, broker pitch script, premium placement offer, content capture checklist.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Within 7 days:</span> recap email, broker follow-up, retargeting, listing highlights, scheduled calls.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Within 30 days:</span> review inquiry lift, sponsor revenue, broker engagement growth, and payback vs event cost.</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-sky-300" /> Event action framework</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Fast wins: standardize the 30–45 day pre-event stack, enforce QR-only lead capture, and productize event packages before anchor events.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Strategic moves: tie every event to broker and advertiser expansion, raise content yield per event, and enforce 7-day / 30-day follow-up governance.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Blockers: uneven event preparation, inconsistent package menus, imperfect event-source tagging, and inconsistent post-event review discipline.</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-emerald-300" /> Event revenue comparison</CardTitle></CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                  <YAxis stroke="rgba(255,255,255,0.45)" />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                  <Bar dataKey="target" fill="currentColor" className="text-amber-300" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="current" fill="currentColor" className="text-sky-300" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Sheet open={!!selectedOpportunity} onOpenChange={(open) => !open && setOpenOpportunityId(null)}>
          <SheetContent side="right" className="w-full border-white/10 bg-slate-950 text-slate-100 sm:max-w-xl">
            {selectedOpportunity && (
              <>
                <SheetHeader>
                  <SheetTitle className="text-left text-xl text-white">Why this surfaced</SheetTitle>
                  <SheetDescription className="text-left text-slate-400">Event recommendation logic, blockers, and expected lift inspection drawer.</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{selectedOpportunity.type}</Badge>
                    <Badge className={`border ${confidenceClasses(selectedOpportunity.confidence)}`}>{selectedOpportunity.confidence}</Badge>
                    <Badge className={`border ${priorityClasses(selectedOpportunity.priority)}`}>{selectedOpportunity.priority}</Badge>
                    {selectedOpportunity.doNotActYet && <Badge className="border border-slate-400/30 bg-slate-500/15 text-slate-200">Do not act yet</Badge>}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{selectedOpportunity.signal}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{selectedOpportunity.gap}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Likely cause</div><p className="mt-2 text-sm leading-6 text-slate-200">{selectedOpportunity.likelyCause}</p></div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Why this surfaced</div><ul className="mt-2 space-y-2 text-sm text-slate-200">{selectedOpportunity.whySurfaced.map((reason) => <li key={reason}>• {reason}</li>)}</ul></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Owner</div><div className="mt-2 text-slate-200">{selectedOpportunity.owner}</div><div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Time to impact</div><div className="mt-2 flex items-center gap-2 text-slate-200"><Clock3 className="h-4 w-4 text-sky-300" /> {selectedOpportunity.timeToImpact}</div></div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Priority score</div><div className={`mt-2 text-2xl font-bold ${scoreClasses(selectedOpportunity.priorityScore)}`}>{selectedOpportunity.priorityScore}</div><div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Blocker</div><div className="mt-2 text-slate-200">{selectedOpportunity.blocker}</div></div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Expected lift range</div><div className="mt-3 grid gap-2"><div className="flex items-center justify-between"><span className="text-slate-400">Conservative</span><span className="text-slate-200">{selectedOpportunity.expectedLift.conservative}</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Expected</span><span className="text-emerald-300">{selectedOpportunity.expectedLift.expected}</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Aggressive</span><span className="text-slate-200">{selectedOpportunity.expectedLift.aggressive}</span></div></div></div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Dependency</div><p className="mt-2 text-slate-200">{selectedOpportunity.dependency}</p><div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Recommended action</div><p className="mt-2 text-slate-200">{selectedOpportunity.action}</p></div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
