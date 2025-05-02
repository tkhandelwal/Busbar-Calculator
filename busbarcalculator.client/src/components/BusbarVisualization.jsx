// src/components/BusbarVisualization.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BusbarVisualization = ({ busbarData }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();

        // Store refs for cleanup
        sceneRef.current = scene;
        rendererRef.current = renderer;

        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Set background color
        scene.background = new THREE.Color(0xf0f0f0);

        // Create dimensions based on busbar data
        const width = busbarData?.busbarWidth || 100;
        const thickness = busbarData?.busbarThickness || 10;
        const length = busbarData?.busbarLength || 1000;

        // Scale down for better visualization
        const scale = 0.1;
        const scaledWidth = width * scale;
        const scaledThickness = thickness * scale;
        const scaledLength = length * scale;

        // Create busbar geometry
        const geometry = new THREE.BoxGeometry(scaledWidth, scaledThickness, scaledLength);

        // Material based on temperature
        const temperatureRatio = busbarData?.temperatureRise
            ? Math.min(busbarData.temperatureRise / busbarData.maxAllowableTemperature, 1)
            : 0.5;

        // Color gradient from blue (cool) to red (hot)
        const materialColor = new THREE.Color(
            temperatureRatio,
            0.3,
            1 - temperatureRatio
        );

        const material = new THREE.MeshStandardMaterial({
            color: materialColor,
            metalness: 0.7,
            roughness: 0.3
        });

        const busbar = new THREE.Mesh(geometry, material);
        scene.add(busbar);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Position camera
        camera.position.set(scaledWidth * 2, scaledThickness * 4, scaledLength * 0.5);
        camera.lookAt(0, 0, 0);

        // Animation loop
        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            busbar.rotation.y += 0.01;
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
            cancelAnimationFrame(animationId);

            // Dispose of resources properly
            if (rendererRef.current) {
                rendererRef.current.dispose();
                mountRef.current?.removeChild(rendererRef.current.domElement);
            }

            // Dispose of geometry and material
            geometry.dispose();
            material.dispose();

            // Note: THREE.Scene doesn't have a dispose method, so we don't call scene.dispose()
            // Instead, we remove all objects from the scene
            while (sceneRef.current?.children.length > 0) {
                const object = sceneRef.current.children[0];
                sceneRef.current.remove(object);
            }
        };
    }, [busbarData]);

    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: '400px',
                margin: '20px 0',
                borderRadius: '8px',
                overflow: 'hidden'
            }}
        />
    );
};

export default BusbarVisualization;