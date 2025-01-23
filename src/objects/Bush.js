import * as THREE from 'three';
import { GameObject } from './GameObject';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();

const bushMaterial = new THREE.MeshStandardMaterial({
  color: 0x80a040,
  flatShading: true
});

export class Bush extends GameObject {
  /**
   * @param {THREE.Vector3} coords 
   */
  constructor(coords) {
    super(coords, new THREE.Mesh());

    this.name = `Bush-(${coords.x},${coords.z})`;

    loader.load(`models/bush1.glb`, (bushModel) => {
      const variation = new THREE.Vector3(0, 0.1, 0);
      this.mesh.add(bushModel.scene.children[0]);
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
      this.mesh.material = bushMaterial;
    });
  }
}