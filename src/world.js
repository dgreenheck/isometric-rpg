import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { createTerrain } from './world/terrain';
import { createTree } from './world/tree';
import { createRock } from './world/rock';
import { createBush } from './world/bush';

const createObjectFunctions = {
  trees: createTree,
  rocks: createRock,
  bushes: createBush
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
  const createFunction = createObjectFunctions[type];
  const object = createFunction(coords);
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
  constructor(config) {
    super();
    this.width = config.width;
    this.height = config.height;
    this.objectCount = Object.values(config.objects).reduce((sum, count) => sum + count, 0);
    this.objectConfig = config.objects;
    this.terrain = null;
    this.path = new THREE.Group();
    this.preGeneratedObjects = this.generateObjects();
    this.heightMap = generateHeightMap(this.width, this.height);

    this.generate();
  }

  generateObjects() {
    const objects = [];
    for (const [type, count] of Object.entries(this.objectConfig)) {
      for (let i = 0; i < count; i++) {
        const { coords, key } = generateUniqueCoords(this.width, this.height, new Set(objects.map(obj => `${obj.coords.x}-${obj.coords.y}`)));
        objects.push({ coords, type });
      }
    }
    return objects;
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