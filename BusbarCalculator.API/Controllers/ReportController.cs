// ReportController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BusbarCalculator.API.Models;
using BusbarCalculator.API.Services;
using System.Security.Claims;

namespace BusbarCalculator.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly ReportService _reportService;
        private readonly ProjectService _projectService;
        private readonly ILicenseService _licenseService;

        public ReportController(
            ReportService reportService,
            ProjectService projectService,
            ILicenseService licenseService)
        {
            _reportService = reportService;
            _projectService = projectService;
            _licenseService = licenseService;
        }

        [HttpGet("generate/{projectId}")]
        public async Task<IActionResult> GenerateReport(string projectId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Check license for PDF report feature
            var hasValidLicense = await _licenseService.ValidateLicense(userId);
            var license = await _licenseService.GetLicenseInfo(userId);

            if (!hasValidLicense || !license.Features.Contains("pdf-reports"))
                return BadRequest("Your license does not support PDF reports. Please upgrade.");

            var project = await _projectService.GetProject(projectId, userId);

            if (project == null)
                return NotFound();

            var reportBytes = _reportService.GenerateBusbarReport(project);

            return File(reportBytes, "application/pdf", $"Busbar_Report_{project.Name}_{DateTime.Now:yyyyMMdd}.pdf");
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateReportFromData([FromBody] Project project)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Check license for PDF report feature
            var hasValidLicense = await _licenseService.ValidateLicense(userId);
            var license = await _licenseService.GetLicenseInfo(userId);

            if (!hasValidLicense || !license.Features.Contains("pdf-reports"))
                return BadRequest("Your license does not support PDF reports. Please upgrade.");

            // Set project metadata if not already set
            if (string.IsNullOrEmpty(project.Name))
                project.Name = "Untitled Project";

            project.UserId = userId;
            project.CreatedDate = DateTime.UtcNow;
            project.LastModifiedDate = DateTime.UtcNow;

            var reportBytes = _reportService.GenerateBusbarReport(project);

            return File(reportBytes, "application/pdf", $"Busbar_Report_{project.Name}_{DateTime.Now:yyyyMMdd}.pdf");
        }
    }
}