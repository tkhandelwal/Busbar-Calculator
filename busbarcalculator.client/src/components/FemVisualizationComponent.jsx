// New FemVisualizationComponent.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const FemVisualizationComponent = ({ femResults }) => {
    const mountRef = useRef(null);

    useEffect(() => {
        if (!femResults || !mountRef.current) return;

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();

        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Create busbar geometry based on dimensions
        const createBusbarMesh = (width, thickness, length, distribution) => {
            const geometry = new THREE.BoxGeometry(width, thickness, length);
            const material = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                metalness: 0.8,
                roughness: 0.2,
                vertexColors: true
            });

            // Apply color mapping based on stress distribution
            if (distribution && distribution.length) {
                const colors = [];
                for (let i = 0; i < geometry.attributes.position.count; i++) {
                    // Map temperature/stress values to colors (red = high, blue = low)
                    const value = distribution[i % distribution.length];
                    const normalizedValue = (value - Math.min(...distribution)) /
                        (Math.max(...distribution) - Math.min(...distribution));
                    colors.push(1, 1 - normalizedValue, 1 - normalizedValue);
                }
                geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
            }

            return new THREE.Mesh(geometry, material);
        };

        // Create busbar
        const busbar = createBusbarMesh(
            femResults.width || 100,
            femResults.thickness || 10,
            femResults.length || 1000,
            femResults.stressDistribution
        );
        scene.add(busbar);

        // Add lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 1, 1);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        // Position camera
        camera.position.z = Math.max(femResults.width, femResults.thickness, femResults.length) * 2;

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            busbar.rotation.y += 0.005;
            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, [femResults]);

    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: '400px',
                marginTop: '20px',
                marginBottom: '20px'
            }}
        />
    );
};

export default FemVisualizationComponent;