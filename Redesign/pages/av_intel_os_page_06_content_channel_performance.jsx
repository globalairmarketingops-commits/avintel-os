import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileText,
  Filter,
  Gauge,
  Layers3,
  Lock,
  PenSquare,
  RefreshCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
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
    { name: "Weekly Content Priorities", description: "Pillar gaps, top leaking articles, and next production moves.", mode: "weekly_priorities" },
    { name: "80/20 Compliance", description: "Evergreen vs news mix, velocity, and editorial balance.", mode: "mix_compliance" },
    { name: "Jadda Output Control", description: "Jadda production tracking, topic spread, and conversion contribution.", mode: "jadda_output" },
  ],
  clay: [
    { name: "Executive Content Efficiency", description: "Pillar performance, QI assist, and production utilization.", mode: "executive_efficiency" },
    { name: "Attribution Risk", description: "Content-to-QI confidence, assist-path blockers, and diagnostic-only areas.", mode: "attribution_risk" },
    { name: "Channel Reinforcement", description: "How content supports SEO, email, retargeting, and authority.", mode: "channel_reinforcement" },
  ],
  jeffrey: [
    { name: "Board-Safe Content View", description: "Confirmed pillar performance and strategic mix only.", mode: "board_safe" },
    { name: "Authority Growth", description: "Evergreen authority expansion and moat-building summary.", mode: "authority_growth" },
    { name: "Confirmed Top Performers", description: "Highest-confidence articles and themes.", mode: "confirmed_top_performers" },
  ],
} as const;

const roles = {
  casey: { label: "Casey Jones", title: "Head of Marketing", hideProbable: false },
  clay: { label: "Clay Martin", title: "COO", hideProbable: false },
  jeffrey: { label: "Jeffrey Carrithers", title: "CEO", hideProbable: true },
} as const;

type RoleKey = keyof typeof roles;
type Confidence = "CONFIRMED" | "PROBABLE" | "POSSIBLE";
type ViewTab = "overview" | "pillars" | "mix" | "articles" | "production" | "refresh" | "attribution" | "trust";
type ComparePeriod = "WoW" | "MoM" | "90D";
type OpportunityType = "Pillar Gap" | "Mix Compliance" | "Production Velocity" | "Article Leak" | "Refresh Opportunity" | "Attribution Risk" | "Channel Reinforcement";
type SavedViewMode =
  | "weekly_priorities"
  | "mix_compliance"
  | "jadda_output"
  | "executive_efficiency"
  | "attribution_risk"
  | "channel_reinforcement"
  | "board_safe"
  | "authority_growth"
  | "confirmed_top_performers";

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

type PillarRow = {
  pillar: string;
  shortLabel: string;
  articleCount: number;
  sessions: string;
  engagement: string;
  conversions: string;
  evergreenShare: string;
  role: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

type ArticleRow = {
  title: string;
  pillar: string;
  publishDate: string;
  sessions: string;
  engagement: string;
  conversions: string;
  assistRate: string;
  issue: string;
  action: string;
  confidence: Confidence;
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

type JaddaRow = {
  week: string;
  evergreen: number;
  news: number;
  primaryTopics: string;
  assistedConversions: string;
  note: string;
  confidence: Confidence;
};

type AttributionRow = {
  path: string;
  strength: string;
  confidence: Confidence;
  issue: string;
  nextMove: string;
};

type RefreshRow = {
  title: string;
  pillar: string;
  age: string;
  decaySignal: string;
  valueSignal: string;
  refreshType: string;
  owner: string;
  action: string;
  confidence: Confidence;
};

const opportunityTypes: OpportunityType[] = [
  "Pillar Gap",
  "Mix Compliance",
  "Production Velocity",
  "Article Leak",
  "Refresh Opportunity",
  "Attribution Risk",
  "Channel Reinforcement",
];

const kpis: KPI[] = [
  {
    id: "C001",
    label: "Evergreen Mix",
    value: "74%",
    delta: "+6 pts MoM",
    deltaDirection: "up",
    confidence: "CONFIRMED",
    source: "Content tagging registry",
    freshness: "41 min ago",
    detail: "Target is 80%+ evergreen. Progress is positive but still below doctrine target.",
    statusTone: "warn",
  },
  {
    id: "C002",
    label: "News Mix",
    value: "26%",
    delta: "-6 pts MoM",
    deltaDirection: "up",
    confidence: "CONFIRMED",
    source: "Content tagging registry",
    freshness: "41 min ago",
    detail: "Reactive/news-driven publishing is declining, but still slightly overweight vs target.",
    statusTone: "warn",
  },
  {
    id: "C003",
    label: "Content-Assisted Qualified Inquiries",
    value: "39",
    delta: "+12.8% MoM",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "GA4 assist-path model",
    freshness: "1 hr ago",
    detail: "Useful directionally. Content-to-QI attribution is improving but not fully confirmed across all journeys.",
    statusTone: "good",
  },
  {
    id: "C004",
    label: "Production Velocity",
    value: "7 / 30d",
    delta: "+2 articles",
    deltaDirection: "up",
    confidence: "CONFIRMED",
    source: "CMS publish log",
    freshness: "Today",
    detail: "Velocity is healthier, but pillar balance and assist-value quality matter more than raw output.",
    statusTone: "good",
  },
  {
    id: "C005",
    label: "Attribution Confidence",
    value: "Directional",
    delta: "2 blockers active",
    deltaDirection: "down",
    confidence: "CONFIRMED",
    source: "GA4 + CRM assist review",
    freshness: "54 min ago",
    detail: "Content-to-QI attribution remains incomplete enough that some wins should be treated as support signals, not final truth.",
    statusTone: "bad",
  },
  {
    id: "C006",
    label: "CTA Module Coverage",
    value: "61%",
    delta: "+9 pts MoM",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Content template QA audit",
    freshness: "Today",
    detail: "A large share of evergreen content still lacks standardized listing, comparison, and email-capture modules.",
    statusTone: "warn",
  },
];

const pillarRows: PillarRow[] = [
  {
    pillar: "Aircraft Buying Guides",
    shortLabel: "Buying",
    articleCount: 18,
    sessions: "14.8K",
    engagement: "71%",
    conversions: "12",
    evergreenShare: "100%",
    role: "Buyer progression",
    issue: "Strong pillar but still missing deeper model-specific guide depth in a few piston clusters.",
    action: "Expand model-linked guides and strengthen listing handoffs.",
    confidence: "CONFIRMED",
  },
  {
    pillar: "Market Analysis",
    shortLabel: "Market",
    articleCount: 11,
    sessions: "8.4K",
    engagement: "66%",
    conversions: "6",
    evergreenShare: "82%",
    role: "Authority + advertiser narrative",
    issue: "Useful authority layer but some articles lack clear buyer next-step modules.",
    action: "Add broker/listing tie-ins and summary CTA blocks.",
    confidence: "PROBABLE",
  },
  {
    pillar: "Operating Costs",
    shortLabel: "Costs",
    articleCount: 9,
    sessions: "10.2K",
    engagement: "73%",
    conversions: "8",
    evergreenShare: "100%",
    role: "High-value research capture",
    issue: "Assist-path performance is good, but related model links are inconsistent.",
    action: "Standardize model and ownership handoff modules.",
    confidence: "PROBABLE",
  },
  {
    pillar: "Lifestyle / Aspirational",
    shortLabel: "Lifestyle",
    articleCount: 7,
    sessions: "5.1K",
    engagement: "58%",
    conversions: "2",
    evergreenShare: "71%",
    role: "Brand and reach",
    issue: "Useful for authority, but low commercial connection and lower assist clarity.",
    action: "Reduce share of output unless tied to remarketing or buyer nurture paths.",
    confidence: "POSSIBLE",
  },
  {
    pillar: "News / Industry",
    shortLabel: "News",
    articleCount: 15,
    sessions: "7.9K",
    engagement: "49%",
    conversions: "1",
    evergreenShare: "0%",
    role: "Freshness / relevance",
    issue: "Still over-weighted relative to strategic target and weaker for durable compounding value.",
    action: "Cap reactive publishing and rebalance effort into evergreen pillar production.",
    confidence: "CONFIRMED",
  },
];

const articleRows: ArticleRow[] = [
  {
    title: "Cessna 172 Operating Cost Guide",
    pillar: "Operating Costs",
    publishDate: "2026-03-09",
    sessions: "4.1K",
    engagement: "74%",
    conversions: "4",
    assistRate: "1.1%",
    issue: "Strong traffic but could convert more traffic into listing views.",
    action: "Add aircraft-for-sale module and comparison CTA.",
    confidence: "PROBABLE",
  },
  {
    title: "Best Piston Aircraft for First-Time Buyers",
    pillar: "Aircraft Buying Guides",
    publishDate: "2026-03-13",
    sessions: "3.6K",
    engagement: "69%",
    conversions: "5",
    assistRate: "1.4%",
    issue: "High-performing article; should anchor a comparison cluster.",
    action: "Expand into child comparison pages and capture email earlier.",
    confidence: "CONFIRMED",
  },
  {
    title: "Cirrus SR22 vs Bonanza A36",
    pillar: "Aircraft Buying Guides",
    publishDate: "2026-03-18",
    sessions: "2.7K",
    engagement: "72%",
    conversions: "3",
    assistRate: "1.2%",
    issue: "Performs well but related listings section is thin.",
    action: "Improve model routing and related listings depth.",
    confidence: "PROBABLE",
  },
  {
    title: "NBAA Market Wrap: March Signals",
    pillar: "News / Industry",
    publishDate: "2026-03-21",
    sessions: "1.9K",
    engagement: "44%",
    conversions: "0",
    assistRate: "0.2%",
    issue: "Traffic with low downstream value.",
    action: "Reduce similar reactive production unless tied to evergreen follow-up.",
    confidence: "CONFIRMED",
  },
  {
    title: "What It Really Costs to Own an SR22",
    pillar: "Operating Costs",
    publishDate: "2026-03-24",
    sessions: "2.2K",
    engagement: "76%",
    conversions: "4",
    assistRate: "1.6%",
    issue: "Winning ownership asset; should be replicated to adjacent models.",
    action: "Clone template into Archer, A36, and 182 ownership content.",
    confidence: "CONFIRMED",
  },
];

const opportunities: Opportunity[] = [
  {
    id: "content-001",
    type: "Mix Compliance",
    signal: "Content mix has improved but is still below the 80/20 evergreen target",
    gap: "GlobalAir remains slightly too reactive/news-heavy relative to the intended authority model.",
    likelyCause: "News is easier to publish quickly, while evergreen production still depends on structured templates and topic discipline.",
    whySurfaced: [
      "Evergreen mix is 74%, below the 80% target",
      "News still represents 26% of output",
      "News pillar shows the weakest conversion and assist contribution",
    ],
    expectedLift: { conservative: "+4 pts evergreen mix", expected: "+8 pts", aggressive: "+12 pts" },
    action: "Cap reactive/news output and redirect editorial effort into evergreen buying guides, operating cost pages, and comparison clusters.",
    owner: "Content Lead",
    dependency: "Editorial calendar discipline",
    blocker: "Reactive requests still interrupt production rhythm",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 94,
    timeToImpact: "1–3 weeks",
    pinned: true,
  },
  {
    id: "content-002",
    type: "Article Leak",
    signal: "High-performing content pages still under-route users into listings and inquiries",
    gap: "Traffic and engagement are strong on certain evergreen articles, but the commercial handoff is not strong enough.",
    likelyCause: "Listing modules, model comparisons, and email/remarketing capture blocks are not consistently deployed.",
    whySurfaced: [
      "Operating-cost and buying-guide pages show strong engagement",
      "Assist-path value exists but is still under-realized",
      "Some top articles lack strong related listings and next-step blocks",
    ],
    expectedLift: { conservative: "+2 assisted inquiries / 30d", expected: "+6", aggressive: "+10" },
    action: "Standardize CTA modules, related listings, comparison links, and email capture on every high-performing evergreen article.",
    owner: "Content + CRO",
    dependency: "Reusable content CTA modules",
    blocker: "Template blocks not universal yet",
    confidence: "PROBABLE",
    priority: "Now",
    priorityScore: 91,
    timeToImpact: "1–2 weeks",
    pinned: true,
  },
  {
    id: "content-003",
    type: "Production Velocity",
    signal: "Velocity is recovering, but topic distribution still needs stronger control",
    gap: "Publishing volume alone can hide weak pillar balance or too much reactive output.",
    likelyCause: "Production tracking exists, but pillar and outcome weighting are not yet the default editorial control lens.",
    whySurfaced: [
      "7 articles published in 30 days",
      "Velocity improved, but news output still too high",
      "Jadda output needs stronger topic distribution guardrails",
    ],
    expectedLift: { conservative: "Higher production quality", expected: "Better pillar balance", aggressive: "Stronger assist efficiency" },
    action: "Tie weekly production targets to pillar gaps, not just output count, and track Jadda’s distribution across evergreen themes.",
    owner: "Content Ops",
    dependency: "Editorial scoring board",
    blocker: "No hard production mix guardrail yet",
    confidence: "CONFIRMED",
    priority: "Next",
    priorityScore: 83,
    timeToImpact: "1–3 weeks",
  },
  {
    id: "content-004",
    type: "Pillar Gap",
    signal: "Lifestyle and reactive news content consume effort with weaker commercial reinforcement",
    gap: "Some content still supports brand presence more than inquiry growth or advertiser value.",
    likelyCause: "Authority and editorial freshness goals are not always tied tightly enough to buyer-path outcomes.",
    whySurfaced: [
      "Lifestyle / Aspirational pillar has lower conversion contribution",
      "News / Industry pillar has weakest assist performance",
      "Evergreen pillars show better downstream utility",
    ],
    expectedLift: { conservative: "Cleaner content mix", expected: "Stronger pillar ROI", aggressive: "More assisted inquiry contribution" },
    action: "Reduce discretionary lifestyle/news volume unless it directly feeds remarketing, email, or advertiser narratives with clear value.",
    owner: "Content Lead",
    dependency: "Editorial kill rules",
    blocker: "Some topics still chosen reactively",
    confidence: "PROBABLE",
    priority: "Next",
    priorityScore: 79,
    timeToImpact: "2–4 weeks",
  },
  {
    id: "content-005",
    type: "Attribution Risk",
    signal: "Content-to-QI attribution is useful but still not clean enough to overstate article ROI",
    gap: "Some articles look valuable directionally, but full closed-loop contribution is still incomplete.",
    likelyCause: "Assist-path measurement is improving, but CRM and downstream attribution still have gaps.",
    whySurfaced: [
      "Content-assisted QI is still marked probable, not confirmed",
      "Assist-path confidence remains partial",
      "Some upper-funnel articles may be over-credited without stronger path validation",
    ],
    expectedLift: { conservative: "Risk containment", expected: "Cleaner article prioritization", aggressive: "Board-safe content ROI view" },
    action: "Keep content ROI labels confidence-aware and separate confirmed article wins from directional assist signals.",
    owner: "Analytics + Content",
    dependency: "Assist-path validation improvements",
    blocker: "CRM matching still partial",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 90,
    timeToImpact: "Immediate",
    doNotActYet: true,
    pinned: true,
  },
  {
    id: "content-006",
    type: "Refresh Opportunity",
    signal: "Several evergreen assets have durable intent but are aging without structured refreshes",
    gap: "GlobalAir is publishing new content, but some older winners are decaying without refresh governance.",
    likelyCause: "Refresh work is not yet treated as a first-class editorial queue beside net-new production.",
    whySurfaced: [
      "Evergreen articles create durable value over time",
      "Some older buying guides and ownership pages are candidates for CTA, pricing, and comparison refreshes",
      "Refreshes are often faster ROI than net-new content creation",
    ],
    expectedLift: { conservative: "+1 refreshed winner / month", expected: "+3", aggressive: "+5" },
    action: "Run a monthly refresh queue for aging evergreen winners with CTA, comparison, pricing-range, and internal-link updates.",
    owner: "Content Ops + SEO",
    dependency: "Refresh scoring logic",
    blocker: "No dedicated refresh backlog yet",
    confidence: "PROBABLE",
    priority: "Now",
    priorityScore: 88,
    timeToImpact: "2–4 weeks",
  },
];

const jaddaRows: JaddaRow[] = [
  {
    week: "W1",
    evergreen: 1,
    news: 2,
    primaryTopics: "News / market wrap / buyer guide",
    assistedConversions: "3",
    note: "Output still leaned reactive.",
    confidence: "CONFIRMED",
  },
  {
    week: "W2",
    evergreen: 2,
    news: 1,
    primaryTopics: "Operating costs / comparisons / news",
    assistedConversions: "6",
    note: "Mix improved.",
    confidence: "CONFIRMED",
  },
  {
    week: "W3",
    evergreen: 3,
    news: 0,
    primaryTopics: "Buying guide / ownership / comparison",
    assistedConversions: "9",
    note: "Best thematic balance so far.",
    confidence: "PROBABLE",
  },
  {
    week: "W4",
    evergreen: 1,
    news: 1,
    primaryTopics: "Market analysis / event recap",
    assistedConversions: "4",
    note: "Balanced but lower commercial yield.",
    confidence: "PROBABLE",
  },
];

const attributionRows: AttributionRow[] = [
  {
    path: "Organic article → model page → inquiry",
    strength: "Strongest",
    confidence: "PROBABLE",
    issue: "Useful and recurring, but still not fully board-safe in all cohorts.",
    nextMove: "Keep prioritizing evergreen articles with direct model routing.",
  },
  {
    path: "Email click → article → return visit → inquiry",
    strength: "Moderate",
    confidence: "POSSIBLE",
    issue: "Email and return-visit attribution still blur contribution in some cases.",
    nextMove: "Improve identity stitching and audience sync visibility.",
  },
  {
    path: "News article → social/referral → no commercial step",
    strength: "Weak",
    confidence: "CONFIRMED",
    issue: "Traffic exists, but downstream business value is low.",
    nextMove: "Reduce production unless tied to clear authority or advertiser goals.",
  },
  {
    path: "Comparison article → related listings → inquiry",
    strength: "High-potential",
    confidence: "PROBABLE",
    issue: "Works well where listing modules and comparison framing are strong.",
    nextMove: "Expand comparison cluster templates.",
  },
];

const refreshRows: RefreshRow[] = [
  {
    title: "Best Piston Aircraft for First-Time Buyers",
    pillar: "Aircraft Buying Guides",
    age: "7 months",
    decaySignal: "Traffic flattening",
    valueSignal: "Still one of the highest assist paths",
    refreshType: "CTA + comparison expansion",
    owner: "Content + SEO",
    action: "Update internal links, add child comparison blocks, and refresh buyer framing.",
    confidence: "CONFIRMED",
  },
  {
    title: "Cessna 172 Operating Cost Guide",
    pillar: "Operating Costs",
    age: "5 months",
    decaySignal: "Engagement stable, conversion softness",
    valueSignal: "Strong evergreen intent",
    refreshType: "Listing module + ownership cost refresh",
    owner: "Content",
    action: "Refresh cost ranges and insert stronger listing and financing paths.",
    confidence: "PROBABLE",
  },
  {
    title: "Private Aircraft Market Outlook 2025",
    pillar: "Market Analysis",
    age: "10 months",
    decaySignal: "Aging date-sensitive framing",
    valueSignal: "Still earns authority traffic",
    refreshType: "Re-date + advertiser narrative refresh",
    owner: "Content + Revenue",
    action: "Update market assumptions and add broker/advertiser insight block.",
    confidence: "PROBABLE",
  },
  {
    title: "Cirrus SR22 vs Bonanza A36",
    pillar: "Aircraft Buying Guides",
    age: "4 months",
    decaySignal: "Strong but incomplete depth",
    valueSignal: "High comparison intent",
    refreshType: "Spec table + related listings upgrade",
    owner: "Content + CRO",
    action: "Improve model detail, listings depth, and next-step routing.",
    confidence: "CONFIRMED",
  },
];

const compareTrendData = {
  WoW: [
    { name: "Mon", value: 71 },
    { name: "Tue", value: 72 },
    { name: "Wed", value: 73 },
    { name: "Thu", value: 74 },
    { name: "Fri", value: 74 },
    { name: "Sat", value: 74 },
    { name: "Sun", value: 74 },
  ],
  MoM: [
    { name: "W1", value: 63 },
    { name: "W2", value: 67 },
    { name: "W3", value: 71 },
    { name: "W4", value: 74 },
  ],
  "90D": [
    { name: "Jan", value: 58 },
    { name: "Feb", value: 65 },
    { name: "Mar", value: 70 },
    { name: "Apr", value: 74 },
  ],
} as const;

const pillarChartData = pillarRows.map((row) => ({
  name: row.shortLabel,
  articles: row.articleCount,
  conversions: Number(row.conversions),
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

function matchesConfidence(confidence: Confidence, hideProbable: boolean, filter: string) {
  if (hideProbable && confidence !== "CONFIRMED") return false;
  if (filter === "confirmed" && confidence !== "CONFIRMED") return false;
  if (filter === "probable" && !(confidence === "CONFIRMED" || confidence === "PROBABLE")) return false;
  if (filter === "possible" && confidence !== "POSSIBLE") return false;
  return true;
}

export default function AvIntelOSPage06() {
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

  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter((item) => {
        if (!matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)) return false;
        if (!selectedTypes.includes(item.type)) return false;
        if (showPinnedOnly && !item.pinned) return false;
        if (!showDoNotActYet && item.doNotActYet) return false;
        if (search && !`${item.signal} ${item.action} ${item.owner}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [activeRole.hideProbable, confidenceFilter, selectedTypes, showPinnedOnly, showDoNotActYet, search]);

  const filteredPillars = useMemo(() => pillarRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredArticles = useMemo(() => articleRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter) && (!search || `${item.title} ${item.pillar}`.toLowerCase().includes(search.toLowerCase()))), [activeRole.hideProbable, confidenceFilter, search]);
  const filteredJadda = useMemo(() => jaddaRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredAttribution = useMemo(() => attributionRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter)), [activeRole.hideProbable, confidenceFilter]);
  const filteredRefresh = useMemo(() => refreshRows.filter((item) => matchesConfidence(item.confidence, activeRole.hideProbable, confidenceFilter) && (!search || `${item.title} ${item.pillar} ${item.refreshType}`.toLowerCase().includes(search.toLowerCase()))), [activeRole.hideProbable, confidenceFilter, search]);

  const opportunitiesById = useMemo(() => new Map(opportunities.map((item) => [item.id, item])), []);
  const selectedOpportunity = openOpportunityId ? opportunitiesById.get(openOpportunityId) ?? null : null;
  const pinned = filteredOpportunities.filter((item) => item.pinned);
  const evergreenMix = 74;

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
    const selectedView = savedViews.find((view) => view.name === viewName);
    const mode = selectedView?.mode as SavedViewMode | undefined;

    switch (mode) {
      case "mix_compliance":
        setSelectedTypes(["Mix Compliance", "Production Velocity", "Pillar Gap"]);
        setActiveTab("mix");
        setConfidenceFilter("confirmed");
        setShowPinnedOnly(false);
        setShowDoNotActYet(true);
        return;
      case "jadda_output":
        setSelectedTypes(["Production Velocity", "Article Leak", "Refresh Opportunity"]);
        setActiveTab("production");
        setConfidenceFilter(role === "jeffrey" ? "confirmed" : "probable");
        setShowPinnedOnly(false);
        setShowDoNotActYet(true);
        return;
      case "attribution_risk":
        setSelectedTypes(["Attribution Risk", "Article Leak", "Channel Reinforcement"]);
        setActiveTab("attribution");
        setConfidenceFilter(role === "jeffrey" ? "confirmed" : "probable");
        setShowPinnedOnly(false);
        setShowDoNotActYet(true);
        return;
      case "channel_reinforcement":
        setSelectedTypes(["Article Leak", "Channel Reinforcement", "Pillar Gap"]);
        setActiveTab("articles");
        setConfidenceFilter(role === "jeffrey" ? "confirmed" : "probable");
        setShowPinnedOnly(false);
        setShowDoNotActYet(true);
        return;
      case "executive_efficiency":
        setSelectedTypes(["Mix Compliance", "Article Leak", "Production Velocity"]);
        setActiveTab("overview");
        setConfidenceFilter(role === "jeffrey" ? "confirmed" : "probable");
        setShowPinnedOnly(true);
        setShowDoNotActYet(false);
        return;
      case "board_safe":
        setSelectedTypes(["Mix Compliance", "Article Leak", "Attribution Risk"]);
        setActiveTab("overview");
        setConfidenceFilter("confirmed");
        setShowPinnedOnly(true);
        setShowDoNotActYet(false);
        return;
      case "authority_growth":
        setSelectedTypes(["Pillar Gap", "Mix Compliance", "Channel Reinforcement", "Refresh Opportunity"]);
        setActiveTab("pillars");
        setConfidenceFilter("confirmed");
        setShowPinnedOnly(false);
        setShowDoNotActYet(false);
        return;
      case "confirmed_top_performers":
        setSelectedTypes(["Article Leak", "Channel Reinforcement"]);
        setActiveTab("articles");
        setConfidenceFilter("confirmed");
        setShowPinnedOnly(false);
        setShowDoNotActYet(false);
        return;
      case "weekly_priorities":
      default:
        setSelectedTypes(opportunityTypes);
        setActiveTab("overview");
        setConfidenceFilter(role === "jeffrey" ? "confirmed" : "all");
        setShowPinnedOnly(false);
        setShowDoNotActYet(true);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
        <div className="mb-4 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Page structure</div>
              <div className="mt-1 text-sm text-slate-300">Content & Channel Performance turns content from reactive publishing into a measurable authority engine. It tracks pillar performance, 80/20 evergreen compliance, production velocity, Jadda output, top performers, and content-to-QI attribution confidence.</div>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewTab)} className="w-full xl:w-auto">
              <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0 xl:w-auto">
                <TabsTrigger value="overview" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Overview</TabsTrigger>
                <TabsTrigger value="pillars" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Pillar Analysis</TabsTrigger>
                <TabsTrigger value="mix" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">80/20 Mix</TabsTrigger>
                <TabsTrigger value="articles" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Top Articles</TabsTrigger>
                <TabsTrigger value="production" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Production</TabsTrigger>
                <TabsTrigger value="refresh" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Refresh Queue</TabsTrigger>
                <TabsTrigger value="attribution" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Attribution Chain</TabsTrigger>
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
                    <BookOpen className="h-4 w-4" />
                    Av/IntelOS · Page 06
                  </div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">Content & Channel Performance</h1>
                  <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">Pillar analytics, evergreen/news balance, production control, article-level performance, and content-to-qualified-inquiry visibility.</p>
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

                      switch (nextMode) {
                        case "mix_compliance":
                          setSelectedTypes(["Mix Compliance", "Production Velocity", "Pillar Gap"]);
                          setActiveTab("mix");
                          setConfidenceFilter("confirmed");
                          setShowPinnedOnly(false);
                          setShowDoNotActYet(true);
                          break;
                        case "jadda_output":
                          setSelectedTypes(["Production Velocity", "Article Leak", "Refresh Opportunity"]);
                          setActiveTab("production");
                          setConfidenceFilter(nextRole === "jeffrey" ? "confirmed" : "probable");
                          setShowPinnedOnly(false);
                          setShowDoNotActYet(true);
                          break;
                        case "attribution_risk":
                          setSelectedTypes(["Attribution Risk", "Article Leak", "Channel Reinforcement"]);
                          setActiveTab("attribution");
                          setConfidenceFilter(nextRole === "jeffrey" ? "confirmed" : "probable");
                          setShowPinnedOnly(false);
                          setShowDoNotActYet(true);
                          break;
                        case "channel_reinforcement":
                          setSelectedTypes(["Article Leak", "Channel Reinforcement", "Pillar Gap"]);
                          setActiveTab("articles");
                          setConfidenceFilter(nextRole === "jeffrey" ? "confirmed" : "probable");
                          setShowPinnedOnly(false);
                          setShowDoNotActYet(true);
                          break;
                        case "executive_efficiency":
                          setSelectedTypes(["Mix Compliance", "Article Leak", "Production Velocity"]);
                          setActiveTab("overview");
                          setConfidenceFilter(nextRole === "jeffrey" ? "confirmed" : "probable");
                          setShowPinnedOnly(true);
                          setShowDoNotActYet(false);
                          break;
                        case "board_safe":
                          setSelectedTypes(["Mix Compliance", "Article Leak", "Attribution Risk"]);
                          setActiveTab("overview");
                          setConfidenceFilter("confirmed");
                          setShowPinnedOnly(true);
                          setShowDoNotActYet(false);
                          break;
                        case "authority_growth":
                          setSelectedTypes(["Pillar Gap", "Mix Compliance", "Channel Reinforcement", "Refresh Opportunity"]);
                          setActiveTab("pillars");
                          setConfidenceFilter("confirmed");
                          setShowPinnedOnly(false);
                          setShowDoNotActYet(false);
                          break;
                        case "confirmed_top_performers":
                          setSelectedTypes(["Article Leak", "Channel Reinforcement"]);
                          setActiveTab("articles");
                          setConfidenceFilter("confirmed");
                          setShowPinnedOnly(false);
                          setShowDoNotActYet(false);
                          break;
                        case "weekly_priorities":
                        default:
                          setSelectedTypes(opportunityTypes);
                          setActiveTab("overview");
                          setConfidenceFilter(nextRole === "jeffrey" ? "confirmed" : "all");
                          setShowPinnedOnly(false);
                          setShowDoNotActYet(true);
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
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-bold"><Target className="h-5 w-5 text-sky-300" /> Content Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Core strategic rule</div>
                <div className="mt-2 font-semibold text-white">Content is not a news feed. It is an authority and inquiry-assist system.</div>
                <p className="mt-2 leading-6">The target mix is 80% evergreen and 20% news. Pillars should be judged by assisted inquiry contribution and channel reinforcement, not session volume alone.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Biggest immediate upside</div>
                <div className="mt-2 font-semibold text-white">Route high-performing evergreen articles into listings, comparisons, and email capture more aggressively.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Missing layer now added</div>
                <div className="mt-2 font-semibold text-white">Refresh governance for aging evergreen winners.</div>
                <p className="mt-2 leading-6">Page 6 should not only judge new output. It should surface refresh candidates where a lighter editorial update can unlock faster ROI than publishing net-new content.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><Filter className="h-5 w-5 text-sky-300" /> Content filters</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pillars, articles, actions" className="border-white/10 bg-slate-950/80 pl-9" />
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
                  <div><div className="text-sm font-medium text-white">Pinned only</div><div className="text-xs text-slate-400">Weekly content focus</div></div>
                  <Switch checked={showPinnedOnly} onCheckedChange={setShowPinnedOnly} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div><div className="text-sm font-medium text-white">Show do not act yet</div><div className="text-xs text-slate-400">Weak-confidence items</div></div>
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
          <AlertTitle>Content governance warning</AlertTitle>
          <AlertDescription>Content strategy should not remain reactive/news-driven. The page must keep the team moving toward an 80% evergreen and 20% news balance, while clearly labeling content-to-QI attribution that is still only directional. </AlertDescription>
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
                <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-xl font-bold"><AlertTriangle className="h-5 w-5 text-amber-300" /> Top content opportunities</CardTitle><Button variant="ghost" className="rounded-xl border border-white/10 bg-white/5" onClick={() => setActiveTab("articles")}>Open article detail <ChevronRight className="ml-2 h-4 w-4" /></Button></div></CardHeader>
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
                <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Gauge className="h-5 w-5 text-sky-300" /> 80/20 compliance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Evergreen share</div>
                        <div className="mt-2 text-3xl font-black text-white">{evergreenMix}%</div>
                      </div>
                      <Badge className={`border ${evergreenMix >= 80 ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200" : evergreenMix >= 60 ? "border-amber-400/30 bg-amber-500/15 text-amber-200" : "border-rose-400/30 bg-rose-500/15 text-rose-200"}`}>{evergreenMix >= 80 ? "On target" : evergreenMix >= 60 ? "Close" : "Off target"}</Badge>
                    </div>
                    <div className="mt-4"><Progress value={evergreenMix} /></div>
                    <div className="mt-3 text-sm text-slate-300">Target is 80%+ evergreen. Current state is improving but still not fully compliant.</div>
                  </div>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={compareTrendData[comparePeriod]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                        <YAxis stroke="rgba(255,255,255,0.45)" domain={[50, 85]} />
                        <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                        <Line type="monotone" dataKey="value" stroke="currentColor" className="text-sky-300" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "pillars" && (
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Layers3 className="h-5 w-5 text-sky-300" /> Content pillar analysis</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {filteredPillars.map((row) => (
                <div key={row.pillar} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="xl:flex-1">
                      <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.pillar}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                      <div className="mt-3 text-sm text-slate-300">Role: {row.role}</div>
                      <div className="mt-2 text-sm text-slate-300">Issue: {row.issue}</div>
                      <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                    </div>
                    <div className="grid min-w-[280px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                      <div className="flex items-center justify-between"><span className="text-slate-400">Articles</span><span>{row.articleCount}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Sessions</span><span>{row.sessions}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Engagement</span><span>{row.engagement}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Conversions</span><span>{row.conversions}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Evergreen Share</span><span>{row.evergreenShare}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "mix" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Gauge className="h-5 w-5 text-sky-300" /> Mix control board</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Target mix: 80% evergreen / 20% news. Current state: 74% evergreen / 26% news.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Green status should begin at 80%. Amber covers 60–79%. Below 60% evergreen is off-policy.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">News content should exist for relevance, but evergreen content should dominate because it compounds traffic, supports SEO, and reinforces buyer journeys over time.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">The system should flag editorial drift whenever news output grows faster than evergreen production across a 30-day window.</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-emerald-300" /> Evergreen vs news velocity</CardTitle></CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredJadda.map((item) => ({ name: item.week, evergreen: item.evergreen, news: item.news }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                    <YAxis stroke="rgba(255,255,255,0.45)" />
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                    <Bar dataKey="evergreen" fill="currentColor" className="text-sky-300" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="news" fill="currentColor" className="text-amber-300" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "articles" && (
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><FileText className="h-5 w-5 text-sky-300" /> Top performers and article leaks</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {filteredArticles.map((row) => (
                <div key={row.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="xl:flex-1">
                      <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.title}</div><Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.pillar}</Badge><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                      <div className="mt-2 text-sm text-slate-400">Published {row.publishDate}</div>
                      <div className="mt-2 text-sm text-slate-300">Issue: {row.issue}</div>
                      <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                    </div>
                    <div className="grid min-w-[280px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                      <div className="flex items-center justify-between"><span className="text-slate-400">Sessions</span><span>{row.sessions}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Engagement</span><span>{row.engagement}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Conversions</span><span>{row.conversions}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Assist Rate</span><span className="text-emerald-300">{row.assistRate}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "production" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><PenSquare className="h-5 w-5 text-sky-300" /> Jadda production tracker</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredJadda.map((row) => (
                  <div key={row.week} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.week}</div><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Evergreen</div><div className="mt-1 text-slate-200">{row.evergreen}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">News</div><div className="mt-1 text-slate-200">{row.news}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Assisted Conversions</div><div className="mt-1 text-slate-200">{row.assistedConversions}</div></div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">Topics: {row.primaryTopics}</div>
                    <div className="mt-1 text-sm text-slate-400">{row.note}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-emerald-300" /> Production rules</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Track Jadda’s output by week, by topic distribution, and by evergreen vs news balance — not just total article count.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Production velocity matters only if the output strengthens priority pillars and inquiry-assist paths.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">The editorial system should default toward evergreen buying guides, operating cost assets, ownership content, and comparison pages.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">News content should be additive, not dominant. It should not consume the majority of weekly production energy.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Refresh work should now sit beside net-new production as a formal editorial lane with its own queue and score.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "refresh" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><RefreshCcw className="h-5 w-5 text-sky-300" /> Evergreen refresh queue</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredRefresh.map((row) => (
                  <div key={row.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="xl:flex-1">
                        <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.title}</div><Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.pillar}</Badge><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                        <div className="mt-2 text-sm text-slate-400">Age: {row.age} · Decay: {row.decaySignal}</div>
                        <div className="mt-2 text-sm text-slate-300">Value signal: {row.valueSignal}</div>
                        <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                      </div>
                      <div className="grid min-w-[280px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                        <div className="flex items-center justify-between"><span className="text-slate-400">Refresh type</span><span>{row.refreshType}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-400">Owner</span><span>{row.owner}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-400">Queue priority</span><span className="text-emerald-300">High</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Clock3 className="h-5 w-5 text-amber-300" /> Refresh doctrine</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Refresh candidates should be selected when an article still holds durable intent but begins to decay in traffic, conversion rate, freshness, or internal-link quality.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Refreshes should usually be faster ROI than net-new content because the URL already has some authority, ranking history, and assist-path value.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Core refresh types: CTA refresh, pricing/cost refresh, comparison-module expansion, related listings upgrade, and internal-link/module cleanup.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Page 6 should now treat refresh work as a standing operating queue, not an occasional editorial cleanup task.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "attribution" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Target className="h-5 w-5 text-sky-300" /> Content-to-QI attribution chain</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {filteredAttribution.map((row) => (
                  <div key={row.path} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-white">{row.path}</div><Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.strength}</Badge><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                    <div className="mt-2 text-sm text-slate-300">Issue: {row.issue}</div>
                    <div className="mt-1 text-sm text-slate-200">Next move: {row.nextMove}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="h-5 w-5 text-amber-300" /> Attribution doctrine</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Content-to-QI attribution is in progress, not fully final. The UI should clearly distinguish confirmed article contribution from directional assist signals.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">This page should make visible how content reinforces SEO, email, retargeting, and inquiry progression, not just content sessions.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Article winners should be expanded when they show both durable evergreen value and a credible path toward listing views, inquiry assists, or advertiser narrative support.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "trust" && (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Lock className="h-5 w-5 text-amber-300" /> Content data trust</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
                  <div className="font-semibold text-rose-200">Critical blockers</div>
                  <ul className="mt-2 space-y-2">
                    <li>• Content-to-QI attribution is still in progress</li>
                    <li>• Some assist-path wins are directional, not confirmed</li>
                    <li>• Production output is not yet fully systematized against mix targets</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Decision rule</div>
                  <p className="mt-2 leading-6">Prioritize evergreen content that compounds authority and routes users into commercial journeys. Treat low-confidence assist signals carefully until attribution is stronger.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Role-aware rendering</div>
                  <p className="mt-2 leading-6">{activeRole.label} sees {role === "jeffrey" ? "confirmed-only rendering" : "full confidence range"}. Jeffrey-safe views should suppress directional overstatement.</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-sky-300" /> Content action framework</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Fast wins: rebalance away from reactive news, improve CTA/listing modules on winning evergreen articles, standardize comparison and ownership content blocks, and refresh aging evergreen winners before publishing lower-value new pieces.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Strategic moves: make pillar performance the editorial control system, track Jadda output by topic quality, and expand evergreen assets that reinforce SEO, email, and retargeting.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Blockers: incomplete content-to-QI attribution, reactive publishing interruptions, and uneven content-to-commercial routing.</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-emerald-300" /> Pillar conversions comparison</CardTitle></CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pillarChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                  <YAxis stroke="rgba(255,255,255,0.45)" />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                  <Bar dataKey="articles" fill="currentColor" className="text-sky-300" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="conversions" fill="currentColor" className="text-emerald-300" radius={[8, 8, 0, 0]} />
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
                  <SheetDescription className="text-left text-slate-400">Content recommendation logic, blockers, and expected lift inspection drawer.</SheetDescription>
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
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Likely cause</div>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{selectedOpportunity.likelyCause}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Why this surfaced</div>
                    <ul className="mt-2 space-y-2 text-sm text-slate-200">{selectedOpportunity.whySurfaced.map((reason) => <li key={reason}>• {reason}</li>)}</ul>
                  </div>
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
