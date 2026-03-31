import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BellRing,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Filter,
  Gauge,
  Mail,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Workflow,
  Send,
  Layers3,
  Repeat,
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
    { name: "Weekly Lifecycle Priorities", description: "Top sequence gaps, scoring drift, and nurture leaks.", mode: "weekly_priorities" },
    { name: "Piston Reinforcement", description: "Model-viewers, piston-heavy users, and broker-support nurture.", mode: "piston_reinforcement" },
    { name: "Abandoned Inquiry Recovery", description: "Form-start recovery and trust reinforcement flows.", mode: "abandoned_inquiry" },
  ],
  clay: [
    { name: "Executive Lifecycle Efficiency", description: "Email-assisted inquiry performance and suppression health.", mode: "executive_efficiency" },
    { name: "Attribution Risk", description: "Identity capture, gclid pass-through, and offline tagging gaps.", mode: "attribution_risk" },
    { name: "Audience Architecture", description: "Tiered segments, score distribution, and sequence coverage.", mode: "audience_architecture" },
  ],
  jeffrey: [
    { name: "Board-Safe Lifecycle View", description: "Confirmed assisted value and system-safe lifecycle signals only.", mode: "board_safe" },
    { name: "Broker Satisfaction Support", description: "Post-inquiry and piston-support sequences affecting broker value.", mode: "broker_support" },
    { name: "Critical Lifecycle Risks", description: "Only major blockers to lifecycle contribution.", mode: "critical_risks" },
  ],
} as const;

const roles = {
  casey: { label: "Casey Jones", title: "Head of Marketing", hideProbable: false },
  clay: { label: "Clay Martin", title: "COO", hideProbable: false },
  jeffrey: { label: "Jeffrey Carrithers", title: "CEO", hideProbable: true },
} as const;

type RoleKey = keyof typeof roles;
type Confidence = "CONFIRMED" | "PROBABLE" | "POSSIBLE";
type ViewTab = "overview" | "audiences" | "sequences" | "scoring" | "retargeting" | "newsletter" | "attribution" | "trust";
type ComparePeriod = "WoW" | "MoM" | "90D";
type SavedViewMode =
  | "weekly_priorities"
  | "piston_reinforcement"
  | "abandoned_inquiry"
  | "executive_efficiency"
  | "attribution_risk"
  | "audience_architecture"
  | "board_safe"
  | "broker_support"
  | "critical_risks";
type OpportunityType =
  | "Sequence Gap"
  | "Scoring Drift"
  | "Abandoned Inquiry"
  | "Retargeting Sync"
  | "Attribution Risk"
  | "Newsletter Segmentation"
  | "Broker Support";

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

type AudienceRow = {
  audience: string;
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  size: string;
  scoreBand: string;
  activeSequences: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

type SequenceRow = {
  sequence: string;
  shortLabel: string;
  trigger: string;
  cadence: string;
  goal: string;
  assistedQI: string;
  status: "Healthy" | "Needs Work" | "Missing";
  issue: string;
  action: string;
  confidence: Confidence;
};

type RetargetingRow = {
  segment: string;
  destinations: string;
  messageMirror: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

type AttributionRow = {
  layer: string;
  status: string;
  coverage: string;
  issue: string;
  nextMove: string;
  confidence: Confidence;
};

const opportunityTypes: OpportunityType[] = [
  "Sequence Gap",
  "Scoring Drift",
  "Abandoned Inquiry",
  "Retargeting Sync",
  "Attribution Risk",
  "Newsletter Segmentation",
  "Broker Support",
];

const kpis: KPI[] = [
  {
    id: "L001",
    label: "Email-Assisted Qualified Inquiries",
    value: "34",
    delta: "+11.5% MoM",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Lifecycle assist model",
    freshness: "42 min ago",
    detail: "Directional and useful, but still partly constrained by identity stitching and offline tagging gaps.",
    statusTone: "good",
  },
  {
    id: "L002",
    label: "Return Visit Rate",
    value: "28%",
    delta: "+4 pts MoM",
    deltaDirection: "up",
    confidence: "CONFIRMED",
    source: "Lifecycle dashboard",
    freshness: "42 min ago",
    detail: "Healthy sign that email is reinforcing multi-visit aviation buying behavior.",
    statusTone: "good",
  },
  {
    id: "L003",
    label: "Score Progression Rate",
    value: "19%",
    delta: "+2 pts MoM",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Lead score engine",
    freshness: "Today",
    detail: "Some casual researchers are moving into active-evaluator state, but progression is still uneven by segment.",
    statusTone: "warn",
  },
  {
    id: "L004",
    label: "Retargeting Audience Sync",
    value: "86%",
    delta: "+6 pts MoM",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Audience sync audit",
    freshness: "Today",
    detail: "Cross-channel reinforcement is functioning, but some segments still do not mirror sequence logic perfectly.",
    statusTone: "warn",
  },
  {
    id: "L005",
    label: "Lifecycle Attribution Integrity",
    value: "Diagnose",
    delta: "3 blockers active",
    deltaDirection: "down",
    confidence: "CONFIRMED",
    source: "Identity capture + backend audit",
    freshness: "58 min ago",
    detail: "gclid pass-through, user ID persistence, and offline broker tagging still limit board-safe lifecycle ROI reporting.",
    statusTone: "bad",
  },
  {
    id: "L006",
    label: "Newsletter Segmentation Coverage",
    value: "61%",
    delta: "+9 pts MoM",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Email ops tagging review",
    freshness: "Today",
    detail: "The system is moving away from one-blast-for-all, but there is still work to fully enforce segment-first sends.",
    statusTone: "warn",
  },
];

const opportunities: Opportunity[] = [
  {
    id: "life-001",
    type: "Abandoned Inquiry",
    signal: "Form-start users are not being recovered aggressively enough",
    gap: "High-intent users begin inquiry paths but do not receive strong enough trust and process reinforcement.",
    likelyCause: "Abandoned-inquiry sequence exists conceptually, but message depth and trigger discipline remain inconsistent.",
    whySurfaced: [
      "Form start is a Tier 2 high-intent behavior",
      "Abandoned inquiry sequence is one of the clearest immediate lifecycle win paths",
      "Trust reinforcement and buying-process education are not yet universal in recovery flows",
    ],
    expectedLift: { conservative: "+2 assisted inquiries / 30d", expected: "+5", aggressive: "+9" },
    action: "Tighten abandoned-inquiry automation with Day 1 recovery, Day 3 FAQ/process reassurance, and Day 7 broker trust reinforcement.",
    owner: "Lifecycle Lead",
    dependency: "Reliable form-start trigger and template blocks",
    blocker: "Form event and CRM handoff still not perfectly standardized",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 95,
    timeToImpact: "3–10 days",
    pinned: true,
  },
  {
    id: "life-002",
    type: "Sequence Gap",
    signal: "Model-interest nurture is not yet deep enough on top aircraft pathways",
    gap: "Viewed-model and PDF-download users are captured, but reinforcement still lacks enough model-specific depth in some clusters.",
    likelyCause: "Sequence structure exists, but some models do not yet get full listings/specs/trends/new-listing progression.",
    whySurfaced: [
      "Model Interest Reinforcement is a core Step 5B sequence",
      "Model-viewer and PDF-downloader audiences are Tier 1 intent segments",
      "Top piston models need stronger lifecycle reinforcement to support buyer progression",
    ],
    expectedLift: { conservative: "+3% return visits", expected: "+7%", aggressive: "+11%" },
    action: "Expand model-specific reinforcement so each priority model sequence includes listings, specs, market trends, and new-listing alerts on schedule.",
    owner: "Lifecycle + Content",
    dependency: "Model content blocks and dynamic feed insertion",
    blocker: "Not all model clusters have modular content ready",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 93,
    timeToImpact: "1–2 weeks",
    pinned: true,
  },
  {
    id: "life-003",
    type: "Retargeting Sync",
    signal: "Email audiences do not yet mirror paid retargeting perfectly across all lifecycle states",
    gap: "Cross-channel reinforcement exists, but some audience transitions and message mirroring remain incomplete.",
    likelyCause: "Audience sync is active, but sequencing and ad creative alignment are not yet fully symmetrical.",
    whySurfaced: [
      "Step 5B explicitly requires sync to Google Ads, Meta, and YouTube",
      "Retargeting creative should mirror email content",
      "High-score and non-converter users still need cleaner cross-channel reinforcement",
    ],
    expectedLift: { conservative: "+2% assisted lift", expected: "+5%", aggressive: "+8%" },
    action: "Sync all core lifecycle audiences into paid platforms with mirrored creative themes and cadence-aware exclusions.",
    owner: "Lifecycle + Paid",
    dependency: "Audience destination QA",
    blocker: "Sequence-state logic is not fully mirrored in every ad platform",
    confidence: "PROBABLE",
    priority: "Next",
    priorityScore: 84,
    timeToImpact: "1–3 weeks",
    pinned: true,
  },
  {
    id: "life-004",
    type: "Scoring Drift",
    signal: "Behavioral scoring works, but score progression is not yet operationalized enough in cadence control",
    gap: "Users are scored, but messaging and suppression still do not always adapt aggressively enough to score changes.",
    likelyCause: "Score framework exists, but active evaluator and high-intent tiers are not yet fully mapped to cadence and content rules.",
    whySurfaced: [
      "Step 5B defines 0–5, 6–12, and 13+ score tiers",
      "Cadence should change based on score",
      "Some sequence logic still looks more static than score-reactive",
    ],
    expectedLift: { conservative: "Cleaner cadence control", expected: "Higher intent progression", aggressive: "Stronger inquiry probability" },
    action: "Tie email cadence, content density, and suppression logic more tightly to score-tier changes across all major sequences.",
    owner: "Lifecycle Ops",
    dependency: "Score-state triggers and QA",
    blocker: "Scoring logic not fully visible in all workflow branches",
    confidence: "PROBABLE",
    priority: "Next",
    priorityScore: 81,
    timeToImpact: "2–4 weeks",
  },
  {
    id: "life-005",
    type: "Newsletter Segmentation",
    signal: "Newsletter repositioning is underway but not fully segmented by aircraft and content interest",
    gap: "Some sends are still too broad relative to the lifecycle playbook doctrine.",
    likelyCause: "Legacy newsletter behavior is easier to execute than fully segmented sends with suppression rules.",
    whySurfaced: [
      "Step 5B requires moving away from one-newsletter-to-all",
      "Behavioral suppression should deprioritize irrelevant categories",
      "Piston, jet, finance, maintenance, and model-specific sends should diverge more clearly",
    ],
    expectedLift: { conservative: "+3% CTR", expected: "+7%", aggressive: "+11%" },
    action: "Finalize segmented newsletter architecture and apply suppression rules so category-heavy users do not keep receiving irrelevant blasts.",
    owner: "Lifecycle Lead",
    dependency: "Segment tagging and content feed rules",
    blocker: "Legacy send framework still active for part of the list",
    confidence: "PROBABLE",
    priority: "Next",
    priorityScore: 79,
    timeToImpact: "2–4 weeks",
  },
  {
    id: "life-006",
    type: "Attribution Risk",
    signal: "Lifecycle ROI still cannot be treated as fully board-safe",
    gap: "Email clearly contributes, but identity and backend attribution gaps still limit final trust.",
    likelyCause: "gclid capture, user ID persistence, inquiry-form pass-through, offline tagging, and enhanced conversions are not yet fully complete.",
    whySurfaced: [
      "Step 5B makes attribution upgrade mandatory",
      "Without backend pass-through and offline tagging, scaling decisions stay partially blind",
      "Jeffrey-safe lifecycle reporting should remain confidence-filtered until closed",
    ],
    expectedLift: { conservative: "Risk containment", expected: "Cleaner lifecycle ROI", aggressive: "Scale-safe budget and lifecycle decisions" },
    action: "Treat lifecycle contribution as directional until identity capture, enhanced conversions, and broker-backend tagging are complete enough for confirmed reporting.",
    owner: "Analytics + Lifecycle",
    dependency: "Identity capture and backend integration",
    blocker: "Offline tagging loop still incomplete",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 96,
    timeToImpact: "Immediate",
    doNotActYet: true,
    pinned: true,
  },
];

const audienceRows: AudienceRow[] = [
  {
    audience: "Viewed specific model page",
    tier: "Tier 1",
    size: "12.4K",
    scoreBand: "0–12",
    activeSequences: "Model Interest Reinforcement",
    issue: "Strong base segment, but not every model pathway has equally deep follow-up content.",
    action: "Prioritize top piston models and add modular sequence blocks by model.",
    confidence: "CONFIRMED",
  },
  {
    audience: "Viewed multiple listings same model",
    tier: "Tier 1",
    size: "4.8K",
    scoreBand: "6–13+",
    activeSequences: "Model Interest + High-intent reminders",
    issue: "Very valuable signal but should accelerate faster into inquiry-focused nurture.",
    action: "Increase urgency and listing-refresh cadence on repeat model-view behavior.",
    confidence: "PROBABLE",
  },
  {
    audience: "Downloaded spec PDF",
    tier: "Tier 1",
    size: "2.9K",
    scoreBand: "6–13+",
    activeSequences: "Model Interest Reinforcement",
    issue: "High-value signal, but some flows still underuse it in scoring and retargeting handoff.",
    action: "Route PDF downloaders into stronger spec, market, and financing follow-up.",
    confidence: "CONFIRMED",
  },
  {
    audience: "Form start no submit",
    tier: "Tier 1",
    size: "1.6K",
    scoreBand: "6–13+",
    activeSequences: "Abandoned Inquiry",
    issue: "Recovery sequence exists but needs stronger consistency and trust content.",
    action: "Tighten trigger timing and trust modules.",
    confidence: "CONFIRMED",
  },
  {
    audience: "Piston-heavy behavior",
    tier: "Tier 1",
    size: "8.7K",
    scoreBand: "0–13+",
    activeSequences: "Piston Focus Accelerator",
    issue: "Broker-support value is strong, but the sequence should be more visible in weekly ops.",
    action: "Use it as a broker-support lifecycle pillar and align with paid retargeting.",
    confidence: "PROBABLE",
  },
  {
    audience: "Paid search visitors",
    tier: "Tier 2",
    size: "9.1K",
    scoreBand: "0–12",
    activeSequences: "Source-based nurture",
    issue: "Good audience base, but source-based logic is still secondary to behavior-driven sequencing.",
    action: "Keep source segmentation supportive, not dominant.",
    confidence: "PROBABLE",
  },
  {
    audience: "Behavior score tiers",
    tier: "Tier 3",
    size: "All contacts",
    scoreBand: "0–5 / 6–12 / 13+",
    activeSequences: "Cadence controls all sequences",
    issue: "The architecture is right, but practical cadence changes are not fully visible in every flow.",
    action: "Expose score-based cadence logic more clearly in automation QA.",
    confidence: "PROBABLE",
  },
];

const sequenceRows: SequenceRow[] = [
  {
    sequence: "Model Interest Reinforcement",
    shortLabel: "Model",
    trigger: "Viewed model page or PDF download",
    cadence: "Day 1 / 3 / 7 / 14",
    goal: "Push to inquiry",
    assistedQI: "11",
    status: "Needs Work",
    issue: "Good structure, but not all model clusters have full depth.",
    action: "Expand dynamic model-specific content coverage.",
    confidence: "CONFIRMED",
  },
  {
    sequence: "Abandoned Inquiry",
    shortLabel: "Recovery",
    trigger: "Form start without submit",
    cadence: "Day 1 / 3 / 7",
    goal: "Recover inquiry",
    assistedQI: "7",
    status: "Needs Work",
    issue: "Recovery path is valuable but should carry more trust and process reinforcement.",
    action: "Improve FAQ, buying-process, and broker trust modules.",
    confidence: "CONFIRMED",
  },
  {
    sequence: "Multi-Model Evaluator",
    shortLabel: "Compare",
    trigger: "Viewed 2+ models in same category",
    cadence: "3-email compare stack",
    goal: "Guide category evaluation",
    assistedQI: "5",
    status: "Healthy",
    issue: "Strong concept with room for comparison-table depth.",
    action: "Increase ownership and financing comparison content.",
    confidence: "PROBABLE",
  },
  {
    sequence: "Piston Focus Accelerator",
    shortLabel: "Piston",
    trigger: "Piston-heavy behavior",
    cadence: "Rolling inventory + ownership cadence",
    goal: "Strengthen piston and broker value",
    assistedQI: "8",
    status: "Healthy",
    issue: "Strong broker-support layer but should be more tightly tied to audience score shifts.",
    action: "Improve urgency by score tier and sync with paid channels.",
    confidence: "PROBABLE",
  },
  {
    sequence: "Post-Inquiry Reinforcement",
    shortLabel: "Post-Inquiry",
    trigger: "Inquiry submitted",
    cadence: "Immediate + checklist follow-up",
    goal: "Increase broker satisfaction",
    assistedQI: "n/a",
    status: "Needs Work",
    issue: "Exists conceptually but not fully formalized as a broker-value system.",
    action: "Make next-steps, financing, inspection, and expectation emails a formal support series.",
    confidence: "PROBABLE",
  },
  {
    sequence: "Inventory Pattern Sequence",
    shortLabel: "Inventory",
    trigger: "New inventory shifts",
    cadence: "Conditional",
    goal: "Adapt to new inventory patterns",
    assistedQI: "n/a",
    status: "Missing",
    issue: "Quarterly SOP implies new sequence creation for inventory pattern shifts, but it is not yet operationalized.",
    action: "Create a quarterly sequence launch process tied to inventory and category shifts.",
    confidence: "POSSIBLE",
  },
];

const retargetingRows: RetargetingRow[] = [
  {
    segment: "Model viewers",
    destinations: "Google Ads / Meta / YouTube",
    messageMirror: "Listings + specs + recent inventory",
    issue: "Mostly synced, but model-specific creative still varies in quality.",
    action: "Mirror the exact email theme and suppress after inquiry progression.",
    confidence: "PROBABLE",
  },
  {
    segment: "PDF downloaders",
    destinations: "Google Ads / Meta",
    messageMirror: "Specs + ownership + compare paths",
    issue: "Very high signal but not always split cleanly from general model viewers.",
    action: "Create spec-focused creative and isolate from broader traffic pools.",
    confidence: "CONFIRMED",
  },
  {
    segment: "High-score users",
    destinations: "Google Ads / Meta / YouTube",
    messageMirror: "Urgency + trust + broker/value reinforcement",
    issue: "Audience exists, but score-aware exclusions need more discipline.",
    action: "Control frequency and adapt creative by score tier.",
    confidence: "PROBABLE",
  },
  {
    segment: "Post-inquiry users",
    destinations: "Meta / YouTube",
    messageMirror: "What happens next + inspection + financing",
    issue: "Should reinforce satisfaction, not just conversion chase.",
    action: "Use broker-support creative and suppress generic sales pressure.",
    confidence: "PROBABLE",
  },
];

const attributionRows: AttributionRow[] = [
  {
    layer: "gclid capture on email click",
    status: "Partial",
    coverage: "72%",
    issue: "Still not universal on every tracked lifecycle path.",
    nextMove: "Complete capture on all high-value click paths.",
    confidence: "PROBABLE",
  },
  {
    layer: "user ID persistence",
    status: "Weak",
    coverage: "43%",
    issue: "Identity stitching remains the biggest lifecycle measurement limiter.",
    nextMove: "Improve persistence across return sessions and devices.",
    confidence: "CONFIRMED",
  },
  {
    layer: "user ID pass-through to inquiry form",
    status: "Partial",
    coverage: "61%",
    issue: "Some inquiry submissions lose lifecycle provenance before backend storage.",
    nextMove: "Standardize hidden fields and backend mapping.",
    confidence: "PROBABLE",
  },
  {
    layer: "offline tagging in broker backend",
    status: "Weak",
    coverage: "29%",
    issue: "Lifecycle influence becomes harder to prove once the broker handoff begins.",
    nextMove: "Close backend status and source tagging loop.",
    confidence: "CONFIRMED",
  },
  {
    layer: "enhanced conversions",
    status: "Partial",
    coverage: "54%",
    issue: "Better than nothing, but not complete enough for scale-safe lifecycle reporting.",
    nextMove: "Increase form pass-through and hashed match discipline.",
    confidence: "PROBABLE",
  },
];

const compareTrendData = {
  WoW: [
    { name: "Mon", value: 26 },
    { name: "Tue", value: 28 },
    { name: "Wed", value: 29 },
    { name: "Thu", value: 31 },
    { name: "Fri", value: 32 },
    { name: "Sat", value: 33 },
    { name: "Sun", value: 34 },
  ],
  MoM: [
    { name: "W1", value: 24 },
    { name: "W2", value: 27 },
    { name: "W3", value: 30 },
    { name: "W4", value: 34 },
  ],
  "90D": [
    { name: "Jan", value: 19 },
    { name: "Feb", value: 24 },
    { name: "Mar", value: 29 },
    { name: "Apr", value: 34 },
  ],
} as const;

const sequenceChartData = sequenceRows.map((row, index) => ({
  name: row.shortLabel,
  assisted: row.assistedQI === "n/a" ? 0 : Number(row.assistedQI),
  health: row.status === "Healthy" ? 9 : row.status === "Needs Work" ? 6 : 3,
  order: index,
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

function statusClasses(status: SequenceRow["status"]) {
  if (status === "Healthy") return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  if (status === "Needs Work") return "border-amber-400/30 bg-amber-500/15 text-amber-200";
  return "border-rose-400/30 bg-rose-500/15 text-rose-200";
}

function scoreClasses(score: number) {
  if (score >= 90) return "text-emerald-300";
  if (score >= 75) return "text-amber-300";
  return "text-slate-300";
}

function getSavedViewState(nextRole: RoleKey, mode: SavedViewMode | undefined) {
  switch (mode) {
    case "piston_reinforcement":
      return {
        selectedTypes: ["Sequence Gap", "Broker Support", "Retargeting Sync"] as OpportunityType[],
        activeTab: "sequences" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "probable",
        showPinnedOnly: false,
        showDoNotActYet: true,
      };
    case "abandoned_inquiry":
      return {
        selectedTypes: ["Abandoned Inquiry", "Attribution Risk"] as OpportunityType[],
        activeTab: "sequences" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "probable",
        showPinnedOnly: true,
        showDoNotActYet: true,
      };
    case "executive_efficiency":
      return {
        selectedTypes: ["Sequence Gap", "Scoring Drift", "Newsletter Segmentation"] as OpportunityType[],
        activeTab: "overview" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "probable",
        showPinnedOnly: true,
        showDoNotActYet: false,
      };
    case "attribution_risk":
      return {
        selectedTypes: ["Attribution Risk", "Retargeting Sync"] as OpportunityType[],
        activeTab: "attribution" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "probable",
        showPinnedOnly: false,
        showDoNotActYet: true,
      };
    case "audience_architecture":
      return {
        selectedTypes: ["Scoring Drift", "Sequence Gap", "Newsletter Segmentation"] as OpportunityType[],
        activeTab: "audiences" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "all",
        showPinnedOnly: false,
        showDoNotActYet: true,
      };
    case "board_safe":
      return {
        selectedTypes: ["Attribution Risk", "Broker Support", "Abandoned Inquiry"] as OpportunityType[],
        activeTab: "trust" as ViewTab,
        confidenceFilter: "confirmed",
        showPinnedOnly: true,
        showDoNotActYet: false,
      };
    case "broker_support":
      return {
        selectedTypes: ["Broker Support", "Sequence Gap"] as OpportunityType[],
        activeTab: "sequences" as ViewTab,
        confidenceFilter: "confirmed",
        showPinnedOnly: false,
        showDoNotActYet: false,
      };
    case "critical_risks":
      return {
        selectedTypes: ["Attribution Risk", "Abandoned Inquiry"] as OpportunityType[],
        activeTab: "trust" as ViewTab,
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

export default function AvIntelOSPage5B() {
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
  const filteredAudiences = useMemo(() => audienceRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter) && (!search || `${item.audience} ${item.issue}`.toLowerCase().includes(search.toLowerCase()))), [activeRole.hideProbable, confidenceFilter, search]);
  const filteredSequences = useMemo(() => sequenceRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter) && (!search || `${item.sequence} ${item.issue}`.toLowerCase().includes(search.toLowerCase()))), [activeRole.hideProbable, confidenceFilter, search]);
  const filteredRetargeting = useMemo(() => retargetingRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredAttribution = useMemo(() => attributionRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);

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
              <div className="mt-1 text-sm text-slate-300">Email & Lifecycle Command translates Step 5B into an operating surface: audience architecture, behavioral scoring, sequence management, retargeting sync, newsletter repositioning, attribution integrity, and broker-support lifecycle systems.</div>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewTab)} className="w-full xl:w-auto">
              <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0 xl:w-auto">
                <TabsTrigger value="overview" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Overview</TabsTrigger>
                <TabsTrigger value="audiences" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Audience Architecture</TabsTrigger>
                <TabsTrigger value="sequences" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Sequence Control</TabsTrigger>
                <TabsTrigger value="scoring" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Score Engine</TabsTrigger>
                <TabsTrigger value="retargeting" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Retargeting Sync</TabsTrigger>
                <TabsTrigger value="newsletter" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Newsletter Repositioning</TabsTrigger>
                <TabsTrigger value="attribution" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Attribution Layer</TabsTrigger>
                <TabsTrigger value="trust" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Data Trust</TabsTrigger>
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
                    <Mail className="h-4 w-4" />
                    Av/IntelOS · Page 5B
                  </div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">Email & Lifecycle Command</h1>
                  <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">Behavior-driven nurture, sequence architecture, score-tier cadence control, retargeting reinforcement, and lifecycle-assisted inquiry growth.</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-bold"><Target className="h-5 w-5 text-sky-300" /> Lifecycle Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Strategic doctrine</div>
                <div className="mt-2 font-semibold text-white">Email is not a newsletter channel. It is a lifecycle multiplier.</div>
                <p className="mt-2 leading-6">This page is built around behavioral automation, long sales cycles, listing reinforcement, abandoned-interest recovery, broker satisfaction, and cross-channel nurture logic.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Primary design rule</div>
                <div className="mt-2 font-semibold text-white">Build sequences, not blasts.</div>
                <p className="mt-2 leading-6">Audience architecture, score tiers, and behavioral triggers should control cadence. Broadcast-style newsletter thinking is intentionally downgraded here.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><Filter className="h-5 w-5 text-sky-300" /> Lifecycle filters</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audiences, sequences, blockers" className="border-white/10 bg-slate-950/80 pl-9" />
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
          <AlertTitle>Lifecycle governance warning</AlertTitle>
          <AlertDescription>Do not treat lifecycle as a batch-send channel. This page assumes behavioral sequencing, score-aware cadence changes, retargeting mirroring, and confidence-aware lifecycle attribution.</AlertDescription>
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
                <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-xl font-bold"><AlertTriangle className="h-5 w-5 text-amber-300" /> Top lifecycle opportunities</CardTitle><Button variant="ghost" className="rounded-xl border border-white/10 bg-white/5" onClick={() => setActiveTab("sequences")}>Open sequence control <ChevronRight className="ml-2 h-4 w-4" /></Button></div></CardHeader>
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
                <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Gauge className="h-5 w-5 text-sky-300" /> Email-assisted inquiry trend</CardTitle></CardHeader>
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
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Use <span className="font-semibold text-white">{comparePeriod}</span> for operating cadence, but keep lifecycle ROI confidence-aware until identity capture and offline tagging are stronger.</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "audiences" && (
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Layers3 className="h-5 w-5 text-sky-300" /> Audience architecture</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {filteredAudiences.map((row) => (
                <div key={row.audience} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="xl:flex-1">
                      <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.audience}</div><Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.tier}</Badge><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                      <div className="mt-2 text-sm text-slate-300">Issue: {row.issue}</div>
                      <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                    </div>
                    <div className="grid min-w-[260px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                      <div className="flex items-center justify-between"><span className="text-slate-400">Size</span><span>{row.size}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Score band</span><span>{row.scoreBand}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Active sequences</span><span className="text-right">{row.activeSequences}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "sequences" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Workflow className="h-5 w-5 text-sky-300" /> Sequence control board</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredSequences.map((row) => (
                  <div key={row.sequence} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.sequence}</div><Badge className={`border ${statusClasses(row.status)}`}>{row.status}</Badge><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Trigger</div><div className="mt-1 text-slate-200">{row.trigger}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Cadence</div><div className="mt-1 text-slate-200">{row.cadence}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Goal</div><div className="mt-1 text-slate-200">{row.goal}</div></div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">Issue: {row.issue}</div>
                    <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                    <div className="mt-2 text-sm text-slate-400">Assisted QI: {row.assistedQI}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Send className="h-5 w-5 text-emerald-300" /> Sequence performance mix</CardTitle></CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sequenceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                    <YAxis stroke="rgba(255,255,255,0.45)" />
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                    <Bar dataKey="assisted" fill="currentColor" className="text-sky-300" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="health" fill="currentColor" className="text-emerald-300" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "scoring" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><BellRing className="h-5 w-5 text-sky-300" /> Behavioral scoring doctrine</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">+3 = PDF download · +5 = form start · +8 = form submit · +2 = return within 7 days · +1 = viewed 3+ listings · +5 = call inquiry.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">0–5 = casual researcher · 6–12 = active evaluator · 13+ = high intent.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Cadence must change based on score. High-intent users should not receive the same pacing as casual researchers.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">This page treats score progression as an operational control signal, not just a reporting curiosity.</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Gauge className="h-5 w-5 text-amber-300" /> Score progression health</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-3"><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Progression confidence</div><div className="mt-2 text-3xl font-black text-white">19%</div></div><Badge className="border border-amber-400/30 bg-amber-500/15 text-amber-200">Improving</Badge></div>
                  <div className="mt-4"><Progress value={19} /></div>
                  <div className="mt-3 text-sm text-slate-300">The score engine exists. The bigger opportunity is using it more aggressively to alter cadence, suppression, and sequence branching.</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "retargeting" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Repeat className="h-5 w-5 text-sky-300" /> Retargeting sync</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredRetargeting.map((row) => (
                  <div key={row.segment} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.segment}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-2 text-sm text-slate-300">Destinations: {row.destinations}</div>
                    <div className="mt-1 text-sm text-slate-300">Message mirror: {row.messageMirror}</div>
                    <div className="mt-1 text-sm text-slate-300">Issue: {row.issue}</div>
                    <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-emerald-300" /> Cross-channel rule</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Every important lifecycle audience should sync to Google Ads, Meta, and YouTube with creative that mirrors the email sequence theme.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Retargeting exists to reinforce the lifecycle narrative, not to run independently with generic creative.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">High-score and post-inquiry users need especially careful exclusions and message control so frequency and intent stay aligned.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "newsletter" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Mail className="h-5 w-5 text-sky-300" /> Newsletter repositioning</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Current-state newsletter behavior may still carry legacy broad-send habits.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Target state: piston newsletter, jet newsletter, finance-focused, maintenance-focused, and model-specific update streams.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Behavioral suppression must prevent heavy piston users from repeatedly receiving irrelevant jet sends, and vice versa.</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="h-5 w-5 text-amber-300" /> Segmentation doctrine</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Open volume is no longer the main framing. Newsletter logic should support score progression, return visits, and assisted inquiries.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">The email system should be judged by segmented utility, not by how many people were broadly emailed.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "attribution" && (
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Target className="h-5 w-5 text-sky-300" /> Attribution upgrade layer</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {filteredAttribution.map((row) => (
                <div key={row.layer} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="xl:flex-1">
                      <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.layer}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                      <div className="mt-2 text-sm text-slate-300">Issue: {row.issue}</div>
                      <div className="mt-1 text-sm text-slate-200">Next move: {row.nextMove}</div>
                    </div>
                    <div className="grid min-w-[230px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                      <div className="flex items-center justify-between"><span className="text-slate-400">Status</span><span>{row.status}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Coverage</span><span>{row.coverage}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "trust" && (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="h-5 w-5 text-amber-300" /> Lifecycle data trust</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
                  <div className="font-semibold text-rose-200">Critical blockers</div>
                  <ul className="mt-2 space-y-2">
                    <li>• gclid capture not universal</li>
                    <li>• user ID persistence remains weak</li>
                    <li>• offline broker tagging still incomplete</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Decision rule</div>
                  <p className="mt-2 leading-6">Treat lifecycle as a powerful assist and progression engine, but keep executive-safe ROI claims limited to confirmed surfaces until identity and backend attribution are stronger.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Role-aware rendering</div>
                  <p className="mt-2 leading-6">{activeRole.label} sees {role === "jeffrey" ? "confirmed-only framing" : "full confidence range"}. Jeffrey-safe views should suppress directional lifecycle overstatement.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><CheckCircle2 className="h-5 w-5 text-emerald-300" /> Saved views by role</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                {savedViews.map((view) => (
                  <button key={view.name} onClick={() => applySavedView(view.name)} className={`block w-full rounded-2xl border p-4 text-left transition ${selectedSavedView === view.name ? "border-sky-400/30 bg-sky-500/15" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                    <div className="font-semibold text-white">{view.name}</div>
                    <div className="mt-1 text-slate-300">{view.description}</div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-sky-300" /> Lifecycle action framework</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Fast wins: strengthen abandoned-inquiry recovery, deepen model-interest sequences, and improve score-aware cadence control.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Strategic moves: finish segmented newsletter architecture, sync every lifecycle audience into mirrored paid retargeting, and formalize broker-support post-inquiry flows.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Blockers: partial identity stitching, incomplete backend source tagging, and inconsistent sequence-state mirroring across platforms.</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-emerald-300" /> Sequence comparison</CardTitle></CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sequenceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                  <YAxis stroke="rgba(255,255,255,0.45)" />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                  <Bar dataKey="assisted" fill="currentColor" className="text-sky-300" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="health" fill="currentColor" className="text-emerald-300" radius={[8, 8, 0, 0]} />
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
                  <SheetDescription className="text-left text-slate-400">Lifecycle recommendation logic, blockers, and expected lift inspection drawer.</SheetDescription>
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
