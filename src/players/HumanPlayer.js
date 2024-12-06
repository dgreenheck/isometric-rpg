import { Player } from './Player';
import RaycastingHelper from '../helpers/RaycastingHelper';

export class HumanPlayer extends Player {
  name = 'HumanPlayer';

  /**
   * Wait for the player to choose a target square
   * @param {World} world
   * @returns {Promise<Vector3 | null>}
   */
  async getTargetSquare(world) {
    return RaycastingHelper.getSelectedCoords(world);
  }

  /**
   * Wait for the player to choose a target GameObject
   * @param {World} world
   * @returns {Promise<GameObject | null>}
   */
  async getTargetObject(world) {
    return RaycastingHelper.getSelectedObject(world);
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