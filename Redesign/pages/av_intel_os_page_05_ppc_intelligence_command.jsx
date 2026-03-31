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
  Crosshair,
  DollarSign,
  Filter,
  Gauge,
  Layers3,
  Lock,
  Radar,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
  Swords,
  Route,
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
    { name: "Weekly PPC Priorities", description: "Top spend shifts, leak fixes, and model attack zones." },
    { name: "Piston Domination", description: "Priority piston models, impression share pressure, and scale pockets." },
    { name: "Conquest & Defense", description: "Controller overlap, brand defense, and selective conquesting." },
  ],
  clay: [
    { name: "Executive PPC Efficiency", description: "CPQI, spend quality, and budget concentration summary." },
    { name: "Budget Control", description: "Protect, grow, expand, and test tier management." },
    { name: "Lead Quality Risk", description: "Search term leakage, event weighting, and scale blockers." },
  ],
  jeffrey: [
    { name: "Board-Safe PPC View", description: "Confirmed paid demand, efficiency, and scale-safe areas only." },
    { name: "High-Intent Share", description: "Where GlobalAir is gaining or losing paid share." },
    { name: "Competitive Pressure", description: "Controller overlap and where concentration should intensify." },
  ],
} as const;

const roles = {
  casey: { label: "Casey Jones", title: "Head of Marketing", hideProbable: false },
  clay: { label: "Clay Martin", title: "COO", hideProbable: false },
  jeffrey: { label: "Jeffrey Carrithers", title: "CEO", hideProbable: true },
} as const;

type RoleKey = keyof typeof roles;
type Confidence = "CONFIRMED" | "PROBABLE" | "POSSIBLE";
type ViewTab = "overview" | "queue" | "structure" | "searchterms" | "retargeting" | "competitive" | "trust";
type ComparePeriod = "WoW" | "MoM" | "90D";
type OpportunityType =
  | "Impression Share Gap"
  | "Search Term Leakage"
  | "Model Scale Pocket"
  | "Budget Reallocation"
  | "Landing Mismatch"
  | "Conquest Opportunity"
  | "Retargeting Gap"
  | "Bidding Governance"
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
  priority: "Now" | "Next" | "Later" | "Kill";
  priorityScore: number;
  timeToImpact: string;
  pinned?: boolean;
  doNotActYet?: boolean;
  safeStatus: "Safe to scale" | "Optimize carefully" | "Diagnostic only" | "Blocked by measurement";
};

type CampaignRow = {
  layer: string;
  focus: string;
  spend: string;
  cpqi: string;
  impressionShare: string;
  recommendation: string;
  confidence: Confidence;
};

type ModelRow = {
  model: string;
  category: string;
  spend: string;
  cpqi: string;
  cvr: string;
  impressionShare: string;
  lostIS: string;
  auctionOverlap: string;
  action: string;
  confidence: Confidence;
};

type SearchTermRow = {
  term: string;
  bucket: string;
  spend: string;
  conversions: string;
  quality: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

type RetargetingRow = {
  audience: string;
  size: string;
  window: string;
  cvr: string;
  role: string;
  issue: string;
  action: string;
  confidence: Confidence;
};

type CompetitorRow = {
  zone: string;
  globalAir: string;
  controller: string;
  overlap: string;
  action: string;
  confidence: Confidence;
};

const opportunityTypes: OpportunityType[] = [
  "Impression Share Gap",
  "Search Term Leakage",
  "Model Scale Pocket",
  "Budget Reallocation",
  "Landing Mismatch",
  "Conquest Opportunity",
  "Retargeting Gap",
  "Bidding Governance",
  "Measurement Risk",
];

const kpis: KPI[] = [
  {
    id: "P001",
    label: "Qualified Inquiries from PPC",
    value: "143",
    delta: "+9.2% WoW",
    deltaDirection: "up",
    confidence: "CONFIRMED",
    source: "Weighted inquiry set",
    freshness: "31 min ago",
    detail: "Paid search remains one of the cleanest immediate demand channels, especially in piston clusters with strong query control.",
    statusTone: "good",
  },
  {
    id: "P002",
    label: "CPQI",
    value: "$211",
    delta: "-6.4% WoW",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Paid inquiry model",
    freshness: "31 min ago",
    detail: "Efficiency is improving, but some high-value segments remain partially blocked by attribution confidence gaps.",
    statusTone: "good",
  },
  {
    id: "P003",
    label: "Piston IS on Priority Models",
    value: "72%",
    delta: "+4 pts WoW",
    deltaDirection: "up",
    confidence: "CONFIRMED",
    source: "Auction + platform exports",
    freshness: "47 min ago",
    detail: "Still below the desired 80% threshold on several priority models, which means headroom remains.",
    statusTone: "warn",
  },
  {
    id: "P004",
    label: "Search Term Quality Rate",
    value: "83%",
    delta: "+2 pts WoW",
    deltaDirection: "up",
    confidence: "PROBABLE",
    source: "Manual query review layer",
    freshness: "1 hr ago",
    detail: "Leakage is improving but some generic and training-related waste is still entering medium-intent campaigns.",
    statusTone: "warn",
  },
  {
    id: "P005",
    label: "Scale Safety",
    value: "Selective",
    delta: "2 blockers active",
    deltaDirection: "down",
    confidence: "CONFIRMED",
    source: "PPC + attribution governance",
    freshness: "38 min ago",
    detail: "Piston can scale. Jet and conquest expansion should stay controlled until conversion truth improves further.",
    statusTone: "bad",
  },
];

const opportunities: Opportunity[] = [
  {
    id: "ppc-001",
    type: "Model Scale Pocket",
    signal: "Cessna 172 and SR22 exact-match pockets still have profitable headroom",
    gap: "GlobalAir is winning enough to justify scale, but impression share still sits below the target threshold on top models.",
    likelyCause: "Budget concentration and campaign segmentation improved, but spend is still distributed too broadly across secondary queries.",
    whySurfaced: [
      "Priority piston model impression share still under 80%",
      "CPQI remains inside acceptable range on top exact-match clusters",
      "Auction overlap vs Controller remains high, which signals valuable territory",
    ],
    expectedLift: { conservative: "+4 inquiries / 30d", expected: "+9 inquiries / 30d", aggressive: "+15 inquiries / 30d" },
    action: "Shift budget from lower-quality generic and weaker time windows into exact-match piston model groups with stable CVR and query quality.",
    owner: "PPC Lead",
    dependency: "Hour/day and query-quality review",
    blocker: "Need to preserve CPQI discipline during shift",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 95,
    timeToImpact: "3–7 days",
    pinned: true,
    safeStatus: "Safe to scale",
  },
  {
    id: "ppc-002",
    type: "Search Term Leakage",
    signal: "Generic campaigns still absorb training, jobs, rental, and low-intent aviation waste",
    gap: "Broad and medium-intent traffic is still carrying too much irrelevant query exposure relative to strict doctrine.",
    likelyCause: "Negative keyword governance is improving, but expansion logic still allows noisy variants into non-brand campaigns.",
    whySurfaced: [
      "Search term quality is 83%, not yet at target threshold",
      "Leakage still visible in generic and manufacturer phrase buckets",
      "Several non-commercial terms continue to consume spend without weighted value",
    ],
    expectedLift: { conservative: "-3% wasted spend", expected: "-7% wasted spend", aggressive: "-11% wasted spend" },
    action: "Tighten negatives, isolate phrase expansion, and keep broad match inside a separate experiment-only campaign with hard stop-losses.",
    owner: "PPC Lead",
    dependency: "Weekly search term review cadence",
    blocker: "Shared ownership on query QA is still loose",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 93,
    timeToImpact: "Immediate",
    pinned: true,
    safeStatus: "Safe to scale",
  },
  {
    id: "ppc-003",
    type: "Landing Mismatch",
    signal: "Some manufacturer and generic campaigns still resolve into pages that are not specific enough for the query",
    gap: "Paid intent quality is stronger than the landing experience in several important paths.",
    likelyCause: "Model isolation is improving, but some campaigns still land on broad search or thin category pages instead of the strongest model-aligned page.",
    whySurfaced: [
      "Lost IS due to rank is not the only issue; some landing friction remains",
      "CVR varies materially between aligned model pages and broader routes",
      "Campaign doctrine explicitly requires model-specific landing experience for model queries",
    ],
    expectedLift: { conservative: "+3% CVR", expected: "+7% CVR", aggressive: "+11% CVR" },
    action: "Tighten destination mapping so every exact-match model term lands on the strongest dedicated model page with inventory, specs, trust, and CTA depth.",
    owner: "PPC + CRO",
    dependency: "Landing page inventory and page mapping audit",
    blocker: "Some thin pages still need upgrade before traffic is rerouted",
    confidence: "PROBABLE",
    priority: "Now",
    priorityScore: 90,
    timeToImpact: "1–2 weeks",
    pinned: true,
    safeStatus: "Optimize carefully",
  },
  {
    id: "ppc-004",
    type: "Conquest Opportunity",
    signal: "Controller conquesting is viable only on a few high-value models with superior landing experience",
    gap: "The conquest opportunity exists, but it is not broad enough to justify blanket expansion.",
    likelyCause: "Controller still dominates by scale, while GlobalAir wins only where specificity and page alignment make the economics work.",
    whySurfaced: [
      "Auction overlap remains strongest on high-value model terms",
      "Conquest economics vary materially by model",
      "Playbook doctrine requires strict isolation and guardrails for conquesting",
    ],
    expectedLift: { conservative: "+2 inquiries / 30d", expected: "+5 inquiries / 30d", aggressive: "+8 inquiries / 30d" },
    action: "Run conquest only on select model terms where landing depth is clearly stronger than the competitor path and query intent is high.",
    owner: "PPC Lead",
    dependency: "Dedicated conquest campaign + landing proof",
    blocker: "Measurement still partial in some assisted pathways",
    confidence: "PROBABLE",
    priority: "Next",
    priorityScore: 79,
    timeToImpact: "2–4 weeks",
    safeStatus: "Optimize carefully",
  },
  {
    id: "ppc-005",
    type: "Retargeting Gap",
    signal: "Retargeting pools are active, but model-specific sequencing still needs more structured depth",
    gap: "High-intent users are captured, but reinforcement windows are not segmented enough by behavior and model interest.",
    likelyCause: "Audience sync exists, but creative and sequence logic remain too generalized across some pools.",
    whySurfaced: [
      "7-day and 30-day audiences exist but messaging is not always model-specific",
      "PDF and model-view users are not separated enough in follow-up logic",
      "Lifecycle and paid reinforcement are not fully mirrored yet",
    ],
    expectedLift: { conservative: "+2% retargeting CVR", expected: "+5% retargeting CVR", aggressive: "+8% retargeting CVR" },
    action: "Split retargeting by model interest, inquiry stage, and PDF/form behavior, then align creative to email sequence themes.",
    owner: "PPC + Lifecycle",
    dependency: "Audience sync and asset variants",
    blocker: "Lifecycle segmentation still maturing",
    confidence: "PROBABLE",
    priority: "Next",
    priorityScore: 76,
    timeToImpact: "2–3 weeks",
    safeStatus: "Optimize carefully",
  },
  {
    id: "ppc-006",
    type: "Measurement Risk",
    signal: "Jet and higher-value paid segments still should not scale aggressively",
    gap: "Traffic quality may look strong, but close-loop truth and assisted path confidence are not yet reliable enough for broad expansion.",
    likelyCause: "Offline close feedback, call validation, and event weighting still need more discipline before the signal is safe.",
    whySurfaced: [
      "Scale safety remains selective",
      "Attribution integrity blockers still active on some premium segments",
      "Playbook doctrine says measurement integrity comes before scale",
    ],
    expectedLift: { conservative: "Risk containment", expected: "Cleaner future scale", aggressive: "Unlock premium segment expansion" },
    action: "Hold broad jet scale, keep testing conservative, and focus near-term expansion only in segments with stable conversion truth.",
    owner: "Analytics + PPC",
    dependency: "Offline conversion and call QA",
    blocker: "CRM and call feedback loop incomplete",
    confidence: "CONFIRMED",
    priority: "Now",
    priorityScore: 91,
    timeToImpact: "Immediate",
    doNotActYet: true,
    safeStatus: "Blocked by measurement",
  },
];

const campaignRows: CampaignRow[] = [
  {
    layer: "Brand Defense",
    focus: "GlobalAir terms and branded model combinations",
    spend: "$1.8K",
    cpqi: "$54",
    impressionShare: "89%",
    recommendation: "Protect. Keep always-on and maintain >85% IS.",
    confidence: "CONFIRMED",
  },
  {
    layer: "Generic High Intent",
    focus: "Aircraft for sale / planes for sale / private jets for sale",
    spend: "$4.9K",
    cpqi: "$298",
    impressionShare: "36%",
    recommendation: "Controlled coverage only. Use as audience-building and selective inquiry capture.",
    confidence: "PROBABLE",
  },
  {
    layer: "Manufacturer Segmentation",
    focus: "Cessna / Cirrus / Piper / Beechcraft campaign splits",
    spend: "$6.2K",
    cpqi: "$213",
    impressionShare: "58%",
    recommendation: "Refine and keep isolated by manufacturer; do not blend manufacturers.",
    confidence: "CONFIRMED",
  },
  {
    layer: "Model Isolation",
    focus: "Cessna 172 / SR22 / Bonanza A36 / Archer exact-match groups",
    spend: "$8.1K",
    cpqi: "$176",
    impressionShare: "72%",
    recommendation: "Primary attack layer. Scale where CVR and query quality remain stable.",
    confidence: "CONFIRMED",
  },
  {
    layer: "Selective Conquesting",
    focus: "Controller brand + model intersections",
    spend: "$1.2K",
    cpqi: "$284",
    impressionShare: "19%",
    recommendation: "Keep isolated and selective only.",
    confidence: "PROBABLE",
  },
  {
    layer: "Retargeting",
    focus: "Viewed listing / PDF / model-view / past email clickers",
    spend: "$1.6K",
    cpqi: "$132",
    impressionShare: "n/a",
    recommendation: "Deepen behavioral segmentation and align creative to model interest.",
    confidence: "PROBABLE",
  },
];

const modelRows: ModelRow[] = [
  {
    model: "Cessna 172",
    category: "Piston",
    spend: "$3.2K",
    cpqi: "$168",
    cvr: "4.7%",
    impressionShare: "74%",
    lostIS: "11% budget / 7% rank",
    auctionOverlap: "62%",
    action: "Increase budget concentration and improve landing-message alignment.",
    confidence: "CONFIRMED",
  },
  {
    model: "Cirrus SR22",
    category: "Piston",
    spend: "$2.9K",
    cpqi: "$154",
    cvr: "5.1%",
    impressionShare: "78%",
    lostIS: "8% budget / 5% rank",
    auctionOverlap: "57%",
    action: "Push toward >80% IS and protect exact-match dominance.",
    confidence: "CONFIRMED",
  },
  {
    model: "Bonanza A36",
    category: "Piston",
    spend: "$1.6K",
    cpqi: "$201",
    cvr: "4.1%",
    impressionShare: "69%",
    lostIS: "12% budget / 8% rank",
    auctionOverlap: "53%",
    action: "Scale carefully after search-term cleanup and page check.",
    confidence: "PROBABLE",
  },
  {
    model: "Piper Archer",
    category: "Piston",
    spend: "$1.1K",
    cpqi: "$236",
    cvr: "3.3%",
    impressionShare: "61%",
    lostIS: "14% budget / 10% rank",
    auctionOverlap: "48%",
    action: "Do not force scale until landing depth and inventory quality improve.",
    confidence: "PROBABLE",
  },
];

const searchTermRows: SearchTermRow[] = [
  {
    term: "cessna 172 for sale",
    bucket: "Exact high intent",
    spend: "$1.2K",
    conversions: "19",
    quality: "High",
    issue: "Headroom remains; not a leak problem.",
    action: "Maintain exact isolation and scale budget carefully.",
    confidence: "CONFIRMED",
  },
  {
    term: "learn to fly cessna 172",
    bucket: "Leakage",
    spend: "$190",
    conversions: "0",
    quality: "Low",
    issue: "Training intent entering commercial structure.",
    action: "Add training negative across generic and manufacturer layers.",
    confidence: "CONFIRMED",
  },
  {
    term: "sr22 rental",
    bucket: "Leakage",
    spend: "$136",
    conversions: "0",
    quality: "Low",
    issue: "Rental intent does not align to marketplace goal.",
    action: "Expand rental and charter exclusions.",
    confidence: "CONFIRMED",
  },
  {
    term: "bonanza a36 specs",
    bucket: "Research assist",
    spend: "$246",
    conversions: "2",
    quality: "Medium",
    issue: "Useful but should not compete with higher-intent exact groups for spend.",
    action: "Cap in research-support bucket and retarget downstream.",
    confidence: "PROBABLE",
  },
];

const retargetingRows: RetargetingRow[] = [
  {
    audience: "Viewed listing, no inquiry",
    size: "8.4K",
    window: "7-day",
    cvr: "5.6%",
    role: "Immediate recovery",
    issue: "Strong but creative is still too generic in a few clusters.",
    action: "Split by model clusters and reinforce listing depth.",
    confidence: "CONFIRMED",
  },
  {
    audience: "Downloaded PDF, no form",
    size: "2.1K",
    window: "30-day",
    cvr: "4.2%",
    role: "High-intent nurture",
    issue: "Good signal but should align more directly to spec-focused creative.",
    action: "Mirror spec and ownership themes from lifecycle email.",
    confidence: "PROBABLE",
  },
  {
    audience: "Past email clickers",
    size: "4.7K",
    window: "30-day",
    cvr: "3.8%",
    role: "Cross-channel reinforcement",
    issue: "Audience sync is active but not deeply segmented by behavior score.",
    action: "Split by model interest and score tier.",
    confidence: "PROBABLE",
  },
  {
    audience: "Model viewers 90-day",
    size: "15.3K",
    window: "90-day",
    cvr: "1.9%",
    role: "Long-cycle recall",
    issue: "Window is useful, but broad messaging causes dilution.",
    action: "Reduce generic creative and tighten category-specific variants.",
    confidence: "PROBABLE",
  },
];

const competitorRows: CompetitorRow[] = [
  {
    zone: "Head terms",
    globalAir: "24% IS",
    controller: "63% IS",
    overlap: "High",
    action: "Maintain presence, control spend, capture remarketing pools. Do not chase blanket dominance.",
    confidence: "CONFIRMED",
  },
  {
    zone: "Manufacturer terms",
    globalAir: "41% IS",
    controller: "52% IS",
    overlap: "High",
    action: "Pursue parity through tight structure, stronger landing alignment, and segment-level CVR gains.",
    confidence: "PROBABLE",
  },
  {
    zone: "Model terms",
    globalAir: "72% IS",
    controller: "78% IS",
    overlap: "Very high",
    action: "Primary attack zone. Push 70–85% dominance on top piston models.",
    confidence: "CONFIRMED",
  },
  {
    zone: "Conquesting",
    globalAir: "Selective",
    controller: "Broad",
    overlap: "Targeted",
    action: "Conquest only when landing experience is superior and model economics justify the spend.",
    confidence: "PROBABLE",
  },
];

const compareTrendData = {
  WoW: [
    { name: "Mon", value: 188 },
    { name: "Tue", value: 194 },
    { name: "Wed", value: 201 },
    { name: "Thu", value: 207 },
    { name: "Fri", value: 211 },
    { name: "Sat", value: 212 },
    { name: "Sun", value: 211 },
  ],
  MoM: [
    { name: "W1", value: 193 },
    { name: "W2", value: 199 },
    { name: "W3", value: 205 },
    { name: "W4", value: 211 },
  ],
  "90D": [
    { name: "Jan", value: 177 },
    { name: "Feb", value: 191 },
    { name: "Mar", value: 202 },
    { name: "Apr", value: 211 },
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

function safeStatusClasses(status: Opportunity["safeStatus"]) {
  if (status === "Safe to scale") return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  if (status === "Optimize carefully") return "border-amber-400/30 bg-amber-500/15 text-amber-200";
  if (status === "Diagnostic only") return "border-slate-400/30 bg-slate-500/15 text-slate-200";
  return "border-rose-400/30 bg-rose-500/15 text-rose-200";
}

function scoreClasses(score: number) {
  if (score >= 90) return "text-emerald-300";
  if (score >= 75) return "text-amber-300";
  return "text-slate-300";
}

export default function AvIntelOSPage05() {
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

  const pinned = filteredOpportunities.filter((item) => item.pinned);
  const selectedOpportunity = opportunities.find((item) => item.id === openOpportunityId) ?? null;

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
    if (view.includes("Piston")) {
      setSelectedTypes(["Model Scale Pocket", "Budget Reallocation", "Landing Mismatch"]);
      setShowPinnedOnly(true);
      setConfidenceFilter(role === "jeffrey" ? "confirmed" : "probable");
      setActiveTab("structure");
      return;
    }
    if (view.includes("Conquest") || view.includes("Pressure")) {
      setSelectedTypes(["Conquest Opportunity", "Impression Share Gap", "Measurement Risk"]);
      setShowPinnedOnly(false);
      setConfidenceFilter(role === "jeffrey" ? "confirmed" : "probable");
      setActiveTab("competitive");
      return;
    }
    if (view.includes("Budget")) {
      setSelectedTypes(["Budget Reallocation", "Model Scale Pocket", "Search Term Leakage"]);
      setShowPinnedOnly(false);
      setConfidenceFilter("probable");
      setActiveTab("queue");
      return;
    }
    setSelectedTypes(opportunityTypes);
    setShowPinnedOnly(false);
    setConfidenceFilter(role === "jeffrey" ? "confirmed" : "all");
    setActiveTab("overview");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
        <div className="mb-4 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Page structure</div>
              <div className="mt-1 text-sm text-slate-300">PPC Intelligence Command is the surgical paid-demand operating layer. It governs brand defense, manufacturer segmentation, model isolation, conquesting, retargeting, budget tiers, stop-loss rules, and high-intent share capture vs Controller.</div>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewTab)} className="w-full xl:w-auto">
              <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0 xl:w-auto">
                <TabsTrigger value="overview" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Overview</TabsTrigger>
                <TabsTrigger value="queue" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Opportunity Queue</TabsTrigger>
                <TabsTrigger value="structure" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Campaign Structure</TabsTrigger>
                <TabsTrigger value="searchterms" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Search Terms</TabsTrigger>
                <TabsTrigger value="retargeting" className="rounded-xl border border-white/10 bg-white/5 data-[state=active]:bg-sky-500/20">Retargeting</TabsTrigger>
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
                    <Crosshair className="h-4 w-4" />
                    Av/IntelOS · Page 05
                  </div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">PPC Intelligence Command</h1>
                  <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">High-intent paid demand capture, query control, model domination, brand defense, selective conquesting, and strict scale governance.</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-bold"><Target className="h-5 w-5 text-sky-300" /> PPC Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Primary offensive front</div>
                <div className="mt-2 font-semibold text-white">Model territory, especially top piston models.</div>
                <p className="mt-2 leading-6">Do not spread budget thin. Concentration on exact-match model demand is the clearest path to efficient share capture.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Operating rule</div>
                <div className="mt-2 font-semibold text-white">Measurement integrity before broad scale.</div>
                <p className="mt-2 leading-6">Piston can expand selectively. Premium segments and broader conquesting remain controlled until cleaner attribution and offline feedback are confirmed.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><Filter className="h-5 w-5 text-sky-300" /> PPC filters</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search models, campaigns, query issues" className="border-white/10 bg-slate-950/80 pl-9" />
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
                  <div><div className="text-sm font-medium text-white">Pinned only</div><div className="text-xs text-slate-400">Weekly focus stack</div></div>
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
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div><div className="text-sm font-medium text-white">Budget model</div><div className="text-xs text-slate-400">Protect / Grow / Expand / Test</div></div>
                  <Badge className="border border-emerald-400/30 bg-emerald-500/15 text-emerald-200">Tiered</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-bold"><Sparkles className="h-5 w-5 text-amber-300" /> Pinned this week</CardTitle></CardHeader>
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
          <AlertTitle>PPC governance warning</AlertTitle>
          <AlertDescription>
            Do not let generic and phrase expansion outrun query control. Broad match must remain inside controlled experiment structure, and premium-segment scale stays constrained until attribution confidence is stronger.
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
                    <CardTitle className="flex items-center gap-2 text-xl font-bold"><Zap className="h-5 w-5 text-amber-300" /> Top PPC opportunities</CardTitle>
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
                <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Radar className="h-5 w-5 text-sky-300" /> PPC qualified inquiry trend</CardTitle></CardHeader>
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
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Current compare view: <span className="font-semibold text-white">{comparePeriod}</span>. Paid decisions should prioritize high-intent share and CPQI control, not just click volume.</div>
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

        {activeTab === "structure" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Layers3 className="h-5 w-5 text-sky-300" /> Campaign architecture</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {campaignRows.map((row) => (
                  <div key={row.layer} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold text-white">{row.layer}</div>
                      <Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">{row.focus}</div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Spend</div><div className="mt-1 text-slate-200">{row.spend}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">CPQI</div><div className="mt-1 text-slate-200">{row.cpqi}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">IS</div><div className="mt-1 text-slate-200">{row.impressionShare}</div></div>
                    </div>
                    <div className="mt-3 text-sm text-slate-200">Recommendation: {row.recommendation}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Target className="h-5 w-5 text-emerald-300" /> Model domination board</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {modelRows.map((row) => (
                  <div key={row.model} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold text-white">{row.model}</div>
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.category}</Badge>
                      <Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-4 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Spend</div><div className="mt-1 text-slate-200">{row.spend}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">CPQI</div><div className="mt-1 text-slate-200">{row.cpqi}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">CVR</div><div className="mt-1 text-slate-200">{row.cvr}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">IS</div><div className="mt-1 text-slate-200">{row.impressionShare}</div></div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">Lost IS: {row.lostIS} · Auction overlap: {row.auctionOverlap}</div>
                    <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "searchterms" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Search className="h-5 w-5 text-sky-300" /> Search term governance</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {searchTermRows.map((row) => (
                  <div key={row.term} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold text-white">{row.term}</div>
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.bucket}</Badge>
                      <Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Spend</div><div className="mt-1 text-slate-200">{row.spend}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Conversions</div><div className="mt-1 text-slate-200">{row.conversions}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Quality</div><div className="mt-1 text-slate-200">{row.quality}</div></div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">Issue: {row.issue}</div>
                    <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="h-5 w-5 text-amber-300" /> Match type doctrine</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Exact match owns core high-intent keywords only. This is the primary precision layer for profitable model demand.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Phrase match expands volume only after exact-match economics and negative control are stable.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Broad match belongs in a separate experiment-only campaign. Never mix it into exact or phrase structures.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Negative governance must exclude training, jobs, RC models, parts, rentals, charter, and irrelevant historical/crash terms.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "retargeting" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Route className="h-5 w-5 text-sky-300" /> Retargeting architecture</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {retargetingRows.map((row) => (
                  <div key={`${row.audience}-${row.window}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold text-white">{row.audience}</div>
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{row.window}</Badge>
                      <Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Audience Size</div><div className="mt-1 text-slate-200">{row.size}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">CVR</div><div className="mt-1 text-slate-200">{row.cvr}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</div><div className="mt-1 text-slate-200">{row.role}</div></div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">Issue: {row.issue}</div>
                    <div className="mt-1 text-sm text-slate-200">Action: {row.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-emerald-300" /> Audience compounding rules</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Model viewers, PDF downloaders, and past email clickers should not share the same creative or timing rules.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Retargeting should mirror lifecycle themes so that email and paid reinforce the same model, ownership, and buyer-confidence narrative.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">7-day windows recover immediate demand. 30-day windows support evaluation. 90-day windows handle long-cycle recall without overbroad messaging.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Retargeting only scales if audiences are growing, frequency is controlled, and assisted progression toward inquiry remains measurable.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "competitive" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Swords className="h-5 w-5 text-sky-300" /> Controller pressure map</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {competitorRows.map((row) => (
                  <div key={row.zone} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-semibold text-white">{row.zone}</div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">GlobalAir</div><div className="mt-1 text-slate-200">{row.globalAir}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Controller</div><div className="mt-1 text-slate-200">{row.controller}</div></div>
                      <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Overlap</div><div className="mt-1 text-slate-200">{row.overlap}</div></div>
                    </div>
                    <div className="mt-2 text-sm text-slate-200">Action: {row.action}</div>
                    <div className="mt-1"><Badge className={`border ${confidenceClasses(row.confidence)}`}>{row.confidence}</Badge></div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Gauge className="h-5 w-5 text-amber-300" /> Budget layering doctrine</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Protect:</span> brand defense and top make/model exact-match demand.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Grow:</span> profitable piston models and proven high-intent non-brand groups.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Expand:</span> adjacent models and constrained conquest only when economics and landing quality justify it.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Test:</span> broad match, upper funnel, and new conquest ideas with capped budgets and explicit stop-loss rules.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "trust" && (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Lock className="h-5 w-5 text-amber-300" /> PPC data trust</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
                  <div className="font-semibold text-rose-200">Critical blockers</div>
                  <ul className="mt-2 space-y-2">
                    <li>• Premium-segment scale still limited by attribution confidence</li>
                    <li>• Offline close-loop feedback remains incomplete</li>
                    <li>• Event weighting and assisted truth still need stricter governance</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Decision rule</div>
                  <p className="mt-2 leading-6">Scale only when CVR is stable, query quality is high, impression share is still below target on profitable models, and measurement is clean enough to trust the gains.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Role-aware rendering</div>
                  <p className="mt-2 leading-6">{activeRole.label} sees {role === "jeffrey" ? "confirmed-only rendering" : "full confidence range"}. Model-specific attack zones should still outrank generic visibility goals.</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-sky-300" /> PPC action framework</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Fast wins: tighten negatives, reallocate into profitable model exact-match groups, and correct landing mismatch on important query paths.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Strategic moves: dominate top piston models, isolate conquesting, deepen retargeting segmentation, and keep brand defense structurally protected.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Blockers: premium segment attribution, incomplete offline close feedback, event weighting drift, and residual generic query leakage.</div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-slate-100 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><DollarSign className="h-5 w-5 text-emerald-300" /> Model performance comparison</CardTitle></CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelRows.map((item) => ({ name: item.model, cpqi: Number(item.cpqi.replace("$", "")), is: Number(item.impressionShare.replace("%", "")) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                  <YAxis stroke="rgba(255,255,255,0.45)" />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                  <Bar dataKey="cpqi" fill="currentColor" className="text-amber-300" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="is" fill="currentColor" className="text-sky-300" radius={[8, 8, 0, 0]} />
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
                  <SheetDescription className="text-left text-slate-400">PPC recommendation logic, blockers, and expected impact inspection drawer.</SheetDescription>
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
