import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { createTerrain } from './world/terrain';
import { createTree } from './world/tree';
import { createRock } from './world/rock';
import { createBush } from './world/bush';

const createObjectFunctions = {
  tree: createTree,
  rock: createRock,
  bush: createBush
};

const objectTypes = Object.keys(createObjectFunctions);

const generateRandomCoord = (max) => Math.floor(max * Math.random());

const generateUniqueCoords = (width, height, occupiedPositions) => {
  const coords = new THREE.Vector2(generateRandomCoord(width), generateRandomCoord(height));
  const key = `${coords.x}-${coords.y}`;
  return occupiedPositions.has(key) ? generateUniqueCoords(width, height, occupiedPositions) : { coords, key };
};

const getRandomObjectType = () => objectTypes[Math.floor(Math.random() * objectTypes.length)];

const generateObjects = (width, height, count) => {
  const generateObject = (acc) => {
    if (acc.objects.length >= count) return acc.objects;
    const { coords, key } = generateUniqueCoords(width, height, acc.occupiedPositions);
    const type = getRandomObjectType();
    return generateObject({
      objects: [...acc.objects, { coords, type }],
      occupiedPositions: new Set([...acc.occupiedPositions, key])
    });
  };

  return generateObject({ objects: [], occupiedPositions: new Set() });
};

const generateHeightMap = (width, height) => {
  const noise2D = createNoise2D();
  const scale = 0.1;
  const amplitude = 2;

  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) =>
      (noise2D(x * scale, y * scale) + 1) * 0.5 * amplitude
    )
  );
};

const createAndPositionObject = ({ coords, type }, heightMap) => {
  const object = createObjectFunctions[type](coords);
  const boundingBox = new THREE.Box3().setFromObject(object);
  const objectHeight = boundingBox.max.y - boundingBox.min.y;
  const terrainHeight = heightMap[Math.floor(coords.y)][Math.floor(coords.x)];
  object.position.set(coords.x + 0.5, terrainHeight + objectHeight / 2, coords.y + 0.5);
  return object;
};

const createObjectMap = (objects) => new Map(
  objects.map(obj => [`${Math.floor(obj.position.x)}-${Math.floor(obj.position.z)}`, obj])
);

export class World extends THREE.Group {
  constructor(width, height, objectCount = 40) {
    super();
    this.width = width;
    this.height = height;
    this.objectCount = objectCount;
    this.terrain = null;
    this.path = new THREE.Group();
    this.preGeneratedObjects = generateObjects(width, height, objectCount);
    this.heightMap = generateHeightMap(width, height);

    this.generate();
  }

  generate() {
    this.clear();
    
    this.terrain = createTerrain(this.width, this.height, this.heightMap);
    this.add(this.terrain);

    const worldObjects = this.preGeneratedObjects.map(obj => createAndPositionObject(obj, this.heightMap));

    this.add(...worldObjects);
    this.add(this.path);

    this.objectMap = createObjectMap(worldObjects);
  }

  clear() {
    this.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    this.removeAll();
  }

  removeAll() {
    while(this.children.length > 0) {
      this.remove(this.children[0]);
    }
  }

  getObject(coords) {
    return this.objectMap.get(`${coords.x}-${coords.y}`) || null;
  }
}