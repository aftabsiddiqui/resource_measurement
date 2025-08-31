using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Net.Http;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace Backend.Services
{
    public class DelegatedStatService
    {
        private readonly ResourceDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        public DelegatedStatService(ResourceDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        private const string DelegatedStatsUrl = "https://ftp.ripe.net/pub/stats/ripencc/nro-stats/latest/nro-delegated-stats";

        public async Task<List<DelegatedStat>> FetchAndStoreStatsAsync()
        {
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(DelegatedStatsUrl);
            response.EnsureSuccessStatusCode();
            var text = await response.Content.ReadAsStringAsync();
            var lines = text.Split('\n');
            var stats = new List<DelegatedStat>();
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
                stats.Add(stat);
            }
            _context.DelegatedStats.RemoveRange(_context.DelegatedStats);
            await _context.SaveChangesAsync();
            await _context.DelegatedStats.AddRangeAsync(stats);
            await _context.SaveChangesAsync();
            return stats;
        }

        public async Task<List<DelegatedStat>> GetStatsAsync()
        {
            return await _context.DelegatedStats.ToListAsync();
        }
    }
}