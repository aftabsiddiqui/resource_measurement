using MicroService.ResourceManagement.Api.Models;

namespace MicroService.ResourceManagement.Api.Services
{
    public interface IDelegatedStatService
    {
        Task FetchAndStoreStatsAsync();
        Task<List<DelegatedStat>> GetStatsAsync();
    }
}