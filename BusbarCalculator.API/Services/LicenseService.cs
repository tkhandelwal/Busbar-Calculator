// LicenseService.cs
using BusbarCalculator.API.Models;
using BusbarCalculator.API.Data;
using Microsoft.EntityFrameworkCore;

namespace BusbarCalculator.API.Services
{
    public interface ILicenseService
    {
        Task<LicenseInfo> GetLicenseInfo(string userId);
        Task<LicenseInfo> CreateTrialLicense(string userId);
        Task<LicenseInfo> ExtendLicense(string userId, string licenseKey, int months);
        Task<bool> ValidateLicense(string userId);
    }

    public class LicenseService : ILicenseService
    {
        private readonly ApplicationDbContext _context;

        public LicenseService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<LicenseInfo> GetLicenseInfo(string userId)
        {
            return await _context.Licenses
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.ExpiryDate)
                .FirstOrDefaultAsync();
        }

        public async Task<LicenseInfo> CreateTrialLicense(string userId)
        {
            var license = new LicenseInfo
            {
                Id = Guid.NewGuid().ToString(),
                UserId = userId,
                LicenseType = LicenseType.Trial,
                IssueDate = DateTime.UtcNow,
                ExpiryDate = DateTime.UtcNow.AddDays(30),
                Features = new List<string> { "basic-calculation", "standard-configs" },
                IsActive = true
            };

            _context.Licenses.Add(license);
            await _context.SaveChangesAsync();

            return license;
        }

        public async Task<LicenseInfo> ExtendLicense(string userId, string licenseKey, int months)
        {
            // Validate license key against external service or database
            // In a real app, this would verify the license key is valid

            var currentLicense = await GetLicenseInfo(userId);

            if (currentLicense == null)
            {
                throw new Exception("No license found for user");
            }

            var expiryDate = currentLicense.ExpiryDate < DateTime.UtcNow
                ? DateTime.UtcNow.AddMonths(months)
                : currentLicense.ExpiryDate.AddMonths(months);

            var license = new LicenseInfo
            {
                Id = Guid.NewGuid().ToString(),
                UserId = userId,
                LicenseType = LicenseType.Professional,
                IssueDate = DateTime.UtcNow,
                ExpiryDate = expiryDate,
                Features = new List<string> {
                    "basic-calculation",
                    "standard-configs",
                    "advanced-calculation",
                    "pdf-reports",
                    "project-save",
                    "3d-visualization",
                    "thermal-simulation"
                },
                LicenseKey = licenseKey,
                IsActive = true
            };

            _context.Licenses.Add(license);
            await _context.SaveChangesAsync();

            return license;
        }

        public async Task<bool> ValidateLicense(string userId)
        {
            var license = await GetLicenseInfo(userId);

            if (license == null)
                return false;

            return license.IsActive && license.ExpiryDate > DateTime.UtcNow;
        }
    }
}