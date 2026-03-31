import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Filter,
  Flag,
  Gauge,
  GitBranch,
  LayoutDashboard,
  Lock,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
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
    { name: "Weekly Operator View", description: "Top 3 priorities, blockers, reallocations, and stop-losses." },
    { name: "Budget Reallocation", description: "Channel shifts, segment pressure, and scale discipline." },
    { name: "Initiative Control Board", description: "Launch status, owners, dependencies, and kill/scale decisions." },
  ],
  clay: [
    { name: "Executive Cadence", description: "Weekly control with monthly scorecards and resource constraints." },
    { name: "Operational Bottlenecks", description: "Capacity, reporting, and conversion blockers." },
    { name: "Quarterly Reset", description: "Constraint-first quarterly planning and project selection." },
  ],
  jeffrey: [
    { name: "Board-Safe Operating View", description: "Confirmed priorities, resource focus, and revenue guardrails." },
    { name: "30-Day Forward Roadmap", description: "Protect, Grow, Expand, Optimize plan summary." },
    { name: "Strategic Constraint", description: "The one thing currently limiting growth the most." },
  ],
} as const;

const roles = {
  casey: { label: "Casey Jones", title: "Head of Marketing", hideProbable: false },
  clay: { label: "Clay Martin", title: "COO", hideProbable: false },
  jeffrey: { label: "Jeffrey Carrithers", title: "CEO", hideProbable: true },
} as const;

type RoleKey = keyof typeof roles;
type Confidence = "CONFIRMED" | "PROBABLE" | "POSSIBLE";
type ViewTab = "overview" | "weekly" | "monthly" | "quarterly" | "initiatives" | "trust";
type ComparePeriod = "WoW" | "MoM" | "90D";
type InitiativeStage = "Proposal" | "Controlled Launch" | "Scale" | "Refine" | "Hold" | "Kill";
type PriorityTier = "Now" | "Next" | "Later" | "Kill";

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

type WeeklyPriority = {
  id: string;
  title: string;
  area: string;
  objective: string;
  owner: string;
  kpiTarget: string;
  timeline: string;
  stopLoss: string;
  dependency: string;
  confidence: Confidence;
  pinned?: boolean;
  score: number;
};

type Bottleneck = {
  area: string;
  currentState: string;
  classification: "Traffic Share" | "Conversion Rate" | "Lead Quality" | "Monetization" | "Team Capacity";
  evidence: string;
  implication: string;
  confidence: Confidence;
};

type BudgetShift = {
  from: string;
  to: string;
  amount: string;
  reason: string;
  condition: string;
  confidence: Confidence;
};

type ChannelScore = {
  channel: string;
  revenueImpact: number;
  efficiency: number;
  scalability: number;
  competitiveLeverage: number;
  operationalComplexity: number;
  total: number;
  recommendation: "Scale" | "Refine" | "Hold" | "Kill";
};

type MajorProject = {
  id: string;
  name: string;
  objective: string;
  owner: string;
  timeline: string;
  dependency: string;
  risk: string;
  measurement: string;
  score: number;
  confidence: Confidence;
  stage: InitiativeStage;
};

type Initiative = {
  id: string;
  title: string;
  stage: InitiativeStage;
  hypothesis: string;
  expectedImpact: { conservative: string; expected: string; aggressive: string };
  costEstimate: string;
  stopLoss: string;
  owner: string;
  dependency: string;
  blocker: string;
  confidence: Confidence;
  priority: PriorityTier;
  priorityScore: number;
  whySurfaced: string[];
};

const kpis: KPI[] = [
  {
    id: "E001",
    label: "Primary Constraint",
    value: "Measurement Integrity",
    delta: "Unchanged",
    deltaDirection: "flat",
    confidence: "CONFIRMED",
    source: "Cross-page operating diagnosis",
    freshness: "22 min ago",
    detail: "Jet scale and some reallocation decisions remain partially blocked by conversion validation and offline feedback gaps.",
    statusTone: "bad",
  },
  {
    id: "E002",
    label: "Weekly Priority Count",
    value: "3 Locked",
    delta: "At cap",
    deltaDirection: "flat",
    confidence: "CONFIRMED",
    source: "Execution governance layer",
    freshness: "11 min ago",
    detail: "No more than three major priorities should run at once to avoid dilution.",
    statusTone: "good",
  },
  {
    id: "E003",
    label: "Reallocation Readiness",
    value: "Selective",
    delta: "+1 segment",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "PPC + SEO + conversion review",
    freshness: "47 min ago",
    detail: "Budget can shift within piston and high-intent clusters, but broad expansion remains controlled.",
    statusTone: "warn",
  },
  {
    id: "E004",
    label: "Execution Capacity",
    value: "Constrained",
    delta: "1 blocker active",
    deltaDirection: "down",
    confidence: "PROBABLE",
    source: "Org assumption model",
    freshness: "2 hrs ago",
    detail: "Limited in-house bandwidth and fragmented execution ownership still constrain velocity.",
    statusTone: "warn",
  },
  {
    id: "E005",
    label: "Roadmap Discipline",
    value: "8.6 / 10",
    delta: "+0.7 pts MoM",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Initiative hygiene audit",
    freshness: "1 hr ago",
    detail: "Random acts of marketing are decreasing, but some initiatives still lack kill rules or owner clarity.",
    statusTone: "good",
  },
];

const weeklyPriorities: WeeklyPriority[] = [
  {
    id: "wp-001",
    title: "Fix Cessna 172 CTR leak",
    area: "Organic",
    objective: "Increase commercial click capture on a top-volume model page.",
    owner: "SEO + Content",
    kpiTarget: "+0.8 pts CTR in 14 days",
    timeline: "This week",
    stopLoss: "Revert if CTR lift <0.2 pts after 14 days with stable ranking.",
    dependency: "Metadata deploy + title testing window",
    confidence: "CONFIRMED",
    pinned: true,
    score: 93,
  },
  {
    id: "wp-002",
    title: "Tighten PPC dayparting and geo shaping",
    area: "PPC",
    objective: "Reduce low-efficiency spend and reallocate into top-performing windows.",
    owner: "PPC Lead",
    kpiTarget: "-8% CPQI on priority campaigns",
    timeline: "This week",
    stopLoss: "Pause reallocation if volume falls >12% without efficiency gain.",
    dependency: "Location and hour-level conversion QA",
    confidence: "PROBABLE",
    pinned: true,
    score: 89,
  },
  {
    id: "wp-003",
    title: "Contain silver-tier broker churn",
    area: "Revenue",
    objective: "Protect at-risk accounts inside renewal window.",
    owner: "Sales / Retention",
    kpiTarget: "$24K protected ARR pipeline",
    timeline: "This week",
    stopLoss: "Escalate if save rate remains below 20% after first outreach wave.",
    dependency: "ROI brief template + account usage audit",
    confidence: "PROBABLE",
    pinned: true,
    score: 87,
  },
];

const bottlenecks: Bottleneck[] = [
  {
    area: "Paid Scaling",
    currentState: "Piston can scale selectively, jets still partially blocked.",
    classification: "Lead Quality",
    evidence: "Conversion validation and offline close confidence remain incomplete for higher-value segments.",
    implication: "Budget can move inside trusted pockets, but broad expansion risks false positives.",
    confidence: "CONFIRMED",
  },
  {
    area: "Organic Growth",
    currentState: "Traffic share exists, but commercial CTR leaks reduce output.",
    classification: "Traffic Share",
    evidence: "High-impression model pages under-capture clicks and value.",
    implication: "Fast-win organic opportunity remains underexploited.",
    confidence: "CONFIRMED",
  },
  {
    area: "Advertiser Monetization",
    currentState: "Mid-tier renewal risk rising.",
    classification: "Monetization",
    evidence: "Utilization and response quality are soft in at-risk accounts.",
    implication: "ARR protection should outrank low-confidence expansion work this week.",
    confidence: "PROBABLE",
  },
  {
    area: "Execution Velocity",
    currentState: "Multiple systems exist, but capacity is constrained.",
    classification: "Team Capacity",
    evidence: "Some initiatives still depend on shared dev and analytics support.",
    implication: "Too many simultaneous priorities would reduce execution quality.",
    confidence: "PROBABLE",
  },
];

const budgetShifts: BudgetShift[] = [
  {
    from: "Broad non-brand paid",
    to: "High-intent piston model clusters",
    amount: "$3.2K / week",
    reason: "Higher inquiry density and cleaner conversion truth.",
    condition: "Keep shift only if CPQI improves without volume collapse.",
    confidence: "CONFIRMED",
  },
  {
    from: "Evening spend",
    to: "Tue–Thu midday windows",
    amount: "$1.1K / week",
    reason: "Evening efficiency remains materially worse than core dayparts.",
    condition: "Retain if conversion rate holds above campaign baseline.",
    confidence: "PROBABLE",
  },
  {
    from: "Low-yield social prospecting",
    to: "Retargeting / lifecycle audiences",
    amount: "$600 / week",
    reason: "Current social role is better as audience-building support than direct response.",
    condition: "Scale only if assisted path value improves.",
    confidence: "POSSIBLE",
  },
];

const channelScores: ChannelScore[] = [
  { channel: "PPC", revenueImpact: 9, efficiency: 7, scalability: 8, competitiveLeverage: 8, operationalComplexity: 6, total: 38, recommendation: "Scale" },
  { channel: "SEO", revenueImpact: 8, efficiency: 9, scalability: 8, competitiveLeverage: 9, operationalComplexity: 5, total: 39, recommendation: "Scale" },
  { channel: "Lifecycle", revenueImpact: 6, efficiency: 8, scalability: 7, competitiveLeverage: 6, operationalComplexity: 6, total: 33, recommendation: "Refine" },
  { channel: "Retargeting", revenueImpact: 5, efficiency: 7, scalability: 6, competitiveLeverage: 5, operationalComplexity: 4, total: 27, recommendation: "Refine" },
  { channel: "Social Authority", revenueImpact: 4, efficiency: 4, scalability: 5, competitiveLeverage: 5, operationalComplexity: 5, total: 23, recommendation: "Hold" },
  { channel: "Events", revenueImpact: 3, efficiency: 3, scalability: 2, competitiveLeverage: 4, operationalComplexity: 8, total: 20, recommendation: "Hold" },
];

const quarterlyProjects: MajorProject[] = [
  {
    id: "qp-001",
    name: "Piston Demand Capture Expansion",
    objective: "Increase qualified inquiries from high-intent piston clusters.",
    owner: "PPC + SEO",
    timeline: "90 days",
    dependency: "Landing page fixes + query cluster map",
    risk: "Scaling before conversion confidence is fully clean in edge segments.",
    measurement: "+20% qualified inquiries / stable CPQI",
    score: 94,
    confidence: "CONFIRMED",
    stage: "Scale",
  },
  {
    id: "qp-002",
    name: "Measurement Integrity Closure",
    objective: "Raise confidence in paid and offline attribution before broader expansion.",
    owner: "Analytics + DevOps",
    timeline: "60 days",
    dependency: "Call tracking and CRM feedback loop",
    risk: "Slow technical support delays budget decisions.",
    measurement: "Validation coverage >90%",
    score: 97,
    confidence: "CONFIRMED",
    stage: "Controlled Launch",
  },
  {
    id: "qp-003",
    name: "Broker Retention and ARPA Lift",
    objective: "Protect and expand advertiser revenue in at-risk and mid-tier accounts.",
    owner: "Sales / Retention",
    timeline: "90 days",
    dependency: "Usage proof and ROI deck standardization",
    risk: "Weak offline close data blunts renewal proof.",
    measurement: "+15% advertiser revenue / reduced churn",
    score: 88,
    confidence: "PROBABLE",
    stage: "Refine",
  },
  {
    id: "qp-004",
    name: "Authority Content to Commerce Routing",
    objective: "Turn research-stage traffic into stronger downstream inquiry paths.",
    owner: "Content + Lifecycle",
    timeline: "90 days",
    dependency: "Content template modules + attribution cleanup",
    risk: "Assist value remains too modeled in some cohorts.",
    measurement: "+15% organic assist progression",
    score: 72,
    confidence: "POSSIBLE",
    stage: "Proposal",
  },
];

const initiatives: Initiative[] = [
  {
    id: "init-001",
    title: "Piston make/model PPC restructure",
    stage: "Controlled Launch",
    hypothesis: "Tighter model-specific segmentation will improve inquiry efficiency and isolate scale pockets.",
    expectedImpact: { conservative: "-4% CPQI", expected: "-9% CPQI", aggressive: "-14% CPQI" },
    costEstimate: "$4.5K test budget",
    stopLoss: "Stop if conversion rate drops >15% after 10 days.",
    owner: "PPC Lead",
    dependency: "Campaign rebuild + conversion QA",
    blocker: "Some segment validation incomplete",
    confidence: "PROBABLE",
    priority: "Now",
    priorityScore: 90,
    whySurfaced: [
      "Existing structure spreads spend too broadly",
      "Model-level conversion efficiency differs materially by segment",
      "Current setup masks scale pockets and waste pockets",
    ],
  },
  {
    id: "init-002",
    title: "Commercial SEO CTR recovery sprint",
    stage: "Scale",
    hypothesis: "Improving titles, snippets, and above-the-fold trust signals will produce immediate click gains on existing rankings.",
    expectedImpact: { conservative: "+4% CTR", expected: "+8% CTR", aggressive: "+12% CTR" },
    costEstimate: "Internal content + SEO capacity",
    stopLoss: "Pause after 3 waves if CTR gain stays below 0.3 pts per wave.",
    owner: "SEO + Content",
    dependency: "Deployment access + test queue",
    blocker: "None",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 95,
    whySurfaced: [
      "Multiple priority pages have high impressions and weak CTR",
      "Rankings are already strong enough to monetize better now",
      "This is one of the cleanest near-term wins in the system",
    ],
  },
  {
    id: "init-003",
    title: "Authority content assist expansion",
    stage: "Proposal",
    hypothesis: "Stronger research content clusters will improve assisted inquiry paths over time.",
    expectedImpact: { conservative: "+3 assisted inquiries", expected: "+8 assisted inquiries", aggressive: "+14 assisted inquiries" },
    costEstimate: "$6K content capacity / month",
    stopLoss: "Hold if assist-path confidence does not improve within 45 days.",
    owner: "Content + Lifecycle",
    dependency: "Assist attribution improvements",
    blocker: "Attribution still partial",
    confidence: "POSSIBLE",
    priority: "Later",
    priorityScore: 61,
    whySurfaced: [
      "Authority content has early traction",
      "Commercial handoff is still incomplete",
      "Scaling now without better proof could waste effort",
    ],
  },
  {
    id: "init-004",
    title: "Silver-tier churn containment playbook",
    stage: "Refine",
    hypothesis: "Usage-based save motions and ROI packaging can protect mid-tier revenue and create upsell paths.",
    expectedImpact: { conservative: "$12K protected ARR", expected: "$24K protected ARR", aggressive: "$31K protected ARR" },
    costEstimate: "Low direct spend / internal sales time",
    stopLoss: "Kill if renewal save rate remains below 15% after two cycles.",
    owner: "Sales / Retention",
    dependency: "Account-level utilization and response proof",
    blocker: "Offline close feedback incomplete",
    confidence: "PROBABLE",
    priority: "Now",
    priorityScore: 86,
    whySurfaced: [
      "Renewal-risk accounts are entering save window now",
      "Revenue protection is higher confidence than some new expansion bets",
      "Account utilization gaps are visible enough to act on",
    ],
  },
];

const compareTrendData = {
  WoW: [
    { name: "Mon", value: 61 },
    { name: "Tue", value: 66 },
    { name: "Wed", value: 70 },
    { name: "Thu", value: 73 },
    { name: "Fri", value: 76 },
    { name: "Sat", value: 78 },
    { name: "Sun", value: 80 },
  ],
  MoM: [
    { name: "W1", value: 58 },
    { name: "W2", value: 64 },
    { name: "W3", value: 72 },
    { name: "W4", value: 80 },
  ],
  "90D": [
    { name: "Jan", value: 51 },
    { name: "Feb", value: 61 },
    { name: "Mar", value: 71 },
    { name: "Apr", value: 80 },
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

function stageClasses(stage: InitiativeStage) {
  if (stage === "Scale") return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  if (stage === "Controlled Launch" || stage === "Refine") return "border-amber-400/30 bg-amber-500/15 text-amber-200";
  if (stage === "Proposal" || stage === "Hold") return "border-slate-400/30 bg-slate-500/15 text-slate-200";
  return "border-rose-400/30 bg-rose-500/15 text-rose-200";
}

function priorityClasses(priority: PriorityTier) {
  if (priority === "Now") return "bg-rose-500/15 text-rose-200 border-rose-400/30";
  if (priority === "Next") return "bg-amber-500/15 text-amber-200 border-amber-400/30";
  if (priority === "Later") return "bg-slate-500/15 text-slate-200 border-slate-400/30";
  return "bg-rose-950/40 text-rose-200 border-rose-500/30";
}

function scoreClasses(score: number) {
  if (score >= 90) return "text-emerald-300";
  if (score >= 75) return "text-amber-300";
  return "text-slate-300";
}

export default function AvIntelOSPage04() {
  const [role, setRole] = useState<RoleKey>("casey");
  const [dateRange, setDateRange] = useState("30d");
  const [comparePeriod, setComparePeriod] = useState<ComparePeriod>("WoW");
  const [activeTab, setActiveTab] = useState<ViewTab>("overview");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [selectedSavedView, setSelectedSavedView] = useState(savedViewsByRole.casey[0].name);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [openInitiativeId, setOpenInitiativeId] = useState<string | null>(null);

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

  const filteredWeeklyPriorities = useMemo(() => {
    return weeklyPriorities.filter((item) => {
      if (activeRole.hideProbable && item.confidence !== "CONFIRMED") return false;
      if (confidenceFilter === "confirmed" && item.confidence !== "CONFIRMED") return false;
      if (confidenceFilter === "probable" && !(item.confidence === "CONFIRMED" || item.confidence === "PROBABLE")) return false;
      if (confidenceFilter === "possible" && item.confidence !== "POSSIBLE") return false;
      if (showPinnedOnly && !item.pinned) return false;
      if (search && !`${item.title} ${item.area} ${item.objective} ${item.owner}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activeRole.hideProbable, confidenceFilter, showPinnedOnly, search]);

  const filteredInitiatives = useMemo(() => {
    return initiatives.filter((item) => {
      if (activeRole.hideProbable && item.confidence !== "CONFIRMED") return false;
      if (confidenceFilter === "confirmed" && item.confidence !== "CONFIRMED") return false;
      if (confidenceFilter === "probable" && !(item.confidence === "CONFIRMED" || item.confidence === "PROBABLE")) return false;
      if (confidenceFilter === "possible" && item.confidence !== "POSSIBLE") return false;
      if (search && !`${item.title} ${item.hypothesis} ${item.owner}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  }, [activeRole.hideProbable, confidenceFilter, search]);

  const pinnedPriorities = filteredWeeklyPriorities.filter((item) => item.pinned);
  const selectedInitiative = initiatives.find((item) => item.id === openInitiativeId) ?? null;

  function applySavedView(view: string) {
    setSelectedSavedView(view);
    if (view.includes("Budget")) {
      setActiveTab("weekly");
      setConfidenceFilter("probable");
      return;
    }
    if (view.includes("Quarterly") || view.includes("Strategic Constraint")) {
      setActiveTab("quarterly");
      setConfidenceFilter(role === "jeffrey" ? "confirmed" : "probable");
      return;
    }
    if (view.includes("Roadmap") || view.includes("Initiative")) {
      setActiveTab("initiatives");
      setConfidenceFilter("all");
      return;
    }
    setActiveTab("overview");
    setConfidenceFilter(role === "jeffrey" ? "confirmed" : "all");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
        <div className="mb-4 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Page structure</div>
              <div className="mt-1 text-sm text-slate-300">Execution System & Operating Cadence is the management layer. It controls weekly priorities, bottlenecks, budget shifts, monthly scorecards, quarterly resets, and initiative lifecycle discipline.</div>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewTab)} className="w-full xl:w-auto">
              <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0 xl:w-auto">
                <TabsTrigger value="overview" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Overview</TabsTrigger>
                <TabsTrigger value="weekly" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Weekly Cadence</TabsTrigger>
                <TabsTrigger value="monthly" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Monthly Review</TabsTrigger>
                <TabsTrigger value="quarterly" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Quarterly Reset</TabsTrigger>
                <TabsTrigger value="initiatives" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Initiative Lifecycle</TabsTrigger>
                <TabsTrigger value="trust" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Execution Trust</TabsTrigger>
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
                    <LayoutDashboard className="h-4 w-4" />
                    Av/IntelOS · Page 04
                  </div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">Execution System & Operating Cadence</h1>
                  <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">The structural execution engine for weekly control, monthly scorecards, quarterly focus, initiative hygiene, and resource discipline.</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-bold"><Target className="h-5 w-5 text-sky-300" /> Execution Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Operating rule</div>
                <div className="mt-2 font-semibold text-white">No reactive chaos. Weekly control, monthly scoring, quarterly focus.</div>
                <p className="mt-2 leading-6">The system should not just report marketing. It should classify the bottleneck, lock the top three priorities, and force explicit scale/refine/hold/kill decisions.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Current management stance</div>
                <div className="mt-2 font-semibold text-white">Controlled-aggressive</div>
                <p className="mt-2 leading-6">Scale where intent and trust are clean. Hold or refine where attribution, capacity, or inventory make the signal unstable.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><Filter className="h-5 w-5 text-sky-300" /> Execution filters</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search priorities, owners, initiatives" className="border-white/10 bg-slate-950/80 pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div><div className="text-sm font-medium text-white">Pinned only</div><div className="text-xs text-slate-400">Weekly lock view</div></div>
                  <Switch checked={showPinnedOnly} onCheckedChange={setShowPinnedOnly} />
                </div>
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
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div><div className="text-sm font-medium text-white">Priority cap</div><div className="text-xs text-slate-400">Maximum 3 major initiatives</div></div>
                  <Badge className="border border-emerald-400/30 bg-emerald-500/15 text-emerald-200">Enforced</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-bold"><Flag className="h-5 w-5 text-amber-300" /> Pinned this week</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {pinnedPriorities.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-white">{item.area}</div>
                    <div className={`font-semibold ${scoreClasses(item.score)}`}>{item.score}</div>
                  </div>
                  <div className="mt-1 text-slate-300">{item.title}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6 rounded-2xl border-amber-400/20 bg-amber-500/10 text-amber-50">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Execution governance warning</AlertTitle>
          <AlertDescription>
            Do not allow more than three major priorities at once. If the bottleneck is unclear, the system should diagnose first, not expand activity.
          </AlertDescription>
        </Alert>

        {activeTab === "overview" && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold"><Sparkles className="h-5 w-5 text-amber-300" /> Weekly locked priorities</CardTitle>
                    <Button variant="ghost" className="rounded-xl border border-white/10 bg-white/5" onClick={() => setActiveTab("weekly")}>Open weekly cadence <ChevronRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredWeeklyPriorities.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{item.area}</Badge>
                            <Badge className={`border ${confidenceClasses(item.confidence)}`}>{item.confidence}</Badge>
                            {item.pinned && <Badge className="border border-amber-400/30 bg-amber-500/15 text-amber-200">Locked</Badge>}
                          </div>
                          <div className="mt-2 font-semibold text-white">{item.title}</div>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{item.objective}</p>
                        </div>
                        <div className="grid min-w-[220px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                          <div className="flex items-center justify-between"><span className="text-slate-400">Score</span><span className={scoreClasses(item.score)}>{item.score}</span></div>
                          <div className="flex items-center justify-between"><span className="text-slate-400">Owner</span><span>{item.owner}</span></div>
                          <div className="flex items-center justify-between"><span className="text-slate-400">Timeline</span><span>{item.timeline}</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
                <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Gauge className="h-5 w-5 text-sky-300" /> Operating rhythm trend</CardTitle></CardHeader>
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
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Current compare view: <span className="font-semibold text-white">{comparePeriod}</span>. Operating discipline should improve over time as initiatives become more controlled and fewer priorities are run simultaneously.</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "weekly" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Calendar className="h-5 w-5 text-sky-300" /> Weekly cadence control</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredWeeklyPriorities.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="xl:flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-semibold text-white">{item.title}</div>
                          <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{item.area}</Badge>
                          <Badge className={`border ${confidenceClasses(item.confidence)}`}>{item.confidence}</Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-300">{item.objective}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-200"><span className="font-medium">Stop-loss:</span> {item.stopLoss}</p>
                      </div>
                      <div className="grid min-w-[280px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                        <div className="flex items-center justify-between"><span className="text-slate-400">Owner</span><span>{item.owner}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-400">KPI target</span><span>{item.kpiTarget}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-400">Timeline</span><span>{item.timeline}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-400">Dependency</span><span className="text-right">{item.dependency}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
                <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><AlertTriangle className="h-5 w-5 text-amber-300" /> Bottleneck classification</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {bottlenecks.map((item) => (
                    <div key={item.area} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-semibold text-white">{item.area}</div>
                        <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{item.classification}</Badge>
                        <Badge className={`border ${confidenceClasses(item.confidence)}`}>{item.confidence}</Badge>
                      </div>
                      <div className="mt-2 text-sm text-slate-300">{item.currentState}</div>
                      <div className="mt-2 text-sm text-slate-400">Evidence: {item.evidence}</div>
                      <div className="mt-1 text-sm text-slate-200">Implication: {item.implication}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
                <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Wallet className="h-5 w-5 text-emerald-300" /> Budget reallocation moves</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {budgetShifts.map((item) => (
                    <div key={`${item.from}-${item.to}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-white">{item.from} → {item.to}</div>
                        <Badge className={`border ${confidenceClasses(item.confidence)}`}>{item.confidence}</Badge>
                      </div>
                      <div className="mt-2 text-sm text-slate-200">Amount: {item.amount}</div>
                      <div className="mt-1 text-sm text-slate-300">Reason: {item.reason}</div>
                      <div className="mt-1 text-sm text-slate-400">Condition: {item.condition}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "monthly" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-sky-300" /> Monthly channel scorecard</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {channelScores.map((row) => (
                  <div key={row.channel} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-white">{row.channel}</div>
                      <Badge className={`border ${row.recommendation === "Scale" ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200" : row.recommendation === "Refine" ? "border-amber-400/30 bg-amber-500/15 text-amber-200" : row.recommendation === "Hold" ? "border-slate-400/30 bg-slate-500/15 text-slate-200" : "border-rose-400/30 bg-rose-500/15 text-rose-200"}`}>{row.recommendation}</Badge>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Revenue</div><div className="mt-1 text-slate-200">{row.revenueImpact}/10</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Efficiency</div><div className="mt-1 text-slate-200">{row.efficiency}/10</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Scalability</div><div className="mt-1 text-slate-200">{row.scalability}/10</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Competitive</div><div className="mt-1 text-slate-200">{row.competitiveLeverage}/10</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Complexity</div><div className="mt-1 text-slate-200">{row.operationalComplexity}/10</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</div><div className={`mt-1 font-semibold ${scoreClasses(row.total * 2.5)}`}>{row.total}</div></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><GitBranch className="h-5 w-5 text-amber-300" /> 30-day forward roadmap</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Protect:</span> broker retention, top piston demand capture, measurement integrity guardrails.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Grow:</span> high-intent PPC segments, commercial organic CTR fixes, winning make/model clusters.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Expand:</span> only controlled experiments with clear stop-loss rules and measurement clarity.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Optimize:</span> landing conversion, listing quality, event governance, and owner accountability.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "quarterly" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Target className="h-5 w-5 text-sky-300" /> Quarterly reset</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Revenue targets</div>
                  <div className="mt-2 text-slate-200">+20% qualified inquiries · +15% advertiser revenue · -10% CPQI</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Primary constraint</div>
                  <div className="mt-2 font-semibold text-white">Measurement Integrity</div>
                  <p className="mt-2">Only one primary constraint should govern the quarter. Right now, signal trust still limits clean scale.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Strategic focus allocation</div>
                  <div className="mt-2 grid gap-2">
                    <div className="flex items-center justify-between"><span>PPC high-intent scale</span><span>40%</span></div>
                    <div className="flex items-center justify-between"><span>SEO cluster expansion</span><span>25%</span></div>
                    <div className="flex items-center justify-between"><span>Conversion optimization</span><span>20%</span></div>
                    <div className="flex items-center justify-between"><span>Retargeting</span><span>10%</span></div>
                    <div className="flex items-center justify-between"><span>Authority content</span><span>5%</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Calendar className="h-5 w-5 text-emerald-300" /> Major projects</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {quarterlyProjects.map((project) => (
                  <div key={project.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-white">{project.name}</div>
                      <div className="flex items-center gap-2">
                        <Badge className={`border ${confidenceClasses(project.confidence)}`}>{project.confidence}</Badge>
                        <Badge className={`border ${stageClasses(project.stage)}`}>{project.stage}</Badge>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">{project.objective}</div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Owner</div><div className="mt-1 text-slate-200">{project.owner}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Timeline</div><div className="mt-1 text-slate-200">{project.timeline}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Measurement</div><div className="mt-1 text-slate-200">{project.measurement}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Score</div><div className={`mt-1 font-semibold ${scoreClasses(project.score)}`}>{project.score}</div></div>
                    </div>
                    <div className="mt-2 text-sm text-slate-400">Dependency: {project.dependency}</div>
                    <div className="mt-1 text-sm text-slate-500">Risk: {project.risk}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "initiatives" && (
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><GitBranch className="h-5 w-5 text-amber-300" /> Initiative lifecycle board</CardTitle>
                <div className="text-sm text-slate-400">Proposal → Controlled Launch → Scale / Refine / Hold / Kill</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredInitiatives.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3 xl:flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`border ${confidenceClasses(item.confidence)}`}>{item.confidence}</Badge>
                        <Badge className={`border ${stageClasses(item.stage)}`}>{item.stage}</Badge>
                        <Badge className={`border ${priorityClasses(item.priority)}`}>{item.priority}</Badge>
                      </div>
                      <div>
                        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Initiative</div>
                        <div className="mt-1 font-semibold text-white">{item.title}</div>
                      </div>
                      <div>
                        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Hypothesis</div>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{item.hypothesis}</p>
                      </div>
                    </div>
                    <div className="grid min-w-[300px] gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                      <div className="flex items-center justify-between"><span className="text-slate-400">Priority score</span><span className={`font-semibold ${scoreClasses(item.priorityScore)}`}>{item.priorityScore}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Cost estimate</span><span>{item.costEstimate}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Owner</span><span>{item.owner}</span></div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Stop-loss</div>
                        <div className="mt-2 text-slate-200">{item.stopLoss}</div>
                      </div>
                      <Button variant="ghost" className="justify-between rounded-xl border border-white/10 bg-white/5 hover:bg-white/10" onClick={() => setOpenInitiativeId(item.id)}>
                        Why this surfaced <ChevronRight className="h-4 w-4" />
                      </Button>
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
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Lock className="h-5 w-5 text-amber-300" /> Execution trust</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
                  <div className="font-semibold text-rose-200">Critical operating risks</div>
                  <ul className="mt-2 space-y-2">
                    <li>• More than 3 priorities creates dilution</li>
                    <li>• Weak attribution can distort budget reallocations</li>
                    <li>• Capacity bottlenecks can make good strategy fail in execution</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Decision rule</div>
                  <p className="mt-2 leading-6">Every initiative should have an owner, KPI, timeline, dependency, and stop-loss rule before real budget or team focus is committed.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Role-aware rendering</div>
                  <p className="mt-2 leading-6">{activeRole.label} sees {role === "jeffrey" ? "confirmed-only operating views" : "full confidence range with directional planning inputs"}.</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-sky-300" /> Execution framework</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Weekly: review performance, classify bottleneck, shift budget when justified, and lock only three major priorities.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Monthly: score channels, review competitive movement, decide scale / refine / hold / kill, and set a 30-day roadmap.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Quarterly: define numeric targets, choose one primary constraint, allocate strategic focus, and cap major projects at five.</div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-emerald-300" /> Monthly channel comparison</CardTitle></CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelScores.map((item) => ({ name: item.channel, total: item.total, revenue: item.revenueImpact }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                  <YAxis stroke="rgba(255,255,255,0.45)" />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                  <Bar dataKey="total" fill="currentColor" className="text-sky-300" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="revenue" fill="currentColor" className="text-emerald-300" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Sheet open={!!selectedInitiative} onOpenChange={(open) => !open && setOpenInitiativeId(null)}>
          <SheetContent side="right" className="w-full border-white/10 bg-slate-950 text-slate-100 sm:max-w-xl">
            {selectedInitiative && (
              <>
                <SheetHeader>
                  <SheetTitle className="text-left text-xl text-white">Why this surfaced</SheetTitle>
                  <SheetDescription className="text-left text-slate-400">Initiative logic, risks, stop-loss rule, and expected impact inspection drawer.</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`border ${confidenceClasses(selectedInitiative.confidence)}`}>{selectedInitiative.confidence}</Badge>
                    <Badge className={`border ${stageClasses(selectedInitiative.stage)}`}>{selectedInitiative.stage}</Badge>
                    <Badge className={`border ${priorityClasses(selectedInitiative.priority)}`}>{selectedInitiative.priority}</Badge>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{selectedInitiative.title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{selectedInitiative.hypothesis}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Why this surfaced</div>
                    <ul className="mt-2 space-y-2 text-sm text-slate-200">
                      {selectedInitiative.whySurfaced.map((reason) => <li key={reason}>• {reason}</li>)}
                    </ul>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Owner</div>
                      <div className="mt-2 text-slate-200">{selectedInitiative.owner}</div>
                      <div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Priority score</div>
                      <div className={`mt-2 text-2xl font-bold ${scoreClasses(selectedInitiative.priorityScore)}`}>{selectedInitiative.priorityScore}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Cost estimate</div>
                      <div className="mt-2 text-slate-200">{selectedInitiative.costEstimate}</div>
                      <div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Blocker</div>
                      <div className="mt-2 text-slate-200">{selectedInitiative.blocker}</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Expected impact range</div>
                    <div className="mt-3 grid gap-2">
                      <div className="flex items-center justify-between"><span className="text-slate-400">Conservative</span><span className="text-slate-200">{selectedInitiative.expectedImpact.conservative}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Expected</span><span className="text-emerald-300">{selectedInitiative.expectedImpact.expected}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Aggressive</span><span className="text-slate-200">{selectedInitiative.expectedImpact.aggressive}</span></div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Dependency</div>
                    <p className="mt-2 text-slate-200">{selectedInitiative.dependency}</p>
                    <div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Stop-loss</div>
                    <p className="mt-2 text-slate-200">{selectedInitiative.stopLoss}</p>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
