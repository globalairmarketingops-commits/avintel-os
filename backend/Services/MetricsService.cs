namespace AvIntelOS.Api.Services;

/// <summary>
/// Centralized metric computation functions for Av/IntelOS.
/// All methods return decimal with div-by-zero guards returning 0.
/// </summary>
public class MetricsService
{
    /// <summary>
    /// Returns qualified inquiry count as-is.
    /// </summary>
    public decimal Qi(int inquiries) => inquiries;

    /// <summary>
    /// Cost Per Qualified Inquiry = spend / qi.
    /// </summary>
    public decimal Cpqi(decimal spend, int qi)
        => qi > 0 ? Math.Round(spend / qi, 4) : 0m;

    /// <summary>
    /// Clean engagement rate excluding Email_Open_ contamination.
    /// Returns percentage: (engaged / total) * 100.
    /// </summary>
    public decimal EngagementRateClean(int engaged, int total)
        => total > 0 ? Math.Round((decimal)engaged / total * 100, 4) : 0m;

    /// <summary>
    /// Click-through rate = (clicks / impressions) * 100.
    /// </summary>
    public decimal Ctr(int clicks, int impressions)
        => impressions > 0 ? Math.Round((decimal)clicks / impressions * 100, 4) : 0m;

    /// <summary>
    /// Conversion rate = (conversions / sessions) * 100.
    /// </summary>
    public decimal ConversionRate(int conversions, int sessions)
        => sessions > 0 ? Math.Round((decimal)conversions / sessions * 100, 4) : 0m;

    /// <summary>
    /// Waste rate = (irrelevant / total) * 100.
    /// </summary>
    public decimal WasteRate(decimal irrelevant, decimal total)
        => total > 0 ? Math.Round(irrelevant / total * 100, 4) : 0m;

    /// <summary>
    /// Impression share = (actual / eligible) * 100.
    /// </summary>
    public decimal ImpressionShare(decimal actual, decimal eligible)
        => eligible > 0 ? Math.Round(actual / eligible * 100, 4) : 0m;

    /// <summary>
    /// Revenue per qualified inquiry = revenue / qi.
    /// </summary>
    public decimal RevenuePerQi(decimal revenue, int qi)
        => qi > 0 ? Math.Round(revenue / qi, 4) : 0m;

    /// <summary>
    /// Retention rate = (retained / total) * 100.
    /// </summary>
    public decimal RetentionRate(int retained, int total)
        => total > 0 ? Math.Round((decimal)retained / total * 100, 4) : 0m;

    /// <summary>
    /// Listing conversion rate = (inquiries / views) * 100.
    /// </summary>
    public decimal ListingCvr(int inquiries, int views)
        => views > 0 ? Math.Round((decimal)inquiries / views * 100, 4) : 0m;

    /// <summary>
    /// Demand-inventory imbalance = ((demand - supply) / supply) * 100.
    /// Positive = demand exceeds supply. Negative = oversupply.
    /// </summary>
    public decimal DemandInventoryImbalance(decimal demand, decimal supply)
        => supply > 0 ? Math.Round((demand - supply) / supply * 100, 4) : 0m;

    /// <summary>
    /// Decision confidence percentage.
    /// Weighted: CONFIRMED = 100%, PROBABLE = 60%, POSSIBLE = 20%.
    /// </summary>
    public decimal DecisionConfidencePct(int confirmed, int probable, int possible)
    {
        int total = confirmed + probable + possible;
        if (total == 0) return 0m;

        decimal weighted = (confirmed * 100m) + (probable * 60m) + (possible * 20m);
        return Math.Round(weighted / total, 4);
    }

    /// <summary>
    /// Revenue delta integrity = ((current - prior) / prior) * 100.
    /// Returns percentage change.
    /// </summary>
    public decimal RevenueDeltaIntegrity(decimal current, decimal prior)
        => prior > 0 ? Math.Round((current - prior) / prior * 100, 4) : 0m;
}
