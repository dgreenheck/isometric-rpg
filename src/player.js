import * as THREE from 'three';

export class Player extends THREE.Mesh {
  /**
   * @type {THREE.Raycaster}
   */
  raycaster = new THREE.Raycaster();

  constructor(camera, terrain) {
    super();
    this.geometry = new THREE.CapsuleGeometry(0.25, 0.5);
    this.material = new THREE.MeshStandardMaterial({ color: 0x4040c0 });
    this.position.set(5.5, 0.5, 5.5);

    this.camera = camera;
    this.terrain = terrain;
    window.addEventListener('mousedown', this.onMouseDown.bind(this));
  }

  /**
   * 
   * @param {MouseEvent} event 
   */
  onMouseDown(event) {
    console.log('onmousedown');

    const coords = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      - (event.clientY / window.innerHeight) * 2 + 1
    );

    this.raycaster.setFromCamera(coords, this.camera);
    const intersections = this.raycaster.intersectObjects([this.terrain]);

    if (intersections.length > 0) {
      this.position.set(
        Math.floor(intersections[0].point.x) + 0.5,
        0.5,
        Math.floor(intersections[0].point.z) + 0.5
      )
    }
  }
}