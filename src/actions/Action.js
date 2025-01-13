import { GameObject } from '../objects/GameObject';
import { World } from '../world';

/**
 * Base action class
 */
export class Action {
  name = 'BaseAction';

  /**
   * @type {GameObject}
   */
  source = null;

  /**
   * 
   * @param {GameObject} source 
   */
  constructor(source) {
    this.source = source;
  }

  /**
   * Performs the action
   * @param {World} world 
   */
  async perform(world) {
    // Do nothing
  }

  /**
   * Returns true/false if the action can be performed
   * @param {World} world 
   * @returns {Promise<{ value: boolean, reason: string? >}
   */
  async canPerform(world) {
    return { value: true };
  }
}