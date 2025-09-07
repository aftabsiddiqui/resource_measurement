using MicroService.ResourceManagement.Api.Database;
using MicroService.ResourceManagement.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Net.Http;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;
using MicroService.ResourceManagement.Api.Config;

namespace MicroService.ResourceManagement.Api.Services
{
    public class InMemoryDelegatedStatService : IDelegatedStatService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ResourceManagementConfig _config;
        private List<DelegatedStat> _statData = new List<DelegatedStat>();
        private readonly ILogger<InMemoryDelegatedStatService> _logger;

        public InMemoryDelegatedStatService(IHttpClientFactory httpClientFactory, ResourceManagementConfig config, ILogger<InMemoryDelegatedStatService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _config = config;
            _logger = logger;
        }

        public async Task FetchAndStoreStatsAsync()
        {
            try
            {
                _logger.LogInformation("Fetching delegated stats from {Url}", _config.NroStatusUrl);

                _statData.Clear();
                var client = _httpClientFactory.CreateClient();
                var response = await client.GetAsync(_config.NroStatusUrl);
                response.EnsureSuccessStatusCode();
                var text = await response.Content.ReadAsStringAsync();
                var lines = text.Split('\n');
                foreach (var line in lines)
                {
                    if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#")) continue;
                    var parts = line.Split('|');
                    if (parts.Length < 8) continue;
                    var stat = new DelegatedStat
                    {
                        Rir = parts[0],
                        Country = parts[1],
                        Type = parts[2],
                        Value = parts[3],
                        Size = parts[4],
                        Date = DateTime.TryParseExact(parts[5], "yyyyMMdd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt) ? dt : DateTime.MinValue,
                        Status = parts[6],
                        Entity = parts[7]
                    };
                    _statData.Add(stat);
                }
                _logger.LogInformation("Successfully fetched and stored delegated stats.");
                var fileGuid = Guid.NewGuid();
                StoreDataInFile(_statData, fileGuid.ToString());

            }
            catch (Exception exp)
            {
                _logger.LogError(exp, "Error fetching delegated stats.");
                throw;
            }
        }

        public async Task<List<DelegatedStat>> GetStatsAsync()
        {
            return await Task.FromResult(_statData);
        }

        private void StoreDataInFile(List<DelegatedStat> stats, string fileName)
        {
            try
            {
                _logger.LogInformation("Storing delegated stats to file {FileName}.", fileName);
                var folderPath = Path.Combine(AppContext.BaseDirectory, _config.DataFolderName);
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }
                var filePath = Path.Combine(folderPath, $"delegated-stats-{fileName}-{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
                using var writer = new StreamWriter(filePath);
                using var csv = new CsvHelper.CsvWriter(writer, CultureInfo.InvariantCulture);
                csv.WriteRecords(stats);
                _logger.LogInformation("Delegated stats stored in file: {FilePath}", filePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error storing delegated stats to file.");
            }
        }

        private void UpdateInUseStatus(List<DelegatedStat> stats)
        {
            var options = new ParallelOptions
            {
                MaxDegreeOfParallelism = 1,
            };
            Parallel.ForEach(stats, options, stat =>
            {
                try
                {
                    // Simulate checking if the resource is in use
                    stat.InUseStatus = (new Random().Next(0, 2) == 1) ? "In Use" : "Not In Use";
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error updating InUseStatus for stat with Value: {Value}", stat.Value);
                    stat.InUseStatus = "Unknown";
                }
            });
        }
    }
}