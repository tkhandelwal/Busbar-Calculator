// Project Models
namespace BusbarCalculator.API.Models
{
    public class Project
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public string Description { get; set; }
        public string UserId { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastModifiedDate { get; set; }
        public BusbarInput BusbarInput { get; set; }
        public BusbarResult BusbarResult { get; set; }
        public string Notes { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
    }

    public class ProjectSummary
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastModifiedDate { get; set; }
    }
}