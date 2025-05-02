// BusbarCalculator.API/Controllers/BusbarController.cs
using Microsoft.AspNetCore.Mvc;
using BusbarCalculator.API.Models;
using BusbarCalculator.API.Services;

namespace BusbarCalculator.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BusbarController : ControllerBase
    {
        private readonly BusbarCalculationService _calculationService;
        private readonly SampleDataService _sampleDataService;

        public BusbarController(BusbarCalculationService calculationService, SampleDataService sampleDataService)
        {
            _calculationService = calculationService;
            _sampleDataService = sampleDataService;
        }

        [HttpPost("calculate")]
        public ActionResult<BusbarResult> Calculate(BusbarInput input)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = _calculationService.CalculateBusbarParameters(input);
            return Ok(result);
        }

        [HttpGet("materials")]
        public ActionResult<IEnumerable<string>> GetMaterials()
        {
            // Return available materials
            return Ok(new List<string> { "Copper", "Aluminum" });
        }

        [HttpGet("standard-configs")]
        public ActionResult<IEnumerable<StandardBusbarConfig>> GetStandardConfigs(string voltageLevel = null)
        {
            if (string.IsNullOrEmpty(voltageLevel))
            {
                return Ok(_sampleDataService.GetAll());
            }

            return Ok(_sampleDataService.GetByVoltageLevel(voltageLevel));
        }

        [HttpGet("standard-configs/{id}")]
        public ActionResult<StandardBusbarConfig> GetStandardConfigById(string id)
        {
            var config = _sampleDataService.GetById(id);
            if (config == null)
            {
                return NotFound();
            }

            return Ok(config);
        }

        [HttpGet("voltage-levels")]
        public ActionResult<IEnumerable<string>> GetVoltageLevels()
        {
            return Ok(new List<string> { "LV", "MV", "HV" });
        }
    }
}