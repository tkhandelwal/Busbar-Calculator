// src/components/EconomicComparison.jsx
import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Grid, TextField, Button,
    FormControl, InputLabel, Select, MenuItem,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Box, Divider
} from '@mui/material';

const EconomicComparison = ({ busbarData }) => {
    const [analysisParams, setAnalysisParams] = useState({
        copperPricePerKg: 9.5,
        aluminumPricePerKg: 2.4,
        electricityCostPerKWh: 0.15,
        annualOperatingHours: 8760,
        projectLifespan: 20,
        discountRate: 5
    });

    const [results, setResults] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAnalysisParams(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const calculateNPV = (initialCost, annualCost, yearsCount, discountRate) => {
        let npv = -initialCost;
        for (let year = 1; year <= yearsCount; year++) {
            npv += annualCost / Math.pow(1 + discountRate / 100, year);
        }
        return npv;
    };

    const calculateResults = () => {
        if (!busbarData) return;

        // Density of materials (kg/m³)
        const copperDensity = 8960;
        const aluminumDensity = 2700;

        // Current busbar configuration
        const currentMaterial = busbarData.material || 'Copper';
        const width = busbarData.busbarWidth / 1000; // mm to m
        const thickness = busbarData.busbarThickness / 1000; // mm to m
        const length = busbarData.busbarLength / 1000; // mm to m
        const volume = width * thickness * length; // m³

        // Calculate weights
        const copperWeight = volume * copperDensity;
        const aluminumWeight = volume * aluminumDensity;

        // Calculate material costs
        const copperMaterialCost = copperWeight * analysisParams.copperPricePerKg;
        const aluminumMaterialCost = aluminumWeight * analysisParams.aluminumPricePerKg;

        // Resistivity (Ω·m)
        const copperResistivity = 1.72e-8;
        const aluminumResistivity = 2.82e-8;

        // Calculate resistance (Ω)
        const copperResistance = copperResistivity * length / (width * thickness);
        const aluminumResistance = aluminumResistivity * length / (width * thickness);

        // Calculate power losses (W)
        const current = busbarData.current || 1000; // A
        const copperPowerLoss = current * current * copperResistance;
        const aluminumPowerLoss = current * current * aluminumResistance;

        // Calculate annual energy loss (kWh)
        const copperAnnualEnergyLoss = copperPowerLoss * analysisParams.annualOperatingHours / 1000;
        const aluminumAnnualEnergyLoss = aluminumPowerLoss * analysisParams.annualOperatingHours / 1000;

        // Calculate annual energy cost
        const copperAnnualEnergyCost = copperAnnualEnergyLoss * analysisParams.electricityCostPerKWh;
        const aluminumAnnualEnergyCost = aluminumAnnualEnergyLoss * analysisParams.electricityCostPerKWh;

        // Calculate total cost of ownership (NPV)
        const copperTCO = calculateNPV(
            copperMaterialCost,
            copperAnnualEnergyCost,
            analysisParams.projectLifespan,
            analysisParams.discountRate
        );

        const aluminumTCO = calculateNPV(
            aluminumMaterialCost,
            aluminumAnnualEnergyCost,
            analysisParams.projectLifespan,
            analysisParams.discountRate
        );

        // Compare carbon footprint (example values, should be replaced with actual data)
        const copperCarbonFootprint = copperWeight * 3.0; // kg CO2e/kg copper
        const aluminumCarbonFootprint = aluminumWeight * 8.1; // kg CO2e/kg aluminum

        setResults({
            copper: {
                weight: copperWeight.toFixed(2),
                materialCost: copperMaterialCost.toFixed(2),
                resistance: copperResistance.toFixed(6),
                powerLoss: copperPowerLoss.toFixed(2),
                annualEnergyCost: copperAnnualEnergyCost.toFixed(2),
                tco: copperTCO.toFixed(2),
                carbonFootprint: copperCarbonFootprint.toFixed(2)
            },
            aluminum: {
                weight: aluminumWeight.toFixed(2),
                materialCost: aluminumMaterialCost.toFixed(2),
                resistance: aluminumResistance.toFixed(6),
                powerLoss: aluminumPowerLoss.toFixed(2),
                annualEnergyCost: aluminumAnnualEnergyCost.toFixed(2),
                tco: aluminumTCO.toFixed(2),
                carbonFootprint: aluminumCarbonFootprint.toFixed(2)
            },
            recommendation: copperTCO < aluminumTCO ? 'Copper' : 'Aluminum'
        });
    };

    useEffect(() => {
        if (busbarData) {
            calculateResults();
        }
    }, [busbarData, analysisParams]);

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Economic & Environmental Analysis
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <TextField
                        label="Copper Price ($/kg)"
                        name="copperPricePerKg"
                        type="number"
                        value={analysisParams.copperPricePerKg}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ step: 0.1, min: 0.1 }}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        label="Aluminum Price ($/kg)"
                        name="aluminumPricePerKg"
                        type="number"
                        value={analysisParams.aluminumPricePerKg}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ step: 0.1, min: 0.1 }}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        label="Electricity Cost ($/kWh)"
                        name="electricityCostPerKWh"
                        type="number"
                        value={analysisParams.electricityCostPerKWh}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ step: 0.01, min: 0.01 }}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        label="Annual Operating Hours"
                        name="annualOperatingHours"
                        type="number"
                        value={analysisParams.annualOperatingHours}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ step: 100, min: 1 }}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        label="Project Lifespan (years)"
                        name="projectLifespan"
                        type="number"
                        value={analysisParams.projectLifespan}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ step: 1, min: 1 }}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        label="Discount Rate (%)"
                        name="discountRate"
                        type="number"
                        value={analysisParams.discountRate}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ step: 0.1, min: 0.1 }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={calculateResults}
                        disabled={!busbarData}
                        sx={{ mt: 2 }}
                    >
                        Update Analysis
                    </Button>
                </Grid>
            </Grid>

            {results && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Comparison Results
                    </Typography>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Parameter</TableCell>
                                    <TableCell>Copper</TableCell>
                                    <TableCell>Aluminum</TableCell>
                                    <TableCell>Difference</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Weight (kg)</TableCell>
                                    <TableCell>{results.copper.weight}</TableCell>
                                    <TableCell>{results.aluminum.weight}</TableCell>
                                    <TableCell>{(parseFloat(results.copper.weight) - parseFloat(results.aluminum.weight)).toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Material Cost ($)</TableCell>
                                    <TableCell>{results.copper.materialCost}</TableCell>
                                    <TableCell>{results.aluminum.materialCost}</TableCell>
                                    <TableCell>{(parseFloat(results.copper.materialCost) - parseFloat(results.aluminum.materialCost)).toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Resistance (Ω)</TableCell>
                                    <TableCell>{results.copper.resistance}</TableCell>
                                    <TableCell>{results.aluminum.resistance}</TableCell>
                                    <TableCell>{(parseFloat(results.copper.resistance) - parseFloat(results.aluminum.resistance)).toFixed(6)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Power Loss (W)</TableCell>
                                    <TableCell>{results.copper.powerLoss}</TableCell>
                                    <TableCell>{results.aluminum.powerLoss}</TableCell>
                                    <TableCell>{(parseFloat(results.copper.powerLoss) - parseFloat(results.aluminum.powerLoss)).toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Annual Energy Cost ($)</TableCell>
                                    <TableCell>{results.copper.annualEnergyCost}</TableCell>
                                    <TableCell>{results.aluminum.annualEnergyCost}</TableCell>
                                    <TableCell>{(parseFloat(results.copper.annualEnergyCost) - parseFloat(results.aluminum.annualEnergyCost)).toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Total Cost of Ownership ($)</TableCell>
                                    <TableCell>{results.copper.tco}</TableCell>
                                    <TableCell>{results.aluminum.tco}</TableCell>
                                    <TableCell>{(parseFloat(results.copper.tco) - parseFloat(results.aluminum.tco)).toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Carbon Footprint (kg CO₂e)</TableCell>
                                    <TableCell>{results.copper.carbonFootprint}</TableCell>
                                    <TableCell>{results.aluminum.carbonFootprint}</TableCell>
                                    <TableCell>{(parseFloat(results.copper.carbonFootprint) - parseFloat(results.aluminum.carbonFootprint)).toFixed(2)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            Recommendation
                        </Typography>
                        <Typography variant="body1">
                            Based on total cost of ownership analysis over {analysisParams.projectLifespan} years,
                            <strong> {results.recommendation} </strong>
                            is the recommended material for this busbar application.
                        </Typography>
                    </Box>
                </Box>
            )}
        </Paper>
    );
};

export default EconomicComparison;