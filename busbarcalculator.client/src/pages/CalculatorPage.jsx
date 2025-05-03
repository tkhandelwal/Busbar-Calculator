// busbarcalculator.client/src/pages/CalculatorPage.jsx
import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    AppBar,
    Toolbar,
    Paper,
    Grid,
    Card,
    CardContent,
    Alert,
    IconButton
} from '@mui/material';
import { GitHub, Help } from '@mui/icons-material';
import BusbarForm from '../components/BusbarForm';
import ResultsDisplay from '../components/ResultsDisplay';
import PowerCableCalculator from '../components/PowerCableCalculator';

const CalculatorPage = () => {
    const [calculationResults, setCalculationResults] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    const handleResultsCalculated = (results) => {
        setCalculationResults(results);
        // Scroll to results
        setTimeout(() => {
            const resultsElement = document.getElementById('results-section');
            if (resultsElement) {
                resultsElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Busbar Calculator
                    </Typography>
                    <IconButton
                        color="inherit"
                        onClick={() => setShowHelp(!showHelp)}
                        aria-label="Help"
                    >
                        <Help />
                    </IconButton>
                    <IconButton
                        color="inherit"
                        href="https://github.com/yourusername/busbarcalculator"
                        target="_blank"
                        aria-label="GitHub repository"
                    >
                        <GitHub />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
                {showHelp && (
                    <Alert severity="info" sx={{ mb: 4 }} onClose={() => setShowHelp(false)}>
                        <Typography variant="subtitle1" gutterBottom>
                            How to use the Busbar Calculator:
                        </Typography>
                        <Typography variant="body2">
                            1. Enter the busbar parameters in the form below.<br />
                            2. You can either start from scratch or select a standard configuration.<br />
                            3. Click "Calculate" to generate results.<br />
                            4. View the different analysis tabs to explore the results in detail.<br />
                            5. Generate a PDF report for documentation.
                        </Typography>
                    </Alert>
                )}

                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: 'primary.light', color: 'white', borderRadius: 2 }}>
                            <Typography variant="h4" gutterBottom>
                                Electrical Busbar Design & Analysis
                            </Typography>
                            <Typography variant="subtitle1">
                                Comprehensive tool for calculating and analyzing electrical busbars for power distribution systems.
                                Design, simulate, and optimize busbar parameters for your specific requirements.
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Electrical Design
                                </Typography>
                                <Typography variant="body2">
                                    Calculate cross-section area, current density, temperature rise, and voltage drop based on current and material properties.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Mechanical Analysis
                                </Typography>
                                <Typography variant="body2">
                                    Determine short circuit forces, mechanical stress, and resonance frequency to ensure structural integrity.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Advanced FEM Analysis
                                </Typography>
                                <Typography variant="body2">
                                    Visualize temperature distribution, stress, and electromagnetic fields using finite element modeling techniques.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 6 }}>
                    <BusbarForm onResultsCalculated={handleResultsCalculated} />
                </Box>

                <Box id="results-section">
                    {calculationResults && (
                        <ResultsDisplay results={calculationResults} />
                    )}
                </Box>

                <Box sx={{ mt: 6 }}>
                    <PowerCableCalculator />
                </Box>
            </Container>

            <Box component="footer" sx={{ bgcolor: 'background.paper', py: 3, mt: 'auto' }}>
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © {new Date().getFullYear()} Busbar Calculator - Professional Electrical Design Tool
                    </Typography>
                </Container>
            </Box>
        </>
    );
};

export default CalculatorPage;