import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MusicGenerator } from './sounds';

const createPlayMusicButton = () => {
  const button = document.createElement('button');
  button.textContent = 'Play Eurovision Hit';
  button.style.position = 'absolute';
  button.style.top = '10px';
  button.style.left = '10px';
  button.style.zIndex = '1000';
  
  let isAudioContextInitialized = false;
  let isPlaying = false;
  
  const handleClick = () => {
    if (!isAudioContextInitialized) {
      MusicGenerator.initAudioContext();
      isAudioContextInitialized = true;
    }
    
    if (!isPlaying) {
      const eurovisionHit = MusicGenerator.createEurovisionHit();
      MusicGenerator.playSequence(eurovisionHit);
      button.textContent = 'Stop Eurovision Hit';
      isPlaying = true;
      
      const songDuration = eurovisionHit.reduce((total, note) => total + note.duration, 0) * 1000;
      setTimeout(() => {
        button.textContent = 'Play Eurovision Hit';
        isPlaying = false;
      }, songDuration);
    } else {
      // If you implement a stop function in MusicGenerator, call it here
      // MusicGenerator.stop();
      button.textContent = 'Play Eurovision Hit';
      isPlaying = false;
    }
  };
  
  button.addEventListener('click', handleClick);
  document.body.appendChild(button);
};

const createGUI = (world, updateWorld) => {
  const gui = new GUI();
  const worldFolder = gui.addFolder('World');

  const worldParams = {
    width: world.width,
    height: world.height,
    seed: world.seed || 0,
    octaves: world.octaves || 4,
    persistence: world.persistence || 0.5,
    lacunarity: world.lacunarity || 2.0,
    exponentiation: world.exponentiation || 1,
    heightMultiplier: world.heightMultiplier || 1,
    waterThreshold: world.waterThreshold || 0
  };

  const addWorldControl = (property, min, max, step) => {
    worldFolder.add(worldParams, property, min, max, step)
      .name(property.charAt(0).toUpperCase() + property.slice(1))
      .onChange((value) => {
        if (world[property] !== undefined) {
          world[property] = value;
        }
        updateWorld();
      });
  };

  ['width', 'height', 'seed', 'octaves', 'persistence', 'lacunarity', 'exponentiation', 'heightMultiplier', 'waterThreshold']
    .forEach(prop => addWorldControl(prop, 0, prop === 'width' || prop === 'height' ? 20 : 10, 0.1));

  worldFolder.add({ generate: () => {
    Object.assign(world, worldParams);
    world.generate();
  }}, 'generate').name('Generate');

  createPlayMusicButton();

  return gui;
};

export { createGUI };