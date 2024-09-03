import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
const gridTexture = textureLoader.load('textures/grid.png');

export class World extends THREE.Group {
  #objectMap = new Map();

  constructor(width, height) {
    super();

    this.width = width;
    this.height = height;
    this.treeCount = 10;
    this.rockCount = 20;
    this.bushCount = 10;

    this.trees = new THREE.Group();
    this.add(this.trees);

    this.rocks = new THREE.Group();
    this.add(this.rocks);

    this.bushes = new THREE.Group();
    this.add(this.bushes);

    this.generate();
  }

  generate() {
    this.clear();
    this.createTerrain();
    this.createTrees();
    this.createRocks();
    this.createBushes();
  }

  clear() {
    if (this.terrain) {
      this.terrain.geometry.dispose();
      this.terrain.material.dispose();
      this.remove(this.terrain);
    }

    if (this.trees) {
      this.trees.children.forEach((tree) => {
        tree.geometry?.dispose();
        tree.material?.dispose();
      });
      this.trees.clear();
    }

    if (this.rocks) {
      this.rocks.children.forEach((rock) => {
        rock.geometry?.dispose();
        rock.material?.dispose();
      });
      this.rocks.clear();
    }

    if (this.bushes) {
      this.bushes.children.forEach((bush) => {
        bush.geometry?.dispose();
        bush.material?.dispose();
      });
      this.bushes.clear();
    }

    this.#objectMap.clear();
  }

  createTerrain() {
    gridTexture.repeat = new THREE.Vector2(this.width, this.height);
    gridTexture.wrapS = THREE.RepeatWrapping;
    gridTexture.wrapT = THREE.RepeatWrapping;
    gridTexture.colorSpace = THREE.SRGBColorSpace;

    const terrainMaterial = new THREE.MeshStandardMaterial({
      map: gridTexture
    });

    const terrainGeometry = new THREE.BoxGeometry(this.width, 0.1, this.height);

    this.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    this.terrain.name = 'Terrain';
    this.terrain.position.set(this.width / 2, -0.05, this.height / 2);
    this.add(this.terrain);
  }

  createTrees() {
    const treeRadius = 0.2;
    const treeHeight = 1;

    const treeGeometry = new THREE.ConeGeometry(treeRadius, treeHeight, 8);
    const treeMaterial = new THREE.MeshStandardMaterial({
      color: 0x305010,
      flatShading: true
    });

    for (let i = 0; i < this.treeCount; i++) {
      const treeMesh = new THREE.Mesh(treeGeometry, treeMaterial);

      const coords = new THREE.Vector2(
        Math.floor(this.width * Math.random()),
        Math.floor(this.height * Math.random())
      );

      // Don't place objects on top of each other
      if (this.#objectMap.has(`${coords.x}-${coords.y}`)) continue;

      treeMesh.position.set(
        coords.x + 0.5,
        treeHeight / 2,
        coords.y + 0.5
      );

      this.trees.add(treeMesh);

      this.#objectMap.set(`${coords.x}-${coords.y}`, treeMesh);
    }
  }

  createRocks() {
    const minRockRadius = 0.1;
    const maxRockRadius = 0.3;
    const minRockHeight = 0.5;
    const maxRockHeight = 0.8;

    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0xb0b0b0,
      flatShading: true
    });


    for (let i = 0; i < this.rockCount; i++) {
      const radius = minRockRadius + (Math.random() * (maxRockRadius - minRockRadius));
      const height = minRockHeight + (Math.random() * (maxRockHeight - minRockHeight));
      const rockGeometry = new THREE.SphereGeometry(radius, 6, 5);
      const rockMesh = new THREE.Mesh(rockGeometry, rockMaterial);

      const coords = new THREE.Vector2(
        Math.floor(this.width * Math.random()),
        Math.floor(this.height * Math.random())
      );

      // Don't place objects on top of each other
      if (this.#objectMap.has(`${coords.x}-${coords.y}`)) continue;

      rockMesh.position.set(
        coords.x + 0.5,
        0,
        coords.y + 0.5
      );

      rockMesh.scale.y = height;
      this.rocks.add(rockMesh);

      this.#objectMap.set(`${coords.x}-${coords.y}`, rockMesh);
    }
  }

  createBushes() {
    const minBushRadius = 0.1;
    const maxBushRadius = 0.3;

    const bushMaterial = new THREE.MeshStandardMaterial({
      color: 0x80a040,
      flatShading: true
    });

    for (let i = 0; i < this.bushCount; i++) {
      const radius = minBushRadius + (Math.random() * (maxBushRadius - minBushRadius));
      const bushGeometry = new THREE.SphereGeometry(radius, 8, 8);
      const bushMesh = new THREE.Mesh(bushGeometry, bushMaterial);

      const coords = new THREE.Vector2(
        Math.floor(this.width * Math.random()),
        Math.floor(this.height * Math.random())
      );

      // Don't place objects on top of each other
      if (this.#objectMap.has(`${coords.x}-${coords.y}`)) continue;

      bushMesh.position.set(
        coords.x + 0.5,
        radius,
        coords.y + 0.5
      );
      this.bushes.add(bushMesh);

      this.#objectMap.set(`${coords.x}-${coords.y}`, bushMesh);
    }
  }
}