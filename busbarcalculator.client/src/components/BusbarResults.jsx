// busbarcalculator.client/src/components/BusbarResults.jsx
import React from 'react';
import {
    Typography,
    Paper,
    Divider,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Box,
    Chip
} from '@mui/material';

const BusbarResults = ({ results }) => {
    if (!results) {
        return null;
    }

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 4, mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Calculation Results
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={4}>
                {/* Main Results */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Sizing Results
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Required Cross-Section Area
                                    </TableCell>
                                    <TableCell align="right">
                                        {results.requiredCrossSectionArea.toFixed(2)} mm²
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Current Density
                                    </TableCell>
                                    <TableCell align="right">
                                        {results.currentDensity.toFixed(2)} A/mm²
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Sizing Assessment
                                    </TableCell>
                                    <TableCell align="right">
                                        <Chip
                                            label={results.isSizingSufficient ? "Sufficient" : "Insufficient"}
                                            color={results.isSizingSufficient ? "success" : "error"}
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                {/* Thermal Results */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Thermal Performance
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Temperature Rise
                                    </TableCell>
                                    <TableCell align="right">
                                        {results.temperatureRise.toFixed(2)}°C
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Maximum Allowable Temperature
                                    </TableCell>
                                    <TableCell align="right">
                                        {results.maxAllowableTemperature}°C
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                {/* Mechanical Results */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Mechanical Performance
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Short Circuit Force
                                    </TableCell>
                                    <TableCell align="right">
                                        {results.shortCircuitForce.toFixed(2)} N
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Mechanical Stress
                                    </TableCell>
                                    <TableCell align="right">
                                        {(results.mechanicalStress / 1e6).toFixed(2)} MPa
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Maximum Allowable Stress
                                    </TableCell>
                                    <TableCell align="right">
                                        {(results.maxAllowableMechanicalStress / 1e6).toFixed(2)} MPa
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                {/* Recommended Sizes */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Recommended Standard Sizes
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {results.recommendedStandardSizes.map((size, index) => (
                            <Chip key={index} label={size} variant="outlined" />
                        ))}
                    </Box>
                </Grid>
            </Grid>

            {/* Advanced Results */}
            {results.advancedResults && Object.keys(results.advancedResults).length > 0 && (
                <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom>
                        Advanced Analysis Results
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableBody>
                                {Object.entries(results.advancedResults).map(([key, value]) => (
                                    <TableRow key={key}>
                                        <TableCell component="th" scope="row">
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        </TableCell>
                                        <TableCell align="right">
                                            {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Paper>
    );
};

export default BusbarResults;