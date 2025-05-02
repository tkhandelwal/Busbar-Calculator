// BusbarCalculator.API/Services/BusbarCalculationService.cs
using BusbarCalculator.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BusbarCalculator.API.Services
{
    public class BusbarCalculationService
    {
        // Constants
        private const double COPPER_CURRENT_DENSITY = 1.6; // A/mm²
        private const double ALUMINUM_CURRENT_DENSITY = 1.0; // A/mm²
        private const double COPPER_RESISTIVITY = 1.72e-8; // Ω·m
        private const double ALUMINUM_RESISTIVITY = 2.82e-8; // Ω·m
        private const double PERMEABILITY_VACUUM = 4 * Math.PI * 1e-7; // H/m

        public BusbarResult CalculateBusbarParameters(BusbarInput input)
        {
            var result = new BusbarResult();

            // Calculate current density based on material
            double currentDensity = input.Material.ToLower() == "copper" ?
                COPPER_CURRENT_DENSITY : ALUMINUM_CURRENT_DENSITY;
            result.CurrentDensity = currentDensity;

            // Calculate required cross-section area with 25% safety factor
            double safetyFactor = 1.25;
            result.RequiredCrossSectionArea = (input.Current * safetyFactor) / currentDensity;

            // Calculate standard sizes that meet the requirement
            result.RecommendedStandardSizes = GetStandardSizes(result.RequiredCrossSectionArea, input.Material);

            // Calculate short circuit force if data is provided
            if (input.ShortCircuitCurrent > 0 && input.PhaseDistance > 0 && input.BusbarLength > 0)
            {
                result.ShortCircuitForce = CalculateShortCircuitForce(input);
            }

            // Calculate temperature rise if data is provided
            if (input.Current > 0 && input.BusbarWidth > 0 && input.BusbarThickness > 0)
            {
                result.TemperatureRise = CalculateTemperatureRise(input);
                result.MaxAllowableTemperature = GetMaxAllowableTemperature(input.Material);
                result.IsSizingSufficient = result.TemperatureRise <= result.MaxAllowableTemperature;
            }

            // Calculate mechanical stress
            if (input.ShortCircuitCurrent > 0 && input.BusbarLength > 0 &&
                input.BusbarWidth > 0 && input.BusbarThickness > 0)
            {
                result.MechanicalStress = CalculateMechanicalStress(input);
                result.MaxAllowableMechanicalStress = GetMaxAllowableMechanicalStress(input.Material);
            }

            // Perform advanced calculations if requested
            if (input.UseAdvancedCalculation)
            {
                result.AdvancedResults = PerformAdvancedCalculations(input);
            }

            return result;
        }

        private double CalculateShortCircuitForce(BusbarInput input)
        {
            // Force between parallel conductors (N/m)
            // F = (µ0 * I1 * I2) / (2π * d)
            // Convert kA to A for short circuit current
            double shortCircuitCurrentA = input.ShortCircuitCurrent * 1000;

            double forcePerUnitLength = (PERMEABILITY_VACUUM * Math.Pow(shortCircuitCurrentA, 2)) /
                                        (2 * Math.PI * (input.PhaseDistance / 1000)); // Convert mm to m

            // Total force accounting for effective conductor length
            double totalForce = forcePerUnitLength * (input.BusbarLength / 1000); // Convert mm to m

            return totalForce;
        }

        private double CalculateTemperatureRise(BusbarInput input)
        {
            // Simplified temperature rise calculation
            double resistivity = input.Material.ToLower() == "copper" ?
                COPPER_RESISTIVITY : ALUMINUM_RESISTIVITY;

            double crossSectionArea = input.BusbarWidth * input.BusbarThickness * input.NumberOfBarsPerPhase;
            double resistance = resistivity * (input.BusbarLength / 1000) / (crossSectionArea / 1e6); // Convert to m² 

            // Calculate power loss (I²R)
            double powerLoss = Math.Pow(input.Current, 2) * resistance;

            // Modified calculation based on voltage level
            double coefficientFactor = 0.05;
            switch (input.VoltageLevel.ToUpper())
            {
                case "MV":
                    coefficientFactor = 0.04; // MV busbars typically have better cooling
                    break;
                case "HV":
                    coefficientFactor = 0.03; // HV busbars typically have even better cooling
                    break;
                default:
                    coefficientFactor = 0.05; // LV default
                    break;
            }

            double temperatureRise = powerLoss * coefficientFactor;

            return temperatureRise;
        }

        private double CalculateMechanicalStress(BusbarInput input)
        {
            // Calculate moment of inertia
            double width = input.BusbarWidth / 1000; // Convert mm to m
            double thickness = input.BusbarThickness / 1000; // Convert mm to m
            double inertia = (width * Math.Pow(thickness, 3)) / 12;

            // Calculate mechanical stress based on bending moment
            double shortCircuitForce = CalculateShortCircuitForce(input);
            double length = input.BusbarLength / 1000; // Convert mm to m
            double bendingMoment = shortCircuitForce * length / 4; // Simplified approach
            double stress = (bendingMoment * (thickness / 2)) / inertia;

            return stress;
        }

        private Dictionary<string, object> PerformAdvancedCalculations(BusbarInput input)
        {
            // This would be where more complex calculations are performed
            // Potentially calling external libraries or services for FEM analysis
            var results = new Dictionary<string, object>();

            // Resonance frequency calculation
            double resonanceFrequency = CalculateResonanceFrequency(input);
            results.Add("ResonanceFrequency", resonanceFrequency);

            // Determine if FEM analysis is required based on complexity
            bool femRequired = DetermineFemRequirement(input);
            results.Add("FemAnalysisRequired", femRequired);

            // Skin effect calculations for AC systems
            if (input.Current > 1000 || input.ShortCircuitCurrent > 50)
            {
                results.Add("SkinEffectSignificant", true);
                results.Add("EffectiveResistanceIncrease", CalculateSkinEffectImpact(input));
            }

            // Magnetic field strength near the busbar
            results.Add("MagneticFieldStrength", CalculateMagneticFieldStrength(input));

            // Voltage drop calculation
            results.Add("VoltageDrop", CalculateVoltageDrop(input));

            return results;
        }

        private double CalculateResonanceFrequency(BusbarInput input)
        {
            // Material properties
            double youngModulus = input.Material.ToLower() == "copper" ? 117e9 : 69e9; // Pa
            double density = input.Material.ToLower() == "copper" ? 8960 : 2700; // kg/m³

            // Convert dimensions to meters
            double width = input.BusbarWidth / 1000; // m
            double thickness = input.BusbarThickness / 1000; // m
            double length = input.BusbarLength / 1000; // m

            double area = width * thickness;
            double inertia = (width * Math.Pow(thickness, 3)) / 12;

            // Simplified formula for first natural frequency of a cantilever beam
            double frequency = (1.875 * 1.875 / (2 * Math.PI * length * length)) *
                               Math.Sqrt((youngModulus * inertia) / (density * area));

            return frequency;
        }

        private bool DetermineFemRequirement(BusbarInput input)
        {
            // Criteria for determining if FEM analysis is required
            if (input.ShortCircuitCurrent > 40) return true; // High short circuit current
            if (input.VoltageLevel.ToUpper() == "HV") return true; // Always for HV
            if (input.Current > 2000) return true; // High current

            return false;
        }

        private double CalculateSkinEffectImpact(BusbarInput input)
        {
            // Simplified calculation of skin effect impact
            // For realistic applications, this would be much more complex

            // Frequency (assuming 50 or 60 Hz power systems)
            double frequency = 50.0;

            // Material properties
            double resistivity = input.Material.ToLower() == "copper" ?
                COPPER_RESISTIVITY : ALUMINUM_RESISTIVITY;

            // Calculate skin depth
            double skinDepth = Math.Sqrt(resistivity / (Math.PI * frequency * 4e-7));

            // Calculate ratio of effective to DC resistance
            double thickness = input.BusbarThickness / 1000; // Convert to meters

            // Simplified formula - real calculations would be much more complex
            double ratio;
            if (thickness > 2 * skinDepth)
            {
                // Skin effect is significant
                ratio = 1 + 0.2 * (thickness / skinDepth - 1);
            }
            else
            {
                // Minimal skin effect
                ratio = 1 + 0.05 * (thickness / skinDepth);
            }

            return ratio;
        }

        private double CalculateMagneticFieldStrength(BusbarInput input)
        {
            // Calculate magnetic field strength at 1m distance
            // B = μ0 * I / (2π * r)
            double distanceM = 1.0; // 1 meter away
            double magneticField = (PERMEABILITY_VACUUM * input.Current) / (2 * Math.PI * distanceM);

            return magneticField; // in Tesla
        }

        private double CalculateVoltageDrop(BusbarInput input)
        {
            // Simplified voltage drop calculation
            double resistivity = input.Material.ToLower() == "copper" ?
                COPPER_RESISTIVITY : ALUMINUM_RESISTIVITY;

            double crossSectionArea = (input.BusbarWidth * input.BusbarThickness * input.NumberOfBarsPerPhase) / 1e6; // m²
            double resistance = resistivity * (input.BusbarLength / 1000) / crossSectionArea; // Ohms

            // Voltage drop = I * R
            double voltageDrop = input.Current * resistance;

            return voltageDrop; // in Volts
        }

        private List<string> GetStandardSizes(double requiredArea, string material)
        {
            // This returns standard busbar sizes that meet the requirement
            var standardSizes = new List<string>();

            // Standard sizes for busbars (width x thickness in mm)
            var possibleSizes = new List<(int width, int thickness)>
            {
                (20, 5), (25, 5), (30, 5), (40, 5), (50, 5),
                (60, 5), (80, 5), (100, 5), (120, 5),
                (20, 10), (25, 10), (30, 10), (40, 10), (50, 10),
                (60, 10), (80, 10), (100, 10), (120, 10),
                (60, 15), (80, 15), (100, 15), (120, 15),
                (80, 20), (100, 20), (120, 20), (160, 20),
                (100, 30), (120, 30), (160, 30), (200, 30)
            };

            foreach (var size in possibleSizes)
            {
                double area = size.width * size.thickness;
                if (area >= requiredArea)
                {
                    standardSizes.Add($"{size.width}mm x {size.thickness}mm");
                }
            }

            return standardSizes.Take(5).ToList(); // Return top 5 recommendations
        }

        private double GetMaxAllowableTemperature(string material)
        {
            // Return maximum allowable temperature based on material
            return material.ToLower() == "copper" ? 90.0 : 80.0; // °C
        }

        private double GetMaxAllowableMechanicalStress(string material)
        {
            // Return maximum allowable mechanical stress based on material
            return material.ToLower() == "copper" ? 120e6 : 70e6; // Pa
        }
    }
}