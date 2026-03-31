namespace AvIntelOS.Api.Services;

/// <summary>
/// Interface for entities that carry a confidence level.
/// Must be implemented by any entity used with RoleFilterService.
/// </summary>
public interface IHasConfidence
{
    string ConfidenceLevel { get; set; }
}

/// <summary>
/// Filters queryable data based on user role and confidence level.
///
/// Role visibility rules:
///   casey  (operator) — sees CONFIRMED + PROBABLE + POSSIBLE (all data)
///   clay   (editor)   — sees CONFIRMED + PROBABLE
///   jeffrey (viewer)  — sees CONFIRMED only
/// </summary>
public class RoleFilterService
{
    private static readonly HashSet<string> EditorLevels = new(StringComparer.OrdinalIgnoreCase)
    {
        "CONFIRMED",
        "PROBABLE"
    };

    private static readonly HashSet<string> ViewerLevels = new(StringComparer.OrdinalIgnoreCase)
    {
        "CONFIRMED"
    };

    /// <summary>
    /// Filters an IQueryable to only include rows the given role is allowed to see.
    /// </summary>
    public IQueryable<T> FilterByRole<T>(IQueryable<T> query, string role) where T : class, IHasConfidence
    {
        return role?.ToLowerInvariant() switch
        {
            "operator" or "casey" => query, // sees everything
            "editor" or "clay" => query.Where(x => x.ConfidenceLevel == "CONFIRMED" || x.ConfidenceLevel == "PROBABLE"),
            "viewer" or "jeffrey" => query.Where(x => x.ConfidenceLevel == "CONFIRMED"),
            _ => query.Where(x => x.ConfidenceLevel == "CONFIRMED") // default to most restrictive
        };
    }
}
