// ProjectService.cs
using BusbarCalculator.API.Models;
using BusbarCalculator.API.Data;
using Microsoft.EntityFrameworkCore;

namespace BusbarCalculator.API.Services
{
    public class ProjectService
    {
        private readonly ApplicationDbContext _context;

        public ProjectService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProjectSummary>> GetUserProjects(string userId)
        {
            return await _context.Projects
                .Where(p => p.UserId == userId)
                .Select(p => new ProjectSummary
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    CreatedDate = p.CreatedDate,
                    LastModifiedDate = p.LastModifiedDate
                })
                .OrderByDescending(p => p.LastModifiedDate)
                .ToListAsync();
        }

        public async Task<Project> GetProject(string id, string userId)
        {
            return await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
        }

        public async Task<Project> SaveProject(Project project)
        {
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            return project;
        }

        public async Task UpdateProject(Project project)
        {
            _context.Entry(project).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteProject(string id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project != null)
            {
                _context.Projects.Remove(project);
                await _context.SaveChangesAsync();
            }
        }
    }
}