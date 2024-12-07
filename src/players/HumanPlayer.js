import { Player } from './Player';
import RaycastingHelper from '../helpers/RaycastingHelper';
import { setStatus } from '../utils';

export class HumanPlayer extends Player {
  name = 'HumanPlayer';

  /**
   * Wait for the player to choose a target square
   * @param {World} world
   * @returns {Promise<Vector3 | null>}
   */
  async getTargetSquare(world) {
    setStatus('Select a target square');
    return RaycastingHelper.getSelectedCoords(world);
  }

  /**
   * Wait for the player to choose a target GameObject
   * @param {World} world
   * @returns {Promise<GameObject | null>}
   */
  async getTargetObject(world) {
    setStatus('Select a target object');
    return RaycastingHelper.getSelectedObject(world);
  }

  /**
   * Wait for the player to select an action to perform
   * @returns {Promise<Action | null>}
   */
  async requestAction() {
    const actionContainer = document.getElementById('actions');

    // Clear existing buttons
    actionContainer.innerHTML = '';

    return new Promise((resolve) => {
      this.getActions().forEach((action) => {
        const button = document.createElement('button');
        button.innerText = action.name;
        button.onclick = () => {
          resolve(action);
        };
        actionContainer.appendChild(button);
      });
    });
  }
}