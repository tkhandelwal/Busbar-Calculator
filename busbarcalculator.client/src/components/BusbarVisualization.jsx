// src/components/BusbarVisualization.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const BusbarVisualization = ({ busbarData }) => {
    const mountRef = useRef(null);
    const requestRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current || !busbarData) return;

        // Clear previous scene
        if (rendererRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
            mountRef.current.removeChild(rendererRef.current.domElement);
        }

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

        // Create busbar geometry
        const geometry = new THREE.BoxGeometry(scaledWidth, scaledThickness, scaledLength);
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
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.8,
            metalness: 0.2,
            side: THREE.DoubleSide
        });
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

        // Animation loop
        const animate = () => {
            requestRef.current = requestAnimationFrame(animate);
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

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);

            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }

            if (rendererRef.current && mountRef.current) {
                if (mountRef.current.contains(rendererRef.current.domElement)) {
                    mountRef.current.removeChild(rendererRef.current.domElement);
                }
            }

            if (controlsRef.current) {
                controlsRef.current.dispose();
            }

            // Dispose of geometries and materials
            geometry.dispose();
            material.dispose();
            groundGeometry.dispose();
            groundMaterial.dispose();

            if (sceneRef.current) {
                sceneRef.current.clear();
            }
        };
    }, [busbarData]);

    if (!busbarData) {
        return (
            <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="textSecondary">No busbar data available for visualization</Typography>
            </div>
        );
    }

    return (
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
    );
};

export default BusbarVisualization;