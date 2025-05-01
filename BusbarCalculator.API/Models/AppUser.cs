using Microsoft.AspNetCore.Identity;
using System;

namespace BusbarCalculator.API.Models
{
    public class AppUser : IdentityUser
    {
        public string Name { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
    }

    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserDto? User { get; set; }
    }

    public enum LicenseType
    {
        Trial,
        Basic,
        Professional,
        Enterprise
    }

    public class LicenseInfo
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public LicenseType LicenseType { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public List<string> Features { get; set; } = new List<string>();
        public string LicenseKey { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}