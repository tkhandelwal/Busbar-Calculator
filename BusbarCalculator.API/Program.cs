// BusbarCalculator.API/Program.cs
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using BusbarCalculator.API.Services;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Handle object cycles and references properly in JSON serialization
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        // Enable case-sensitive property name matching (default behavior)
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = false;
    });

// Configure CORS for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register custom services - using AddScoped instead of AddSingleton for testing
builder.Services.AddScoped<BusbarCalculationService>();
builder.Services.AddScoped<SampleDataService>();
builder.Services.AddScoped<FemAnalysisService>();

var app = builder.Build();

// Add middleware for request logging in development
if (app.Environment.IsDevelopment())
{
    app.Use(async (context, next) =>
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Request: {Method} {Path}", context.Request.Method, context.Request.Path);
        await next();
    });
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

// Enable CORS before routing
app.UseCors("AllowReactApp");

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

// Map API controllers
app.MapControllers();

// Add a default redirect to Swagger when accessing the root URL
app.MapGet("/", () => Results.Redirect("/swagger"));

// Verify that services are properly registered and can be resolved
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var sampleDataService = services.GetRequiredService<SampleDataService>();
        var logger = services.GetRequiredService<ILogger<Program>>();
        var configs = sampleDataService.GetAll();
        logger.LogInformation("SampleDataService loaded with {Count} configurations", configs.Count);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while retrieving the SampleDataService");
    }
}

// Run the app
app.Run();