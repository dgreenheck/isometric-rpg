import * as THREE from 'three';

const createObject = (geometry, material, name, position) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.copy(position);
  return mesh;
};

export { createObject };