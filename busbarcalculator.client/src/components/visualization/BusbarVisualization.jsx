// src/components/visualization/BusbarVisualization.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Environment } from '@react-three/drei';
import { Box, Paper, Typography, Button, Tabs, Tab, CircularProgress, Grid } from '@mui/material';
import { visualizeBusbar } from '../../services/api';
import * as THREE from 'three';

// Color mapping for temperature visualization
const getTemperatureColor = (temp, minTemp, maxTemp) => {
    // Normalize temperature to 0-1 range
    const normalizedTemp = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)));

    // Generate color from blue (cool) to red (hot)
    return new THREE.Color(normalizedTemp, 0, 1 - normalizedTemp);
};

// Color mapping for stress visualization
const getStressColor = (stress, maxStress) => {
    // Normalize stress to 0-1 range
    const normalizedStress = Math.max(0, Math.min(1, stress / maxStress));

    // Generate color from green (low stress) to red (high stress)
    return new THREE.Color(normalizedStress, 1 - normalizedStress, 0);
};

// Busbar component with different visualization modes
const Busbar = ({ phase, meshData, temperatureData, stressData, maxTemp, minTemp, maxStress, visualizationMode }) => {
    const meshRef = useRef();

    useFrame(() => {
        if (meshRef.current) {
            // Subtle animation if desired
            // meshRef.current.rotation.y += 0.001;
        }
    });

    if (!meshData || meshData.length === 0) return null;

    // Get colors based on visualization mode
    const colors = [];
    if (visualizationMode === 'temperature') {
        temperatureData.forEach(temp => {
            colors.push(getTemperatureColor(temp, minTemp, maxTemp));
        });
    } else if (visualizationMode === 'stress') {
        stressData.forEach(stress => {
            colors.push(getStressColor(stress, maxStress));
        });
    } else {
        // Default color based on phase
        const color = phase === 'A' ? new THREE.Color(1, 0, 0) :
            phase === 'B' ? new THREE.Color(0, 1, 0) :
                new THREE.Color(0, 0, 1);

        for (let i = 0; i < meshData.length / 8; i++) {
            for (let j = 0; j < 8; j++) {
                colors.push(color);
            }
        }
    }

    // Create geometry from mesh data
    const geometry = new THREE.BufferGeometry();

    // vertices
    const vertices = [];
    meshData.forEach(vertex => {
        vertices.push(vertex[0], vertex[1], vertex[2]);
    });
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    // colors
    const colorArray = [];
    colors.forEach(color => {
        colorArray.push(color.r, color.g, color.b);
    });
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));

    // faces (for each cuboid)
    const indices = [];
    for (let i = 0; i < meshData.length / 8; i++) {
        const baseIndex = i * 8;

        // front face
        indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
        indices.push(baseIndex, baseIndex + 2, baseIndex + 3);

        // right face
        indices.push(baseIndex + 1, baseIndex + 5, baseIndex + 6);
        indices.push(baseIndex + 1, baseIndex + 6, baseIndex + 2);

        // back face
        indices.push(baseIndex + 5, baseIndex + 4, baseIndex + 7);
        indices.push(baseIndex + 5, baseIndex + 7, baseIndex + 6);

        // left face
        indices.push(baseIndex + 4, baseIndex + 0, baseIndex + 3);
        indices.push(baseIndex + 4, baseIndex + 3, baseIndex + 7);

        // top face
        indices.push(baseIndex + 3, baseIndex + 2, baseIndex + 6);
        indices.push(baseIndex + 3, baseIndex + 6, baseIndex + 7);

        // bottom face
        indices.push(baseIndex + 0, baseIndex + 4, baseIndex + 5);
        indices.push(baseIndex + 0, baseIndex + 5, baseIndex + 1);
    }
    geometry.setIndex(indices);

    // calculate normals
    geometry.computeVertexNormals();

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
        >
            <meshStandardMaterial
                vertexColors={true}
                side={THREE.DoubleSide}
                roughness={0.5}
                metalness={0.8}
            />
        </mesh>
    );
};

// Legend for visualization modes
const VisualizationLegend = ({ visualizationMode, minTemp, maxTemp, maxStress }) => {
    return (
        <div style={{ position: 'absolute', bottom: 20, right: 20, background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '4px' }}>
            <Typography variant="subtitle2" gutterBottom>
                {visualizationMode === 'temperature' ? 'Temperature (°C)' :
                    visualizationMode === 'stress' ? 'Mechanical Stress (MPa)' :
                        'Three-Phase Busbars'}
            </Typography>

            {visualizationMode === 'default' ? (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                        <div style={{ width: '20px', height: '20px', backgroundColor: 'red', marginRight: '10px' }}></div>
                        <span>Phase A</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                        <div style={{ width: '20px', height: '20px', backgroundColor: 'green', marginRight: '10px' }}></div>
                        <span>Phase B</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '20px', height: '20px', backgroundColor: 'blue', marginRight: '10px' }}></div>
                        <span>Phase C</span>
                    </div>
                </div>
            ) : (
                <div style={{ height: '200px', width: '30px', position: 'relative', marginLeft: '10px' }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: visualizationMode === 'temperature' ?
                            'linear-gradient(to bottom, red, blue)' :
                            'linear-gradient(to bottom, red, green)'
                    }}></div>
                    <Typography variant="caption" style={{ position: 'absolute', top: 0, right: -25 }}>
                        {visualizationMode === 'temperature' ? `${maxTemp.toFixed(0)}°C` : `${(maxStress / 1e6).toFixed(0)} MPa`}
                    </Typography>
                    <Typography variant="caption" style={{ position: 'absolute', bottom: 0, right: -25 }}>
                        {visualizationMode === 'temperature' ? `${minTemp.toFixed(0)}°C` : '0 MPa'}
                    </Typography>
                </div>
            )}
        </div>
    );
};

// Main visualization component
const BusbarVisualization = ({ busbarInput, busbarResult }) => {
    const [visualizationData, setVisualizationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [visualizationMode, setVisualizationMode] = useState('default');
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadVisualizationData = async () => {
            setLoading(true);
            try {
                const data = await visualizeBusbar(busbarInput);
                setVisualizationData(data);
            } catch (error) {
                console.error('Failed to load visualization data:', error);
                setError('Failed to load visualization data. This feature may require a license upgrade.');
            } finally {
                setLoading(false);
            }
        };

        if (busbarInput) {
            loadVisualizationData();
        }
    }, [busbarInput]);

    const handleVisualizationModeChange = (event, newMode) => {
        setVisualizationMode(newMode);
    };

    if (loading) {
        return (
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
            </Paper>
        );
    }

    if (!visualizationData) {
        return (
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No visualization data available</Typography>
            </Paper>
        );
    }

    // Calculate temperature and stress ranges for visualization
    const allTemps = [];
    const allStresses = [];

    Object.keys(visualizationData.temperatureData).forEach(phase => {
        allTemps.push(...visualizationData.temperatureData[phase]);
    });

    Object.keys(visualizationData.stressData).forEach(phase => {
        allStresses.push(...visualizationData.stressData[phase]);
    });

    const minTemp = Math.min(...allTemps);
    const maxTemp = Math.max(...allTemps);
    const maxStress = Math.max(...allStresses);

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                3D Busbar Visualization
            </Typography>

            <Tabs
                value={visualizationMode}
                onChange={handleVisualizationModeChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                sx={{ mb: 2 }}
            >
                <Tab value="default" label="Default" />
                <Tab value="temperature" label="Temperature" />
                <Tab value="stress" label="Mechanical Stress" />
            </Tabs>

            <Box sx={{ height: '500px', width: '100%', position: 'relative' }}>
                <Canvas>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <PerspectiveCamera makeDefault position={[500, 500, 500]} />
                    <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                    <Environment preset="warehouse" />

                    {/* Render busbars for each phase */}
                    {Object.keys(visualizationData.meshData).map(phase => (
                        <Busbar
                            key={phase}
                            phase={phase}
                            meshData={visualizationData.meshData[phase]}
                            temperatureData={visualizationData.temperatureData[phase]}
                            stressData={visualizationData.stressData[phase]}
                            maxTemp={maxTemp}
                            minTemp={minTemp}
                            maxStress={maxStress}
                            visualizationMode={visualizationMode}
                        />
                    ))}

                    {/* Coordinate axes for reference */}
                    <axesHelper args={[300]} />
                </Canvas>

                <VisualizationLegend
                    visualizationMode={visualizationMode}
                    minTemp={minTemp}
                    maxTemp={maxTemp}
                    maxStress={maxStress}
                />
            </Box>

            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                        Configuration
                    </Typography>
                    <Typography variant="body2">
                        Material: {busbarInput.material}
                    </Typography>
                    <Typography variant="body2">
                        Arrangement: {busbarInput.arrangement}
                    </Typography>
                    <Typography variant="body2">
                        Dimensions: {busbarInput.busbarWidth} × {busbarInput.busbarThickness} × {busbarInput.busbarLength} mm
                    </Typography>
                    <Typography variant="body2">
                        Bars per phase: {busbarInput.numberOfBarsPerPhase}
                    </Typography>
                    <Typography variant="body2">
                        Phase distance: {busbarInput.phaseDistance} mm
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                        Calculation Results
                    </Typography>
                    <Typography variant="body2">
                        Temperature Rise: {busbarResult.temperatureRise.toFixed(2)}°C
                    </Typography>
                    <Typography variant="body2">
                        Mechanical Stress: {(busbarResult.mechanicalStress / 1e6).toFixed(2)} MPa
                    </Typography>
                    <Typography variant="body2">
                        Short Circuit Force: {busbarResult.shortCircuitForce.toFixed(2)} N
                    </Typography>
                </Grid>
            </Grid>

            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                * Use mouse to rotate, zoom and pan the 3D model
            </Typography>
        </Paper>
    );
};

export default BusbarVisualization;