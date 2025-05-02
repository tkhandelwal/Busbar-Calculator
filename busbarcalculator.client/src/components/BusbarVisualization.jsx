// Enhanced BusbarVisualization.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const BusbarVisualization = ({ busbarData }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );

        const renderer = new THREE.WebGLRenderer({ antialias: true });

        // Store refs for cleanup
        sceneRef.current = scene;
        rendererRef.current = renderer;

        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);

        // Add OrbitControls for better interaction
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controlsRef.current = controls;

        // Set background color
        scene.background = new THREE.Color(0xf5f5f5);

        // Create dimensions based on busbar data with proper scaling
        const width = busbarData?.busbarWidth || 100;
        const thickness = busbarData?.busbarThickness || 10;
        const length = busbarData?.busbarLength || 1000;

        // Scale down for better visualization
        const maxDimension = Math.max(width, thickness, length);
        const scale = 80 / maxDimension; // Aim for ~80 units max size

        const scaledWidth = width * scale;
        const scaledThickness = thickness * scale;
        const scaledLength = length * scale;

        // Create busbar geometry
        const geometry = new THREE.BoxGeometry(scaledWidth, scaledThickness, scaledLength);

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
            roughness: 0.3,
            envMapIntensity: 1.0
        });

        const busbar = new THREE.Mesh(geometry, material);
        busbar.castShadow = true;
        busbar.receiveShadow = true;
        scene.add(busbar);

        // Add magnetic field visualization (field lines)
        addMagneticFieldLines(scene, busbar, scaledWidth, scaledThickness, scaledLength);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(scaledWidth * 2, scaledThickness * 4, scaledLength * 0.5);
        directionalLight.castShadow = true;

        // Set up shadow properties
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        scene.add(directionalLight);

        // Add a subtle spotlight for dramatic effect
        const spotLight = new THREE.SpotLight(0xffffff, 0.5);
        spotLight.position.set(-scaledWidth * 3, scaledThickness * 5, -scaledLength * 0.5);
        spotLight.castShadow = true;
        scene.add(spotLight);

        // Add a ground plane for shadow casting
        const groundGeometry = new THREE.PlaneGeometry(scaledLength * 3, scaledLength * 3);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            roughness: 0.8,
            metalness: 0.2,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = Math.PI / 2;
        ground.position.y = -scaledThickness * 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Position camera
        camera.position.set(scaledWidth * 2, scaledThickness * 4, scaledLength * 0.5);
        camera.lookAt(busbar.position);
        controls.update();

        // Add grid for reference
        const gridHelper = new THREE.GridHelper(scaledLength * 2, 20, 0x888888, 0x444444);
        gridHelper.position.y = -scaledThickness * 2;
        scene.add(gridHelper);

        // Animation loop with smoother rotation
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
            if (rendererRef.current && mountRef.current) {
                mountRef.current.removeChild(rendererRef.current.domElement);
            }

            if (controlsRef.current) {
                controlsRef.current.dispose();
            }

            // Dispose of geometries and materials
            geometry.dispose();
            material.dispose();
            groundGeometry.dispose();
            groundMaterial.dispose();

            // Clear scene
            if (sceneRef.current) {
                sceneRef.current.clear();
            }
        };
    }, [busbarData]);

    // Function to add magnetic field visualization
    const addMagneticFieldLines = (scene, busbar, width, height, length) => {
        // Use current value to determine field strength
        const current = busbarData?.current || 1000;
        const normalizedCurrent = Math.min(Math.max(current / 5000, 0.2), 1);

        // Create magnetic field lines as curved tubes
        const fieldLineCount = 12;
        const fieldRadius = Math.max(width, height) * 3;

        // Create field lines in circular patterns around the busbar
        for (let i = 0; i < fieldLineCount; i++) {
            const angle = (i / fieldLineCount) * Math.PI * 2;
            const curve = new THREE.CubicBezierCurve3(
                new THREE.Vector3(Math.cos(angle) * fieldRadius, Math.sin(angle) * fieldRadius, -length / 2),
                new THREE.Vector3(Math.cos(angle + Math.PI / 2) * fieldRadius, Math.sin(angle + Math.PI / 2) * fieldRadius, -length / 4),
                new THREE.Vector3(Math.cos(angle + Math.PI) * fieldRadius, Math.sin(angle + Math.PI) * fieldRadius, length / 4),
                new THREE.Vector3(Math.cos(angle + Math.PI * 3 / 2) * fieldRadius, Math.sin(angle + Math.PI * 3 / 2) * fieldRadius, length / 2)
            );

            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);

            // Create a ColorRamp for the field line
            const colors = [];
            for (let j = 0; j < points.length; j++) {
                const strength = 1 - j / points.length;  // Fade out along the line
                colors.push(
                    normalizedCurrent * (1 - strength), // R: increases with distance
                    0.1 + strength * 0.4,             // G: constant low value
                    0.8 - normalizedCurrent * 0.5 * strength  // B: higher for stronger fields
                );
            }

            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            const material = new THREE.LineBasicMaterial({
                vertexColors: true,
                linewidth: 2,
                opacity: 0.7 * normalizedCurrent,
                transparent: true
            });

            const fieldLine = new THREE.Line(geometry, material);
            scene.add(fieldLine);
        }
    };

    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: '500px', // Increased height for better visibility
                margin: '20px 0',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
        />
    );
};

export default BusbarVisualization;