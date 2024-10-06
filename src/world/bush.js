import * as THREE from 'three';
import { createObject } from './object';

const createBush = (coords) => {
  const radius = 0.1 + (Math.random() * 0.2);
  const bushGeometry = new THREE.SphereGeometry(radius, 8, 8);
  const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x80a040, flatShading: true });
  const position = new THREE.Vector3(coords.x + 0.5, radius, coords.y + 0.5);
  return createObject(bushGeometry, bushMaterial, `Bush-(${coords.x},${coords.y})`, position);
};

export { createBush };