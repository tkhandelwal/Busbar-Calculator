// src/components/comparison/BusbarComparison.jsx
import React, { useState, useEffect } from 'react';
import {
    Typography,
    Paper,
    Grid,
    Box,
    Button,
    Divider,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Card,
    CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { calculateBusbar } from '../../services/api';
import { getStandardConfigs } from '../../services/api';
import BusbarForm from '../BusbarForm';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    ChartTooltip,
    Legend
);

const BusbarComparison = () => {
    const [busbarConfigs, setBusbarConfigs] = useState([]);
    const [standardConfigs, setStandardConfigs] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addingConfig, setAddingConfig] = useState(false);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchStandardConfigs = async () => {
            try {
                const configs = await getStandardConfigs();
                setStandardConfigs(configs);
            } catch (error) {
                console.error('Failed to fetch standard configurations:', error);
            }
        };

        fetchStandardConfigs();
    }, []);

    useEffect(() => {
        if (results.length > 0) {
            // Generate chart data based on results
            const generateChartData = () => {
                return {
                    labels: results.map((r, i) => r.name || `Config ${i + 1}`),
                    datasets: [
                        {
                            label: 'Temperature Rise (°C)',
                            data: results.map(r => r.temperatureRise),
                            backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        },
                        {
                            label: 'Current Density (A/mm²)',
                            data: results.map(r => r.currentDensity),
                            backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        },
                        {
                            label: 'Mechanical Stress (MPa)',
                            data: results.map(r => r.mechanicalStress / 1e6), // Convert Pa to MPa
                            backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        }
                    ],
                };
            };

            setChartData(generateChartData());
        }
    }, [results]);

    const handleAddStandardConfig = (config) => {
        // Add a standard configuration to comparison
        const newConfig = {
            ...config,
            isStandard: true,
            name: config.name,
        };

        setBusbarConfigs([...busbarConfigs, newConfig]);
        calculateConfig(newConfig);
    };

    const handleAddCustomConfig = (formData) => {
        // Add a custom configuration from the form
        const newConfig = {
            ...formData,
            isStandard: false,
            name: formData.name || `Custom Config ${busbarConfigs.length + 1}`,
        };

        setBusbarConfigs([...busbarConfigs, newConfig]);
        calculateConfig(newConfig);
        setAddingConfig(false);
    };

    const handleRemoveConfig = (index) => {
        const updatedConfigs = [...busbarConfigs];
        updatedConfigs.splice(index, 1);
        setBusbarConfigs(updatedConfigs);

        const updatedResults = [...results];
        updatedResults.splice(index, 1);
        setResults(updatedResults);
    };

    const calculateConfig = async (config) => {
        setLoading(true);
        try {
            const busbarInput = {
                current: config.current,
                voltage: config.voltage,
                material: config.material,
                ambientTemperature: config.ambientTemperature || 40,
                arrangement: config.arrangement || 'Horizontal',
                phaseDistance: config.phaseDistance,
                shortCircuitCurrent: config.shortCircuitCurrent,
                busbarLength: config.busbarLength || 1000,
                busbarWidth: config.width || config.busbarWidth,
                busbarThickness: config.thickness || config.busbarThickness,
                numberOfBarsPerPhase: config.numberOfBarsPerPhase || 1,
                voltageLevel: config.voltageLevel,
                useAdvancedCalculation: false
            };

            const result = await calculateBusbar(busbarInput);

            // Add name and input parameters to result
            result.name = config.name;
            result.input = busbarInput;

            setResults([...results, result]);
        } catch (error) {
            console.error('Error calculating config:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Busbar Configuration Comparison
            </Typography>
            <Typography variant="body1" paragraph>
                Compare different busbar configurations to find the optimal solution for your application.
            </Typography>

            <Grid container spacing={3}>
                {/* Configuration Cards */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Standard Configurations
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                            {standardConfigs.map((config) => (
                                <Grid item xs={12} key={config.id}>
                                    <Card variant="outlined">
                                        <CardContent sx={{ pb: 1 }}>
                                            <Typography variant="subtitle1">
                                                {config.name}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {config.voltageLevel} - {config.voltage}kV, {config.current}A
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {config.material}, {config.width}×{config.thickness}mm
                                            </Typography>
                                            <Button
                                                size="small"
                                                startIcon={<AddCircleIcon />}
                                                onClick={() => handleAddStandardConfig(config)}
                                                sx={{ mt: 1 }}
                                            >
                                                Add to Comparison
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}

                            <Grid item xs={12}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => setAddingConfig(true)}
                                    disabled={addingConfig}
                                >
                                    Add Custom Configuration
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Comparison Results */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Comparison Results
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {busbarConfigs.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="body1" color="textSecondary">
                                    Add configurations to start comparing
                                </Typography>
                            </Box>
                        ) : loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer sx={{ mb: 3 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Configuration</TableCell>
                                                <TableCell>Material</TableCell>
                                                <TableCell>Size (mm)</TableCell>
                                                <TableCell>Temp. Rise (°C)</TableCell>
                                                <TableCell>Current Density (A/mm²)</TableCell>
                                                <TableCell>Mech. Stress (MPa)</TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {results.map((result, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{result.name}</TableCell>
                                                    <TableCell>{result.input.material}</TableCell>
                                                    <TableCell>{result.input.busbarWidth}×{result.input.busbarThickness}</TableCell>
                                                    <TableCell>{result.temperatureRise.toFixed(2)}</TableCell>
                                                    <TableCell>{result.currentDensity.toFixed(2)}</TableCell>
                                                    <TableCell>{(result.mechanicalStress / 1e6).toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <Tooltip title="Remove">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleRemoveConfig(index)}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {chartData && (
                                    <Box sx={{ height: 400 }}>
                                        <Bar
                                            data={chartData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'top',
                                                    },
                                                    title: {
                                                        display: true,
                                                        text: 'Comparison Chart',
                                                    },
                                                },
                                            }}
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Form for adding custom configuration */}
            {addingConfig && (
                <Grid container sx={{ mt: 3 }}>
                    <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    Add Custom Configuration
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => setAddingConfig(false)}
                                >
                                    Cancel
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <BusbarForm
                                onResultsCalculated={handleAddCustomConfig}
                                isForComparison={true}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default BusbarComparison;