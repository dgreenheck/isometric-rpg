import * as THREE from 'three';
import { GameObject } from './GameObject';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();

const rockMaterial = new THREE.MeshStandardMaterial({
  color: 0xb0b0b0,
  flatShading: true
});

export class Rock extends GameObject {
  /**
   * @param {THREE.Vector3} coords 
   */
  constructor(coords) {
    super(coords, new THREE.Mesh());

    this.name = `Rock-(${coords.x},${coords.z})`;

    const index = Math.floor(Math.random() * 3) + 1;
    console.log(index);
    loader.load(`models/rock${index}.glb`, (rockModel) => {
      const variation = new THREE.Vector3(0.5, 0.3, 0.5);
      this.mesh.geometry = rockModel.scene.children[0].geometry;
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
      this.mesh.material = rockMaterial;
    });
  }
}