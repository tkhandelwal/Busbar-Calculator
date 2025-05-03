// src/components/FemVisualizationComponent.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Typography, Box, Paper } from '@mui/material';

const FemVisualizationComponent = ({ femResults, busbarData }) => {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const controlsRef = useRef(null);
    const animationIdRef = useRef(null);
    const objectsToDisposeRef = useRef([]);

    useEffect(() => {
        if (!mountRef.current || !busbarData) return;

        // Clean up previous scene
        if (rendererRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
            mountRef.current.removeChild(rendererRef.current.domElement);
        }

        const cleanupObjects = [];

        // Create scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x222222);

        // Extract dimensions
        const width = busbarData.busbarWidth || 100;
        const thickness = busbarData.busbarThickness || 10;
        const length = busbarData.busbarLength || 1000;

        // Scale for better visualization
        const scale = Math.min(1 / Math.max(width, thickness, length) * 50, 0.5);
        const scaledWidth = width * scale;
        const scaledThickness = thickness * scale;
        const scaledLength = length * scale;

        // Create camera
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );

        // Set camera position
        camera.position.set(scaledWidth * 2, scaledThickness * 4, scaledLength * 0.7);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current = renderer;
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        mountRef.current.appendChild(renderer.domElement);

        // Add orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controlsRef.current = controls;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Get temperature distribution data or create defaults
        let temperatureData = [];
        if (femResults && femResults.TemperatureDistribution) {
            if (Array.isArray(femResults.TemperatureDistribution)) {
                temperatureData = femResults.TemperatureDistribution;
            } else if (typeof femResults.TemperatureDistribution === 'string') {
                temperatureData = femResults.TemperatureDistribution.split(',').map(Number);
            }
        }

        // Create busbar geometry
        const geometry = new THREE.BoxGeometry(
            scaledWidth,
            scaledThickness,
            scaledLength,
            20, // Increase segments for better color mapping
            4,
            20
        );
        cleanupObjects.push(geometry);

        // Create color attribute for heat mapping
        const colors = new Float32Array(geometry.attributes.position.count * 3);

        // Find min/max temperature for normalization
        let minTemp = Number.MAX_VALUE;
        let maxTemp = Number.MIN_VALUE;

        if (temperatureData.length > 0) {
            minTemp = Math.min(...temperatureData.filter(t => t > 0));
            maxTemp = Math.max(...temperatureData);

            if (minTemp === maxTemp) {
                minTemp = maxTemp * 0.8;
            }
        } else {
            minTemp = busbarData.ambientTemperature || 40;
            maxTemp = (busbarData.ambientTemperature || 40) + (busbarData.temperatureRise || 40);
        }

        // Apply temperature colors to vertices
        for (let i = 0; i < geometry.attributes.position.count; i++) {
            let normalizedValue;

            if (temperatureData.length > 0) {
                // Use temperature data from FEM results
                const index = i % temperatureData.length;
                const value = temperatureData[index];
                normalizedValue = (value - minTemp) / (maxTemp - minTemp) || 0;
            } else {
                // Create a gradient based on position
                const z = geometry.attributes.position.getZ(i);
                normalizedValue = (z / scaledLength) * 0.5 + 0.5;
            }

            // Red-Blue temperature gradient
            colors[i * 3] = normalizedValue;         // R
            colors[i * 3 + 1] = 0.2;                 // G
            colors[i * 3 + 2] = 1 - normalizedValue; // B
        }

        // Add colors to geometry
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create material
        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            metalness: 0.7,
            roughness: 0.3
        });
        cleanupObjects.push(material);

        // Create busbar mesh
        const busbar = new THREE.Mesh(geometry, material);
        busbar.castShadow = true;
        busbar.receiveShadow = true;
        scene.add(busbar);

        // Create a wireframe to show the mesh
        const edges = new THREE.EdgesGeometry(geometry);
        cleanupObjects.push(edges);

        const wireframeMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.2,
            linewidth: 1
        });
        cleanupObjects.push(wireframeMaterial);

        const wireframe = new THREE.LineSegments(edges, wireframeMaterial);
        scene.add(wireframe);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 2, 1).normalize();
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Add grid for reference
        const gridHelper = new THREE.GridHelper(Math.max(scaledWidth, scaledLength) * 2, 20);
        gridHelper.position.y = -scaledThickness;
        scene.add(gridHelper);

        // Add a temperature legend
        createTemperatureLegend(scene, minTemp, maxTemp, scaledLength, cleanupObjects);

        // Look at busbar center
        camera.lookAt(busbar.position);
        controls.update();

        // Store cleanup objects
        objectsToDisposeRef.current = cleanupObjects;

        // Animation loop
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            if (!mountRef.current) return;

            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Return cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);

            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
                animationIdRef.current = null;
            }

            // Dispose of all THREE.js objects
            objectsToDisposeRef.current.forEach(object => {
                if (object && object.dispose) {
                    object.dispose();
                }
            });
            objectsToDisposeRef.current = [];

            if (controlsRef.current) {
                controlsRef.current.dispose();
                controlsRef.current = null;
            }

            // Remove renderer
            if (rendererRef.current && mountRef.current) {
                if (mountRef.current.contains(rendererRef.current.domElement)) {
                    mountRef.current.removeChild(rendererRef.current.domElement);
                }
                rendererRef.current.dispose();
                rendererRef.current = null;
            }

            // Clear scene
            if (sceneRef.current) {
                while (sceneRef.current.children.length > 0) {
                    sceneRef.current.remove(sceneRef.current.children[0]);
                }
                sceneRef.current = null;
            }
        };
    }, [femResults, busbarData]);

    // Helper function to create temperature legend
    const createTemperatureLegend = (scene, minTemp, maxTemp, scaledLength, cleanupObjects) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        // Draw gradient
        const gradient = ctx.createLinearGradient(0, 0, 256, 0);
        gradient.addColorStop(0, 'blue');
        gradient.addColorStop(0.5, 'green');
        gradient.addColorStop(1, 'red');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 20);

        // Draw labels
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(`${minTemp.toFixed(1)}°C`, 5, 40);
        ctx.fillText(`${((minTemp + maxTemp) / 2).toFixed(1)}°C`, 120, 40);
        ctx.fillText(`${maxTemp.toFixed(1)}°C`, 215, 40);

        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        cleanupObjects.push(texture);

        // Create material
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true
        });
        cleanupObjects.push(material);

        // Create plane for legend
        const geometry = new THREE.PlaneGeometry(scaledLength * 0.7, scaledLength * 0.15);
        cleanupObjects.push(geometry);

        const legend = new THREE.Mesh(geometry, material);
        legend.position.set(0, scaledLength * 0.4, 0);
        legend.rotation.x = -Math.PI / 4;
        scene.add(legend);
    };

    if (!busbarData) {
        return (
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="body1" color="textSecondary">
                    No FEM analysis data available
                </Typography>
            </Box>
        );
    }

    return (
        <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
            <Box sx={{ position: 'relative' }}>
                <div
                    ref={mountRef}
                    style={{
                        width: '100%',
                        height: '400px',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}
                />
                <Typography variant="caption" align="center" sx={{ display: 'block', p: 1 }}>
                    FEM thermal analysis visualization. Click and drag to rotate the model.
                </Typography>
            </Box>
        </Paper>
    );
};

export default FemVisualizationComponent;