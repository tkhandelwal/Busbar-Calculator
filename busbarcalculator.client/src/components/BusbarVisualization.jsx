// src/components/BusbarVisualization.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Typography, Box } from '@mui/material';

const BusbarVisualization = ({ busbarData }) => {
    const mountRef = useRef(null);
    const requestRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const objectsToDisposeRef = useRef([]);

    useEffect(() => {
        if (!mountRef.current || !busbarData) return;

        // Clear previous scene
        if (rendererRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
            mountRef.current.removeChild(rendererRef.current.domElement);
        }

        const cleanupObjects = [];

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x222222);

        // Create camera
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );

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

        // Extract dimensions
        const width = busbarData?.busbarWidth || 100;
        const thickness = busbarData?.busbarThickness || 10;
        const length = busbarData?.busbarLength || 1000;

        // Scale for better visualization
        const maxDimension = Math.max(width, thickness, length);
        const scale = 50 / maxDimension;

        const scaledWidth = width * scale;
        const scaledThickness = thickness * scale;
        const scaledLength = length * scale;

        // Material based on temperature
        const temperatureRatio = busbarData?.temperatureRise
            ? Math.min(busbarData.temperatureRise / busbarData.maxAllowableTemperature, 1)
            : 0.5;

        // Create material with subtle metallic effect
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(
                Math.min(0.4 + temperatureRatio * 0.6, 1), // More red when hotter
                Math.max(0.6 - temperatureRatio * 0.5, 0), // Less green when hotter
                Math.max(0.8 - temperatureRatio * 0.8, 0)  // Less blue when hotter
            ),
            metalness: 0.7,
            roughness: 0.3
        });
        cleanupObjects.push(material);

        // Create busbar geometry
        const geometry = new THREE.BoxGeometry(scaledWidth, scaledThickness, scaledLength);
        cleanupObjects.push(geometry);

        const busbar = new THREE.Mesh(geometry, material);
        busbar.castShadow = true;
        busbar.receiveShadow = true;
        scene.add(busbar);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(scaledWidth * 2, scaledThickness * 4, scaledLength * 0.5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Add a ground plane for shadow casting
        const groundGeometry = new THREE.PlaneGeometry(scaledLength * 3, scaledLength * 3);
        cleanupObjects.push(groundGeometry);

        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.8,
            metalness: 0.2,
            side: THREE.DoubleSide
        });
        cleanupObjects.push(groundMaterial);

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = Math.PI / 2;
        ground.position.y = -scaledThickness * 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Add grid for reference
        const gridHelper = new THREE.GridHelper(scaledLength * 2, 20);
        gridHelper.position.y = -scaledThickness * 2;
        scene.add(gridHelper);

        // Position camera
        camera.position.set(scaledWidth * 2, scaledThickness * 4, scaledLength * 0.5);
        camera.lookAt(busbar.position);
        controls.update();

        // Add info about the busbar dimensions
        const textCanvas = document.createElement('canvas');
        const context = textCanvas.getContext('2d');
        textCanvas.width = 512;
        textCanvas.height = 128;
        context.fillStyle = '#ffffff';
        context.font = '24px Arial';
        context.fillText(`${width} × ${thickness} × ${length} mm`, 10, 40);
        context.fillText(`Material: ${busbarData.material || 'Copper'}`, 10, 80);

        const textTexture = new THREE.CanvasTexture(textCanvas);
        cleanupObjects.push(textTexture);

        const textMaterial = new THREE.MeshBasicMaterial({
            map: textTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        cleanupObjects.push(textMaterial);

        const textGeometry = new THREE.PlaneGeometry(10, 2.5);
        cleanupObjects.push(textGeometry);

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(0, scaledThickness * 4, 0);
        scene.add(textMesh);

        // Make text always face camera
        const updateLabelOrientation = () => {
            textMesh.lookAt(camera.position);
        };

        // Add listener for camera movement
        controls.addEventListener('change', updateLabelOrientation);

        // Store disposal objects
        objectsToDisposeRef.current = cleanupObjects;

        // Animation loop
        const animate = () => {
            requestRef.current = requestAnimationFrame(animate);
            controls.update();
            updateLabelOrientation();
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

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);

            if (controlsRef.current) {
                controlsRef.current.removeEventListener('change', updateLabelOrientation);
                controlsRef.current.dispose();
                controlsRef.current = null;
            }

            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }

            // Dispose of all Three.js objects
            objectsToDisposeRef.current.forEach(object => {
                if (object && object.dispose) {
                    object.dispose();
                }
            });
            objectsToDisposeRef.current = [];

            if (rendererRef.current && mountRef.current) {
                if (mountRef.current.contains(rendererRef.current.domElement)) {
                    mountRef.current.removeChild(rendererRef.current.domElement);
                }
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
    }, [busbarData]);

    if (!busbarData) {
        return (
            <Box sx={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h6" color="textSecondary">No busbar data available for visualization</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ position: 'relative' }}>
            <div
                ref={mountRef}
                style={{
                    width: '100%',
                    height: '500px',
                    margin: '20px 0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
            />
            <Typography variant="caption" align="center" sx={{ display: 'block', mt: 1 }}>
                Click and drag to rotate the 3D model
            </Typography>
        </Box>
    );
};

export default BusbarVisualization;