import * as THREE from 'three';

const createTerrain = (width, height) => {
  const textureLoader = new THREE.TextureLoader();
  const gridTexture = textureLoader.load('textures/grid.png');

  gridTexture.repeat = new THREE.Vector2(width, height);
  gridTexture.wrapS = THREE.RepeatWrapping;
  gridTexture.wrapT = THREE.RepeatWrapping;
  gridTexture.colorSpace = THREE.SRGBColorSpace;

  const terrainMaterial = new THREE.MeshStandardMaterial({ map: gridTexture });
  const terrainGeometry = new THREE.BoxGeometry(width, 0.1, height);

  const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrain.name = 'Terrain';
  terrain.position.set(width / 2, -0.05, height / 2);
  return terrain;
};

export { createTerrain };