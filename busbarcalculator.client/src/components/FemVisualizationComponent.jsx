// busbarcalculator.client/src/components/FemVisualizationComponent.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const FemVisualizationComponent = ({ femResults, busbarData }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Clean up previous scene
        if (rendererRef.current) {
            mountRef.current.removeChild(rendererRef.current.domElement);
        }

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Extract dimensions from busbar data or use defaults
        const width = busbarData?.busbarWidth || 100;
        const thickness = busbarData?.busbarThickness || 10;
        const length = busbarData?.busbarLength || 1000;

        // Scale for better visualization
        const scale = Math.min(1 / Math.max(width, thickness, length) * 50, 0.5);

        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current = renderer;

        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0xf0f0f0);
        mountRef.current.appendChild(renderer.domElement);

        // Add orbit controls for interactivity
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;

        // Set scene background
        scene.background = new THREE.Color(0xf5f5f5);

        // Create busbar geometry
        const geometry = new THREE.BoxGeometry(
            width * scale,
            thickness * scale,
            length * scale
        );

        // Material setup
        const material = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.7,
            roughness: 0.3,
            vertexColors: true
        });

        // Create color attribute for heat mapping
        const colors = new Float32Array(geometry.attributes.position.count * 3);

        // Get temperature distribution data or create defaults
        let temperatureData = [];
        if (femResults && femResults.TemperatureDistribution) {
            if (Array.isArray(femResults.TemperatureDistribution)) {
                temperatureData = femResults.TemperatureDistribution;
            } else if (typeof femResults.TemperatureDistribution === 'string') {
                temperatureData = femResults.TemperatureDistribution.split(',').map(Number);
            }
        }

        // Apply colors based on temperature or position if no data
        const colorArray = Array(geometry.attributes.position.count).fill(0);

        if (temperatureData.length > 0) {
            // Find min/max for normalization
            const min = Math.min(...temperatureData.filter(t => t > 0));
            const max = Math.max(...temperatureData);

            // Apply temperature colors to vertices
            for (let i = 0; i < geometry.attributes.position.count; i++) {
                const index = i % temperatureData.length;
                const value = temperatureData[index];
                const normalizedValue = (value - min) / (max - min) || 0;

                // Red-Blue temperature gradient
                colors[i * 3] = normalizedValue;         // R
                colors[i * 3 + 1] = 0.2;                 // G
                colors[i * 3 + 2] = 1 - normalizedValue; // B
            }
        } else {
            // If no temperature data, create a gradient based on z-position
            for (let i = 0; i < geometry.attributes.position.count; i++) {
                const z = geometry.attributes.position.getZ(i);
                const normalizedZ = (z / (length * scale)) * 0.5 + 0.5;

                colors[i * 3] = normalizedZ;     // R
                colors[i * 3 + 1] = 0.2;         // G
                colors[i * 3 + 2] = 1 - normalizedZ; // B
            }
        }

        // Add colors to geometry
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create busbar mesh
        const busbar = new THREE.Mesh(geometry, material);
        busbar.position.set(0, 0, 0);
        scene.add(busbar);

        // Create a simple wireframe to show the edges
        const wireframe = new THREE.LineSegments(
            new THREE.EdgesGeometry(geometry),
            new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 })
        );
        busbar.add(wireframe);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 2, 1).normalize();
        scene.add(directionalLight);

        // Position camera
        camera.position.set(width * scale * 2, thickness * scale * 4, length * scale * 0.7);
        camera.lookAt(busbar.position);
        controls.update();

        // Add animation loop
        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // Handle resize
        const handleResize = () => {
            if (!mountRef.current) return;

            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Clean up function
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);

            if (rendererRef.current && mountRef.current) {
                mountRef.current.removeChild(rendererRef.current.domElement);
            }

            // Dispose of resources
            geometry.dispose();
            material.dispose();
            controls.dispose();

            if (sceneRef.current) {
                sceneRef.current.clear();
            }
        };
    }, [femResults, busbarData]);

    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: '400px',
                marginTop: '20px',
                marginBottom: '20px',
                borderRadius: '8px',
                overflow: 'hidden'
            }}
        />
    );
};

export default FemVisualizationComponent;