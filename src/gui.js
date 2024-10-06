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

const createGUI = (gameConfig, updateGame) => {
  const gui = new GUI();
  
  // Set GUI to be on top and prevent click-through
  gui.domElement.style.zIndex = '1001';
  gui.domElement.style.position = 'absolute';
  gui.domElement.style.top = '0';
  gui.domElement.style.right = '0';

  // Add event listener to stop propagation of mouse events
  gui.domElement.addEventListener('mousedown', (event) => {
    event.stopPropagation();
  });

  const addFolder = (name, params, path = '') => {
    const folder = gui.addFolder(name);
    Object.entries(params).forEach(([key, value]) => {
      const newPath = path ? `${path}.${key}` : key;
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        addFolder(key, value, newPath);
      } else {
        folder.add(params, key).onChange((newValue) => {
          updateGame(newPath, newValue);
        });
      }
    });
  };

  // Lights and Sky controls
  const environmentFolder = gui.addFolder('Environment');
  
  // Sky and Sun controls
  const skyFolder = environmentFolder.addFolder('Sky & Sun');
  
  skyFolder.add(gameConfig.sky, 'turbidity', 0, 20).onChange(value => updateGame('sky.turbidity', value));
  skyFolder.add(gameConfig.sky, 'rayleigh', 0, 4).onChange(value => updateGame('sky.rayleigh', value));
  skyFolder.add(gameConfig.sky, 'mieCoefficient', 0, 0.1).onChange(value => updateGame('sky.mieCoefficient', value));
  skyFolder.add(gameConfig.sky, 'mieDirectionalG', 0, 1).onChange(value => updateGame('sky.mieDirectionalG', value));
  skyFolder.add(gameConfig.sky, 'elevation', 0, 90).onChange(value => updateGame('sky.elevation', value));
  skyFolder.add(gameConfig.sky, 'azimuth', 0, 360).onChange(value => updateGame('sky.azimuth', value));
  skyFolder.add(gameConfig.sky, 'exposure', 0, 1).onChange(value => updateGame('sky.exposure', value));

  // Sun light intensity
  skyFolder.add(gameConfig.lights.sun, 'intensity', 0, 10).onChange((value) => {
    updateGame('lights.sun.intensity', value);
  });

  // Ambient light
  const ambientFolder = environmentFolder.addFolder('Ambient Light');
  ambientFolder.add(gameConfig.lights.ambient, 'intensity', 0, 1).onChange((value) => {
    updateGame('lights.ambient.intensity', value);
  });

  // addFolder('World', gameConfig.world, 'world'); doesn't work properly because of the heightmap
  addFolder('NPCs', gameConfig.npcs, 'npcs');

  createPlayMusicButton();

  return gui;
};

export { createGUI };