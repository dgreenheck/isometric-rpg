import * as THREE from 'three';
import { Player } from './Player';
import { MovementAction } from '../actions/MovementAction';

export class HumanPlayer extends Player {
  name = 'HumanPlayer';

  /**
   * @type {THREE.Raycaster}
   */
  raycaster = new THREE.Raycaster();

  /**
   * Wait for the player to choose a target square
   * @returns {Promise<Vector3 | null>}
   */
  async getTargetSquare() {
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
        const intersections = this.raycaster.intersectObject(this.world.terrain);

        if (intersections.length > 0) {
          const selectedCoords = new THREE.Vector3(
            Math.floor(intersections[0].point.x),
            0,
            Math.floor(intersections[0].point.z)
          );
          window.removeEventListener('mousedown', onSceneClick);
          console.log('Player selected coordinates', selectedCoords);
          resolve(selectedCoords);
        }
      };

      // Wait for player to select a square
      window.addEventListener('mousedown', onSceneClick);
      console.log('Waiting for player to select a target square');
    });
  }

  /**
   * Wait for the player to choose a target GameObject
   * @returns {Promise<GameObject | null>}
   */
  async getTargetObject() {
    return null;
  }

  /**
   * Wait for the player to select an action to perform
   * @returns {Promise<Action | null>}
   */
  async requestAction() {
    const statusText = document.getElementById('status-text');
    const actionContainer = document.getElementById('actions');

    // Clear existing buttons
    actionContainer.innerHTML = '';

    statusText.innerText = "Please select an action...";

    return new Promise((resolve) => {
      this.getActions().forEach((action) => {
        const button = document.createElement('button');
        button.innerText = action.name;
        button.onclick = () => {
          statusText.innerText = "";
          resolve(action);
        };
        actionContainer.appendChild(button);
      });
    });
  }
}