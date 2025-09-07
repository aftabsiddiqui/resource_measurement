using MicroService.ResourceManagement.Api.Models;
using MicroService.ResourceManagement.Api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MicroService.ResourceManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DelegatedStatsController : ControllerBase
    {
        private readonly DbDelegatedStatService _service;
        public DelegatedStatsController(DbDelegatedStatService service)
        {
            _service = service;
        }


        [HttpGet]
        public async Task<ActionResult<List<DelegatedStat>>> GetAll()
        {
            var stats = await _service.GetStatsAsync();
            return Ok(stats);
        }
    }
}
