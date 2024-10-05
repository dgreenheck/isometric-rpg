import * as THREE from 'three';
import { search } from './pathfinding';
import { Vector3 } from 'three';

export class Player extends THREE.Mesh {
  /**
   * @type {THREE.Raycaster}
   */
  raycaster = new THREE.Raycaster();

  path = [];
  pathIndex = 0;
  pathUpdater = null;

  moveSpeed = 2; // Units per second
  currentPosition = new Vector3();
  targetPosition = new Vector3();
  isMoving = false;

  constructor(camera, world) {
    super();
    this.geometry = new THREE.CapsuleGeometry(0.25, 0.5);
    this.material = new THREE.MeshStandardMaterial({ color: 0x4040c0 });
    this.position.set(1.5, 0.5, 5.5);

    this.camera = camera;
    this.world = world;
    window.addEventListener('mousedown', this.onMouseDown.bind(this));

    this.currentPosition.copy(this.position);
    this.targetPosition.copy(this.position);
  }

  /**
   * 
   * @param {MouseEvent} event 
   */
  onMouseDown(event) {
    const coords = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      - (event.clientY / window.innerHeight) * 2 + 1
    );

    this.raycaster.setFromCamera(coords, this.camera);
    const intersections = this.raycaster.intersectObject(this.world.terrain);

    if (intersections.length > 0) {
      const playerCoords = new THREE.Vector2(
        Math.floor(this.position.x),
        Math.floor(this.position.z)
      );

      const selectedCoords = new THREE.Vector2(
        Math.floor(intersections[0].point.x),
        Math.floor(intersections[0].point.z)
      );

      this.world.path.clear();
      clearInterval(this.pathUpdater);

      // Find path from player's current position to the selected square
      this.path = search(playerCoords, selectedCoords, this.world);

      // If no path found, return early
      if (this.path === null || this.path.length === 0) return;

      // DEBUG: Show the path as breadcrumbs
      this.path.forEach((coords) => {
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(0.1),
          new THREE.MeshBasicMaterial()
        );
        node.position.set(coords.x + 0.5, 0, coords.y + 0.5);
        this.world.path.add(node);
      });

      // Trigger interval function to update player's position
      this.pathIndex = 0;
      this.updatePosition();
    }
  }

  updatePosition() {
    if (this.pathIndex >= this.path.length) {
      this.isMoving = false;
      return;
    }

    const nextTile = this.path[this.pathIndex];
    this.targetPosition.set(nextTile.x + 0.5, 0.5, nextTile.y + 0.5);
    this.currentPosition.copy(this.position);
    this.isMoving = true;
  }

  update(deltaTime) {
    if (this.isMoving) {
      const step = this.moveSpeed * deltaTime;
      const distanceToTarget = this.currentPosition.distanceTo(this.targetPosition);

      if (distanceToTarget > step) {
        this.currentPosition.lerp(this.targetPosition, step / distanceToTarget);
        this.position.copy(this.currentPosition);
      } else {
        this.position.copy(this.targetPosition);
        this.currentPosition.copy(this.targetPosition);
        this.isMoving = false;
        this.pathIndex++;
        this.updatePosition(); // Move to the next position in the path
      }
    }
  }
}