// src/components/BusbarResults.jsx
import React, { useEffect, useMemo } from 'react';
import {
    Paper,
    Typography,
    Box,
    Grid,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip,
    Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const BusbarResults = ({ results }) => {
    if (!results) return null;

    // Create a unique ID for the chart
    const chartId = useMemo(() => `chart-${Date.now()}`, [results]);

    // Add cleanup effect
    useEffect(() => {
        // Cleanup function to destroy chart when component unmounts
        return () => {
            // Force cleanup of old chart instances
            const chartInstance = ChartJS.getChart(chartId);
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    }, [chartId]);

    // Chart.js data and options
    const chartData = {
        labels: ['Required Area', 'Temperature Rise', 'Mechanical Stress'],
        datasets: [
            {
                label: 'Current Values',
                data: [
                    results.requiredCrossSectionArea,
                    results.temperatureRise,
                    results.mechanicalStress / 1e6 // Convert to MPa for display
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
            {
                label: 'Maximum Allowable',
                data: [
                    0, // No max for required area
                    results.maxAllowableTemperature,
                    results.maxAllowableMechanicalStress / 1e6 // Convert to MPa for display
                ],
                backgroundColor: 'rgba(255, 206, 86, 0.6)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
                type: 'line',
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Busbar Parameters',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Calculation Results
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
                {/* Basic Results */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Basic Parameters
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText
                                    primary="Required Cross-Section Area"
                                    secondary={`${results.requiredCrossSectionArea.toFixed(2)} mm²`}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Current Density"
                                    secondary={`${results.currentDensity.toFixed(2)} A/mm²`}
                                />
                            </ListItem>
                        </List>
                    </Box>

                    <Typography variant="subtitle1" gutterBottom>
                        Recommended Standard Sizes:
                    </Typography>
                    <List dense>
                        {results.recommendedStandardSizes.map((size, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={size} />
                                {index === 0 && <Chip size="small" color="primary" label="Best Match" />}
                            </ListItem>
                        ))}
                    </List>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Thermal Analysis
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body1">
                            Temperature Rise: <strong>{results.temperatureRise.toFixed(2)}°C</strong>
                        </Typography>
                        <Typography variant="body1">
                            Maximum Allowable Temperature: <strong>{results.maxAllowableTemperature}°C</strong>
                        </Typography>

                        {results.temperatureRise > results.maxAllowableTemperature ? (
                            <Alert severity="error" sx={{ mt: 1 }}>
                                Temperature rise exceeds maximum allowable value!
                            </Alert>
                        ) : (
                            <Alert severity="success" sx={{ mt: 1 }}>
                                Temperature rise is within acceptable limits.
                            </Alert>
                        )}
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Mechanical Analysis
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body1">
                            Short Circuit Force: <strong>{results.shortCircuitForce.toFixed(2)} N</strong>
                        </Typography>
                        <Typography variant="body1">
                            Mechanical Stress: <strong>{(results.mechanicalStress / 1e6).toFixed(2)} MPa</strong>
                        </Typography>
                        <Typography variant="body1">
                            Maximum Allowable Stress: <strong>{(results.maxAllowableMechanicalStress / 1e6).toFixed(2)} MPa</strong>
                        </Typography>

                        {results.mechanicalStress > results.maxAllowableMechanicalStress ? (
                            <Alert severity="error" sx={{ mt: 1 }}>
                                Mechanical stress exceeds maximum allowable value!
                            </Alert>
                        ) : (
                            <Alert severity="success" sx={{ mt: 1 }}>
                                Mechanical stress is within acceptable limits.
                            </Alert>
                        )}
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    {results.advancedResults && Object.keys(results.advancedResults).length > 0 && (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Advanced Analysis
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                {results.advancedResults.femAnalysisRequired && (
                                    <Alert severity="info" sx={{ mb: 1 }}>
                                        Detailed FEM analysis is recommended for this configuration.
                                    </Alert>
                                )}

                                {results.advancedResults.resonanceFrequency && (
                                    <Typography variant="body1">
                                        Resonance Frequency: <strong>{results.advancedResults.resonanceFrequency.toFixed(2)} Hz</strong>
                                    </Typography>
                                )}

                                {/* Add more advanced results here */}
                            </Box>
                        </>
                    )}
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ mt: 3, height: 300 }}>
                        <Bar
                            key={chartId}  // Add a key
                            id={chartId}   // Add an id
                            data={chartData}
                            options={chartOptions}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default BusbarResults;