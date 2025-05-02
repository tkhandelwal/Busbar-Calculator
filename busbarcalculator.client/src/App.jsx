// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
    Container,
    CssBaseline,
    Box,
    Paper,
    Typography,
    AppBar,
    Toolbar,
    Tab,
    Tabs,
    Grid,
    Button,
    Divider,
    Link
} from '@mui/material';

// Import components
import BusbarForm from './components/BusbarForm';
import BusbarVisualization from './components/BusbarVisualization';
import HeatmapVisualization from './components/HeatmapVisualization';
import FemVisualizationComponent from './components/FemVisualizationComponent';
import AIRecommendations from './components/AIRecommendations';
import './App.css';

// Create a Material-UI theme
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5'
        }
    },
    typography: {
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
    },
});

function App() {
    const [calculationResults, setCalculationResults] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);

    // Example data for FEM visualizations
    const dummyFemData = {
        temperatureDistribution: Array(10).fill().map(() => Array(10).fill().map(() => Math.random() * 100)),
        stressDistribution: Array(10).fill().map(() => Array(10).fill().map(() => Math.random() * 80)),
        width: 100,
        thickness: 10,
        length: 1000
    };

    const handleCalculationResults = (results) => {
        setCalculationResults(results);

        // Scroll to results section
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const formatValue = (value, unit) => {
        if (typeof value === 'number') {
            // For very large or very small numbers, use scientific notation
            if (value > 1000000 || value < 0.001) {
                return `${value.toExponential(2)} ${unit}`;
            }
            return `${value.toFixed(2)} ${unit}`;
        }
        return `${value} ${unit}`;
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AppBar position="static" elevation={2}>
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Busbar Calculator
                        </Typography>
                        <Button
                            color="inherit"
                            component="a"
                            href="https://github.com/yourusername/busbarcalculator"
                            target="_blank"
                        >
                            GitHub
                        </Button>
                    </Toolbar>
                </AppBar>

                <Container maxWidth="lg">
                    <Box sx={{ my: 4 }}>
                        <Routes>
                            <Route path="/" element={<Navigate to="/calculator" replace />} />
                            <Route
                                path="/calculator"
                                element={
                                    <>
                                        <Typography variant="h4" component="h1" gutterBottom>
                                            Electrical Busbar Design Calculator
                                        </Typography>
                                        <Typography paragraph color="text.secondary">
                                            Complete design tool for electrical busbars with advanced calculations, safety analysis, and 3D visualization.
                                        </Typography>

                                        <BusbarForm onResultsCalculated={handleCalculationResults} />

                                        {calculationResults && (
                                            <Box id="results-section" sx={{ mt: 6 }}>
                                                <Typography variant="h4" component="h2" gutterBottom>
                                                    Calculation Results
                                                </Typography>

                                                <Tabs
                                                    value={currentTab}
                                                    onChange={handleTabChange}
                                                    indicatorColor="primary"
                                                    textColor="primary"
                                                    variant="fullWidth"
                                                    sx={{ mb: 3 }}
                                                >
                                                    <Tab label="Summary" />
                                                    <Tab label="Visualization" />
                                                    <Tab label="Recommendations" />
                                                    <Tab label="Report" />
                                                </Tabs>

                                                {currentTab === 0 && (
                                                    <Grid container spacing={3}>
                                                        <Grid item xs={12} md={6}>
                                                            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                                                                <Typography variant="h6" gutterBottom>Main Parameters</Typography>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={6}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Required Cross-Section Area
                                                                        </Typography>
                                                                        <Typography variant="body1">
                                                                            {formatValue(calculationResults.requiredCrossSectionArea, 'mm²')}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Current Density
                                                                        </Typography>
                                                                        <Typography variant="body1">
                                                                            {formatValue(calculationResults.currentDensity, 'A/mm²')}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Temperature Rise
                                                                        </Typography>
                                                                        <Typography variant="body1">
                                                                            {formatValue(calculationResults.temperatureRise, '°C')}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Max Allowable Temperature
                                                                        </Typography>
                                                                        <Typography variant="body1">
                                                                            {formatValue(calculationResults.maxAllowableTemperature, '°C')}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Mechanical Stress
                                                                        </Typography>
                                                                        <Typography variant="body1">
                                                                            {formatValue(calculationResults.mechanicalStress / 1e6, 'MPa')}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Max Allowable Stress
                                                                        </Typography>
                                                                        <Typography variant="body1">
                                                                            {formatValue(calculationResults.maxAllowableMechanicalStress / 1e6, 'MPa')}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Short Circuit Force
                                                                        </Typography>
                                                                        <Typography variant="body1">
                                                                            {formatValue(calculationResults.shortCircuitForce, 'N')}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Design Status
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="body1"
                                                                            sx={{
                                                                                color: calculationResults.isSizingSufficient ? 'success.main' : 'error.main',
                                                                                fontWeight: 'bold'
                                                                            }}
                                                                        >
                                                                            {calculationResults.isSizingSufficient ? 'Acceptable' : 'Insufficient'}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </Paper>
                                                        </Grid>

                                                        <Grid item xs={12} md={6}>
                                                            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                                                                <Typography variant="h6" gutterBottom>Recommended Standard Sizes</Typography>
                                                                <Box sx={{ mt: 2 }}>
                                                                    {calculationResults.recommendedStandardSizes.map((size, index) => (
                                                                        <Box key={index} sx={{
                                                                            p: 1,
                                                                            mb: 1,
                                                                            border: '1px solid',
                                                                            borderColor: 'primary.light',
                                                                            borderRadius: 1,
                                                                            backgroundColor: index === 0 ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
                                                                        }}>
                                                                            <Typography variant="body1">
                                                                                {size}
                                                                                {index === 0 && (
                                                                                    <Typography
                                                                                        component="span"
                                                                                        variant="body2"
                                                                                        color="primary.main"
                                                                                        sx={{ ml: 1 }}
                                                                                    >
                                                                                        (Recommended)
                                                                                    </Typography>
                                                                                )}
                                                                            </Typography>
                                                                        </Box>
                                                                    ))}
                                                                </Box>
                                                            </Paper>
                                                        </Grid>

                                                        {calculationResults.advancedResults && (
                                                            <Grid item xs={12}>
                                                                <Paper elevation={3} sx={{ p: 3 }}>
                                                                    <Typography variant="h6" gutterBottom>Advanced Analysis</Typography>
                                                                    <Grid container spacing={2}>
                                                                        {Object.entries(calculationResults.advancedResults).map(([key, value]) => (
                                                                            <Grid item xs={6} md={3} key={key}>
                                                                                <Typography variant="body2" color="text.secondary">
                                                                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                                                                                </Typography>
                                                                                <Typography variant="body1">
                                                                                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toFixed(2)}
                                                                                </Typography>
                                                                            </Grid>
                                                                        ))}
                                                                    </Grid>
                                                                </Paper>
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                )}

                                                {currentTab === 1 && (
                                                    <Grid container spacing={3}>
                                                        <Grid item xs={12}>
                                                            <Paper elevation={3} sx={{ p: 3 }}>
                                                                <Typography variant="h6" gutterBottom>3D Visualization</Typography>
                                                                <BusbarVisualization busbarData={calculationResults} />
                                                            </Paper>
                                                        </Grid>

                                                        <Grid item xs={12} md={6}>
                                                            <Paper elevation={3} sx={{ p: 3 }}>
                                                                <HeatmapVisualization
                                                                    distributionData={dummyFemData.temperatureDistribution}
                                                                    title="Temperature Distribution"
                                                                />
                                                            </Paper>
                                                        </Grid>

                                                        <Grid item xs={12} md={6}>
                                                            <Paper elevation={3} sx={{ p: 3 }}>
                                                                <HeatmapVisualization
                                                                    distributionData={dummyFemData.stressDistribution}
                                                                    title="Mechanical Stress Distribution"
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                    </Grid>
                                                )}

                                                {currentTab === 2 && (
                                                    <AIRecommendations busbarData={calculationResults} />
                                                )}

                                                {currentTab === 3 && (
                                                    <Paper elevation={3} sx={{ p: 3 }}>
                                                        <Typography variant="h6" gutterBottom>Technical Report</Typography>
                                                        <Typography paragraph>
                                                            Full PDF report with all calculations and design parameters.
                                                        </Typography>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => {
                                                                // In a real implementation, this would generate and download a PDF
                                                                alert('PDF generation functionality would be implemented here');
                                                            }}
                                                        >
                                                            Generate PDF Report
                                                        </Button>
                                                    </Paper>
                                                )}
                                            </Box>
                                        )}
                                    </>
                                }
                            />
                        </Routes>
                    </Box>

                    <Divider sx={{ my: 6 }} />

                    <Box component="footer" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary" align="center">
                            © {new Date().getFullYear()} Busbar Calculator. All rights reserved.
                        </Typography>
                    </Box>
                </Container>
            </Router>
        </ThemeProvider>
    );
}

export default App;