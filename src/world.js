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
  const baseScale = 0.05;
  const baseAmplitude = 2;

  const octaves = 4;
  const persistence = 0.5;
  const lacunarity = 2.0;

  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      let elevation = 0;
      let frequency = baseScale;
      let amplitude = baseAmplitude;

      for (let i = 0; i < octaves; i++) {
        const sampleX = x * frequency;
        const sampleY = y * frequency;
        const noiseValue = noise2D(sampleX, sampleY);
        elevation += noiseValue * amplitude;

        amplitude *= persistence;
        frequency *= lacunarity;
      }

      // Normalize and add some interesting features
      elevation = (elevation + baseAmplitude) / (2 * baseAmplitude);
      
      // Create some peaks
      const distanceToCenter = Math.sqrt(Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2));
      const peakFactor = Math.max(0, 1 - distanceToCenter / (Math.min(width, height) / 3));
      elevation += peakFactor * peakFactor * 2;

      // Add some valleys
      const valleyNoise = noise2D(x * 0.02, y * 0.02);
      if (valleyNoise < -0.7) {
        elevation *= 0.3 + 0.7 * (valleyNoise + 1);
      }

      return elevation * baseAmplitude;
    })
  );
};

const createAndPositionObject = ({ coords, type }, heightMap) => {
  const createFunction = createObjectFunctions[type];
  const object = createFunction(coords);
  const boundingBox = new THREE.Box3().setFromObject(object);
  const objectHeight = boundingBox.max.y - boundingBox.min.y;
  const terrainHeight = heightMap[Math.floor(coords.y)][Math.floor(coords.x)];
  
  // Adjust the y-position to place the object on top of the terrain
  object.position.set(
    coords.x + 0.5, 
    terrainHeight, 
    coords.y + 0.5
  );
  
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