// busbarcalculator.client/src/components/ResultsDisplay.jsx
import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Tabs,
    Tab,
    Button,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider,
    Chip
} from '@mui/material';
import { Download, Assessment, Visibility, Build } from '@mui/icons-material';
import BusbarVisualization from './BusbarVisualization';
import FemVisualizationComponent from './FemVisualizationComponent';
import ShortCircuitSimulation from './ShortCircuitSimulation';
import AIRecommendations from './AIRecommendations';
import EconomicComparison from './EconomicComparison';
import FemFieldViewer from './FemFieldViewer';
import HeatmapVisualization from './HeatmapVisualization';
import { generatePdfReport } from '../services/api';

const ResultsDisplay = ({ results }) => {
    const [currentTab, setCurrentTab] = useState(0);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);

    if (!results) {
        return null;
    }

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleGeneratePdf = async () => {
        try {
            setIsPdfGenerating(true);
            await generatePdfReport(results);
        } catch (error) {
            console.error('Failed to generate PDF', error);
            alert('Failed to generate PDF. Please try again later.');
        } finally {
            setIsPdfGenerating(false);
        }
    };

    // Extract FEM results if available
    const hasFemResults = results.advancedResults && Object.keys(results.advancedResults).length > 0;
    const femResults = hasFemResults ? results.advancedResults : null;

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2">
                    Calculation Results
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleGeneratePdf}
                    disabled={isPdfGenerating}
                >
                    {isPdfGenerating ? 'Generating...' : 'Generate PDF Report'}
                </Button>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                    <Tab icon={<Assessment />} label="Basic Results" />
                    <Tab icon={<Visibility />} label="Visualization" />
                    {hasFemResults && <Tab icon={<Build />} label="FEM Analysis" />}
                    <Tab label="Short Circuit" />
                    <Tab label="Economic Analysis" />
                    <Tab label="AI Recommendations" />
                </Tabs>
            </Box>

            {/* Basic Results Tab */}
            <TabPanel value={currentTab} index={0}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Required Cross-Section Area
                                </Typography>
                                <Typography variant="h4" color="primary">
                                    {results.requiredCrossSectionArea?.toFixed(2)} mm²
                                </Typography>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Based on current density: {results.currentDensity} A/mm²
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Temperature Rise
                                </Typography>
                                <Typography variant="h4" color={results.temperatureRise > results.maxAllowableTemperature ? 'error' : 'primary'}>
                                    {results.temperatureRise?.toFixed(1)} °C
                                </Typography>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Maximum allowable: {results.maxAllowableTemperature} °C
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Mechanical Stress
                                </Typography>
                                <Typography variant="h4" color={results.mechanicalStress > results.maxAllowableMechanicalStress ? 'error' : 'primary'}>
                                    {(results.mechanicalStress / 1e6)?.toFixed(1)} MPa
                                </Typography>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Maximum allowable: {(results.maxAllowableMechanicalStress / 1e6)?.toFixed(1)} MPa
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" gutterBottom>
                            Sizing Status
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Chip
                                label={results.isSizingSufficient ? 'Sufficient' : 'Insufficient'}
                                color={results.isSizingSufficient ? 'success' : 'error'}
                                sx={{ mr: 2 }}
                            />
                            <Typography variant="body1">
                                {results.isSizingSufficient
                                    ? 'The current busbar design meets all electrical and mechanical requirements.'
                                    : 'The current busbar design does not meet all requirements. Consider adjusting parameters.'}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Recommended Standard Sizes
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>Size (Width × Thickness)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {results.recommendedStandardSizes?.map((size, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{size}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    {hasFemResults && (
                        <Grid item xs={12}>
                            <Divider sx={{ my: 3 }} />
                            <Typography variant="h6" gutterBottom>
                                Advanced Results
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Parameter</TableCell>
                                            <TableCell>Value</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(results.advancedResults).map(([key, value]) => (
                                            <TableRow key={key}>
                                                <TableCell>
                                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                </TableCell>
                                                <TableCell>
                                                    {typeof value === 'boolean'
                                                        ? value ? 'Yes' : 'No'
                                                        : typeof value === 'number'
                                                            ? value.toFixed(2)
                                                            : String(value)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    )}
                </Grid>
            </TabPanel>

            {/* Visualization Tab */}
            <TabPanel value={currentTab} index={1}>
                <BusbarVisualization busbarData={results} />
            </TabPanel>

            {/* FEM Analysis Tab */}
            <TabPanel value={currentTab} index={2} hidden={!hasFemResults}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Finite Element Analysis Results
                        </Typography>
                        <Typography variant="body1" paragraph>
                            The FEM analysis shows the distribution of temperature, stress, and electromagnetic fields
                            across the busbar structure under operating conditions.
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <FemVisualizationComponent femResults={femResults} busbarData={results} />
                    </Grid>

                    <Grid item xs={12}>
                        <FemFieldViewer busbarData={results} />
                    </Grid>

                    {femResults.ForceDistribution && (
                        <Grid item xs={12} md={6}>
                            <HeatmapVisualization
                                distributionData={femResults.ForceDistribution}
                                title="Force Distribution"
                            />
                        </Grid>
                    )}

                    {femResults.StressDistribution && (
                        <Grid item xs={12} md={6}>
                            <HeatmapVisualization
                                distributionData={femResults.StressDistribution}
                                title="Stress Distribution"
                            />
                        </Grid>
                    )}

                    {femResults.TemperatureDistribution && (
                        <Grid item xs={12} md={6}>
                            <HeatmapVisualization
                                distributionData={femResults.TemperatureDistribution}
                                title="Temperature Distribution"
                            />
                        </Grid>
                    )}
                </Grid>
            </TabPanel>

            {/* Short Circuit Tab */}
            <TabPanel value={currentTab} index={hasFemResults ? 3 : 2}>
                <ShortCircuitSimulation busbarData={results} />
            </TabPanel>

            {/* Economic Analysis Tab */}
            <TabPanel value={currentTab} index={hasFemResults ? 4 : 3}>
                <EconomicComparison busbarData={results} />
            </TabPanel>

            {/* AI Recommendations Tab */}
            <TabPanel value={currentTab} index={hasFemResults ? 5 : 4}>
                <AIRecommendations busbarData={results} />
            </TabPanel>
        </Paper>
    );
};

// TabPanel component
function TabPanel(props) {
    const { children, value, index, hidden, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={hidden || value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {(hidden || value === index) && <Box>{children}</Box>}
        </div>
    );
}

export default ResultsDisplay;