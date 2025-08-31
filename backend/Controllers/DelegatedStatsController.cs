using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DelegatedStatsController : ControllerBase
    {
        private readonly DelegatedStatService _service;
        public DelegatedStatsController(DelegatedStatService service)
        {
            _service = service;
        }

        [HttpPost("fetch")]
        public async Task<ActionResult<List<DelegatedStat>>> FetchAndStore()
        {
            var stats = await _service.FetchAndStoreStatsAsync();
            return Ok(stats);
        }

        [HttpGet]
        public async Task<ActionResult<List<DelegatedStat>>> GetAll()
        {
            var stats = await _service.GetStatsAsync();
            return Ok(stats);
        }
    }
}
