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
        public string SystemType { get; set; } = "SinglePhase"; // SinglePhase, ThreePhase
        public string ConnectionType { get; set; } = "Delta"; // Delta, Star (for three-phase)
        public double LineVoltage { get; set; } // For three-phase
        public double PhaseVoltage { get; set; } // For three-phase
        public double PowerFactor { get; set; } = 0.9;
        public bool IsBalanced { get; set; } = true; // For three-phase
        public Dictionary<string, double> PhaseCurrents { get; set; } = new Dictionary<string, double>(); // For unbalanced three-phase
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