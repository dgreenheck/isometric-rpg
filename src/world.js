import * as THREE from 'three';
import { Bush } from './objects/Bush';
import { GameObject } from './objects/GameObject';
import { Rock } from './objects/Rock';
import { Tree } from './objects/Tree';
import { getKey } from './utils';
import { HumanPlayer } from './players/HumanPlayer';

const textureLoader = new THREE.TextureLoader();
const gridTexture = textureLoader.load('textures/grid.png');

export class World extends THREE.Group {
  #objectMap = new Map();

  constructor(width, height) {
    super();

    this.width = width;
    this.height = height;
    this.treeCount = 10;
    this.rockCount = 30;
    this.bushCount = 10;

    this.objects = new THREE.Group();
    this.add(this.objects);

    this.players = new THREE.Group();
    this.objects.add(this.players);

    this.props = new THREE.Group();
    this.objects.add(this.props);

    this.path = new THREE.Group();
    this.add(this.path);

    this.generate();
  }

  generate() {
    this.clear();

    const player1 = new HumanPlayer(new THREE.Vector3(1, 0, 5));
    player1.name = 'Player 1';
    this.addObject(player1, 'players');

    const player2 = new HumanPlayer(new THREE.Vector3(8, 0, 3));
    player2.name = 'Player 2';
    this.addObject(player2, 'players');

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

    this.players.clear();
    this.props.clear();
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
    for (let i = 0; i < this.treeCount; i++) {
      const coords = new THREE.Vector3(
        Math.floor(this.width * Math.random()),
        0,
        Math.floor(this.height * Math.random())
      );

      const tree = new Tree(coords);
      this.addObject(tree, 'props');
    }
  }

  createRocks() {
    for (let i = 0; i < this.rockCount; i++) {
      const coords = new THREE.Vector3(
        Math.floor(this.width * Math.random()),
        0,
        Math.floor(this.height * Math.random())
      );

      const rock = new Rock(coords);
      this.addObject(rock, 'props');
    }
  }

  createBushes() {
    for (let i = 0; i < this.bushCount; i++) {
      const coords = new THREE.Vector3(
        Math.floor(this.width * Math.random()),
        0,
        Math.floor(this.height * Math.random())
      );

      const bush = new Bush(coords);
      this.addObject(bush, 'props');
    }
  }

  /**
   * Adds an object to the world at the specified coordinates unless
   * an object already exists at those coordinates
   * @param {GameObject} object 
   * @param {'players' | 'props'} group The group to add the object to
   * @returns 
   */
  addObject(object, group) {
    // Don't place objects on top of each other
    if (this.#objectMap.has(getKey(object.coords))) {
      return false;
    }

    switch (group) {
      case 'players':
        this.players.add(object);
        break;
      case 'props':
        this.props.add(object);
        break;
    }

    object.onMove = (object, oldCoords, newCoords) => {
      this.#objectMap.delete(getKey(oldCoords));
      this.#objectMap.set(getKey(newCoords), object);
    };

    object.onDestroy = (object) => {
      this.#objectMap.delete(getKey(object.coords));
      object.removeFromParent();
    };

    this.#objectMap.set(getKey(object.coords), object);

    return true;
  }

  /**
   * Returns the object at `coords` if one exists, otherwise returns null
   * @param {THREE.Vector2} coords 
   * @returns {object | null}
   */
  getObject(coords) {
    return this.#objectMap.get(getKey(coords)) ?? null;
  }
}