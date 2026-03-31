using AvIntelOS.Api.Data;
using AvIntelOS.Api.Models.Entities;

namespace AvIntelOS.Api.Services;

public static class SeedDataService
{
    public static void Seed(AvIntelDbContext db)
    {
        if (db.Users.Any()) return;

        // -- Users --
        var casey = new User { EntraId = "casey-entra-001", DisplayName = "Casey Jones", Email = "casey@globalair.com", Role = "operator", IsActive = true };
        var clay = new User { EntraId = "clay-entra-002", DisplayName = "Clay Martin", Email = "clay@globalair.com", Role = "editor", IsActive = true };
        var jeffrey = new User { EntraId = "jeffrey-entra-003", DisplayName = "Jeffrey Carrithers", Email = "jeffrey@globalair.com", Role = "viewer", IsActive = true };
        db.Users.AddRange(casey, clay, jeffrey);
        db.SaveChanges();

        // -- User Preferences --
        db.UserPreferences.Add(new UserPreference { UserId = casey.Id, CurrentRoleView = "casey", DateRange = "30d", CompareMode = "wow", CategoryFilter = "all", SignalCleanOnly = true, ContamBannerVisible = true });
        db.SaveChanges();

        // -- Data Sources --
        db.DataSources.AddRange(
            new DataSource { SourceKey = "ga4", DisplayName = "Google Analytics 4", ConnectionStatus = "pending", SlaHours = 6, Owner = "Casey Jones" },
            new DataSource { SourceKey = "gsc", DisplayName = "Google Search Console", ConnectionStatus = "pending", SlaHours = 24, Owner = "Casey Jones" },
            new DataSource { SourceKey = "google_ads", DisplayName = "Google Ads", ConnectionStatus = "pending", SlaHours = 6, Owner = "Casey Jones" },
            new DataSource { SourceKey = "windsor", DisplayName = "Windsor.ai", ConnectionStatus = "pending", SlaHours = 24, Owner = "Casey Jones" },
            new DataSource { SourceKey = "crm", DisplayName = "CRM/Inquiry System", ConnectionStatus = "not_connected" },
            new DataSource { SourceKey = "callrail", DisplayName = "CallRail", ConnectionStatus = "pending", Owner = "Casey Jones" },
            new DataSource { SourceKey = "semrush", DisplayName = "SEMrush", ConnectionStatus = "not_connected", SlaHours = 72 },
            new DataSource { SourceKey = "spyfu", DisplayName = "SpyFu", ConnectionStatus = "not_connected", SlaHours = 72 },
            new DataSource { SourceKey = "clarity", DisplayName = "Microsoft Clarity", ConnectionStatus = "unmaintained" },
            new DataSource { SourceKey = "simpli_fi", DisplayName = "Simpli.fi", ConnectionStatus = "not_connected" },
            new DataSource { SourceKey = "email_platform", DisplayName = "Email Platform", ConnectionStatus = "pending", SlaHours = 12, Owner = "Sydney Eldridge" }
        );
        db.SaveChanges();

        // -- GA4 Property Health --
        db.Ga4PropertyHealths.Add(new Ga4PropertyHealth
        {
            PropertyId = "G-K0N37V9FEB",
            ContaminationStatus = "ACTIVE",
            ContaminationStart = new DateOnly(2023, 6, 1),
            RealEngagementRate = 69.0m,
            ReportedEngagementRate = 17.0m,
            EnhancedConversions = "UNCONFIRMED",
            ConversionSignal = "UNCONFIRMED",
            GtmServerCount = 8,
            GtmDeploymentStatus = "INCONSISTENT"
        });

        // -- GA4 Contamination Exclusions --
        db.Ga4ContaminationExclusions.Add(new Ga4ContaminationExclusion
        {
            Pattern = "Email_Open_%",
            Reason = "GA4 email open tracking pixel contamination since June 2023. Inflates session count and deflates engagement rate.",
            AddedDate = new DateOnly(2023, 6, 1),
            IsActive = true
        });

        // -- GA4 Channel Snapshots (with 8-week history for trend) --
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var channelSeeds = new[] {
            ("Organic Search", new[] { 24100, 25200, 25800, 26400, 27100, 27600, 28000, 28400 }, new[] { 72, 76, 78, 81, 83, 85, 87, 89 }, 71.2m, "PROBABLE"),
            ("Direct",         new[] { 10800, 11200, 11500, 11800, 12100, 12300, 12500, 12800 }, new[] { 34, 35, 36, 37, 38, 39, 40, 42 }, 68.5m, "PROBABLE"),
            ("Paid Search",    new[] { 7200, 7400, 7600, 7800, 7900, 8000, 8100, 8200 },        new[] { 22, 23, 24, 25, 26, 26, 27, 28 }, 64.8m, "PROBABLE"),
            ("Email",          new[] { 4800, 5000, 5100, 5200, 5300, 5400, 5500, 5600 },        new[] { 8, 9, 9, 10, 10, 11, 11, 12 },   52.1m, "POSSIBLE"),
            ("Referral",       new[] { 2600, 2700, 2800, 2900, 3000, 3000, 3100, 3200 },        new[] { 5, 6, 6, 7, 7, 7, 8, 8 },        58.3m, "PROBABLE"),
            ("Social",         new[] { 1600, 1700, 1800, 1800, 1900, 1900, 2000, 2100 },        new[] { 1, 2, 2, 2, 2, 3, 3, 3 },         45.6m, "PROBABLE")
        };
        for (int w = 0; w < 8; w++)
        {
            var date = today.AddDays(-7 * (7 - w));
            foreach (var (channel, sessions, conversions, engRate, conf) in channelSeeds)
            {
                db.Ga4ChannelSnapshots.Add(new Ga4ChannelSnapshot
                {
                    SnapshotDate = date, Channel = channel,
                    Sessions = sessions[w], Users = (int)(sessions[w] * 0.75),
                    EngagementRate = engRate, Conversions = conversions[w],
                    ConfidenceLevel = conf, DataSource = "seed"
                });
            }
        }

        // -- Ads Campaign Snapshots (with 8-week history for trend) --
        var adsSeeds = new[] {
            ("Cessna (Piston)",    new[] { 1800, 1900, 1950, 2000, 2050, 2100, 2200, 2250 }, new[] { 640, 660, 680, 700, 720, 740, 760, 792 }, new[] { 15200, 15600, 16000, 16200, 16400, 16800, 17200, 18400 }, new[] { 8, 9, 9, 10, 10, 11, 11, 12 }),
            ("Beechcraft (Piston)", new[] { 1800, 1850, 1900, 1950, 2000, 2050, 2100, 2250 }, new[] { 560, 580, 600, 620, 640, 650, 660, 684 }, new[] { 13800, 14200, 14600, 15000, 15200, 15600, 15800, 16200 }, new[] { 6, 7, 7, 7, 8, 8, 9, 9 }),
            ("Cirrus (Piston)",    new[] { 1800, 1850, 1900, 1950, 2000, 2100, 2150, 2250 }, new[] { 600, 620, 640, 660, 680, 700, 720, 756 }, new[] { 13200, 13600, 14000, 14200, 14600, 15000, 15400, 15800 }, new[] { 7, 8, 8, 9, 9, 10, 10, 11 })
        };
        for (int w = 0; w < 8; w++)
        {
            var date = today.AddDays(-7 * (7 - w));
            foreach (var (campaign, spend, clicks, impressions, conversions) in adsSeeds)
            {
                db.AdsCampaignSnapshots.Add(new AdsCampaignSnapshot
                {
                    SnapshotDate = date, CampaignName = campaign,
                    Spend = spend[w], Clicks = clicks[w], Impressions = impressions[w],
                    Conversions = conversions[w], CampaignStatus = "Active", Category = "piston",
                    ImpressionShare = 38m + w * 0.5m,
                    ConfidenceLevel = "PROBABLE", DataSource = "seed"
                });
            }
            // Jets on hold — zero conversions throughout
            db.AdsCampaignSnapshots.Add(new AdsCampaignSnapshot
            {
                SnapshotDate = date, CampaignName = "Jets",
                Spend = 0, Clicks = 0, Impressions = 0, Conversions = 0,
                CampaignStatus = "On Hold", Category = "jet",
                ConfidenceLevel = "CONFIRMED", DataSource = "seed"
            });
        }

        // -- GA4 Landing Pages --
        db.Ga4LandingPages.AddRange(
            new Ga4LandingPage { SnapshotDate = today, PagePath = "/helicopters-for-sale", Sessions = 4200, BounceRate = 32m, AvgTimeSeconds = 185m, Conversions = 18, Category = "helicopter", ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new Ga4LandingPage { SnapshotDate = today, PagePath = "/cessna-aircraft-for-sale", Sessions = 3800, BounceRate = 35m, AvgTimeSeconds = 162m, Conversions = 14, Category = "piston", ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new Ga4LandingPage { SnapshotDate = today, PagePath = "/private-jets-for-sale", Sessions = 3200, BounceRate = 41m, AvgTimeSeconds = 148m, Conversions = 8, Category = "jet", ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new Ga4LandingPage { SnapshotDate = today, PagePath = "/beechcraft-for-sale", Sessions = 2100, BounceRate = 38m, AvgTimeSeconds = 155m, Conversions = 6, Category = "piston", ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new Ga4LandingPage { SnapshotDate = today, PagePath = "/turboprop-aircraft", Sessions = 1800, BounceRate = 36m, AvgTimeSeconds = 170m, Conversions = 5, Category = "turboprop", ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new Ga4LandingPage { SnapshotDate = today, PagePath = "/spec", Sessions = 6400, BounceRate = 68m, AvgTimeSeconds = 42m, Conversions = 0, Category = "other", ConfidenceLevel = "CONFIRMED", DataSource = "seed" }
        );

        // -- GA4 Events --
        db.Ga4Events.AddRange(
            new Ga4Event { SnapshotDate = today, EventName = "page_view", EventCount = 142000, Tier = 1, IsContaminated = false, ConfidenceLevel = "CONFIRMED", DataSource = "seed" },
            new Ga4Event { SnapshotDate = today, EventName = "scroll", EventCount = 89000, Tier = 2, IsContaminated = false, ConfidenceLevel = "CONFIRMED", DataSource = "seed" },
            new Ga4Event { SnapshotDate = today, EventName = "click", EventCount = 34000, Tier = 1, IsContaminated = false, ConfidenceLevel = "CONFIRMED", DataSource = "seed" },
            new Ga4Event { SnapshotDate = today, EventName = "form_submit", EventCount = 2400, Tier = 1, IsContaminated = false, ConfidenceLevel = "CONFIRMED", DataSource = "seed" },
            new Ga4Event { SnapshotDate = today, EventName = "Email_Open_avblast", EventCount = 48000, Tier = 3, IsContaminated = true, ConfidenceLevel = "CONFIRMED", DataSource = "seed" },
            new Ga4Event { SnapshotDate = today, EventName = "Email_Open_brokernet", EventCount = 22000, Tier = 3, IsContaminated = true, ConfidenceLevel = "CONFIRMED", DataSource = "seed" }
        );

        // -- GSC Portfolio Summary --
        db.GscPortfolioSummaries.Add(new GscPortfolioSummary
        {
            SnapshotDate = today, TotalKeywords = 201432, MonthlyClicks = 157200, AvgPosition = 24.8m, AvgCtr = 2.1m,
            ConfidenceLevel = "CONFIRMED", DataSource = "api_direct"
        });

        // -- GSC Query Snapshots --
        db.GscQuerySnapshots.AddRange(
            new GscQuerySnapshot { SnapshotDate = today, Query = "helicopters for sale", Clicks = 4200, Impressions = 120000, AvgPosition = 1.8m, Category = "helicopter", ConfidenceLevel = "CONFIRMED", DataSource = "api_direct" },
            new GscQuerySnapshot { SnapshotDate = today, Query = "cessna for sale", Clicks = 3100, Impressions = 98000, AvgPosition = 3.2m, Category = "piston", ConfidenceLevel = "CONFIRMED", DataSource = "api_direct" },
            new GscQuerySnapshot { SnapshotDate = today, Query = "private jets for sale", Clicks = 2800, Impressions = 165000, AvgPosition = 4.1m, Category = "jet", ConfidenceLevel = "CONFIRMED", DataSource = "api_direct" },
            new GscQuerySnapshot { SnapshotDate = today, Query = "beechcraft bonanza for sale", Clicks = 1900, Impressions = 42000, AvgPosition = 2.4m, Category = "piston", ConfidenceLevel = "CONFIRMED", DataSource = "api_direct" },
            new GscQuerySnapshot { SnapshotDate = today, Query = "turboprop for sale", Clicks = 1200, Impressions = 38000, AvgPosition = 5.8m, Category = "turboprop", ConfidenceLevel = "CONFIRMED", DataSource = "api_direct" }
        );

        // (Ads campaign snapshots seeded in 8-week history loop above)

        // -- Ads Search Terms --
        db.AdsSearchTerms.AddRange(
            new AdsSearchTerm { SnapshotDate = today, SearchTerm = "cessna citation jet price", CampaignName = "Cessna (Piston)", Impressions = 3200, Clicks = 84, Spend = 218m, Conversions = 0, WasteReason = "Jet intent — piston campaign", Action = "Add Negative", ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new AdsSearchTerm { SnapshotDate = today, SearchTerm = "free aircraft listings", CampaignName = "Cessna (Piston)", Impressions = 2800, Clicks = 72, Spend = 187m, Conversions = 0, WasteReason = "Non-buyer intent", Action = "Add Negative", ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new AdsSearchTerm { SnapshotDate = today, SearchTerm = "cessna 182 for sale", CampaignName = "Cessna (Piston)", Impressions = 8200, Clicks = 312, Spend = 812m, Conversions = 8, WasteReason = null, Action = "Keep", ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new AdsSearchTerm { SnapshotDate = today, SearchTerm = "beechcraft bonanza price", CampaignName = "Beechcraft (Piston)", Impressions = 5600, Clicks = 198, Spend = 515m, Conversions = 5, WasteReason = null, Action = "Keep", ConfidenceLevel = "PROBABLE", DataSource = "seed" }
        );

        // -- Ads Auction Insights --
        db.AdsAuctionInsights.AddRange(
            new AdsAuctionInsight { WeekStart = new DateOnly(2026, 3, 3), Competitor = "Controller.com", ImpressionShare = 42.1m, OverlapRate = 68.2m, PositionAboveRate = 31.5m, ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new AdsAuctionInsight { WeekStart = new DateOnly(2026, 3, 10), Competitor = "Controller.com", ImpressionShare = 40.8m, OverlapRate = 69.1m, PositionAboveRate = 33.2m, ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new AdsAuctionInsight { WeekStart = new DateOnly(2026, 3, 17), Competitor = "Controller.com", ImpressionShare = 43.5m, OverlapRate = 67.8m, PositionAboveRate = 30.1m, ConfidenceLevel = "PROBABLE", DataSource = "seed" }
        );

        // -- PPC Waste Analysis --
        db.PpcWasteAnalyses.Add(new PpcWasteAnalysis
        {
            SnapshotDate = today, TotalSpend = 6750m, IrrelevantSpend = 1512m, WastedClicks = 487,
            NegativeKwCoveragePct = 34.2m, NegativesAddedCount = 86, ConfidenceLevel = "PROBABLE", DataSource = "seed"
        });

        // -- Opportunities --
        db.Opportunities.AddRange(
            new Opportunity { Domain = "seo", Title = "Helicopter Hub Expansion", Description = "Helicopter category dominates in rank stability (94.2%) and repeat audience (44.7%). Build model hubs to capture demand.", PriorityScore = 82, ExpectedLift = "+15-25% helicopter QI", TimeToImpact = "4-8 weeks", OwnerName = "Casey Jones", Status = "open", PriorityLabel = "now", ScaleSafety = "scale", ConfidenceLevel = "CONFIRMED", DataSource = "seed" },
            new Opportunity { Domain = "ppc", Title = "Piston Search Term Waste Reduction", Description = "22.4% waste rate on piston campaigns. 487 wasted clicks/month at $1,512 irrelevant spend.", PriorityScore = 78, ExpectedLift = "-$1,000/mo waste", TimeToImpact = "1-2 weeks", OwnerName = "Casey Jones", Status = "open", PriorityLabel = "now", ScaleSafety = "optimize_carefully", ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new Opportunity { Domain = "measurement", Title = "GA4 Contamination Resolution", Description = "Email_Open_ contamination active since June 2023. Real engagement ~69% vs reported ~17%.", PriorityScore = 75, ExpectedLift = "Measurement integrity", TimeToImpact = "2-4 weeks", OwnerName = "Casey Jones", Blocker = "GTM deployment across 8 servers", Status = "open", PriorityLabel = "now", ScaleSafety = "diagnostic_only", ConfidenceLevel = "CONFIRMED", DataSource = "seed" },
            new Opportunity { Domain = "broker", Title = "At-Risk Broker Retention", Description = "Premier Aircraft Sales (risk score 62) renewal April 30. Declining inquiries + 45% utilization.", PriorityScore = 88, ExpectedLift = "Save $14,600 ARR", TimeToImpact = "Immediate", OwnerName = "Casey Jones", Status = "in_progress", PriorityLabel = "now", ScaleSafety = "optimize_carefully", ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new Opportunity { Domain = "content", Title = "Evergreen Content Rebalance", Description = "100% reactive content (news). Need 80/20 buyer-intent mix. 0 evergreen articles/week.", PriorityScore = 71, ExpectedLift = "+20% content-assisted QI", TimeToImpact = "6-12 weeks", OwnerName = "Casey Jones", Status = "open", PriorityLabel = "next", ScaleSafety = "scale", ConfidenceLevel = "CONFIRMED", DataSource = "seed" }
        );

        // -- Competitive Benchmarks --
        db.CompetitiveBenchmarks.AddRange(
            new CompetitiveBenchmark { Category = "Jets", DefensibilityScore = 74, RankStability = 82.1m, CpcPressure = "High", ContentDepth = 14, ListingDepth = 4280, RepeatAudiencePct = 38.4m, Trend = "stable", ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new CompetitiveBenchmark { Category = "Turboprops", DefensibilityScore = 68, RankStability = 76.4m, CpcPressure = "Medium", ContentDepth = 8, ListingDepth = 1240, RepeatAudiencePct = 32.1m, Trend = "rising", ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new CompetitiveBenchmark { Category = "Piston Single", DefensibilityScore = 41, RankStability = 52.8m, CpcPressure = "High", ContentDepth = 3, ListingDepth = 890, RepeatAudiencePct = 24.6m, Trend = "falling", ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new CompetitiveBenchmark { Category = "Piston Multi", DefensibilityScore = 46, RankStability = 58.2m, CpcPressure = "Medium", ContentDepth = 2, ListingDepth = 420, RepeatAudiencePct = 21.8m, Trend = "falling", ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new CompetitiveBenchmark { Category = "Helicopters", DefensibilityScore = 88, RankStability = 94.2m, CpcPressure = "Low", ContentDepth = 22, ListingDepth = 1860, RepeatAudiencePct = 44.7m, Trend = "rising", ConfidenceLevel = "CONFIRMED", DataSource = "seed" },
            new CompetitiveBenchmark { Category = "Warbirds / Experimental", DefensibilityScore = 56, RankStability = 64.8m, CpcPressure = "Low", ContentDepth = 6, ListingDepth = 340, RepeatAudiencePct = 28.3m, Trend = "stable", ConfidenceLevel = "POSSIBLE", DataSource = "seed" }
        );

        // -- Competitive Features --
        db.CompetitiveFeatures.AddRange(
            new CompetitiveFeature { FeatureName = "BrokerNet", GlobalairHas = true, ControllerHas = false, Advantage = "globalair" },
            new CompetitiveFeature { FeatureName = "Verified Listings", GlobalairHas = true, ControllerHas = false, Advantage = "globalair" },
            new CompetitiveFeature { FeatureName = "Editorial Content", GlobalairHas = true, ControllerHas = false, Advantage = "globalair" },
            new CompetitiveFeature { FeatureName = "AEO Optimization", GlobalairHas = false, ControllerHas = false, Advantage = "none" },
            new CompetitiveFeature { FeatureName = "Geofencing (Simpli.fi)", GlobalairHas = true, ControllerHas = false, Advantage = "globalair" },
            new CompetitiveFeature { FeatureName = "Airport Resource Center", GlobalairHas = true, ControllerHas = false, Advantage = "globalair" },
            new CompetitiveFeature { FeatureName = "Listing Volume", GlobalairHas = false, ControllerHas = true, Advantage = "controller" },
            new CompetitiveFeature { FeatureName = "Budget (estimated)", GlobalairHas = false, ControllerHas = true, Advantage = "controller" }
        );

        // -- Content Pillars --
        db.ContentPillars.AddRange(
            new ContentPillar { PillarName = "Aircraft Buying Guides", TargetMixPct = 30.0m, PillarType = "evergreen", IsActive = true },
            new ContentPillar { PillarName = "Market Analysis", TargetMixPct = 15.0m, PillarType = "evergreen", IsActive = true },
            new ContentPillar { PillarName = "Operating Costs & Ownership", TargetMixPct = 20.0m, PillarType = "evergreen", IsActive = true },
            new ContentPillar { PillarName = "Aviation Lifestyle", TargetMixPct = 15.0m, PillarType = "evergreen", IsActive = true },
            new ContentPillar { PillarName = "News & Intelligence", TargetMixPct = 20.0m, PillarType = "news", IsActive = true }
        );
        db.SaveChanges();

        // -- Content Articles --
        db.ContentArticles.AddRange(
            new ContentArticle { Title = "How to Buy a Used Cessna 172", UrlPath = "/articles/buy-used-cessna-172", PillarId = 1, Category = "piston", Sessions30d = 800, EngagementRate = 82.1m, Conversions30d = 3, HasCtaModule = true, CtaCtr = 4.2m, ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new ContentArticle { Title = "Helicopter Market Outlook 2026", UrlPath = "/articles/helicopter-market-2026", PillarId = 2, Category = "helicopter", Sessions30d = 1200, EngagementRate = 71.4m, Conversions30d = 2, HasCtaModule = true, CtaCtr = 3.1m, ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new ContentArticle { Title = "Beechcraft Bonanza Operating Costs", UrlPath = "/articles/bonanza-operating-costs", PillarId = 3, Category = "piston", Sessions30d = 600, EngagementRate = 78.9m, Conversions30d = 2, HasCtaModule = false, ConfidenceLevel = "PROBABLE", DataSource = "seed" }
        );

        // -- Email Servers --
        db.EmailServers.AddRange(
            new EmailServer { ServerHostname = "mail.aircraft-listings.com", Purpose = "Legacy broadcast", Status = "active", SpfStatus = "unknown", DkimStatus = "unknown", DmarcStatus = "unknown" },
            new EmailServer { ServerHostname = "bms2.aircraft-listings.com", Purpose = "BrokerNet sends", Status = "active", SpfStatus = "unknown", DkimStatus = "unknown", DmarcStatus = "unknown" },
            new EmailServer { ServerHostname = "bms4.aircraft-listings.com", Purpose = "BrokerNet sends", Status = "active", SpfStatus = "unknown", DkimStatus = "unknown", DmarcStatus = "unknown" },
            new EmailServer { ServerHostname = "mail.globalair.com", Purpose = "Primary sends", Status = "active", SpfStatus = "unknown", DkimStatus = "unknown", DmarcStatus = "unknown" },
            new EmailServer { ServerHostname = "mail2.globalair.com", Purpose = "Overflow/secondary", Status = "active", SpfStatus = "unknown", DkimStatus = "unknown", DmarcStatus = "unknown" },
            new EmailServer { ServerHostname = "mail.ganmail.com", Purpose = "Internal (GanMail)", Status = "active", SpfStatus = "N/A", DkimStatus = "N/A", DmarcStatus = "N/A" }
        );

        // -- Email Sequences --
        db.EmailSequences.AddRange(
            new EmailSequence { SequenceName = "New Inquiry Follow-Up", TriggerBehavior = "Form submission on listing page", AudienceSegment = "New inquirers", AudienceSize = 0, ScoreRange = "1-25", EmailCount = 3, Objective = "Convert inquiry to engagement", Status = "missing", ConfidenceLevel = "CONFIRMED" },
            new EmailSequence { SequenceName = "Stale Lead Re-engagement", TriggerBehavior = "No activity 30+ days", AudienceSegment = "Cold leads", AudienceSize = 0, ScoreRange = "1-50", EmailCount = 5, Objective = "Reactivate dormant leads", Status = "missing", ConfidenceLevel = "CONFIRMED" },
            new EmailSequence { SequenceName = "Broker Onboarding", TriggerBehavior = "New broker account creation", AudienceSegment = "New brokers", AudienceSize = 0, ScoreRange = "N/A", EmailCount = 4, Objective = "Drive feature adoption", Status = "planned", ConfidenceLevel = "CONFIRMED" }
        );

        // -- Revenue Streams --
        db.RevenueStreams.AddRange(
            new RevenueStream { StreamName = "Aircraft Listings", Amount = 198000m, PctOfTotal = 48.1m, Trend = "up", Period = "monthly", ConfidenceLevel = "POSSIBLE", DataSource = "seed" },
            new RevenueStream { StreamName = "Featured Placements", Amount = 87000m, PctOfTotal = 21.1m, Trend = "up", Period = "monthly", ConfidenceLevel = "POSSIBLE", DataSource = "seed" },
            new RevenueStream { StreamName = "Display Advertising", Amount = 52000m, PctOfTotal = 12.6m, Trend = "flat", Period = "monthly", ConfidenceLevel = "POSSIBLE", DataSource = "seed" },
            new RevenueStream { StreamName = "BrokerNet Subscriptions", Amount = 41000m, PctOfTotal = 10.0m, Trend = "up", Period = "monthly", ConfidenceLevel = "POSSIBLE", DataSource = "seed" },
            new RevenueStream { StreamName = "Sponsorships & Events", Amount = 22000m, PctOfTotal = 5.3m, Trend = "up", Period = "monthly", ConfidenceLevel = "POSSIBLE", DataSource = "seed" },
            new RevenueStream { StreamName = "FBO/Airport Services", Amount = 12000m, PctOfTotal = 2.9m, Trend = "flat", Period = "monthly", ConfidenceLevel = "POSSIBLE", DataSource = "seed" }
        );

        // -- Brokers --
        db.Brokers.AddRange(
            new Broker { BrokerName = "Elliott Aviation", CategoryMix = "Jets, Turboprop", Tier = "Premium", InquiryVolume30d = 48, InquiryQualityScore = 88, ListingQualityScore = 92, PackageUtilizationPct = 91m, RevenueCurrent = 28500m, RevenuePrior = 27200m, RevenueTrend = "up", RenewalDate = new DateOnly(2026, 6, 15), HealthScore = 89, RiskScore = 12, ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new Broker { BrokerName = "JetAviva", CategoryMix = "Jets", Tier = "Standard", InquiryVolume30d = 36, InquiryQualityScore = 82, ListingQualityScore = 87, PackageUtilizationPct = 85m, RevenueCurrent = 18200m, RevenuePrior = 17900m, RevenueTrend = "up", RenewalDate = new DateOnly(2026, 7, 20), HealthScore = 84, RiskScore = 8, ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new Broker { BrokerName = "Premier Aircraft Sales", CategoryMix = "Piston", Tier = "Standard", InquiryVolume30d = 22, InquiryQualityScore = 64, ListingQualityScore = 58, PackageUtilizationPct = 45m, RevenueCurrent = 14600m, RevenuePrior = 16800m, RevenueTrend = "declining", RenewalDate = new DateOnly(2026, 4, 30), HealthScore = 42, RiskScore = 62, ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new Broker { BrokerName = "Wipaire Inc", CategoryMix = "Piston, Amphibious", Tier = "Basic", InquiryVolume30d = 15, InquiryQualityScore = 71, ListingQualityScore = 65, PackageUtilizationPct = 52m, RevenueCurrent = 8400m, RevenuePrior = 9100m, RevenueTrend = "declining", RenewalDate = new DateOnly(2026, 5, 15), HealthScore = 51, RiskScore = 48, ConfidenceLevel = "PROBABLE", DataSource = "seed" },
            new Broker { BrokerName = "Helistream", CategoryMix = "Helicopter", Tier = "Standard", InquiryVolume30d = 28, InquiryQualityScore = 78, ListingQualityScore = 81, PackageUtilizationPct = 68m, RevenueCurrent = 12800m, RevenuePrior = 13200m, RevenueTrend = "flat", RenewalDate = new DateOnly(2026, 8, 1), HealthScore = 72, RiskScore = 22, ConfidenceLevel = "PROBABLE", DataSource = "seed" }
        );
        db.SaveChanges();

        // -- Broker Renewal Risk --
        db.BrokerRenewalRisks.AddRange(
            new BrokerRenewalRisk { BrokerId = db.Brokers.First(b => b.BrokerName == "Premier Aircraft Sales").Id, RenewalDate = new DateOnly(2026, 4, 30), InquiryTrend = "declining", VisibilityTrend = "declining", UtilizationTrend = "declining", RiskScore = 62, PrimaryReason = "Declining inquiries + low utilization", ConfidenceLevel = "PROBABLE" },
            new BrokerRenewalRisk { BrokerId = db.Brokers.First(b => b.BrokerName == "Wipaire Inc").Id, RenewalDate = new DateOnly(2026, 5, 15), InquiryTrend = "flat", VisibilityTrend = "declining", UtilizationTrend = "declining", RiskScore = 48, PrimaryReason = "Declining visibility + underusing premium features", ConfidenceLevel = "PROBABLE" }
        );

        // -- Execution Items --
        db.ExecutionItems.AddRange(
            new ExecutionItem { ItemType = "constraint", Title = "Conversion Signal Unconfirmed", Description = "Cannot confirm GA4 conversion actions are tracking correctly. Blocks scaling.", Status = "open", Severity = "critical", PriorityScore = 95, PriorityLabel = "now", OwnerName = "Casey Jones", ConfidenceLevel = "CONFIRMED" },
            new ExecutionItem { ItemType = "constraint", Title = "Call Tracking Not Active", Description = "~90% of buyer activity is phone. No call tracking = blind spot.", Status = "open", Severity = "critical", PriorityScore = 90, PriorityLabel = "now", OwnerName = "Casey Jones", ConfidenceLevel = "CONFIRMED" },
            new ExecutionItem { ItemType = "blocker", Title = "CRM Pipeline Not Connected", Description = "gclid/UTM capture in CRM awaiting dev. Blocks offline conversion loop.", Status = "open", Severity = "critical", PriorityScore = 88, PriorityLabel = "now", OwnerName = "Clay Martin", ConfidenceLevel = "CONFIRMED" },
            new ExecutionItem { ItemType = "blocker", Title = "Jets Campaign On Hold", Description = "No jets PPC until piston conversion signal validated.", Status = "open", Severity = "warning", PriorityScore = 70, PriorityLabel = "next", OwnerName = "Casey Jones", ConfidenceLevel = "CONFIRMED" },
            new ExecutionItem { ItemType = "initiative", Title = "Content Strategy Redirect", Description = "Shift from 100% news to 80/20 buyer-intent mix. Brief Jadda with keyword strategy.", Status = "in_progress", PriorityScore = 75, PriorityLabel = "now", ScaleSafety = "scale", ExpectedLift = "+20% content-assisted QI", OwnerName = "Casey Jones", ConfidenceLevel = "CONFIRMED" },
            new ExecutionItem { ItemType = "quarterly_priority", Title = "AERO 2026 Campaign", Description = "Pre-event outreach, on-site execution, post-event follow-up for AERO April 22-25.", Status = "in_progress", PriorityScore = 80, PriorityLabel = "now", Quarter = "Q2-2026", ScaleSafety = "controlled_launch", OwnerName = "Casey Jones", ConfidenceLevel = "CONFIRMED" }
        );

        // -- SEO Plays --
        db.SeoPlays.AddRange(
            new SeoPlay { PlayTitle = "Helicopter Model Hub Build", Description = "Build hub pages for top helicopter models. Category dominance position (88 defensibility).", Category = "helicopter", PriorityScore = 85, Status = "active", PriorityLabel = "now", OwnerName = "Casey Jones", ImpactDescription = "Protect and extend helicopter category dominance", ConfidenceLevel = "CONFIRMED" },
            new SeoPlay { PlayTitle = "Piston Category Defense", Description = "Piston single/multi defensibility scores 41/46 — falling. Needs model hub content + internal linking.", Category = "piston", PriorityScore = 78, Status = "proposed", PriorityLabel = "now", OwnerName = "Casey Jones", ImpactDescription = "Stabilize declining piston category position", ConfidenceLevel = "PROBABLE" },
            new SeoPlay { PlayTitle = "AEO / LLM Optimization", Description = "No llms.txt, AI crawlers blocked. Unblock and build structured data for AI answer engines.", Category = "technical", PriorityScore = 65, Status = "proposed", PriorityLabel = "next", OwnerName = "Thomas Galla", ImpactDescription = "Future-proof against AI-driven search", ConfidenceLevel = "PROBABLE" }
        );

        // -- SEO Model Hubs --
        db.SeoModelHubs.AddRange(
            new SeoModelHub { Make = "Robinson", Model = "R44", Category = "helicopter", HubStatus = "live_strong", ContentGaps = "Comparison page needed", BuildUrgency = "later", ConfidenceLevel = "CONFIRMED" },
            new SeoModelHub { Make = "Bell", Model = "206", Category = "helicopter", HubStatus = "live_moderate", ContentGaps = "Ownership costs, comparison", BuildUrgency = "next", ConfidenceLevel = "PROBABLE" },
            new SeoModelHub { Make = "Cessna", Model = "172", Category = "piston", HubStatus = "live_thin", ContentGaps = "Full hub rebuild needed", BuildUrgency = "now", ConfidenceLevel = "PROBABLE" },
            new SeoModelHub { Make = "Cessna", Model = "182", Category = "piston", HubStatus = "planned", ContentGaps = "All pages needed", BuildUrgency = "now", ConfidenceLevel = "PROBABLE" },
            new SeoModelHub { Make = "Beechcraft", Model = "Bonanza", Category = "piston", HubStatus = "live_thin", ContentGaps = "Research + comparison pages", BuildUrgency = "now", ConfidenceLevel = "PROBABLE" }
        );

        // -- Alerts --
        db.Alerts.AddRange(
            new Alert { AlertType = "contamination", Severity = "critical", Module = "ga4", Title = "GA4 Email_Open_ Contamination Active", Description = "Email_Open_ events contaminating engagement rate since June 2023. Real: ~69%, Reported: ~17%.", IsResolved = false },
            new Alert { AlertType = "sla_breach", Severity = "warning", Module = "data_health", Title = "GA4 Data Source Pending", Description = "GA4 connector status is 'pending' — no live data flowing.", IsResolved = false },
            new Alert { AlertType = "risk", Severity = "critical", Module = "broker", Title = "Premier Aircraft Sales At-Risk", Description = "Risk score 62. Renewal April 30. Declining inquiries and 45% utilization.", IsResolved = false },
            new Alert { AlertType = "integrity", Severity = "warning", Module = "measurement", Title = "Conversion Signal Unconfirmed", Description = "Cannot scale PPC without confirmed conversion tracking.", IsResolved = false }
        );

        db.SaveChanges();
    }
}
