import { Player } from './Player';
import { Action } from '../actions';
import inputManager from '../InputManager';

export class HumanPlayer extends Player {
  name = 'HumanPlayer';

  /**
   * Wait for the player to choose a target square
   * @returns {Promise<Vector3 | null>}
   */
  async getTargetSquare() {
    return inputManager.getTargetSquare();
  }

  /**
   * Wait for the player to choose a target GameObject
   * @returns {Promise<GameObject | null>}
   */
  async getTargetObject() {
    return inputManager.getTargetObject();
  }

  /**
   * Wait for the player to select an action to perform
   * @returns {Promise<Action | null>}
   */
  async requestAction() {
    const actionButtonContainer = document.getElementById('actions');
    actionButtonContainer.innerHTML = '';

    const actions = this.getActions();

    return new Promise((resolve) => {
      actions.forEach((action) => {
        const button = document.createElement('button');
        button.innerText = action.name;
        button.onclick = () => resolve(action);
        actionButtonContainer.appendChild(button);
      });
    });
  }
}