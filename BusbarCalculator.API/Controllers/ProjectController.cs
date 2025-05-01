// ProjectController.cs
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
    public class ProjectController : ControllerBase
    {
        private readonly ProjectService _projectService;
        private readonly ILicenseService _licenseService;

        public ProjectController(ProjectService projectService, ILicenseService licenseService)
        {
            _projectService = projectService;
            _licenseService = licenseService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectSummary>>> GetProjects()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var projects = await _projectService.GetUserProjects(userId);
            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var project = await _projectService.GetProject(id, userId);

            if (project == null)
                return NotFound();

            return Ok(project);
        }

        [HttpPost]
        public async Task<ActionResult<Project>> CreateProject(Project project)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Check license for project saving feature
            var hasValidLicense = await _licenseService.ValidateLicense(userId);
            var license = await _licenseService.GetLicenseInfo(userId);

            if (!hasValidLicense || !license.Features.Contains("project-save"))
                return BadRequest("Your license does not support project saving. Please upgrade.");

            project.UserId = userId;
            project.CreatedDate = DateTime.UtcNow;
            project.LastModifiedDate = DateTime.UtcNow;

            var createdProject = await _projectService.SaveProject(project);
            return CreatedAtAction(nameof(GetProject), new { id = createdProject.Id }, createdProject);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(string id, Project project)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (id != project.Id)
                return BadRequest();

            // Check if project belongs to user
            var existingProject = await _projectService.GetProject(id, userId);
            if (existingProject == null)
                return NotFound();

            project.UserId = userId;
            project.CreatedDate = existingProject.CreatedDate;
            project.LastModifiedDate = DateTime.UtcNow;

            await _projectService.UpdateProject(project);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var project = await _projectService.GetProject(id, userId);
            if (project == null)
                return NotFound();

            await _projectService.DeleteProject(id);
            return NoContent();
        }
    }
}