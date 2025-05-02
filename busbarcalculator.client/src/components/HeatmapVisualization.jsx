// Enhanced HeatmapVisualization.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Typography, Box } from '@mui/material';

const HeatmapVisualization = ({ distributionData, width = 700, height = 350, title }) => {
    const canvasRef = useRef(null);
    const rendererRef = useRef(null);

    useEffect(() => {
        if (!distributionData || !canvasRef.current) return;

        // Clean up any previous renderer
        if (rendererRef.current) {
            canvasRef.current.removeChild(rendererRef.current.domElement);
        }

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

        // Reshape to 2D array
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

        // Find min and max values for normalization
        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;

        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if (grid[i][j] > 0) { // Ignore zeros when finding min
                    min = Math.min(min, grid[i][j]);
                }
                max = Math.max(max, grid[i][j]);
            }
        }

        // If all values are the same or min is still MAX_VALUE, adjust
        if (min === max || min === Number.MAX_VALUE) {
            min = max > 0 ? max * 0.9 : 0;
            max = max > 0 ? max * 1.1 : 1;
        }

        // Initialize Three.js for WebGL rendering
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(
            -width / 2, width / 2, height / 2, -height / 2, 0.1, 1000
        );

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        rendererRef.current = renderer;
        canvasRef.current.appendChild(renderer.domElement);

        // Set camera position
        camera.position.z = 5;

        // Create contour lines and heatmap
        createHeatmapMesh(scene, grid, min, max, width, height, gridSize);

        // Render the scene once (no animation needed)
        renderer.render(scene, camera);

        // Add labels using HTML overlay
        createHeatmapLabels(grid, min, max, width, height, gridSize);

        return () => {
            // Clean up
            if (rendererRef.current && canvasRef.current) {
                canvasRef.current.removeChild(rendererRef.current.domElement);
            }
            // Remove any overlay elements
            const labelsContainer = document.getElementById('heatmap-labels-container');
            if (labelsContainer) {
                labelsContainer.innerHTML = '';
            }
        };

    }, [distributionData, title, width, height]);

    // Function to create heatmap mesh with WebGL
    const createHeatmapMesh = (scene, grid, min, max, width, height, gridSize) => {
        const rows = grid.length;
        const cols = grid[0].length;

        // Create points for contour lines
        const resolution = 100;
        const pointsArray = [];
        const colorsArray = [];

        // Helper function to get interpolated value
        const getInterpolatedValue = (x, y) => {
            // Get grid coordinates
            const gx = (x / width) * (cols - 1);
            const gy = (y / height) * (rows - 1);

            // Get surrounding grid points
            const x1 = Math.floor(gx);
            const y1 = Math.floor(gy);
            const x2 = Math.min(x1 + 1, cols - 1);
            const y2 = Math.min(y1 + 1, rows - 1);

            // Get interpolation weights
            const wx = gx - x1;
            const wy = gy - y1;

            // Get grid values
            const v11 = grid[y1][x1] || 0;
            const v12 = grid[y2][x1] || 0;
            const v21 = grid[y1][x2] || 0;
            const v22 = grid[y2][x2] || 0;

            // Bilinear interpolation
            const top = v11 * (1 - wx) + v21 * wx;
            const bottom = v12 * (1 - wx) + v22 * wx;
            return top * (1 - wy) + bottom * wy;
        };

        // Create points for visualization
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const x = (j / (resolution - 1)) * width - width / 2;
                const y = (i / (resolution - 1)) * height - height / 2;

                const value = getInterpolatedValue(
                    ((j / (resolution - 1)) * width),
                    ((i / (resolution - 1)) * height)
                );

                // Normalize value between min and max
                const normalizedValue = (value - min) / (max - min) || 0;

                // Create point
                pointsArray.push(x, y, 0);

                // Assign color (blue to red gradient)
                colorsArray.push(
                    Math.min(0.2 + normalizedValue * 0.8, 1),  // R: increase with value
                    Math.max(0.6 - normalizedValue * 0.5, 0),  // G: decrease with value
                    Math.max(1 - normalizedValue, 0)           // B: decrease with value
                );
            }
        }

        // Create geometry and set attributes
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(pointsArray, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsArray, 3));

        // Create material and mesh
        const material = new THREE.PointsMaterial({
            size: 4,
            vertexColors: true,
            transparent: true,
            opacity: 0.9
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // Create contour lines
        createContourLines(scene, grid, min, max, width, height, gridSize);
    };

    // Function to create contour lines
    const createContourLines = (scene, grid, min, max, width, height, gridSize) => {
        const rows = grid.length;
        const cols = grid[0].length;
        const numContours = 10;

        // Create contour levels
        const levels = [];
        for (let i = 0; i <= numContours; i++) {
            levels.push(min + (max - min) * (i / numContours));
        }

        // For each contour level, create a line
        levels.forEach((level, levelIndex) => {
            const linePoints = [];

            // March through grid cells to find contour intersections
            for (let i = 0; i < rows - 1; i++) {
                for (let j = 0; j < cols - 1; j++) {
                    const v00 = grid[i][j];
                    const v01 = grid[i + 1][j];
                    const v10 = grid[i][j + 1];
                    const v11 = grid[i + 1][j + 1];

                    // Calculate cell coordinates
                    const x0 = (j / cols) * width - width / 2;
                    const y0 = (i / rows) * height - height / 2;
                    const x1 = ((j + 1) / cols) * width - width / 2;
                    const y1 = ((i + 1) / rows) * height - height / 2;

                    // Check if contour passes through this cell (simple case)
                    if ((v00 <= level && level < v01) || (v01 <= level && level < v00)) {
                        // Interpolate y position
                        const t = (level - v00) / (v01 - v00 || 1);
                        linePoints.push(x0, y0 + t * (y1 - y0), 0.01);
                    }

                    if ((v10 <= level && level < v11) || (v11 <= level && level < v10)) {
                        // Interpolate y position
                        const t = (level - v10) / (v11 - v10 || 1);
                        linePoints.push(x1, y0 + t * (y1 - y0), 0.01);
                    }

                    if ((v00 <= level && level < v10) || (v10 <= level && level < v00)) {
                        // Interpolate x position
                        const t = (level - v00) / (v10 - v00 || 1);
                        linePoints.push(x0 + t * (x1 - x0), y0, 0.01);
                    }

                    if ((v01 <= level && level < v11) || (v11 <= level && level < v01)) {
                        // Interpolate x position
                        const t = (level - v01) / (v11 - v01 || 1);
                        linePoints.push(x0 + t * (x1 - x0), y1, 0.01);
                    }
                }
            }

            // Create contour line if we found points
            if (linePoints.length > 0) {
                const lineGeometry = new THREE.BufferGeometry();
                lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePoints, 3));

                // Normalize level for color
                const normalizedLevel = (level - min) / (max - min);
                const lineColor = new THREE.Color(
                    Math.min(0.2 + normalizedLevel * 0.8, 1),
                    Math.max(0.5 - normalizedLevel * 0.5, 0),
                    Math.max(0.9 - normalizedLevel * 0.9, 0)
                );

                const lineMaterial = new THREE.LineBasicMaterial({
                    color: lineColor,
                    linewidth: 2,
                    opacity: 0.8,
                    transparent: true
                });

                const line = new THREE.LineSegments(lineGeometry, lineMaterial);
                scene.add(line);
            }
        });
    };

    // Function to create labels
    const createHeatmapLabels = (grid, min, max, width, height, gridSize) => {
        // Get or create container for labels
        let labelsContainer = document.getElementById('heatmap-labels-container');
        if (!labelsContainer) {
            labelsContainer = document.createElement('div');
            labelsContainer.id = 'heatmap-labels-container';
            labelsContainer.style.position = 'absolute';
            labelsContainer.style.top = '0';
            labelsContainer.style.left = '0';
            labelsContainer.style.pointerEvents = 'none';
            labelsContainer.style.width = `${width}px`;
            labelsContainer.style.height = `${height}px`;
            canvasRef.current.appendChild(labelsContainer);
        } else {
            labelsContainer.innerHTML = '';
        }

        // Create colorbar
        const colorbar = document.createElement('div');
        colorbar.style.position = 'absolute';
        colorbar.style.bottom = '10px';
        colorbar.style.left = '10%';
        colorbar.style.width = '80%';
        colorbar.style.height = '20px';
        colorbar.style.background = 'linear-gradient(to right, blue, cyan, green, yellow, red)';
        colorbar.style.borderRadius = '3px';
        colorbar.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
        labelsContainer.appendChild(colorbar);

        // Add min and max labels
        const minLabel = document.createElement('div');
        minLabel.textContent = min.toFixed(2);
        minLabel.style.position = 'absolute';
        minLabel.style.bottom = '30px';
        minLabel.style.left = '10%';
        minLabel.style.fontSize = '12px';
        minLabel.style.color = '#333';
        minLabel.style.fontWeight = 'bold';
        minLabel.style.textShadow = '0 0 2px white';
        labelsContainer.appendChild(minLabel);

        const maxLabel = document.createElement('div');
        maxLabel.textContent = max.toFixed(2);
        maxLabel.style.position = 'absolute';
        maxLabel.style.bottom = '30px';
        maxLabel.style.right = '10%';
        maxLabel.style.fontSize = '12px';
        maxLabel.style.color = '#333';
        maxLabel.style.fontWeight = 'bold';
        maxLabel.style.textShadow = '0 0 2px white';
        labelsContainer.appendChild(maxLabel);

        // Add title
        const titleLabel = document.createElement('div');
        titleLabel.textContent = title || 'Distribution';
        titleLabel.style.position = 'absolute';
        titleLabel.style.top = '10px';
        titleLabel.style.left = '50%';
        titleLabel.style.transform = 'translateX(-50%)';
        titleLabel.style.fontSize = '14px';
        titleLabel.style.fontWeight = 'bold';
        titleLabel.style.color = '#333';
        titleLabel.style.textShadow = '0 0 2px white';
        labelsContainer.appendChild(titleLabel);
    };

    return (
        <Box
            sx={{
                position: 'relative',
                width: `${width}px`,
                height: `${height}px`,
                margin: '0 auto',
                overflow: 'visible',
                mb: 4
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    mb: 1,
                    textAlign: 'center',
                    fontWeight: 'medium'
                }}
            >
                {title}
            </Typography>
            <div
                ref={canvasRef}
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                    position: 'relative'
                }}
            />
        </Box>
    );
};

export default HeatmapVisualization;