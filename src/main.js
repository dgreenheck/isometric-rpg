import * as THREE from 'three';
import { 
  createControls, 
  createKeyHandler, 
  createResizeHandler, 
  createCameraState, 
  updateCameraState, 
  updateCameraPosition 
} from './controls';
import Stats from 'three/addons/libs/stats.module.js';
import { World } from './world';
import { createPlayer } from './player';
import { createNPCs } from './npc';
import { createGUI } from './gui';

const gameConfig = {
  renderer: {
    size: { width: window.innerWidth, height: window.innerHeight },
    pixelRatio: devicePixelRatio
  },
  camera: {
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 2, z: 0 }
  },
  lights: {
    sun: { intensity: 3, position: { x: 1, y: 2, z: 3 } },
    ambient: { intensity: 0.5 }
  },
  world: { width: 10, height: 20 },
  npcs: { count: 5 }
};

const createRenderer = (config) => {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(config.size.width, config.size.height);
  renderer.setPixelRatio(config.pixelRatio);
  document.body.appendChild(renderer.domElement);
  return renderer;
};

const createScene = () => new THREE.Scene();

const createCamera = (config) => {
  const camera = new THREE.PerspectiveCamera(config.fov, config.aspect, config.near, config.far);
  camera.position.set(config.position.x, config.position.y, config.position.z);
  return camera;
};

const createLights = (config) => ({
  sun: (() => {
    const sun = new THREE.DirectionalLight();
    sun.intensity = config.sun.intensity;
    sun.position.set(config.sun.position.x, config.sun.position.y, config.sun.position.z);
    return sun;
  })(),
  ambient: (() => {
    const ambient = new THREE.AmbientLight();
    ambient.intensity = config.ambient.intensity;
    return ambient;
  })()
});

const createAnimationLoop = (renderer, scene, camera, player, stats, cameraState, keysPressed, npcs) => {
  let lastTime = 0;

  const updateGame = (deltaTime) => {
    updateCameraState(cameraState, keysPressed);
    player.update(deltaTime);
    npcs.update(deltaTime);
    updateCameraPosition(camera, player, cameraState);
  };

  const renderFrame = () => {
    renderer.render(scene, camera);
    stats.update();
  };

  return (currentTime) => {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    updateGame(deltaTime);
    renderFrame();
  };
};

const initGame = () => {
  const renderer = createRenderer(gameConfig.renderer);
  const scene = createScene();
  const camera = createCamera(gameConfig.camera);
  const controls = createControls(camera, renderer);
  const { sun, ambient } = createLights(gameConfig.lights);
  scene.add(sun, ambient);

  const world = new World(gameConfig.world.width, gameConfig.world.height);
  scene.add(world);

  const player = createPlayer(camera, world);
  scene.add(player.mesh);

  const npcs = createNPCs(gameConfig.npcs.count, world);
  npcs.getMeshes().forEach(mesh => scene.add(mesh));

  const stats = new Stats();
  document.body.appendChild(stats.dom);

  const keysPressed = createKeyHandler();
  const cameraState = createCameraState();

  const updateWorld = () => {
    scene.remove(world);
    world.generate();
    scene.add(world);
  };

  const gui = createGUI(world, updateWorld);

  window.addEventListener('resize', createResizeHandler(camera, renderer));

  const animate = createAnimationLoop(renderer, scene, camera, player, stats, cameraState, keysPressed, npcs);
  renderer.setAnimationLoop(animate);
};

initGame();