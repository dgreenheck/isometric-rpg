import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { World } from './world';
import { Player } from './player';

const gui = new GUI();

const stats = new Stats()
document.body.appendChild(stats.dom)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(5, 0, 5);
camera.position.set(0, 2, 0);
controls.update();

const world = new World(10, 10);
scene.add(world);

const player = new Player(camera, world);
scene.add(player);

const sun = new THREE.DirectionalLight();
sun.intensity = 3;
sun.position.set(1, 2, 3);
scene.add(sun);

const ambient = new THREE.AmbientLight();
ambient.intensity = 0.5;
scene.add(ambient);

// Add these new variables for camera control
let cameraAngle = 0;
let cameraHeight = 2;
const cameraDistance = 5;
const rotationSpeed = 0.02;
const heightChangeSpeed = 0.05;

// Add this function to handle key presses
const keysPressed = {};
window.addEventListener('keydown', (event) => {
  keysPressed[event.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (event) => {
  keysPressed[event.key.toLowerCase()] = false;
});

let lastTime = 0;

function animate(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
  lastTime = currentTime;

  // Update camera angle based on key presses
  if (keysPressed['a'] || keysPressed['arrowleft']) {
    cameraAngle -= rotationSpeed;
  }
  if (keysPressed['d'] || keysPressed['arrowright']) {
    cameraAngle += rotationSpeed;
  }
  if (keysPressed['w'] || keysPressed['arrowup']) {
    cameraHeight = Math.min(cameraHeight + heightChangeSpeed, 10);
  }
  if (keysPressed['s'] || keysPressed['arrowdown']) {
    cameraHeight = Math.max(cameraHeight - heightChangeSpeed, 1);
  }

  // Calculate camera position
  const playerPosition = player.position;
  const cameraX = playerPosition.x + Math.sin(cameraAngle) * cameraDistance;
  const cameraZ = playerPosition.z + Math.cos(cameraAngle) * cameraDistance;

  camera.position.set(
    cameraX,
    playerPosition.y + cameraHeight,
    cameraZ
  );
  camera.lookAt(playerPosition);

  player.update(deltaTime);

  renderer.render(scene, camera);
  stats.update();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const worldFolder = gui.addFolder('World');
worldFolder.add(world, 'width', 1, 20, 1).name('Width');
worldFolder.add(world, 'height', 1, 20, 1).name('Height');
worldFolder.add(world, 'treeCount', 1, 100, 1).name('Tree Count');
worldFolder.add(world, 'rockCount', 1, 100, 1).name('Rock Count');
worldFolder.add(world, 'bushCount', 1, 100, 1).name('Bush Count');

worldFolder.add(world, 'generate').name('Generate');