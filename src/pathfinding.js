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

// Pure function to get neighbors
const getNeighbors = (node, world) => {
  const directions = [
    { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 },
    { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 }
  ];

  return directions
    .map(dir => new THREE.Vector2(node.position.x + dir.x, node.position.y + dir.y))
    .filter(newPos => 
      newPos.x >= 0 && newPos.x < world.width && 
      newPos.y >= 0 && newPos.y < world.height &&
      !world.getObject(newPos)
    );
};

// Helper function to reconstruct path
const reconstructPath = (node) => 
  node.parent ? [node.position, ...reconstructPath(node.parent)] : [node.position];

// Main search function
export const search = (start, goal, world) => {
  const startNode = createNode(start, 0, heuristic(start, goal));
  
  const searchStep = (openSet, closedSet) => {
    if (openSet.length === 0) return null;

    const current = openSet.reduce((min, node) => node.f < min.f ? node : min);

    if (current.position.equals(goal)) {
      return reconstructPath(current).reverse();
    }

    const newOpenSet = openSet.filter(node => node !== current);
    const newClosedSet = [...closedSet, current];

    const neighbors = getNeighbors(current, world)
      .filter(neighborPos => !newClosedSet.some(node => node.position.equals(neighborPos)))
      .map(neighborPos => {
        const gScore = current.g + 1;
        const hScore = heuristic(neighborPos, goal);
        return createNode(neighborPos, gScore, hScore, current);
      })
      .filter(neighbor => 
        !newOpenSet.some(node => node.position.equals(neighbor.position) && node.g <= neighbor.g)
      );

    return searchStep([...newOpenSet, ...neighbors], newClosedSet);
  };

  return searchStep([startNode], []);
};