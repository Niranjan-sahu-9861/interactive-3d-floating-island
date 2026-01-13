import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. SCENE SETUP
const scene = new THREE.Scene();
scene.background = new THREE.Color('#87CEEB'); // Sky Blue

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Positioned to see the whole aerial scene
camera.position.set(0, 15, 30); 

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#three-canvas'),
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// 2. LIGHTING
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(10, 20, 10);
sunLight.castShadow = true;
scene.add(sunLight);

// 3. LOAD MODELS
const loader = new GLTFLoader();

let airplane;
let dove, doveMixer;
let bird1, mixer1;
let bird2, mixer2;

// --- Load Island ---
loader.load('floating_island__low_poly_vr.glb', (gltf) => {
    const island = gltf.scene;
    island.position.y = -2; 
    island.scale.set(0.8, 0.8, 0.8);
    island.traverse((child) => { if (child.isMesh) child.receiveShadow = true; });
    scene.add(island);
});

// --- Load Airplane ---
loader.load('airplane.glb', (gltf) => {
    airplane = gltf.scene;
    airplane.scale.set(0.004, 0.004, 0.004); 
    scene.add(airplane);
});

// --- Load Dove Bird (Clockwise) ---
loader.load('dove_bird_rigged.glb', (gltf) => {
    dove = gltf.scene;
    dove.scale.set(0.2, 0.2, 0.2); 
    if (gltf.animations.length > 0) {
        doveMixer = new THREE.AnimationMixer(dove);
        doveMixer.clipAction(gltf.animations[0]).play();
    }
    scene.add(dove);
});

// --- Load Bird 1 (Synthwave - Counter-Clockwise) ---
loader.load('flying_synthwave_bird.glb', (gltf) => {
    bird1 = gltf.scene;
    bird1.scale.set(4, 4, 4); 
    if (gltf.animations.length > 0) {
        mixer1 = new THREE.AnimationMixer(bird1);
        mixer1.clipAction(gltf.animations[0]).play();
    }
    scene.add(bird1);
});

// --- Load Bird 2 (Phoenix - Counter-Clockwise) ---
// Note: Ensure phoenix_bird.glb is in your folder
loader.load('phoenix_bird.glb', (gltf) => {
    bird2 = gltf.scene;
    bird2.scale.set(0.005, 0.005, 0.005); // Scale may vary depending on model
    if (gltf.animations.length > 0) {
        mixer2 = new THREE.AnimationMixer(bird2);
        mixer2.clipAction(gltf.animations[0]).play();
    }
    scene.add(bird2);
}, undefined, (error) => {
    console.warn("Phoenix model not found, using a second Synthwave bird instead.");
    // Fallback if phoenix is missing
    loader.load('flying_synthwave_bird.glb', (gltf) => {
        bird2 = gltf.scene;
        bird2.scale.set(0.03, 0.03, 0.03);
        mixer2 = new THREE.AnimationMixer(bird2);
        mixer2.clipAction(gltf.animations[0]).play();
        scene.add(bird2);
    });
});

// 4. INTERACTION
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true; 

// 5. ANIMATION LOOP
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const delta = clock.getDelta();

    // AIRPLANE: Clockwise (Distance 12 to stay clear of island)
    if (airplane) {
        const radius = 12; 
        const speed = 0.5;
        airplane.position.x = Math.sin(t * speed) * radius;
        airplane.position.z = Math.cos(t * speed) * radius;
        airplane.position.y = 1;
        airplane.rotation.y = (t * speed) + Math.PI;
    }

    // DOVE: Clockwise | Distance 18 | Height 3
    if (dove) {
        const radius = 11; 
        const speed = 0.4;
        dove.position.x = Math.sin(t * speed) * radius;
        dove.position.z = Math.cos(t * speed) * radius;
        dove.position.y = 0.5;
        dove.rotation.y = (t * speed) + Math.PI; 
        if (doveMixer) doveMixer.update(delta);
    }

    // BIRD 1 (Synthwave): Counter-Clockwise | Distance 20 | Height 2
    if (bird1) {
        const radius = 20; 
        const speed = -0.6; // Negative for CCW
        bird1.position.x = Math.sin(t * speed) * radius;
        bird1.position.z = Math.cos(t * speed) * radius;
        bird1.position.y = 2;
        bird1.rotation.y = (t * speed) + Math.PI / 2;
        if (mixer1) mixer1.update(delta);
    }

    // BIRD 2 (Phoenix): Counter-Clockwise | Distance 25 | Height 4
    if (bird2) {
        const radius = 18; 
        const speed = -0.8; // Negative for CCW
        bird2.position.x = Math.sin(t * speed) * radius;
        bird2.position.z = Math.cos(t * speed) * radius;
        bird2.position.y = 1.5;
        bird2.rotation.y = (t * speed) + Math.PI / 2;
        if (mixer2) mixer2.update(delta);
    }

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();