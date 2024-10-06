import * as THREE from 'three';
import { Vector3 } from 'three';
import { createCharacter } from './character';

const createPlayer = (camera, world) => {
  const initialPosition = new Vector3(1.5, 0.5, 5.5);
  const playerOptions = {
    geometry: new THREE.CapsuleGeometry(0.25, 0.5),
    material: new THREE.MeshStandardMaterial({ color: 0x4040c0 }),
    moveSpeed: 2,
    usePathfinding: true
  };

  const player = createCharacter(initialPosition, world, playerOptions);

  // Pre-create reusable objects
  const raycaster = new THREE.Raycaster();
  const mouseCoords = new THREE.Vector2();
  const targetPosition = new Vector3();

  // Memoize path node creation
  const pathNodeCache = new Map();
  const getPathNode = (coords) => {
    const key = `${coords.x},${coords.y}`;
    if (!pathNodeCache.has(key)) {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
      );
      node.position.set(coords.x + 0.5, 0.1, coords.y + 0.5);
      pathNodeCache.set(key, node);
    }
    return pathNodeCache.get(key);
  };

  const visualizePath = (path, world) => {
    world.path.clear();
    if (path && path.length > 0) {
      path.forEach((coords) => {
        world.path.add(getPathNode(coords));
      });
    }
  };

  const onMouseDown = (event) => {
    mouseCoords.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouseCoords, camera);
    const intersections = raycaster.intersectObject(world.terrain);

    if (intersections.length > 0) {
      targetPosition.set(intersections[0].point.x, 0.5, intersections[0].point.z);
      player.setTargetPosition(targetPosition);
      visualizePath(player.getPath(), world);
    }
  };

  window.addEventListener('mousedown', onMouseDown);

  const updateCamera = (position) => {
    camera.position.x = position.x;
    camera.position.z = position.z + 5;
    camera.lookAt(position);
  };

  return {
    ...player,
    update: (deltaTime) => {
      player.update(deltaTime);
      updateCamera(player.getPosition());
    },
    mesh: player.mesh,
    getPosition: () => player.getPosition()
  };
};

export { createPlayer };