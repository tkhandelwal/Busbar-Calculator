// src/components/PowerCableVisualization.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const PowerCableVisualization = ({ cableData, results }) => {
    const mountRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current || !cableData || !results || !results.suitableCables || !results.suitableCables.length) {
            return;
        }

        // Clean up any previous instances
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }

        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        // Create camera
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 5, 10);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.shadowMap.enabled = true;
        mountRef.current.appendChild(renderer.domElement);

        // Add orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Create cable visualization
        const cable = results.suitableCables[0];
        const cableSize = cable.size;
        const cableRadius = Math.sqrt(cableSize / Math.PI);

        // Cable conductor
        const cableMaterial = new THREE.MeshStandardMaterial({
            color: cableData.cableType === 'copper' ? 0xcd7f32 : 0xD3D3D3,
            metalness: 0.8,
            roughness: 0.2
        });

        const cableGeometry = new THREE.CylinderGeometry(cableRadius / 5, cableRadius / 5, 10, 32);
        const cableMesh = new THREE.Mesh(cableGeometry, cableMaterial);
        cableMesh.rotation.x = Math.PI / 2;
        scene.add(cableMesh);

        // Cable insulation
        const insulationColor =
            cableData.insulation === 'pvc' ? 0x888888 :
                cableData.insulation === 'xlpe' ? 0x444444 :
                    0x666666;

        const insulationMaterial = new THREE.MeshStandardMaterial({
            color: insulationColor,
            transparent: true,
            opacity: 0.8,
            metalness: 0.1,
            roughness: 0.9
        });

        const insulationGeometry = new THREE.CylinderGeometry(cableRadius / 3, cableRadius / 3, 10, 32);
        const insulationMesh = new THREE.Mesh(insulationGeometry, insulationMaterial);
        insulationMesh.rotation.x = Math.PI / 2;
        scene.add(insulationMesh);

        // Add a floor grid for reference
        const gridHelper = new THREE.GridHelper(20, 20);
        scene.add(gridHelper);

        // Animation loop
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);
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

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            scene.traverse(object => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else if (object.material) {
                        object.material.dispose();
                    }
                }
            });

            renderer.dispose();

            if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, [cableData, results]);

    if (!cableData || !results || !results.suitableCables || !results.suitableCables.length) {
        return null;
    }

    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: '300px',
                borderRadius: '8px',
                overflow: 'hidden',
                marginTop: '20px',
                marginBottom: '20px'
            }}
        />
    );
};

export default PowerCableVisualization;