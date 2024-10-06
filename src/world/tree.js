import * as THREE from 'three';
import { createObject } from './object';

const createTree = (coords) => {
  const treeGeometry = new THREE.ConeGeometry(0.2, 1, 8);
  const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x305010, flatShading: true });
  const position = new THREE.Vector3(coords.x + 0.5, 0.5, coords.y + 0.5);
  return createObject(treeGeometry, treeMaterial, `Tree-(${coords.x},${coords.y})`, position);
};

export { createTree };