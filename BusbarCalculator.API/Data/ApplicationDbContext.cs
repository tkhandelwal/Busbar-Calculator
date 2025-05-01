// ApplicationDbContext.cs
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using BusbarCalculator.API.Models;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace BusbarCalculator.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<AppUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Project> Projects { get; set; }
        public DbSet<LicenseInfo> Licenses { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure Project entity
            builder.Entity<Project>()
                .Property(p => p.BusbarInput)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, null),
                    v => System.Text.Json.JsonSerializer.Deserialize<BusbarInput>(v, null)
                );

            builder.Entity<Project>()
                .Property(p => p.BusbarResult)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, null),
                    v => System.Text.Json.JsonSerializer.Deserialize<BusbarResult>(v, null)
                );

            builder.Entity<Project>()
                .Property(p => p.Tags)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );

            // Configure LicenseInfo entity
            builder.Entity<LicenseInfo>()
                .Property(l => l.Features)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );
        }
    }
}