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
  BellRing,
  Briefcase,
  CalendarRange,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Filter,
  Gauge,
  Layers3,
  Mic,
  PlayCircle,
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
    { name: "Weekly Social Priorities", description: "Top authority gaps, social-to-site leakage, and next content pushes.", mode: "weekly_priorities" },
    { name: "Broker Visibility", description: "Broker spotlight system, visibility value, and differentiation plays.", mode: "broker_visibility" },
    { name: "Event Amplification", description: "Pre-event, live-event, and post-event execution control.", mode: "event_amplification" },
  ],
  clay: [
    { name: "Executive Authority View", description: "How social supports authority, SEO, PPC, and first-party growth.", mode: "executive_authority" },
    { name: "Media Hub Shift", description: "Transition from listing reposts to aviation media authority.", mode: "media_hub_shift" },
    { name: "Measurement Risk", description: "Social-assisted inquiry confidence and diagnostic-only zones.", mode: "measurement_risk" },
  ],
  jeffrey: [
    { name: "Board-Safe Social View", description: "Confirmed authority contribution and strategic positioning signals only.", mode: "board_safe" },
    { name: "Critical Social Gaps", description: "Highest-risk blockers to authority positioning.", mode: "critical_gaps" },
    { name: "YouTube Authority", description: "Long-form authority engine and moat-building view.", mode: "youtube_authority" },
  ],
} as const;

const roles = {
  casey: { label: "Casey Jones", title: "Head of Marketing", hideProbable: false },
  clay: { label: "Clay Martin", title: "COO", hideProbable: false },
  jeffrey: { label: "Jeffrey Carrithers", title: "CEO", hideProbable: true },
} as const;

type RoleKey = keyof typeof roles;
type Confidence = "CONFIRMED" | "PROBABLE" | "POSSIBLE";
type ViewTab = "overview" | "channels" | "buckets" | "listing" | "broker" | "events" | "loop" | "measurement";
type ComparePeriod = "WoW" | "MoM" | "90D";
type SavedViewMode =
  | "weekly_priorities"
  | "broker_visibility"
  | "event_amplification"
  | "executive_authority"
  | "media_hub_shift"
  | "measurement_risk"
  | "board_safe"
  | "critical_gaps"
  | "youtube_authority";
type OpportunityType =
  | "Authority Gap"
  | "Channel Discipline"
  | "Content Bucket Drift"
  | "Listing Integration"
  | "Broker Visibility"
  | "Event Amplification"
  | "Social Loop"
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

type ChannelRow = {
  channel: string;
  audience: string;
  role: string;
  coreContent: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

type BucketRow = {
  bucket: string;
  share: string;
  targetRole: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

type BrokerRow = {
  broker: string;
  spotlightStatus: string;
  inventorySupport: string;
  promotionStack: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

type EventRow = {
  event: string;
  preEvent: string;
  liveEvent: string;
  postEvent: string;
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
  "Authority Gap",
  "Channel Discipline",
  "Content Bucket Drift",
  "Listing Integration",
  "Broker Visibility",
  "Event Amplification",
  "Social Loop",
  "Measurement Risk",
];

const kpis: KPI[] = [
  {
    id: "S001",
    label: "Social-Assisted Qualified Inquiries",
    value: "21",
    delta: "+8.4% MoM",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Social assist model",
    freshness: "45 min ago",
    detail: "Promising directionally, but still constrained by social-to-email and social-to-retargeting attribution visibility.",
    statusTone: "good",
  },
  {
    id: "S002",
    label: "70/20/10 Compliance",
    value: "68/22/10",
    delta: "Authority mix close",
    deltaDirection: "up",
    confidence: "CONFIRMED",
    source: "Content bucket tagging",
    freshness: "Today",
    detail: "Authority and education are close to target, but direct promotional pressure can still creep in when inventory posting dominates.",
    statusTone: "warn",
  },
  {
    id: "S003",
    label: "YouTube Long-Form Velocity",
    value: "1 / mo",
    delta: "Below target",
    deltaDirection: "down",
    confidence: "CONFIRMED",
    source: "Content production tracker",
    freshness: "Today",
    detail: "The playbook target is at least two long-form authority videos per month.",
    statusTone: "bad",
  },
  {
    id: "S004",
    label: "Broker Spotlight Coverage",
    value: "33%",
    delta: "+1 broker MoM",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Broker visibility planner",
    freshness: "Today",
    detail: "Broker spotlight is a major untapped retention and differentiation layer, but coverage is still thin.",
    statusTone: "warn",
  },
  {
    id: "S005",
    label: "Email Capture From Social",
    value: "4.2%",
    delta: "+0.9 pts MoM",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Social to first-party funnel",
    freshness: "Today",
    detail: "Improving, but many social pieces still do not deliberately feed first-party capture enough.",
    statusTone: "warn",
  },
  {
    id: "S006",
    label: "Authority Positioning Integrity",
    value: "In progress",
    delta: "2 channel drifts active",
    deltaDirection: "down",
    confidence: "CONFIRMED",
    source: "Authority audit",
    freshness: "Today",
    detail: "Some channels still behave too much like listing repost feeds instead of aviation media surfaces.",
    statusTone: "bad",
  },
];

const opportunities: Opportunity[] = [
  {
    id: "social-001",
    type: "Authority Gap",
    signal: "Social still leans too close to listing repost behavior in parts of the mix",
    gap: "The aviation media authority transition is underway, but some channels still signal marketplace reposting rather than market intelligence leadership.",
    likelyCause: "Inventory content is easier to publish quickly, so channel discipline slips unless authority buckets are enforced weekly.",
    whySurfaced: [
      "Step 5C explicitly rejects social as a listing repost channel",
      "Authority positioning depends on market intelligence framing",
      "Listing-heavy behavior reduces perceived scale and shareability",
    ],
    expectedLift: { conservative: "Cleaner authority perception", expected: "Higher profile click quality", aggressive: "Compounding brand gravity" },
    action: "Re-anchor weekly social planning around authority and education first, with listing content reframed through market, model, or ownership context.",
    owner: "Social Lead",
    dependency: "Editorial content buckets and channel QA",
    blocker: "Listing-first habits still reappear during busy weeks",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 95,
    timeToImpact: "Immediate",
    pinned: true,
  },
  {
    id: "social-002",
    type: "Broker Visibility",
    signal: "Broker spotlight is underused relative to its retention and differentiation value",
    gap: "GlobalAir has a major opportunity to use broker visibility as a loyalty and stickiness engine, but the format is not yet operationalized enough.",
    likelyCause: "Broker content exists, but there is no persistent monthly spotlight system with distribution discipline.",
    whySurfaced: [
      "The playbook defines Broker Spotlight Series as a major opportunity",
      "Broker visibility strengthens loyalty and differentiates against Controller",
      "LinkedIn + email amplification is still underused here",
    ],
    expectedLift: { conservative: "+1 broker spotlight / month", expected: "+2", aggressive: "+4" },
    action: "Operationalize a monthly broker spotlight series with inventory highlights, firm insight, LinkedIn distribution, and email amplification.",
    owner: "Social + Revenue",
    dependency: "Broker participation and spotlight template",
    blocker: "No formal monthly production cadence yet",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 93,
    timeToImpact: "1–2 weeks",
    pinned: true,
  },
  {
    id: "social-003",
    type: "Event Amplification",
    signal: "Events are attended, but amplification structure is still inconsistent",
    gap: "GlobalAir gets event presence value, but not enough extended authority, broker, and media value across before/during/after phases.",
    likelyCause: "Event coverage is still too ad hoc instead of operating as a formal engine.",
    whySurfaced: [
      "Step 5C defines a before / during / after event system",
      "Events should produce authority content, broker visibility, and recap value",
      "Unstructured event posting leaves ROI on the table",
    ],
    expectedLift: { conservative: "Higher event content yield", expected: "Longer event ROI tail", aggressive: "Authority and broker lift across channels" },
    action: "Turn each major event into a three-phase content engine with expectation posts, live updates, short interviews, and post-event market recap packages.",
    owner: "Social Lead",
    dependency: "Event runbook and field capture plan",
    blocker: "No fully standardized event publishing workflow",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 92,
    timeToImpact: "1–3 weeks",
    pinned: true,
  },
  {
    id: "social-004",
    type: "Social Loop",
    signal: "Not every major social piece feeds email capture, retargeting, and model reinforcement",
    gap: "Social content creates attention, but the compounding loop into email and PPC is still incomplete on many assets.",
    likelyCause: "Distribution occurs, but downstream audience sync and capture logic are not universal across all content types.",
    whySurfaced: [
      "Step 5C requires social → email → PPC compounding loops",
      "Model-specific content should feed retargeting and nurture",
      "First-party capture from social remains below ideal",
    ],
    expectedLift: { conservative: "+1.0 pt capture rate", expected: "+2.0 pts", aggressive: "+3.5 pts" },
    action: "Require every major authority asset to define its email capture CTA, retargeting audience, and model/topic reinforcement path before publishing.",
    owner: "Social + Lifecycle + Paid",
    dependency: "Audience sync and CTA modules",
    blocker: "Loop design is not yet mandatory in all content briefs",
    confidence: "PROBABLE",
    priority: "Next",
    priorityScore: 85,
    timeToImpact: "1–3 weeks",
    pinned: true,
  },
  {
    id: "social-005",
    type: "Channel Discipline",
    signal: "YouTube long-form authority is below required cadence",
    gap: "The highest-leverage long-form authority channel is underproduced relative to the playbook and its downstream value.",
    likelyCause: "Video production is treated as occasional output instead of a planned authority lane.",
    whySurfaced: [
      "Step 5C calls YouTube a massive opportunity",
      "Target is 2 long-form videos per month minimum",
      "YouTube supports SEO, retargeting, email capture, and authority positioning",
    ],
    expectedLift: { conservative: "+1 video / month", expected: "+2", aggressive: "+3" },
    action: "Establish a minimum two-video monthly cadence around model breakdowns, ownership cost explainers, broker interviews, and market updates.",
    owner: "Content + Video",
    dependency: "Production calendar and host format",
    blocker: "No hard YouTube cadence guardrail yet",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 94,
    timeToImpact: "2–4 weeks",
  },
  {
    id: "social-006",
    type: "Measurement Risk",
    signal: "Social-assisted inquiry contribution is useful directionally but still not fully board-safe",
    gap: "Social is clearly helping, but some paths into email, retargeting, and eventual inquiry remain partially blurred.",
    likelyCause: "Cross-channel contribution exists, but direct path and return-visit attribution are not fully closed-loop.",
    whySurfaced: [
      "Primary KPI is social-assisted inquiries",
      "Email capture and site-click behavior are easier to observe than final sales influence",
      "Executive-safe reporting should keep directional framing where confidence is partial",
    ],
    expectedLift: { conservative: "Risk containment", expected: "Cleaner social ROI view", aggressive: "Scale-safe authority investment decisions" },
    action: "Keep social contribution confidence-aware and separate confirmed assist signals from broader strategic authority influence until tracking improves.",
    owner: "Analytics + Social",
    dependency: "Cross-channel attribution cleanup",
    blocker: "Some downstream influence remains blended with other channels",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 90,
    timeToImpact: "Immediate",
    doNotActYet: true,
  },
];

const channelRows: ChannelRow[] = [
  {
    channel: "LinkedIn",
    audience: "Brokers, FBOs, industry professionals, manufacturers",
    role: "Authority + industry positioning",
    coreContent: "Market insights, model demand trends, broker highlights, event recap, data-driven aviation insights",
    issue: "Most aligned channel strategically, but broker spotlight cadence still needs more rigor.",
    action: "Make it the core home for market intelligence and broker visibility.",
    confidence: "CONFIRMED",
  },
  {
    channel: "Facebook",
    audience: "Private buyers, enthusiasts, pilots",
    role: "Community + buyer reach",
    coreContent: "Featured listings, model spotlights, comparisons, market updates, lifestyle, event content",
    issue: "Can drift too far toward listing reposting without stronger educational framing.",
    action: "Use listing content only when wrapped in model, ownership, or market context.",
    confidence: "PROBABLE",
  },
  {
    channel: "Instagram",
    audience: "Buyers + aspirational enthusiasts",
    role: "Visual authority",
    coreContent: "Aircraft visuals, model highlights, ownership snapshots, cockpit features, event photography",
    issue: "Prestige channel, but needs better pathways into first-party capture and site click intent.",
    action: "Pair visual authority with stronger CTA pathways into research and listings.",
    confidence: "PROBABLE",
  },
  {
    channel: "YouTube",
    audience: "Researchers, buyers, enthusiasts, authority seekers",
    role: "Long-form authority",
    coreContent: "Model breakdowns, ownership cost explainers, broker interviews, market update series, event coverage",
    issue: "Highest upside channel is under-produced today.",
    action: "Build a recurring authority series and treat it as a required production lane.",
    confidence: "CONFIRMED",
  },
  {
    channel: "X (Twitter)",
    audience: "Industry pulse followers, event audience, media-adjacent users",
    role: "Industry pulse",
    coreContent: "Market movement, inventory shifts, event live updates, industry news",
    issue: "Fast pulse channel, but must stay useful and data-led rather than generic commentary.",
    action: "Use it for live event and market movement coverage only where speed matters.",
    confidence: "PROBABLE",
  },
];

const bucketRows: BucketRow[] = [
  {
    bucket: "Model Education",
    share: "21%",
    targetRole: "Authority + buyer progression",
    issue: "Healthy base, but should be one of the dominant buckets every week.",
    action: "Expand comparison, model breakdown, and video support around top aircraft.",
    confidence: "CONFIRMED",
  },
  {
    bucket: "Market Trends",
    share: "17%",
    targetRole: "Media positioning",
    issue: "Strong authority bucket but not yet consistent enough at weekly rhythm.",
    action: "Use recurring market pulse posts and trend framing across LinkedIn and YouTube.",
    confidence: "PROBABLE",
  },
  {
    bucket: "Ownership Insights",
    share: "15%",
    targetRole: "Buyer education",
    issue: "Excellent strategic fit; should keep growing.",
    action: "Pair with ownership explainer video and operating cost content.",
    confidence: "CONFIRMED",
  },
  {
    bucket: "Inventory Highlights",
    share: "22%",
    targetRole: "Discovery support",
    issue: "Useful, but needs strict framing discipline so it does not dominate the feed.",
    action: "Always wrap listings in demand, performance, or ownership context.",
    confidence: "CONFIRMED",
  },
  {
    bucket: "Broker Features",
    share: "9%",
    targetRole: "Retention + differentiation",
    issue: "Underweight relative to its strategic value.",
    action: "Increase monthly spotlight cadence and connect to email.",
    confidence: "PROBABLE",
  },
  {
    bucket: "Event Coverage",
    share: "8%",
    targetRole: "Authority + recency",
    issue: "Present, but still too dependent on event timing instead of a reusable content system.",
    action: "Template before/during/after structure for every event.",
    confidence: "CONFIRMED",
  },
  {
    bucket: "Aviation Finance",
    share: "4%",
    targetRole: "Conversion support",
    issue: "Underrepresented compared with buyer need.",
    action: "Add financing explainers, market affordability framing, and ownership economics.",
    confidence: "PROBABLE",
  },
  {
    bucket: "Aircraft Comparisons",
    share: "4%",
    targetRole: "Decision support",
    issue: "Too light given how valuable compare behavior is.",
    action: "Build a standing comparison series around priority models.",
    confidence: "CONFIRMED",
  },
];

const brokerRows: BrokerRow[] = [
  {
    broker: "Jet Access Group",
    spotlightStatus: "One-off feature",
    inventorySupport: "Moderate",
    promotionStack: "LinkedIn only",
    issue: "Good signal but not full spotlight stack yet.",
    action: "Expand to email + site recap + inventory highlight package.",
    confidence: "PROBABLE",
  },
  {
    broker: "Piston Select Partners",
    spotlightStatus: "Planned",
    inventorySupport: "High",
    promotionStack: "Not live",
    issue: "Strong category fit but not operationalized.",
    action: "Launch as monthly piston broker spotlight pilot.",
    confidence: "CONFIRMED",
  },
  {
    broker: "Premium Jet Advisors",
    spotlightStatus: "None",
    inventorySupport: "Medium",
    promotionStack: "None",
    issue: "Missed visibility value for a high-trust broker profile.",
    action: "Add to upcoming broker feature calendar.",
    confidence: "POSSIBLE",
  },
];

const eventRows: EventRow[] = [
  {
    event: "NBAA S&D",
    preEvent: "Expectation post + who to watch",
    liveEvent: "Booth visits, short interviews, market notes",
    postEvent: "Recap + market implications + broker highlights",
    issue: "Good live presence, but post-event packaging can be stronger.",
    action: "Standardize full three-phase event content stack.",
    confidence: "CONFIRMED",
  },
  {
    event: "AERO Friedrichshafen",
    preEvent: "Market expectation and attendance angle",
    liveEvent: "Photo coverage + short pulse updates",
    postEvent: "Video montage + implications summary",
    issue: "International events need a clearer why-it-matters angle for U.S. audiences.",
    action: "Add demand and market framing for each event recap.",
    confidence: "PROBABLE",
  },
  {
    event: "Regional broker events",
    preEvent: "Usually missing",
    liveEvent: "Ad hoc",
    postEvent: "Rare",
    issue: "Smaller events are not yet captured into repeatable authority content.",
    action: "Create lightweight event templates for regional activity.",
    confidence: "PROBABLE",
  },
];

const measurementRows: MeasurementRow[] = [
  {
    metric: "Social-assisted inquiries",
    current: "21",
    confidence: "PROBABLE",
    issue: "Primary KPI is directionally useful, but still not fully board-safe.",
    nextMove: "Separate confirmed influence from directional authority contribution.",
  },
  {
    metric: "Profile visit → site click rate",
    current: "18%",
    confidence: "CONFIRMED",
    issue: "Healthy, but differs materially by content bucket.",
    nextMove: "Benchmark by content bucket and channel role.",
  },
  {
    metric: "Video completion rate",
    current: "34%",
    confidence: "PROBABLE",
    issue: "Useful for long-form authority, but sample size is still too thin because YouTube output is low.",
    nextMove: "Increase cadence before drawing hard channel conclusions.",
  },
  {
    metric: "Email capture from social",
    current: "4.2%",
    confidence: "PROBABLE",
    issue: "Improving, but many assets still lack deliberate capture architecture.",
    nextMove: "Make email capture mandatory in all major content briefs.",
  },
  {
    metric: "Follower growth",
    current: "+6.8%",
    confidence: "CONFIRMED",
    issue: "Useful context, but not a primary success lens.",
    nextMove: "Keep tertiary only unless tied to business impact.",
  },
];

const compareTrendData = {
  WoW: [
    { name: "Mon", value: 15 },
    { name: "Tue", value: 16 },
    { name: "Wed", value: 17 },
    { name: "Thu", value: 18 },
    { name: "Fri", value: 19 },
    { name: "Sat", value: 20 },
    { name: "Sun", value: 21 },
  ],
  MoM: [
    { name: "W1", value: 13 },
    { name: "W2", value: 15 },
    { name: "W3", value: 18 },
    { name: "W4", value: 21 },
  ],
  "90D": [
    { name: "Jan", value: 9 },
    { name: "Feb", value: 13 },
    { name: "Mar", value: 17 },
    { name: "Apr", value: 21 },
  ],
} as const;

const bucketChartData = bucketRows.map((row) => ({ name: row.bucket.split(" ")[0], share: Number(row.share.replace("%", "")) }));

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
    case "broker_visibility":
      return {
        selectedTypes: ["Broker Visibility", "Listing Integration"] as OpportunityType[],
        activeTab: "broker" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "probable",
        showPinnedOnly: false,
        showDoNotActYet: true,
      };
    case "event_amplification":
      return {
        selectedTypes: ["Event Amplification", "Channel Discipline"] as OpportunityType[],
        activeTab: "events" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "probable",
        showPinnedOnly: true,
        showDoNotActYet: true,
      };
    case "executive_authority":
      return {
        selectedTypes: ["Authority Gap", "Social Loop", "Broker Visibility"] as OpportunityType[],
        activeTab: "overview" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "probable",
        showPinnedOnly: true,
        showDoNotActYet: false,
      };
    case "media_hub_shift":
      return {
        selectedTypes: ["Authority Gap", "Content Bucket Drift", "Channel Discipline"] as OpportunityType[],
        activeTab: "channels" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "all",
        showPinnedOnly: false,
        showDoNotActYet: true,
      };
    case "measurement_risk":
      return {
        selectedTypes: ["Measurement Risk", "Social Loop"] as OpportunityType[],
        activeTab: "measurement" as ViewTab,
        confidenceFilter: nextRole === "jeffrey" ? "confirmed" : "probable",
        showPinnedOnly: false,
        showDoNotActYet: true,
      };
    case "board_safe":
      return {
        selectedTypes: ["Authority Gap", "Broker Visibility", "Measurement Risk"] as OpportunityType[],
        activeTab: "measurement" as ViewTab,
        confidenceFilter: "confirmed",
        showPinnedOnly: true,
        showDoNotActYet: false,
      };
    case "critical_gaps":
      return {
        selectedTypes: ["Authority Gap", "Channel Discipline", "Measurement Risk"] as OpportunityType[],
        activeTab: "overview" as ViewTab,
        confidenceFilter: "confirmed",
        showPinnedOnly: true,
        showDoNotActYet: false,
      };
    case "youtube_authority":
      return {
        selectedTypes: ["Channel Discipline", "Social Loop"] as OpportunityType[],
        activeTab: "channels" as ViewTab,
        confidenceFilter: "confirmed",
        showPinnedOnly: false,
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

export default function AvIntelOSPage5C() {
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

  const filteredChannels = useMemo(() => channelRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter) && (!search || `${item.channel} ${item.issue}`.toLowerCase().includes(search.toLowerCase()))), [activeRole.hideProbable, confidenceFilter, search]);
  const filteredBuckets = useMemo(() => bucketRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredBrokers = useMemo(() => brokerRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredEvents = useMemo(() => eventRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredMeasurement = useMemo(() => measurementRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);

  const opportunitiesById = useMemo(() => new Map(opportunities.map((item) => [item.id, item])), []);
  const selectedOpportunity = openOpportunityId ? opportunitiesById.get(openOpportunityId) ?? null : null;
  const pinned = filteredOpportunities.filter((item) => item.pinned);
  const authorityMixProgress = 68;

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
              <div className="mt-1 text-sm text-slate-300">Social & Authority Command translates Step 5C into an operating surface: channel role control, authority positioning, content buckets, listing reframing, broker visibility, event amplification, and the social → email → PPC compounding loop.</div>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewTab)} className="w-full xl:w-auto">
              <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0 xl:w-auto">
                <TabsTrigger value="overview" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Overview</TabsTrigger>
                <TabsTrigger value="channels" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Channel Roles</TabsTrigger>
                <TabsTrigger value="buckets" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Content Buckets</TabsTrigger>
                <TabsTrigger value="listing" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Listing Integration</TabsTrigger>
                <TabsTrigger value="broker" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Broker Spotlight</TabsTrigger>
                <TabsTrigger value="events" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Event Engine</TabsTrigger>
                <TabsTrigger value="loop" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Social Loop</TabsTrigger>
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
                    <BellRing className="h-4 w-4" />
                    Av/IntelOS · Page 5C
                  </div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">Social & Authority Command</h1>
                  <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">Aviation media authority engine for social, YouTube, broker visibility, event amplification, and social-driven compounding loops into email and PPC.</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-bold"><Target className="h-5 w-5 text-sky-300" /> Authority Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Strategic doctrine</div>
                <div className="mt-2 font-semibold text-white">Social is not a listing repost channel.</div>
                <p className="mt-2 leading-6">Social exists to position GlobalAir as an aviation media authority, increase broker visibility value, reinforce listing discovery, capture first-party audiences, support SEO and PPC, amplify events, and build brand gravity.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Positioning model</div>
                <div className="mt-2 font-semibold text-white">GlobalAir must behave like an Aviation Media Hub.</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><Filter className="h-5 w-5 text-sky-300" /> Social filters</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search channels, events, blockers" className="border-white/10 bg-slate-950/80 pl-9" />
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
          <AlertTitle>Authority governance warning</AlertTitle>
          <AlertDescription>Do not let social drift into generic listing reposting. This page assumes channel role discipline, 70/20/10 content mix control, broker visibility systems, and social → email → PPC compounding architecture.</AlertDescription>
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
                <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-xl font-bold"><AlertTriangle className="h-5 w-5 text-amber-300" /> Top social opportunities</CardTitle><Button variant="ghost" className="rounded-xl border border-white/10 bg-white/5" onClick={() => setActiveTab("channels")}>Open channel roles <ChevronRight className="ml-2 h-4 w-4" /></Button></div></CardHeader>
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
                <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Gauge className="h-5 w-5 text-sky-300" /> Social-assisted inquiry trend</CardTitle></CardHeader>
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
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Use <span className="font-semibold text-white">{comparePeriod}</span> for operating cadence, but keep social-assisted inquiry contribution confidence-aware until cross-channel attribution is cleaner.</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "channels" && (
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Workflow className="h-5 w-5 text-sky-300" /> Channel role definition</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {filteredChannels.map((row) => (
                <div key={row.channel} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="xl:flex-1">
                      <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.channel}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                      <div className="mt-2 text-sm text-slate-300">Audience: {row.audience}</div>
                      <div className="mt-1 text-sm text-slate-300">Role: {row.role}</div>
                      <div className="mt-1 text-sm text-slate-300">Core content: {row.coreContent}</div>
                      <div className="mt-2 text-sm text-slate-300">Issue: {row.issue}</div>
                      <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "buckets" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Layers3 className="h-5 w-5 text-sky-300" /> Content architecture</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredBuckets.map((row) => (
                  <div key={row.bucket} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.bucket}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-2 text-sm text-slate-300">Share: {row.share} · Role: {row.targetRole}</div>
                    <div className="mt-1 text-sm text-slate-300">Issue: {row.issue}</div>
                    <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Gauge className="h-5 w-5 text-amber-300" /> 70 / 20 / 10 control</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-3"><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Authority + education share</div><div className="mt-2 text-3xl font-black text-white">{authorityMixProgress}%</div></div><Badge className="border border-amber-400/30 bg-amber-500/15 text-amber-200">Close</Badge></div>
                  <div className="mt-4"><Progress value={authorityMixProgress} /></div>
                  <div className="mt-3 text-sm text-slate-300">Target mix: 70% authority & education, 20% inventory highlights, 10% direct promotional.</div>
                </div>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bucketChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                      <YAxis stroke="rgba(255,255,255,0.45)" />
                      <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                      <Bar dataKey="share" fill="currentColor" className="text-sky-300" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "listing" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Briefcase className="h-5 w-5 text-sky-300" /> Listing integration model</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Do not post: “Cessna 172 for sale — link.”</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Instead post: “Why the Cessna 172 continues to dominate piston demand in 2026.”</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Every listing-led social asset should include three bullet performance highlights, one ownership insight, a market range angle, and then the link to listings.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">This improves click-through and perceived value because the listing is framed as intelligence, not inventory spam.</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Camera className="h-5 w-5 text-amber-300" /> Listing reframing examples</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">“Inside why the SR22 still commands premium demand.”</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">“3 reasons Archer buyers still compare against the 172 first.”</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">“What current piston pricing tells you before you shop active inventory.”</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "broker" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-sky-300" /> Broker visibility layer</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredBrokers.map((row) => (
                  <div key={row.broker} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.broker}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-2 text-sm text-slate-300">Spotlight status: {row.spotlightStatus}</div>
                    <div className="mt-1 text-sm text-slate-300">Inventory support: {row.inventorySupport}</div>
                    <div className="mt-1 text-sm text-slate-300">Promotion stack: {row.promotionStack}</div>
                    <div className="mt-1 text-sm text-slate-300">Issue: {row.issue}</div>
                    <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Mic className="h-5 w-5 text-emerald-300" /> Broker spotlight doctrine</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Major opportunity: create a monthly Broker Spotlight Series.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Each spotlight should feature the broker firm, active inventory, company insight, and LinkedIn + email amplification.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">This increases broker loyalty, platform stickiness, and differentiation against Controller.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "events" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><CalendarRange className="h-5 w-5 text-sky-300" /> Event amplification engine</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredEvents.map((row) => (
                  <div key={row.event} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.event}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Before</div><div className="mt-1 text-slate-200">{row.preEvent}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">During</div><div className="mt-1 text-slate-200">{row.liveEvent}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">After</div><div className="mt-1 text-slate-200">{row.postEvent}</div></div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">Issue: {row.issue}</div>
                    <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Video className="h-5 w-5 text-amber-300" /> Event content rule</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Before event: what to expect, who is attending, market expectations.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">During event: live updates, short interviews, booth visits, listing features from the floor.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">After event: recap, market implications, broker highlights, and a video montage.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "loop" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Workflow className="h-5 w-5 text-sky-300" /> Social → Email → PPC loop</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Every major content piece must capture email, feed retargeting, sync audiences, and reinforce model interest.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Example: user watches SR22 video → added to SR22 retargeting list → gets SR22 email sequence → sees SR22 PPC retargeting ad.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">That is compounding authority. Social should seed the loop, not end at engagement.</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><PlayCircle className="h-5 w-5 text-emerald-300" /> Long-form authority lane</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Massive opportunity: YouTube long-form authority.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Content types: model breakdowns, ownership cost explainers, broker interviews, market update series, event coverage.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">YouTube supports SEO, authority, retargeting, and email capture. It should not be optional content.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "measurement" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="h-5 w-5 text-sky-300" /> Measurement hierarchy</CardTitle></CardHeader>
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
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Weekly:</span> review top-performing content by model, identify high-engagement aircraft types, and adjust next week’s focus.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Monthly:</span> deep dive one aircraft model, publish one broker spotlight, and produce one long-form video minimum.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Quarterly:</span> align social themes to seasonal demand and evaluate platform ROI.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Measurement rule:</span> primary KPI is social-assisted inquiries. Secondary KPIs are profile visit → site click, video completion, and email capture from social. Follower growth stays tertiary.</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-sky-300" /> Social action framework</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Fast wins: enforce authority framing on listing content, launch monthly broker spotlight, and standardize event publishing workflows.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Strategic moves: increase YouTube long-form cadence, expand comparison and ownership content, and require loop design into email and PPC for every major authority asset.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Blockers: listing-first habits, inconsistent YouTube cadence, weak broker spotlight operations, and partial cross-channel attribution visibility.</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-emerald-300" /> Content bucket comparison</CardTitle></CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bucketChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                  <YAxis stroke="rgba(255,255,255,0.45)" />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                  <Bar dataKey="share" fill="currentColor" className="text-sky-300" radius={[8, 8, 0, 0]} />
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
                  <SheetDescription className="text-left text-slate-400">Social recommendation logic, blockers, and expected lift inspection drawer.</SheetDescription>
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
