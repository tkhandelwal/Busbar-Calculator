// FemFieldViewer.jsx - New component for magnetic field visualization
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Typography, Box, FormControl, Select, MenuItem, InputLabel } from '@mui/material';

const FemFieldViewer = ({ busbarData }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const [viewMode, setViewMode] = useState('magnetic'); // 'magnetic', 'electric', 'thermal'

    useEffect(() => {
        if (!mountRef.current || !busbarData) return;

        // Clean up previous scene
        if (rendererRef.current && mountRef.current) {
            try {
                // Check if the renderer's DOM element is actually a child before removing
                if (mountRef.current.contains(rendererRef.current.domElement)) {
                    mountRef.current.removeChild(rendererRef.current.domElement);
                }
            } catch (error) {
                console.log("Renderer cleanup skipped:", error.message);
            }
        }

        // Create Three.js scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            60,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current = renderer;
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.setClearColor(0xf8f8f8);
        mountRef.current.appendChild(renderer.domElement);

        // Add controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controlsRef.current = controls;

        // Extract dimensions
        const width = busbarData.busbarWidth || 100;
        const height = busbarData.busbarThickness || 10;
        const length = busbarData.busbarLength || 1000;

        // Scale for visualization
        const maxDim = Math.max(width, height, length);
        const scale = 50 / maxDim;

        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        const scaledLength = length * scale;

        // Create busbar geometry
        const busbarGeometry = new THREE.BoxGeometry(
            scaledWidth,
            scaledHeight,
            scaledLength
        );

        const busbarMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.7,
            roughness: 0.3
        });

        const busbar = new THREE.Mesh(busbarGeometry, busbarMaterial);
        busbar.castShadow = true;
        busbar.receiveShadow = true;
        scene.add(busbar);

        // Add field visualization based on view mode
        switch (viewMode) {
            case 'magnetic':
                addMagneticFieldVisualization(scene, busbar, scaledWidth, scaledHeight, scaledLength, busbarData);
                break;
            case 'electric':
                addElectricFieldVisualization(scene, busbar, scaledWidth, scaledHeight, scaledLength, busbarData);
                break;
            case 'thermal':
                addThermalFieldVisualization(scene, busbar, scaledWidth, scaledHeight, scaledLength, busbarData);
                break;
            default:
                addMagneticFieldVisualization(scene, busbar, scaledWidth, scaledHeight, scaledLength, busbarData);
        }

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Position camera
        camera.position.set(scaledWidth * 3, scaledHeight * 5, scaledLength * 1.5);
        camera.lookAt(busbar.position);
        controls.update();

        // Animation loop
        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            if (!mountRef.current) return;

            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);

            if (rendererRef.current && mountRef.current) {
                try {
                    if (mountRef.current.contains(rendererRef.current.domElement)) {
                        mountRef.current.removeChild(rendererRef.current.domElement);
                    }
                } catch (error) {
                    console.log("Renderer cleanup skipped:", error.message);
                }
            }

            if (controlsRef.current) {
                controlsRef.current.dispose();
            }

            // Dispose geometries and materials
            busbarGeometry.dispose();
            busbarMaterial.dispose();

            if (sceneRef.current) {
                sceneRef.current.clear();
            }
        };
    }, [busbarData, viewMode]);

    // Function to add magnetic field visualization
    const addMagneticFieldVisualization = (scene, busbar, width, height, length, data) => {
        const current = data.current || 1000;
        const fieldStrength = Math.min(Math.max(current / 5000, 0.2), 1.5);

        // Create field lines
        const fieldRadius = Math.max(width, height) * 2;
        const numLines = 24;
        const pointsPerLine = 100;

        // Create a cylindrical field around the busbar
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const startRadius = fieldRadius * 0.7;
            const endRadius = fieldRadius * 1.3;

            // Create curved field line points
            const points = [];
            for (let j = 0; j <= pointsPerLine; j++) {
                const t = j / pointsPerLine;
                const z = (t - 0.5) * length * 1.2;

                // Make the field lines bend around the busbar
                const phase = t * Math.PI * 2 + angle;
                const radius = startRadius + (endRadius - startRadius) * Math.sin(t * Math.PI);

                const x = Math.cos(phase) * radius;
                const y = Math.sin(phase) * radius;

                points.push(new THREE.Vector3(x, y, z));
            }

            // Create tube geometry for the field line
            const curve = new THREE.CatmullRomCurve3(points);
            const geometry = new THREE.TubeGeometry(curve, 100, fieldStrength * 0.3, 8, false);

            // Create gradient material
            const colorStart = new THREE.Color(0x0000ff); // Blue
            const colorEnd = new THREE.Color(0xff0000);   // Red
            const colors = [];

            // Create color gradient along the tube
            for (let j = 0; j < geometry.attributes.position.count; j++) {
                const t = j / geometry.attributes.position.count;
                const color = new THREE.Color().lerpColors(colorStart, colorEnd, t);
                colors.push(color.r, color.g, color.b);
            }

            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            const material = new THREE.MeshBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });

            const tube = new THREE.Mesh(geometry, material);
            scene.add(tube);
        }

        // Add arrow helpers to indicate field direction
        const arrowLength = length * 0.15;
        const arrowCount = 8;

        for (let i = 0; i < arrowCount; i++) {
            const angle = (i / arrowCount) * Math.PI * 2;
            const x = Math.cos(angle) * fieldRadius;
            const y = Math.sin(angle) * fieldRadius;
            const z = (Math.random() - 0.5) * length * 0.8;

            const direction = new THREE.Vector3(-Math.sin(angle), Math.cos(angle), 0).normalize();

            const arrowHelper = new THREE.ArrowHelper(
                direction,
                new THREE.Vector3(x, y, z),
                arrowLength,
                0x00ff00,
                arrowLength * 0.3,
                arrowLength * 0.2
            );

            scene.add(arrowHelper);
        }
    };

    // Function to add electric field visualization
    const addElectricFieldVisualization = (scene, busbar, width, height, length, data) => {
        const voltage = data.voltage || 10;
        const fieldStrength = Math.min(Math.max(voltage / 100, 0.2), 1.5);

        // Create radial field lines from busbar
        const numLines = 40;
        const maxRadius = Math.max(width, height) * 5;

        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const z = (Math.random() - 0.5) * length * 0.8;

            const startPoint = new THREE.Vector3(
                Math.cos(angle) * width * 0.7,
                Math.sin(angle) * height * 0.7,
                z
            );

            const endPoint = new THREE.Vector3(
                Math.cos(angle) * maxRadius,
                Math.sin(angle) * maxRadius,
                z
            );

            // Create line
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x00ffff,
                linewidth: 2,
                opacity: 0.7,
                transparent: true
            });

            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);

            // Add arrow at end
            const direction = new THREE.Vector3().subVectors(endPoint, startPoint).normalize();
            const arrowLength = maxRadius * 0.1;

            const arrowHelper = new THREE.ArrowHelper(
                direction,
                endPoint.clone().sub(direction.clone().multiplyScalar(arrowLength)),
                arrowLength,
                0x00ffff,
                arrowLength * 0.3,
                arrowLength * 0.2
            );

            scene.add(arrowHelper);
        }

        // Add equipotential surfaces
        const numSurfaces = 5;

        for (let i = 1; i <= numSurfaces; i++) {
            const radius = (i / numSurfaces) * maxRadius * 0.8;

            const surfaceGeometry = new THREE.TorusGeometry(radius, 0.2, 16, 100);
            const surfaceMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(1 - i / numSurfaces, i / numSurfaces, 1),
                transparent: true,
                opacity: 0.3,
                wireframe: false
            });

            const torus = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
            torus.rotation.x = Math.PI / 2;
            scene.add(torus);
        }
    };

    // Function to add thermal field visualization
    const addThermalFieldVisualization = (scene, busbar, width, height, length, data) => {
        const temperatureRise = data.temperatureRise || 40;
        const maxTemp = data.maxAllowableTemperature || 90;
        const normalizedTemp = Math.min(temperatureRise / maxTemp, 1);

        // Apply thermal gradient to busbar
        busbar.material.color.setRGB(
            0.2 + normalizedTemp * 0.8,
            0.7 - normalizedTemp * 0.7,
            1 - normalizedTemp
        );

        // Create heat aura around busbar
        const auraGeometry = new THREE.BoxGeometry(
            width * 1.2,
            height * 1.2,
            length * 1.2
        );

        const auraMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(1, 0.5, 0),
            transparent: true,
            opacity: normalizedTemp * 0.4,
            wireframe: true
        });

        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        scene.add(aura);

        // Add heat particles
        const particleCount = Math.floor(1000 * normalizedTemp);
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = [];
        const particleColors = [];

        for (let i = 0; i < particleCount; i++) {
            // Random position around busbar
            const distance = Math.random() * width * 3;
            const angle = Math.random() * Math.PI * 2;
            const height = (Math.random() - 0.5) * 2;
            const lengthPos = (Math.random() - 0.5) * length;

            particlePositions.push(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance + height * 10,
                lengthPos
            );

            // Particle color based on distance (hotter closer to busbar)
            const normalizedDistance = Math.min(distance / (width * 3), 1);
            particleColors.push(
                1 - normalizedDistance * 0.5,
                0.3 - normalizedDistance * 0.3,
                0
            );
        }

        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Add animated heat wave effect
        const waveCount = 3;
        const waves = [];

        for (let i = 0; i < waveCount; i++) {
            const waveGeometry = new THREE.SphereGeometry(
                width * (1 + i * 0.5),
                16, 16,
                0, Math.PI * 2,
                0, Math.PI * 2
            );

            const waveMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(1, 0.5, 0),
                wireframe: true,
                transparent: true,
                opacity: (1 - i / waveCount) * 0.3 * normalizedTemp
            });

            const wave = new THREE.Mesh(waveGeometry, waveMaterial);
            waves.push(wave);
            scene.add(wave);
        }

        // Animate waves expanding
        const animateWaves = () => {
            waves.forEach((wave, index) => {
                wave.scale.set(
                    1 + 0.1 * Math.sin(Date.now() * 0.001 + index),
                    1 + 0.1 * Math.sin(Date.now() * 0.001 + index),
                    1 + 0.1 * Math.sin(Date.now() * 0.001 + index)
                );
            });

            particles.rotation.y += 0.001;
            requestAnimationFrame(animateWaves);
        };

        animateWaves();
    };

    const handleViewModeChange = (event) => {
        setViewMode(event.target.value);
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Field Visualization
            </Typography>

            <FormControl sx={{ mb: 2, minWidth: 200 }}>
                <InputLabel>View Mode</InputLabel>
                <Select
                    value={viewMode}
                    onChange={handleViewModeChange}
                    label="View Mode"
                >
                    <MenuItem value="magnetic">Magnetic Field</MenuItem>
                    <MenuItem value="electric">Electric Field</MenuItem>
                    <MenuItem value="thermal">Thermal Field</MenuItem>
                </Select>
            </FormControl>

            <Box
                ref={mountRef}
                sx={{
                    width: '100%',
                    height: '500px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                }}
            />

            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                {viewMode === 'magnetic' &&
                    'Magnetic field visualization showing field lines around the busbar. Use mouse to rotate and zoom.'}
                {viewMode === 'electric' &&
                    'Electric field visualization showing field lines and equipotential surfaces. Use mouse to rotate and zoom.'}
                {viewMode === 'thermal' &&
                    'Thermal field visualization showing temperature distribution. Use mouse to rotate and zoom.'}
            </Typography>
        </Box>
    );
};

export default FemFieldViewer;