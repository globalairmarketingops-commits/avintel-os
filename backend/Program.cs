using Microsoft.EntityFrameworkCore;
using Azure.Identity;
using AvIntelOS.Api.Data;
using AvIntelOS.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Database — Azure SQL with Managed Identity in production, InMemory for dev
var connectionString = builder.Configuration.GetConnectionString("AvIntelOS");
if (!string.IsNullOrEmpty(connectionString))
{
    builder.Services.AddDbContext<AvIntelDbContext>(options =>
        options.UseSqlServer(connectionString));
}
else
{
    builder.Services.AddDbContext<AvIntelDbContext>(options =>
        options.UseInMemoryDatabase("AvIntelOS"));
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
        // Production: ensure schema exists
        db.Database.EnsureCreated();
    }

    // Seed data (idempotent — checks if data already exists)
    SeedDataService.Seed(db);
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
