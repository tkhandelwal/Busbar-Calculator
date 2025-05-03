// src/components/BusbarResults.jsx
import React, { useRef, useState } from 'react';
import {
    Typography,
    Paper,
    Box,
    Divider,
    Chip,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Card,
    CardContent,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    PictureAsPdf as PdfIcon,
    Share as ShareIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import * as THREE from 'three';
import PropTypes from 'prop-types';


// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

// Helper function to format large numbers
const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(decimals)}k`;
    return num.toFixed(decimals);
};

// 3D Visualization Component using Three.js
const BusbarVisualization = ({ busbarWidth, busbarThickness, busbarLength, material }) => {
    const mountRef = useRef(null);

    React.useEffect(() => {
        if (!mountRef.current) return;

        // Basic Three.js setup
        const width = mountRef.current.clientWidth;
        const height = 300;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
        camera.position.set(busbarLength / 2, busbarWidth * 3, busbarThickness * 10);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;

        // Clear any existing canvas
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }

        mountRef.current.appendChild(renderer.domElement);

        // Create busbar geometry
        const geometry = new THREE.BoxGeometry(
            busbarLength || 1000,
            busbarThickness || 10,
            busbarWidth || 50
        );

        // Material colors based on busbar material
        const materialColor = material && material.toLowerCase() === 'copper'
            ? 0xcd7f32  // Copper color
            : 0xd3d3d3; // Aluminum color (light grey)

        const busbarMaterial = new THREE.MeshStandardMaterial({
            color: materialColor,
            metalness: 0.8,
            roughness: 0.2,
        });

        const busbar = new THREE.Mesh(geometry, busbarMaterial);
        busbar.castShadow = true;
        busbar.receiveShadow = true;
        scene.add(busbar);

        // Center the busbar
        busbar.position.set(0, 0, 0);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(busbarLength / 2, busbarWidth * 2, busbarThickness * 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Add a grid helper
        const gridHelper = new THREE.GridHelper(Math.max(busbarLength * 1.5, 2000), 20);
        gridHelper.position.y = -busbarThickness / 2 - 5;
        scene.add(gridHelper);

        // Controls for orbit would be added here in a full implementation

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Rotate busbar slowly
            busbar.rotation.y += 0.005;

            renderer.render(scene, camera);
        };

        animate();

        // Cleanup function
        return () => {
            scene.dispose();
            renderer.dispose();
        };
    }, [busbarWidth, busbarThickness, busbarLength, material]);

    return (
        <Box ref={mountRef} sx={{ width: '100%', height: 300, borderRadius: 1, overflow: 'hidden' }} />
    );
};

// Heatmap Component
const HeatmapVisualization = ({ data, title }) => {
    const canvasRef = useRef(null);

    React.useEffect(() => {
        if (!canvasRef.current || !data || !data.length) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // For demo purposes, create a simulated heatmap
        // In a real implementation, use the actual data
        const rows = data.length;
        const cols = data[0].length;

        const cellWidth = width / cols;
        const cellHeight = height / rows;

        // Find min and max values
        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                min = Math.min(min, data[i][j]);
                max = Math.max(max, data[i][j]);
            }
        }

        // Draw heatmap
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const value = data[i][j];
                const normalizedValue = (value - min) / (max - min);

                // Generate color (blue to red gradient)
                const r = Math.floor(normalizedValue * 255);
                const g = Math.floor((1 - normalizedValue) * 150);
                const b = Math.floor((1 - normalizedValue) * 255);

                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
            }
        }

        // Add color legend
        const legendHeight = 20;
        const legendY = height - legendHeight;

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, 'blue');
        gradient.addColorStop(0.5, 'green');
        gradient.addColorStop(1, 'red');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, legendY, width, legendHeight);

        // Legend labels
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(min.toFixed(2), 5, legendY + 15);
        ctx.fillText(max.toFixed(2), width - 50, legendY + 15);

    }, [data]);

    return (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>{title}</Typography>
            <canvas
                ref={canvasRef}
                width={300}
                height={200}
                style={{ border: '1px solid #ccc', borderRadius: '4px' }}
            />
        </Box>
    );
};

// Main BusbarResults component
const BusbarResults = ({ results }) => {
    const [showSafetyReport, setShowSafetyReport] = useState(false);

    if (!results) return null;

    // Prepare chart data for temperature comparison
    const temperatureData = {
        labels: ['Current Temperature', 'Maximum Allowable'],
        datasets: [
            {
                label: 'Temperature (°C)',
                data: [results.temperatureRise, results.maxAllowableTemperature],
                backgroundColor: [
                    results.temperatureRise >= results.maxAllowableTemperature ?
                        'rgba(255, 99, 132, 0.5)' : 'rgba(53, 162, 235, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                ],
            },
        ],
    };

    // Prepare chart data for mechanical stress
    const stressData = {
        labels: ['Current Stress', 'Maximum Allowable'],
        datasets: [
            {
                label: 'Stress (MPa)',
                data: [results.mechanicalStress / 1e6, results.maxAllowableMechanicalStress / 1e6],
                backgroundColor: [
                    results.mechanicalStress >= results.maxAllowableMechanicalStress ?
                        'rgba(255, 99, 132, 0.5)' : 'rgba(53, 162, 235, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                ],
            },
        ],
    };

    // Simulated FEM results for demo
    const simulatedFemResults = results.advancedResults ? {
        stressDistribution: Array(10).fill().map(() =>
            Array(10).fill().map(() => Math.random() * results.mechanicalStress)
        ),
        temperatureDistribution: Array(10).fill().map(() =>
            Array(10).fill().map(() => Math.random() * results.temperatureRise)
        )
    } : null;

    // Handle PDF generation
    const generatePDFReport = async () => {
        try {
            // In a real implementation, this would call the backend
            alert('Generating PDF Report...');
            // The actual API call would be:
            // const response = await fetch('/api/busbar/generate-report', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(results)
            // });
            // if (response.ok) {
            //   const blob = await response.blob();
            //   const url = window.URL.createObjectURL(blob);
            //   const a = document.createElement('a');
            //   a.href = url;
            //   a.download = 'busbar-report.pdf';
            //   document.body.appendChild(a);
            //   a.click();
            //   a.remove();
            // }
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                    Calculation Results
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<ShareIcon />}
                        sx={{ mr: 1 }}
                    >
                        Share
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PdfIcon />}
                        onClick={generatePDFReport}
                    >
                        Export PDF
                    </Button>
                </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Status indicator */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Chip
                    icon={results.isSizingSufficient ? <CheckCircleIcon /> : <WarningIcon />}
                    label={results.isSizingSufficient ? "Design is Acceptable" : "Design Needs Revision"}
                    color={results.isSizingSufficient ? "success" : "warning"}
                    sx={{ fontSize: '1rem', py: 2, px: 1 }}
                />
                <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                    {results.isSizingSufficient
                        ? "All parameters are within acceptable limits."
                        : "One or more parameters exceed recommended limits."}
                </Typography>
            </Box>

            {/* Main results grid */}
            <Grid container spacing={3}>
                {/* Left column - main results */}
                <Grid item xs={12} md={6}>
                    <TableContainer component={Paper} elevation={1}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Parameter</TableCell>
                                    <TableCell align="right">Value</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Required Cross-Section Area</TableCell>
                                    <TableCell align="right">{results.requiredCrossSectionArea.toFixed(2)} mm²</TableCell>
                                    <TableCell align="right">-</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Current Density</TableCell>
                                    <TableCell align="right">{results.currentDensity.toFixed(2)} A/mm²</TableCell>
                                    <TableCell align="right">-</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Temperature Rise</TableCell>
                                    <TableCell align="right">{results.temperatureRise.toFixed(2)} °C</TableCell>
                                    <TableCell align="right">
                                        {results.temperatureRise <= results.maxAllowableTemperature ?
                                            <CheckCircleIcon color="success" /> :
                                            <WarningIcon color="warning" />}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Max Allowable Temperature</TableCell>
                                    <TableCell align="right">{results.maxAllowableTemperature.toFixed(2)} °C</TableCell>
                                    <TableCell align="right">-</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Mechanical Stress</TableCell>
                                    <TableCell align="right">{(results.mechanicalStress / 1e6).toFixed(2)} MPa</TableCell>
                                    <TableCell align="right">
                                        {results.mechanicalStress <= results.maxAllowableMechanicalStress ?
                                            <CheckCircleIcon color="success" /> :
                                            <WarningIcon color="warning" />}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Max Allowable Stress</TableCell>
                                    <TableCell align="right">{(results.maxAllowableMechanicalStress / 1e6).toFixed(2)} MPa</TableCell>
                                    <TableCell align="right">-</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Short Circuit Force</TableCell>
                                    <TableCell align="right">{formatNumber(results.shortCircuitForce)} N</TableCell>
                                    <TableCell align="right">-</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                {/* Right column - recommended sizes */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Recommended Standard Sizes
                            </Typography>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Size (Width × Thickness)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {results.recommendedStandardSizes.map((size, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{size}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Visualization section */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Visualization
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                        {/* 3D Visualization */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>3D Model</Typography>
                            <BusbarVisualization
                                busbarWidth={50}
                                busbarThickness={10}
                                busbarLength={1000}
                                material="Copper"
                            />
                        </Grid>

                        {/* Charts */}
                        <Grid item xs={12} md={6}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>Temperature Analysis</Typography>
                                    <Box sx={{ height: 140 }}>
                                        <Bar
                                            data={temperatureData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { display: false }
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>Mechanical Stress Analysis</Typography>
                                    <Box sx={{ height: 140 }}>
                                        <Bar
                                            data={stressData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { display: false }
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Advanced FEM Analysis section */}
                {results.advancedResults && (
                    <Grid item xs={12}>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">Advanced FEM Analysis</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={3}>
                                    {/* Advanced FEM results table */}
                                    <Grid item xs={12} md={6}>
                                        <TableContainer component={Paper} elevation={1}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Parameter</TableCell>
                                                        <TableCell align="right">Value</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {Object.entries(results.advancedResults).map(([key, value]) => (
                                                        <TableRow key={key}>
                                                            <TableCell>
                                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {typeof value === 'number'
                                                                    ? value.toFixed(2)
                                                                    : typeof value === 'boolean'
                                                                        ? value ? 'Yes' : 'No'
                                                                        : value.toString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>

                                    {/* Heatmap visualizations */}
                                    <Grid item xs={12} md={6}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <HeatmapVisualization
                                                    data={simulatedFemResults.stressDistribution}
                                                    title="Stress Distribution"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <HeatmapVisualization
                                                    data={simulatedFemResults.temperatureDistribution}
                                                    title="Temperature Distribution"
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                )}

                {/* Safety Report section */}
                <Grid item xs={12}>
                    <Accordion expanded={showSafetyReport} onChange={() => setShowSafetyReport(!showSafetyReport)}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Safety Analysis & Recommendations</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>Safety Factors</Typography>
                                    <TableContainer component={Paper} elevation={1}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Parameter</TableCell>
                                                    <TableCell align="right">Safety Factor</TableCell>
                                                    <TableCell align="right">Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>Temperature</TableCell>
                                                    <TableCell align="right">
                                                        {(results.maxAllowableTemperature / results.temperatureRise).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {results.temperatureRise <= results.maxAllowableTemperature ?
                                                            <CheckCircleIcon color="success" /> :
                                                            <WarningIcon color="warning" />}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Mechanical Stress</TableCell>
                                                    <TableCell align="right">
                                                        {(results.maxAllowableMechanicalStress / results.mechanicalStress).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {results.mechanicalStress <= results.maxAllowableMechanicalStress ?
                                                            <CheckCircleIcon color="success" /> :
                                                            <WarningIcon color="warning" />}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Current Density</TableCell>
                                                    <TableCell align="right">
                                                        {(2.0 / results.currentDensity).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {results.currentDensity <= 2.0 ?
                                                            <CheckCircleIcon color="success" /> :
                                                            <WarningIcon color="warning" />}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>Recommendations</Typography>
                                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                        <Typography variant="body2" paragraph>
                                            Based on the analysis, the design is {results.isSizingSufficient ? 'acceptable' : 'not acceptable'} for the specified parameters.
                                        </Typography>

                                        {!results.isSizingSufficient && (
                                            <Typography variant="body2" paragraph>
                                                Consider these improvements:
                                                <ul>
                                                    {results.temperatureRise > results.maxAllowableTemperature && (
                                                        <li>Increase the cross-section area to reduce temperature rise</li>
                                                    )}
                                                    {results.mechanicalStress > results.maxAllowableMechanicalStress && (
                                                        <li>Increase thickness or reduce span length to decrease mechanical stress</li>
                                                    )}
                                                    {results.currentDensity > 2.0 && (
                                                        <li>Increase cross-section area to reduce current density</li>
                                                    )}
                                                </ul>
                                            </Typography>
                                        )}

                                        <Typography variant="body2">
                                            See recommended standard sizes for appropriate dimensions that meet requirements.
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Download section */}
                <Grid item xs={12}>
                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">
                            Want to save this design or share with colleagues?
                        </Typography>
                        <Box>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<DownloadIcon />}
                                onClick={generatePDFReport}
                                sx={{ mr: 1 }}
                            >
                                Download Report
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<ShareIcon />}
                            >
                                Share Design
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

// At the bottom of the file
BusbarResults.propTypes = {
    results: PropTypes.object
};

BusbarResults.defaultProps = {
    results: null
};

export default BusbarResults;