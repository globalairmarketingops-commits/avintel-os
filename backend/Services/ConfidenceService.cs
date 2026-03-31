namespace AvIntelOS.Api.Services;

/// <summary>
/// Classifies and composes confidence levels based on data source and age.
/// Confidence hierarchy: CONFIRMED > PROBABLE > POSSIBLE.
/// </summary>
public class ConfidenceService
{
    /// <summary>
    /// Classify confidence based on data source type and how stale the data is.
    /// Sources like windsor_live, api_direct, csv_upload, and manual start as CONFIRMED.
    /// Calculated values start as PROBABLE. Everything else starts as POSSIBLE.
    /// Confidence decays over time: CONFIRMED decays after 30 days, PROBABLE after 60 days.
    /// </summary>
    public string Classify(string source, int ageInDays)
    {
        string baseLevel = source switch
        {
            "windsor_live" or "api_direct" or "csv_upload" or "manual" => "CONFIRMED",
            "calculated" => "PROBABLE",
            _ => "POSSIBLE"
        };

        // Apply decay — stale data loses confidence
        if (baseLevel == "CONFIRMED" && ageInDays > 30) return "PROBABLE";
        if (baseLevel == "PROBABLE" && ageInDays > 60) return "POSSIBLE";

        return baseLevel;
    }

    /// <summary>
    /// Returns the minimum (weakest) confidence level from a set.
    /// A composite insight is only as trustworthy as its least-confident input.
    /// </summary>
    public string Min(params string[] levels)
    {
        if (levels.Any(l => l == "POSSIBLE")) return "POSSIBLE";
        if (levels.Any(l => l == "PROBABLE")) return "PROBABLE";
        return "CONFIRMED";
    }
}
