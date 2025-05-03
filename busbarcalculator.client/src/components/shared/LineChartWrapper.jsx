// src/components/shared/LineChartWrapper.jsx
import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Typography, Box, Paper } from '@mui/material';

/**
 * A wrapper for MUI LineChart that handles NaN and invalid values gracefully
 */
const LineChartWrapper = ({
    xAxis,
    series,
    height = 400,
    width = '100%',
    title = null,
    fallbackMessage = "Unable to display chart - invalid data"
}) => {
    // Validate chart data
    const isDataValid = () => {
        // Check if xAxis data contains NaN
        const hasValidXAxis = xAxis?.some(axis =>
            Array.isArray(axis.data) &&
            axis.data.length > 0 &&
            axis.data.every(val => val !== undefined && !isNaN(val))
        );

        // Check if series data contains NaN
        const hasValidSeries = series?.some(s =>
            Array.isArray(s.data) &&
            s.data.length > 0 &&
            s.data.every(val => val !== undefined && !isNaN(val))
        );

        return hasValidXAxis && hasValidSeries;
    };

    // Helper to sanitize data (remove NaN)
    const sanitizeData = () => {
        if (!xAxis || !series) return { xAxis, series };

        // Deep clone the data to avoid modifying props
        const cleanXAxis = xAxis.map(axis => {
            if (!axis.data) return axis;

            return {
                ...axis,
                data: Array.isArray(axis.data)
                    ? axis.data.map(val => isNaN(val) ? 0 : val)
                    : axis.data
            };
        });

        const cleanSeries = series.map(s => {
            if (!s.data) return s;

            return {
                ...s,
                data: Array.isArray(s.data)
                    ? s.data.map(val => isNaN(val) ? 0 : val)
                    : s.data
            };
        });

        return { xAxis: cleanXAxis, series: cleanSeries };
    };

    // Return fallback UI if chart data is invalid
    if (!isDataValid()) {
        return (
            <Paper elevation={2} sx={{ p: 3, height, width, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    {fallbackMessage}
                </Typography>
            </Paper>
        );
    }

    // Sanitize data to prevent SVG errors
    const { xAxis: cleanXAxis, series: cleanSeries } = sanitizeData();

    return (
        <Box sx={{ height, width }}>
            {title && (
                <Typography variant="subtitle1" gutterBottom>
                    {title}
                </Typography>
            )}
            <LineChart
                xAxis={cleanXAxis}
                series={cleanSeries}
                height={title ? height - 40 : height}
                width={width}
            />
        </Box>
    );
};

export default LineChartWrapper;