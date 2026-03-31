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
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileText,
  Filter,
  GitBranch,
  Link2,
  Radar,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Workflow,
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
    { name: "Weekly SEO Priorities", description: "Top model pages, internal linking fixes, and content engine actions." },
    { name: "Model Hub Buildout", description: "Commercial + research page system for priority models." },
    { name: "Controller Gap Strategy", description: "Where GlobalAir should attack, defend, or ignore." },
  ],
  clay: [
    { name: "Executive SEO Efficiency", description: "Compounding demand capture and category prioritization." },
    { name: "Content Production System", description: "Templates, velocity, and deployment discipline." },
    { name: "Technical Governance", description: "Indexation, duplication, CWV, and schema controls." },
  ],
  jeffrey: [
    { name: "Board-Safe SEO View", description: "Confirmed compounding growth plan and authority moat summary." },
    { name: "Category Expansion", description: "Where SEO should reinforce the business next." },
    { name: "Strategic SEO Constraint", description: "The biggest blocker to compounding organic growth." },
  ],
} as const;

const roles = {
  casey: { label: "Casey Jones", title: "Head of Marketing", hideProbable: false },
  clay: { label: "Clay Martin", title: "COO", hideProbable: false },
  jeffrey: { label: "Jeffrey Carrithers", title: "CEO", hideProbable: true },
} as const;

type RoleKey = keyof typeof roles;
type Confidence = "CONFIRMED" | "PROBABLE" | "POSSIBLE";
type ViewTab = "overview" | "architecture" | "intent" | "linking" | "content" | "technical" | "competitive" | "measurement";
type ComparePeriod = "WoW" | "MoM" | "90D";
type PlayType = "Category Priority" | "Model Hub" | "Research Page" | "Internal Link Fix" | "Template Deployment" | "Technical Governance" | "Competitive Move";

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

type Play = {
  id: string;
  type: PlayType;
  title: string;
  doctrine: string;
  whyItMatters: string;
  owner: string;
  dependency: string;
  blocker: string;
  timeToImpact: string;
  expectedLift: { conservative: string; expected: string; aggressive: string };
  confidence: Confidence;
  priority: "Now" | "Next" | "Later";
  priorityScore: number;
  pinned?: boolean;
  doNotActYet?: boolean;
  whySurfaced: string[];
};

type CategoryRow = {
  category: string;
  revenueContribution: string;
  listingVolume: string;
  brokerConcentration: string;
  competitiveGap: string;
  organicDifficulty: string;
  ppcCpqiSignal: string;
  recommendation: string;
  confidence: Confidence;
};

type ModelHubRow = {
  model: string;
  commercialPage: string;
  researchCoverage: string;
  linkDepth: string;
  priority: string;
  action: string;
  confidence: Confidence;
};

type TemplateRow = {
  template: string;
  requiredSections: string[];
  velocityTarget: string;
  role: string;
  confidence: Confidence;
};

type TechnicalRow = {
  control: string;
  currentState: string;
  risk: string;
  action: string;
  confidence: Confidence;
};

type CompetitiveRow = {
  zone: string;
  controllerLikelyStrength: string;
  globalAirAngle: string;
  response: string;
  confidence: Confidence;
};

const playTypes: PlayType[] = [
  "Category Priority",
  "Model Hub",
  "Research Page",
  "Internal Link Fix",
  "Template Deployment",
  "Technical Governance",
  "Competitive Move",
];

const kpis: KPI[] = [
  {
    id: "S001",
    label: "Priority Categories Locked",
    value: "4",
    delta: "Piston leads",
    deltaDirection: "flat",
    confidence: "CONFIRMED",
    source: "SEO prioritization framework",
    freshness: "Today",
    detail: "Category selection is based on revenue contribution, listing volume, broker concentration, competitive gap, organic difficulty, and PPC CPQI pressure.",
    statusTone: "good",
  },
  {
    id: "S002",
    label: "Model Hubs In Build Queue",
    value: "12",
    delta: "+3 MoM",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Model hub roadmap",
    freshness: "Today",
    detail: "Each priority model should have one commercial page and a supporting research cluster, not isolated random content.",
    statusTone: "warn",
  },
  {
    id: "S003",
    label: "Structured Page Velocity",
    value: "4–8 / mo",
    delta: "Target stable",
    deltaDirection: "flat",
    confidence: "CONFIRMED",
    source: "Content production engine",
    freshness: "Today",
    detail: "Quality over quantity. Templates should control production quality and keep output commercially useful.",
    statusTone: "good",
  },
  {
    id: "S004",
    label: "Internal Linking Risk",
    value: "Moderate",
    delta: "2 clusters weak",
    deltaDirection: "down",
    confidence: "PROBABLE",
    source: "Linking doctrine audit",
    freshness: "Today",
    detail: "Research pages without clear commercial routing weaken authority flow and conversion likelihood.",
    statusTone: "warn",
  },
  {
    id: "S005",
    label: "Technical SEO Safety",
    value: "Guarded",
    delta: "3 controls active",
    deltaDirection: "flat",
    confidence: "CONFIRMED",
    source: "Technical governance layer",
    freshness: "Today",
    detail: "Canonicalization, duplication control, schema discipline, sitemap automation, and monthly index coverage review are non-negotiable on listing platforms.",
    statusTone: "bad",
  },
];

const plays: Play[] = [
  {
    id: "seo-5a-001",
    type: "Category Priority",
    title: "Keep piston as the lead SEO expansion category",
    doctrine: "High listing volume, broker dependency, CPC pressure, and research-heavy buyer behavior make piston the best compounding SEO category.",
    whyItMatters: "If PPC CPQI is high in piston, SEO becomes even more strategically important as a blended cost reducer and authority moat.",
    owner: "SEO Lead",
    dependency: "Category scoring refresh",
    blocker: "None",
    timeToImpact: "Immediate planning / 30–90 day payoff",
    expectedLift: { conservative: "+5% organic commercial traffic", expected: "+10%", aggressive: "+16%" },
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 95,
    pinned: true,
    whySurfaced: [
      "Piston has high listing volume",
      "Research behavior is strong enough to support model-hub content",
      "High PPC CPQI increases SEO leverage",
    ],
  },
  {
    id: "seo-5a-002",
    type: "Model Hub",
    title: "Build each priority model as a mini authority hub",
    doctrine: "Every high-value model needs a commercial page plus research pages for specs, operating cost, price range, reviews, comparisons, and ownership topics.",
    whyItMatters: "This lets GlobalAir capture commercial, research, comparative, and ownership search behavior across the full buying cycle.",
    owner: "SEO + Content",
    dependency: "Template system + taxonomy map",
    blocker: "Some model page templates still inconsistent",
    timeToImpact: "2–8 weeks",
    expectedLift: { conservative: "+3 hubs live", expected: "+6 hubs live", aggressive: "+10 hubs live" },
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 94,
    pinned: true,
    whySurfaced: [
      "Search architecture requires structured clusters, not random pages",
      "Model hubs improve topical authority and conversion routing",
      "Commercial + research mapping is core playbook doctrine",
    ],
  },
  {
    id: "seo-5a-003",
    type: "Internal Link Fix",
    title: "Eliminate orphan research pages and force commercial routing",
    doctrine: "Every research page must link to its commercial listing page, related models, comparison pages, financing resources, and maintenance resources.",
    whyItMatters: "Internal linking improves crawl depth, topical authority, user engagement, and conversion likelihood on marketplace content.",
    owner: "SEO + Content",
    dependency: "Internal link module blocks",
    blocker: "Legacy pages still miss consistent link placement",
    timeToImpact: "1–3 weeks",
    expectedLift: { conservative: "+4% page depth", expected: "+8% depth + routing", aggressive: "+12%" },
    confidence: "PROBABLE",
    priority: "Now",
    priorityScore: 91,
    pinned: true,
    whySurfaced: [
      "No orphan pages is explicit doctrine",
      "Commercial pages must also link out to research resources",
      "Authority flow is weaker without systematic link governance",
    ],
  },
  {
    id: "seo-5a-004",
    type: "Template Deployment",
    title: "Standardize model, comparison, and ownership guide templates",
    doctrine: "Template-based production controls quality and makes 4–8 structured pages per month realistic without turning SEO into random publishing.",
    whyItMatters: "Templates let GlobalAir produce consistent, commercially useful authority pages faster while protecting UX quality.",
    owner: "Content Ops",
    dependency: "Approved design modules",
    blocker: "Template components not fully unified yet",
    timeToImpact: "2–4 weeks",
    expectedLift: { conservative: "4 pages / month", expected: "6 pages / month", aggressive: "8 pages / month" },
    confidence: "CONFIRMED",
    priority: "Next",
    priorityScore: 84,
    whySurfaced: [
      "Playbook specifies three core templates",
      "Velocity target depends on structured production",
      "Quality > quantity is a non-negotiable rule",
    ],
  },
  {
    id: "seo-5a-005",
    type: "Competitive Move",
    title: "Do not chase Controller everywhere; win on depth and structure",
    doctrine: "Controller likely dominates head terms and major models. GlobalAir should attack model-level gaps, long-tail gaps, comparison gaps, ownership content gaps, and emerging models.",
    whyItMatters: "This avoids resource waste and focuses SEO effort where GlobalAir has realistic leverage through deeper content, better UX, and fresh market insight.",
    owner: "SEO Strategist",
    dependency: "Competitor gap audit",
    blocker: "Some gap scoring still directional",
    timeToImpact: "2–6 weeks",
    expectedLift: { conservative: "+2 share wins", expected: "+5 wins", aggressive: "+8 wins" },
    confidence: "PROBABLE",
    priority: "Next",
    priorityScore: 80,
    whySurfaced: [
      "Competitive doctrine explicitly rejects universal head-term pursuit",
      "GlobalAir advantage is deeper ownership and comparison content",
      "Better listing-page UX is part of the moat strategy",
    ],
  },
  {
    id: "seo-5a-006",
    type: "Technical Governance",
    title: "Tighten duplicate-indexation and crawl-waste controls before scale",
    doctrine: "Listing platforms often suffer from parameter duplication, thin pages, and crawl waste. Canonicalization, sitemap automation, CWV, mobile parity, and index review are mandatory.",
    whyItMatters: "SEO scale compounds only when the technical layer protects index quality and crawl efficiency.",
    owner: "SEO + Dev",
    dependency: "Technical audit and dev support",
    blocker: "Shared engineering bandwidth",
    timeToImpact: "2–6 weeks",
    expectedLift: { conservative: "Risk reduction", expected: "Cleaner indexation", aggressive: "Compounding crawl efficiency" },
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 92,
    doNotActYet: false,
    whySurfaced: [
      "Technical governance is a non-negotiable playbook section",
      "Marketplace pages are especially prone to duplication and thin-page risk",
      "Index health determines how much content scale can compound",
    ],
  },
];

const categoryRows: CategoryRow[] = [
  {
    category: "Piston",
    revenueContribution: "High",
    listingVolume: "High",
    brokerConcentration: "High",
    competitiveGap: "Medium",
    organicDifficulty: "Manageable",
    ppcCpqiSignal: "High CPQI support",
    recommendation: "Primary SEO expansion category.",
    confidence: "CONFIRMED",
  },
  {
    category: "Jet",
    revenueContribution: "High",
    listingVolume: "Medium",
    brokerConcentration: "High",
    competitiveGap: "High",
    organicDifficulty: "Hard",
    ppcCpqiSignal: "Measurement-constrained",
    recommendation: "Selective, not broad, SEO expansion.",
    confidence: "PROBABLE",
  },
  {
    category: "Turbine",
    revenueContribution: "Medium",
    listingVolume: "Medium",
    brokerConcentration: "Medium",
    competitiveGap: "Medium",
    organicDifficulty: "Moderate",
    ppcCpqiSignal: "Useful support",
    recommendation: "Secondary cluster buildout.",
    confidence: "PROBABLE",
  },
  {
    category: "Helicopter",
    revenueContribution: "Lower",
    listingVolume: "Lower",
    brokerConcentration: "Lower",
    competitiveGap: "Niche",
    organicDifficulty: "Mixed",
    ppcCpqiSignal: "Limited signal",
    recommendation: "Later unless demand shifts materially.",
    confidence: "POSSIBLE",
  },
];

const modelHubRows: ModelHubRow[] = [
  {
    model: "Cessna 172",
    commercialPage: "Live / priority",
    researchCoverage: "Specs + operating cost + comparison needed refresh",
    linkDepth: "Moderate",
    priority: "Now",
    action: "Refresh commercial page and complete full hub coverage.",
    confidence: "CONFIRMED",
  },
  {
    model: "Cirrus SR22",
    commercialPage: "Live / strong",
    researchCoverage: "Strong base",
    linkDepth: "Strong",
    priority: "Now",
    action: "Use as reference hub template.",
    confidence: "CONFIRMED",
  },
  {
    model: "Piper Archer",
    commercialPage: "Live / thin",
    researchCoverage: "Weak",
    linkDepth: "Weak",
    priority: "Now",
    action: "Build research cluster and improve internal routing.",
    confidence: "PROBABLE",
  },
  {
    model: "Bonanza A36",
    commercialPage: "Live / moderate",
    researchCoverage: "Comparison and ownership gaps",
    linkDepth: "Moderate",
    priority: "Next",
    action: "Add comparison and ownership pages.",
    confidence: "PROBABLE",
  },
];

const templateRows: TemplateRow[] = [
  {
    template: "Model Page Template",
    requiredSections: ["Overview", "Key specs", "Market price range", "Performance data", "Pros/cons", "Ownership considerations", "Related listings", "FAQs", "Internal links"],
    velocityTarget: "2–3 / month",
    role: "Commercial + authority hub",
    confidence: "CONFIRMED",
  },
  {
    template: "Comparison Template",
    requiredSections: ["Performance comparison", "Cost comparison", "Ownership differences", "Buyer persona fit", "Linked listings"],
    velocityTarget: "1–2 / month",
    role: "Comparative decision support",
    confidence: "CONFIRMED",
  },
  {
    template: "Ownership Guide Template",
    requiredSections: ["Annual cost breakdown", "Insurance ranges", "Hangar costs", "Maintenance intervals", "Fuel burn", "Financing overview"],
    velocityTarget: "1–3 / month",
    role: "Research-stage capture + nurture",
    confidence: "CONFIRMED",
  },
];

const technicalRows: TechnicalRow[] = [
  {
    control: "Canonicalization for similar listings",
    currentState: "Partial",
    risk: "Duplicate indexation and diluted signals",
    action: "Audit canonical rules for listing variants and parameter states.",
    confidence: "CONFIRMED",
  },
  {
    control: "Structured data / listing schema",
    currentState: "Moderate",
    risk: "Weak rich-result coverage and inconsistent SERP trust cues",
    action: "Expand schema coverage across listing and model templates.",
    confidence: "PROBABLE",
  },
  {
    control: "Core Web Vitals",
    currentState: "Guarded",
    risk: "Marketplace UX drag on mobile search performance",
    action: "Prioritize page weight and interaction stability on listing pages.",
    confidence: "PROBABLE",
  },
  {
    control: "Sitemap automation + index review",
    currentState: "Needs discipline",
    risk: "Crawl waste and stale URLs persisting in the index",
    action: "Monthly index coverage review with stale-path cleanup.",
    confidence: "CONFIRMED",
  },
];

const competitiveRows: CompetitiveRow[] = [
  {
    zone: "Head terms",
    controllerLikelyStrength: "Strong",
    globalAirAngle: "Do not over-allocate resources here unless supported by business value.",
    response: "Maintain presence, but prioritize deeper model and ownership angles.",
    confidence: "CONFIRMED",
  },
  {
    zone: "Model-level gaps",
    controllerLikelyStrength: "Mixed",
    globalAirAngle: "Build stronger model hubs and commercial/research pairing.",
    response: "Primary attack zone.",
    confidence: "PROBABLE",
  },
  {
    zone: "Comparison content",
    controllerLikelyStrength: "Moderate",
    globalAirAngle: "Comparison pages can win with better structure and buyer framing.",
    response: "Expand deliberately.",
    confidence: "PROBABLE",
  },
  {
    zone: "Ownership content",
    controllerLikelyStrength: "Likely underinvested",
    globalAirAngle: "Use cost-to-own and buyer-guidance content to intercept research traffic.",
    response: "Strong leverage zone.",
    confidence: "PROBABLE",
  },
];

const compareTrendData = {
  WoW: [
    { name: "Mon", value: 41 },
    { name: "Tue", value: 43 },
    { name: "Wed", value: 44 },
    { name: "Thu", value: 46 },
    { name: "Fri", value: 47 },
    { name: "Sat", value: 48 },
    { name: "Sun", value: 49 },
  ],
  MoM: [
    { name: "W1", value: 38 },
    { name: "W2", value: 42 },
    { name: "W3", value: 45 },
    { name: "W4", value: 49 },
  ],
  "90D": [
    { name: "Jan", value: 33 },
    { name: "Feb", value: 39 },
    { name: "Mar", value: 44 },
    { name: "Apr", value: 49 },
  ],
} as const;

const templateChartData = templateRows.map((row, i) => ({
  name: row.template.replace(" Template", ""),
  target: i === 0 ? 3 : i === 1 ? 2 : 3,
  quality: i === 0 ? 9 : i === 1 ? 8 : 9,
}));

const categoryChartData = categoryRows.map((row, i) => ({
  name: row.category,
  priority: i === 0 ? 9 : i === 1 ? 7 : i === 2 ? 6 : 4,
  leverage: i === 0 ? 9 : i === 1 ? 6 : i === 2 ? 6 : 3,
}));

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

function priorityClasses(priority: Play["priority"]) {
  if (priority === "Now") return "bg-rose-500/15 text-rose-200 border-rose-400/30";
  if (priority === "Next") return "bg-amber-500/15 text-amber-200 border-amber-400/30";
  return "bg-slate-500/15 text-slate-200 border-slate-400/30";
}

function scoreClasses(score: number) {
  if (score >= 90) return "text-emerald-300";
  if (score >= 75) return "text-amber-300";
  return "text-slate-300";
}

function matchesConfidence(confidence: Confidence, hideProbable: boolean, filter: string) {
  if (hideProbable && confidence !== "CONFIRMED") return false;
  if (filter === "confirmed" && confidence !== "CONFIRMED") return false;
  if (filter === "probable" && !(confidence === "CONFIRMED" || confidence === "PROBABLE")) return false;
  if (filter === "possible" && confidence !== "POSSIBLE") return false;
  return true;
}

export default function AvIntelOSPage5A() {
  const [role, setRole] = useState<RoleKey>("casey");
  const [dateRange, setDateRange] = useState("30d");
  const [comparePeriod, setComparePeriod] = useState<ComparePeriod>("WoW");
  const [activeTab, setActiveTab] = useState<ViewTab>("overview");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [selectedSavedView, setSelectedSavedView] = useState(savedViewsByRole.casey[0].name);
  const [selectedTypes, setSelectedTypes] = useState<PlayType[]>(playTypes);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [showDoNotActYet, setShowDoNotActYet] = useState(true);
  const [search, setSearch] = useState("");
  const [openPlayId, setOpenPlayId] = useState<string | null>(null);

  const activeRole = roles[role];
  const savedViews = savedViewsByRole[role];

  const filteredKPIs = useMemo(() => {
    return kpis.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter));
  }, [activeRole.hideProbable, confidenceFilter]);

  const filteredPlays = useMemo(() => {
    return plays
      .filter((item) => {
        if (!matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)) return false;
        if (!selectedTypes.includes(item.type)) return false;
        if (showPinnedOnly && !item.pinned) return false;
        if (!showDoNotActYet && item.doNotActYet) return false;
        if (search && !`${item.title} ${item.doctrine} ${item.owner}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [activeRole.hideProbable, confidenceFilter, selectedTypes, showPinnedOnly, showDoNotActYet, search]);

  const pinned = filteredPlays.filter((item) => item.pinned);
  const selectedPlay = plays.find((item) => item.id === openPlayId) ?? null;

  function toggleType(type: PlayType) {
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
    if (view.includes("Model Hub")) {
      setSelectedTypes(["Model Hub", "Research Page", "Internal Link Fix"]);
      setActiveTab("architecture");
      setConfidenceFilter("probable");
      return;
    }
    if (view.includes("Controller")) {
      setSelectedTypes(["Competitive Move", "Category Priority"]);
      setActiveTab("competitive");
      setConfidenceFilter(role === "jeffrey" ? "confirmed" : "probable");
      return;
    }
    if (view.includes("Technical")) {
      setSelectedTypes(["Technical Governance"]);
      setActiveTab("technical");
      setConfidenceFilter("confirmed");
      return;
    }
    setSelectedTypes(playTypes);
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
              <div className="mt-1 text-sm text-slate-300">SEO Playbook Command turns the Step 5A doctrine into an operating surface: category scoring, model hub architecture, commercial vs research mapping, internal linking, template deployment, technical governance, and Controller response strategy.</div>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewTab)} className="w-full xl:w-auto">
              <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0 xl:w-auto">
                <TabsTrigger value="overview" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Overview</TabsTrigger>
                <TabsTrigger value="architecture" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Search Architecture</TabsTrigger>
                <TabsTrigger value="intent" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Commercial vs Research</TabsTrigger>
                <TabsTrigger value="linking" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Internal Linking</TabsTrigger>
                <TabsTrigger value="content" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Content Engine</TabsTrigger>
                <TabsTrigger value="technical" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Technical SEO</TabsTrigger>
                <TabsTrigger value="competitive" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Controller Strategy</TabsTrigger>
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
                    <Search className="h-4 w-4" />
                    Av/IntelOS · Page 5A
                  </div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">SEO Playbook Command</h1>
                  <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">Compounding authority engine for structured category capture, model hubs, research routing, technical governance, and Controller-aware expansion.</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-bold"><Target className="h-5 w-5 text-sky-300" /> Doctrine Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Core role of SEO</div>
                <div className="mt-2 font-semibold text-white">SEO is not traffic generation.</div>
                <p className="mt-2 leading-6">SEO exists to own high-value aircraft categories organically, capture research-stage buyers before PPC, reduce blended CPQI, build an authority moat vs Controller, support lifecycle segmentation, and strengthen the broker value proposition.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Primary design rule</div>
                <div className="mt-2 font-semibold text-white">Build structured clusters, not random pages.</div>
                <p className="mt-2 leading-6">Category → Manufacturer → Model → Supporting Research Pages. Each model should behave like a mini authority hub.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><Filter className="h-5 w-5 text-sky-300" /> SEO play filters</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search plays, models, controls" className="border-white/10 bg-slate-950/80 pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {playTypes.map((type) => {
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
                  <div><div className="text-sm font-medium text-white">Pinned only</div><div className="text-xs text-slate-400">Weekly build focus</div></div>
                  <Switch checked={showPinnedOnly} onCheckedChange={setShowPinnedOnly} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div><div className="text-sm font-medium text-white">Show do not act yet</div><div className="text-xs text-slate-400">Lower-confidence ideas</div></div>
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
                  <div className="mt-1 text-slate-300">{item.title}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6 rounded-2xl border-amber-400/20 bg-amber-500/10 text-amber-50">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>SEO playbook warning</AlertTitle>
          <AlertDescription>Do not let SEO drift into random publishing. Every page must map to a structured cluster, a buyer stage, an internal linking role, and a commercial outcome.</AlertDescription>
        </Alert>

        {activeTab === "overview" && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {filteredKPIs.map((kpi) => (
                <Card key={kpi.id} className={`overflow-hidden rounded-3xl border bg-gradient-to-br ${toneClasses(kpi.statusTone)} bg-slate-900 text-slate-100 shadow-xl`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div><div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{kpi.id}</div><div className="mt-1 text-sm text-slate-300">{kpi.label}</div></div>
                      <Badge className={`border ${confidenceClasses(kpi.confidence)}`}>{kpi.confidence}</Badge>
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div className="text-3xl font-black tracking-tight">{kpi.value}</div>
                      <div className="flex items-center gap-1 text-sm text-emerald-300">{kpi.deltaDirection === "up" ? <TrendingUp className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}<span>{kpi.delta}</span></div>
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
                <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-xl font-bold"><Workflow className="h-5 w-5 text-amber-300" /> Top SEO plays</CardTitle><Button variant="ghost" className="rounded-xl border border-white/10 bg-white/5" onClick={() => setActiveTab("architecture")}>Open architecture <ChevronRight className="ml-2 h-4 w-4" /></Button></div></CardHeader>
                <CardContent className="space-y-3">
                  {filteredPlays.slice(0, 4).map((item) => (
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
                          <div className="mt-2 font-semibold text-white">{item.title}</div>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{item.doctrine}</p>
                        </div>
                        <div className="grid min-w-[220px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                          <div className="flex items-center justify-between"><span className="text-slate-400">Score</span><span className={scoreClasses(item.priorityScore)}>{item.priorityScore}</span></div>
                          <div className="flex items-center justify-between"><span className="text-slate-400">Time</span><span>{item.timeToImpact}</span></div>
                          <Button variant="ghost" className="justify-between rounded-xl border border-white/10 bg-white/5 hover:bg-white/10" onClick={() => setOpenPlayId(item.id)}>Why this surfaced <ChevronRight className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
                <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Radar className="h-5 w-5 text-sky-300" /> SEO compounding trend</CardTitle></CardHeader>
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
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Use <span className="font-semibold text-white">{comparePeriod}</span> for execution rhythm, but judge SEO by compounding commercial coverage and structured authority growth, not just short-term traffic spikes.</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "architecture" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><GitBranch className="h-5 w-5 text-sky-300" /> Category prioritization model</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {categoryRows.map((row) => (
                  <div key={row.category} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.category}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Revenue</div><div className="mt-1 text-slate-200">{row.revenueContribution}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Listing Volume</div><div className="mt-1 text-slate-200">{row.listingVolume}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Broker Concentration</div><div className="mt-1 text-slate-200">{row.brokerConcentration}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Competitive Gap</div><div className="mt-1 text-slate-200">{row.competitiveGap}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Difficulty</div><div className="mt-1 text-slate-200">{row.organicDifficulty}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">PPC Signal</div><div className="mt-1 text-slate-200">{row.ppcCpqiSignal}</div></div>
                    </div>
                    <div className="mt-3 text-sm text-slate-200">Recommendation: {row.recommendation}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><BookOpen className="h-5 w-5 text-emerald-300" /> Model hub build queue</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {modelHubRows.map((row) => (
                  <div key={row.model} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.model}</div><Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.priority}</Badge><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Commercial Page</div><div className="mt-1 text-slate-200">{row.commercialPage}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Research Coverage</div><div className="mt-1 text-slate-200">{row.researchCoverage}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Link Depth</div><div className="mt-1 text-slate-200">{row.linkDepth}</div></div>
                    </div>
                    <div className="mt-3 text-sm text-slate-200">Action: {row.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "intent" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Target className="h-5 w-5 text-sky-300" /> Commercial page doctrine</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Every high-value model needs a commercial page optimized for “[model] for sale.”</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Commercial pages must include inventory count, sorting/filtering, specs preview, clear inquiry CTAs, and internal links to research pages.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Commercial pages must link out to specs, operating cost, ownership guides, and related listings to strengthen both UX and topical breadth.</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><FileText className="h-5 w-5 text-emerald-300" /> Research page doctrine</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Research pages should target specs, operating cost, cruise speed, price range, review, comparison, and ownership search behavior.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">These pages exist to capture top-of-funnel traffic, feed retargeting, feed email capture, and link back to the commercial listing page.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">SEO must map to all stages: commercial, research, comparative, and ownership. That is the aviation-specific search reality.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "linking" && (
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Link2 className="h-5 w-5 text-sky-300" /> Internal linking doctrine</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">No orphan pages. This is a hard rule, not a suggestion.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Every research page must link to its commercial listing page, related models, comparison pages, financing resources, and maintenance resources.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Commercial pages must link back into specs, operating cost, ownership guides, and related listings so authority and conversion paths reinforce each other.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Linking increases topical authority, crawl depth, user engagement, and conversion likelihood. On GlobalAir, it is a growth mechanism, not just an SEO cleanup task.</div>
            </CardContent>
          </Card>
        )}

        {activeTab === "content" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Workflow className="h-5 w-5 text-sky-300" /> Content production engine</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {templateRows.map((row) => (
                  <div key={row.template} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.template}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-2 text-sm text-slate-300">Role: {row.role}</div>
                    <div className="mt-2 text-sm text-slate-200">Velocity target: {row.velocityTarget}</div>
                    <div className="mt-3 grid gap-2 rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">
                      {row.requiredSections.map((section) => <div key={section}>• {section}</div>)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-emerald-300" /> Template velocity view</CardTitle></CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={templateChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                    <YAxis stroke="rgba(255,255,255,0.45)" />
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                    <Bar dataKey="target" fill="currentColor" className="text-sky-300" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="quality" fill="currentColor" className="text-emerald-300" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "technical" && (
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Wrench className="h-5 w-5 text-amber-300" /> Technical SEO governance</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {technicalRows.map((row) => (
                <div key={row.control} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.control}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                  <div className="mt-2 text-sm text-slate-200">Current state: {row.currentState}</div>
                  <div className="mt-1 text-sm text-slate-300">Risk: {row.risk}</div>
                  <div className="mt-1 text-sm text-slate-400">Action: {row.action}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "competitive" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="h-5 w-5 text-sky-300" /> Controller response map</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {competitiveRows.map((row) => (
                  <div key={row.zone} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-semibold text-white">{row.zone}</div>
                    <div className="mt-2 text-sm text-slate-300">Controller likely strength: {row.controllerLikelyStrength}</div>
                    <div className="mt-1 text-sm text-slate-200">GlobalAir angle: {row.globalAirAngle}</div>
                    <div className="mt-1 text-sm text-slate-400">Response: {row.response}</div>
                    <div className="mt-2"><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="h-5 w-5 text-amber-300" /> Competitive doctrine</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">GlobalAir should not try to outrank Controller everywhere.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Primary win zones are model-level gaps, long-tail gaps, comparison gaps, ownership content gaps, and emerging aircraft models.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">GlobalAir wins by deeper model content, better comparison pages, fresh market insights, structured internal linking, and better UX on listing pages.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "measurement" && (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><CheckCircle2 className="h-5 w-5 text-amber-300" /> Measurement hierarchy</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="font-semibold text-white">Primary KPI</div><div className="mt-2">Organic Qualified Inquiries by model/category.</div></div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="font-semibold text-white">Secondary KPIs</div><div className="mt-2">Organic traffic to commercial pages, ranking movement for high-value models, CTR by model, and return visitor rate from organic.</div></div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="font-semibold text-white">Tertiary KPIs</div><div className="mt-2">Research page traffic, time on page, and scroll depth.</div></div>
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4"><div className="font-semibold text-rose-200">Operational reminder</div><div className="mt-2">High PPC CPQI models increase SEO priority. High SEO traffic models justify PPC bid protection. SEO, PPC, email, and retargeting must compound, not operate in isolation.</div></div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><CheckCircle2 className="h-5 w-5 text-emerald-300" /> Operational SOP</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Weekly:</span> monitor ranking shifts for priority models, check index coverage, review GSC queries, identify new long-tail demand.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Monthly:</span> publish structured model or comparison pages, audit internal linking, refresh aging pages, review competitor ranking movement.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Quarterly:</span> re-evaluate model priority list, identify new aircraft trend demand, run technical SEO audit.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Role-aware rendering:</span> {activeRole.label} sees {role === "jeffrey" ? "confirmed-only framing" : "full doctrine and execution detail"}.</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-sky-300" /> SEO action framework</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Fast wins: fix internal routing, refresh thin research pages, complete commercial/research pairings on priority models, and tighten technical duplication controls.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Strategic moves: expand piston model hubs, publish comparison and ownership pages, and use Controller gap logic to decide where deeper content can win.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Blockers: inconsistent templates, partial link governance, shared dev bandwidth, and technical debt on marketplace indexation.</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-emerald-300" /> Category priority comparison</CardTitle></CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                  <YAxis stroke="rgba(255,255,255,0.45)" />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                  <Bar dataKey="priority" fill="currentColor" className="text-sky-300" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="leverage" fill="currentColor" className="text-emerald-300" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Sheet open={!!selectedPlay} onOpenChange={(open) => !open && setOpenPlayId(null)}>
          <SheetContent side="right" className="w-full border-white/10 bg-slate-950 text-slate-100 sm:max-w-xl">
            {selectedPlay && (
              <>
                <SheetHeader>
                  <SheetTitle className="text-left text-xl text-white">Why this surfaced</SheetTitle>
                  <SheetDescription className="text-left text-slate-400">SEO playbook logic, dependencies, blockers, and lift inspection drawer.</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{selectedPlay.type}</Badge>
                    <Badge className={`border ${confidenceClasses(selectedPlay.confidence)}`}>{selectedPlay.confidence}</Badge>
                    <Badge className={`border ${priorityClasses(selectedPlay.priority)}`}>{selectedPlay.priority}</Badge>
                    {selectedPlay.doNotActYet && <Badge className="border border-slate-400/30 bg-slate-500/15 text-slate-200">Do not act yet</Badge>}
                  </div>
                  <div><div className="text-2xl font-bold text-white">{selectedPlay.title}</div><p className="mt-2 text-sm leading-6 text-slate-300">{selectedPlay.doctrine}</p></div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Why it matters</div><p className="mt-2 text-sm leading-6 text-slate-200">{selectedPlay.whyItMatters}</p></div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Why this surfaced</div><ul className="mt-2 space-y-2 text-sm text-slate-200">{selectedPlay.whySurfaced.map((reason) => <li key={reason}>• {reason}</li>)}</ul></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Owner</div><div className="mt-2 text-slate-200">{selectedPlay.owner}</div><div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Time to impact</div><div className="mt-2 flex items-center gap-2 text-slate-200"><Clock3 className="h-4 w-4 text-sky-300" /> {selectedPlay.timeToImpact}</div></div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Priority score</div><div className={`mt-2 text-2xl font-bold ${scoreClasses(selectedPlay.priorityScore)}`}>{selectedPlay.priorityScore}</div><div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Blocker</div><div className="mt-2 text-slate-200">{selectedPlay.blocker}</div></div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Expected lift range</div><div className="mt-3 grid gap-2"><div className="flex items-center justify-between"><span className="text-slate-400">Conservative</span><span className="text-slate-200">{selectedPlay.expectedLift.conservative}</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Expected</span><span className="text-emerald-300">{selectedPlay.expectedLift.expected}</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Aggressive</span><span className="text-slate-200">{selectedPlay.expectedLift.aggressive}</span></div></div></div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Dependency</div><p className="mt-2 text-slate-200">{selectedPlay.dependency}</p></div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
