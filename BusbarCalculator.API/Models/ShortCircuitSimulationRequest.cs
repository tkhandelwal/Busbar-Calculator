// BusbarCalculator.API/Services/ShortCircuitSimulationService.cs
using System;
using BusbarCalculator.API.Models;
using Microsoft.Extensions.Logging;

namespace BusbarCalculator.API.Services
{
    // Interface definition - Make sure this isn't defined elsewhere
    public interface IShortCircuitService
    {
        ShortCircuitSimulationResult SimulateShortCircuit(ShortCircuitSimulationRequest request);
    }

    // Implementation
    public class ShortCircuitService : IShortCircuitService
    {
        private readonly ILogger<ShortCircuitService> _logger;

        // Constants for calculation
        private const double PERMEABILITY_VACUUM = 4 * Math.PI * 1e-7; // H/m

        public ShortCircuitService(ILogger<ShortCircuitService> logger)
        {
            _logger = logger;
        }

        public ShortCircuitSimulationResult SimulateShortCircuit(ShortCircuitSimulationRequest request)
        {
            _logger.LogInformation("Starting short circuit simulation for {Duration}s with {Steps} steps",
                request.Duration, request.TimeSteps);

            // Setup the result object with properly sized arrays
            var result = new ShortCircuitSimulationResult
            {
                TimePoints = new double[request.TimeSteps],
                CurrentValues = new double[request.TimeSteps],
                ForceValues = new double[request.TimeSteps],
                TemperatureValues = new double[request.TimeSteps]
            };

            // Extract input data for easier reference
            var input = request.BusbarInput;

            // Constants for calculation
            double tau = 0.1; // Time constant for DC component decay
            double omega = 2 * Math.PI * 50; // Angular frequency (50Hz system)
            double peakFactor = Math.Sqrt(2); // Peak factor for AC current
            double asymmetryFactor = 1.8; // Typical asymmetry factor for first peak

            // Initial values
            double steadyStateRMS = input.ShortCircuitCurrent * 1000; // Convert kA to A
            double initialPeak = steadyStateRMS * peakFactor * asymmetryFactor;

            // Material properties
            double resistivity = input.Material.ToLower() == "copper" ? 1.72e-8 : 2.82e-8; // Ω·m
            double specificHeat = input.Material.ToLower() == "copper" ? 385 : 900; // J/(kg·K)
            double density = input.Material.ToLower() == "copper" ? 8960 : 2700; // kg/m³

            // Geometry conversion to meters
            double width = input.BusbarWidth / 1000; // mm to m
            double thickness = input.BusbarThickness / 1000; // mm to m
            double length = input.BusbarLength / 1000; // mm to m
            double phaseDistance = input.PhaseDistance / 1000; // mm to m

            // Calculate cross section area and thermal mass
            double area = width * thickness; // m²
            double volume = area * length; // m³
            double mass = volume * density; // kg
            double resistance = resistivity * length / area; // Ω

            // Calculate time step
            double dt = request.Duration / (request.TimeSteps - 1);

            // Temperature tracking
            double currentTemperature = input.AmbientTemperature;

            // Simulate for each time step
            for (int i = 0; i < request.TimeSteps; i++)
            {
                double t = i * dt;
                result.TimePoints[i] = t;

                // Calculate current with DC decay component
                double dcComponent = initialPeak * Math.Exp(-t / tau);
                double acComponent = steadyStateRMS * peakFactor * Math.Sin(omega * t);
                result.CurrentValues[i] = Math.Abs(acComponent + dcComponent * Math.Cos(omega * t));

                // Calculate electromagnetic force (F = μ₀*I₁*I₂/(2π*d))
                // For parallel conductors with equal currents
                double force = (PERMEABILITY_VACUUM * Math.Pow(result.CurrentValues[i], 2)) /
                               (2 * Math.PI * phaseDistance);
                result.ForceValues[i] = force * length; // Total force on the busbar

                // Calculate temperature rise
                double powerLoss = Math.Pow(result.CurrentValues[i], 2) * resistance; // I²R losses in watts
                double temperatureRise = powerLoss * dt / (mass * specificHeat); // ΔT = P·Δt/(m·c)

                // Update current temperature with some heat dissipation model
                // A simple model: heat dissipation proportional to temperature difference
                double dissipationFactor = 0.01; // Example factor
                double heatDissipation = (currentTemperature - input.AmbientTemperature) * dissipationFactor * dt;
                currentTemperature += temperatureRise - heatDissipation;

                result.TemperatureValues[i] = currentTemperature;
            }

            _logger.LogInformation("Short circuit simulation completed. Max current: {Current}A, " +
                                 "Max force: {Force}N, Final temperature: {Temp}°C",
                result.CurrentValues.Max(), result.ForceValues.Max(), result.TemperatureValues.Last());

            return result;
        }
    }
}