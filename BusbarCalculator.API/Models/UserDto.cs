// User Models
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace BusbarCalculator.API.Models
{
    public class AppUser : IdentityUser
    {
        public string Name { get; set; }
        public string Company { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class UserDto
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string Company { get; set; }
        public string Role { get; set; }
    }

    public class RegisterRequest
    {
        [Required]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        public string Company { get; set; }
        public string PhoneNumber { get; set; }
    }

    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }

    public class AuthResponse
    {
        public string Token { get; set; }
        public UserDto User { get; set; }
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
        public string Id { get; set; }
        public string UserId { get; set; }
        public LicenseType LicenseType { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public List<string> Features { get; set; }
        public string LicenseKey { get; set; }
        public bool IsActive { get; set; }
    }
}