import * as THREE from 'three';

class Node {
  constructor(position, g = 0, h = 0) {
    this.position = position;
    this.g = g; // Cost from start to current node
    this.h = h; // Heuristic (estimated cost from current node to goal)
    this.f = g + h; // Total cost
    this.parent = null;
  }
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(node, world) {
  const neighbors = [];
  const directions = [
    { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 },
    { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 }
  ];

  for (const dir of directions) {
    const newPos = new THREE.Vector2(node.position.x + dir.x, node.position.y + dir.y);
    
    if (newPos.x >= 0 && newPos.x < world.width && newPos.y >= 0 && newPos.y < world.height) {
      if (!world.getObject(newPos)) {
        neighbors.push(newPos);
      }
    }
  }

  return neighbors;
}

export function search(start, goal, world) {
  const openSet = new Set();
  const closedSet = new Set();
  const startNode = new Node(start, 0, heuristic(start, goal));
  openSet.add(startNode);

  while (openSet.size > 0) {
    let current = null;
    for (const node of openSet) {
      if (!current || node.f < current.f) {
        current = node;
      }
    }

    if (current.position.equals(goal)) {
      const path = [];
      while (current) {
        path.unshift(current.position);
        current = current.parent;
      }
      return path;
    }

    openSet.delete(current);
    closedSet.add(current);

    for (const neighborPos of getNeighbors(current, world)) {
      if ([...closedSet].some(node => node.position.equals(neighborPos))) {
        continue;
      }

      const gScore = current.g + 1; // Assume cost of 1 to move to any neighbor
      const hScore = heuristic(neighborPos, goal);
      const neighbor = new Node(neighborPos, gScore, hScore);
      neighbor.parent = current;

      if ([...openSet].some(node => node.position.equals(neighborPos) && node.g <= gScore)) {
        continue;
      }

      openSet.add(neighbor);
    }
  }

  return null; // No path found
}