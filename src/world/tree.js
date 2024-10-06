import * as THREE from 'three';
import { createObject } from './object';

const createTree = (coords) => {
  // Random tree characteristics (increased sizes)
  const trunkHeight = 1.5 + Math.random() * 1.5; // 1.5 to 3
  const trunkRadius = 0.15 + Math.random() * 0.15; // 0.15 to 0.3
  const foliageColor = new THREE.Color().setHSL(0.25 + Math.random() * 0.1, 0.7, 0.2 + Math.random() * 0.1);
  const numLayers = 3 + Math.floor(Math.random() * 3); // 3 to 5 layers

  // Create a dummy geometry and material for the main object
  const dummyGeometry = new THREE.BoxGeometry(1, 1, 1);
  const dummyMaterial = new THREE.MeshBasicMaterial({ visible: false });

  // Create the main tree object
  const position = new THREE.Vector3(0, 0, 0);
  const treeMesh = createObject(dummyGeometry, dummyMaterial, `Tree-(${coords.x},${coords.y})`, position);

  // Create tree trunk
  const trunkGeometry = new THREE.CylinderGeometry(trunkRadius * 0.7, trunkRadius, trunkHeight, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color().setHSL(0.05 + Math.random() * 0.05, 0.4, 0.15 + Math.random() * 0.1),
    roughness: 0.8,
    metalness: 0.2,
    flatShading: true 
  });
  const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunkMesh.position.y = trunkHeight / 2;
  treeMesh.add(trunkMesh);

  // Create tree foliage (increased sizes)
  const baseRadius = 1 + Math.random() * 0.5; // 1 to 1.5
  const baseHeight = 2 + Math.random() * 1; // 2 to 3

  for (let i = 0; i < numLayers; i++) {
    const layerScale = 1 - (i / numLayers);
    const foliageGeometry = new THREE.ConeGeometry(
      baseRadius * layerScale,
      baseHeight * layerScale,
      8 + Math.floor(Math.random() * 5)
    );
    const foliageMaterial = new THREE.MeshStandardMaterial({ 
      color: foliageColor,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true 
    });
    const foliageMesh = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliageMesh.position.y = trunkHeight + (baseHeight * i * 0.4);
    treeMesh.add(foliageMesh);
  }

  // Add some randomness to foliage position and rotation
  treeMesh.children.forEach(child => {
    if (child !== trunkMesh) {
      child.position.x += (Math.random() - 0.5) * 0.3;
      child.position.z += (Math.random() - 0.5) * 0.3;
      child.rotation.y = Math.random() * Math.PI * 2;
      child.rotation.x = (Math.random() - 0.5) * 0.2;
      child.rotation.z = (Math.random() - 0.5) * 0.2;
    }
  });

  // Random rotation for variety
  treeMesh.rotation.y = Math.random() * Math.PI * 2;

  return treeMesh;
};

export { createTree };