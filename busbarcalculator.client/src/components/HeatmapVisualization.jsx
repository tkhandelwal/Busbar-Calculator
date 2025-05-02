// HeatmapVisualization.jsx
import React, { useEffect, useRef } from 'react';

const HeatmapVisualization = ({ distributionData, width, height, title }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!distributionData || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rows = distributionData.length;
        const cols = distributionData[0].length;

        // Find min and max values for normalization
        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                min = Math.min(min, distributionData[i][j]);
                max = Math.max(max, distributionData[i][j]);
            }
        }

        // Cell dimensions
        const cellWidth = canvas.width / cols;
        const cellHeight = canvas.height / rows;

        // Draw heatmap
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const value = distributionData[i][j];
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
        ctx.fillText(min.toFixed(2), 5, legendY + 15);
        ctx.fillText(max.toFixed(2), canvas.width - 50, legendY + 15);
        ctx.fillText(title, canvas.width / 2 - 50, legendY + 15);

    }, [distributionData, title]);

    return (
        <div className="heatmap-container" style={{ marginBottom: '20px' }}>
            <h4>{title}</h4>
            <canvas
                ref={canvasRef}
                width={width || 400}
                height={height || 400}
                style={{ border: '1px solid #ccc' }}
            />
        </div>
    );
};

export default HeatmapVisualization;