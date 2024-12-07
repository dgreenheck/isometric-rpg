import * as THREE from 'three';
import { World } from '../world';

class RaycastingHelper {
  /**
   * @type {THREE.Raycaster}
   */
  raycaster = new THREE.Raycaster();

  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.raycaster.layers.disable(1);
  }

  initialize(camera) {
    this.camera = camera;
  }

  /**
   * Wait for the player to choose a target square
   * @param {World} world
   * @returns {Promise<Vector3 | null>}
   */
  async getSelectedCoords(world) {
    return new Promise((resolve) => {
      /**
       * Event handler when user clicks on the screen
       * @param {MouseEvent} event 
       */
      const onSceneClick = (event) => {
        const coords = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          - (event.clientY / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(coords, this.camera);
        const intersections = this.raycaster.intersectObject(world.terrain);

        if (intersections.length > 0) {
          const selectedCoords = new THREE.Vector3(
            Math.floor(intersections[0].point.x),
            0,
            Math.floor(intersections[0].point.z)
          );
          window.removeEventListener('mousedown', onSceneClick);
          resolve(selectedCoords);
        }
      };

      // Wait for player to select a square
      window.addEventListener('mousedown', onSceneClick);
    });
  }

  /**
   * Wait for the player to choose a target GameObject
   * @param {World} world
   * @returns {Promise<GameObject | null>}
   */
  async getSelectedObject(world) {
    return new Promise((resolve) => {
      /**
       * Event handler when user clicks on the screen
       * @param {MouseEvent} event 
       */
      const onSceneClick = (event) => {
        const coords = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          - (event.clientY / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(coords, this.camera);
        const intersections = this.raycaster.intersectObject(world.objects, true);

        if (intersections.length > 0) {
          window.removeEventListener('mousedown', onSceneClick);
          resolve(intersections[0].object);
        }
      };

      // Wait for player to select a square
      window.addEventListener('mousedown', onSceneClick);
    });
  }
}

const instance = new RaycastingHelper();
export default instance;