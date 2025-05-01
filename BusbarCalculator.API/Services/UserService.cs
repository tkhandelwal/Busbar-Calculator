// UserService.cs
using Microsoft.AspNetCore.Identity;
using BusbarCalculator.API.Models;
using System.Security.Claims;

namespace BusbarCalculator.API.Services
{
    public class UserService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILicenseService _licenseService;

        public UserService(
            UserManager<AppUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ILicenseService licenseService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _licenseService = licenseService;
        }

        public async Task<bool> UserExists(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            return user != null;
        }

        public async Task<UserDto> Register(RegisterRequest request)
        {
            var user = new AppUser
            {
                UserName = request.Email,
                Email = request.Email,
                Name = request.Name,
                Company = request.Company,
                PhoneNumber = request.PhoneNumber,
                CreatedDate = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
                throw new ApplicationException($"Error creating user: {string.Join(", ", result.Errors.Select(e => e.Description))}");

            // Assign basic role
            await _userManager.AddToRoleAsync(user, "Basic");

            // Create a trial license
            await _licenseService.CreateTrialLicense(user.Id);

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Company = user.Company,
                Role = "Basic"
            };
        }

        public async Task<UserDto> Authenticate(string email, string password)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
                return null;

            var result = await _userManager.CheckPasswordAsync(user, password);

            if (!result)
                return null;

            var roles = await _userManager.GetRolesAsync(user);

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Company = user.Company,
                Role = roles.FirstOrDefault() ?? "Basic"
            };
        }

        public async Task<UserDto> GetUserByEmail(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
                return null;

            var roles = await _userManager.GetRolesAsync(user);

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Company = user.Company,
                Role = roles.FirstOrDefault() ?? "Basic"
            };
        }

        public async Task<LicenseInfo> GetLicenseInfo(string userId)
        {
            return await _licenseService.GetLicenseInfo(userId);
        }
    }
}