// BusbarCalculator.API/Models/BusbarInput.cs
namespace BusbarCalculator.API.Models
{
    public class BusbarInput
    {
        public double Current { get; set; }
        public double Voltage { get; set; }
        public string Material { get; set; } = "Copper";
        public double AmbientTemperature { get; set; } = 40.0;
        public string Arrangement { get; set; } = "Horizontal";
        public double PhaseDistance { get; set; }
        public double ShortCircuitCurrent { get; set; }
        public double BusbarLength { get; set; }
        public double BusbarWidth { get; set; }
        public double BusbarThickness { get; set; }
        public int NumberOfBarsPerPhase { get; set; } = 1;
        public bool UseAdvancedCalculation { get; set; } = false;
        public string VoltageLevel { get; set; } = "LV"; // LV, MV, HV
    }

    public class BusbarResult
    {
        public double RequiredCrossSectionArea { get; set; }
        public double CurrentDensity { get; set; }
        public double ShortCircuitForce { get; set; }
        public double TemperatureRise { get; set; }
        public double MaxAllowableTemperature { get; set; }
        public bool IsSizingSufficient { get; set; }
        public double MechanicalStress { get; set; }
        public double MaxAllowableMechanicalStress { get; set; }
        public List<string> RecommendedStandardSizes { get; set; } = new List<string>();
        public Dictionary<string, object> AdvancedResults { get; set; } = new Dictionary<string, object>();
    }

    // New model for standard busbar configurations
    public class StandardBusbarConfig
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public required string VoltageLevel { get; set; } // "LV", "MV", "HV"
        public double Voltage { get; set; } // in kV
        public double Current { get; set; } // in A
        public required string Material { get; set; }
        public double Width { get; set; } // in mm
        public double Thickness { get; set; } // in mm
        public double ShortCircuitCurrent { get; set; } // in kA
        public double PhaseDistance { get; set; } // in mm
        public required string Description { get; set; }
    }
}