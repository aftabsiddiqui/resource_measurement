using Backend.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Threading;
using System.Threading.Tasks;

namespace Backend
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
            var statService = scope.ServiceProvider.GetRequiredService<DelegatedStatService>();
            await statService.FetchAndStoreStatsAsync();
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
