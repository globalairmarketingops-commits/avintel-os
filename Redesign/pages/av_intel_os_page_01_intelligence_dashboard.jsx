import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Filter,
  Gauge,
  MapPinned,
  Pin,
  Search,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Clock3,
  Sparkles,
  Lock,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

const roles = {
  casey: {
    label: "Casey Jones",
    title: "Head of Marketing",
    hideProbable: false,
    savedViews: ["Weekly Operator View", "Piston Growth Focus", "Churn Save Queue"],
  },
  clay: {
    label: "Clay Martin",
    title: "COO",
    hideProbable: false,
    savedViews: ["Executive Efficiency View", "Revenue Risk", "Operational Blockers"],
  },
  jeffrey: {
    label: "Jeffrey Carrithers",
    title: "CEO",
    hideProbable: true,
    savedViews: ["Board-Safe Confirmed View", "Revenue + Risk", "Confirmed Only"],
  },
} as const;

type RoleKey = keyof typeof roles;
type Confidence = "CONFIRMED" | "PROBABLE" | "POSSIBLE";
type Safety = "Safe to Scale" | "Diagnose First" | "Tracking Compromised";
type ViewTab = "overview" | "queue" | "leakage" | "competitive" | "trust";
type OpportunityType = "SEO" | "PPC" | "Revenue" | "Broker" | "Inventory" | "Content" | "Competitive" | "Measurement";
type ComparePeriod = "WoW" | "MoM" | "90D";

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
  spark: { name: string; value: number }[];
  statusTone?: "good" | "warn" | "bad";
};

type Mover = {
  domain: string;
  metric: string;
  value: string;
  delta: string;
  direction: "up" | "down";
  confidence: Confidence;
  note: string;
};

type Opportunity = {
  id: string;
  type: OpportunityType;
  area: string;
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
  doNotActYet?: boolean;
  pinned?: boolean;
};

type LeakageRow = {
  area: string;
  issue: string;
  why: string;
  impact: string;
  action: string;
  confidence: Confidence;
};

const opportunityTypes: OpportunityType[] = ["SEO", "PPC", "Revenue", "Broker", "Inventory", "Content", "Competitive", "Measurement"];

const kpis: KPI[] = [
  {
    id: "M001",
    label: "Qualified Inquiries",
    value: "418",
    delta: "+14.2% WoW",
    deltaDirection: "up",
    confidence: "CONFIRMED",
    source: "CRM + GA4 + call tracking",
    freshness: "42 min ago",
    detail: "Piston demand remains primary driver. Jet volume stable but not scale-ready.",
    statusTone: "good",
    spark: [
      { name: "Mon", value: 45 },
      { name: "Tue", value: 49 },
      { name: "Wed", value: 54 },
      { name: "Thu", value: 58 },
      { name: "Fri", value: 62 },
      { name: "Sat", value: 69 },
      { name: "Sun", value: 81 },
    ],
  },
  {
    id: "M002",
    label: "CPQI",
    value: "$118",
    delta: "-8.6% WoW",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Google Ads + GA4 weighted conversion set",
    freshness: "1 hr ago",
    detail: "Efficiency improved, but PPC conversion validation remains incomplete for some segments.",
    statusTone: "warn",
    spark: [
      { name: "Mon", value: 132 },
      { name: "Tue", value: 128 },
      { name: "Wed", value: 124 },
      { name: "Thu", value: 121 },
      { name: "Fri", value: 120 },
      { name: "Sat", value: 119 },
      { name: "Sun", value: 118 },
    ],
  },
  {
    id: "M004",
    label: "Advertiser Revenue",
    value: "$412.6K",
    delta: "+3.4% MoM",
    deltaDirection: "up",
    confidence: "CONFIRMED",
    source: "Stripe + advertiser payment records",
    freshness: "19 min ago",
    detail: "Revenue stable. Premium tier concentration remains moderate risk.",
    statusTone: "good",
    spark: [
      { name: "Mon", value: 380 },
      { name: "Tue", value: 384 },
      { name: "Wed", value: 392 },
      { name: "Thu", value: 399 },
      { name: "Fri", value: 402 },
      { name: "Sat", value: 408 },
      { name: "Sun", value: 413 },
    ],
  },
  {
    id: "M021",
    label: "Broker Risk Index",
    value: "17 at risk",
    delta: "+3 brokers",
    deltaDirection: "down",
    confidence: "PROBABLE",
    source: "CRM + engagement model",
    freshness: "3 hrs ago",
    detail: "Renewal risk rose in underutilized mid-tier accounts.",
    statusTone: "bad",
    spark: [
      { name: "Mon", value: 11 },
      { name: "Tue", value: 12 },
      { name: "Wed", value: 13 },
      { name: "Thu", value: 14 },
      { name: "Fri", value: 15 },
      { name: "Sat", value: 16 },
      { name: "Sun", value: 17 },
    ],
  },
  {
    id: "M015",
    label: "Authority vs Controller",
    value: "62 / 100",
    delta: "+4 pts",
    deltaDirection: "up",
    confidence: "POSSIBLE",
    source: "Composite model: SEO + paid + content share",
    freshness: "6 hrs ago",
    detail: "Model-level share improving in piston. Composite should not be used for board reporting.",
    statusTone: "warn",
    spark: [
      { name: "Mon", value: 54 },
      { name: "Tue", value: 55 },
      { name: "Wed", value: 56 },
      { name: "Thu", value: 58 },
      { name: "Fri", value: 59 },
      { name: "Sat", value: 61 },
      { name: "Sun", value: 62 },
    ],
  },
];

const movers: Mover[] = [
  { domain: "PPC", metric: "Cirrus SR22 QI", value: "63", delta: "+28%", direction: "up", confidence: "CONFIRMED", note: "Paid and organic momentum aligned." },
  { domain: "Revenue", metric: "Premium Tier ARPA", value: "$9,820", delta: "+16%", direction: "up", confidence: "CONFIRMED", note: "Driven by feature adoption lift." },
  { domain: "Broker", metric: "Renewal Risk — Silver Tier", value: "9 accts", delta: "+14%", direction: "down", confidence: "PROBABLE", note: "Engagement decay in underutilized accounts." },
  { domain: "Organic", metric: "Controller Gap — Cessna 182", value: "18 terms", delta: "-11%", direction: "up", confidence: "PROBABLE", note: "Visibility gap narrowing." },
  { domain: "Inventory", metric: "Hidden Price Penalty", value: "21 days", delta: "+9%", direction: "down", confidence: "CONFIRMED", note: "More stale unpriced listings." },
  { domain: "GA4", metric: "Clean Paid Sessions", value: "12,440", delta: "+8%", direction: "up", confidence: "PROBABLE", note: "Clean-only filter improves trust." },
  { domain: "Content", metric: "Buying Guide Assists", value: "34", delta: "+22%", direction: "up", confidence: "POSSIBLE", note: "Assisted only; attribution chain incomplete." },
  { domain: "Competitive", metric: "Auction Position Above Rate", value: "41%", delta: "+7%", direction: "up", confidence: "CONFIRMED", note: "Progress on priority piston terms." },
  { domain: "Market", metric: "Demand / Inventory — Archer", value: "6.2 : 1", delta: "+12%", direction: "up", confidence: "PROBABLE", note: "Potential broker recruitment zone." },
  { domain: "Data Health", metric: "Call Tracking Coverage", value: "74%", delta: "-5%", direction: "down", confidence: "CONFIRMED", note: "Coverage gap blocks full inquiry truth." },
];

const opportunities: Opportunity[] = [
  {
    id: "opp-001",
    type: "SEO",
    area: "Organic",
    signal: "High impressions, weak CTR on priority make/model pages",
    gap: "Search visibility is being earned, but click capture is underperforming.",
    likelyCause: "Titles/meta not aligned to buyer intent, weak price/spec hooks, low SERP differentiation versus Controller.",
    whySurfaced: [
      "48.2K impressions on Cessna 172 page with 1.1% CTR",
      "Controller outranks title hook on 3 of top 5 queries",
      "Page ranks on page 1 but under-clicks site average by 37%",
    ],
    expectedLift: {
      conservative: "+4% CTR",
      expected: "+8% CTR",
      aggressive: "+12% CTR",
    },
    action: "Rewrite titles/meta for top pages, add price-range/spec language, test stronger make/model phrasing, review highest impression leakage first.",
    owner: "SEO + Content",
    dependency: "Access to GSC page-query export",
    blocker: "None",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 92,
    timeToImpact: "7–14 days",
    pinned: true,
  },
  {
    id: "opp-002",
    type: "PPC",
    area: "PPC",
    signal: "Conversion efficiency varies by hour and market",
    gap: "Spend is still too evenly distributed across low- and high-yield windows.",
    likelyCause: "Limited dayparting, weak geo concentration, and incomplete location-level budget shaping.",
    whySurfaced: [
      "After 8 PM CPQI is 42% worse than baseline",
      "Florida, Texas, and Arizona drive 36% of paid inquiries on 24% of spend",
      "Midday Tue–Thu windows outperform account average by 19%",
    ],
    expectedLift: {
      conservative: "-4% CPQI",
      expected: "-9% CPQI",
      aggressive: "-14% CPQI",
    },
    action: "Identify converting dayparts, weekdays, and metro clusters; reduce weak windows; increase share in high-converting geos before broadening budget.",
    owner: "PPC",
    dependency: "Location and hourly conversion export",
    blocker: "Geo-level conversion confidence still partial",
    confidence: "PROBABLE",
    priority: "Now",
    priorityScore: 88,
    timeToImpact: "3–7 days",
    pinned: true,
  },
  {
    id: "opp-003",
    type: "Inventory",
    area: "Inventory",
    signal: "Demand outpaces listing coverage in select piston models",
    gap: "Buyer demand exists, but inventory depth is too thin to convert consistently.",
    likelyCause: "Broker recruitment lag and underrepresentation in models where search interest is rising.",
    whySurfaced: [
      "Archer demand-to-listing ratio is 6.2:1",
      "SR22 and 182 clusters show inquiry growth faster than listing growth",
      "Supply thinness is suppressing repeat-session conversion",
    ],
    expectedLift: {
      conservative: "+4% inquiry yield",
      expected: "+9% inquiry yield",
      aggressive: "+15% inquiry yield",
    },
    action: "Create recruitment list for supply-constrained models, target brokers with inventory in those aircraft, and package demand proof into outreach.",
    owner: "Sales + Broker Success",
    dependency: "Broker roster and model inventory map",
    blocker: "Recruitment package not yet standardized",
    confidence: "PROBABLE",
    priority: "Now",
    priorityScore: 86,
    timeToImpact: "2–4 weeks",
    pinned: true,
  },
  {
    id: "opp-004",
    type: "Inventory",
    area: "Listings",
    signal: "Listings with hidden prices or weak data fields underperform",
    gap: "Traffic reaches listings, but trust and conversion quality are suppressed.",
    likelyCause: "Missing price, weak photo depth, incomplete specs, stale updates.",
    whySurfaced: [
      "Hidden-price piston listings convert 19 days slower",
      "Listings with <6 images show weaker inquiry rate",
      "Top traffic broker pages still contain stale pricing blanks",
    ],
    expectedLift: {
      conservative: "-4 days to inquiry",
      expected: "-9 days to inquiry",
      aggressive: "-12 days to inquiry",
    },
    action: "Flag hidden-price and low-quality listings, rank by traffic and broker value, and push remediation briefs by broker.",
    owner: "Broker Success",
    dependency: "Listing quality audit feed",
    blocker: "Broker remediation workflow not standardized",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 90,
    timeToImpact: "1–2 weeks",
  },
  {
    id: "opp-005",
    type: "Broker",
    area: "Broker Revenue",
    signal: "Mid-tier broker renewal risk is rising",
    gap: "Accounts are active enough to save but weak enough to churn soon.",
    likelyCause: "Low package utilization, declining response quality, and weak proof of ROI.",
    whySurfaced: [
      "9 silver-tier accounts inside 45-day renewal window",
      "Utilization fell below 62% on at-risk cohort",
      "Response quality signals down 13% vs prior month",
    ],
    expectedLift: {
      conservative: "$12K protected ARR",
      expected: "$24K protected ARR",
      aggressive: "$31K protected ARR",
    },
    action: "Prioritize the 45-day renewal window, pair each account with ROI proof, utilization gaps, and targeted upsell/save narrative.",
    owner: "Sales / Retention",
    dependency: "Broker ROI brief template",
    blocker: "Offline close feedback still incomplete",
    confidence: "PROBABLE",
    priority: "Now",
    priorityScore: 84,
    timeToImpact: "1–3 weeks",
    pinned: true,
  },
  {
    id: "opp-006",
    type: "Measurement",
    area: "Measurement",
    signal: "Paid signal still not clean enough for jet expansion",
    gap: "Spend can scale faster than truth.",
    likelyCause: "Unconfirmed conversion actions, incomplete call tracking, contaminated GA4 engagement.",
    whySurfaced: [
      "Jets remain on hold in paid spec",
      "Call tracking coverage only 74%",
      "Weighted conversion set not fully validated by campaign",
    ],
    expectedLift: {
      conservative: "Risk reduction only",
      expected: "Avoid false scaling",
      aggressive: "Unlock safe expansion",
    },
    action: "Finish conversion validation, improve call tracking coverage, and hold jet expansion until confidence improves.",
    owner: "Analytics / PPC",
    dependency: "DevOps and analytics QA",
    blocker: "Conversion actions still unconfirmed",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 95,
    timeToImpact: "1–2 weeks",
  },
  {
    id: "opp-007",
    type: "Competitive",
    area: "Competitive",
    signal: "Controller still dominates head terms while GlobalAir is improving in model terms",
    gap: "Winning model territory, but still weak on broad commercial discovery.",
    likelyCause: "Controller blanket coverage remains stronger on generic search territory.",
    whySurfaced: [
      "Position-above rate only 41% on overlapping keywords",
      "Head-term economics remain weaker than model-isolated terms",
      "Model cluster share improving faster than generic category pages",
    ],
    expectedLift: {
      conservative: "+2 pts model share",
      expected: "+5 pts model share",
      aggressive: "+8 pts model share",
    },
    action: "Keep generic presence disciplined, isolate top piston models, and build stronger model-intent landing and authority content around ownership decisions.",
    owner: "SEO + PPC",
    dependency: "Model priority map",
    blocker: "None",
    confidence: "CONFIRMED",
    priority: "Next",
    priorityScore: 77,
    timeToImpact: "2–6 weeks",
  },
  {
    id: "opp-008",
    type: "Content",
    area: "Content",
    signal: "Buying guides attract traffic but assisted inquiry proof is still partial",
    gap: "Authority content is valuable, but monetization proof is not yet clean enough to scale aggressively.",
    likelyCause: "Content-to-QI attribution chain remains incomplete.",
    whySurfaced: [
      "Buying Guide Assists up 22% but confidence is POSSIBLE",
      "Top guide pages drive repeat sessions without reliable assist closure",
      "Lifecycle sync incomplete for content cohorts",
    ],
    expectedLift: {
      conservative: "+3 assisted inquiries",
      expected: "+7 assisted inquiries",
      aggressive: "+12 assisted inquiries",
    },
    action: "Map top authority pages to remarketing and nurture audiences, but do not scale content investment on assist claims until attribution is tighter.",
    owner: "Content + Lifecycle",
    dependency: "Assist attribution cleanup",
    blocker: "Content-to-QI attribution incomplete",
    confidence: "POSSIBLE",
    priority: "Later",
    priorityScore: 58,
    timeToImpact: "4–8 weeks",
    doNotActYet: true,
  },
];

const leakageRows: LeakageRow[] = [
  {
    area: "Organic",
    issue: "Cessna 172 for sale page has 48.2K impressions and 1.1% CTR",
    why: "SERP title lacks pricing/spec hook and is outranked visually by stronger competitor copy.",
    impact: "Estimated +530 to +710 additional clicks / 30d",
    action: "Rewrite title/meta, add price range and buyer-intent language, retest within 14 days.",
    confidence: "CONFIRMED",
  },
  {
    area: "PPC",
    issue: "Paid traffic after 8 PM converts 42% worse than midday windows",
    why: "Daypart schedule is too broad; weak evening efficiency is diluting spend.",
    impact: "Estimated 7–11% CPQI improvement",
    action: "Reduce bids after 8 PM, reallocate to Tue–Thu 10 AM–4 PM top-performing hours.",
    confidence: "PROBABLE",
  },
  {
    area: "Location",
    issue: "Florida, Texas, and Arizona generate 36% of paid inquiries on 24% of spend",
    why: "High-value geos are underweighted relative to conversion output.",
    impact: "Higher inquiry density without net-new budget",
    action: "Create geo-weighting rules and localized model landing experiences for top states.",
    confidence: "PROBABLE",
  },
  {
    area: "Listings",
    issue: "Hidden-price piston listings convert 19 days slower on average",
    why: "Buyers hesitate when pricing transparency is missing.",
    impact: "Faster inquiry and stronger broker satisfaction",
    action: "Flag top-traffic hidden-price listings and prioritize broker remediation outreach.",
    confidence: "CONFIRMED",
  },
];

const competitiveZones = [
  { title: "Head Terms", status: "Monitor", note: "Maintain presence, avoid reckless spend on broad territory." },
  { title: "Manufacturer", status: "Compete", note: "Improve CTR and landing-page alignment for make-level demand." },
  { title: "Model Terms", status: "Attack", note: "Primary offensive zone for piston growth and share capture." },
  { title: "Authority", status: "Build", note: "Win with ownership guides, comparisons, and broker visibility content." },
];

const trustModules = [
  {
    title: "Confirmed blockers",
    items: [
      "PPC conversion actions unconfirmed for jet expansion",
      "Call tracking coverage incomplete at 74%",
      "GA4 contamination remains active",
    ],
  },
  {
    title: "Watchlist",
    items: [
      "Content assist claims still modeled",
      "Location-level paid data partially validated",
      "Authority composite not board-safe",
    ],
  },
];

const savedViewsByRole: Record<RoleKey, { name: string; description: string }[]> = {
  casey: [
    { name: "Weekly Operator View", description: "Pinned opportunities, blockers, and fast wins." },
    { name: "Piston Growth Focus", description: "Model domination, demand gaps, and geo efficiency." },
    { name: "Churn Save Queue", description: "Broker risk, renewal timing, and ROI proof gaps." },
  ],
  clay: [
    { name: "Executive Efficiency View", description: "CPQI, revenue, blockers, and scale safety." },
    { name: "Revenue Risk", description: "Retention risk, concentration risk, and top actions." },
    { name: "Operational Blockers", description: "Data health and execution dependencies." },
  ],
  jeffrey: [
    { name: "Board-Safe Confirmed View", description: "Confirmed only. Revenue, inquiries, and risk." },
    { name: "Revenue + Risk", description: "Plain-language confirmed business trajectory." },
    { name: "Confirmed Only", description: "No modeled opportunity logic shown." },
  ],
};

const actionFramework = [
  {
    title: "Fast wins",
    items: ["Rewrite high-impression / low-CTR titles", "Tighten PPC dayparting", "Remediate hidden-price listings"],
  },
  {
    title: "Strategic moves",
    items: ["Recruit inventory into supply-constrained models", "Protect at-risk broker renewals", "Concentrate spend in high-converting geos"],
  },
  {
    title: "Blockers to resolve",
    items: ["Validate paid conversion actions", "Increase call-tracking coverage", "Separate confirmed vs modeled authority signals"],
  },
];

const compareTrendData = {
  WoW: [
    { name: "Mon", value: 42 },
    { name: "Tue", value: 48 },
    { name: "Wed", value: 54 },
    { name: "Thu", value: 57 },
    { name: "Fri", value: 61 },
    { name: "Sat", value: 66 },
    { name: "Sun", value: 72 },
  ],
  MoM: [
    { name: "W1", value: 318 },
    { name: "W2", value: 339 },
    { name: "W3", value: 362 },
    { name: "W4", value: 418 },
  ],
  "90D": [
    { name: "Jan", value: 271 },
    { name: "Feb", value: 308 },
    { name: "Mar", value: 351 },
    { name: "Apr", value: 418 },
  ],
} as const;

const domainSignalMix = [
  { name: "QI", value: 418 },
  { name: "Revenue", value: 413 },
  { name: "Paid", value: 361 },
  { name: "Organic", value: 388 },
  { name: "Broker", value: 244 },
  { name: "Inventory", value: 302 },
];

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

function deltaIcon(direction: KPI["deltaDirection"] | Mover["direction"]) {
  if (direction === "up") return <TrendingUp className="h-4 w-4" />;
  if (direction === "down") return <TrendingDown className="h-4 w-4" />;
  return <ArrowRight className="h-4 w-4" />;
}

function priorityClasses(priority: Opportunity["priority"]) {
  if (priority === "Now") return "bg-rose-500/15 text-rose-200 border-rose-400/30";
  if (priority === "Next") return "bg-amber-500/15 text-amber-200 border-amber-400/30";
  return "bg-slate-500/15 text-slate-200 border-slate-400/30";
}

function scoreClasses(score: number) {
  if (score >= 85) return "text-emerald-300";
  if (score >= 70) return "text-amber-300";
  return "text-slate-300";
}

function showTab(activeTab: ViewTab, target: Exclude<ViewTab, "overview">) {
  return activeTab === "overview" || activeTab === target;
}

export default function AvIntelOSPage01() {
  const [role, setRole] = useState<RoleKey>("casey");
  const [dateRange, setDateRange] = useState("30d");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ViewTab>("overview");
  const [comparePeriod, setComparePeriod] = useState<ComparePeriod>("WoW");
  const [selectedSavedView, setSelectedSavedView] = useState<string>(savedViewsByRole.casey[0].name);
  const [selectedTypes, setSelectedTypes] = useState<OpportunityType[]>(opportunityTypes);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [showDoNotActYet, setShowDoNotActYet] = useState(true);
  const [openOpportunityId, setOpenOpportunityId] = useState<string | null>(null);

  const activeRole = roles[role];
  const savedViews = savedViewsByRole[role];

  const filteredKPIs = useMemo(() => {
    return kpis.filter((kpi) => {
      if (activeRole.hideProbable && kpi.confidence !== "CONFIRMED") return false;
      if (confidenceFilter === "confirmed" && kpi.confidence !== "CONFIRMED") return false;
      if (confidenceFilter === "probable" && !(kpi.confidence === "CONFIRMED" || kpi.confidence === "PROBABLE")) return false;
      if (confidenceFilter === "possible" && kpi.confidence !== "POSSIBLE") return false;
      return true;
    });
  }, [activeRole.hideProbable, confidenceFilter]);

  const filteredMovers = useMemo(() => {
    return movers.filter((item) => {
      if (activeRole.hideProbable && item.confidence !== "CONFIRMED") return false;
      if (confidenceFilter === "confirmed" && item.confidence !== "CONFIRMED") return false;
      if (confidenceFilter === "probable" && !(item.confidence === "CONFIRMED" || item.confidence === "PROBABLE")) return false;
      if (confidenceFilter === "possible" && item.confidence !== "POSSIBLE") return false;
      if (search && !`${item.metric} ${item.domain} ${item.note}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activeRole.hideProbable, confidenceFilter, search]);

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
        if (search && !`${item.signal} ${item.area} ${item.action} ${item.owner} ${item.type}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [activeRole.hideProbable, confidenceFilter, selectedTypes, showPinnedOnly, showDoNotActYet, search]);

  const pinnedOpportunities = filteredOpportunities.filter((item) => item.pinned);
  const selectedOpportunity = opportunities.find((item) => item.id === openOpportunityId) ?? null;
  const safety: Safety = "Diagnose First";

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
    if (viewName.includes("Confirmed")) {
      setConfidenceFilter("confirmed");
      setShowPinnedOnly(false);
      setSelectedTypes(opportunityTypes.filter((type) => type !== "Content"));
      return;
    }
    if (viewName.includes("Piston")) {
      setSelectedTypes(["SEO", "PPC", "Inventory", "Competitive"]);
      setShowPinnedOnly(true);
      setConfidenceFilter("all");
      setActiveTab("queue");
      return;
    }
    if (viewName.includes("Churn") || viewName.includes("Revenue")) {
      setSelectedTypes(["Broker", "Revenue", "Inventory", "Measurement"]);
      setShowPinnedOnly(false);
      setConfidenceFilter("probable");
      setActiveTab("queue");
      return;
    }
    setSelectedTypes(opportunityTypes);
    setShowPinnedOnly(false);
    setConfidenceFilter(role === "jeffrey" ? "confirmed" : "all");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
        <div className="mb-4 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Page structure</div>
              <div className="mt-1 text-sm text-slate-300">Inner views now render distinct sub-pages inside Page 01. Overview stays concise, while queue, leakage, competitive, and trust surfaces provide deeper operator detail.</div>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewTab)} className="w-full xl:w-auto">
              <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0 xl:w-auto">
                <TabsTrigger value="overview" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Overview</TabsTrigger>
                <TabsTrigger value="queue" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Opportunity Queue</TabsTrigger>
                <TabsTrigger value="leakage" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Leakage Diagnostics</TabsTrigger>
                <TabsTrigger value="competitive" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Competitive Pressure</TabsTrigger>
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
                    Av/IntelOS · Page 01
                  </div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">Intelligence Dashboard</h1>
                  <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">Opportunity and gap-analysis surface for qualified inquiry growth, revenue efficiency, broker risk, authority pressure, and decision confidence.</p>
                </div>
                <div className="grid gap-3 text-sm md:grid-cols-2 xl:min-w-[520px]">
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="text-slate-400">Role</span>
                    <Select value={role} onValueChange={(v) => { setRole(v as RoleKey); setSelectedSavedView(savedViewsByRole[v as RoleKey][0].name); }}>
                      <SelectTrigger className="w-[190px] border-white/10 bg-slate-900/80">
                        <SelectValue />
                      </SelectTrigger>
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
                      <SelectTrigger className="w-[220px] border-white/10 bg-slate-900/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {savedViews.map((view) => (
                          <SelectItem key={view.name} value={view.name}>{view.name}</SelectItem>
                        ))}
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold"><Target className="h-5 w-5 text-sky-300" /> Opportunity Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Largest opportunity pocket</div>
                <div className="mt-2 flex items-center justify-between">
                  <span>High-intent piston models</span>
                  <span className="font-semibold text-emerald-300">Scale selectively</span>
                </div>
                <Progress value={74} className="mt-3 h-2" />
                <p className="mt-3 leading-6">GlobalAir is gaining position in SR22 and Cessna 182 clusters. The opportunity is to compound this with tighter CTR improvement on high-impression pages, stronger paid isolation, and broker inventory recruitment where demand exceeds supply.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Gap diagnosis rule</div>
                <div className="mt-2 font-semibold text-white">Every major signal should resolve to an opportunity, a likely cause, and a next action.</div>
                <p className="mt-2 leading-6">This page now supports ranked opportunities, pinned weekly priorities, confidence gating, and “do not act yet” states for weak-confidence items.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><Filter className="h-5 w-5 text-sky-300" /> Opportunity filters</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search opportunities, owners, actions" className="border-white/10 bg-slate-950/80 pl-9" />
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
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div>
                    <div className="text-sm font-medium text-white">Pinned only</div>
                    <div className="text-xs text-slate-400">Casey weekly cadence</div>
                  </div>
                  <Switch checked={showPinnedOnly} onCheckedChange={setShowPinnedOnly} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div>
                    <div className="text-sm font-medium text-white">Show do not act yet</div>
                    <div className="text-xs text-slate-400">Weak-confidence surfaced items</div>
                  </div>
                  <Switch checked={showDoNotActYet} onCheckedChange={setShowDoNotActYet} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div>
                    <div className="text-sm font-medium text-white">Confidence</div>
                    <div className="text-xs text-slate-400">Visibility gate</div>
                  </div>
                  <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                    <SelectTrigger className="w-[170px] border-white/10 bg-slate-900/80">
                      <SelectValue />
                    </SelectTrigger>
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold"><Pin className="h-5 w-5 text-amber-300" /> Pinned this week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {pinnedOpportunities.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-white">{item.area}</div>
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
          <AlertTitle>Persistent data warning</AlertTitle>
          <AlertDescription>
            GA4 engagement remains contaminated by Email_Open_ inflation. Paid efficiency is directionally useful, but not fully scale-safe until conversion validation and call tracking coverage are complete.
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
                        {deltaIcon(kpi.deltaDirection)}
                        <span>{kpi.delta}</span>
                      </div>
                    </div>
                    <div className="mt-4 h-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={kpi.spark}>
                          <defs>
                            <linearGradient id={`fill-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="currentColor" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                          <Area type="monotone" dataKey="value" stroke="currentColor" fill={`url(#fill-${kpi.id})`} className="text-sky-300" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
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
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold"><Sparkles className="h-5 w-5 text-amber-300" /> Top opportunity queue</CardTitle>
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
                            {item.pinned && <Badge className="border border-amber-400/30 bg-amber-500/15 text-amber-200">Pinned</Badge>}
                            {item.doNotActYet && <Badge className="border border-slate-400/30 bg-slate-500/15 text-slate-200">Do not act yet</Badge>}
                          </div>
                          <div className="mt-2 font-semibold text-white">{item.signal}</div>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{item.action}</p>
                        </div>
                        <div className="grid min-w-[200px] gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold"><Calendar className="h-5 w-5 text-sky-300" /> Compare trend</CardTitle>
                </CardHeader>
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
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Current compare view: <span className="font-semibold text-white">{comparePeriod}</span>. Use this to avoid overreacting to short-term moves when a 90-day picture tells a different story.</div>
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
                    <div className="grid min-w-[290px] gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
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
              {filteredOpportunities.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-sm text-slate-400">No opportunities match the current filter set.</div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "leakage" && (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><TrendingDown className="h-5 w-5 text-rose-300" /> Leakage Diagnostics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {leakageRows.map((row) => (
                  <div key={row.issue} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.area}</Badge>
                          <Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge>
                        </div>
                        <div className="font-semibold text-white">{row.issue}</div>
                        <p className="text-sm leading-6 text-slate-300"><span className="font-medium text-slate-200">Why:</span> {row.why}</p>
                        <p className="text-sm leading-6 text-slate-300"><span className="font-medium text-slate-200">Action:</span> {row.action}</p>
                      </div>
                      <div className="min-w-[220px] rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Estimated Impact</div>
                        <div className="mt-1 font-semibold text-emerald-300">{row.impact}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><MapPinned className="h-5 w-5 text-sky-300" /> Leakage categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Traffic-to-click leakage: high impressions, weak CTR, poor SERP hooks.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Click-to-inquiry leakage: weak landing alignment, stale listings, hidden price, insufficient trust signals.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Budget leakage: weak dayparts, diluted geos, broad non-isolated paid coverage.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Monetization leakage: underutilized broker packages, poor ROI proof, weak premium adoption.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "competitive" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="h-5 w-5 text-sky-300" /> Competitive Pressure Territories</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {competitiveZones.map((zone) => (
                  <div key={zone.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{zone.status}</div>
                    <div className="mt-1 text-lg font-semibold text-white">{zone.title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{zone.note}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Top 10 Opportunity Signals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredMovers.map((item, idx) => (
                  <div key={item.metric} className={`rounded-2xl border p-4 ${item.direction === "up" ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"}`}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-slate-300">{idx + 1}</div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-semibold text-white">{item.metric}</div>
                            <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{item.domain}</Badge>
                            <Badge className={`border ${confidenceClasses(item.confidence)}`}>{item.confidence}</Badge>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{item.note}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 font-semibold ${item.direction === "up" ? "text-emerald-300" : "text-rose-300"}`}>{deltaIcon(item.direction)} {item.delta}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "trust" && (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><Lock className="h-5 w-5 text-amber-300" /> Data Trust Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                {trustModules.map((group) => (
                  <div key={group.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-semibold text-white">{group.title}</div>
                    <ul className="mt-2 space-y-2">
                      {group.items.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">{activeRole.label} sees {role === "jeffrey" ? "confirmed-only rendering" : "full confidence range"} with source and freshness metadata preserved across the dashboard.</div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><Calendar className="h-5 w-5 text-sky-300" /> Domain Signal Mix</CardTitle>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainSignalMix}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                    <YAxis stroke="rgba(255,255,255,0.45)" />
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="currentColor" className="text-sky-300" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-sky-300" /> Action framework</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
              {actionFramework.map((group) => (
                <div key={group.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">{group.title}</div>
                  <ul className="mt-2 space-y-2 text-sm text-slate-300">
                    {group.items.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Best UX practice here is progressive disclosure: overview stays fast and digestible, while inner views expose ranked diagnostics, confidence context, and suggestion detail without overcrowding the landing view.</div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold"><Gauge className="h-5 w-5 text-emerald-300" /> Saved views by role</CardTitle>
            </CardHeader>
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

        <Sheet open={!!selectedOpportunity} onOpenChange={(open) => !open && setOpenOpportunityId(null)}>
          <SheetContent side="right" className="w-full border-white/10 bg-slate-950 text-slate-100 sm:max-w-xl">
            {selectedOpportunity && (
              <>
                <SheetHeader>
                  <SheetTitle className="text-left text-xl text-white">Why this surfaced</SheetTitle>
                  <SheetDescription className="text-left text-slate-400">Inspection drawer for recommendation logic, blockers, and expected impact.</SheetDescription>
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
                    <ul className="mt-2 space-y-2 text-sm text-slate-200">
                      {selectedOpportunity.whySurfaced.map((reason) => (
                        <li key={reason}>• {reason}</li>
                      ))}
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
