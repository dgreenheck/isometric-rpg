import * as THREE from 'three';
import { createObject } from './object';

const createRock = (coords) => {
  const radius = 0.1 + (Math.random() * 0.2);
  const height = 0.5 + (Math.random() * 0.3);
  const rockGeometry = new THREE.SphereGeometry(radius, 6, 5);
  const rockMaterial = new THREE.MeshStandardMaterial({ color: 0xb0b0b0, flatShading: true });
  const position = new THREE.Vector3(coords.x + 0.5, 0, coords.y + 0.5);
  const rock = createObject(rockGeometry, rockMaterial, `Rock-(${coords.x},${coords.y})`, position);
  rock.scale.y = height;
  return rock;
};

export { createRock };