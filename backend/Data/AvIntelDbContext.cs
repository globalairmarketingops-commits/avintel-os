using Microsoft.EntityFrameworkCore;
using AvIntelOS.Api.Models.Entities;

namespace AvIntelOS.Api.Data;

public class AvIntelDbContext : DbContext
{
    public AvIntelDbContext(DbContextOptions<AvIntelDbContext> options) : base(options) { }

    // ── Core ──────────────────────────────────────────────
    public DbSet<User> Users => Set<User>();
    public DbSet<UserPreference> UserPreferences => Set<UserPreference>();
    public DbSet<DataSource> DataSources => Set<DataSource>();
    public DbSet<IngestionLog> IngestionLogs => Set<IngestionLog>();
    public DbSet<SystemHealthCheck> SystemHealthChecks => Set<SystemHealthCheck>();

    // ── GA4 ───────────────────────────────────────────────
    public DbSet<Ga4ChannelSnapshot> Ga4ChannelSnapshots => Set<Ga4ChannelSnapshot>();
    public DbSet<Ga4LandingPage> Ga4LandingPages => Set<Ga4LandingPage>();
    public DbSet<Ga4Event> Ga4Events => Set<Ga4Event>();
    public DbSet<Ga4PropertyHealth> Ga4PropertyHealths => Set<Ga4PropertyHealth>();
    public DbSet<Ga4ContaminationExclusion> Ga4ContaminationExclusions => Set<Ga4ContaminationExclusion>();

    // ── GSC ───────────────────────────────────────────────
    public DbSet<GscQuerySnapshot> GscQuerySnapshots => Set<GscQuerySnapshot>();
    public DbSet<GscPageSnapshot> GscPageSnapshots => Set<GscPageSnapshot>();
    public DbSet<GscPortfolioSummary> GscPortfolioSummaries => Set<GscPortfolioSummary>();

    // ── Ads ───────────────────────────────────────────────
    public DbSet<AdsCampaignSnapshot> AdsCampaignSnapshots => Set<AdsCampaignSnapshot>();
    public DbSet<AdsAdGroupSnapshot> AdsAdGroupSnapshots => Set<AdsAdGroupSnapshot>();
    public DbSet<AdsSearchTerm> AdsSearchTerms => Set<AdsSearchTerm>();
    public DbSet<AdsAuctionInsight> AdsAuctionInsights => Set<AdsAuctionInsight>();

    // ── Opportunities & Competition ───────────────────────
    public DbSet<Opportunity> Opportunities => Set<Opportunity>();
    public DbSet<OpportunitySignal> OpportunitySignals => Set<OpportunitySignal>();
    public DbSet<CompetitiveBenchmark> CompetitiveBenchmarks => Set<CompetitiveBenchmark>();
    public DbSet<CompetitiveFeature> CompetitiveFeatures => Set<CompetitiveFeature>();

    // ── Content ───────────────────────────────────────────
    public DbSet<ContentPillar> ContentPillars => Set<ContentPillar>();
    public DbSet<ContentArticle> ContentArticles => Set<ContentArticle>();
    public DbSet<ContentRefreshQueue> ContentRefreshQueues => Set<ContentRefreshQueue>();

    // ── SEO ───────────────────────────────────────────────
    public DbSet<SeoPlay> SeoPlays => Set<SeoPlay>();
    public DbSet<SeoModelHub> SeoModelHubs => Set<SeoModelHub>();

    // ── PPC ───────────────────────────────────────────────
    public DbSet<PpcWasteAnalysis> PpcWasteAnalyses => Set<PpcWasteAnalysis>();
    public DbSet<PpcNegativeKeyword> PpcNegativeKeywords => Set<PpcNegativeKeyword>();

    // ── Email ─────────────────────────────────────────────
    public DbSet<EmailSequence> EmailSequences => Set<EmailSequence>();
    public DbSet<EmailPerformance> EmailPerformances => Set<EmailPerformance>();
    public DbSet<EmailServer> EmailServers => Set<EmailServer>();

    // ── Revenue & Brokers ─────────────────────────────────
    public DbSet<RevenueStream> RevenueStreams => Set<RevenueStream>();
    public DbSet<Broker> Brokers => Set<Broker>();
    public DbSet<BrokerHealthSnapshot> BrokerHealthSnapshots => Set<BrokerHealthSnapshot>();
    public DbSet<BrokerRenewalRisk> BrokerRenewalRisks => Set<BrokerRenewalRisk>();
    public DbSet<AdvertiserAccount> AdvertiserAccounts => Set<AdvertiserAccount>();

    // ── Listings & Market ─────────────────────────────────
    public DbSet<Listing> Listings => Set<Listing>();
    public DbSet<MarketDemandModel> MarketDemandModels => Set<MarketDemandModel>();
    public DbSet<MarketDemandCategory> MarketDemandCategories => Set<MarketDemandCategory>();

    // ── Alerts ────────────────────────────────────────────
    public DbSet<AlertRule> AlertRules => Set<AlertRule>();
    public DbSet<Alert> Alerts => Set<Alert>();

    // ── Execution ─────────────────────────────────────────
    public DbSet<ExecutionItem> ExecutionItems => Set<ExecutionItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ════════════════════════════════════════════════════
        // CORE TABLES
        // ════════════════════════════════════════════════════

        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Role).HasDefaultValue("viewer");
            e.Property(x => x.IsActive).HasDefaultValue(true);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<UserPreference>(e =>
        {
            e.ToTable("user_preferences");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.UserId).IsUnique();
            e.HasOne(x => x.User)
                .WithOne(x => x.UserPreference)
                .HasForeignKey<UserPreference>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DataSource>(e =>
        {
            e.ToTable("data_sources");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.SourceKey).IsUnique();
            e.Property(x => x.ConnectionStatus).HasDefaultValue("not_connected");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<IngestionLog>(e =>
        {
            e.ToTable("ingestion_logs");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.SourceId, x.StartedAt });
            e.HasOne(x => x.DataSource)
                .WithMany(x => x.IngestionLogs)
                .HasForeignKey(x => x.SourceId)
                .OnDelete(DeleteBehavior.Cascade);
            e.Property(x => x.StartedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<SystemHealthCheck>(e =>
        {
            e.ToTable("system_health_checks");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.CheckName);
            e.Property(x => x.LastChecked).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ════════════════════════════════════════════════════
        // GA4 TABLES
        // ════════════════════════════════════════════════════

        modelBuilder.Entity<Ga4ChannelSnapshot>(e =>
        {
            e.ToTable("ga4_channel_snapshots");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.SnapshotDate, x.Channel }).IsUnique();
            e.Property(x => x.QiPer100Sessions)
                .HasComputedColumnSql(
                    "CASE WHEN sessions > 0 THEN CAST(conversions AS DECIMAL(10,4)) / sessions * 100 ELSE 0 END",
                    stored: true);
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("CONFIRMED");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Ga4LandingPage>(e =>
        {
            e.ToTable("ga4_landing_pages");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.SnapshotDate, x.PagePath }).IsUnique();
            e.Property(x => x.CvrPct)
                .HasComputedColumnSql(
                    "CASE WHEN sessions > 0 THEN CAST(conversions AS DECIMAL(10,4)) / sessions * 100 ELSE 0 END",
                    stored: true);
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("CONFIRMED");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Ga4Event>(e =>
        {
            e.ToTable("ga4_events");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.SnapshotDate, x.EventName }).IsUnique();
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("CONFIRMED");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Ga4PropertyHealth>(e =>
        {
            e.ToTable("ga4_property_health");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.PropertyId).IsUnique();
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Ga4ContaminationExclusion>(e =>
        {
            e.ToTable("ga4_contamination_exclusions");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Pattern).IsUnique();
            e.Property(x => x.IsActive).HasDefaultValue(true);
        });

        // ════════════════════════════════════════════════════
        // GSC TABLES
        // ════════════════════════════════════════════════════

        modelBuilder.Entity<GscQuerySnapshot>(e =>
        {
            e.ToTable("gsc_query_snapshots");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.SnapshotDate, x.Query }).IsUnique();
            e.Property(x => x.CtrPct)
                .HasComputedColumnSql(
                    "CASE WHEN impressions > 0 THEN CAST(clicks AS DECIMAL(10,4)) / impressions * 100 ELSE 0 END",
                    stored: true);
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("CONFIRMED");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<GscPageSnapshot>(e =>
        {
            e.ToTable("gsc_page_snapshots");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.SnapshotDate, x.PageUrl }).IsUnique();
            e.Property(x => x.CtrPct)
                .HasComputedColumnSql(
                    "CASE WHEN impressions > 0 THEN CAST(clicks AS DECIMAL(10,4)) / impressions * 100 ELSE 0 END",
                    stored: true);
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("CONFIRMED");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<GscPortfolioSummary>(e =>
        {
            e.ToTable("gsc_portfolio_summaries");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.SnapshotDate).IsUnique();
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("CONFIRMED");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ════════════════════════════════════════════════════
        // ADS TABLES
        // ════════════════════════════════════════════════════

        modelBuilder.Entity<AdsCampaignSnapshot>(e =>
        {
            e.ToTable("ads_campaign_snapshots");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.SnapshotDate, x.CampaignName }).IsUnique();
            e.Property(x => x.CtrPct)
                .HasComputedColumnSql(
                    "CASE WHEN impressions > 0 THEN CAST(clicks AS DECIMAL(10,4)) / impressions * 100 ELSE 0 END",
                    stored: true);
            e.Property(x => x.Cpqi)
                .HasComputedColumnSql(
                    "CASE WHEN conversions > 0 THEN CAST(spend AS DECIMAL(10,4)) / conversions ELSE 0 END",
                    stored: true);
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<AdsAdGroupSnapshot>(e =>
        {
            e.ToTable("ads_ad_group_snapshots");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.SnapshotDate, x.CampaignName, x.AdgroupName }).IsUnique();
            e.Property(x => x.CtrPct)
                .HasComputedColumnSql(
                    "CASE WHEN impressions > 0 THEN CAST(clicks AS DECIMAL(10,4)) / impressions * 100 ELSE 0 END",
                    stored: true);
            e.Property(x => x.Cpqi)
                .HasComputedColumnSql(
                    "CASE WHEN conversions > 0 THEN CAST(spend AS DECIMAL(10,4)) / conversions ELSE 0 END",
                    stored: true);
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<AdsSearchTerm>(e =>
        {
            e.ToTable("ads_search_terms");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.SnapshotDate, x.SearchTerm, x.CampaignName }).IsUnique();
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<AdsAuctionInsight>(e =>
        {
            e.ToTable("ads_auction_insights");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.WeekStart, x.Competitor }).IsUnique();
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ════════════════════════════════════════════════════
        // OPPORTUNITIES & COMPETITION
        // ════════════════════════════════════════════════════

        modelBuilder.Entity<Opportunity>(e =>
        {
            e.ToTable("opportunities");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Title);
            e.Property(x => x.Status).HasDefaultValue("open");
            e.Property(x => x.PriorityLabel).HasDefaultValue("next");
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            e.HasOne(x => x.OwnerUser)
                .WithMany(x => x.OwnedOpportunities)
                .HasForeignKey(x => x.OwnerUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<OpportunitySignal>(e =>
        {
            e.ToTable("opportunity_signals");
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Opportunity)
                .WithMany(x => x.Signals)
                .HasForeignKey(x => x.OpportunityId)
                .OnDelete(DeleteBehavior.Cascade);
            e.Property(x => x.DetectedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<CompetitiveBenchmark>(e =>
        {
            e.ToTable("competitive_benchmarks");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Category).IsUnique();
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<CompetitiveFeature>(e =>
        {
            e.ToTable("competitive_features");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.FeatureName).IsUnique();
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ════════════════════════════════════════════════════
        // CONTENT
        // ════════════════════════════════════════════════════

        modelBuilder.Entity<ContentPillar>(e =>
        {
            e.ToTable("content_pillars");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.PillarName).IsUnique();
            e.Property(x => x.IsActive).HasDefaultValue(true);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<ContentArticle>(e =>
        {
            e.ToTable("content_articles");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.UrlPath).IsUnique();
            e.HasOne(x => x.Pillar)
                .WithMany(x => x.Articles)
                .HasForeignKey(x => x.PillarId)
                .OnDelete(DeleteBehavior.SetNull);
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("CONFIRMED");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<ContentRefreshQueue>(e =>
        {
            e.ToTable("content_refresh_queue");
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Article)
                .WithMany(x => x.RefreshQueue)
                .HasForeignKey(x => x.ArticleId)
                .OnDelete(DeleteBehavior.Cascade);
            e.Property(x => x.Status).HasDefaultValue("queued");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ════════════════════════════════════════════════════
        // SEO
        // ════════════════════════════════════════════════════

        modelBuilder.Entity<SeoPlay>(e =>
        {
            e.ToTable("seo_plays");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.PlayTitle);
            e.Property(x => x.Status).HasDefaultValue("proposed");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<SeoModelHub>(e =>
        {
            e.ToTable("seo_model_hubs");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.Make, x.Model }).IsUnique();
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ════════════════════════════════════════════════════
        // PPC
        // ════════════════════════════════════════════════════

        modelBuilder.Entity<PpcWasteAnalysis>(e =>
        {
            e.ToTable("ppc_waste_analysis");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.SnapshotDate).IsUnique();
            e.Property(x => x.WastePct)
                .HasComputedColumnSql(
                    "CASE WHEN total_spend > 0 THEN CAST(irrelevant_spend AS DECIMAL(10,4)) / total_spend * 100 ELSE 0 END",
                    stored: true);
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<PpcNegativeKeyword>(e =>
        {
            e.ToTable("ppc_negative_keywords");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.CampaignName, x.Term }).IsUnique();
            e.Property(x => x.MatchType).HasDefaultValue("exact");
        });

        // ════════════════════════════════════════════════════
        // EMAIL
        // ════════════════════════════════════════════════════

        modelBuilder.Entity<EmailSequence>(e =>
        {
            e.ToTable("email_sequences");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.SequenceName).IsUnique();
            e.Property(x => x.Status).HasDefaultValue("planned");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<EmailPerformance>(e =>
        {
            e.ToTable("email_performance");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.SendDate, x.EmailProduct }).IsUnique();
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<EmailServer>(e =>
        {
            e.ToTable("email_servers");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.ServerHostname).IsUnique();
            e.Property(x => x.Status).HasDefaultValue("active");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ════════════════════════════════════════════════════
        // REVENUE & BROKERS
        // ════════════════════════════════════════════════════

        modelBuilder.Entity<RevenueStream>(e =>
        {
            e.ToTable("revenue_streams");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.StreamName);
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Broker>(e =>
        {
            e.ToTable("brokers");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.BrokerName);
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<BrokerHealthSnapshot>(e =>
        {
            e.ToTable("broker_health_snapshots");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.SnapshotDate, x.BrokerId }).IsUnique();
            e.HasOne(x => x.Broker)
                .WithMany(x => x.HealthSnapshots)
                .HasForeignKey(x => x.BrokerId)
                .OnDelete(DeleteBehavior.Cascade);
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<BrokerRenewalRisk>(e =>
        {
            e.ToTable("broker_renewal_risks");
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Broker)
                .WithMany(x => x.RenewalRisks)
                .HasForeignKey(x => x.BrokerId)
                .OnDelete(DeleteBehavior.Cascade);
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<AdvertiserAccount>(e =>
        {
            e.ToTable("advertiser_accounts");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.AdvertiserName);
            e.HasOne(x => x.Broker)
                .WithMany(x => x.AdvertiserAccounts)
                .HasForeignKey(x => x.BrokerId)
                .OnDelete(DeleteBehavior.SetNull);
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ════════════════════════════════════════════════════
        // LISTINGS & MARKET
        // ════════════════════════════════════════════════════

        modelBuilder.Entity<Listing>(e =>
        {
            e.ToTable("listings");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.ListingId).IsUnique();
            e.HasOne(x => x.Broker)
                .WithMany(x => x.Listings)
                .HasForeignKey(x => x.BrokerId)
                .OnDelete(DeleteBehavior.SetNull);
            e.Property(x => x.CvrPct)
                .HasComputedColumnSql(
                    "CASE WHEN detail_views_30d > 0 THEN CAST(inquiries_30d AS DECIMAL(10,4)) / detail_views_30d * 100 ELSE 0 END",
                    stored: true);
            e.Property(x => x.Status).HasDefaultValue("active");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<MarketDemandModel>(e =>
        {
            e.ToTable("market_demand_models");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.Make, x.Model }).IsUnique();
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<MarketDemandCategory>(e =>
        {
            e.ToTable("market_demand_categories");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Category).IsUnique();
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ════════════════════════════════════════════════════
        // ALERTS
        // ════════════════════════════════════════════════════

        modelBuilder.Entity<AlertRule>(e =>
        {
            e.ToTable("alert_rules");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.RuleName).IsUnique();
            e.Property(x => x.IsActive).HasDefaultValue(true);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Alert>(e =>
        {
            e.ToTable("alerts");
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Rule)
                .WithMany(x => x.Alerts)
                .HasForeignKey(x => x.RuleId)
                .OnDelete(DeleteBehavior.SetNull);
            e.Property(x => x.IsResolved).HasDefaultValue(false);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ════════════════════════════════════════════════════
        // EXECUTION
        // ════════════════════════════════════════════════════

        modelBuilder.Entity<ExecutionItem>(e =>
        {
            e.ToTable("execution_items");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Title);
            e.Property(x => x.Status).HasDefaultValue("open");
            e.Property(x => x.ConfidenceLevel).HasDefaultValue("PROBABLE");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });
    }
}
