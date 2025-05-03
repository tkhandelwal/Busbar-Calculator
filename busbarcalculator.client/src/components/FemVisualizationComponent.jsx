import React, { useCallback } from 'react';
import * as THREE from 'three';
import Visualization3D from './shared/Visualization3D';

const FemVisualizationComponent = ({ femResults, busbarData }) => {
    const createScene = useCallback((scene, camera) => {
        if (!femResults || !busbarData) return;

        // Extract dimensions from busbar data or use defaults
        const width = busbarData?.busbarWidth || 100;
        const thickness = busbarData?.busbarThickness || 10;
        const length = busbarData?.busbarLength || 1000;

        // Scale for better visualization
        const scale = Math.min(1 / Math.max(width, thickness, length) * 50, 0.5);
        const scaledWidth = width * scale;
        const scaledThickness = thickness * scale;
        const scaledLength = length * scale;

        // Material setup
        const material = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.7,
            roughness: 0.3,
            vertexColors: true
        });

        // Create busbar geometry
        const geometry = new THREE.BoxGeometry(
            scaledWidth,
            scaledThickness,
            scaledLength
        );

        // Get temperature distribution data or create defaults
        let temperatureData = [];
        if (femResults && femResults.TemperatureDistribution) {
            if (Array.isArray(femResults.TemperatureDistribution)) {
                temperatureData = femResults.TemperatureDistribution;
            } else if (typeof femResults.TemperatureDistribution === 'string') {
                temperatureData = femResults.TemperatureDistribution.split(',').map(Number);
            }
        }

        // Create color attribute for heat mapping
        const colors = new Float32Array(geometry.attributes.position.count * 3);

        // Apply colors based on temperature or position if no data
        if (temperatureData.length > 0) {
            // Find min/max for normalization
            const min = Math.min(...temperatureData.filter(t => t > 0));
            const max = Math.max(...temperatureData);
            const range = max - min || 1; // Avoid division by zero

            // Apply temperature colors to vertices
            for (let i = 0; i < geometry.attributes.position.count; i++) {
                const index = i % temperatureData.length;
                const value = temperatureData[index];
                const normalizedValue = (value - min) / range || 0;

                // Red-Blue temperature gradient
                colors[i * 3] = normalizedValue;         // R
                colors[i * 3 + 1] = 0.2;                 // G
                colors[i * 3 + 2] = 1 - normalizedValue; // B
            }
        } else {
            // If no temperature data, create a gradient based on z-position
            for (let i = 0; i < geometry.attributes.position.count; i++) {
                const z = geometry.attributes.position.getZ(i);
                const normalizedZ = (z / (scaledLength)) * 0.5 + 0.5;

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
        const edges = new THREE.EdgesGeometry(geometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1
        });
        const wireframe = new THREE.LineSegments(edges, wireframeMaterial);
        busbar.add(wireframe);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 2, 1).normalize();
        scene.add(directionalLight);

        // Position camera
        camera.position.set(scaledWidth * 2, scaledThickness * 4, scaledLength * 0.7);
        camera.lookAt(busbar.position);

        // Return disposal function
        return () => {
            geometry.dispose();
            material.dispose();
            edges.dispose();
            wireframeMaterial.dispose();
        };
    }, [femResults, busbarData]);

    return (
        <Visualization3D
            createScene={createScene}
            height={400}
        />
    );
};

export default FemVisualizationComponent;