import * as THREE from 'three';
import { GameObject } from './GameObject';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();

const treeMaterial = new THREE.MeshStandardMaterial({
  color: 0x305010,
  flatShading: true
});

export class Tree extends GameObject {
  /**
   * @param {THREE.Vector3} coords 
   */
  constructor(coords) {
    super(coords, new THREE.Mesh());

    this.name = `Tree-(${coords.x},${coords.z})`;

    loader.load(`models/tree1.glb`, (treeModel) => {
      const variation = new THREE.Vector3(0, 0.2, 0);
      this.mesh.add(treeModel.scene.children[0]);
      this.mesh.scale.set(
        1.0 + 2.0 * variation.x * (Math.random() - 0.5),
        1.0 + 2.0 * variation.y * (Math.random() - 0.5),
        1.0 + 2.0 * variation.z * (Math.random() - 0.5)
      );
      this.mesh.rotation.set(
        0,
        Math.random() * 2 * Math.PI,
        0
      );
      this.mesh.position.set(0.5, 0, 0.5);
      this.mesh.material = treeMaterial;
    });
  }
}