using MicroService.ResourceManagement.Api.Database;
using MicroService.ResourceManagement.Api.Services;

namespace MicroService.ResourceManagement.Api
{
    public class DelegatedStatsStartupLoader : IHostedService
    {
        private readonly IServiceProvider _serviceProvider;
        public DelegatedStatsStartupLoader(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            // var dbContext = scope.ServiceProvider.GetRequiredService<ResourceDbContext>();
            // dbContext.Database.EnsureCreated();
            var statService = scope.ServiceProvider.GetRequiredService<IDelegatedStatService>();
            await statService.FetchAndStoreStatsAsync();
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
