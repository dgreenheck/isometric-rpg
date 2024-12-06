/**
 * Action that allows player to skip turn
 */
export class WaitAction {
  name = 'Wait';

  /**
   * Performs the action
   */
  async perform() {
    // Do nothing
  }

  /**
   * Returns true/false if the action can be performed
   * @returns {Promise<boolean>}
   */
  async canPerform() {
    return true;
  }
}