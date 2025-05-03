// src/components/ShortCircuitSimulation.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, CircularProgress,
    Tabs, Tab, Grid, FormControl, InputLabel, Select, MenuItem, TextField
} from '@mui/material';
import { simulateShortCircuit } from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ShortCircuitSimulation = ({ busbarData }) => {
    const [loading, setLoading] = useState(false);
    const [simulationResults, setSimulationResults] = useState(null);
    const [duration, setDuration] = useState(1.0);
    const [timeSteps, setTimeSteps] = useState(100);
    const [tabValue, setTabValue] = useState(0);

    const handleRunSimulation = async () => {
        if (!busbarData) return;

        setLoading(true);
        try {
            const request = {
                busbarInput: busbarData,
                duration: duration,
                timeSteps: timeSteps
            };

            const results = await simulateShortCircuit(request);
            setSimulationResults(results);
        } catch (error) {
            console.error('Error running simulation:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const getChartData = (label, dataPoints, borderColor) => {
        if (!simulationResults) return null;

        return {
            labels: simulationResults.timePoints.map(t => t.toFixed(3)),
            datasets: [
                {
                    label: label,
                    data: dataPoints,
                    borderColor: borderColor,
                    backgroundColor: borderColor + '33',
                    fill: true,
                    tension: 0.3
                }
            ]
        };
    };

    const getChartOptions = (title, yAxisLabel) => {
        return {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: title
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (s)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: yAxisLabel
                    }
                }
            }
        };
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Short Circuit Time-Domain Simulation
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <TextField
                        label="Simulation Duration (s)"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(parseFloat(e.target.value))}
                        inputProps={{ min: 0.1, max: 10, step: 0.1 }}
                        fullWidth
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        label="Time Steps"
                        type="number"
                        value={timeSteps}
                        onChange={(e) => setTimeSteps(parseInt(e.target.value))}
                        inputProps={{ min: 10, max: 1000, step: 10 }}
                        fullWidth
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleRunSimulation}
                        disabled={loading || !busbarData}
                        fullWidth
                        sx={{ mt: 3 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Run Simulation'}
                    </Button>
                </Grid>
            </Grid>

            {simulationResults && (
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={tabValue} onChange={handleTabChange}>
                            <Tab label="Current" />
                            <Tab label="Force" />
                            <Tab label="Temperature" />
                        </Tabs>
                    </Box>

                    {tabValue === 0 && (
                        <Box sx={{ height: 400 }}>
                            <Line
                                data={getChartData('Current', simulationResults.currentValues, '#f44336')}
                                options={getChartOptions('Short Circuit Current', 'Current (A)')}
                            />
                        </Box>
                    )}

                    {tabValue === 1 && (
                        <Box sx={{ height: 400 }}>
                            <Line
                                data={getChartData('Force', simulationResults.forceValues, '#2196f3')}
                                options={getChartOptions('Electromagnetic Force', 'Force (N)')}
                            />
                        </Box>
                    )}

                    {tabValue === 2 && (
                        <Box sx={{ height: 400 }}>
                            <Line
                                data={getChartData('Temperature', simulationResults.temperatureValues, '#ff9800')}
                                options={getChartOptions('Temperature Rise', 'Temperature (°C)')}
                            />
                        </Box>
                    )}
                </Box>
            )}
        </Paper>
    );
};

export default ShortCircuitSimulation;