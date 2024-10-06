import * as THREE from 'three';

const createTerrain = (width, height, heightMap) => {
  const textureLoader = new THREE.TextureLoader();
  const gridTexture = textureLoader.load('textures/grid.png');

  gridTexture.repeat = new THREE.Vector2(width, height);
  gridTexture.wrapS = THREE.RepeatWrapping;
  gridTexture.wrapT = THREE.RepeatWrapping;
  gridTexture.colorSpace = THREE.SRGBColorSpace;

  const terrainMaterial = new THREE.MeshStandardMaterial({ map: gridTexture });

  const generateTerrainGeometry = (width, height, heightMap) => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const uvs = [];

    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        // First triangle
        vertices.push(x, heightMap[y][x], y);
        vertices.push(x, heightMap[y + 1][x], y + 1);
        vertices.push(x + 1, heightMap[y][x + 1], y);

        // Second triangle
        vertices.push(x + 1, heightMap[y][x + 1], y);
        vertices.push(x, heightMap[y + 1][x], y + 1);
        vertices.push(x + 1, heightMap[y + 1][x + 1], y + 1);

        // UVs for both triangles
        uvs.push(x / width, y / height);
        uvs.push(x / width, (y + 1) / height);
        uvs.push((x + 1) / width, y / height);

        uvs.push((x + 1) / width, y / height);
        uvs.push(x / width, (y + 1) / height);
        uvs.push((x + 1) / width, (y + 1) / height);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();

    return geometry;
  };

  const terrainGeometry = generateTerrainGeometry(width, height, heightMap);

  const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrain.name = 'Terrain';
  terrain.position.set(0, 0, 0);
  return terrain;
};

export { createTerrain };