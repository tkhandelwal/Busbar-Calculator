// src/components/ChartComponent.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Plot from 'react-plotly.js';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ChartComponent = ({ data, layout, title, height = 400 }) => {
    return (
        <Paper elevation={3} sx={{ p: 2, my: 2 }}>
            <Typography variant="h6" gutterBottom>{title}</Typography>
            <Box sx={{ height: height, width: '100%' }}>
                <Plot
                    data={data}
                    layout={{
                        ...layout,
                        autosize: true,
                        margin: { l: 50, r: 50, t: 30, b: 50 },
                    }}
                    style={{ width: '100%', height: '100%' }}
                    useResizeHandler={true}
                    config={{ responsive: true }}
                />
            </Box>
        </Paper>
    );
};

export default ChartComponent;