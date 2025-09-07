using MicroService.ResourceManagement.Api;
using MicroService.ResourceManagement.Api.Config;
using MicroService.ResourceManagement.Api.Database;
using MicroService.ResourceManagement.Api.Services;
using Microsoft.EntityFrameworkCore;
using NLog.Extensions.Logging;
var builder = WebApplication.CreateBuilder(args);

// Bind MyBackend section into ResourceManagementConfig
var config = new ResourceManagementConfig();
builder.Configuration.GetSection("ResourceManagementConfig").Bind(config);
builder.Services.Add(new ServiceDescriptor(typeof(ResourceManagementConfig), config));

//setup logging
builder.Services.AddLogging(loggingBuilder =>
{
    loggingBuilder.ClearProviders();
    loggingBuilder.SetMinimumLevel(LogLevel.Trace);
    loggingBuilder.AddNLog();
});

// Add services to the container
builder.Services.AddDbContext<ResourceDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

if (config.UseInMemoryData)
{
    builder.Services.AddSingleton<IDelegatedStatService, InMemoryDelegatedStatService>();
}
else
{
    builder.Services.AddScoped<IDelegatedStatService, DbDelegatedStatService>();
}
builder.Services.AddHttpClient();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});
builder.Services.AddControllers();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHostedService<DelegatedStatsStartupLoader>();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply migrations automatically
if (!config.UseInMemoryData)
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ResourceDbContext>();
        dbContext.Database.Migrate(); // This applies any pending migrations
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.MapControllers();

app.UseDefaultFiles(); // enables index.html as default
app.UseStaticFiles();  // serve from wwwroot

app.Run();
