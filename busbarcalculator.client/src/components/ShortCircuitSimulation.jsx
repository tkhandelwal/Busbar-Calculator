// src/components/ShortCircuitSimulation.jsx
import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Button,
    Grid,
    TextField,
    Box,
    CircularProgress,
    Slider,
    InputLabel,
    FormControl,
    Select,
    MenuItem,
    Divider,
    Card,
    CardContent
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import PropTypes from 'prop-types';
import { TimerOutlined, BoltOutlined, LocalFireDepartmentOutlined } from '@mui/icons-material';

// Helper function to safely format numbers with toFixed
const safeToFixed = (value, digits = 2) => {
    if (value === null || value === undefined || isNaN(value)) {
        return '0.00';
    }
    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    // Check if it's actually a number after conversion
    return typeof numValue === 'number' ? numValue.toFixed(digits) : '0.00';
};

const ShortCircuitSimulation = ({ busbarData, onSimulationComplete }) => {
    const [simulationParams, setSimulationParams] = useState({
        duration: 1.0,
        timeSteps: 100
    });
    const [simulationResults, setSimulationResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedParameter, setSelectedParameter] = useState('current');

    const handleParamChange = (event) => {
        const { name, value } = event.target;
        setSimulationParams(prev => ({
            ...prev,
            [name]: parseFloat(value)
        }));
    };

    const handleSliderChange = (name) => (event, newValue) => {
        setSimulationParams(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleParameterChange = (event) => {
        setSelectedParameter(event.target.value);
    };

    const runSimulation = async () => {
        if (!busbarData) {
            setError("No busbar data available for simulation");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // In a real implementation, this would call your API
            // For this example, we'll simulate the API response
            await simulateShortCircuit();
        } catch (err) {
            setError(`Simulation failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Simulate API call with mock data
    const simulateShortCircuit = () => {
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                // Create simulated time-based data
                const timePoints = Array.from({ length: simulationParams.timeSteps },
                    (_, i) => i * (simulationParams.duration / (simulationParams.timeSteps - 1)));

                // Create simulated current values with initial peak and decay
                const currentValues = timePoints.map(t => {
                    const peakCurrent = busbarData.shortCircuitCurrent * 1000 * 2.5; // Convert kA to A with 2.5x peak factor
                    const steadyStateCurrent = busbarData.shortCircuitCurrent * 1000 * Math.sqrt(2); // RMS to peak
                    return peakCurrent * Math.exp(-t / 0.1) * Math.cos(2 * Math.PI * 50 * t) +
                        steadyStateCurrent * Math.sin(2 * Math.PI * 50 * t);
                });

                // Calculate force values based on currents
                const forceValues = currentValues.map(current => {
                    // F = μ0 * I^2 * L / (2π * d) - simplified
                    const force = 2e-7 * Math.pow(current, 2) * (busbarData.busbarLength / 1000) / (busbarData.phaseDistance / 1000);
                    return Math.abs(force); // Force magnitude
                });

                // Calculate temperature rise over time
                const temperatureValues = timePoints.map((t, index) => {
                    // Simplified temperature model that increases with time and current
                    const baseTemperature = busbarData.ambientTemperature;
                    const powerLoss = Math.pow(currentValues[index] / 1000, 2) * 0.05; // Simplified I²R
                    return baseTemperature + powerLoss * t * 10;
                });

                const results = {
                    timePoints,
                    currentValues,
                    forceValues,
                    temperatureValues,
                    maxCurrent: Math.max(...currentValues.map(Math.abs)),
                    maxForce: Math.max(...forceValues),
                    maxTemperature: Math.max(...temperatureValues)
                };

                setSimulationResults(results);
                if (onSimulationComplete) onSimulationComplete(results);
                resolve(results);
            }, 1500);
        });
    };

    // Format data for the chart
    const getChartData = () => {
        if (!simulationResults) return null;

        // Reduce the number of points for better visualization
        const samplingRate = Math.max(1, Math.floor(simulationResults.timePoints.length / 50));
        const sampledPoints = [];
        const sampledValues = [];

        for (let i = 0; i < simulationResults.timePoints.length; i += samplingRate) {
            sampledPoints.push(simulationResults.timePoints[i]);

            switch (selectedParameter) {
                case 'current':
                    sampledValues.push(simulationResults.currentValues[i] / 1000); // kA
                    break;
                case 'force':
                    sampledValues.push(simulationResults.forceValues[i]);
                    break;
                case 'temperature':
                    sampledValues.push(simulationResults.temperatureValues[i]);
                    break;
                default:
                    sampledValues.push(simulationResults.currentValues[i] / 1000);
            }
        }

        return {
            xAxis: [{ data: sampledPoints, label: 'Time (s)' }],
            series: [
                {
                    data: sampledValues,
                    label: selectedParameter === 'current' ? 'Current (kA)' :
                        selectedParameter === 'force' ? 'Force (N)' : 'Temperature (°C)',
                    color: selectedParameter === 'current' ? '#2196f3' :
                        selectedParameter === 'force' ? '#ff9800' : '#f44336'
                }
            ]
        };
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Short Circuit Simulation
            </Typography>
            <Typography variant="body1" paragraph>
                Analyze the effects of a short circuit on your busbar design over time.
                This simulation shows current flow, electromagnetic forces, and temperature rise.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Simulation Duration (s)"
                        name="duration"
                        type="number"
                        value={simulationParams.duration}
                        onChange={handleParamChange}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        inputProps={{ step: 0.1, min: 0.1, max: 10 }}
                    />
                    <Slider
                        value={simulationParams.duration}
                        onChange={handleSliderChange('duration')}
                        min={0.1}
                        max={10}
                        step={0.1}
                        valueLabelDisplay="auto"
                        marks={[
                            { value: 0.1, label: '0.1s' },
                            { value: 5, label: '5s' },
                            { value: 10, label: '10s' }
                        ]}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        label="Time Steps"
                        name="timeSteps"
                        type="number"
                        value={simulationParams.timeSteps}
                        onChange={handleParamChange}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        inputProps={{ step: 10, min: 10, max: 1000 }}
                    />
                    <Slider
                        value={simulationParams.timeSteps}
                        onChange={handleSliderChange('timeSteps')}
                        min={10}
                        max={1000}
                        step={10}
                        valueLabelDisplay="auto"
                        marks={[
                            { value: 10, label: '10' },
                            { value: 500, label: '500' },
                            { value: 1000, label: '1000' }
                        ]}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={runSimulation}
                        disabled={loading || !busbarData}
                        startIcon={loading ? <CircularProgress size={20} /> : <TimerOutlined />}
                        sx={{ mt: 2, mb: 4 }}
                        fullWidth
                    >
                        {loading ? 'Running Simulation...' : 'Run Simulation'}
                    </Button>
                </Grid>
            </Grid>

            {error && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            )}

            {simulationResults && (
                <>
                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>
                        Simulation Results
                    </Typography>

                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <ThunderboltOutlined color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="h6" component="div">
                                            Peak Current
                                        </Typography>
                                    </Box>
                                    <Typography variant="h4" color="primary">
                                        {safeToFixed(simulationResults.maxCurrent / 1000, 1)} kA
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {(simulationResults.maxCurrent / (busbarData.shortCircuitCurrent * 1000)).toFixed(1)}× nominal short circuit current
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <TimerOutlined color="warning" sx={{ mr: 1 }} />
                                        <Typography variant="h6" component="div">
                                            Maximum Force
                                        </Typography>
                                    </Box>
                                    <Typography variant="h4" color="warning.main">
                                        {safeToFixed(simulationResults.maxForce / 1000, 1)} kN
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {(simulationResults.maxForce / busbarData.shortCircuitForce).toFixed(1)}× static force calculation
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <LocalFireDepartmentOutlined color="error" sx={{ mr: 1 }} />
                                        <Typography variant="h6" component="div">
                                            Maximum Temperature
                                        </Typography>
                                    </Box>
                                    <Typography variant="h4" color="error.main">
                                        {safeToFixed(simulationResults.maxTemperature, 1)} °C
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {simulationResults.maxTemperature > busbarData.maxAllowableTemperature ?
                                            'Exceeds' : 'Within'} maximum allowable temperature
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Box sx={{ mb: 3 }}>
                        <FormControl sx={{ minWidth: 200, mb: 2 }}>
                            <InputLabel>Parameter</InputLabel>
                            <Select
                                value={selectedParameter}
                                onChange={handleParameterChange}
                                label="Parameter"
                            >
                                <MenuItem value="current">Current</MenuItem>
                                <MenuItem value="force">Electromagnetic Force</MenuItem>
                                <MenuItem value="temperature">Temperature</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ height: 400, width: '100%' }}>
                            <LineChart
                                dataset={getChartData().series[0].data}
                                xAxis={[{
                                    data: getChartData().xAxis[0].data,
                                    label: 'Time (s)'
                                }]}
                                series={[{
                                    data: getChartData().series[0].data,
                                    label: getChartData().series[0].label,
                                    color: getChartData().series[0].color,
                                    area: true
                                }]}
                                height={400}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Simulation Analysis
                        </Typography>
                        <Typography variant="body2" paragraph>
                            This simulation shows the dynamic behavior of your busbar during a short circuit event over {simulationParams.duration} seconds.
                            {simulationResults.maxTemperature > busbarData.maxAllowableTemperature ?
                                ` The temperature exceeds the maximum allowable limit of ${busbarData.maxAllowableTemperature}°C, indicating potential thermal stress issues.` :
                                ` The maximum temperature remains below the allowable limit of ${busbarData.maxAllowableTemperature}°C.`
                            }
                        </Typography>
                        <Typography variant="body2">
                            {simulationResults.maxForce > busbarData.shortCircuitForce * 1.5 ?
                                'The dynamic forces during short circuit are significantly higher than static calculations, suggesting that additional mechanical support may be required.' :
                                'The dynamic forces are within acceptable limits compared to the static calculations.'
                            }
                        </Typography>
                    </Box>
                </>
            )}
        </Paper>
    );
};

ShortCircuitSimulation.propTypes = {
    busbarData: PropTypes.object,
    onSimulationComplete: PropTypes.func
};

ShortCircuitSimulation.defaultProps = {
    busbarData: null,
    onSimulationComplete: null
};

export default ShortCircuitSimulation;