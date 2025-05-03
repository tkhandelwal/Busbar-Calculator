// PlotlyHeatmap.jsx
import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Box, Typography, CircularProgress } from '@mui/material';

const PlotlyHeatmap = ({ distributionData, title, width = 700, height = 400 }) => {
    const [plotData, setPlotData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!distributionData) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        // Process the distribution data
        try {
            // Handle different data formats
            let processedData;

            if (typeof distributionData === 'string') {
                // String format (comma-separated)
                processedData = distributionData.split(',').map(Number);
            } else if (Array.isArray(distributionData)) {
                // Already array format
                processedData = distributionData;
            } else if (distributionData instanceof Object) {
                // Object format - flatten
                processedData = Object.values(distributionData).flat();
            } else {
                console.error('Invalid distribution data format:', distributionData);
                setIsLoading(false);
                return;
            }

            // Create a 2D grid from the 1D array
            const gridSize = Math.ceil(Math.sqrt(processedData.length));
            const grid = [];

            for (let i = 0; i < gridSize; i++) {
                const row = [];
                for (let j = 0; j < gridSize; j++) {
                    const index = i * gridSize + j;
                    row.push(index < processedData.length ? processedData[index] : 0);
                }
                grid.push(row);
            }

            // Create plotly data
            const plotlyData = [{
                z: grid,
                type: 'heatmap',
                colorscale: 'Jet',
                showscale: true,
                colorbar: {
                    title: title.includes('Temperature') ? 'Temperature (°C)' :
                        title.includes('Force') ? 'Force (N)' :
                            title.includes('Stress') ? 'Stress (MPa)' :
                                'Value'
                }
            }];

            // Create layout
            const layout = {
                title: title,
                width: width,
                height: height,
                margin: {
                    l: 50,
                    r: 50,
                    b: 50,
                    t: 80,
                    pad: 4
                },
                xaxis: {
                    title: 'X Position'
                },
                yaxis: {
                    title: 'Y Position'
                }
            };

            setPlotData({
                data: plotlyData,
                layout: layout
            });

            setIsLoading(false);
        } catch (error) {
            console.error('Error processing heatmap data:', error);
            setIsLoading(false);
        }
    }, [distributionData, title, width, height]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!plotData) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">No data available for visualization</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ my: 3 }}>
            <Plot
                data={plotData.data}
                layout={plotData.layout}
                config={{ responsive: true }}
            />
        </Box>
    );
};

export default PlotlyHeatmap;