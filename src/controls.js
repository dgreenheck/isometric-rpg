import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const createControls = (camera, renderer) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(5, 0, 5);
  controls.update();
  return controls;
};

const createKeyHandler = () => {
  const keysPressed = {};
  const handleKeyDown = (event) => { keysPressed[event.key.toLowerCase()] = true; };
  const handleKeyUp = (event) => { keysPressed[event.key.toLowerCase()] = false; };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return keysPressed;
};

const createResizeHandler = (camera, renderer) => () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

// New functions for camera control
const createCameraState = () => ({
  angle: 0,
  height: 2,
  distance: 5,
  rotationSpeed: 0.02,
  heightChangeSpeed: 0.05,
  zoomSpeed: 0.1,
  minZoom: 2,
  maxZoom: 10
});

const updateCameraState = (cameraState, keysPressed) => {
  if (keysPressed['a'] || keysPressed['arrowleft']) cameraState.angle -= cameraState.rotationSpeed;
  if (keysPressed['d'] || keysPressed['arrowright']) cameraState.angle += cameraState.rotationSpeed;
  if (keysPressed['w'] || keysPressed['arrowup']) cameraState.height = Math.min(cameraState.height + cameraState.heightChangeSpeed, 10);
  if (keysPressed['s'] || keysPressed['arrowdown']) cameraState.height = Math.max(cameraState.height - cameraState.heightChangeSpeed, 1);
};

const updateCameraPosition = (camera, player, cameraState) => {
  const { angle, height, distance } = cameraState;
  const playerPosition = player.getPosition();
  const cameraX = playerPosition.x + Math.sin(angle) * distance;
  const cameraZ = playerPosition.z + Math.cos(angle) * distance;

  camera.position.set(cameraX, playerPosition.y + height, cameraZ);
  camera.lookAt(playerPosition);
};

const createMouseWheelHandler = (cameraState) => (event) => {
  const zoomAmount = event.deltaY * cameraState.zoomSpeed * 0.01;
  cameraState.distance = Math.max(
    cameraState.minZoom,
    Math.min(cameraState.maxZoom, cameraState.distance + zoomAmount)
  );
};

export { 
  createControls, 
  createKeyHandler, 
  createResizeHandler, 
  createCameraState, 
  updateCameraState, 
  updateCameraPosition,
  createMouseWheelHandler
};