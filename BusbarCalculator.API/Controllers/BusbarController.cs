// BusbarCalculator.API/Controllers/BusbarController.cs
using Microsoft.AspNetCore.Mvc;
using BusbarCalculator.API.Models;
using BusbarCalculator.API.Services;
using System.IO;
using System.Threading.Tasks;

namespace BusbarCalculator.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BusbarController : ControllerBase
    {
        private readonly BusbarCalculationService _calculationService;
        private readonly SampleDataService _sampleDataService;
        private readonly FemAnalysisService _femAnalysisService;
        private readonly PdfReportService _pdfReportService;
        private readonly ILogger<BusbarController> _logger;

        public BusbarController(
            BusbarCalculationService calculationService,
            SampleDataService sampleDataService,
            FemAnalysisService femAnalysisService,
            PdfReportService pdfReportService,
            ILogger<BusbarController> logger)
        {
            _calculationService = calculationService;
            _sampleDataService = sampleDataService;
            _femAnalysisService = femAnalysisService;
            _pdfReportService = pdfReportService;
            _logger = logger;
        }

        [HttpPost("calculate")]
        public ActionResult<BusbarResult> Calculate(BusbarInput input)
        {
            _logger.LogInformation("Processing busbar calculation request with current: {Current}A, Material: {Material}",
                input.Current, input.Material);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state in calculation request");
                return BadRequest(ModelState);
            }

            try
            {
                var result = _calculationService.CalculateBusbarParameters(input);

                // If advanced calculation is requested, perform FEM analysis
                if (input.UseAdvancedCalculation)
                {
                    _logger.LogInformation("Performing advanced FEM analysis");
                    var femResults = _femAnalysisService.PerformFemAnalysis(input);
                    result.AdvancedResults = femResults;
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating busbar parameters");
                return StatusCode(500, new { error = "An error occurred during calculation", message = ex.Message });
            }
        }

        [HttpGet("materials")]
        public ActionResult<IEnumerable<string>> GetMaterials()
        {
            _logger.LogInformation("Fetching available materials");
            // Return available materials
            return Ok(new List<string> { "Copper", "Aluminum" });
        }

        [HttpGet("standard-configs")]
        public ActionResult<IEnumerable<StandardBusbarConfig>> GetStandardConfigs(string voltageLevel = null)
        {
            _logger.LogInformation("Fetching standard configurations for voltage level: {VoltageLevel}",
                voltageLevel ?? "All");

            if (string.IsNullOrEmpty(voltageLevel))
            {
                return Ok(_sampleDataService.GetAll());
            }

            return Ok(_sampleDataService.GetByVoltageLevel(voltageLevel));
        }

        [HttpGet("standard-configs/{id}")]
        public ActionResult<StandardBusbarConfig> GetStandardConfigById(string id)
        {
            _logger.LogInformation("Fetching standard configuration with ID: {Id}", id);

            var config = _sampleDataService.GetById(id);
            if (config == null)
            {
                _logger.LogWarning("Standard configuration not found with ID: {Id}", id);
                return NotFound();
            }

            return Ok(config);
        }

        [HttpGet("voltage-levels")]
        public ActionResult<IEnumerable<string>> GetVoltageLevels()
        {
            _logger.LogInformation("Fetching voltage levels");
            return Ok(new List<string> { "LV", "MV", "HV" });
        }

        [HttpPost("generate-report")]
        public async Task<IActionResult> GenerateReport([FromBody] BusbarResult result)
        {
            _logger.LogInformation("Generating PDF report");

            try
            {
                var pdfBytes = await _pdfReportService.GenerateBusbarReport(result);
                return File(pdfBytes, "application/pdf", "busbar-report.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF report");
                return StatusCode(500, new { error = "Error generating report", message = ex.Message });
            }
        }

        [HttpPost("analyze-safety")]
        public ActionResult<SafetyAnalysisResult> AnalyzeSafety([FromBody] BusbarResult result)
        {
            _logger.LogInformation("Performing safety analysis");

            try
            {
                // Create a simple safety analysis result
                var safetyAnalysis = new SafetyAnalysisResult
                {
                    TemperatureSafetyFactor = result.MaxAllowableTemperature / result.TemperatureRise,
                    StressSafetyFactor = result.MaxAllowableMechanicalStress / result.MechanicalStress,
                    CurrentDensitySafetyFactor = 2.0 / result.CurrentDensity,
                    IsTemperatureSafe = result.TemperatureRise <= result.MaxAllowableTemperature,
                    IsStressSafe = result.MechanicalStress <= result.MaxAllowableMechanicalStress,
                    IsCurrentDensitySafe = result.CurrentDensity <= 2.0,
                    OverallSafetyStatus = result.IsSizingSufficient ? "Acceptable" : "Needs Revision",
                    Recommendations = new List<string>()
                };

                // Add recommendations based on issues
                if (!safetyAnalysis.IsTemperatureSafe)
                {
                    safetyAnalysis.Recommendations.Add("Increase cross-section area to reduce temperature rise");
                }

                if (!safetyAnalysis.IsStressSafe)
                {
                    safetyAnalysis.Recommendations.Add("Increase thickness or reduce span length to decrease mechanical stress");
                }

                if (!safetyAnalysis.IsCurrentDensitySafe)
                {
                    safetyAnalysis.Recommendations.Add("Increase cross-section area to reduce current density");
                }

                return Ok(safetyAnalysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing safety analysis");
                return StatusCode(500, new { error = "Error analyzing safety", message = ex.Message });
            }
        }
    }

    // Safety analysis result model
    public class SafetyAnalysisResult
    {
        public double TemperatureSafetyFactor { get; set; }
        public double StressSafetyFactor { get; set; }
        public double CurrentDensitySafetyFactor { get; set; }
        public bool IsTemperatureSafe { get; set; }
        public bool IsStressSafe { get; set; }
        public bool IsCurrentDensitySafe { get; set; }
        public string OverallSafetyStatus { get; set; }
        public List<string> Recommendations { get; set; }
    }
}