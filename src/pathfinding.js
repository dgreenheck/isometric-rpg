import * as THREE from 'three';
import { World } from './world';

/**
 * 
 * @param {THREE.Vector2} start 
 * @param {THREE.Vector2} end 
 * @param {World} world 
 */
export function search(start, end, world) {
  const o = world.getObject(start);
  console.log(o);
}