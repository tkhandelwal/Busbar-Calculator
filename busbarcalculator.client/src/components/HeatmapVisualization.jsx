// busbarcalculator.client/src/components/HeatmapVisualization.jsx
import React, { useEffect, useRef } from 'react';

const HeatmapVisualization = ({ distributionData, width, height, title }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!distributionData || !canvasRef.current) return;

        // Process distribution data - handle both array and object formats
        let processedData;

        if (typeof distributionData === 'string') {
            // If data is a comma-separated string, convert to array of numbers
            processedData = distributionData.split(',').map(Number);
        } else if (Array.isArray(distributionData)) {
            // If already an array, use it directly
            processedData = distributionData;
        } else if (distributionData instanceof Object) {
            // If it's a nested array or object, flatten it
            processedData = Object.values(distributionData).flat();
        } else {
            console.error('Invalid distribution data format:', distributionData);
            return;
        }

        // Filter out any extreme outliers
        const sortedValues = [...processedData].sort((a, b) => a - b);
        const q1Index = Math.floor(sortedValues.length * 0.1);
        const q3Index = Math.floor(sortedValues.length * 0.9);
        const filteredData = processedData.map(val =>
            Math.max(sortedValues[q1Index], Math.min(val, sortedValues[q3Index]))
        );

        // Reshape to 2D array if it's a flat array
        const gridSize = Math.ceil(Math.sqrt(filteredData.length));
        const grid = [];

        for (let i = 0; i < gridSize; i++) {
            const row = [];
            for (let j = 0; j < gridSize; j++) {
                const index = i * gridSize + j;
                row.push(index < filteredData.length ? filteredData[index] : 0);
            }
            grid.push(row);
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const rows = grid.length;
        const cols = grid[0].length;

        // Find min and max values for normalization
        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (grid[i][j] > 0) { // Ignore zeros when finding min
                    min = Math.min(min, grid[i][j]);
                }
                max = Math.max(max, grid[i][j]);
            }
        }

        // If all values are the same or min is still MAX_VALUE, adjust to avoid division by zero
        if (min === max || min === Number.MAX_VALUE) {
            min = max > 0 ? max * 0.9 : 0;
            max = max > 0 ? max * 1.1 : 1;
        }

        // Cell dimensions
        const cellWidth = canvas.width / cols;
        const cellHeight = (canvas.height - 30) / rows; // Leave space for legend

        // Draw heatmap
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const value = grid[i][j];
                const normalizedValue = (value - min) / (max - min);

                // Generate color (blue to red gradient)
                const r = Math.floor(normalizedValue * 255);
                const g = Math.floor((1 - normalizedValue) * 150);
                const b = Math.floor((1 - normalizedValue) * 255);

                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);

                // Add value text for larger cells
                if (cellWidth > 30 && cellHeight > 20) {
                    ctx.fillStyle = 'white';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(
                        value.toFixed(2),
                        j * cellWidth + cellWidth / 2,
                        i * cellHeight + cellHeight / 2
                    );
                }
            }
        }

        // Add color legend
        const legendHeight = 20;
        const legendY = canvas.height - legendHeight;

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, 'blue');
        gradient.addColorStop(0.5, 'green');
        gradient.addColorStop(1, 'red');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, legendY, canvas.width, legendHeight);

        // Legend labels
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(min.toFixed(2), 5, legendY + 15);

        ctx.textAlign = 'right';
        ctx.fillText(max.toFixed(2), canvas.width - 5, legendY + 15);

        ctx.textAlign = 'center';
        ctx.fillText(title, canvas.width / 2, legendY + 15);

    }, [distributionData, title, width, height]);

    return (
        <div className="heatmap-container" style={{ marginBottom: '20px' }}>
            <h4>{title}</h4>
            <canvas
                ref={canvasRef}
                width={width || 400}
                height={height || 300}
                style={{ border: '1px solid #ccc', borderRadius: '4px' }}
            />
        </div>
    );
};

export default HeatmapVisualization;