import * as THREE from 'three';
import { createTextMaterial } from '../utils';

export class GameObject extends THREE.Mesh {
  /**
   * @type {THREE.Vector3}
   */
  coords;

  /**
   * @type {THREE.Sprite}
   */
  healthDisplay;

  /**
   * @type {number}
   */
  hitPoints = 10;

  /**
   * @type {number}
   */
  maxHitPoints = 10;

  /**
   * Callback triggered when the object is moved
   * @param {GameObject} object
   * @param {THREE.Vector3} oldCoords 
   * @param {THREE.Vector3} newCoords 
   */
  onMove = (oldCoords, newCoords) => { };

  /**
   * Callback triggered when object hitpoints go to zero
   * @param {GameObject} object
   */
  onDestroy = (object) => { };

  /**
   * @param {THREE.Vector3} coords 
   * @param {THREE.BufferGeometry} geometry
   * @param {THREE.Material} material
   */
  constructor(coords, geometry, material) {
    super(geometry, material);
    this.coords = coords;

    this.healthDisplay = new THREE.Sprite();
    this.healthDisplay.layers.set(1);
    this.healthDisplay.center.set(0.2, 0.6);
    this.healthDisplay.position.y = 0.5;
    this.healthDisplay.visible = false;
    this.add(this.healthDisplay);

    this.updateHealthOverlay();
  }

  /**
   * Returns true if player's hit points are at zero
   */
  get isDead() {
    return (this.hitPoints <= 0);
  }

  /**
   * @param {number} damage 
   */
  hit(damage) {
    this.hitPoints -= damage;
    this.updateHealthOverlay();

    if (this.hitPoints <= 0 && this.onDestroy) {
      this.onDestroy(this);
    }
  }

  /**
   * Moves the player to the coordinates
   * @param {THREE.Vector3} coords 
   */
  moveTo(coords) {
    const oldCoords = this.coords;

    this.coords = coords;
    this.position.set(
      this.coords.x + 0.5,
      this.coords.y + 0.5,
      this.coords.z + 0.5
    )

    if (this.onMove) {
      this.onMove(this, oldCoords, this.coords);
    }
  }

  updateHealthOverlay() {
    if (this.healthDisplay.material) {
      this.healthDisplay.material.dispose();
    }
    this.healthDisplay.material = createTextMaterial(`${this.hitPoints}/${this.maxHitPoints}`);
  }
}