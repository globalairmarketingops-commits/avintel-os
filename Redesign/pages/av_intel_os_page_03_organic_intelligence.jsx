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
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Eye,
  Filter,
  Link2,
  Map,
  Pin,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  FileSearch,
  Layers3,
  BookOpen,
  Radar,
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
    { name: "Weekly Organic Priorities", description: "Pinned fixes, CTR leaks, and model-level attack zones." },
    { name: "CTR Leak Fixes", description: "High-impression low-CTR commercial pages and query leakage." },
    { name: "Controller Attack Zones", description: "Model clusters where GlobalAir can realistically gain share." },
  ],
  clay: [
    { name: "Executive Organic Efficiency", description: "Organic inquiry contribution, leakage, and blocker summary." },
    { name: "Commercial Page Gaps", description: "Page-level conversion and inventory alignment issues." },
    { name: "Broker / Inventory Opportunity", description: "Demand-rich models with supply or listing quality gaps." },
  ],
  jeffrey: [
    { name: "Confirmed Organic Growth View", description: "Confirmed-only organic trend, share, and risk view." },
    { name: "Board-Safe Organic Summary", description: "Plain-language commercial organic trajectory." },
    { name: "Organic Share vs Competitors", description: "Confirmed competitor pressure on key clusters." },
  ],
} as const;

const roles = {
  casey: { label: "Casey Jones", title: "Head of Marketing", hideProbable: false },
  clay: { label: "Clay Martin", title: "COO", hideProbable: false },
  jeffrey: { label: "Jeffrey Carrithers", title: "CEO", hideProbable: true },
} as const;

type RoleKey = keyof typeof roles;
type Confidence = "CONFIRMED" | "PROBABLE" | "POSSIBLE";
type ViewTab = "overview" | "queue" | "serp" | "models" | "competitive" | "content" | "trust";
type ComparePeriod = "WoW" | "MoM" | "90D";
type OpportunityType =
  | "CTR Leak"
  | "Ranking Opportunity"
  | "Make / Model Gap"
  | "Controller Gap"
  | "Content Assist Gap"
  | "Internal Linking Gap"
  | "Conversion Path Gap"
  | "Inventory Coverage Gap"
  | "Schema / SERP Feature"
  | "Authority Cluster";

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
  priority: "Now" | "Next" | "Later" | "Kill";
  priorityScore: number;
  timeToImpact: string;
  pinned?: boolean;
  doNotActYet?: boolean;
  safeStatus: "Safe to scale" | "Optimize carefully" | "Diagnostic only" | "Blocked by inventory" | "Blocked by competitiveness";
};

type CommercialPageRow = {
  page: string;
  pageType: string;
  make: string;
  model: string;
  impressions: string;
  clicks: string;
  ctr: string;
  position: string;
  sessions: string;
  inquiryRate: string;
  assistRate: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

type QueryClusterRow = {
  cluster: string;
  intent: string;
  impressions: string;
  clicks: string;
  ctr: string;
  avgPosition: string;
  inquiryAssist: string;
  coverage: string;
  nextMove: string;
  confidence: Confidence;
};

type CompetitorRow = {
  competitor: string;
  competitorType: "Marketplace" | "Authority" | "Utility / Discovery";
  cluster: string;
  globalAir: string;
  competitorScore: string;
  gap: string;
  winProbability: string;
  response: string;
  confidence: Confidence;
};

type ModelCoverageRow = {
  make: string;
  model: string;
  class: string;
  demand: string;
  inventory: string;
  pageStatus: string;
  opportunity: string;
  action: string;
  confidence: Confidence;
};

type ContentAssistRow = {
  page: string;
  type: string;
  sessions: string;
  assistRate: string;
  pathStrength: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

const opportunityTypes: OpportunityType[] = [
  "CTR Leak",
  "Ranking Opportunity",
  "Make / Model Gap",
  "Controller Gap",
  "Content Assist Gap",
  "Internal Linking Gap",
  "Conversion Path Gap",
  "Inventory Coverage Gap",
  "Schema / SERP Feature",
  "Authority Cluster",
];

const kpis: KPI[] = [
  {
    id: "O001",
    label: "Organic Qualified Inquiries",
    value: "186",
    delta: "+11.4% WoW",
    deltaDirection: "up",
    confidence: "CONFIRMED",
    source: "CRM + GA4 + call tracking",
    freshness: "34 min ago",
    detail: "Organic remains the strongest non-paid commercial demand driver across piston clusters.",
    statusTone: "good",
  },
  {
    id: "O002",
    label: "Organic-Assisted Inquiries",
    value: "73",
    delta: "+7.2% WoW",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "GA4 assisted path model",
    freshness: "58 min ago",
    detail: "Useful directionally, but assist-path confidence remains incomplete on some content journeys.",
    statusTone: "warn",
  },
  {
    id: "O003",
    label: "CTR on Priority Commercial Pages",
    value: "3.1%",
    delta: "-0.3 pts WoW",
    deltaDirection: "down",
    confidence: "CONFIRMED",
    source: "GSC commercial page cohort",
    freshness: "4 hrs ago",
    detail: "Commercial CTR remains the fastest-win organic leakage zone.",
    statusTone: "bad",
  },
  {
    id: "O004",
    label: "Share vs Competitors",
    value: "41%",
    delta: "+3 pts MoM",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "SERP overlap model",
    freshness: "6 hrs ago",
    detail: "GlobalAir is improving in model terms, but competitors still dominate generic and authority territory.",
    statusTone: "warn",
  },
  {
    id: "O005",
    label: "Demand / Inventory Mismatch",
    value: "7 models",
    delta: "+2 models",
    deltaDirection: "down",
    confidence: "PROBABLE",
    source: "Search demand + listing coverage blend",
    freshness: "2 hrs ago",
    detail: "Several high-demand piston models still lack enough inventory depth to fully monetize organic demand.",
    statusTone: "warn",
  },
];

const opportunities: Opportunity[] = [
  {
    id: "org-001",
    type: "CTR Leak",
    signal: "Cessna 172 commercial page ranks on page 1 but under-captures clicks",
    gap: "Visibility is earned, but click capture is materially below opportunity for one of the highest-intent piston pages.",
    likelyCause: "Weak price/spec hook, title lacks urgency, and competitor snippets are stronger.",
    whySurfaced: [
      "48.2K impressions with 1.7% CTR",
      "Position 4.1 but CTR 34% below expected for ranking band",
      "Controller and Trade-A-Plane snippets show stronger value cues",
    ],
    expectedLift: { conservative: "+4% CTR", expected: "+8% CTR", aggressive: "+12% CTR" },
    action: "Rewrite title/meta, add stronger pricing and ownership cues, and re-evaluate above-the-fold commercial trust signals.",
    owner: "SEO + Content",
    dependency: "GSC page-query export + page title deployment",
    blocker: "None",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 94,
    timeToImpact: "7–14 days",
    pinned: true,
    safeStatus: "Safe to scale",
  },
  {
    id: "org-002",
    type: "Make / Model Gap",
    signal: "Piper Archer demand exceeds page strength and listing depth",
    gap: "GlobalAir has demand in this cluster but page quality and inventory support are both too weak.",
    likelyCause: "Thin content depth, weak listing density, and weaker internal routing than competing marketplaces.",
    whySurfaced: [
      "18.8K impressions with 0.9% inquiry rate",
      "Demand-to-listing ratio above target threshold",
      "Model page is not functioning like a dominant commercial hub",
    ],
    expectedLift: { conservative: "+3 inquiries / 30d", expected: "+7 inquiries / 30d", aggressive: "+12 inquiries / 30d" },
    action: "Upgrade model page depth, improve listing visibility, and trigger broker recruitment for Archer inventory.",
    owner: "SEO + Broker Success",
    dependency: "Model page template and broker outreach packet",
    blocker: "Inventory depth remains thin",
    confidence: "PROBABLE",
    priority: "Now",
    priorityScore: 90,
    timeToImpact: "2–4 weeks",
    pinned: true,
    safeStatus: "Blocked by inventory",
  },
  {
    id: "org-003",
    type: "Controller Gap",
    signal: "Controller dominates broad generic marketplace terms while GlobalAir wins selectively on model clusters",
    gap: "Marketplace head-term coverage remains structurally weaker than competitor territory.",
    likelyCause: "Controller has broader SERP footprint, stronger generic page authority, and heavier historical coverage.",
    whySurfaced: [
      "Controller leads overlapping share on broad commercial queries",
      "GlobalAir closes gaps faster on model-level clusters than head terms",
      "Generic territory remains expensive to attack blindly",
    ],
    expectedLift: { conservative: "+2 pts share", expected: "+5 pts share", aggressive: "+8 pts share" },
    action: "Keep generic territory disciplined, attack model-level opportunities, and build ownership/deep commercial pages where realistic share capture exists.",
    owner: "SEO",
    dependency: "Cluster-level attack map",
    blocker: "Broad-term win probability still limited",
    confidence: "CONFIRMED",
    priority: "Next",
    priorityScore: 82,
    timeToImpact: "4–8 weeks",
    safeStatus: "Optimize carefully",
  },
  {
    id: "org-004",
    type: "Content Assist Gap",
    signal: "Operating-cost and comparison content attracts traffic but under-routes users into commercial paths",
    gap: "Authority traffic is entering the system, but too little of it is stepping into listing or inquiry journeys.",
    likelyCause: "Weak CTA modules, weak related-listing handoffs, and incomplete lifecycle capture logic.",
    whySurfaced: [
      "Operating cost article has strong sessions but 0.4% direct inquiry rate",
      "Content assist confidence remains partial",
      "Internal routing into model pages is inconsistent",
    ],
    expectedLift: { conservative: "+2 assisted inquiries", expected: "+6 assisted inquiries", aggressive: "+10 assisted inquiries" },
    action: "Add listing modules, comparison CTAs, model-page links, and email capture or remarketing hooks to top authority pages.",
    owner: "Content + Lifecycle",
    dependency: "Content template blocks",
    blocker: "Assist attribution still incomplete",
    confidence: "PROBABLE",
    priority: "Next",
    priorityScore: 79,
    timeToImpact: "2–5 weeks",
    safeStatus: "Optimize carefully",
  },
  {
    id: "org-005",
    type: "Inventory Coverage Gap",
    signal: "Several high-intent model clusters are constrained by listing depth rather than traffic",
    gap: "Organic demand exists, but monetization is capped by thin or stale inventory.",
    likelyCause: "Supply acquisition has not caught up with search demand in targeted piston segments.",
    whySurfaced: [
      "7 tracked models exceed demand-to-inventory threshold",
      "Repeat-session behavior suggests unmet commercial intent",
      "Some pages have healthy CTR but weak inquiry yield because listing coverage is too light",
    ],
    expectedLift: { conservative: "+4% inquiry yield", expected: "+9% inquiry yield", aggressive: "+15% inquiry yield" },
    action: "Push inventory recruitment on thin model clusters and pair demand proof with broker outreach narratives.",
    owner: "Broker Success + Sales",
    dependency: "Recruitment list by model cluster",
    blocker: "Broker acquisition workflow still manual",
    confidence: "PROBABLE",
    priority: "Now",
    priorityScore: 88,
    timeToImpact: "2–6 weeks",
    pinned: true,
    safeStatus: "Blocked by inventory",
  },
  {
    id: "org-006",
    type: "Authority Cluster",
    signal: "AOPA owns large portions of research-stage aviation trust territory",
    gap: "GlobalAir is underrepresented in ownership, education, and buyer-confidence query clusters.",
    likelyCause: "Authority content library is growing, but still not deep enough in certain educational themes.",
    whySurfaced: [
      "AOPA dominates multiple research-stage topics",
      "GlobalAir comparison and ownership-guide depth still inconsistent",
      "Research-stage users are not always entering GlobalAir early enough",
    ],
    expectedLift: { conservative: "+3% authority traffic", expected: "+7% authority traffic", aggressive: "+12% authority traffic" },
    action: "Build comparison, operating-cost, ownership, and buyer-checklist content clusters tied to commercial handoffs.",
    owner: "SEO + Content",
    dependency: "Topic map + content production capacity",
    blocker: "Attribution confidence for authority content remains partial",
    confidence: "POSSIBLE",
    priority: "Later",
    priorityScore: 63,
    timeToImpact: "6–10 weeks",
    doNotActYet: true,
    safeStatus: "Diagnostic only",
  },
];

const commercialPages: CommercialPageRow[] = [
  {
    page: "/aircraft-for-sale/cessna-172",
    pageType: "Model Page",
    make: "Cessna",
    model: "172",
    impressions: "48.2K",
    clicks: "820",
    ctr: "1.7%",
    position: "4.1",
    sessions: "8,420",
    inquiryRate: "1.4%",
    assistRate: "2.2%",
    issue: "Page 1 visibility but weak CTR and moderate inquiry leakage.",
    action: "Rewrite title/meta and strengthen pricing/spec trust cues.",
    confidence: "CONFIRMED",
  },
  {
    page: "/aircraft-for-sale/cirrus-sr22",
    pageType: "Model Page",
    make: "Cirrus",
    model: "SR22",
    impressions: "31.6K",
    clicks: "1,290",
    ctr: "4.1%",
    position: "3.3",
    sessions: "6,980",
    inquiryRate: "2.6%",
    assistRate: "3.4%",
    issue: "Winning template with expansion potential.",
    action: "Use page structure as template for adjacent high-intent models.",
    confidence: "CONFIRMED",
  },
  {
    page: "/aircraft-for-sale/piper-archer",
    pageType: "Model Page",
    make: "Piper",
    model: "Archer",
    impressions: "18.8K",
    clicks: "402",
    ctr: "2.1%",
    position: "5.2",
    sessions: "2,940",
    inquiryRate: "0.9%",
    assistRate: "1.7%",
    issue: "Demand exists but page and inventory depth underperform.",
    action: "Improve content depth and trigger broker inventory recruitment.",
    confidence: "PROBABLE",
  },
  {
    page: "/brokers/texas-aircraft-partners",
    pageType: "Broker Page",
    make: "Mixed",
    model: "Mixed",
    impressions: "9.6K",
    clicks: "310",
    ctr: "3.2%",
    position: "7.1",
    sessions: "1,180",
    inquiryRate: "0.8%",
    assistRate: "1.1%",
    issue: "Traffic arrives, but conversion path and listing quality are weak.",
    action: "Upgrade page quality and featured inventory modules.",
    confidence: "PROBABLE",
  },
];

const queryClusters: QueryClusterRow[] = [
  {
    cluster: "Cessna 172 for sale",
    intent: "Transactional",
    impressions: "52.4K",
    clicks: "1,020",
    ctr: "1.9%",
    avgPosition: "4.4",
    inquiryAssist: "2.3%",
    coverage: "Strong visibility / weak CTR",
    nextMove: "Title rewrite + page trust improvements",
    confidence: "CONFIRMED",
  },
  {
    cluster: "Cirrus SR22 for sale",
    intent: "Transactional",
    impressions: "34.1K",
    clicks: "1,440",
    ctr: "4.2%",
    avgPosition: "3.1",
    inquiryAssist: "3.6%",
    coverage: "Winning cluster",
    nextMove: "Template expansion",
    confidence: "CONFIRMED",
  },
  {
    cluster: "Piper Archer operating cost",
    intent: "Research",
    impressions: "14.7K",
    clicks: "520",
    ctr: "3.5%",
    avgPosition: "6.2",
    inquiryAssist: "0.9%",
    coverage: "Traffic without commercial handoff",
    nextMove: "Commercial CTA and related-listing modules",
    confidence: "PROBABLE",
  },
  {
    cluster: "Best piston aircraft for first-time buyers",
    intent: "Research / Comparison",
    impressions: "11.9K",
    clicks: "370",
    ctr: "3.1%",
    avgPosition: "8.0",
    inquiryAssist: "0.7%",
    coverage: "Authority opportunity",
    nextMove: "Comparison content + model page handoff",
    confidence: "POSSIBLE",
  },
];

const competitors: CompetitorRow[] = [
  {
    competitor: "Controller",
    competitorType: "Marketplace",
    cluster: "Model-level commercial terms",
    globalAir: "41%",
    competitorScore: "58%",
    gap: "17 pts",
    winProbability: "Medium",
    response: "Attack select piston model clusters",
    confidence: "CONFIRMED",
  },
  {
    competitor: "Trade-A-Plane",
    competitorType: "Marketplace",
    cluster: "For-sale discovery",
    globalAir: "46%",
    competitorScore: "49%",
    gap: "3 pts",
    winProbability: "High",
    response: "Improve commercial snippets and page depth",
    confidence: "PROBABLE",
  },
  {
    competitor: "AirNav",
    competitorType: "Utility / Discovery",
    cluster: "Airport and aviation discovery overlap",
    globalAir: "28%",
    competitorScore: "36%",
    gap: "8 pts",
    winProbability: "Medium",
    response: "Build supporting aviation utility/context pages only where commercial tie-in exists",
    confidence: "POSSIBLE",
  },
  {
    competitor: "AOPA",
    competitorType: "Authority",
    cluster: "Ownership and buyer education",
    globalAir: "22%",
    competitorScore: "61%",
    gap: "39 pts",
    winProbability: "Low / Medium",
    response: "Build authority content only where tied to commercial paths",
    confidence: "PROBABLE",
  },
];

const modelCoverage: ModelCoverageRow[] = [
  {
    make: "Cessna",
    model: "172",
    class: "Piston",
    demand: "High",
    inventory: "Moderate",
    pageStatus: "Live / under-CTR",
    opportunity: "CTR and snippet improvement",
    action: "Rewrite commercial metadata and strengthen page trust",
    confidence: "CONFIRMED",
  },
  {
    make: "Cirrus",
    model: "SR22",
    class: "Piston",
    demand: "High",
    inventory: "Strong",
    pageStatus: "Winning",
    opportunity: "Template scaling",
    action: "Clone winning structure into adjacent models",
    confidence: "CONFIRMED",
  },
  {
    make: "Piper",
    model: "Archer",
    class: "Piston",
    demand: "High",
    inventory: "Weak",
    pageStatus: "Live / thin",
    opportunity: "Demand without inventory depth",
    action: "Recruit inventory and upgrade page depth",
    confidence: "PROBABLE",
  },
  {
    make: "Beechcraft",
    model: "Bonanza G36",
    class: "Piston",
    demand: "Medium",
    inventory: "Weak",
    pageStatus: "Missing quality page",
    opportunity: "Build / upgrade",
    action: "Launch dedicated model landing page",
    confidence: "PROBABLE",
  },
];

const contentAssistRows: ContentAssistRow[] = [
  {
    page: "/article/cessna-172-operating-cost",
    type: "Operating Cost",
    sessions: "4,140",
    assistRate: "0.8%",
    pathStrength: "Weak",
    issue: "Authority traffic is not routing strongly enough into commercial pages.",
    action: "Add listing modules, email capture, and model page handoffs.",
    confidence: "PROBABLE",
  },
  {
    page: "/article/cirrus-sr22-vs-columbia-400",
    type: "Comparison",
    sessions: "2,660",
    assistRate: "1.9%",
    pathStrength: "Moderate",
    issue: "Strong comparison intent but internal routing can improve.",
    action: "Expand related commercial links and remarketing CTA blocks.",
    confidence: "PROBABLE",
  },
  {
    page: "/article/best-piston-aircraft-for-beginners",
    type: "Buyer Guide",
    sessions: "3,220",
    assistRate: "0.6%",
    pathStrength: "Weak",
    issue: "Top-of-funnel traffic without enough progression into inventory exploration.",
    action: "Add grouped model comparisons and broker/listing pathways.",
    confidence: "POSSIBLE",
  },
];

const trustRows = [
  {
    title: "Confirmed blockers",
    items: [
      "Assisted organic conversion confidence remains partial on content pages",
      "Inventory completeness by model is still not fully normalized",
      "Competitor overlap is directional outside core tracked clusters",
    ],
  },
  {
    title: "Decision rules",
    items: [
      "Act on confirmed CTR leaks and commercial page weaknesses first",
      "Do not overbuild authority content without clear commercial handoff",
      "Treat thin inventory opportunities as broker-recruitment problems, not just SEO problems",
    ],
  },
];

const compareTrendData = {
  WoW: [
    { name: "Mon", value: 149 },
    { name: "Tue", value: 156 },
    { name: "Wed", value: 163 },
    { name: "Thu", value: 171 },
    { name: "Fri", value: 178 },
    { name: "Sat", value: 182 },
    { name: "Sun", value: 186 },
  ],
  MoM: [
    { name: "W1", value: 151 },
    { name: "W2", value: 161 },
    { name: "W3", value: 173 },
    { name: "W4", value: 186 },
  ],
  "90D": [
    { name: "Jan", value: 132 },
    { name: "Feb", value: 149 },
    { name: "Mar", value: 166 },
    { name: "Apr", value: 186 },
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
  if (priority === "Later") return "bg-slate-500/15 text-slate-200 border-slate-400/30";
  return "bg-rose-950/40 text-rose-200 border-rose-500/30";
}

function scoreClasses(score: number) {
  if (score >= 90) return "text-emerald-300";
  if (score >= 75) return "text-amber-300";
  return "text-slate-300";
}

function safeStatusClasses(status: Opportunity["safeStatus"]) {
  if (status === "Safe to scale") return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  if (status === "Optimize carefully") return "border-amber-400/30 bg-amber-500/15 text-amber-200";
  if (status === "Diagnostic only") return "border-slate-400/30 bg-slate-500/15 text-slate-200";
  return "border-rose-400/30 bg-rose-500/15 text-rose-200";
}

export default function AvIntelOSPage03() {
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

  const filteredKPIs = useMemo(() => {
    return kpis.filter((item) => {
      if (activeRole.hideProbable && item.confidence !== "CONFIRMED") return false;
      if (confidenceFilter === "confirmed" && item.confidence !== "CONFIRMED") return false;
      if (confidenceFilter === "probable" && !(item.confidence === "CONFIRMED" || item.confidence === "PROBABLE")) return false;
      if (confidenceFilter === "possible" && item.confidence !== "POSSIBLE") return false;
      return true;
    });
  }, [activeRole.hideProbable, confidenceFilter]);

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
    if (view.includes("CTR Leak")) {
      setSelectedTypes(["CTR Leak", "Ranking Opportunity", "Schema / SERP Feature"]);
      setShowPinnedOnly(false);
      setActiveTab("serp");
      setConfidenceFilter("confirmed");
      return;
    }
    if (view.includes("Controller")) {
      setSelectedTypes(["Controller Gap", "Make / Model Gap", "Authority Cluster"]);
      setShowPinnedOnly(true);
      setActiveTab("competitive");
      setConfidenceFilter(role === "jeffrey" ? "confirmed" : "probable");
      return;
    }
    if (view.includes("Broker") || view.includes("Inventory")) {
      setSelectedTypes(["Inventory Coverage Gap", "Make / Model Gap", "Conversion Path Gap"]);
      setShowPinnedOnly(true);
      setActiveTab("models");
      setConfidenceFilter("probable");
      return;
    }
    if (view.includes("Confirmed") || view.includes("Board-Safe")) {
      setConfidenceFilter("confirmed");
      setShowPinnedOnly(false);
      setSelectedTypes(opportunityTypes);
      setActiveTab("overview");
      return;
    }
    setSelectedTypes(opportunityTypes);
    setShowPinnedOnly(false);
    setConfidenceFilter(role === "jeffrey" ? "confirmed" : "all");
    setActiveTab("queue");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
        <div className="mb-4 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Page structure</div>
              <div className="mt-1 text-sm text-slate-300">Organic Intelligence is built as a demand-capture and search opportunity operating layer. It surfaces CTR leaks, make/model gaps, competitor pressure, assist-path weaknesses, and inventory-demand mismatches.</div>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewTab)} className="w-full xl:w-auto">
              <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0 xl:w-auto">
                <TabsTrigger value="overview" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Overview</TabsTrigger>
                <TabsTrigger value="queue" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Opportunity Queue</TabsTrigger>
                <TabsTrigger value="serp" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">SERP & CTR Gaps</TabsTrigger>
                <TabsTrigger value="models" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Make / Model Coverage</TabsTrigger>
                <TabsTrigger value="competitive" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Competitive Gaps</TabsTrigger>
                <TabsTrigger value="content" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Content & Assist Paths</TabsTrigger>
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
                    <BarChart3 className="h-4 w-4" />
                    Av/IntelOS · Page 03
                  </div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">Organic Intelligence</h1>
                  <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">Commercial organic demand capture, CTR leakage, make/model coverage, competitor pressure, and authority-to-inquiry routing.</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-bold"><Target className="h-5 w-5 text-sky-300" /> Organic Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Largest immediate upside</div>
                <div className="mt-2 font-semibold text-white">Commercial CTR leak remediation on piston model pages.</div>
                <p className="mt-2 leading-6">The fastest organic gains are on high-impression model pages where rankings are already good enough, but GlobalAir is under-capturing clicks and inquiry intent.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Strategic rule</div>
                <div className="mt-2 font-semibold text-white">Do not separate SEO from inventory and broker reality.</div>
                <p className="mt-2 leading-6">If a model cluster has search demand but weak listing depth, the next move may be broker recruitment or listing quality remediation, not just page optimization.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><Filter className="h-5 w-5 text-sky-300" /> Organic filters</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pages, models, clusters, actions" className="border-white/10 bg-slate-950/80 pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {opportunityTypes.map((type) => {
                  const active = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${active ? "border-sky-400/30 bg-sky-500/15 text-sky-200" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div><div className="text-sm font-medium text-white">Pinned only</div><div className="text-xs text-slate-400">Casey weekly focus</div></div>
                  <Switch checked={showPinnedOnly} onCheckedChange={setShowPinnedOnly} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div><div className="text-sm font-medium text-white">Show do not act yet</div><div className="text-xs text-slate-400">Weak-confidence surfaced items</div></div>
                  <Switch checked={showDoNotActYet} onCheckedChange={setShowDoNotActYet} />
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
                  <div><div className="text-sm font-medium text-white">Competitor set</div><div className="text-xs text-slate-400">Controller + AirNav + Trade-A-Plane + AOPA</div></div>
                  <Badge className="border border-sky-400/30 bg-sky-500/15 text-sky-200">Expanded</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-bold"><Pin className="h-5 w-5 text-amber-300" /> Pinned this week</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {pinned.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-white">{item.type}</div>
                    <div className={`font-semibold ${scoreClasses(item.priorityScore)}`}>{item.priorityScore}</div>
                  </div>
                  <div className="mt-1 text-slate-300">{item.signal}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6 rounded-2xl border-amber-400/20 bg-amber-500/10 text-amber-50">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Organic intelligence warning</AlertTitle>
          <AlertDescription>
            Treat assisted content value, competitor overlap outside tracked clusters, and inventory-demand mismatch estimates as directional unless confirmed. Commercial CTR leaks and page-level gaps are the highest-confidence fast wins.
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
                    <CardTitle className="flex items-center gap-2 text-xl font-bold"><AlertTriangle className="h-5 w-5 text-amber-300" /> Top organic opportunities</CardTitle>
                    <Button variant="ghost" className="rounded-xl border border-white/10 bg-white/5" onClick={() => setActiveTab("queue")}>Open full queue <ChevronRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredOpportunities.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{item.type}</Badge>
                            <Badge className={`border ${priorityClasses(item.priority)}`}>{item.priority}</Badge>
                            <Badge className={`border ${confidenceClasses(item.confidence)}`}>{item.confidence}</Badge>
                            <Badge className={`border ${safeStatusClasses(item.safeStatus)}`}>{item.safeStatus}</Badge>
                            {item.pinned && <Badge className="border border-amber-400/30 bg-amber-500/15 text-amber-200">Pinned</Badge>}
                            {item.doNotActYet && <Badge className="border border-slate-400/30 bg-slate-500/15 text-slate-200">Do not act yet</Badge>}
                          </div>
                          <div className="mt-2 font-semibold text-white">{item.signal}</div>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{item.action}</p>
                        </div>
                        <div className="grid min-w-[220px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
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
                <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Radar className="h-5 w-5 text-sky-300" /> Organic trend</CardTitle></CardHeader>
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
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Current compare view: <span className="font-semibold text-white">{comparePeriod}</span>. Organic decisions should balance short-term CTR leaks with 90-day share trends.</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "queue" && (
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><AlertTriangle className="h-5 w-5 text-amber-300" /> Opportunity Queue</CardTitle>
                <div className="text-sm text-slate-400">Signal → Gap → Cause → Action → Owner → Lift → Blocker</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredOpportunities.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3 xl:flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{item.type}</Badge>
                        <Badge className={`border ${confidenceClasses(item.confidence)}`}>{item.confidence}</Badge>
                        <Badge className={`border ${priorityClasses(item.priority)}`}>{item.priority}</Badge>
                        <Badge className={`border ${safeStatusClasses(item.safeStatus)}`}>{item.safeStatus}</Badge>
                        {item.pinned && <Badge className="border border-amber-400/30 bg-amber-500/15 text-amber-200">Pinned</Badge>}
                        {item.doNotActYet && <Badge className="border border-slate-400/30 bg-slate-500/15 text-slate-200">Do not act yet</Badge>}
                      </div>
                      <div>
                        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Signal</div>
                        <div className="mt-1 font-semibold text-white">{item.signal}</div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Gap</div>
                          <p className="mt-1 text-sm leading-6 text-slate-300">{item.gap}</p>
                        </div>
                        <div>
                          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Likely Cause</div>
                          <p className="mt-1 text-sm leading-6 text-slate-300">{item.likelyCause}</p>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Recommended Action</div>
                        <p className="mt-1 text-sm leading-6 text-slate-200">{item.action}</p>
                      </div>
                    </div>
                    <div className="grid min-w-[300px] gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                      <div className="flex items-center justify-between"><span className="text-slate-400">Priority score</span><span className={`font-semibold ${scoreClasses(item.priorityScore)}`}>{item.priorityScore}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Time to impact</span><span>{item.timeToImpact}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Owner</span><span>{item.owner}</span></div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Expected lift</div>
                        <div className="mt-2 grid gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="flex items-center justify-between"><span className="text-slate-400">Conservative</span><span className="text-slate-200">{item.expectedLift.conservative}</span></div>
                          <div className="flex items-center justify-between"><span className="text-slate-400">Expected</span><span className="text-emerald-300">{item.expectedLift.expected}</span></div>
                          <div className="flex items-center justify-between"><span className="text-slate-400">Aggressive</span><span className="text-slate-200">{item.expectedLift.aggressive}</span></div>
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Dependency / blocker</div>
                        <div className="mt-2 text-slate-200">Dependency: {item.dependency}</div>
                        <div className="mt-1 text-slate-300">Blocker: {item.blocker}</div>
                      </div>
                      <Button variant="ghost" className="justify-between rounded-xl border border-white/10 bg-white/5 hover:bg-white/10" onClick={() => setOpenOpportunityId(item.id)}>
                        Why this surfaced <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "serp" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><FileSearch className="h-5 w-5 text-sky-300" /> Commercial page gaps</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {commercialPages.map((row) => (
                  <div key={row.page} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="xl:flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-semibold text-white">{row.page}</div>
                          <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.pageType}</Badge>
                          <Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-300">{row.issue}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-200"><span className="font-medium">Action:</span> {row.action}</p>
                      </div>
                      <div className="grid min-w-[280px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                        <div className="flex items-center justify-between"><span className="text-slate-400">Impressions</span><span>{row.impressions}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-400">Clicks</span><span>{row.clicks}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-400">CTR</span><span className="text-emerald-300">{row.ctr}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-400">Position</span><span>{row.position}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-400">Inquiry Rate</span><span>{row.inquiryRate}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Eye className="h-5 w-5 text-amber-300" /> Query cluster intelligence</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {queryClusters.map((row) => (
                  <div key={row.cluster} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold text-white">{row.cluster}</div>
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.intent}</Badge>
                      <Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Impressions</div><div className="mt-1 text-slate-200">{row.impressions}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">CTR</div><div className="mt-1 text-slate-200">{row.ctr}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Position</div><div className="mt-1 text-slate-200">{row.avgPosition}</div></div>
                    </div>
                    <div className="mt-3 text-sm text-slate-300">Coverage: {row.coverage}</div>
                    <div className="mt-1 text-sm text-slate-200">Next move: {row.nextMove}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "models" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Map className="h-5 w-5 text-sky-300" /> Make / model coverage</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {modelCoverage.map((row) => (
                  <div key={`${row.make}-${row.model}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold text-white">{row.make} {row.model}</div>
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.class}</Badge>
                      <Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Demand</div><div className="mt-1 text-slate-200">{row.demand}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Inventory</div><div className="mt-1 text-slate-200">{row.inventory}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Page Status</div><div className="mt-1 text-slate-200">{row.pageStatus}</div></div>
                    </div>
                    <div className="mt-3 text-sm text-slate-300">Opportunity: {row.opportunity}</div>
                    <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Layers3 className="h-5 w-5 text-emerald-300" /> Template and mismatch logic</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Winning model template: SR22 page structure should be reused where model demand and listing depth justify it.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Demand without inventory: Archer and several other piston models are not just page problems. They are supply problems that require broker recruitment support.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Missing/weak pages: where demand is present and a dedicated model page is missing or thin, build or upgrade the page before trying to scale content around it.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Internal rule: do not treat organic underperformance as a pure SEO issue when listing depth, pricing visibility, or broker page quality are the real constraints.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "competitive" && (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="h-5 w-5 text-sky-300" /> Competitor gap board</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {competitors.map((row) => (
                  <div key={`${row.competitor}-${row.cluster}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold text-white">{row.competitor}</div>
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.competitorType}</Badge>
                      <Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">Cluster: {row.cluster}</div>
                    <div className="mt-3 grid gap-3 md:grid-cols-4 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">GlobalAir</div><div className="mt-1 text-slate-200">{row.globalAir}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Competitor</div><div className="mt-1 text-slate-200">{row.competitorScore}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Gap</div><div className="mt-1 text-slate-200">{row.gap}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Win Probability</div><div className="mt-1 text-slate-200">{row.winProbability}</div></div>
                    </div>
                    <div className="mt-3 text-sm text-slate-200">Response: {row.response}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Sparkles className="h-5 w-5 text-amber-300" /> Competitor segmentation</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Marketplace competitors:</span> Controller, Trade-A-Plane. Focus on for-sale visibility, listing depth, make/model pages, and commercial CTR.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Utility / discovery competitor:</span> AirNav. Only pursue utility/discovery overlap where there is a real commercial tie-in to GlobalAir’s marketplace path.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Authority competitor:</span> AOPA. Competes in ownership, research, education, and trust-building aviation content that can intercept buyers before commercial pages.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Operating rule:</span> attack where GlobalAir has real win probability. Do not overspend time chasing competitor territory that lacks monetization or realistic share-capture odds.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "content" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><BookOpen className="h-5 w-5 text-sky-300" /> Content assist paths</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {contentAssistRows.map((row) => (
                  <div key={row.page} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold text-white">{row.page}</div>
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.type}</Badge>
                      <Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Sessions</div><div className="mt-1 text-slate-200">{row.sessions}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Assist Rate</div><div className="mt-1 text-slate-200">{row.assistRate}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Path Strength</div><div className="mt-1 text-slate-200">{row.pathStrength}</div></div>
                    </div>
                    <div className="mt-3 text-sm text-slate-300">Issue: {row.issue}</div>
                    <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Link2 className="h-5 w-5 text-emerald-300" /> Internal linking and routing rules</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Authority content must route into model pages, listings, or broker discovery paths. Content without a commercial handoff is incomplete.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Pages with strong trust signals but weak internal commercial routing should be prioritized before publishing large volumes of new content.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Comparison and operating-cost pages should link into model pages, related aircraft alternatives, and email/remarketing capture layers.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Internal linking should concentrate authority into pages that can actually produce qualified inquiry growth.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "trust" && (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="h-5 w-5 text-amber-300" /> Data trust</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                {trustRows.map((group) => (
                  <div key={group.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-semibold text-white">{group.title}</div>
                    <ul className="mt-2 space-y-2">
                      {group.items.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>
                ))}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">{activeRole.label} sees {role === "jeffrey" ? "confirmed-only rendering" : "full confidence range"}. Confirmed commercial page leaks should outrank modeled authority content opportunities in decision-making.</div>
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
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-sky-300" /> Organic action framework</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Fast wins: fix commercial CTR leaks, improve winning model templates, and tighten commercial trust cues on top pages.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Strategic moves: fill make/model page gaps, attack realistic competitor weak points, and route authority content into commercial paths.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Blockers: thin inventory, partial assist attribution, incomplete competitor confidence outside tracked clusters, and weak internal routing from content to commerce.</div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-emerald-300" /> Commercial page comparison</CardTitle></CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commercialPages.map((item) => ({ name: `${item.make} ${item.model}`, ctr: Number(item.ctr.replace("%", "")), inquiry: Number(item.inquiryRate.replace("%", "")) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                  <YAxis stroke="rgba(255,255,255,0.45)" />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                  <Bar dataKey="ctr" fill="currentColor" className="text-sky-300" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="inquiry" fill="currentColor" className="text-emerald-300" radius={[8, 8, 0, 0]} />
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
                  <SheetDescription className="text-left text-slate-400">Organic recommendation logic, blockers, and expected lift inspection drawer.</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{selectedOpportunity.type}</Badge>
                    <Badge className={`border ${confidenceClasses(selectedOpportunity.confidence)}`}>{selectedOpportunity.confidence}</Badge>
                    <Badge className={`border ${priorityClasses(selectedOpportunity.priority)}`}>{selectedOpportunity.priority}</Badge>
                    <Badge className={`border ${safeStatusClasses(selectedOpportunity.safeStatus)}`}>{selectedOpportunity.safeStatus}</Badge>
                    {selectedOpportunity.doNotActYet && <Badge className="border border-slate-400/30 bg-slate-500/15 text-slate-200">Do not act yet</Badge>}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{selectedOpportunity.signal}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{selectedOpportunity.gap}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Likely cause</div>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{selectedOpportunity.likelyCause}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Why this surfaced</div>
                    <ul className="mt-2 space-y-2 text-sm text-slate-200">
                      {selectedOpportunity.whySurfaced.map((reason) => <li key={reason}>• {reason}</li>)}
                    </ul>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Owner</div>
                      <div className="mt-2 text-slate-200">{selectedOpportunity.owner}</div>
                      <div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Time to impact</div>
                      <div className="mt-2 flex items-center gap-2 text-slate-200"><Clock3 className="h-4 w-4 text-sky-300" /> {selectedOpportunity.timeToImpact}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Priority score</div>
                      <div className={`mt-2 text-2xl font-bold ${scoreClasses(selectedOpportunity.priorityScore)}`}>{selectedOpportunity.priorityScore}</div>
                      <div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Blocker</div>
                      <div className="mt-2 text-slate-200">{selectedOpportunity.blocker}</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Expected lift range</div>
                    <div className="mt-3 grid gap-2">
                      <div className="flex items-center justify-between"><span className="text-slate-400">Conservative</span><span className="text-slate-200">{selectedOpportunity.expectedLift.conservative}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Expected</span><span className="text-emerald-300">{selectedOpportunity.expectedLift.expected}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Aggressive</span><span className="text-slate-200">{selectedOpportunity.expectedLift.aggressive}</span></div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Dependency</div>
                    <p className="mt-2 text-slate-200">{selectedOpportunity.dependency}</p>
                    <div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Recommended action</div>
                    <p className="mt-2 text-slate-200">{selectedOpportunity.action}</p>
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
