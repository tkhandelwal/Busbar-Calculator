// busbarcalculator.client/src/components/visualization/BusbarVisualization.jsx
import React, { useEffect, useRef } from 'react';
import { Typography, Paper, Divider, Box } from '@mui/material';

const BusbarVisualization = ({ busbarInput, busbarResult }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set up scaling
        const scale = Math.min(canvas.width / busbarInput.busbarLength, canvas.height / (busbarInput.busbarWidth * 3));
        const offsetX = (canvas.width - busbarInput.busbarLength * scale) / 2;
        const offsetY = (canvas.height - busbarInput.busbarWidth * 3 * scale) / 2;

        // Draw busbars (simplified 2D representation)
        const phases = ['A', 'B', 'C'];
        const colors = ['#ff6b6b', '#4d96ff', '#33cc33'];

        phases.forEach((phase, index) => {
            const yOffset = index * busbarInput.phaseDistance;

            // Draw main bar
            ctx.fillStyle = colors[index];
            ctx.fillRect(
                offsetX,
                offsetY + yOffset * scale,
                busbarInput.busbarLength * scale,
                busbarInput.busbarWidth * scale
            );

            // Draw outline
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                offsetX,
                offsetY + yOffset * scale,
                busbarInput.busbarLength * scale,
                busbarInput.busbarWidth * scale
            );

            // Label
            ctx.fillStyle = '#000';
            ctx.font = '16px Arial';
            ctx.fillText(
                `Phase ${phase}`,
                offsetX + 10,
                offsetY + yOffset * scale + busbarInput.busbarWidth * scale / 2 + 5
            );
        });

        // Add temperature gradient indicators
        if (busbarResult && busbarResult.temperatureRise) {
            phases.forEach((phase, index) => {
                const yOffset = index * busbarInput.phaseDistance;
                const gradient = ctx.createLinearGradient(
                    offsetX,
                    offsetY + yOffset * scale,
                    offsetX + busbarInput.busbarLength * scale,
                    offsetY + yOffset * scale
                );

                // Create temperature gradient
                gradient.addColorStop(0, '#ffdd00');  // Yellow (cooler)
                gradient.addColorStop(1, '#ff3300');  // Red (hotter)

                // Draw temperature indicator
                ctx.fillStyle = gradient;
                ctx.fillRect(
                    offsetX,
                    offsetY + yOffset * scale + busbarInput.busbarWidth * scale + 5,
                    busbarInput.busbarLength * scale,
                    10
                );

                // Temperature labels
                ctx.fillStyle = '#000';
                ctx.font = '12px Arial';
                ctx.fillText(
                    `Temp: ${busbarInput.ambientTemperature.toFixed(1)}°C`,
                    offsetX,
                    offsetY + yOffset * scale + busbarInput.busbarWidth * scale + 30
                );
                ctx.fillText(
                    `Temp: ${(busbarInput.ambientTemperature + busbarResult.temperatureRise).toFixed(1)}°C`,
                    offsetX + busbarInput.busbarLength * scale - 100,
                    offsetY + yOffset * scale + busbarInput.busbarWidth * scale + 30
                );
            });
        }
    }, [busbarInput, busbarResult]);

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Busbar Visualization
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Typography variant="body2" gutterBottom>
                Simplified 2D representation of the busbar configuration with temperature gradient visualization.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    style={{ border: '1px solid #ddd', maxWidth: '100%' }}
                />
            </Box>

            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                Note: This is a simplified visualization. Upgrade to Professional or Enterprise for detailed 3D visualization.
            </Typography>
        </Paper>
    );
};

export default BusbarVisualization;