import * as THREE from 'three';
import { 
  createControls, 
  createKeyHandler, 
  createResizeHandler, 
  createCameraState, 
  updateCameraState, 
  updateCameraPosition,
  createMouseWheelHandler
} from './controls';
import Stats from 'three/addons/libs/stats.module.js';
import { World } from './world';
import { createPlayer } from './player';
import { createNPCs } from './npc';
import { createGUI } from './gui';
import { Sky } from 'three/addons/objects/Sky.js';
import { Clouds } from './world/clouds';

const gameConfig = {
  renderer: {
    size: { width: window.innerWidth, height: window.innerHeight },
    pixelRatio: window.devicePixelRatio
  },
  camera: {
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 2, z: 0 }
  },
  lights: {
    sun: { 
      intensity: 0.8,
      position: { x: 1, y: 0.1, z: 0 }
    },
    ambient: { intensity: 1 }
  },
  sky: {
    turbidity: 0.5,
    rayleigh: 0.5,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.85,
    elevation: 2.79,
    azimuth: 90,
    exposure: 1
  },
  world: { 
    width: 100, 
    height: 100,
    objects: {
      trees: 250,
      rocks: 150,
      bushes: 100
    }
  },
  npcs: { count: 5 },
  defaultPlayerConfig: {
    initialPosition: { x: 40.5, z: 60.5 },
    moveSpeed: 2,
    cameraOffset: { y: 5, z: 5 }
  }
};

class Game {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.world = null;
    this.player = null;
    this.npcs = null;
    this.stats = null;
    this.keysPressed = null;
    this.cameraState = null;
    this.sky = null;
    this.sunLight = null;
    this.gui = null;
    this.clouds = null;
  }

  init() {
    this.createRenderer();
    this.createScene();
    this.createCamera();
    this.createControls();
    this.createSky();
    this.createLights();
    this.createWorld();
    this.createPlayer();
    this.createNPCs();
    this.createStats();
    this.createInputHandlers();
    this.createGUI();
    this.setupEventListeners();
    this.startAnimationLoop();
    this.createClouds();
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(gameConfig.renderer.size.width, gameConfig.renderer.size.height);
    this.renderer.setPixelRatio(gameConfig.renderer.pixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = gameConfig.sky.exposure;
    document.body.appendChild(this.renderer.domElement);
  }

  createScene() {
    this.scene = new THREE.Scene();
  }

  createCamera() {
    const { fov, aspect, near, far, position } = gameConfig.camera;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(position.x, position.y, position.z);
  }

  createControls() {
    this.controls = createControls(this.camera, this.renderer);
  }

  createSky() {
    this.sky = new Sky();
    this.sky.scale.setScalar(450000);
    this.sky.name = 'sky';
    this.scene.add(this.sky);
    this.updateSkyUniforms();
  }

  createLights() {
    this.sunLight = new THREE.DirectionalLight(0xffffff, gameConfig.lights.sun.intensity);
    this.sunLight.name = 'sun';
    this.scene.add(this.sunLight);

    const ambient = new THREE.AmbientLight(0xffffff, gameConfig.lights.ambient.intensity);
    ambient.name = 'ambient';
    this.scene.add(ambient);

    this.updateSunPosition();
  }

  createWorld() {
    this.world = new World(gameConfig.world);
    this.scene.add(this.world);
  }

  createPlayer() {
    this.player = createPlayer(this.camera, this.world, gameConfig.defaultPlayerConfig);
    this.scene.add(this.player.mesh);
  }

  createNPCs() {
    this.npcs = createNPCs(gameConfig.npcs.count, this.world);
    this.npcs.getMeshes().forEach(mesh => this.scene.add(mesh));
  }

  createStats() {
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
  }

  createInputHandlers() {
    this.keysPressed = createKeyHandler();
    this.cameraState = createCameraState();
  }

  createGUI() {
    this.gui = createGUI(gameConfig, this.updateGame.bind(this));
  }

  setupEventListeners() {
    window.addEventListener('resize', createResizeHandler(this.camera, this.renderer));
    window.addEventListener('wheel', createMouseWheelHandler(this.cameraState));
  }

  startAnimationLoop() {
    const animate = this.createAnimationLoop();
    this.renderer.setAnimationLoop(animate);
  }

  createAnimationLoop() {
    let lastTime = 0;

    return (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      this.update(deltaTime);
      this.render();
    };
  }

  update(deltaTime) {
    updateCameraState(this.cameraState, this.keysPressed);
    this.player.update(deltaTime);
    this.npcs.update(deltaTime);
    updateCameraPosition(this.camera, this.player, this.cameraState);
    if (this.clouds) {
      this.clouds.update(deltaTime);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.stats.update();
  }

  updateGame(path, value) {
    if (!path) {
      console.warn('Update path is undefined');
      return;
    }

    const updatePath = path.split('.');
    let config = gameConfig;
    for (let i = 0; i < updatePath.length - 1; i++) {
      config = config[updatePath[i]];
    }
    config[updatePath[updatePath.length - 1]] = value;

    switch (updatePath[0]) {
      case 'sky':
        this.updateSky(updatePath[1], value);
        break;
      case 'lights':
        this.updateLights(updatePath[1], updatePath[2], value);
        break;
      case 'world':
        // Update the world for any change in the world config
        this.updateWorld();
        break;
      case 'npcs':
        this.updateNPCs(updatePath[1], value);
        break;
      case 'defaultPlayerConfig':
        this.player.updateConfig(gameConfig.defaultPlayerConfig);
        break;
    }
  }

  updateSky(property, value) {
    if (this.sky && this.sky.material && this.sky.material.uniforms) {
      switch (property) {
        case 'turbidity':
        case 'rayleigh':
        case 'mieCoefficient':
        case 'mieDirectionalG':
          if (this.sky.material.uniforms[property]) {
            this.sky.material.uniforms[property].value = value;
          }
          break;
        case 'elevation':
        case 'azimuth':
          this.updateSunPosition();
          break;
        case 'exposure':
          if (this.renderer) {
            this.renderer.toneMappingExposure = value;
          }
          break;
      }
    }
  }

  updateLights(lightType, property, value) {
    if (lightType === 'sun' && property === 'intensity' && this.sunLight) {
      this.sunLight.intensity = value;
    } else if (lightType === 'ambient') {
      const ambient = this.scene.getObjectByName('ambient');
      if (ambient) {
        ambient.intensity = value;
      }
    }
  }

  updateWorld() {
    const oldWorld = this.world;
    this.scene.remove(oldWorld);
    this.world = new World(gameConfig.world);
    this.scene.add(this.world);

    // Update player position
    const playerPos = this.player.getPosition();
    const newPlayerHeight = this.world.getTerrainHeight(playerPos.x, playerPos.z) + 0.5;
    this.player.setPosition(new THREE.Vector3(playerPos.x, newPlayerHeight, playerPos.z));

    // Update NPC positions
    this.npcs.updatePositions(this.world);

    // Update camera position
    updateCameraPosition(this.camera, this.player, this.cameraState);

    // Update clouds
    if (this.clouds) {
      this.scene.remove(this.clouds.clouds);
    }
    this.createClouds();
  }

  updateNPCs(property, value) {
    if (property === 'count') {
      const currentCount = this.npcs.getCount();
      const diff = value - currentCount;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          const newNPCMesh = this.npcs.addNPC();
          this.scene.add(newNPCMesh);
        }
      } else if (diff < 0) {
        for (let i = 0; i < -diff; i++) {
          const removedNPCMesh = this.npcs.removeNPC();
          if (removedNPCMesh) {
            this.scene.remove(removedNPCMesh);
          }
        }
      }
      gameConfig.npcs.count = value;
    }
  }

  updateSkyUniforms() {
    const uniforms = this.sky.material.uniforms;
    uniforms['turbidity'].value = gameConfig.sky.turbidity;
    uniforms['rayleigh'].value = gameConfig.sky.rayleigh;
    uniforms['mieCoefficient'].value = gameConfig.sky.mieCoefficient;
    uniforms['mieDirectionalG'].value = gameConfig.sky.mieDirectionalG;
  }

  updateSunPosition() {
    if (this.sky && this.sky.material && this.sky.material.uniforms && this.sunLight) {
      const phi = THREE.MathUtils.degToRad(90 - gameConfig.sky.elevation);
      const theta = THREE.MathUtils.degToRad(gameConfig.sky.azimuth);
      const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
      this.sky.material.uniforms['sunPosition'].value.copy(sunPosition);
      this.sunLight.position.copy(sunPosition);
    }
  }

  createClouds() {
    this.clouds = new Clouds(this.scene, { width: gameConfig.world.width, height: gameConfig.world.height });
  }
}

const game = new Game();
game.init();