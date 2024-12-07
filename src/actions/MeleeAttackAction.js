import * as THREE from 'three';
import { Action } from './Action';
import { World } from '../world';
import { Player } from '../players/Player';
import { GameObject } from '../objects/GameObject';

export class MeleeAttackAction extends Action {
  name = 'Melee Attack';

  /**
   * @type {GameObject}
   */
  target;

  /**
   * 
   * @param {Player} source 
   */
  constructor(source) {
    super(source);
  }

  /**
   * Performs the action
   * @param {World} world 
   */
  async perform(world) {
    this.target.hit(Math.ceil(5 * Math.random()));
  }

  /**
   * Returns true if the action can be performed
   * @param {World} world 
   * @returns {boolean}
   */
  async canPerform(world) {
    this.target = await this.source.getTargetObject(world);

    if (this.target && this.target !== this.source) {
      console.log(this.target);
      // Selected object must be next to the source object
      const distance = this.target.coords.clone().sub(this.source.coords).length();
      console.log(distance);
      return distance <= 1;
    } else {
      return false;
    }
  }
}