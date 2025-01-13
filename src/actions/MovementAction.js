import * as THREE from 'three';
import { Action } from './Action';
import { search } from '../pathfinding';
import { GameObject } from '../objects/GameObject';
import { updateStatus } from '../utils';

const breadcrumb = new THREE.Mesh(
  new THREE.SphereGeometry(0.1),
  new THREE.MeshBasicMaterial()
);

export class MovementAction extends Action {
  name = 'Move';

  path = [];
  pathIndex = 0;
  pathUpdater = null;

  /**
   * @type {GameObject}
   */
  constructor(source) {
    super(source);
  }

  async perform(world) {
    return new Promise((resolve) => {
      function updateSourcePosition() {
        // If we reached the end of the path, then stop
        // the movement update interval, clear the path
        // breadcrumbs, and resolve this action to unblock
        // the combat manager
        if (this.pathIndex === this.path.length) {
          clearInterval(this.pathUpdater);
          world.path.clear();
          resolve();

          // Otherwise, move source object to the next path node
        } else {
          const curr = this.path[this.pathIndex++];
          this.source.moveTo(curr);
        }
      }

      // Clear the existing path update interval
      clearInterval(this.pathUpdater);

      updateStatus('Moving...');

      // Add breadcrumbs to the world
      this.path.forEach((coords) => {
        const node = breadcrumb.clone();
        node.position.set(coords.x + 0.5, 0, coords.z + 0.5);
        world.path.add(node);
      });

      // Trigger interval function to update player's position
      this.pathIndex = 0;
      this.pathUpdater = setInterval(updateSourcePosition.bind(this), 300);
    });
  }

  async canPerform(world) {
    const selectedCoords = await this.source.getTargetSquare();

    // Find path from player's current position to the selected square
    this.path = search(
      this.source.coords,
      selectedCoords,
      world);

    if (this.path === null) {
      return {
        value: false,
        reason: 'Could not find path to target square.'
      };
    }

    if (this.path.length === 0) {
      return {
        value: false,
        reason: 'Pick square other than starting square'
      };
    }

    // Return true if a valid path was found
    return { value: true };
  }
}