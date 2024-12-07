import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { World } from './world';
import RaycastingHelper from './helpers/RaycastingHelper';
import { CombatManager } from './CombatManager';

const gui = new GUI();

const stats = new Stats()
document.body.appendChild(stats.dom)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  window.innerWidth / -2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  window.innerHeight / -2,
  0.1, 1000);
camera.zoom = 100;
camera.position.set(10, 5, 10);
camera.updateProjectionMatrix();
camera.layers.enable(1);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(5, 0, 5);
controls.update();

RaycastingHelper.initialize(camera);

const world = new World(10, 10);
scene.add(world);

const combatManager = new CombatManager();

const sun = new THREE.DirectionalLight();
sun.intensity = 3;
sun.position.set(1, 2, 3);
scene.add(sun);

const ambient = new THREE.AmbientLight();
ambient.intensity = 0.5;
scene.add(ambient);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  stats.update();
}

/*
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
*/

const worldFolder = gui.addFolder('World');
worldFolder.add(world, 'width', 1, 20, 1).name('Width');
worldFolder.add(world, 'height', 1, 20, 1).name('Height');
worldFolder.add(world, 'treeCount', 1, 100, 1).name('Tree Count');
worldFolder.add(world, 'rockCount', 1, 100, 1).name('Rock Count');
worldFolder.add(world, 'bushCount', 1, 100, 1).name('Bush Count');
worldFolder.add(world, 'generate').name('Generate');

world.objects.players.children.forEach((player) => combatManager.addPlayer(player));
combatManager.takeTurns(world);