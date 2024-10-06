import * as THREE from 'three';

const createNode = (position, g = 0, h = 0, parent = null) => ({
  position,
  g,
  h,
  f: g + h,
  parent
});

const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

const vector2Equals = (a, b) => a.x === b.x && a.y === b.y;

const getNeighbors = (node, world) => {
  const directions = [
    { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 },
    { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 }
  ];
  return directions
    .map(dir => new THREE.Vector2(node.position.x + dir.x, node.position.y + dir.y))
    .filter(pos => 
      pos.x >= 0 && pos.x < world.width && 
      pos.y >= 0 && pos.y < world.height &&
      !world.getObject(pos) // Check if there's no object at this position
    );
};

const reconstructPath = (node) => 
  node.parent ? [node.position, ...reconstructPath(node.parent)] : [node.position];

// Binary Heap implementation
class BinaryHeap {
  constructor(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  push(element) {
    this.content.push(element);
    this.bubbleUp(this.content.length - 1);
  }

  pop() {
    const result = this.content[0];
    const end = this.content.pop();
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  }

  updateItem(item) {
    const index = this.content.indexOf(item);
    this.bubbleUp(index);
  }

  isEmpty() {
    return this.content.length === 0;
  }

  bubbleUp(n) {
    const element = this.content[n];
    const score = this.scoreFunction(element);
    while (n > 0) {
      const parentN = ((n + 1) >> 1) - 1;
      const parent = this.content[parentN];
      if (score >= this.scoreFunction(parent)) {
        break;
      }
      this.content[parentN] = element;
      this.content[n] = parent;
      n = parentN;
    }
  }

  sinkDown(n) {
    const length = this.content.length;
    const element = this.content[n];
    const elemScore = this.scoreFunction(element);

    while (true) {
      const child2N = (n + 1) << 1;
      const child1N = child2N - 1;
      let swap = null;
      let child1Score;
      if (child1N < length) {
        const child1 = this.content[child1N];
        child1Score = this.scoreFunction(child1);
        if (child1Score < elemScore) {
          swap = child1N;
        }
      }
      if (child2N < length) {
        const child2 = this.content[child2N];
        const child2Score = this.scoreFunction(child2);
        if (child2Score < (swap === null ? elemScore : child1Score)) {
          swap = child2N;
        }
      }
      if (swap === null) break;
      this.content[n] = this.content[swap];
      this.content[swap] = element;
      n = swap;
    }
  }
}

export const search = (start, goal, world) => {
  const startNode = createNode(start, 0, heuristic(start, goal));
  const openSet = new BinaryHeap(node => node.f);
  openSet.push(startNode);
  const closedSet = new Set();
  const openLookup = new Map();
  openLookup.set(start.x + ',' + start.y, startNode);

  let iterations = 0;
  const maxIterations = 10000; // Safeguard against infinite loops

  while (!openSet.isEmpty() && iterations < maxIterations) {
    iterations++;
    let current = openSet.pop();
    openLookup.delete(current.position.x + ',' + current.position.y);

    if (vector2Equals(current.position, goal)) {
      return reconstructPath(current).reverse();
    }

    closedSet.add(current.position.x + ',' + current.position.y);

    const neighbors = getNeighbors(current, world);

    for (const neighborPos of neighbors) {
      const neighborKey = neighborPos.x + ',' + neighborPos.y;
      if (closedSet.has(neighborKey)) {
        continue;
      }

      const gScore = current.g + 1;
      const hScore = heuristic(neighborPos, goal);
      
      const openNode = openLookup.get(neighborKey);

      if (!openNode) {
        const neighbor = createNode(neighborPos, gScore, hScore, current);
        openSet.push(neighbor);
        openLookup.set(neighborKey, neighbor);
      } else if (gScore < openNode.g) {
        openNode.g = gScore;
        openNode.f = gScore + openNode.h;
        openNode.parent = current;
        openSet.updateItem(openNode);
      }
    }
  }

  return null; // No path found
};