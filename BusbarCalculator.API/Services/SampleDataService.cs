// BusbarCalculator.API/Services/SampleDataService.cs
using BusbarCalculator.API.Models;

namespace BusbarCalculator.API.Services
{
    public class SampleDataService
    {
        private readonly List<StandardBusbarConfig> _standardConfigs;

        public SampleDataService()
        {
            _standardConfigs = new List<StandardBusbarConfig>
            {
                // Low Voltage (LV) Busbars - 400V-1000V
                new StandardBusbarConfig
                {
                    Id = "lv-1",
                    Name = "LV Distribution Panel",
                    VoltageLevel = "LV",
                    Voltage = 0.4, // 400V
                    Current = 800,
                    Material = "Copper",
                    Width = 60,
                    Thickness = 10,
                    ShortCircuitCurrent = 50, // 50kA
                    PhaseDistance = 200,
                    Description = "Standard configuration for low voltage distribution panels"
                },
                new StandardBusbarConfig
                {
                    Id = "lv-2",
                    Name = "LV MCC Panel",
                    VoltageLevel = "LV",
                    Voltage = 0.69, // 690V
                    Current = 1250,
                    Material = "Copper",
                    Width = 80,
                    Thickness = 10,
                    ShortCircuitCurrent = 65, // 65kA
                    PhaseDistance = 250,
                    Description = "Configuration for motor control centers"
                },
                new StandardBusbarConfig
                {
                    Id = "lv-3",
                    Name = "LV Heavy Industry",
                    VoltageLevel = "LV",
                    Voltage = 0.4, // 400V
                    Current = 3200,
                    Material = "Copper",
                    Width = 100,
                    Thickness = 10,
                    ShortCircuitCurrent = 80, // 80kA
                    PhaseDistance = 300,
                    Description = "Heavy-duty configuration for industrial applications"
                },

                // Medium Voltage (MV) Busbars - 1kV to 36kV
                new StandardBusbarConfig
                {
                    Id = "mv-1",
                    Name = "MV Distribution 11kV",
                    VoltageLevel = "MV",
                    Voltage = 11, // 11kV
                    Current = 1250,
                    Material = "Copper",
                    Width = 100,
                    Thickness = 10,
                    ShortCircuitCurrent = 25, // 25kA
                    PhaseDistance = 450,
                    Description = "Standard MV distribution at 11kV"
                },
                new StandardBusbarConfig
                {
                    Id = "mv-2",
                    Name = "MV Distribution 33kV",
                    VoltageLevel = "MV",
                    Voltage = 33, // 33kV
                    Current = 1600,
                    Material = "Copper",
                    Width = 120,
                    Thickness = 10,
                    ShortCircuitCurrent = 31.5, // 31.5kA
                    PhaseDistance = 550,
                    Description = "Higher capacity MV distribution at 33kV"
                },
                new StandardBusbarConfig
                {
                    Id = "mv-3",
                    Name = "MV Industrial 22kV",
                    VoltageLevel = "MV",
                    Voltage = 22, // 22kV
                    Current = 2000,
                    Material = "Aluminum",
                    Width = 150,
                    Thickness = 15,
                    ShortCircuitCurrent = 40, // 40kA
                    PhaseDistance = 500,
                    Description = "Industrial MV configuration with aluminum busbars"
                },

                // High Voltage (HV) Busbars - Above 36kV
                new StandardBusbarConfig
                {
                    Id = "hv-1",
                    Name = "HV Substation 110kV",
                    VoltageLevel = "HV",
                    Voltage = 110, // 110kV
                    Current = 2500,
                    Material = "Aluminum",
                    Width = 200,
                    Thickness = 20,
                    ShortCircuitCurrent = 40, // 40kA
                    PhaseDistance = 1500,
                    Description = "High voltage substation busbar arrangement"
                },
                new StandardBusbarConfig
                {
                    Id = "hv-2",
                    Name = "HV Transmission 220kV",
                    VoltageLevel = "HV",
                    Voltage = 220, // 220kV
                    Current = 3000,
                    Material = "Aluminum",
                    Width = 250,
                    Thickness = 25,
                    ShortCircuitCurrent = 50, // 50kA
                    PhaseDistance = 2000,
                    Description = "High voltage transmission busbar configuration"
                },
                new StandardBusbarConfig
                {
                    Id = "hv-3",
                    Name = "HV Ultra-Heavy 400kV",
                    VoltageLevel = "HV",
                    Voltage = 400, // 400kV
                    Current = 4000,
                    Material = "Aluminum",
                    Width = 300,
                    Thickness = 30,
                    ShortCircuitCurrent = 63, // 63kA
                    PhaseDistance = 3000,
                    Description = "Ultra-heavy duty HV busbar system for main transmission"
                }
            };
        }

        public List<StandardBusbarConfig> GetAll()
        {
            return _standardConfigs;
        }

        public List<StandardBusbarConfig> GetByVoltageLevel(string voltageLevel)
        {
            return _standardConfigs.Where(c => c.VoltageLevel.Equals(voltageLevel, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        public StandardBusbarConfig? GetById(string id)
        {
            return _standardConfigs.FirstOrDefault(c => c.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
        }
    }
}