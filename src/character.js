import * as THREE from 'three';
import { Vector2, Vector3 } from 'three';
import { search } from './pathfinding';

const createCharacter = (initialPosition, world, options = {}) => {
  const {
    geometry = new THREE.CapsuleGeometry(0.25, 0.5),
    material = new THREE.MeshStandardMaterial({ color: 0x4040c0 }),
    moveSpeed = 2,
    getTargetPosition = null,
    usePathfinding = false
  } = options;

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(initialPosition);

  let state = {
    currentPosition: new Vector3().copy(mesh.position),
    targetPosition: new Vector3().copy(mesh.position),
    finalTargetPosition: null,
    isMoving: false,
    moveSpeed,
    world,
    path: [],
    pathIndex: 0
  };

  const updatePosition = (currentState, newTargetPosition, newPath = []) => ({
    ...currentState,
    targetPosition: newTargetPosition,
    isMoving: true,
    path: newPath,
    pathIndex: 0
  });

  const findPath = (start, end) => {
    const startCoords = new THREE.Vector2(Math.floor(start.x), Math.floor(start.z));
    const endCoords = new THREE.Vector2(Math.floor(end.x), Math.floor(end.z));
    return search(startCoords, endCoords, world);
  };

  const setTargetPosition = (currentState, newTargetPosition) => {
    const newState = { ...currentState };

    // If the character is already moving, start pathfinding from the current target
    const start = newState.isMoving
      ? new Vector2(Math.floor(newState.targetPosition.x), Math.floor(newState.targetPosition.z))
      : new Vector2(Math.floor(newState.currentPosition.x), Math.floor(newState.currentPosition.z));

    const goal = new Vector2(Math.floor(newTargetPosition.x), Math.floor(newTargetPosition.z));
    const searchResult = search(start, goal, newState.world);

    // If a valid path is found, update the state with the new path
    if (searchResult && searchResult.length > 0) {
      newState.finalTargetPosition = newTargetPosition;
      newState.path = searchResult;
      newState.pathIndex = 0;
      newState.isMoving = true;
      newState.targetPosition = new Vector3(newState.path[0].x + 0.5, 0.5, newState.path[0].y + 0.5);
    } else {
      // If no valid path is found, continue with the current path if moving
      if (newState.isMoving) {
        // Keep the current path and target
        console.log("Invalid target selected. Continuing to previous destination.");
      } else {
        // If not moving, clear the path and stop
        newState.path = [];
        newState.isMoving = false;
        newState.targetPosition = new Vector3(newState.currentPosition.x, 0.5, newState.currentPosition.z);
      }
    }

    return newState;
  };

  const update = (deltaTime, currentState) => {
    const newState = { ...currentState };

    if (newState.isMoving) {
      const direction = new Vector3().subVectors(newState.targetPosition, newState.currentPosition).normalize();
      const step = direction.multiplyScalar(newState.moveSpeed * deltaTime);
      const newPosition = new Vector3().addVectors(newState.currentPosition, step);

      // Check if we've reached or overshot the target
      if (newPosition.distanceTo(newState.targetPosition) <= step.length()) {
        // Snap to the center of the current tile
        newState.currentPosition.set(
          Math.floor(newState.targetPosition.x) + 0.5,
          0.5,
          Math.floor(newState.targetPosition.z) + 0.5
        );
        mesh.position.copy(newState.currentPosition);

        if (newState.pathIndex < newState.path.length - 1) {
          // Move to the next tile in the path
          newState.pathIndex++;
          newState.targetPosition.set(
            newState.path[newState.pathIndex].x + 0.5,
            0.5,
            newState.path[newState.pathIndex].y + 0.5
          );
        } else {
          // If we've reached the end of the path, ensure we're at the center of the tile
          newState.isMoving = false;
          newState.currentPosition.set(
            Math.floor(newState.currentPosition.x) + 0.5,
            0.5,
            Math.floor(newState.currentPosition.z) + 0.5
          );
          mesh.position.copy(newState.currentPosition);
        }
      } else {
        newState.currentPosition.copy(newPosition);
        mesh.position.copy(newPosition);
      }
    }

    return newState;
  };

  return {
    mesh,
    update: (deltaTime) => {
      state = update(deltaTime, state);
    },
    getPosition: () => mesh.position.clone(),
    setTargetPosition: (newTargetPosition) => {
      state = setTargetPosition(state, newTargetPosition);
    },
    isMoving: () => state.isMoving,
    getPath: () => state.path  // Add this line
  };
};

export { createCharacter };