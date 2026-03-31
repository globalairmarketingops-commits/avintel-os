using Microsoft.AspNetCore.Mvc;

namespace AvIntelOS.Api.Controllers;

[ApiController]
[Route("api/v1/export")]
public class ExportController : ControllerBase
{
    // GET api/v1/export/{module}/{format}
    [HttpGet("{module}/{format}")]
    public IActionResult Export(string module, string format)
    {
        var validModules = new[]
        {
            "dashboard", "ga4", "organic", "ppc", "seo",
            "email", "social", "events", "content", "health", "execution"
        };

        var validFormats = new[] { "csv", "pdf" };

        if (!validModules.Contains(module.ToLower()))
            return BadRequest(new { error = $"Invalid module: {module}. Valid modules: {string.Join(", ", validModules)}" });

        if (!validFormats.Contains(format.ToLower()))
            return BadRequest(new { error = $"Invalid format: {format}. Valid formats: {string.Join(", ", validFormats)}" });

        return Ok(new
        {
            status = "not_implemented",
            message = $"Export not yet implemented for {module}/{format}",
            module,
            format,
            requested_at = DateTime.UtcNow
        });
    }
}
