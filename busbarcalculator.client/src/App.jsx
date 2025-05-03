// src/App.jsx
import React, { useState } from 'react';
import {
    Container, Typography, Box, Paper, Grid, Card, CardContent,
    Divider, AppBar, Toolbar, IconButton, Tabs, Tab, CircularProgress,
    Button, Tooltip, List, ListItem, ListItemText
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MenuIcon from '@mui/icons-material/Menu';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CalculateIcon from '@mui/icons-material/Calculate';
import BusbarForm from './components/BusbarForm';
import BusbarVisualization from './components/BusbarVisualization';
import HeatmapVisualization from './components/HeatmapVisualization';
import AIRecommendations from './components/AIRecommendations';
import FemFieldViewer from './components/FemFieldViewer';
import ShortCircuitSimulation from './components/ShortCircuitSimulation';


import './App.css';

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

// Format key function - convert camelCase to Title Case with spaces
const formatKey = (key) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .replace('FEM', 'FEM')
        .replace('Fem', 'FEM');
};

// Main theme
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
            default: '#f5f5f5',
        },
    },
    typography: {
        h1: {
            fontSize: '2.5rem',
            fontWeight: 500,
        },
        h5: {
            fontWeight: 500,
        },
    },
});

function App() {
    const [busbarData, setBusbarData] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleResultsCalculated = (results) => {
        console.log('Results received in App:', results);
        setBusbarData(results);
        // Set to Results tab when new results are calculated
        setActiveTab(1);
    };

    const handleGeneratePdf = async () => {
        if (!busbarData) return;

        setIsGeneratingPdf(true);
        try {
            // In a real implementation, this would call the API
            // For now, we'll just simulate a delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('PDF generated');
            // In a real implementation, this would trigger a download
            alert('PDF Report Generated');
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // Check if distribution data exists in advanced results
    const hasDistributionData = busbarData?.advancedResults && (
        busbarData.advancedResults.ForceDistribution ||
        busbarData.advancedResults.StressDistribution ||
        busbarData.advancedResults.TemperatureDistribution
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Busbar Calculator
                    </Typography>
                    {busbarData && (
                        <>
                            <Tooltip title="Save Configuration">
                                <IconButton color="inherit">
                                    <SaveIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Generate PDF Report">
                                <IconButton
                                    color="inherit"
                                    onClick={handleGeneratePdf}
                                    disabled={isGeneratingPdf}
                                >
                                    {isGeneratingPdf ? <CircularProgress size={24} color="inherit" /> : <PictureAsPdfIcon />}
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={handleTabChange} aria-label="busbar calculator tabs">
                            <Tab label="Calculator" icon={<CalculateIcon />} iconPosition="start" />
                            {busbarData && <Tab label="Results" />}
                        </Tabs>
                    </Box>

                    <Box role="tabpanel" hidden={activeTab !== 0} sx={{ py: 3 }}>
                        {activeTab === 0 && (
                            <>
                                <Typography variant="h4" component="h1" gutterBottom align="center">
                                    Busbar Design & Analysis
                                </Typography>
                                <Typography variant="body1" align="center" color="textSecondary" paragraph>
                                    Calculate and visualize busbar parameters for electrical design. Enter your specifications below or select from standard configurations.
                                </Typography>
                                <BusbarForm onResultsCalculated={handleResultsCalculated} />
                            </>
                        )}
                    </Box>

                    <Box role="tabpanel" hidden={activeTab !== 1} sx={{ py: 3 }}>
                        {activeTab === 1 && busbarData && (
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={8}>
                                    <Paper elevation={3} sx={{ p: 3 }}>
                                        <Typography variant="h5" component="h2" gutterBottom>
                                            Calculation Results
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />

                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <Card>
                                                    <CardContent>
                                                        <Typography variant="h6" gutterBottom>
                                                            Electrical Parameters
                                                        </Typography>
                                                        <List dense>
                                                            <ListItem>
                                                                <ListItemText
                                                                    primary="Required Cross-Section Area"
                                                                    secondary={`${safeToFixed(busbarData.requiredCrossSectionArea)} mm²`}
                                                                />
                                                            </ListItem>
                                                            <ListItem>
                                                                <ListItemText
                                                                    primary="Current Density"
                                                                    secondary={`${safeToFixed(busbarData.currentDensity)} A/mm²`}
                                                                />
                                                            </ListItem>
                                                            <ListItem>
                                                                <ListItemText
                                                                    primary="Temperature Rise"
                                                                    secondary={`${safeToFixed(busbarData.temperatureRise)} °C`}
                                                                />
                                                            </ListItem>
                                                            <ListItem>
                                                                <ListItemText
                                                                    primary="Max Allowable Temperature"
                                                                    secondary={`${safeToFixed(busbarData.maxAllowableTemperature)} °C`}
                                                                />
                                                            </ListItem>
                                                            <ListItem>
                                                                <ListItemText
                                                                    primary="Sizing Status"
                                                                    secondary={busbarData.isSizingSufficient ? "Sufficient" : "Insufficient"}
                                                                    secondaryTypographyProps={{
                                                                        color: busbarData.isSizingSufficient ? "success.main" : "error.main",
                                                                        fontWeight: 'bold'
                                                                    }}
                                                                />
                                                            </ListItem>
                                                        </List>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Card>
                                                    <CardContent>
                                                        <Typography variant="h6" gutterBottom>
                                                            Mechanical Parameters
                                                        </Typography>
                                                        <List dense>
                                                            <ListItem>
                                                                <ListItemText
                                                                    primary="Short Circuit Force"
                                                                    secondary={`${safeToFixed(busbarData.shortCircuitForce)} N`}
                                                                />
                                                            </ListItem>
                                                            <ListItem>
                                                                <ListItemText
                                                                    primary="Mechanical Stress"
                                                                    secondary={`${safeToFixed(busbarData.mechanicalStress / 1e6)} MPa`}
                                                                />
                                                            </ListItem>
                                                            <ListItem>
                                                                <ListItemText
                                                                    primary="Max Allowable Stress"
                                                                    secondary={`${safeToFixed(busbarData.maxAllowableMechanicalStress / 1e6)} MPa`}
                                                                />
                                                            </ListItem>
                                                        </List>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Card>
                                                    <CardContent>
                                                        <Typography variant="h6" gutterBottom>
                                                            Recommended Standard Sizes
                                                        </Typography>
                                                        <Grid container spacing={2}>
                                                            {busbarData.recommendedStandardSizes && busbarData.recommendedStandardSizes.map((size, index) => (
                                                                <Grid item key={index}>
                                                                    <Paper
                                                                        elevation={2}
                                                                        sx={{
                                                                            p: 2,
                                                                            bgcolor: index === 0 ? 'primary.light' : 'background.paper',
                                                                            color: index === 0 ? 'primary.contrastText' : 'text.primary'
                                                                        }}
                                                                    >
                                                                        {size}
                                                                        {index === 0 && (
                                                                            <Typography variant="caption" display="block">
                                                                                (Best match)
                                                                            </Typography>
                                                                        )}
                                                                    </Paper>
                                                                </Grid>
                                                            ))}
                                                        </Grid>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            {busbarData.advancedResults && (
                                                <Grid item xs={12}>
                                                    <Card>
                                                        <CardContent>
                                                            <Typography variant="h6" gutterBottom>
                                                                Advanced Analysis Results
                                                            </Typography>

                                                            {/* Display non-distribution advanced results */}
                                                            <Grid container spacing={2}>
                                                                {Object.entries(busbarData.advancedResults).map(([key, value]) => {
                                                                    // Skip distribution arrays from this display
                                                                    if (key.includes('Distribution')) {
                                                                        return null;
                                                                    }

                                                                    return (
                                                                        <Grid item xs={12} sm={6} lg={4} key={key}>
                                                                            <Typography variant="body2" color="textSecondary">
                                                                                {formatKey(key)}:
                                                                            </Typography>
                                                                            <Typography variant="body1">
                                                                                {typeof value === 'boolean'
                                                                                    ? (value ? 'Yes' : 'No')
                                                                                    : typeof value === 'number'
                                                                                        ? safeToFixed(value)
                                                                                        : String(value)}
                                                                            </Typography>
                                                                        </Grid>
                                                                    );
                                                                })}
                                                            </Grid>

                                                            {/* Distribution Visualizations */}
                                                            {hasDistributionData && (
                                                                <Box mt={4}>
                                                                    <Typography variant="h6" gutterBottom>
                                                                        Distribution Analysis
                                                                    </Typography>
                                                                    <Grid container spacing={3}>
                                                                        {busbarData.advancedResults.ForceDistribution && (
                                                                            <Grid item xs={12}>
                                                                                <HeatmapVisualization
                                                                                    distributionData={busbarData.advancedResults.ForceDistribution}
                                                                                    width={700}
                                                                                    height={250}
                                                                                    title="Force Distribution (N)"
                                                                                />
                                                                            </Grid>
                                                                        )}

                                                                        {busbarData.advancedResults.StressDistribution && (
                                                                            <Grid item xs={12}>
                                                                                <HeatmapVisualization
                                                                                    distributionData={busbarData.advancedResults.StressDistribution}
                                                                                    width={700}
                                                                                    height={250}
                                                                                    title="Stress Distribution (MPa)"
                                                                                />
                                                                            </Grid>
                                                                        )}

                                                                        {busbarData.advancedResults.TemperatureDistribution && (
                                                                            <Grid item xs={12}>
                                                                                <HeatmapVisualization
                                                                                    distributionData={busbarData.advancedResults.TemperatureDistribution}
                                                                                    width={700}
                                                                                    height={250}
                                                                                    title="Temperature Distribution (°C)"
                                                                                />
                                                                            </Grid>
                                                                        )}
                                                                    </Grid>
                                                                </Box>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            )}
                                        </Grid>

                                        <Box sx={{ mt: 4 }}>
                                            <Typography variant="h5" gutterBottom>
                                                3D Visualization
                                            </Typography>
                                            <BusbarVisualization busbarData={busbarData} />

                                            {busbarData?.advancedResults && (
                                                <FemFieldViewer busbarData={busbarData} />
                                            )}

                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => setActiveTab(0)}
                                                    sx={{ mr: 2 }}
                                                >
                                                    Back to Calculator
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    onClick={handleGeneratePdf}
                                                    startIcon={isGeneratingPdf ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
                                                    disabled={isGeneratingPdf}
                                                >
                                                    {isGeneratingPdf ? 'Generating...' : 'Generate PDF Report'}
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <AIRecommendations busbarData={busbarData} />
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}

export default App;