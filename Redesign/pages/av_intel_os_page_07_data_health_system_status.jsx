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
  Activity,
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Database,
  Filter,
  GitBranch,
  Globe,
  Lock,
  Mail,
  Network,
  RefreshCcw,
  Search,
  Server,
  ShieldAlert,
  Sparkles,
  Target,
  Wrench,
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
    { name: "Weekly Integrity Control", description: "Top blockers, page impact, and what is unsafe to use.", mode: "weekly_integrity" },
    { name: "Crawler War Room", description: "AI crawler blocks, tickets, and ownership status.", mode: "crawler_war_room" },
    { name: "GA4 Contamination", description: "Measurement-safe vs unsafe GA4 surfaces.", mode: "ga4_contamination" },
  ],
  clay: [
    { name: "Executive System Health", description: "Freshness SLA breaches, issue ownership, and decision safety.", mode: "executive_system_health" },
    { name: "Revenue Risk", description: "Email, GA4, and connector failures affecting revenue operations.", mode: "revenue_risk" },
    { name: "Issue Ownership", description: "Owners, blockers, dependencies, and remediation velocity.", mode: "issue_ownership" },
  ],
  jeffrey: [
    { name: "Board-Safe Systems View", description: "Confirmed-only system risk and page safety summary.", mode: "board_safe_systems" },
    { name: "Decision Safety", description: "What is safe to use now and what is blocked.", mode: "decision_safety" },
    { name: "Critical Incidents", description: "Highest business-risk issues only.", mode: "critical_incidents" },
  ],
} as const;

const roles = {
  casey: { label: "Casey Jones", title: "Head of Marketing", hideProbable: false },
  clay: { label: "Clay Martin", title: "COO", hideProbable: false },
  jeffrey: { label: "Jeffrey Carrithers", title: "CEO", hideProbable: true },
} as const;

type RoleKey = keyof typeof roles;
type Confidence = "CONFIRMED" | "PROBABLE" | "POSSIBLE";
type ViewTab = "overview" | "connectors" | "ga4" | "crawlers" | "email" | "freshness" | "ownership" | "impact";
type ComparePeriod = "WoW" | "MoM" | "90D";
type StatusTone = "Healthy" | "Warning" | "Broken";
type DecisionState = "Decision-safe" | "Diagnostic-only" | "Blocked";
type IssueType = "Connector" | "GA4" | "Crawler" | "Email" | "Schema" | "Environment";
type SavedViewMode =
  | "weekly_integrity"
  | "crawler_war_room"
  | "ga4_contamination"
  | "executive_system_health"
  | "revenue_risk"
  | "issue_ownership"
  | "board_safe_systems"
  | "decision_safety"
  | "critical_incidents";

type KPI = {
  id: string;
  label: string;
  value: string;
  delta: string;
  confidence: Confidence;
  detail: string;
  tone: "good" | "warn" | "bad";
};

type ConnectorRow = {
  connector: string;
  category: string;
  expectedCadence: string;
  lastSync: string;
  syncAge: string;
  sla: string;
  status: StatusTone;
  decisionState: DecisionState;
  issue: string;
  owner: string;
  pagesAffected: string[];
  confidence: Confidence;
};

type Incident = {
  id: string;
  title: string;
  type: IssueType;
  businessImpact: string;
  rootCause: string;
  owner: string;
  backupOwner: string;
  dependency: string;
  blocker: string;
  opened: string;
  status: StatusTone;
  decisionState: DecisionState;
  priorityScore: number;
  confidence: Confidence;
  pinned?: boolean;
  whySurfaced: string[];
};

type ImpactRow = {
  page: string;
  affectedWidgets: string;
  sourceIssue: string;
  renderState: string;
  decisionState: DecisionState;
  nextMove: string;
  confidence: Confidence;
};

type FreshnessRow = {
  source: string;
  cadence: string;
  actualAge: string;
  breach: string;
  trend: string;
  status: StatusTone;
  confidence: Confidence;
};

type CrawlerRow = {
  crawler: string;
  status: StatusTone;
  robotsState: string;
  ticket: string;
  owner: string;
  opened: string;
  businessRisk: string;
  nextStep: string;
  confidence: Confidence;
};

type EmailRow = {
  domain: string;
  spf: string;
  dkim: string;
  dmarc: string;
  deliverability: string;
  inboxRisk: string;
  sequencesAffected: string;
  revenueRisk: string;
  status: StatusTone;
  confidence: Confidence;
};

type EnvironmentRow = {
  env: string;
  status: StatusTone;
  lastDeploy: string;
  configParity: string;
  keyHealth: string;
  note: string;
  confidence: Confidence;
};

const kpis: KPI[] = [
  {
    id: "D001",
    label: "Decision-Safe Sources",
    value: "8 / 15",
    delta: "2 blocked",
    confidence: "CONFIRMED",
    detail: "Several sources are online but still not safe for decisioning due to contamination, sync lag, or schema drift.",
    tone: "warn",
  },
  {
    id: "D002",
    label: "Critical Incidents",
    value: "4",
    delta: "+1 vs last review",
    confidence: "CONFIRMED",
    detail: "The most serious incidents currently affect GA4 integrity, AI crawler access, and paid/email reporting trust.",
    tone: "bad",
  },
  {
    id: "D003",
    label: "Freshness SLA Compliance",
    value: "71%",
    delta: "-6 pts WoW",
    confidence: "PROBABLE",
    detail: "Data freshness remains acceptable in some systems but not strong enough for blanket trust across all pages.",
    tone: "warn",
  },
  {
    id: "D004",
    label: "Pages Fully Safe",
    value: "3 / 7",
    delta: "2 degraded",
    confidence: "CONFIRMED",
    detail: "Only a subset of AvIntelOS pages are currently fully safe for executive-level decisioning without qualification.",
    tone: "bad",
  },
  {
    id: "D005",
    label: "Remediation Ownership Coverage",
    value: "92%",
    delta: "+9 pts MoM",
    confidence: "PROBABLE",
    detail: "Most major issues now have owners, but backup ownership and dependency clarity still need strengthening.",
    tone: "good",
  },
  {
    id: "D006",
    label: "Board-Safe Rendering",
    value: "Partial",
    delta: "Jeffrey-safe only on confirmed surfaces",
    confidence: "CONFIRMED",
    detail: "Several areas still require confidence downgrades or suppression in executive-safe views.",
    tone: "warn",
  },
];

const connectorRows: ConnectorRow[] = [
  {
    connector: "GA4 Core Export",
    category: "Measurement",
    expectedCadence: "6 hours",
    lastSync: "Today · 8:10 AM",
    syncAge: "7h 14m",
    sla: "Breached",
    status: "Warning",
    decisionState: "Diagnostic-only",
    issue: "GA4 is online, but engagement views remain contaminated and freshness is beyond desired SLA.",
    owner: "Analytics",
    pagesAffected: ["Page 02", "Page 05", "Page 06"],
    confidence: "CONFIRMED",
  },
  {
    connector: "Google Ads via Windsor",
    category: "Paid Media",
    expectedCadence: "6 hours",
    lastSync: "Today · 4:25 AM",
    syncAge: "10h 59m",
    sla: "Breached",
    status: "Warning",
    decisionState: "Diagnostic-only",
    issue: "Paid data is available but stale enough to downgrade intraday budget decisions.",
    owner: "Analytics + Paid",
    pagesAffected: ["Page 05", "Page 04"],
    confidence: "PROBABLE",
  },
  {
    connector: "CRM Opportunity Feedback",
    category: "Revenue",
    expectedCadence: "24 hours",
    lastSync: "Yesterday · 9:40 PM",
    syncAge: "17h 44m",
    sla: "Within target",
    status: "Healthy",
    decisionState: "Decision-safe",
    issue: "Feedback coverage is not perfect, but the feed is usable for directional revenue and retention monitoring.",
    owner: "Revenue Ops",
    pagesAffected: ["Page 04", "Page 05", "Page 06"],
    confidence: "PROBABLE",
  },
  {
    connector: "Search Console",
    category: "Organic",
    expectedCadence: "24 hours",
    lastSync: "Today · 2:10 AM",
    syncAge: "13h 29m",
    sla: "Within target",
    status: "Healthy",
    decisionState: "Decision-safe",
    issue: "Healthy and usable for ranking/CTR work, though not real-time.",
    owner: "SEO",
    pagesAffected: ["Page 03", "Page 5A"],
    confidence: "CONFIRMED",
  },
  {
    connector: "SpyFu / Competitive Feed",
    category: "Competitive",
    expectedCadence: "72 hours",
    lastSync: "4 days ago",
    syncAge: "98h",
    sla: "Breached",
    status: "Warning",
    decisionState: "Diagnostic-only",
    issue: "Competitive overlap views are stale and should not drive aggressive budget shifts right now.",
    owner: "Marketing Ops",
    pagesAffected: ["Page 03", "Page 05"],
    confidence: "PROBABLE",
  },
  {
    connector: "Email Platform Health Feed",
    category: "Lifecycle",
    expectedCadence: "12 hours",
    lastSync: "Today · 11:20 AM",
    syncAge: "4h 19m",
    sla: "Within target",
    status: "Healthy",
    decisionState: "Decision-safe",
    issue: "Fresh enough to monitor lifecycle delivery and sequence impact.",
    owner: "Lifecycle",
    pagesAffected: ["Page 06", "Page 05B"],
    confidence: "CONFIRMED",
  },
];

const incidents: Incident[] = [
  {
    id: "inc-001",
    title: "GA4 engagement contamination remains unresolved",
    type: "GA4",
    businessImpact: "Unsafe engagement metrics distort decisioning across measurement, paid, and content surfaces.",
    rootCause: "Email_Open_ events continue inflating engagement-based reporting and derivative dashboards.",
    owner: "Analytics",
    backupOwner: "DevOps",
    dependency: "Event filtering governance",
    blocker: "Legacy reporting still references native engagement values",
    opened: "2023-06-14",
    status: "Broken",
    decisionState: "Blocked",
    priorityScore: 98,
    confidence: "CONFIRMED",
    pinned: true,
    whySurfaced: [
      "Core measurement distortion still active",
      "Multiple pages inherit degraded trust from this issue",
      "Executive-safe rendering requires suppression or downgrade",
    ],
  },
  {
    id: "inc-002",
    title: "All major AI crawlers currently blocked",
    type: "Crawler",
    businessImpact: "GlobalAir is losing discoverability and future authority capture in AI answer surfaces.",
    rootCause: "Crawler access remains blocked pending robots/access ticket resolution.",
    owner: "SEO + DevOps",
    backupOwner: "Marketing Ops",
    dependency: "Robots and access policy update",
    blocker: "Ticket still open and not yet fully validated post-fix",
    opened: "2026-03-18",
    status: "Broken",
    decisionState: "Blocked",
    priorityScore: 95,
    confidence: "CONFIRMED",
    pinned: true,
    whySurfaced: [
      "All six tracked AI crawlers still blocked",
      "Authority distribution risk is increasing",
      "This is a strategic visibility problem, not just a technical one",
    ],
  },
  {
    id: "inc-003",
    title: "Google Ads freshness lag through Windsor",
    type: "Connector",
    businessImpact: "Intraday budget shifts and spend-control decisions may be made on stale data.",
    rootCause: "Connector lag exceeds operating SLA on the paid pipeline.",
    owner: "Analytics + Paid",
    backupOwner: "Windsor Admin",
    dependency: "Connector revalidation",
    blocker: "Root source of lag not yet isolated",
    opened: "2026-03-27",
    status: "Warning",
    decisionState: "Diagnostic-only",
    priorityScore: 83,
    confidence: "PROBABLE",
    pinned: true,
    whySurfaced: [
      "Sync age exceeds 6-hour target",
      "PPC surfaces are impacted",
      "Budget governance reliability declines when freshness drifts",
    ],
  },
  {
    id: "inc-004",
    title: "Identity stitching remains partial across return sessions",
    type: "Schema",
    businessImpact: "Some content, email, and retargeting assist paths are under-credited or blurred.",
    rootCause: "User ID persistence and CRM pass-through coverage remain incomplete.",
    owner: "Analytics",
    backupOwner: "Lifecycle Ops",
    dependency: "Identity instrumentation",
    blocker: "Legacy form and session-state inconsistency",
    opened: "2026-03-12",
    status: "Warning",
    decisionState: "Diagnostic-only",
    priorityScore: 74,
    confidence: "PROBABLE",
    whySurfaced: [
      "Assist-path interpretation still carries ambiguity",
      "Page 06 attribution confidence remains partial",
      "Cross-device return behavior is not consistently stitched",
    ],
  },
];

const impactRows: ImpactRow[] = [
  {
    page: "Page 02 — GA4 Analytics Hub",
    affectedWidgets: "Engagement KPIs, channel comparisons, event confidence",
    sourceIssue: "GA4 contamination + validation gaps",
    renderState: "Show clean-only logic and downgrade contaminated views",
    decisionState: "Diagnostic-only",
    nextMove: "Suppress native engagement for Jeffrey-safe rendering and keep contamination alert persistent.",
    confidence: "CONFIRMED",
  },
  {
    page: "Page 05 — PPC Intelligence Command",
    affectedWidgets: "Intraday paid shifts, conversion confidence, some geo surfaces",
    sourceIssue: "Google Ads freshness lag + incomplete call validation",
    renderState: "Keep scale recommendations selective",
    decisionState: "Diagnostic-only",
    nextMove: "Do not broaden scale until freshness and call tracking are cleaner.",
    confidence: "PROBABLE",
  },
  {
    page: "Page 06 — Content & Channel Performance",
    affectedWidgets: "Content-to-QI attribution chain, assist rates, executive ROI framing",
    sourceIssue: "Identity stitching weakness + GA4 contamination inheritance",
    renderState: "Allow directional assist insights but mark them confidence-aware",
    decisionState: "Diagnostic-only",
    nextMove: "Preserve role-aware confidence labels and avoid hard ROI claims.",
    confidence: "PROBABLE",
  },
  {
    page: "Page 03 — Organic Intelligence",
    affectedWidgets: "Competitive comparison surfaces only",
    sourceIssue: "SpyFu / competitive feed staleness",
    renderState: "Organic opportunity logic remains safe; competitive data is downgraded",
    decisionState: "Decision-safe",
    nextMove: "Use GSC and page-level organic signals as primary source until comp feed refreshes.",
    confidence: "CONFIRMED",
  },
  {
    page: "Page 07 — Data Health & System Status",
    affectedWidgets: "Source trust registry, SLA board, issue map",
    sourceIssue: "Live by design",
    renderState: "This page is the source-of-truth for trust labels",
    decisionState: "Decision-safe",
    nextMove: "Keep issue ownership and page impact mapping current.",
    confidence: "CONFIRMED",
  },
];

const freshnessRows: FreshnessRow[] = [
  { source: "GA4", cadence: "6h", actualAge: "7h 14m", breach: "Minor", trend: "Worsening", status: "Warning", confidence: "CONFIRMED" },
  { source: "Google Ads", cadence: "6h", actualAge: "10h 59m", breach: "Major", trend: "Worsening", status: "Warning", confidence: "PROBABLE" },
  { source: "CRM", cadence: "24h", actualAge: "17h 44m", breach: "None", trend: "Stable", status: "Healthy", confidence: "PROBABLE" },
  { source: "Search Console", cadence: "24h", actualAge: "13h 29m", breach: "None", trend: "Stable", status: "Healthy", confidence: "CONFIRMED" },
  { source: "SpyFu", cadence: "72h", actualAge: "98h", breach: "Major", trend: "Worsening", status: "Warning", confidence: "PROBABLE" },
  { source: "Email Health", cadence: "12h", actualAge: "4h 19m", breach: "None", trend: "Stable", status: "Healthy", confidence: "CONFIRMED" },
];

const crawlerRows: CrawlerRow[] = [
  {
    crawler: "OpenAI GPTBot",
    status: "Broken",
    robotsState: "Blocked",
    ticket: "CR-4471",
    owner: "SEO + DevOps",
    opened: "2026-03-18",
    businessRisk: "High",
    nextStep: "Validate robots update in production and confirm crawl access.",
    confidence: "CONFIRMED",
  },
  {
    crawler: "PerplexityBot",
    status: "Broken",
    robotsState: "Blocked",
    ticket: "CR-4471",
    owner: "SEO + DevOps",
    opened: "2026-03-18",
    businessRisk: "High",
    nextStep: "Resolve block and re-test live access.",
    confidence: "CONFIRMED",
  },
  {
    crawler: "ClaudeBot",
    status: "Broken",
    robotsState: "Blocked",
    ticket: "CR-4471",
    owner: "SEO + DevOps",
    opened: "2026-03-18",
    businessRisk: "Medium-High",
    nextStep: "Verify policy and robots allowlist after ticket close.",
    confidence: "CONFIRMED",
  },
  {
    crawler: "Google-Extended",
    status: "Broken",
    robotsState: "Blocked",
    ticket: "CR-4471",
    owner: "SEO + DevOps",
    opened: "2026-03-18",
    businessRisk: "High",
    nextStep: "Unblock and verify response headers and robots settings.",
    confidence: "CONFIRMED",
  },
  {
    crawler: "CCBot",
    status: "Broken",
    robotsState: "Blocked",
    ticket: "CR-4471",
    owner: "SEO + DevOps",
    opened: "2026-03-18",
    businessRisk: "Medium",
    nextStep: "Confirm crawl permissions after deployment.",
    confidence: "CONFIRMED",
  },
  {
    crawler: "YouBot",
    status: "Broken",
    robotsState: "Blocked",
    ticket: "CR-4471",
    owner: "SEO + DevOps",
    opened: "2026-03-18",
    businessRisk: "Medium",
    nextStep: "Revalidate after production policy change.",
    confidence: "CONFIRMED",
  },
];

const emailRows: EmailRow[] = [
  {
    domain: "mail.globalair.com",
    spf: "Pass",
    dkim: "Pass",
    dmarc: "Quarantine",
    deliverability: "Good",
    inboxRisk: "Moderate",
    sequencesAffected: "Lead nurture + broker reactivation",
    revenueRisk: "Medium",
    status: "Warning",
    confidence: "CONFIRMED",
  },
  {
    domain: "news.globalair.com",
    spf: "Pass",
    dkim: "Pass",
    dmarc: "None",
    deliverability: "Mixed",
    inboxRisk: "High",
    sequencesAffected: "Newsletter and authority content distribution",
    revenueRisk: "Medium-High",
    status: "Warning",
    confidence: "PROBABLE",
  },
];

const environmentRows: EnvironmentRow[] = [
  {
    env: "Development",
    status: "Healthy",
    lastDeploy: "Today · 9:15 AM",
    configParity: "Partial",
    keyHealth: "Good",
    note: "Useful for testing, but not a reliable mirror of live data behavior.",
    confidence: "PROBABLE",
  },
  {
    env: "Staging",
    status: "Warning",
    lastDeploy: "Yesterday · 4:40 PM",
    configParity: "Partial",
    keyHealth: "Mixed",
    note: "Some connector keys differ from production. Validation is not fully trustworthy.",
    confidence: "CONFIRMED",
  },
  {
    env: "Production",
    status: "Warning",
    lastDeploy: "Yesterday · 8:55 PM",
    configParity: "Source of truth",
    keyHealth: "Mixed",
    note: "Live environment is functioning but several integrations remain degraded or blocked.",
    confidence: "CONFIRMED",
  },
];

const incidentTrendData = {
  WoW: [
    { name: "Mon", value: 3 },
    { name: "Tue", value: 3 },
    { name: "Wed", value: 4 },
    { name: "Thu", value: 4 },
    { name: "Fri", value: 4 },
    { name: "Sat", value: 4 },
    { name: "Sun", value: 4 },
  ],
  MoM: [
    { name: "W1", value: 5 },
    { name: "W2", value: 4 },
    { name: "W3", value: 4 },
    { name: "W4", value: 4 },
  ],
  "90D": [
    { name: "Jan", value: 6 },
    { name: "Feb", value: 5 },
    { name: "Mar", value: 4 },
    { name: "Apr", value: 4 },
  ],
} as const;

const incidentChartData = incidents.map((item) => ({
  name: item.type,
  score: item.priorityScore,
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

function toneClasses(tone: KPI["tone"]) {
  if (tone === "good") return "from-emerald-500/15 to-transparent border-emerald-500/20";
  if (tone === "bad") return "from-rose-500/15 to-transparent border-rose-500/20";
  return "from-amber-500/15 to-transparent border-amber-500/20";
}

function statusClasses(status: StatusTone) {
  if (status === "Healthy") return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  if (status === "Warning") return "border-amber-400/30 bg-amber-500/15 text-amber-200";
  return "border-rose-400/30 bg-rose-500/15 text-rose-200";
}

function decisionClasses(state: DecisionState) {
  if (state === "Decision-safe") return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  if (state === "Diagnostic-only") return "border-slate-400/30 bg-slate-500/15 text-slate-200";
  return "border-rose-400/30 bg-rose-500/15 text-rose-200";
}

function scoreClasses(score: number) {
  if (score >= 90) return "text-rose-300";
  if (score >= 75) return "text-amber-300";
  return "text-emerald-300";
}

export default function AvIntelOSPage07() {
  const [role, setRole] = useState<RoleKey>("casey");
  const [dateRange, setDateRange] = useState("30d");
  const [comparePeriod, setComparePeriod] = useState<ComparePeriod>("WoW");
  const [activeTab, setActiveTab] = useState<ViewTab>("overview");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [selectedSavedView, setSelectedSavedView] = useState(savedViewsByRole.casey[0].name);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [showDecisionSafeOnly, setShowDecisionSafeOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [openIncidentId, setOpenIncidentId] = useState<string | null>(null);

  const activeRole = roles[role];
  const savedViews = savedViewsByRole[role];

  const filteredKPIs = useMemo(() => kpis.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);

  const filteredConnectors = useMemo(() => connectorRows.filter((row) => {
    if (!matchesConfidence(row.confidence, activeRole.hideProbable, confidenceFilter)) return false;
    if (showDecisionSafeOnly && row.decisionState !== "Decision-safe") return false;
    if (search && !`${row.connector} ${row.issue} ${row.owner}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [activeRole.hideProbable, confidenceFilter, showDecisionSafeOnly, search]);

  const filteredIncidents = useMemo(() => incidents.filter((item) => {
    if (!matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)) return false;
    if (showCriticalOnly && item.priorityScore < 85) return false;
    if (showDecisionSafeOnly && item.decisionState !== "Decision-safe") return false;
    if (search && !`${item.title} ${item.businessImpact} ${item.owner} ${item.type}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.priorityScore - a.priorityScore), [activeRole.hideProbable, confidenceFilter, showCriticalOnly, showDecisionSafeOnly, search]);

  const filteredImpact = useMemo(() => impactRows.filter((row) => {
    if (!matchesConfidence(row.confidence, activeRole.hideProbable, confidenceFilter)) return false;
    if (showDecisionSafeOnly && row.decisionState !== "Decision-safe") return false;
    return true;
  }), [activeRole.hideProbable, confidenceFilter, showDecisionSafeOnly]);

  const filteredFreshness = useMemo(() => freshnessRows.filter((row) => matchesConfidence(row.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredCrawlers = useMemo(() => crawlerRows.filter((row) => matchesConfidence(row.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredEmail = useMemo(() => emailRows.filter((row) => matchesConfidence(row.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredEnvironments = useMemo(() => environmentRows.filter((row) => matchesConfidence(row.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);

  const incidentsById = useMemo(() => new Map(incidents.map((item) => [item.id, item])), []);
  const selectedIncident = openIncidentId ? incidentsById.get(openIncidentId) ?? null : null;
  const pinned = filteredIncidents.filter((item) => item.pinned);

  function applySavedView(viewName: string) {
    setSelectedSavedView(viewName);
    const selectedView = savedViews.find((item) => item.name === viewName);
    const mode = selectedView?.mode as SavedViewMode | undefined;

    switch (mode) {
      case "crawler_war_room":
        setActiveTab("crawlers");
        setConfidenceFilter("confirmed");
        setShowCriticalOnly(true);
        setShowDecisionSafeOnly(false);
        return;
      case "ga4_contamination":
        setActiveTab("ga4");
        setConfidenceFilter(role === "jeffrey" ? "confirmed" : "probable");
        setShowCriticalOnly(false);
        setShowDecisionSafeOnly(false);
        return;
      case "executive_system_health":
        setActiveTab("overview");
        setConfidenceFilter(role === "jeffrey" ? "confirmed" : "probable");
        setShowCriticalOnly(true);
        setShowDecisionSafeOnly(false);
        return;
      case "revenue_risk":
        setActiveTab("email");
        setConfidenceFilter(role === "jeffrey" ? "confirmed" : "probable");
        setShowCriticalOnly(true);
        setShowDecisionSafeOnly(false);
        return;
      case "issue_ownership":
        setActiveTab("ownership");
        setConfidenceFilter(role === "jeffrey" ? "confirmed" : "all");
        setShowCriticalOnly(false);
        setShowDecisionSafeOnly(false);
        return;
      case "board_safe_systems":
      case "decision_safety":
        setActiveTab("impact");
        setConfidenceFilter("confirmed");
        setShowCriticalOnly(false);
        setShowDecisionSafeOnly(true);
        return;
      case "critical_incidents":
        setActiveTab("ownership");
        setConfidenceFilter("confirmed");
        setShowCriticalOnly(true);
        setShowDecisionSafeOnly(false);
        return;
      case "weekly_integrity":
      default:
        setActiveTab("overview");
        setConfidenceFilter(role === "jeffrey" ? "confirmed" : "all");
        setShowCriticalOnly(false);
        setShowDecisionSafeOnly(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
        <div className="mb-4 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Page structure</div>
              <div className="mt-1 text-sm text-slate-300">Data Health & System Status is the trust layer for AvIntelOS. It shows what is healthy, stale, broken, safe for decisioning, and how those issues propagate into page-level confidence and business risk.</div>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewTab)} className="w-full xl:w-auto">
              <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0 xl:w-auto">
                <TabsTrigger value="overview" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Overview</TabsTrigger>
                <TabsTrigger value="connectors" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Connector Status</TabsTrigger>
                <TabsTrigger value="ga4" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">GA4 Health</TabsTrigger>
                <TabsTrigger value="crawlers" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">AI Crawlers</TabsTrigger>
                <TabsTrigger value="email" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Email Infra</TabsTrigger>
                <TabsTrigger value="freshness" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Freshness & SLA</TabsTrigger>
                <TabsTrigger value="ownership" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Issue Ownership</TabsTrigger>
                <TabsTrigger value="impact" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Impact Map</TabsTrigger>
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
                    <Activity className="h-4 w-4" />
                    Av/IntelOS · Page 07
                  </div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">Data Health & System Status</h1>
                  <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">Connector trust, freshness SLA, GA4 contamination control, AI crawler access, email infrastructure health, issue ownership, and confidence propagation across the system.</p>
                </div>
                <div className="grid gap-3 text-sm md:grid-cols-2 xl:min-w-[520px]">
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="text-slate-400">Role</span>
                    <Select value={role} onValueChange={(v) => {
                      const nextRole = v as RoleKey;
                      setRole(nextRole);
                      const nextView = savedViewsByRole[nextRole][0].name;
                      setSelectedSavedView(nextView);
                      const nextMode = savedViewsByRole[nextRole][0].mode as SavedViewMode;
                      if (nextMode) {
                        setTimeout(() => applySavedView(nextView), 0);
                      }
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
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-bold"><Target className="h-5 w-5 text-sky-300" /> System Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Core rule</div>
                <div className="mt-2 font-semibold text-white">Online does not mean decision-safe.</div>
                <p className="mt-2 leading-6">This page separates source uptime from trustworthiness. A feed can be live, fresh enough to diagnose, and still unsafe for real budget or executive decisions.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Most important addition</div>
                <div className="mt-2 font-semibold text-white">Page-level impact and confidence propagation.</div>
                <p className="mt-2 leading-6">Every major issue now shows which AvIntelOS pages are degraded, which widgets are unsafe, and what should be suppressed in board-safe views.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><Filter className="h-5 w-5 text-sky-300" /> System filters</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search issues, connectors, owners" className="border-white/10 bg-slate-950/80 pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div><div className="text-sm font-medium text-white">Critical only</div><div className="text-xs text-slate-400">Score 85+</div></div>
                  <Switch checked={showCriticalOnly} onCheckedChange={setShowCriticalOnly} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div><div className="text-sm font-medium text-white">Decision-safe only</div><div className="text-xs text-slate-400">Suppress degraded</div></div>
                  <Switch checked={showDecisionSafeOnly} onCheckedChange={setShowDecisionSafeOnly} />
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
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div><div className="text-sm font-medium text-white">Page trust layer</div><div className="text-xs text-slate-400">Propagation active</div></div>
                  <Badge className="border border-emerald-400/30 bg-emerald-500/15 text-emerald-200">Enabled</Badge>
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
                  <div className="mt-1 text-slate-300">{item.title}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6 rounded-2xl border-amber-400/20 bg-amber-500/10 text-amber-50">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>System trust warning</AlertTitle>
          <AlertDescription>Use this page to decide what AvIntelOS can safely say right now. GA4 contamination, AI crawler blocks, and stale connector feeds should automatically downgrade downstream confidence and suppress overconfident recommendations.</AlertDescription>
        </Alert>

        {activeTab === "overview" && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              {filteredKPIs.map((kpi) => (
                <Card key={kpi.id} className={`overflow-hidden rounded-3xl border bg-gradient-to-br ${toneClasses(kpi.tone)} bg-slate-900 text-slate-100 shadow-xl`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{kpi.id}</div>
                        <div className="mt-1 text-sm text-slate-300">{kpi.label}</div>
                      </div>
                      <Badge className={`border ${confidenceClasses(kpi.confidence)}`}>{kpi.confidence}</Badge>
                    </div>
                    <div className="mt-4 text-3xl font-black tracking-tight">{kpi.value}</div>
                    <div className="mt-2 text-sm text-slate-300">{kpi.delta}</div>
                    <p className="mt-4 text-xs leading-5 text-slate-400">{kpi.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
                <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="h-5 w-5 text-amber-300" /> Highest business-risk incidents</CardTitle><Button variant="ghost" className="rounded-xl border border-white/10 bg-white/5" onClick={() => setActiveTab("ownership")}>Open ownership board <ChevronRight className="ml-2 h-4 w-4" /></Button></div></CardHeader>
                <CardContent className="space-y-3">
                  {filteredIncidents.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{item.type}</Badge>
                            <Badge className={`border ${statusClasses(item.status)}`}>{item.status}</Badge>
                            <Badge className={`border ${decisionClasses(item.decisionState)}`}>{item.decisionState}</Badge>
                            <Badge className={`border ${confidenceClasses(item.confidence)}`}>{item.confidence}</Badge>
                          </div>
                          <div className="mt-2 font-semibold text-white">{item.title}</div>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{item.businessImpact}</p>
                        </div>
                        <div className="grid min-w-[210px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                          <div className="flex items-center justify-between"><span className="text-slate-400">Score</span><span className={scoreClasses(item.priorityScore)}>{item.priorityScore}</span></div>
                          <div className="flex items-center justify-between"><span className="text-slate-400">Owner</span><span>{item.owner}</span></div>
                          <Button variant="ghost" className="justify-between rounded-xl border border-white/10 bg-white/5 hover:bg-white/10" onClick={() => setOpenIncidentId(item.id)}>Why this surfaced <ChevronRight className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
                <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Activity className="h-5 w-5 text-sky-300" /> Incident trend</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={incidentTrendData[comparePeriod]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                        <YAxis stroke="rgba(255,255,255,0.45)" />
                        <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                        <Line type="monotone" dataKey="value" stroke="currentColor" className="text-sky-300" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Current compare view: <span className="font-semibold text-white">{comparePeriod}</span>. The goal is not zero incidents; it is fast identification, real ownership, and honest page-level trust labels.</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "connectors" && (
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Network className="h-5 w-5 text-sky-300" /> Connector status registry</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {filteredConnectors.map((row) => (
                <div key={row.connector} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="xl:flex-1">
                      <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.connector}</div><Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.category}</Badge><Badge className={`border ${statusClasses(row.status)}`}>{row.status}</Badge><Badge className={`border ${decisionClasses(row.decisionState)}`}>{row.decisionState}</Badge><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                      <div className="mt-2 text-sm text-slate-300">Issue: {row.issue}</div>
                      <div className="mt-1 text-sm text-slate-400">Pages affected: {row.pagesAffected.join(", ")}</div>
                    </div>
                    <div className="grid min-w-[280px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                      <div className="flex items-center justify-between"><span className="text-slate-400">Cadence</span><span>{row.expectedCadence}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Last sync</span><span>{row.lastSync}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Age</span><span>{row.syncAge}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">SLA</span><span>{row.sla}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Owner</span><span>{row.owner}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "ga4" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Database className="h-5 w-5 text-sky-300" /> GA4 contamination command center</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
                  <div className="font-semibold text-rose-200">Unsafe metrics</div>
                  <div className="mt-2">Native engagement rate, derived engagement dashboards, and any executive summary using contaminated event baselines.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Safe replacements</div>
                  <div className="mt-2">Clean session logic, filtered engagement estimates, validated Tier 1 event counts, and confidence-aware page diagnostics.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Affected surfaces</div>
                  <div className="mt-2">Page 02 measurement KPIs, Page 05 selective paid confidence, Page 06 content assist interpretations, and executive-safe rollups.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Current workaround</div>
                  <div className="mt-2">De-emphasize native engagement, preserve contamination alerting, and downgrade downstream render states from decision-safe to diagnostic-only where inherited risk exists.</div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Progress className="h-5 w-5 text-amber-300" /> Remediation progress</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-3"><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">GA4 remediation completion</div><div className="mt-2 text-3xl font-black text-white">58%</div></div><Badge className="border border-amber-400/30 bg-amber-500/15 text-amber-200">In progress</Badge></div>
                  <div className="mt-4"><Progress value={58} /></div>
                  <div className="mt-3 text-sm text-slate-300">Substantial mitigation exists, but board-safe trust is still not complete.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Remaining tasks: retire contaminated native widgets, complete call validation, lock filtered reporting defaults, and keep confidence downgrades in inherited pages until closed.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "crawlers" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Bot className="h-5 w-5 text-sky-300" /> AI crawler war room</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredCrawlers.map((row) => (
                  <div key={row.crawler} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="xl:flex-1">
                        <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.crawler}</div><Badge className={`border ${statusClasses(row.status)}`}>{row.status}</Badge><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                        <div className="mt-2 text-sm text-slate-300">Robots state: {row.robotsState}</div>
                        <div className="mt-1 text-sm text-slate-300">Business risk: {row.businessRisk}</div>
                        <div className="mt-1 text-sm text-slate-200">Next step: {row.nextStep}</div>
                      </div>
                      <div className="grid min-w-[240px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                        <div className="flex items-center justify-between"><span className="text-slate-400">Ticket</span><span>{row.ticket}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-400">Owner</span><span>{row.owner}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-400">Opened</span><span>{row.opened}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Globe className="h-5 w-5 text-amber-300" /> Crawler doctrine</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Crawler access is strategic distribution infrastructure, not an SEO side task.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">This section should persist until all major crawlers are verified unblocked in production, not just until a ticket is marked resolved.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Verification should include robots, headers, live fetch checks, and post-fix confirmation that crawl permission is actually restored.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "email" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Mail className="h-5 w-5 text-sky-300" /> Email infrastructure health</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredEmail.map((row) => (
                  <div key={row.domain} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="xl:flex-1">
                        <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.domain}</div><Badge className={`border ${statusClasses(row.status)}`}>{row.status}</Badge><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                        <div className="mt-2 text-sm text-slate-300">Deliverability: {row.deliverability} · Inbox risk: {row.inboxRisk}</div>
                        <div className="mt-1 text-sm text-slate-300">Sequences affected: {row.sequencesAffected}</div>
                        <div className="mt-1 text-sm text-slate-200">Revenue risk: {row.revenueRisk}</div>
                      </div>
                      <div className="grid min-w-[230px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                        <div className="flex items-center justify-between"><span className="text-slate-400">SPF</span><span>{row.spf}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-400">DKIM</span><span>{row.dkim}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-400">DMARC</span><span>{row.dmarc}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Server className="h-5 w-5 text-amber-300" /> Environment health</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredEnvironments.map((row) => (
                  <div key={row.env} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.env}</div><Badge className={`border ${statusClasses(row.status)}`}>{row.status}</Badge><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-2 text-sm text-slate-300">Last deploy: {row.lastDeploy}</div>
                    <div className="mt-1 text-sm text-slate-300">Config parity: {row.configParity} · Key health: {row.keyHealth}</div>
                    <div className="mt-1 text-sm text-slate-400">{row.note}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "freshness" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><CalendarClock className="h-5 w-5 text-sky-300" /> Freshness SLA board</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredFreshness.map((row) => (
                  <div key={row.source} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.source}</div><Badge className={`border ${statusClasses(row.status)}`}>{row.status}</Badge><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Cadence</div><div className="mt-1 text-slate-200">{row.cadence}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Actual age</div><div className="mt-1 text-slate-200">{row.actualAge}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Breach</div><div className="mt-1 text-slate-200">{row.breach}</div></div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">Trend: {row.trend}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-emerald-300" /> Incident severity mix</CardTitle></CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incidentChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                    <YAxis stroke="rgba(255,255,255,0.45)" />
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                    <Bar dataKey="score" fill="currentColor" className="text-amber-300" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "ownership" && (
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Wrench className="h-5 w-5 text-sky-300" /> Issue ownership board</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {filteredIncidents.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3 xl:flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{item.type}</Badge>
                        <Badge className={`border ${statusClasses(item.status)}`}>{item.status}</Badge>
                        <Badge className={`border ${decisionClasses(item.decisionState)}`}>{item.decisionState}</Badge>
                        <Badge className={`border ${confidenceClasses(item.confidence)}`}>{item.confidence}</Badge>
                      </div>
                      <div className="font-semibold text-white">{item.title}</div>
                      <div className="grid gap-3 md:grid-cols-2 text-sm">
                        <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Business impact</div><div className="mt-1 text-slate-200">{item.businessImpact}</div></div>
                        <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Root cause</div><div className="mt-1 text-slate-200">{item.rootCause}</div></div>
                      </div>
                    </div>
                    <div className="grid min-w-[300px] gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                      <div className="flex items-center justify-between"><span className="text-slate-400">Priority score</span><span className={`font-semibold ${scoreClasses(item.priorityScore)}`}>{item.priorityScore}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Owner</span><span>{item.owner}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Backup owner</span><span>{item.backupOwner}</span></div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Dependency</div><div className="mt-2 text-slate-200">{item.dependency}</div><div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">Blocker</div><div className="mt-2 text-slate-300">{item.blocker}</div></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Opened</span><span>{item.opened}</span></div>
                      <Button variant="ghost" className="justify-between rounded-xl border border-white/10 bg-white/5 hover:bg-white/10" onClick={() => setOpenIncidentId(item.id)}>Why this surfaced <ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "impact" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><GitBranch className="h-5 w-5 text-sky-300" /> Page impact map</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredImpact.map((row) => (
                  <div key={row.page} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="xl:flex-1">
                        <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.page}</div><Badge className={`border ${decisionClasses(row.decisionState)}`}>{row.decisionState}</Badge><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                        <div className="mt-2 text-sm text-slate-300">Affected widgets: {row.affectedWidgets}</div>
                        <div className="mt-1 text-sm text-slate-300">Source issue: {row.sourceIssue}</div>
                        <div className="mt-1 text-sm text-slate-200">Next move: {row.nextMove}</div>
                      </div>
                      <div className="min-w-[240px] rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Render state</div>
                        <div className="mt-2 text-slate-200">{row.renderState}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Lock className="h-5 w-5 text-amber-300" /> Confidence propagation</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">When a source is degraded, downstream pages should not silently continue rendering with full confidence.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Jeffrey-safe views should suppress probable or contaminated outputs automatically. Casey and Clay can still inspect them, but only with visible trust labels.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">This page is the system control layer for deciding whether a page remains board-safe, diagnostic-only, or blocked from decisioning.</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-sky-300" /> System action framework</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Fast wins: restore crawler access, tighten GA4-safe defaults, and resolve the highest freshness SLA breaches affecting paid decisions.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Strategic moves: complete page-level confidence propagation, unify issue ownership, and keep board-safe rendering tied only to confirmed inputs.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Blockers: unresolved GA4 contamination, incomplete paid freshness reliability, crawler access still blocked, and partial identity stitching across assist paths.</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><RefreshCcw className="h-5 w-5 text-emerald-300" /> Source trust mix</CardTitle></CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredConnectors.map((row) => ({ name: row.connector.split(" ")[0], age: parseInt(row.syncAge), safe: row.decisionState === "Decision-safe" ? 100 : row.decisionState === "Diagnostic-only" ? 60 : 20 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                  <YAxis stroke="rgba(255,255,255,0.45)" />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                  <Bar dataKey="safe" fill="currentColor" className="text-sky-300" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Sheet open={!!selectedIncident} onOpenChange={(open) => !open && setOpenIncidentId(null)}>
          <SheetContent side="right" className="w-full border-white/10 bg-slate-950 text-slate-100 sm:max-w-xl">
            {selectedIncident && (
              <>
                <SheetHeader>
                  <SheetTitle className="text-left text-xl text-white">Why this surfaced</SheetTitle>
                  <SheetDescription className="text-left text-slate-400">Incident logic, trust state, ownership, and business impact inspection drawer.</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{selectedIncident.type}</Badge>
                    <Badge className={`border ${statusClasses(selectedIncident.status)}`}>{selectedIncident.status}</Badge>
                    <Badge className={`border ${decisionClasses(selectedIncident.decisionState)}`}>{selectedIncident.decisionState}</Badge>
                    <Badge className={`border ${confidenceClasses(selectedIncident.confidence)}`}>{selectedIncident.confidence}</Badge>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{selectedIncident.title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{selectedIncident.businessImpact}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Root cause</div><p className="mt-2 text-slate-200">{selectedIncident.rootCause}</p></div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Why this surfaced</div><ul className="mt-2 space-y-2 text-sm text-slate-200">{selectedIncident.whySurfaced.map((reason) => <li key={reason}>• {reason}</li>)}</ul></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Owner</div><div className="mt-2 text-slate-200">{selectedIncident.owner}</div><div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Backup owner</div><div className="mt-2 text-slate-200">{selectedIncident.backupOwner}</div></div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Opened</div><div className="mt-2 flex items-center gap-2 text-slate-200"><Clock3 className="h-4 w-4 text-sky-300" /> {selectedIncident.opened}</div><div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Priority score</div><div className={`mt-2 text-2xl font-bold ${scoreClasses(selectedIncident.priorityScore)}`}>{selectedIncident.priorityScore}</div></div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Dependency</div><p className="mt-2 text-slate-200">{selectedIncident.dependency}</p><div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Blocker</div><p className="mt-2 text-slate-200">{selectedIncident.blocker}</p></div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
