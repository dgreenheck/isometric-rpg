/**
 * Action that allows player to skip turn
 */
export class WaitAction {
  name = 'Wait';

  async perform(world) {
    // Do nothing
  }

  async canPerform(world) {
    return { value: true };
  }
}