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

  const getTerrainHeight = (x, z) => {
    const gridX = Math.floor(x);
    const gridZ = Math.floor(z);
    return world.heightMap && world.heightMap[gridZ] ? world.heightMap[gridZ][gridX] || 0 : 0;
  };

  const setTargetPosition = (currentState, newTargetPosition) => {
    const newState = { ...currentState };

    // Determine the starting point for pathfinding
    const start = currentState.isMoving
      ? new Vector2(Math.floor(currentState.targetPosition.x), Math.floor(currentState.targetPosition.z))
      : new Vector2(Math.floor(currentState.currentPosition.x), Math.floor(currentState.currentPosition.z));

    const goal = new Vector2(Math.floor(newTargetPosition.x), Math.floor(newTargetPosition.z));
    const searchResult = search(start, goal, newState.world);

    if (searchResult && searchResult.length > 0) {
      newState.finalTargetPosition = newTargetPosition;
      newState.path = searchResult;
      newState.pathIndex = 0;
      newState.isMoving = true;
      const nextPoint = newState.path[0];
      newState.targetPosition = new Vector3(
        nextPoint.x + 0.5,
        getTerrainHeight(nextPoint.x + 0.5, nextPoint.y + 0.5) + 0.5,
        nextPoint.y + 0.5
      );
    } else {
      if (newState.isMoving) {
        console.log("Invalid target selected. Continuing to previous destination.");
        // Keep the current path and target
      } else {
        console.log("No valid path found.");
        newState.isMoving = false;
        newState.path = [];
        newState.targetPosition = new Vector3(newState.currentPosition.x, newState.currentPosition.y, newState.currentPosition.z);
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

      // Get the new terrain height at the new position
      const targetHeight = getTerrainHeight(newPosition.x, newPosition.z) + 0.5;
      const heightDifference = targetHeight - newPosition.y;
      const smoothingFactor = 5; // Adjust this value to control smoothness
      newPosition.y += heightDifference * Math.min(smoothingFactor * deltaTime, 1);

      // Check if we've reached or overshot the target
      if (newPosition.distanceTo(newState.targetPosition) <= step.length()) {
        newState.currentPosition.copy(newState.targetPosition);
        newState.currentPosition.y = getTerrainHeight(newState.targetPosition.x, newState.targetPosition.z) + 0.5;
        mesh.position.copy(newState.currentPosition);

        if (newState.pathIndex < newState.path.length - 1) {
          // Move to the next tile in the path
          newState.pathIndex++;
          const nextPoint = newState.path[newState.pathIndex];
          newState.targetPosition.set(
            nextPoint.x + 0.5,
            getTerrainHeight(nextPoint.x + 0.5, nextPoint.y + 0.5) + 0.5,
            nextPoint.y + 0.5
          );
        } else {
          // If we've reached the end of the path
          newState.isMoving = false;
          newState.path = [];
          newState.pathIndex = 0;
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
    getPath: () => state.path
  };
};

export { createCharacter };