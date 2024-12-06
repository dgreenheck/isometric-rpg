import * as THREE from 'three';

/**
 * @param {THREE.Vector3} coords 
 * @returns Returns the key for the object map given a set of coordinates
 */
export function getKey(coords) {
  return `${coords.x}-${coords.y}-${coords.z}`;
}

/**
 * Creates a text billboard that always faces the user
 * @param {string} text 
 */
export function createTextMaterial(text) {
  // Create a canvas to draw the text
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext('2d');

  // Stroke once with black to give the text an outline
  const fontSize = 200;

  context.lineWidth = 4;
  context.font = `${fontSize}px Arial`;
  context.strokeStyle = 'black';
  context.strokeText(text, 0, fontSize);

  // Fill with white
  context.font = `${fontSize}px Arial`;
  context.fillStyle = 'white';
  context.fillText(text, 0, fontSize);

  const textMaterial = new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(canvas)
  });

  return textMaterial;
}