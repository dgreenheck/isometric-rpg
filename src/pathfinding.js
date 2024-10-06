import * as THREE from 'three';

// Pure function to create a node
const createNode = (position, g = 0, h = 0, parent = null) => ({
  position,
  g,
  h,
  f: g + h,
  parent
});

// Pure function for heuristic calculation
const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

// Helper function to compare Vector2 objects
const vector2Equals = (a, b) => a.x === b.x && a.y === b.y;

// Modify getNeighbors to return Vector2 objects directly
const getNeighbors = (node, world) => {
  const directions = [
    { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 },
    { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 }
  ];
  return directions
    .map(dir => new THREE.Vector2(node.position.x + dir.x, node.position.y + dir.y))
    .filter(pos => 
      pos.x >= 0 && pos.x < world.width && 
      pos.y >= 0 && pos.y < world.height
    );
};

// Helper function to reconstruct path
const reconstructPath = (node) => 
  node.parent ? [node.position, ...reconstructPath(node.parent)] : [node.position];

// Optimized search function without debugging logs
export const search = (start, goal, world) => {
  const startNode = createNode(start, 0, heuristic(start, goal));
  const openSet = [startNode];
  const closedSet = new Set();

  let iterations = 0;
  const maxIterations = 10000; // Safeguard against infinite loops

  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;
    let current = openSet.reduce((min, node) => node.f < min.f ? node : min);

    if (vector2Equals(current.position, goal)) {
      return reconstructPath(current).reverse();
    }

    openSet.splice(openSet.indexOf(current), 1);
    closedSet.add(current.position.x + ',' + current.position.y);

    const neighbors = getNeighbors(current, world);

    for (const neighborPos of neighbors) {
      const neighborKey = neighborPos.x + ',' + neighborPos.y;
      if (closedSet.has(neighborKey)) {
        continue;
      }

      const gScore = current.g + 1;
      const hScore = heuristic(neighborPos, goal);
      const neighbor = createNode(neighborPos, gScore, hScore, current);

      const openNode = openSet.find(node => vector2Equals(node.position, neighborPos));

      if (!openNode) {
        openSet.push(neighbor);
      } else if (gScore < openNode.g) {
        openNode.g = gScore;
        openNode.f = gScore + openNode.h;
        openNode.parent = current;
      }
    }
  }

  return null; // No path found
};