// src/components/PowerCableVisualization.jsx
import React, { useEffect, useRef } from 'react';
import { Typography, Box, Paper } from '@mui/material';

const PowerCableVisualization = ({ cableData, results }) => {
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !results || !results.suitableCables || !results.suitableCables.length) {
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const cableSize = parseFloat(results.suitableCables[0].size);

        // Set canvas dimensions
        canvas.width = 600;
        canvas.height = 300;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw cable cross-section
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        let radius = Math.sqrt(cableSize / Math.PI) * 10; // Scale for visibility

        // Limit radius to a reasonable size
        radius = Math.min(radius, 100);
        radius = Math.max(radius, 20);

        // Draw outer jacket
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#333333';
        ctx.fill();

        // Draw insulation
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI);
        const insulationColor =
            cableData.insulation === 'pvc' ? '#888888' :
                cableData.insulation === 'xlpe' ? '#444444' : '#666666';
        ctx.fillStyle = insulationColor;
        ctx.fill();

        // Draw conductor
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = cableData.cableType === 'copper' ? '#cd7f32' : '#D3D3D3';
        ctx.fill();

        // Add text for cable size
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(`${cableSize} mm²`, centerX, centerY + radius + 30);

        // Add text for cable type
        ctx.font = '14px Arial';
        ctx.fillText(`${cableData.cableType.toUpperCase()} with ${cableData.insulation.toUpperCase()} insulation`,
            centerX, centerY - radius - 20);

        // Add side view - rectangular section
        const sideViewX = 50;
        const sideViewY = centerY;
        const sideViewWidth = 100;
        const sideViewHeight = radius * 2;

        // Outer jacket
        ctx.fillStyle = '#333333';
        ctx.fillRect(sideViewX - 10, sideViewY - sideViewHeight / 2 - 10,
            sideViewWidth + 20, sideViewHeight + 20);

        // Insulation
        ctx.fillStyle = insulationColor;
        ctx.fillRect(sideViewX - 5, sideViewY - sideViewHeight / 2 - 5,
            sideViewWidth + 10, sideViewHeight + 10);

        // Conductor
        ctx.fillStyle = cableData.cableType === 'copper' ? '#cd7f32' : '#D3D3D3';
        ctx.fillRect(sideViewX, sideViewY - sideViewHeight / 2,
            sideViewWidth, sideViewHeight);

        // Label the side view
        ctx.fillStyle = 'white';
        ctx.fillText('Side View', sideViewX + sideViewWidth / 2, sideViewY + sideViewHeight / 2 + 30);

        // Add legend
        const legendX = canvas.width - 150;
        const legendY = 50;
        const circleRadius = 10;

        // Conductor
        ctx.beginPath();
        ctx.arc(legendX, legendY, circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = cableData.cableType === 'copper' ? '#cd7f32' : '#D3D3D3';
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText('Conductor', legendX + 20, legendY + 5);

        // Insulation
        ctx.beginPath();
        ctx.arc(legendX, legendY + 30, circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = insulationColor;
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillText('Insulation', legendX + 20, legendY + 35);

        // Jacket
        ctx.beginPath();
        ctx.arc(legendX, legendY + 60, circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#333333';
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillText('Jacket', legendX + 20, legendY + 65);

        // Add ampacity information
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = '16px Arial bold';
        ctx.fillText(`Ampacity: ${results.suitableCables[0].ampacity} A`, centerX, canvas.height - 30);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [cableData, results]);

    if (!cableData || !results || !results.suitableCables || !results.suitableCables.length) {
        return (
            <Paper elevation={2} sx={{ p: 2, my: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="body1" align="center">
                    No cable data available for visualization
                </Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Cable Visualization
            </Typography>
            <Paper
                elevation={3}
                sx={{
                    p: 1,
                    bgcolor: '#333',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden'
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={300}
                    style={{
                        maxWidth: '100%',
                        height: 'auto'
                    }}
                />
            </Paper>
            <Typography variant="caption" align="center" sx={{ display: 'block', mt: 1 }}>
                Cross-section and side view of recommended {results.suitableCables[0].size} mm² {cableData.cableType} cable
            </Typography>
        </Box>
    );
};

export default PowerCableVisualization;