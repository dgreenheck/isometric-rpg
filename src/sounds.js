import { Howl } from 'howler';

// Define the available waveforms
const WAVEFORMS = {
  SQUARE: 'square',
  SAWTOOTH: 'sawtooth',
  TRIANGLE: 'triangle',
  SINE: 'sine'
};

// Define the available effects
const EFFECTS = {
  NONE: 'none',
  VIBRATO: 'vibrato',
  TREMOLO: 'tremolo',
  ARPEGGIO: 'arpeggio',
  CHORUS: 'chorus',
  DISTORTION: 'distortion',
  DELAY: 'delay'
};

// Define the available instruments with more detailed configurations
const INSTRUMENTS = {
  LEAD: {
    name: 'lead',
    waveform: 'custom',
    harmonics: [1, 0.5, 0.3, 0.2], // Adds overtones for a richer sound
    detune: 5, // Slight detune for a fatter sound
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.2 },
    filter: { type: 'lowpass', frequency: 2000, Q: 1 },
    defaultEffect: EFFECTS.VIBRATO,
    defaultEffectParams: { frequency: 5, depth: 10 }
  },
  BASS: {
    name: 'bass',
    waveform: 'custom',
    harmonics: [1, 0.3, 0.1], // Fewer harmonics for a cleaner bass sound
    detune: 0,
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.4 },
    filter: { type: 'lowpass', frequency: 500, Q: 2 },
    defaultEffect: EFFECTS.NONE
  },
  PAD: {
    name: 'pad',
    waveform: 'custom',
    harmonics: [1, 0.7, 0.5, 0.3, 0.2], // More harmonics for a rich, atmospheric sound
    detune: 10, // More detune for a wider stereo image
    envelope: { attack: 0.5, decay: 1, sustain: 0.8, release: 1.5 },
    filter: { type: 'lowpass', frequency: 1000, Q: 0.5 },
    defaultEffect: EFFECTS.CHORUS,
    defaultEffectParams: { rate: 1.5, depth: 0.7, delay: 0.01 }
  },
  DRUM: {
    name: 'drum',
    waveform: 'custom',
    harmonics: [1, 0.8, 0.6, 0.4, 0.2], // Complex harmonics for a more realistic drum sound
    detune: 0,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
    filter: { type: 'bandpass', frequency: 200, Q: 5 },
    defaultEffect: EFFECTS.DISTORTION,
    defaultEffectParams: { amount: 0.2 }
  },
  PLUCK: {
    name: 'pluck',
    waveform: 'custom',
    harmonics: [1, 0.6, 0.3, 0.15], // Harmonics to simulate a plucked string
    detune: 3,
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.3, release: 0.2 },
    filter: { type: 'lowpass', frequency: 3000, Q: 5 },
    defaultEffect: EFFECTS.DELAY,
    defaultEffectParams: { time: 0.2, feedback: 0.3, mix: 0.2 }
  }
};

// Define musical scales
const SCALES = {
  C_MAJOR: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88],
  G_MAJOR: [392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 739.99],
};

// Define chord progressions
const CHORD_PROGRESSIONS = {
  I_V_vi_IV: [0, 4, 5, 3],
  ii_V_I: [1, 4, 0],
};

// Create an audio context
let audioContext;
let currentOscillators = [];
let currentGainNodes = [];

const initAudioContext = () => {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
};

// Function to create an oscillator
const createOscillator = (instrument, frequency) => {
  const oscillator = audioContext.createOscillator();
  
  if (instrument.waveform === 'custom') {
    oscillator.setPeriodicWave(createCustomWave(audioContext, instrument.harmonics));
  } else {
    oscillator.type = instrument.waveform;
  }
  
  if (Number.isFinite(frequency)) {
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.detune.setValueAtTime(instrument.detune, audioContext.currentTime);
  } else {
    console.warn(`Invalid frequency value: ${frequency}. Using default 440Hz.`);
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
  }
  
  // Apply filter
  const filter = audioContext.createBiquadFilter();
  filter.type = instrument.filter.type;
  filter.frequency.setValueAtTime(instrument.filter.frequency, audioContext.currentTime);
  filter.Q.setValueAtTime(instrument.filter.Q, audioContext.currentTime);
  
  oscillator.connect(filter);
  
  return { oscillator, filter };
};

// Function to create a gain node
const createGainNode = () => {
  return audioContext.createGain();
};

// Function to apply effects
const applyEffect = (audioNode, effect, params) => {
  const createVibrato = (frequency, depth) => {
    const vibrato = audioContext.createOscillator();
    vibrato.type = 'sine';
    vibrato.frequency.setValueAtTime(frequency, audioContext.currentTime);
    const vibratoGain = audioContext.createGain();
    vibratoGain.gain.setValueAtTime(depth, audioContext.currentTime);
    vibrato.connect(vibratoGain);
    return { vibrato, vibratoGain };
  };

  const createTremolo = (frequency, depth) => {
    const tremolo = audioContext.createOscillator();
    tremolo.type = 'sine';
    tremolo.frequency.setValueAtTime(frequency, audioContext.currentTime);
    const tremoloGain = audioContext.createGain();
    tremoloGain.gain.setValueAtTime(1 - depth / 2, audioContext.currentTime);
    tremolo.connect(tremoloGain.gain);
    return { tremolo, tremoloGain };
  };

  // New Chorus effect
  const createChorus = (rate, depth, delay) => {
    const chorus = audioContext.createDelay();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();

    lfo.frequency.value = rate;
    lfoGain.gain.value = depth;

    lfo.connect(lfoGain);
    lfoGain.connect(chorus.delayTime);
    
    chorus.delayTime.value = delay;
    
    lfo.start();
    
    return chorus;
  };

  // New Distortion effect
  const createDistortion = (amount) => {
    const distortion = audioContext.createWaveShaper();
    distortion.curve = makeDistortionCurve(amount);
    return distortion;
  };

  // New Delay effect
  const createDelay = (time, feedback, mix) => {
    const delay = audioContext.createDelay();
    const feedbackGain = audioContext.createGain();
    const dryGain = audioContext.createGain();
    const wetGain = audioContext.createGain();

    delay.delayTime.value = time;
    feedbackGain.gain.value = feedback;
    dryGain.gain.value = 1 - mix;
    wetGain.gain.value = mix;

    delay.connect(feedbackGain);
    feedbackGain.connect(delay);

    return { delay, dryGain, wetGain };
  };

  const effects = {
    [EFFECTS.VIBRATO]: () => {
      const { vibrato, vibratoGain } = createVibrato(
        params.frequency || 5,
        params.depth || 10
      );
      const vibratoNode = audioContext.createGain();
      audioNode.connect(vibratoNode);
      vibratoGain.connect(vibratoNode.gain);
      vibrato.start();
      return vibratoNode;
    },
    [EFFECTS.TREMOLO]: () => {
      const { tremolo, tremoloGain } = createTremolo(
        params.frequency || 5,
        params.depth || 0.5
      );
      audioNode.connect(tremoloGain);
      tremolo.start();
      return tremoloGain;
    },
    [EFFECTS.ARPEGGIO]: () => {
      // Implement arpeggio effect
      return audioNode;
    },
    [EFFECTS.CHORUS]: () => createChorus(params.rate, params.depth, params.delay),
    [EFFECTS.DISTORTION]: () => createDistortion(params.amount),
    [EFFECTS.DELAY]: () => {
      const { delay, dryGain, wetGain } = createDelay(params.time, params.feedback, params.mix);
      audioNode.connect(dryGain);
      audioNode.connect(delay);
      delay.connect(wetGain);
      return audioContext.createGain(); // Return a dummy node for consistency
    },
    [EFFECTS.NONE]: () => audioNode
  };

  const applySelectedEffect = effects[effect] || effects[EFFECTS.NONE];
  return applySelectedEffect();
};

// Helper function for distortion effect
const makeDistortionCurve = (amount) => {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;

  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }

  return curve;
};

// New function to create a custom periodic wave
const createCustomWave = (audioContext, harmonics) => {
  const real = new Float32Array(harmonics.length);
  const imag = new Float32Array(harmonics.length);
  harmonics.forEach((harmonic, i) => {
    real[i] = 0;
    imag[i] = harmonic;
  });
  return audioContext.createPeriodicWave(real, imag);
};

// Modified createNote function
const createNote = (pitch, duration, instrumentName, effect = EFFECTS.NONE, effectParams = {}) => ({
  pitch: Number.isFinite(pitch) ? pitch : 440,
  duration,
  instrumentName,
  effect,
  effectParams,
});

// Function to transpose a pitch by a number of semitones
const transposePitch = (pitch, semitones) =>
  pitch * Math.pow(2, semitones / 12);

// Modified createMelody function for smoother melodies
const createMelody = (scale, rhythm, baseOctave = 4, instrumentName = 'LEAD', effect = null) => {
  const baseFrequency = scale[0] * Math.pow(2, baseOctave - 4);
  const instrument = INSTRUMENTS[instrumentName];
  return rhythm.map(({ step, duration }) =>
    createNote(
      transposePitch(baseFrequency, step),
      duration,
      instrumentName,
      effect || instrument.defaultEffect,
      effect ? {} : instrument.defaultEffectParams
    )
  );
};

// Function to create a bassline based on a chord progression
const createBassline = (scale, progression, duration) =>
  progression.map((chordIndex) =>
    createNote(
      scale[chordIndex] / 2,
      duration,
      'BASS',
      EFFECTS.NONE
    )
  );

// Function to create pad chords based on a chord progression
const createPadChords = (scale, progression, duration) =>
  progression.map((chordIndex) => [
    createNote(scale[chordIndex], duration, 'PAD', EFFECTS.TREMOLO, { frequency: 2, depth: 0.3 }),
    createNote(scale[(chordIndex + 2) % 7], duration, 'PAD', EFFECTS.TREMOLO, { frequency: 2, depth: 0.3 }),
    createNote(scale[(chordIndex + 4) % 7], duration, 'PAD', EFFECTS.TREMOLO, { frequency: 2, depth: 0.3 }),
  ]);

// Function to create a drum pattern
const createDrumPattern = (pattern, duration) =>
  pattern.map(({ pitch, velocity }) =>
    createNote(pitch, duration, 'DRUM', EFFECTS.NONE)
  );

// Function to combine multiple musical elements
const combineParts = (...parts) =>
  parts.reduce((acc, part) => [...acc, ...part], []);

// Function to repeat a section
const repeatSection = (section, times) =>
  Array(times).fill().flatMap(() => section);

// Function to play a sequence of notes
const playSequence = (sequence) => {
  if (!audioContext) throw new Error('AudioContext not initialized');
  
  stop(); // Stop any currently playing sounds
  
  let startTime = audioContext.currentTime;
  
  const playNote = ({ instrumentName, pitch, duration, effect, effectParams }, noteStartTime) => {
    if (!Number.isFinite(pitch)) {
      console.warn(`Invalid pitch value: ${pitch}. Skipping this note.`);
      return;
    }

    const instrument = INSTRUMENTS[instrumentName];
    if (!instrument) {
      console.warn(`Invalid instrument: ${instrumentName}. Skipping this note.`);
      return;
    }

    const { oscillator, filter } = createOscillator(instrument, pitch);
    const gainNode = createGainNode();
    
    filter.connect(gainNode);
    const effectNode = applyEffect(gainNode, effect || instrument.defaultEffect, effectParams || instrument.defaultEffectParams);
    effectNode.connect(audioContext.destination);
    
    // Apply ADSR envelope
    const env = instrument.envelope;
    const now = noteStartTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + env.attack);
    gainNode.gain.linearRampToValueAtTime(env.sustain, now + env.attack + env.decay);
    gainNode.gain.setValueAtTime(env.sustain, now + duration - env.release);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);
    
    oscillator.start(noteStartTime);
    oscillator.stop(noteStartTime + duration);
    
    currentOscillators.push(oscillator);
    currentGainNodes.push(gainNode);
  };

  sequence.forEach((noteGroup, index) => {
    if (Array.isArray(noteGroup)) {
      // Play multiple notes simultaneously
      noteGroup.forEach(note => playNote(note, startTime));
      startTime += Math.max(...noteGroup.map(note => note.duration));
    } else {
      // Play a single note
      playNote(noteGroup, startTime);
      startTime += noteGroup.duration;
    }
  });
  
  return startTime - audioContext.currentTime; // Return total duration
};

// Function to stop all playing sounds
const stop = () => {
  currentOscillators.forEach(osc => {
    osc.stop();
    osc.disconnect();
  });
  currentGainNodes.forEach(gain => gain.disconnect());
  currentOscillators = [];
  currentGainNodes = [];
};

// Helper function to combine tracks vertically (play simultaneously)
const combineTracks = (...tracks) => {
  const maxLength = Math.max(...tracks.map(track => track.length));
  return Array(maxLength).fill().map((_, i) => 
    tracks.map(track => track[i]).filter(Boolean).flat()
  );
};

// New helper functions
const randomElement = (array) => array[Math.floor(Math.random() * array.length)];

const createArpeggio = (baseNote, intervals, duration) =>
  intervals.map((interval, index) => 
    createNote(
      transposePitch(baseNote, interval),
      duration,
      INSTRUMENTS.LEAD,
      EFFECTS.ARPEGGIO,
      { speed: 16, pattern: [0, 1, 2, 1] }
    )
  );

const createVariation = (melody, variationFn) =>
  melody.map(variationFn);

// Improved RPG song creation function
const createRPGSong = () => {
  const scale = SCALES.C_MAJOR; // Changed to C Major for a brighter sound
  const progression = [0, 3, 4, 0]; // I-IV-V-I progression

  const mainMelodyRhythm = [
    { step: 0, duration: 1 }, { step: 2, duration: 1 },
    { step: 4, duration: 1 }, { step: 2, duration: 1 },
  ];

  const secondaryMelodyRhythm = [
    { step: 7, duration: 0.5 }, { step: 5, duration: 0.5 },
    { step: 4, duration: 0.5 }, { step: 2, duration: 0.5 },
    { step: 0, duration: 1 }, { step: 4, duration: 1 },
  ];

  const drumPattern = [
    { pitch: 350, velocity: 0.8 }, { pitch: 250, velocity: 0.6 },
    { pitch: 350, velocity: 0.7 }, { pitch: 250, velocity: 0.6 },
  ];

  const mainMelody = createMelody(scale, mainMelodyRhythm, 5, 'LEAD', EFFECTS.VIBRATO);
  const secondaryMelody = createMelody(scale, secondaryMelodyRhythm, 4, 'PAD', EFFECTS.NONE);
  const bassline = createBassline(scale, progression, 2);
  const drums = repeatSection(createDrumPattern(drumPattern, 0.5), 2);
  const pads = createPadChords(scale, progression, 4);

  const verse = combineTracks(
    mainMelody,
    bassline,
    drums
  );

  const chorus = combineTracks(
    mainMelody,
    secondaryMelody,
    bassline,
    drums,
    pads
  );

  const bridge = combineTracks(
    createMelody(scale, secondaryMelodyRhythm, 5, 'LEAD', EFFECTS.TREMOLO),
    pads,
    createBassline(scale, progression.reverse(), 2)
  );

  const outro = combineTracks(
    createMelody(scale, mainMelodyRhythm, 6, 'LEAD', EFFECTS.NONE),
    pads,
    createBassline(scale, progression, 4)
  );

  return [
    ...repeatSection(verse, 2),
    ...chorus,
    ...verse,
    ...chorus,
    ...bridge,
    ...chorus,
    ...outro,
  ];
};

// New helper functions
const keyChange = (melody, semitones) =>
  melody.map(note => ({
    ...note,
    pitch: transposePitch(note.pitch, semitones)
  }));

const createDramaticBuild = (scale, duration) =>
  scale.map((pitch, index) =>
    createNote(pitch * 2, duration / (index + 1), 'PAD', EFFECTS.TREMOLO, { frequency: 4, depth: 0.5 })
  );

// Improved Eurovision-style song creation function
const createEurovisionHit = () => {
  const scale = SCALES.C_MAJOR;
  const progression = [0, 5, 3, 4]; // I-VI-IV-V progression

  const verseRhythm = [
    { step: 0, duration: 0.5 }, { step: 2, duration: 0.5 },
    { step: 4, duration: 0.5 }, { step: 2, duration: 0.5 },
    { step: 0, duration: 1 }, { step: 4, duration: 1 },
  ];

  const chorusRhythm = [
    { step: 0, duration: 0.5 }, { step: 2, duration: 0.5 },
    { step: 4, duration: 0.5 }, { step: 7, duration: 0.5 },
    { step: 9, duration: 1 }, { step: 7, duration: 1 },
  ];

  const drumPattern = [
    { pitch: 350, velocity: 1 }, { pitch: 250, velocity: 0.6 },
    { pitch: 350, velocity: 0.8 }, { pitch: 250, velocity: 0.6 },
  ];

  const verseMelody = createMelody(scale, verseRhythm, 4, 'LEAD', EFFECTS.NONE);
  const chorusMelody = createMelody(scale, chorusRhythm, 5, 'LEAD', EFFECTS.VIBRATO);
  const bassline = createBassline(scale, progression, 1);
  const drums = repeatSection(createDrumPattern(drumPattern, 0.25), 4);
  const pads = createPadChords(scale, progression, 2);

  const dramaticBuild = createDramaticBuild(scale, 0.25);

  const verse = combineTracks(
    verseMelody,
    bassline,
    drums
  );

  const preChorus = combineTracks(
    createMelody(scale, verseRhythm, 5, 'PAD', EFFECTS.TREMOLO),
    bassline,
    drums,
    dramaticBuild
  );

  const chorus = combineTracks(
    chorusMelody,
    bassline,
    drums,
    pads
  );

  const bridge = combineTracks(
    createMelody(scale, chorusRhythm, 3, 'BASS', EFFECTS.NONE),
    pads,
    createDrumPattern([{ pitch: 350, velocity: 0.5 }], 1)
  );

  const finalChorus = combineTracks(
    keyChange(chorusMelody, 2), // Key change for dramatic effect
    keyChange(bassline, 2),
    drums,
    keyChange(pads, 2)
  );

  return [
    ...verse,
    ...preChorus,
    ...chorus,
    ...verse,
    ...preChorus,
    ...chorus,
    ...bridge,
    ...dramaticBuild,
    ...finalChorus,
    ...finalChorus,
  ];
};

// Modify the export to include the new Eurovision hit generator
export const MusicGenerator = {
  WAVEFORMS,
  EFFECTS,
  INSTRUMENTS,
  SCALES,
  CHORD_PROGRESSIONS,
  initAudioContext,
  createNote,
  playSequence,
  createRPGSong,
  createEurovisionHit,
  stop
};