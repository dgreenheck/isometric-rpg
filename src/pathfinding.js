import * as THREE from 'three';
import { World } from './world';

/**
 * Finds the path between the start and end point (if one exists)
 * @param {THREE.Vector2} start 
 * @param {THREE.Vector2} end 
 * @param {World} world 
 * @return {THREE.Vector2[]} Returns array of coordinates that make up the path
 */
export function search(start, end, world) {
  const o = world.getObject(start);

  const neighbors = getNeighbors(start, world);
  console.log(neighbors);
}

/**
 * Returns array of coordinates for neighboring squares
 * @param {THREE.Vector2} coords 
 * @param {World} world
 */
function getNeighbors(coords, world) {
  const neighbors = [];

  // Left
  if (coords.x > 0) {
    neighbors.push(new THREE.Vector2(coords.x - 1, coords.y));
  }
  // Right
  if (coords.x < world.width - 1) {
    neighbors.push(new THREE.Vector2(coords.x + 1, coords.y));
  }
  // Top
  if (coords.y > 0) {
    neighbors.push(new THREE.Vector2(coords.x, coords.y - 1));
  }
  // Bottom
  if (coords.y < world.height - 1) {
    neighbors.push(new THREE.Vector2(coords.x, coords.y + 1));
  }

  return neighbors;
}