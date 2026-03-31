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
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Database,
  Filter,
  Globe,
  LineChart as LineChartIcon,
  Lock,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Link2,
  Activity,
  Briefcase,
  Upload,
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
    { name: "Measurement Integrity", description: "Clean traffic, contamination alerts, and validation blockers." },
    { name: "Clean Traffic Only", description: "Directional channel and landing analysis using clean-only logic." },
    { name: "Opportunity Queue", description: "Ranked GA4 opportunities with owners, blockers, and lift ranges." },
  ],
  clay: [
    { name: "Executive Integrity View", description: "Business-safe measurement status and landing inefficiencies." },
    { name: "Landing Page Gaps", description: "Page-level leakage and remediation opportunities." },
    { name: "Conversion Risk", description: "Attribution risk, event QA, and scaling blockers." },
  ],
  jeffrey: [
    { name: "Confirmed Signals Only", description: "Confirmed measurement inputs only." },
    { name: "Board-Safe Traffic", description: "High-level clean traffic and blocker summary." },
    { name: "Contamination Summary", description: "What is unsafe to use and why." },
  ],
} as const;

const roles = {
  casey: {
    label: "Casey Jones",
    title: "Head of Marketing",
    hideProbable: false,
    savedViews: savedViewsByRole.casey.map((item) => item.name),
  },
  clay: {
    label: "Clay Martin",
    title: "COO",
    hideProbable: false,
    savedViews: savedViewsByRole.clay.map((item) => item.name),
  },
  jeffrey: {
    label: "Jeffrey Carrithers",
    title: "CEO",
    hideProbable: true,
    savedViews: savedViewsByRole.jeffrey.map((item) => item.name),
  },
} as const;

type RoleKey = keyof typeof roles;
type Confidence = "CONFIRMED" | "PROBABLE" | "POSSIBLE";
type ViewTab = "overview" | "opportunities" | "channels" | "landing" | "events" | "trust" | "identity";
type ComparePeriod = "WoW" | "MoM" | "90D";
type OpportunityType = "Channel" | "Landing Page" | "Event" | "Attribution" | "Geo" | "Device" | "Measurement";

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

type ChannelRow = {
  channel: string;
  sessions: number;
  users: number;
  engagementReported: string;
  engagementReal: string;
  conversions: number;
  revenue: string;
  clean: boolean;
  confidence: Confidence;
  note: string;
};

type LandingRow = {
  page: string;
  category: string;
  impressions: string;
  sessions: string;
  cvr: string;
  bounce: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

type EventRow = {
  event: string;
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  value: number;
  status: "Validated" | "Review Required" | "Modeled";
  owner: string;
  note: string;
};

type Opportunity = {
  id: string;
  type: OpportunityType;
  signal: string;
  gap: string;
  likelyCause: string;
  whySurfaced: string[];
  expectedLift: {
    conservative: string;
    expected: string;
    aggressive: string;
  };
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

const opportunityTypes: OpportunityType[] = ["Channel", "Landing Page", "Event", "Attribution", "Geo", "Device", "Measurement"];

const kpis: KPI[] = [
  {
    id: "G001",
    label: "Real Engagement Rate",
    value: "68.9%",
    delta: "+2.1 pts WoW",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Clean session logic",
    freshness: "28 min ago",
    detail: "Derived from filtered non-Email_Open_ sessions. Directionally useful for optimization.",
    statusTone: "warn",
  },
  {
    id: "G002",
    label: "Reported Engagement Rate",
    value: "17.3%",
    delta: "-0.4 pts WoW",
    deltaDirection: "flat",
    confidence: "PROBABLE",
    source: "Native GA4",
    freshness: "28 min ago",
    detail: "Contaminated by Email_Open_ inflation and not safe for high-stakes decisioning.",
    statusTone: "bad",
  },
  {
    id: "G003",
    label: "Clean Sessions",
    value: "48,240",
    delta: "+8.4% WoW",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "GA4 filtered traffic",
    freshness: "28 min ago",
    detail: "Use for directional channel analysis and page opportunity detection.",
    statusTone: "good",
  },
  {
    id: "G004",
    label: "Validation Coverage",
    value: "74%",
    delta: "+5 pts MoM",
    deltaDirection: "up",
    confidence: "CONFIRMED",
    source: "Event QA registry",
    freshness: "1 hr ago",
    detail: "Share of tracked events currently passing validation checks.",
    statusTone: "warn",
  },
  {
    id: "G005",
    label: "Attribution Integrity",
    value: "Diagnose",
    delta: "2 blockers active",
    deltaDirection: "down",
    confidence: "CONFIRMED",
    source: "GA4 + call tracking audit",
    freshness: "35 min ago",
    detail: "Call tracking and paid conversion confirmation remain incomplete.",
    statusTone: "bad",
  },
];

const channelRows: ChannelRow[] = [
  {
    channel: "Organic Search",
    sessions: 18240,
    users: 12910,
    engagementReported: "21.4%",
    engagementReal: "71.8%",
    conversions: 186,
    revenue: "$118.4K",
    clean: true,
    confidence: "PROBABLE",
    note: "High-value channel. Use clean engagement and landing diagnostics for opportunity analysis.",
  },
  {
    channel: "Paid Search",
    sessions: 12440,
    users: 9180,
    engagementReported: "18.1%",
    engagementReal: "66.2%",
    conversions: 143,
    revenue: "$96.7K",
    clean: true,
    confidence: "PROBABLE",
    note: "Reliable enough for directional optimization, but conversion validation still incomplete in some segments.",
  },
  {
    channel: "Direct",
    sessions: 6840,
    users: 5210,
    engagementReported: "19.7%",
    engagementReal: "63.4%",
    conversions: 54,
    revenue: "$38.2K",
    clean: false,
    confidence: "POSSIBLE",
    note: "Direct may contain unattributed email and return traffic contamination.",
  },
  {
    channel: "Email",
    sessions: 3910,
    users: 3440,
    engagementReported: "8.4%",
    engagementReal: "58.8%",
    conversions: 28,
    revenue: "$12.9K",
    clean: false,
    confidence: "POSSIBLE",
    note: "Email_Open_ contamination makes reported engagement unusable.",
  },
  {
    channel: "Referral",
    sessions: 2180,
    users: 1710,
    engagementReported: "24.8%",
    engagementReal: "69.9%",
    conversions: 18,
    revenue: "$8.1K",
    clean: true,
    confidence: "PROBABLE",
    note: "Generally usable for directional channel opportunity work.",
  },
  {
    channel: "Social",
    sessions: 2630,
    users: 1940,
    engagementReported: "16.2%",
    engagementReal: "61.1%",
    conversions: 9,
    revenue: "$4.7K",
    clean: true,
    confidence: "PROBABLE",
    note: "Low-conversion channel but useful for remarketing audience building.",
  },
];

const landingRows: LandingRow[] = [
  {
    page: "/aircraft-for-sale/cessna-172",
    category: "Piston",
    impressions: "48.2K",
    sessions: "8,420",
    cvr: "1.4%",
    bounce: "62%",
    issue: "High visibility, weak click capture and above-average bounce.",
    action: "Improve title/meta hook, tighten above-the-fold trust signals, and align page to buyer-intent query clusters.",
    confidence: "CONFIRMED",
  },
  {
    page: "/aircraft-for-sale/cirrus-sr22",
    category: "Piston",
    impressions: "31.6K",
    sessions: "6,980",
    cvr: "2.6%",
    bounce: "44%",
    issue: "Winning page. Strong conversion profile suggests cluster expansion opportunity.",
    action: "Use as template for adjacent model pages and paid landing alignment.",
    confidence: "CONFIRMED",
  },
  {
    page: "/article/cessna-172-operating-cost",
    category: "Content",
    impressions: "22.1K",
    sessions: "4,140",
    cvr: "0.4%",
    bounce: "71%",
    issue: "Traffic enters, but inquiry assist path is weak.",
    action: "Add stronger CTA modules, related listings, and remarketing/email capture hooks.",
    confidence: "PROBABLE",
  },
  {
    page: "/aircraft-for-sale/piper-archer",
    category: "Piston",
    impressions: "18.8K",
    sessions: "2,940",
    cvr: "0.9%",
    bounce: "67%",
    issue: "Demand exists but page under-converts relative to traffic quality.",
    action: "Audit inventory depth, pricing visibility, and top query alignment.",
    confidence: "PROBABLE",
  },
];

const eventRows: EventRow[] = [
  { event: "qualified_inquiry", tier: "Tier 1", value: 100, status: "Validated", owner: "Analytics", note: "Primary optimization event." },
  { event: "call_inquiry", tier: "Tier 1", value: 120, status: "Review Required", owner: "Analytics + DevOps", note: "Call coverage incomplete." },
  { event: "broker_email_click", tier: "Tier 1", value: 90, status: "Validated", owner: "Analytics", note: "Working but low volume." },
  { event: "pdf_download", tier: "Tier 2", value: 30, status: "Validated", owner: "Analytics", note: "Useful for scoring, not primary optimization." },
  { event: "form_start", tier: "Tier 2", value: 50, status: "Review Required", owner: "Analytics", note: "Drop-off analysis needs cleanup." },
  { event: "model_view_3plus", tier: "Tier 3", value: 20, status: "Modeled", owner: "Analytics", note: "Directional signal only." },
];

const opportunities: Opportunity[] = [
  {
    id: "ga4-opp-001",
    type: "Landing Page",
    signal: "High-impression landing pages are under-clicking and over-bouncing",
    gap: "GlobalAir earns SERP visibility but loses too much value before the page experience converts it.",
    likelyCause: "Weak title/meta hooks, weak above-the-fold clarity, and insufficient listing or trust alignment on entry pages.",
    whySurfaced: [
      "Cessna 172 page: 48.2K impressions with 1.4% CVR and 62% bounce",
      "Operating-cost content page has high traffic but weak downstream inquiry assist path",
      "Piper Archer page shows demand without conversion efficiency",
    ],
    expectedLift: {
      conservative: "+4% landing CTR / lower bounce",
      expected: "+8% landing efficiency",
      aggressive: "+12% landing efficiency",
    },
    action: "Prioritize the top leaking landing pages, improve titles/meta, strengthen listing and CTA modules, and align each page to the dominant user intent cluster.",
    owner: "SEO + Content + CRO",
    dependency: "Page-query export + page template access",
    blocker: "No unified landing page remediation workflow yet",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 93,
    timeToImpact: "7–14 days",
    pinned: true,
  },
  {
    id: "ga4-opp-002",
    type: "Measurement",
    signal: "Reported GA4 engagement is still contaminated and misleading",
    gap: "Teams can still over-read native engagement metrics that are not decision-safe.",
    likelyCause: "Email_Open_ events continue inflating engagement metrics across contaminated views.",
    whySurfaced: [
      "Reported engagement is 17.3% while real engagement estimate is 68.9%",
      "Email channel remains structurally contaminated",
      "Some users still reference native engagement exports",
    ],
    expectedLift: {
      conservative: "Fewer bad decisions",
      expected: "Cleaner optimization inputs",
      aggressive: "Safe measurement baseline for scale",
    },
    action: "Default operators to clean-only views, de-emphasize native engagement, and label contaminated metrics as non-decision-safe.",
    owner: "Analytics",
    dependency: "Clean logic governance",
    blocker: "Native GA4 exports still used ad hoc",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 97,
    timeToImpact: "Immediate",
    pinned: true,
  },
  {
    id: "ga4-opp-003",
    type: "Attribution",
    signal: "Paid and call-assisted conversion pathways remain partially unvalidated",
    gap: "GA4 can show direction, but not full revenue-trust quality for scaling decisions.",
    likelyCause: "Call tracking coverage incomplete and conversion signal validation still not complete by segment.",
    whySurfaced: [
      "Validation coverage only 74%",
      "Call inquiry event still marked review required",
      "Jet expansion remains blocked by measurement confidence",
    ],
    expectedLift: {
      conservative: "Risk containment",
      expected: "Higher attribution trust",
      aggressive: "Unlock clean paid scaling",
    },
    action: "Close call-tracking gaps, finish event QA, and document which events are safe for optimization versus diagnosis only.",
    owner: "Analytics + DevOps",
    dependency: "Call tracking QA and conversion audit",
    blocker: "Engineering time still required",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 95,
    timeToImpact: "1–2 weeks",
    pinned: true,
  },
  {
    id: "ga4-opp-004",
    type: "Channel",
    signal: "Organic Search is outperforming on clean sessions and conversions",
    gap: "Strong channel efficiency is not yet fully translated into page-level expansion and optimization priorities.",
    likelyCause: "Channel reporting is present, but opportunity handoff into landing-page fixes remains fragmented.",
    whySurfaced: [
      "Organic Search drives 18,240 sessions and 186 conversions",
      "Clean engagement remains strongest among scale channels",
      "Top organic pages still show material leakage",
    ],
    expectedLift: {
      conservative: "+3% channel conversion lift",
      expected: "+7% channel conversion lift",
      aggressive: "+11% channel conversion lift",
    },
    action: "Use clean organic winners and losers to prioritize page fixes, content cluster expansion, and internal-linking support for commercial pages.",
    owner: "SEO",
    dependency: "Landing-page issue backlog",
    blocker: "Page remediation velocity is limited",
    confidence: "PROBABLE",
    priority: "Next",
    priorityScore: 82,
    timeToImpact: "2–4 weeks",
  },
  {
    id: "ga4-opp-005",
    type: "Event",
    signal: "Mid-funnel events are tracked, but some are overweighted or not yet fully reliable",
    gap: "Optimization risks drifting toward easier events instead of highest-value buyer actions.",
    likelyCause: "Tier 2 and Tier 3 events remain useful for scoring but not all are safe as optimization anchors.",
    whySurfaced: [
      "PDF download and form start are active but should not outrank qualified inquiry value",
      "Model-view behavior still modeled only",
      "Tier weighting needs stronger enforcement in dashboards and downstream bidding inputs",
    ],
    expectedLift: {
      conservative: "Cleaner optimization bias",
      expected: "Better event hierarchy discipline",
      aggressive: "Higher inquiry quality over time",
    },
    action: "Keep Tier 1 events primary, use Tier 2 for scoring and remarketing, and visibly label Tier 3 as directional only.",
    owner: "Analytics + PPC",
    dependency: "Event weighting governance",
    blocker: "Not all downstream users follow the same conversion hierarchy yet",
    confidence: "PROBABLE",
    priority: "Next",
    priorityScore: 78,
    timeToImpact: "1–3 weeks",
  },
  {
    id: "ga4-opp-006",
    type: "Geo",
    signal: "Clean channel analysis suggests location-level opportunity concentration is still underused",
    gap: "GA4 can identify directional geo opportunity, but geo-level shaping is not operationalized enough.",
    likelyCause: "Geo and landing-page data are viewed separately rather than as one optimization surface.",
    whySurfaced: [
      "Paid and organic clean sessions cluster in a few high-value states",
      "Landing leakage differs by region and device mix",
      "Geo opportunity is still mostly handled in PPC, not across content and landing experience",
    ],
    expectedLift: {
      conservative: "+2% geo efficiency",
      expected: "+5% geo efficiency",
      aggressive: "+9% geo efficiency",
    },
    action: "Add a geo opportunity layer to landing-page diagnostics and use it to prioritize localized paid and page treatment for high-intent states.",
    owner: "PPC + Analytics",
    dependency: "Geo export QA",
    blocker: "Geo confidence still partial",
    confidence: "POSSIBLE",
    priority: "Later",
    priorityScore: 61,
    timeToImpact: "3–6 weeks",
    doNotActYet: true,
  },
];

const identityRows = [
  { field: "gclid capture", status: "Partial", coverage: "81%", note: "Present on core inquiry forms, missing on a few legacy entry points." },
  { field: "utm parameter capture", status: "Strong", coverage: "93%", note: "Primary campaign tagging is mostly intact but not universal." },
  { field: "user_id persistence", status: "Weak", coverage: "42%", note: "Identity stitching is not consistent across device return paths." },
  { field: "hidden field CRM pass-through", status: "Partial", coverage: "68%", note: "Some inquiry records still lose source detail before backend storage." },
];

const attributionModels = [
  { model: "Last click", paid: "41%", organic: "34%", email: "6%", direct: "15%", useCase: "Reference only", note: "Overstates final-session channels and hides assisted influence." },
  { model: "Position-based", paid: "36%", organic: "31%", email: "11%", direct: "13%", useCase: "Internal reporting", note: "Better reflects first-touch and assist contribution in long sales cycles." },
  { model: "Weighted internal", paid: "38%", organic: "29%", email: "14%", direct: "10%", useCase: "Target future state", note: "Best fit once offline feedback and event weighting are fully enforced." },
];

const crmRows = [
  { item: "Inquiry status sync", status: "Partial", coverage: "61%", owner: "DevOps + Sales Ops", note: "Contacted and qualified statuses pass inconsistently by broker record." },
  { item: "Closed-won capture", status: "Weak", coverage: "19%", owner: "Sales Ops", note: "Offline close dates are not consistently recorded at the CRM layer." },
  { item: "Offline conversion upload readiness", status: "Partial", coverage: "46%", owner: "Analytics", note: "Core identifiers exist, but too many records still fail source completeness checks." },
  { item: "Broker ROI field completeness", status: "Moderate", coverage: "58%", owner: "Revenue Ops", note: "Usable for directional reporting, not yet safe for full renewal proofing." },
];

const lifecycleRows = [
  { audience: "Model viewers", email: "Synced", retargeting: "Synced", lifecycle: "Partial", note: "Core model-interest audiences are feeding paid and email, but suppression logic remains basic." },
  { audience: "Abandoned inquiry", email: "Partial", retargeting: "Synced", lifecycle: "Weak", note: "Trigger is live, but follow-up path is not fully segmented by model or source." },
  { audience: "High-intent scorers", email: "Weak", retargeting: "Partial", lifecycle: "Weak", note: "Scoring architecture exists conceptually but is not fully operationalized yet." },
  { audience: "Event leads", email: "Not synced", retargeting: "Partial", lifecycle: "Weak", note: "Event tagging discipline needs improvement before lifecycle value compounds." },
];

const severityRows = [
  { blocker: "Email_Open_ contamination", severity: "Critical", revenueRisk: "$18K–$30K misallocation risk / quarter", owner: "Analytics", firstDetected: "2026-02-11" },
  { blocker: "Call inquiry validation gap", severity: "High", revenueRisk: "$12K–$22K attribution blind spot / quarter", owner: "Analytics + DevOps", firstDetected: "2026-02-24" },
  { blocker: "Offline conversion incompleteness", severity: "High", revenueRisk: "Broker ROI proof and paid scale both constrained", owner: "Sales Ops + Analytics", firstDetected: "2026-03-03" },
];

const channelScaleStatus = [
  { item: "Organic Search", status: "Safe for scaling", note: "Clean enough for directional investment and landing optimization." },
  { item: "Paid Search", status: "Diagnostic only", note: "Use for optimization, but not broad scale moves until conversion validation improves." },
  { item: "Email", status: "Blocked by measurement", note: "Open inflation still distorts engagement truth." },
  { item: "Direct", status: "Diagnostic only", note: "Likely absorbs unattributed and return traffic contamination." },
  { item: "Call inquiry event", status: "Blocked by measurement", note: "Validation still incomplete." },
  { item: "Qualified inquiry event", status: "Safe for scaling", note: "Primary optimization-safe event when paired with clean source logic." },
];

const compareTrendData = {
  WoW: [
    { name: "Mon", value: 58 },
    { name: "Tue", value: 61 },
    { name: "Wed", value: 64 },
    { name: "Thu", value: 66 },
    { name: "Fri", value: 68 },
    { name: "Sat", value: 69 },
    { name: "Sun", value: 69 },
  ],
  MoM: [
    { name: "W1", value: 62 },
    { name: "W2", value: 64 },
    { name: "W3", value: 67 },
    { name: "W4", value: 69 },
  ],
  "90D": [
    { name: "Jan", value: 57 },
    { name: "Feb", value: 61 },
    { name: "Mar", value: 65 },
    { name: "Apr", value: 69 },
  ],
} as const;

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

export default function AvIntelOSPage02() {
  const [role, setRole] = useState<RoleKey>("casey");
  const [dateRange, setDateRange] = useState("30d");
  const [comparePeriod, setComparePeriod] = useState<ComparePeriod>("WoW");
  const [activeTab, setActiveTab] = useState<ViewTab>("overview");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [selectedSavedView, setSelectedSavedView] = useState(savedViewsByRole.casey[0].name);
  const [selectedTypes, setSelectedTypes] = useState<OpportunityType[]>(opportunityTypes);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [showDoNotActYet, setShowDoNotActYet] = useState(true);
  const [showCleanOnly, setShowCleanOnly] = useState(true);
  const [search, setSearch] = useState("");
  const [openOpportunityId, setOpenOpportunityId] = useState<string | null>(null);

  const activeRole = roles[role];
  const savedViews = savedViewsByRole[role];

  const filteredKPIs = useMemo(() => {
    return kpis.filter((item) => {
      if (activeRole.hideProbable && item.confidence !== "CONFIRMED") return false;
      if (confidenceFilter === "confirmed" && item.confidence !== "CONFIRMED") return false;
      if (confidenceFilter === "probable" && !(item.confidence === "CONFIRMED" || item.confidence === "PROBABLE")) return false;
      if (confidenceFilter === "possible" && item.confidence !== "POSSIBLE") return false;
      return true;
    });
  }, [activeRole.hideProbable, confidenceFilter]);

  const filteredChannels = useMemo(() => {
    return channelRows.filter((item) => {
      if (showCleanOnly && !item.clean) return false;
      if (activeRole.hideProbable && item.confidence !== "CONFIRMED") return false;
      if (confidenceFilter === "confirmed" && item.confidence !== "CONFIRMED") return false;
      if (confidenceFilter === "probable" && !(item.confidence === "CONFIRMED" || item.confidence === "PROBABLE")) return false;
      if (confidenceFilter === "possible" && item.confidence !== "POSSIBLE") return false;
      if (search && !`${item.channel} ${item.note}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [showCleanOnly, activeRole.hideProbable, confidenceFilter, search]);

  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter((item) => {
        if (activeRole.hideProbable && item.confidence !== "CONFIRMED") return false;
        if (confidenceFilter === "confirmed" && item.confidence !== "CONFIRMED") return false;
        if (confidenceFilter === "probable" && !(item.confidence === "CONFIRMED" || item.confidence === "PROBABLE")) return false;
        if (confidenceFilter === "possible" && item.confidence !== "POSSIBLE") return false;
        if (!selectedTypes.includes(item.type)) return false;
        if (showPinnedOnly && !item.pinned) return false;
        if (!showDoNotActYet && item.doNotActYet) return false;
        if (search && !`${item.signal} ${item.action} ${item.owner} ${item.type}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [activeRole.hideProbable, confidenceFilter, selectedTypes, showPinnedOnly, showDoNotActYet, search]);

  const selectedOpportunity = opportunities.find((item) => item.id === openOpportunityId) ?? null;
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

  function applySavedView(view: string) {
    setSelectedSavedView(view);
    if (view.includes("Confirmed") || view.includes("Board-Safe")) {
      setConfidenceFilter("confirmed");
      setShowCleanOnly(true);
      setShowPinnedOnly(false);
      setSelectedTypes(["Measurement", "Attribution", "Channel"]);
      setActiveTab("trust");
      return;
    }
    if (view.includes("Clean Traffic")) {
      setShowCleanOnly(true);
      setConfidenceFilter("probable");
      setSelectedTypes(["Channel", "Landing Page", "Measurement"]);
      setActiveTab("channels");
      return;
    }
    if (view.includes("Opportunity")) {
      setShowPinnedOnly(true);
      setSelectedTypes(opportunityTypes);
      setConfidenceFilter("all");
      setActiveTab("opportunities");
      return;
    }
    setShowCleanOnly(true);
    setSelectedTypes(opportunityTypes);
    setConfidenceFilter(role === "jeffrey" ? "confirmed" : "all");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
        <div className="mb-4 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Page structure</div>
              <div className="mt-1 text-sm text-slate-300">GA4 Analytics Hub is now built as a measurement-integrity and opportunity-detection page. Every view is designed to find leaks, explain root causes, and recommend actions without pretending contaminated metrics are safe.</div>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewTab)} className="w-full xl:w-auto">
              <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0 xl:w-auto">
                <TabsTrigger value="overview" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Overview</TabsTrigger>
                <TabsTrigger value="opportunities" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Opportunity Queue</TabsTrigger>
                <TabsTrigger value="channels" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Channel Truth</TabsTrigger>
                <TabsTrigger value="landing" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Landing Gaps</TabsTrigger>
                <TabsTrigger value="events" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Event Hierarchy</TabsTrigger>
                <TabsTrigger value="trust" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Data Trust</TabsTrigger>
                <TabsTrigger value="identity" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Identity & CRM</TabsTrigger>
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
                    <BarChart3 className="h-4 w-4" />
                    Av/IntelOS · Page 02
                  </div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">GA4 Analytics Hub</h1>
                  <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">Measurement integrity, channel truth, landing-page leaks, event hierarchy, and clean-vs-contaminated decision support.</p>
                </div>
                <div className="grid gap-3 text-sm md:grid-cols-2 xl:min-w-[520px]">
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="text-slate-400">Role</span>
                    <Select value={role} onValueChange={(v) => { setRole(v as RoleKey); setSelectedSavedView(savedViewsByRole[v as RoleKey][0].name); }}>
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
                      <SelectTrigger className="w-[220px] border-white/10 bg-slate-900/80"><SelectValue /></SelectTrigger>
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
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-bold"><Target className="h-5 w-5 text-sky-300" /> Measurement Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Primary opportunity</div>
                <div className="mt-2 font-semibold text-white">Turn clean traffic truth into page-level opportunity actions.</div>
                <p className="mt-2 leading-6">GA4 is most useful here when it isolates clean traffic, exposes landing leaks, and shows which tracked events are safe for optimization versus diagnosis only.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Operating rule</div>
                <div className="mt-2 font-semibold text-white">Do not optimize from contaminated metrics.</div>
                <p className="mt-2 leading-6">Native reported engagement can be displayed for context, but clean engagement and validation coverage should drive decisions.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Next unlock</div>
                <div className="mt-2 font-semibold text-white">Identity resolution + CRM closure loop</div>
                <p className="mt-2 leading-6">GA4 becomes materially more valuable once gclid, user_id, and offline outcome data are consistently stitched across inquiry and broker records.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><Filter className="h-5 w-5 text-sky-300" /> GA4 filters</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search channels, pages, events, actions" className="border-white/10 bg-slate-950/80 pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {opportunityTypes.map((type) => {
                  const active = selectedTypes.includes(type);
                  return <button key={type} onClick={() => toggleType(type)} className={`rounded-full border px-3 py-1.5 text-sm transition ${active ? "border-sky-400/30 bg-sky-500/15 text-sky-200" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>{type}</button>;
                })}
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3"><div><div className="text-sm font-medium text-white">Clean only</div><div className="text-xs text-slate-400">Hide contaminated rows</div></div><Switch checked={showCleanOnly} onCheckedChange={setShowCleanOnly} /></div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3"><div><div className="text-sm font-medium text-white">Pinned only</div><div className="text-xs text-slate-400">Weekly operator focus</div></div><Switch checked={showPinnedOnly} onCheckedChange={setShowPinnedOnly} /></div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3"><div><div className="text-sm font-medium text-white">Show do not act yet</div><div className="text-xs text-slate-400">Weak-confidence items</div></div><Switch checked={showDoNotActYet} onCheckedChange={setShowDoNotActYet} /></div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div><div className="text-sm font-medium text-white">Confidence</div><div className="text-xs text-slate-400">Visibility gate</div></div>
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
              {pinned.slice(0, 3).map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex items-center justify-between gap-2"><div className="font-medium text-white">{item.type}</div><div className={`font-semibold ${scoreClasses(item.priorityScore)}`}>{item.priorityScore}</div></div><div className="mt-1 text-slate-300">{item.signal}</div></div>)}
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6 rounded-2xl border-amber-400/20 bg-amber-500/10 text-amber-50">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Persistent contamination warning</AlertTitle>
          <AlertDescription>GA4 Data Alert: Email_Open_ events inflate engagement metrics. Real engagement is approximately 68.9% versus reported 17.3%. All native engagement views should be treated as contaminated unless filtered clean.</AlertDescription>
        </Alert>

        {activeTab === "overview" && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {filteredKPIs.map((kpi) => <Card key={kpi.id} className={`overflow-hidden rounded-3xl border bg-gradient-to-br ${toneClasses(kpi.statusTone)} bg-slate-900 text-slate-100 shadow-xl`}><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div><div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{kpi.id}</div><div className="mt-1 text-sm text-slate-300">{kpi.label}</div></div><Badge className={`border ${confidenceClasses(kpi.confidence)}`}>{kpi.confidence}</Badge></div><div className="mt-4 flex items-end justify-between gap-3"><div className="text-3xl font-black tracking-tight">{kpi.value}</div><div className={`flex items-center gap-1 text-sm ${kpi.deltaDirection === "down" && kpi.statusTone !== "good" ? "text-rose-300" : "text-emerald-300"}`}>{kpi.deltaDirection === "up" ? <TrendingUp className="h-4 w-4" /> : kpi.deltaDirection === "down" ? <TrendingDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}<span>{kpi.delta}</span></div></div><div className="mt-4 space-y-2 text-xs text-slate-400"><div className="flex items-center justify-between gap-3"><span>Source</span><span className="text-right text-slate-300">{kpi.source}</span></div><div className="flex items-center justify-between gap-3"><span>Freshness</span><span className="text-slate-300">{kpi.freshness}</span></div><p className="pt-2 leading-5 text-slate-300">{kpi.detail}</p></div></CardContent></Card>)}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
                <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-xl font-bold"><AlertTriangle className="h-5 w-5 text-amber-300" /> Top GA4 opportunities</CardTitle><Button variant="ghost" className="rounded-xl border border-white/10 bg-white/5" onClick={() => setActiveTab("opportunities")}>Open full queue <ChevronRight className="ml-2 h-4 w-4" /></Button></div></CardHeader>
                <CardContent className="space-y-3">
                  {filteredOpportunities.slice(0, 4).map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{item.type}</Badge><Badge className={`border ${priorityClasses(item.priority)}`}>{item.priority}</Badge><Badge className={`border ${confidenceClasses(item.confidence)}`}>{item.confidence}</Badge>{item.pinned && <Badge className="border border-amber-400/30 bg-amber-500/15 text-amber-200">Pinned</Badge>}{item.doNotActYet && <Badge className="border border-slate-400/30 bg-slate-500/15 text-slate-200">Do not act yet</Badge>}</div><div className="mt-2 font-semibold text-white">{item.signal}</div><p className="mt-2 text-sm leading-6 text-slate-300">{item.action}</p></div><div className="grid min-w-[200px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm"><div className="flex items-center justify-between"><span className="text-slate-400">Score</span><span className={scoreClasses(item.priorityScore)}>{item.priorityScore}</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Time</span><span>{item.timeToImpact}</span></div><Button variant="ghost" className="justify-between rounded-xl border border-white/10 bg-white/5 hover:bg-white/10" onClick={() => setOpenOpportunityId(item.id)}>Why this surfaced <ChevronRight className="h-4 w-4" /></Button></div></div></div>)}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
                <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><LineChartIcon className="h-5 w-5 text-sky-300" /> Clean engagement trend</CardTitle></CardHeader>
                <CardContent className="space-y-4"><div className="h-[220px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={compareTrendData[comparePeriod]}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" /><XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" /><YAxis stroke="rgba(255,255,255,0.45)" /><Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} /><Line type="monotone" dataKey="value" stroke="currentColor" className="text-sky-300" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Current compare view: <span className="font-semibold text-white">{comparePeriod}</span>. This trend intentionally uses clean logic, not native reported engagement.</div></CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
                <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Activity className="h-5 w-5 text-sky-300" /> Attribution model comparison</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {attributionModels.map((row) => <div key={row.model} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center justify-between gap-3"><div><div className="font-semibold text-white">{row.model}</div><div className="mt-1 text-sm text-slate-300">{row.note}</div></div><Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.useCase}</Badge></div><div className="mt-4 grid gap-3 md:grid-cols-4 text-sm"><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Paid</div><div className="mt-1 text-slate-200">{row.paid}</div></div><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Organic</div><div className="mt-1 text-slate-200">{row.organic}</div></div><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</div><div className="mt-1 text-slate-200">{row.email}</div></div><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Direct</div><div className="mt-1 text-slate-200">{row.direct}</div></div></div></div>)}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
                <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="h-5 w-5 text-amber-300" /> Safe for scaling status</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {channelScaleStatus.map((row) => <div key={row.item} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center justify-between gap-3"><div className="font-semibold text-white">{row.item}</div><Badge className={`border ${row.status === "Safe for scaling" ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200" : row.status === "Diagnostic only" ? "border-amber-400/30 bg-amber-500/15 text-amber-200" : "border-rose-400/30 bg-rose-500/15 text-rose-200"}`}>{row.status}</Badge></div><div className="mt-2 text-sm text-slate-300">{row.note}</div></div>)}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "opportunities" && (
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl"><CardHeader><div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><CardTitle className="flex items-center gap-2 text-xl font-bold"><AlertTriangle className="h-5 w-5 text-amber-300" /> Opportunity Queue</CardTitle><div className="text-sm text-slate-400">Signal → Gap → Cause → Action → Owner → Lift → Blocker</div></div></CardHeader><CardContent className="space-y-4">{filteredOpportunities.map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"><div className="space-y-3 xl:flex-1"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{item.type}</Badge><Badge className={`border ${confidenceClasses(item.confidence)}`}>{item.confidence}</Badge><Badge className={`border ${priorityClasses(item.priority)}`}>{item.priority}</Badge>{item.pinned && <Badge className="border border-amber-400/30 bg-amber-500/15 text-amber-200">Pinned</Badge>}{item.doNotActYet && <Badge className="border border-slate-400/30 bg-slate-500/15 text-slate-200">Do not act yet</Badge>}</div><div><div className="text-sm uppercase tracking-[0.2em] text-slate-500">Signal</div><div className="mt-1 font-semibold text-white">{item.signal}</div></div><div className="grid gap-3 md:grid-cols-2"><div><div className="text-sm uppercase tracking-[0.2em] text-slate-500">Gap</div><p className="mt-1 text-sm leading-6 text-slate-300">{item.gap}</p></div><div><div className="text-sm uppercase tracking-[0.2em] text-slate-500">Likely Cause</div><p className="mt-1 text-sm leading-6 text-slate-300">{item.likelyCause}</p></div></div><div><div className="text-sm uppercase tracking-[0.2em] text-slate-500">Recommended Action</div><p className="mt-1 text-sm leading-6 text-slate-200">{item.action}</p></div></div><div className="grid min-w-[290px] gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm"><div className="flex items-center justify-between"><span className="text-slate-400">Priority score</span><span className={`font-semibold ${scoreClasses(item.priorityScore)}`}>{item.priorityScore}</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Time to impact</span><span>{item.timeToImpact}</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Owner</span><span>{item.owner}</span></div><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Expected lift</div><div className="mt-2 grid gap-2 rounded-xl border border-white/10 bg-white/5 p-3"><div className="flex items-center justify-between"><span className="text-slate-400">Conservative</span><span className="text-slate-200">{item.expectedLift.conservative}</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Expected</span><span className="text-emerald-300">{item.expectedLift.expected}</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Aggressive</span><span className="text-slate-200">{item.expectedLift.aggressive}</span></div></div></div><div className="rounded-xl border border-white/10 bg-white/5 p-3"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Dependency / blocker</div><div className="mt-2 text-slate-200">Dependency: {item.dependency}</div><div className="mt-1 text-slate-300">Blocker: {item.blocker}</div></div><Button variant="ghost" className="justify-between rounded-xl border border-white/10 bg-white/5 hover:bg-white/10" onClick={() => setOpenOpportunityId(item.id)}>Why this surfaced <ChevronRight className="h-4 w-4" /></Button></div></div></div>)}</CardContent></Card>
        )}

        {activeTab === "channels" && (
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl"><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-xl font-bold"><Globe className="h-5 w-5 text-sky-300" /> Channel Truth</CardTitle><Badge className="border border-amber-400/30 bg-amber-500/15 text-amber-200">Clean-only recommended</Badge></div></CardHeader><CardContent className="space-y-3">{filteredChannels.map((row) => <div key={row.channel} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1.4fr]"><div><div className="flex items-center gap-2"><div className="font-semibold text-white">{row.channel}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge><Badge className={`border ${row.clean ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200" : "border-rose-400/30 bg-rose-500/15 text-rose-200"}`}>{row.clean ? "Clean" : "Contaminated"}</Badge></div><p className="mt-2 text-sm leading-6 text-slate-300">{row.note}</p></div><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Sessions</div><div className="mt-1 text-slate-200">{row.sessions.toLocaleString()}</div></div><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Users</div><div className="mt-1 text-slate-200">{row.users.toLocaleString()}</div></div><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Reported / Real</div><div className="mt-1 text-slate-200">{row.engagementReported} / <span className="text-emerald-300">{row.engagementReal}</span></div></div><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Conversions</div><div className="mt-1 text-slate-200">{row.conversions}</div></div><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Revenue</div><div className="mt-1 text-slate-200">{row.revenue}</div></div></div></div>)}</CardContent></Card>
        )}

        {activeTab === "landing" && (
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl"><CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Target className="h-5 w-5 text-emerald-300" /> Landing Gaps</CardTitle></CardHeader><CardContent className="space-y-3">{landingRows.map((row) => <div key={row.page} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"><div className="xl:flex-1"><div className="flex items-center gap-2"><div className="font-semibold text-white">{row.page}</div><Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.category}</Badge><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div><p className="mt-3 text-sm leading-6 text-slate-300">{row.issue}</p><p className="mt-2 text-sm leading-6 text-slate-200"><span className="font-medium">Fix:</span> {row.action}</p></div><div className="grid min-w-[260px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm"><div className="flex items-center justify-between"><span className="text-slate-400">Impressions</span><span>{row.impressions}</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Sessions</span><span>{row.sessions}</span></div><div className="flex items-center justify-between"><span className="text-slate-400">CVR</span><span className="text-emerald-300">{row.cvr}</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Bounce</span><span>{row.bounce}</span></div></div></div></div>)}</CardContent></Card>
        )}

        {activeTab === "events" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl"><CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Database className="h-5 w-5 text-sky-300" /> Conversion hierarchy</CardTitle></CardHeader><CardContent className="space-y-3">{eventRows.map((event) => <div key={event.event} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div><div className="flex items-center gap-2"><div className="font-semibold text-white">{event.event}</div><Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{event.tier}</Badge><Badge className={`border ${event.status === "Validated" ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200" : event.status === "Review Required" ? "border-amber-400/30 bg-amber-500/15 text-amber-200" : "border-slate-400/30 bg-slate-500/15 text-slate-200"}`}>{event.status}</Badge></div><p className="mt-2 text-sm leading-6 text-slate-300">{event.note}</p></div><div className="grid min-w-[220px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm"><div className="flex items-center justify-between"><span className="text-slate-400">Assigned value</span><span>{event.value}</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Owner</span><span>{event.owner}</span></div></div></div></div>)}</CardContent></Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl"><CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="h-5 w-5 text-amber-300" /> Event governance rules</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-300"><div className="rounded-2xl border border-white/10 bg-white/5 p-4">Tier 1 events are optimization-safe when validated. These should remain the default conversion backbone.</div><div className="rounded-2xl border border-white/10 bg-white/5 p-4">Tier 2 events are scoring and remarketing tools, not primary optimization anchors.</div><div className="rounded-2xl border border-white/10 bg-white/5 p-4">Tier 3 events are directional. They should be clearly marked to prevent low-quality optimization behavior.</div><div className="rounded-2xl border border-white/10 bg-white/5 p-4">If an event is not validated, the UI should downgrade recommendation confidence and flag the blocker visibly.</div></CardContent></Card>
          </div>
        )}

        {activeTab === "trust" && (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl"><CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Lock className="h-5 w-5 text-amber-300" /> Data Trust</CardTitle></CardHeader><CardContent className="space-y-4 text-sm text-slate-300"><div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4"><div className="font-semibold text-rose-200">Critical blockers</div><ul className="mt-2 space-y-2"><li>• Email_Open_ contamination still active</li><li>• Call inquiry event review required</li><li>• Validation coverage only 74%</li></ul></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="font-semibold text-white">Role-aware rendering</div><p className="mt-2 leading-6">{activeRole.label} sees {role === "jeffrey" ? "confirmed-only rendering" : "full confidence range"}. Clean views remain recommended for all roles.</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="font-semibold text-white">Decision rule</div><p className="mt-2 leading-6">Use this page to find opportunity and diagnose leaks. Do not use contaminated engagement metrics as the final truth for scale decisions.</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="font-semibold text-white">Measurement severity board</div><div className="mt-3 space-y-2 text-sm text-slate-300">{severityRows.map((row) => <div key={row.blocker} className="rounded-xl border border-white/10 bg-slate-950/50 p-3"><div className="flex items-center justify-between gap-3"><div className="font-medium text-white">{row.blocker}</div><Badge className={`border ${row.severity === "Critical" ? "border-rose-400/30 bg-rose-500/15 text-rose-200" : "border-amber-400/30 bg-amber-500/15 text-amber-200"}`}>{row.severity}</Badge></div><div className="mt-1 text-slate-400">Revenue risk: {row.revenueRisk}</div><div className="mt-1 text-slate-500">Owner: {row.owner} · First detected: {row.firstDetected}</div></div>)}</div></div></CardContent></Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl"><CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><CheckCircle2 className="h-5 w-5 text-emerald-300" /> Saved views by role</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-300">{savedViews.map((view) => <button key={view.name} onClick={() => applySavedView(view.name)} className={`block w-full rounded-2xl border p-4 text-left transition ${selectedSavedView === view.name ? "border-sky-400/30 bg-sky-500/15" : "border-white/10 bg-white/5 hover:bg-white/10"}`}><div className="font-semibold text-white">{view.name}</div><div className="mt-1 text-slate-300">{view.description}</div></button>)}</CardContent></Card>
          </div>
        )}

        {activeTab === "identity" && (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl"><CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Link2 className="h-5 w-5 text-sky-300" /> Identity resolution layer</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-300">{identityRows.map((row) => <div key={row.field} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center justify-between gap-3"><div className="font-semibold text-white">{row.field}</div><Badge className={`border ${row.status === "Strong" ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200" : row.status === "Partial" ? "border-amber-400/30 bg-amber-500/15 text-amber-200" : "border-rose-400/30 bg-rose-500/15 text-rose-200"}`}>{row.status}</Badge></div><div className="mt-2 text-slate-200">Coverage: {row.coverage}</div><div className="mt-1 text-slate-400">{row.note}</div></div>)}</CardContent></Card>
            <div className="space-y-6">
              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl"><CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Briefcase className="h-5 w-5 text-emerald-300" /> CRM & offline conversion status</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-300">{crmRows.map((row) => <div key={row.item} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center justify-between gap-3"><div className="font-semibold text-white">{row.item}</div><div className="text-slate-200">{row.status} · {row.coverage}</div></div><div className="mt-1 text-slate-400">Owner: {row.owner}</div><div className="mt-2 text-slate-300">{row.note}</div></div>)}</CardContent></Card>
              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl"><CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Upload className="h-5 w-5 text-amber-300" /> Lifecycle audience sync health</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-300">{lifecycleRows.map((row) => <div key={row.audience} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="font-semibold text-white">{row.audience}</div><div className="mt-2 grid gap-2 md:grid-cols-3"><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</div><div className="mt-1 text-slate-200">{row.email}</div></div><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Retargeting</div><div className="mt-1 text-slate-200">{row.retargeting}</div></div><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Lifecycle</div><div className="mt-1 text-slate-200">{row.lifecycle}</div></div></div><div className="mt-2 text-slate-400">{row.note}</div></div>)}</CardContent></Card>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl"><CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-sky-300" /> GA4 action framework</CardTitle></CardHeader><CardContent className="space-y-4 text-sm leading-6 text-slate-300"><div className="rounded-2xl border border-white/10 bg-white/5 p-4">Fast wins: fix high-leak landing pages, default operators into clean-only views, and label unsafe metrics more aggressively.</div><div className="rounded-2xl border border-white/10 bg-white/5 p-4">Strategic moves: finish validation coverage, connect clean channel truth to page and geo opportunities, and tighten event hierarchy governance.</div><div className="rounded-2xl border border-white/10 bg-white/5 p-4">Blockers: call event QA, native engagement misuse, and incomplete conversion validation across paid segments.</div></CardContent></Card>
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl"><CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Database className="h-5 w-5 text-emerald-300" /> Clean vs reported channel chart</CardTitle></CardHeader><CardContent className="h-[320px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={filteredChannels.map((item) => ({ name: item.channel, reported: Number(item.engagementReported.replace("%", "")), real: Number(item.engagementReal.replace("%", "")) }))}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" /><XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" /><YAxis stroke="rgba(255,255,255,0.45)" /><Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} /><Bar dataKey="reported" fill="currentColor" className="text-amber-300" radius={[8, 8, 0, 0]} /><Bar dataKey="real" fill="currentColor" className="text-sky-300" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
        </div>

        <Sheet open={!!selectedOpportunity} onOpenChange={(open) => !open && setOpenOpportunityId(null)}>
          <SheetContent side="right" className="w-full border-white/10 bg-slate-950 text-slate-100 sm:max-w-xl">
            {selectedOpportunity && <><SheetHeader><SheetTitle className="text-left text-xl text-white">Why this surfaced</SheetTitle><SheetDescription className="text-left text-slate-400">GA4 recommendation logic, blockers, and expected lift inspection drawer.</SheetDescription></SheetHeader><div className="mt-6 space-y-4"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{selectedOpportunity.type}</Badge><Badge className={`border ${confidenceClasses(selectedOpportunity.confidence)}`}>{selectedOpportunity.confidence}</Badge><Badge className={`border ${priorityClasses(selectedOpportunity.priority)}`}>{selectedOpportunity.priority}</Badge>{selectedOpportunity.doNotActYet && <Badge className="border border-slate-400/30 bg-slate-500/15 text-slate-200">Do not act yet</Badge>}</div><div><div className="text-2xl font-bold text-white">{selectedOpportunity.signal}</div><p className="mt-2 text-sm leading-6 text-slate-300">{selectedOpportunity.gap}</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Likely cause</div><p className="mt-2 text-sm leading-6 text-slate-200">{selectedOpportunity.likelyCause}</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Why this surfaced</div><ul className="mt-2 space-y-2 text-sm text-slate-200">{selectedOpportunity.whySurfaced.map((reason) => <li key={reason}>• {reason}</li>)}</ul></div><div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Owner</div><div className="mt-2 text-slate-200">{selectedOpportunity.owner}</div><div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Time to impact</div><div className="mt-2 flex items-center gap-2 text-slate-200"><Clock3 className="h-4 w-4 text-sky-300" /> {selectedOpportunity.timeToImpact}</div></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Priority score</div><div className={`mt-2 text-2xl font-bold ${scoreClasses(selectedOpportunity.priorityScore)}`}>{selectedOpportunity.priorityScore}</div><div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Blocker</div><div className="mt-2 text-slate-200">{selectedOpportunity.blocker}</div></div></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Expected lift range</div><div className="mt-3 grid gap-2"><div className="flex items-center justify-between"><span className="text-slate-400">Conservative</span><span className="text-slate-200">{selectedOpportunity.expectedLift.conservative}</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Expected</span><span className="text-emerald-300">{selectedOpportunity.expectedLift.expected}</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Aggressive</span><span className="text-slate-200">{selectedOpportunity.expectedLift.aggressive}</span></div></div></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Dependency</div><p className="mt-2 text-slate-200">{selectedOpportunity.dependency}</p><div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Recommended action</div><p className="mt-2 text-slate-200">{selectedOpportunity.action}</p></div></div></>}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
