import * as THREE from 'three';
import { World } from './world';
import { updateStatus } from './utils';

export class CombatManager {
  /**
   * Main combat loop
   * @param {World} world 
   */
  async takeTurns(world) {
    while (true) {
      for (const player of world.players.children) {
        if (player.isDead) continue;

        let actionPerformed = false;

        player.mesh.material.color = new THREE.Color(0xffff00);

        updateStatus(`Waiting for ${player.name} to select an action`);

        do {
          const action = await player.requestAction();
          const result = await action.canPerform(world);
          if (result.value) {
            // Wait for the player to finish performing their action
            await action.perform(world);
            actionPerformed = true;
          } else {
            updateStatus(result.reason);
          }
        } while (!actionPerformed)

        player.mesh.material.color = new THREE.Color(0x0000ff);
      }
    }
  }
}