import * as THREE from 'three';
import { Player } from './players/Player';
import { setStatus } from './utils';

export class CombatManager {
  /**
   * @type {Player[]} Active players in combat
   */
  players = [];

  constructor() {

  }

  /**
   * Get player's initiative and add them to the
   * array of players
   * @param {Player} player 
   */
  addPlayer(player) {
    this.players.push(player);
  }

  /**
   * Main combat loop
   */
  async takeTurns(world) {
    while (true) {
      for (const player of this.players) {
        if (player.isDead) continue;

        player.material.color = new THREE.Color(0xffff00);

        setStatus(`${player.name} turn, select an action`);

        let actionPerformed = false;
        do {
          const action = await player.requestAction();
          const result = await action.canPerform(world)
          if (result.value) {
            // Wait for the player to finish performing their action
            await action.perform(world);
            actionPerformed = true;
          } else {
            setStatus(result.reason);
          }
        } while (!actionPerformed)

        player.material.color = new THREE.Color(0x0000ff);
      }
    }
  }
}