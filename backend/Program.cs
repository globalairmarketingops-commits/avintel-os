using Microsoft.EntityFrameworkCore;
using Azure.Identity;
using AvIntelOS.Api.Data;
using AvIntelOS.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Database — InMemory for now (Azure SQL available but deferred until schema validated)
// Set USE_SQL_SERVER=true in app settings to enable Azure SQL
var connectionString = builder.Configuration.GetConnectionString("AvIntelOS");
var useSql = builder.Configuration.GetValue<bool>("USE_SQL_SERVER", false);
if (useSql && !string.IsNullOrEmpty(connectionString))
{
    builder.Services.AddDbContext<AvIntelDbContext>(options =>
        options.UseSqlServer(connectionString));
    Console.WriteLine("[DB] Using Azure SQL Server.");
}
else
{
    builder.Services.AddDbContext<AvIntelDbContext>(options =>
        options.UseInMemoryDatabase("AvIntelOS"));
    Console.WriteLine("[DB] Using InMemory database with seed data.");
}

// Services
builder.Services.AddSingleton<ConfidenceService>();
builder.Services.AddSingleton<MetricsService>();
builder.Services.AddSingleton<RoleFilterService>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<WindsorIngestionService>();

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS — allow React dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Database initialization
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AvIntelDbContext>();

    if (!string.IsNullOrEmpty(connectionString))
    {
        try
        {
            // Production: ensure schema exists
            db.Database.EnsureCreated();
            Console.WriteLine("[DB] Azure SQL connected and schema ensured.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] SQL connection failed: {ex.Message}");
            Console.WriteLine("[DB] App will continue with empty SQL tables or retry on next request.");
        }
    }

    // Seed data (idempotent — checks if data already exists)
    try
    {
        SeedDataService.Seed(db);
        Console.WriteLine("[DB] Seed data loaded.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[DB] Seed failed (may need SQL): {ex.Message}");
    }
}

// Swagger in dev
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("DevCors");
app.UseAuthorization();

// Serve React frontend from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();

// SPA fallback — serve index.html for any non-API, non-file route
app.MapFallbackToFile("index.html");

app.Run();
