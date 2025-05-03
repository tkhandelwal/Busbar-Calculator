// src/components/PowerCableCalculator.jsx
import React, { useState } from 'react';
import {
    Paper, Typography, Grid, TextField, Button,
    FormControl, InputLabel, Select, MenuItem,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Box, Divider, Alert, CircularProgress
} from '@mui/material';
import PowerCableVisualization from './PowerCableVisualization';

const PowerCableCalculator = () => {
    const [cableData, setCableData] = useState({
        current: '',
        voltage: '',
        length: '',
        cableType: 'copper',
        insulation: 'pvc',
        installationMethod: 'conduit',
        temperature: 30,
        voltageDrop: 5
    });

    const [results, setResults] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCableData(prev => ({ ...prev, [name]: value }));
    };

    const validateInputs = () => {
        const { current, voltage, length } = cableData;
        const errors = {};

        if (!current || isNaN(current) || Number(current) <= 0) {
            errors.current = "Current must be a positive number";
        }

        if (!voltage || isNaN(voltage) || Number(voltage) <= 0) {
            errors.voltage = "Voltage must be a positive number";
        }

        if (!length || isNaN(length) || Number(length) <= 0) {
            errors.length = "Length must be a positive number";
        }

        return { isValid: Object.keys(errors).length === 0, errors };
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { isValid, errors } = validateInputs();

        if (!isValid) {
            setError(`Please fix the following errors: ${Object.values(errors).join(', ')}`);
            return;
        }

        setError(null);
        setIsCalculating(true);

        // Use setTimeout to simulate API call and avoid UI freezing
        setTimeout(() => {
            try {
                calculateCableParameters();
                setIsCalculating(false);
            } catch (err) {
                setError("An error occurred during calculation");
                setIsCalculating(false);
            }
        }, 800);
    };

    const calculateCableParameters = () => {
        // Parse inputs, ensuring we have numeric values
        const current = Number(cableData.current);
        const voltage = Number(cableData.voltage);
        const length = Number(cableData.length);
        const { cableType, insulation, installationMethod, temperature, voltageDrop } = cableData;

        // Resistivity values (Ω·mm²/m)
        const resistivity = cableType === 'copper' ? 0.0171 : 0.0283; // copper vs aluminum

        // Temperature correction
        const tempCorrectionFactor = 1 + 0.004 * (Number(temperature) - 20);
        const correctedResistivity = resistivity * tempCorrectionFactor;

        // Current carrying capacity (ampacity) based on insulation and installation
        let baseAmpacity;
        if (cableType === 'copper') {
            baseAmpacity = insulation === 'pvc' ? 23 : 30; // Base values for 1.5mm²
        } else {
            baseAmpacity = insulation === 'pvc' ? 18 : 24; // Base values for 1.5mm²
        }

        // Installation method correction
        const installationFactor =
            installationMethod === 'conduit' ? 1.0 :
                installationMethod === 'duct' ? 0.8 :
                    installationMethod === 'underground' ? 0.9 :
                        installationMethod === 'freeAir' ? 1.1 : 1.0;

        // Required area calculations
        const maxVoltageDrop = Number(voltage) * (Number(voltageDrop) / 100); // Volts
        const requiredAreaForVD = (2 * correctedResistivity * current * length) / maxVoltageDrop;

        // Standard cable sizes in mm²
        const standardSizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];

        // Find suitable cables
        const suitableCables = standardSizes
            .filter(size => size >= requiredAreaForVD)
            .map(size => {
                const ampacity = Math.floor(baseAmpacity * (size / 1.5) * 0.7 * installationFactor);
                const isSufficientAmpacity = ampacity >= current;
                const resistance = (correctedResistivity * length) / size;
                const actualVoltageDrop = (2 * current * resistance) / voltage * 100; // percentage
                const powerLoss = current * current * resistance;

                return {
                    size,
                    ampacity,
                    isSufficientAmpacity,
                    resistance: resistance.toFixed(4),
                    voltageDrop: actualVoltageDrop.toFixed(2),
                    powerLoss: powerLoss.toFixed(2)
                };
            })
            .filter(cable => cable.isSufficientAmpacity)
            .slice(0, 5); // Top 5 suitable options

        setResults({
            requiredAreaForVD: requiredAreaForVD.toFixed(2),
            suitableCables
        });
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Power Cable Calculator
            </Typography>
            <Typography variant="body1" paragraph>
                Calculate the appropriate cable size based on your electrical requirements.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Current (A)"
                            name="current"
                            type="number"
                            value={cableData.current}
                            onChange={handleChange}
                            required
                            fullWidth
                            error={!!error && !cableData.current}
                            helperText={!cableData.current ? "Required" : ""}
                            inputProps={{ step: "0.1", min: "0.1" }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Voltage (V)"
                            name="voltage"
                            type="number"
                            value={cableData.voltage}
                            onChange={handleChange}
                            required
                            fullWidth
                            error={!!error && !cableData.voltage}
                            helperText={!cableData.voltage ? "Required" : ""}
                            inputProps={{ step: "1", min: "1" }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Cable Length (m)"
                            name="length"
                            type="number"
                            value={cableData.length}
                            onChange={handleChange}
                            required
                            fullWidth
                            error={!!error && !cableData.length}
                            helperText={!cableData.length ? "Required" : ""}
                            inputProps={{ step: "1", min: "1" }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Conductor Material</InputLabel>
                            <Select
                                name="cableType"
                                value={cableData.cableType}
                                onChange={handleChange}
                                label="Conductor Material"
                            >
                                <MenuItem value="copper">Copper</MenuItem>
                                <MenuItem value="aluminum">Aluminum</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Insulation Type</InputLabel>
                            <Select
                                name="insulation"
                                value={cableData.insulation}
                                onChange={handleChange}
                                label="Insulation Type"
                            >
                                <MenuItem value="pvc">PVC</MenuItem>
                                <MenuItem value="xlpe">XLPE</MenuItem>
                                <MenuItem value="epr">EPR</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Installation Method</InputLabel>
                            <Select
                                name="installationMethod"
                                value={cableData.installationMethod}
                                onChange={handleChange}
                                label="Installation Method"
                            >
                                <MenuItem value="conduit">Conduit</MenuItem>
                                <MenuItem value="duct">Cable Duct</MenuItem>
                                <MenuItem value="underground">Underground</MenuItem>
                                <MenuItem value="freeAir">Free Air</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Ambient Temperature (°C)"
                            name="temperature"
                            type="number"
                            value={cableData.temperature}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: "1", min: "-10", max: "60" }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Maximum Voltage Drop (%)"
                            name="voltageDrop"
                            type="number"
                            value={cableData.voltageDrop}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: "0.1", min: "0.1", max: "10" }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={isCalculating}
                            sx={{ mt: 2 }}
                            startIcon={isCalculating ? <CircularProgress size={20} /> : null}
                        >
                            {isCalculating ? 'Calculating...' : 'Calculate'}
                        </Button>
                    </Grid>
                </Grid>
            </form>

            {results && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Cable Selection Results
                    </Typography>

                    <Typography variant="body1" gutterBottom>
                        Minimum required area for voltage drop: {results.requiredAreaForVD} mm²
                    </Typography>

                    {/* Add visualization */}
                    {results.suitableCables && results.suitableCables.length > 0 && (
                        <PowerCableVisualization cableData={cableData} results={results} />
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Suitable Cable Options:
                    </Typography>

                    {results.suitableCables && results.suitableCables.length > 0 ? (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Cable Size (mm²)</TableCell>
                                        <TableCell>Ampacity (A)</TableCell>
                                        <TableCell>Resistance (Ω)</TableCell>
                                        <TableCell>Voltage Drop (%)</TableCell>
                                        <TableCell>Power Loss (W)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {results.suitableCables.map((cable) => (
                                        <TableRow key={cable.size}>
                                            <TableCell>{cable.size}</TableCell>
                                            <TableCell>{cable.ampacity}</TableCell>
                                            <TableCell>{cable.resistance}</TableCell>
                                            <TableCell>{cable.voltageDrop}</TableCell>
                                            <TableCell>{cable.powerLoss}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography color="error">
                            No suitable cable found for the given parameters. Try increasing the maximum voltage drop or decreasing the current/length.
                        </Typography>
                    )}

                    <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                            Recommendation
                        </Typography>
                        {results.suitableCables && results.suitableCables.length > 0 ? (
                            <Typography variant="body1">
                                The recommended cable size is <strong>{results.suitableCables[0].size} mm²</strong> with {cableData.cableType} conductor and {cableData.insulation.toUpperCase()} insulation.
                                This cable has an ampacity of {results.suitableCables[0].ampacity}A and will result in a voltage drop of {results.suitableCables[0].voltageDrop}%.
                            </Typography>
                        ) : (
                            <Typography variant="body1">
                                Consider using a larger cable size, shorter cable length, or allowing for a higher voltage drop percentage.
                            </Typography>
                        )}
                    </Box>
                </Box>
            )}
        </Paper>
    );
};

export default PowerCableCalculator;