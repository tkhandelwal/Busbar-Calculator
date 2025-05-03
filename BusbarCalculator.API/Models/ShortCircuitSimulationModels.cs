// BusbarCalculator.API/Models/ShortCircuitSimulationModels.cs
using System;

namespace BusbarCalculator.API.Models
{
    // Request model for short circuit simulation
    public class ShortCircuitSimulationRequest
    {
        public BusbarInput BusbarInput { get; set; } = new BusbarInput();
        public double Duration { get; set; } = 1.0; // Duration in seconds
        public int TimeSteps { get; set; } = 100; // Number of calculation points
    }

    // Result model containing simulation data
    public class ShortCircuitSimulationResult
    {
        public double[] TimePoints { get; set; } = Array.Empty<double>();
        public double[] CurrentValues { get; set; } = Array.Empty<double>();
        public double[] ForceValues { get; set; } = Array.Empty<double>();
        public double[] TemperatureValues { get; set; } = Array.Empty<double>();
    }
}