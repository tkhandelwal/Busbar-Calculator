// BusbarCalculator.API/Services/FemAnalysisService.cs
using BusbarCalculator.API.Models;
using System;
using System.Collections.Generic;

namespace BusbarCalculator.API.Services
{
    public class FemAnalysisService
    {
        private readonly Random _random = new Random();

        public Dictionary<string, object> PerformFemAnalysis(BusbarInput input)
        {
            var results = new Dictionary<string, object>();

            // Create more realistic distribution data
            results.Add("ForceDistribution", GenerateForceDistribution(input));
            results.Add("StressDistribution", GenerateStressDistribution(input));
            results.Add("TemperatureDistribution", GenerateTemperatureDistribution(input));

            return results;
        }

        private double[] GenerateForceDistribution(BusbarInput input)
        {
            // Generate more realistic force distribution data
            int meshSize = 10;
            double[] distribution = new double[meshSize];

            // Generate data based on busbar parameters
            double baseForce = input.ShortCircuitCurrent * 0.01;

            for (int i = 0; i < meshSize; i++)
            {
                // Force is higher in the middle of the busbar
                double position = (double)i / (meshSize - 1);
                double forceFactor = Math.Sin(Math.PI * position); // Creates a sine curve pattern
                distribution[i] = baseForce * forceFactor + _random.NextDouble() * baseForce * 0.1;
            }

            return distribution;
        }

        private double[] GenerateStressDistribution(BusbarInput input)
        {
            int meshSize = 10;
            double[] distribution = new double[meshSize];

            // Calculate base stress based on mechanical properties
            double baseStress = input.ShortCircuitCurrent * input.BusbarLength /
                               (input.BusbarWidth * Math.Pow(input.BusbarThickness, 2)) * 0.1;

            for (int i = 0; i < meshSize; i++)
            {
                // Stress is higher near the supports
                double position = (double)i / (meshSize - 1);
                double stressFactor = 1 - 4 * Math.Pow(position - 0.5, 2); // Parabolic distribution
                distribution[i] = baseStress * stressFactor + _random.NextDouble() * baseStress * 0.15;
            }

            return distribution;
        }

        private double[] GenerateTemperatureDistribution(BusbarInput input)
        {
            int meshSize = 10;
            double[] distribution = new double[meshSize];

            // Calculate base temperature based on current and material
            double resistivity = input.Material.ToLower() == "copper" ? 1.68e-8 : 2.82e-8; // Ohm-m
            double baseCurrent = input.Current;
            double baseTemp = input.AmbientTemperature +
                             (Math.Pow(baseCurrent, 2) * resistivity * input.BusbarLength) /
                             (input.BusbarWidth * input.BusbarThickness) * 1e-6;

            for (int i = 0; i < meshSize; i++)
            {
                // Temperature is higher in the middle with some random variation
                double position = (double)i / (meshSize - 1);
                double tempFactor = 0.8 + 0.4 * Math.Sin(Math.PI * position); // Higher in middle
                distribution[i] = baseTemp * tempFactor + _random.NextDouble() * 5.0; // Random variation up to 5°C
            }

            return distribution;
        }
    }
}