import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';

export class Clouds {
  constructor(scene, worldSize) {
    this.scene = scene;
    this.worldSize = worldSize;
    this.clouds = new THREE.Group();
    this.noise = new ImprovedNoise();
    this.windSpeed = new THREE.Vector2(0.5, 0.3);
    this.turbulence = new THREE.Vector3(0.01, 0.005, 0.008);
    this.cloudTexture = this.createCloudTexture();
    this.createClouds();
    this.scene.add(this.clouds);
  }

  createCloudTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    
    return new THREE.CanvasTexture(canvas);
  }

  createClouds() {
    const cloudCount = 30;
    for (let i = 0; i < cloudCount; i++) {
      this.createCloudGroup();
    }
  }

  createCloudGroup() {
    const cloudGroup = new THREE.Group();
    const particleCount = Math.floor(Math.random() * 10) + 15;
    
    // Remove grayscale variation and use pure white
    const cloudColor = new THREE.Color(0xffffff);
    
    for (let i = 0; i < particleCount; i++) {
      const cloudParticle = this.createCloudParticle(cloudColor);
      const radius = Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      cloudParticle.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta) * 0.4,
        radius * Math.cos(phi)
      );
      cloudParticle.rotation.z = Math.random() * Math.PI * 2;
      cloudParticle.scale.setScalar(Math.random() * 0.5 + 0.5);
      cloudGroup.add(cloudParticle);
    }

    cloudGroup.position.set(
      Math.random() * this.worldSize.width - this.worldSize.width / 2,
      Math.random() * 30 + 40,
      Math.random() * this.worldSize.height - this.worldSize.height / 2
    );
    
    const groupScale = Math.random() * 3 + 2;
    cloudGroup.scale.set(groupScale, groupScale * 0.5, groupScale);

    cloudGroup.userData = {
      initialPosition: cloudGroup.position.clone(),
      offset: Math.random() * 1000,
    };

    this.clouds.add(cloudGroup);
  }

  createCloudParticle(color) {
    const cloudGeometry = new THREE.PlaneGeometry(10, 10);
    
    const cloudMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: color },
        time: { value: 0 },
        opacity: { value: 0.3 },
        cloudTexture: { value: this.cloudTexture },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        uniform float time;
        
        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          
          // Add subtle vertex animation
          float noise = sin(worldPosition.x * 0.1 + time * 0.001) * 
                        cos(worldPosition.y * 0.1 + time * 0.002) * 
                        sin(worldPosition.z * 0.1 + time * 0.003);
          vec3 newPosition = position + normal * noise * 0.1;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float opacity;
        uniform sampler2D cloudTexture;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        void main() {
          vec4 texColor = texture2D(cloudTexture, vUv);
          
          // Add rim lighting effect
          float rimLight = 1.0 - max(0.0, dot(vec3(0, 0, 1), normalize(cameraPosition - vWorldPosition)));
          rimLight = smoothstep(0.6, 1.0, rimLight);
          
          vec3 finalColor = color + vec3(1, 1, 1) * rimLight * 0.3;
          
          // Add subtle gradient
          float gradient = smoothstep(-5.0, 5.0, vWorldPosition.y);
          finalColor = mix(finalColor, finalColor * 1.2, gradient);
          
          gl_FragColor = vec4(finalColor, texColor.a * opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudMesh.rotation.x = -Math.PI / 2;
    
    return cloudMesh;
  }

  update(deltaTime) {
    const time = performance.now() * 0.001; // Convert to seconds
    this.clouds.children.forEach((cloudGroup) => {
      // Apply wind movement
      cloudGroup.position.x += this.windSpeed.x * deltaTime * 0.01;
      cloudGroup.position.z += this.windSpeed.y * deltaTime * 0.01;

      // Wrap around when out of bounds
      if (cloudGroup.position.x > this.worldSize.width / 2) {
        cloudGroup.position.x = -this.worldSize.width / 2;
      }
      if (cloudGroup.position.z > this.worldSize.height / 2) {
        cloudGroup.position.z = -this.worldSize.height / 2;
      }

      // Apply turbulence
      const turbulenceX = Math.sin(time * this.turbulence.x + cloudGroup.userData.offset) * 2;
      const turbulenceY = Math.cos(time * this.turbulence.y + cloudGroup.userData.offset) * 1;
      const turbulenceZ = Math.sin(time * this.turbulence.z + cloudGroup.userData.offset) * 2;

      cloudGroup.position.x = cloudGroup.userData.initialPosition.x + turbulenceX;
      cloudGroup.position.y = cloudGroup.userData.initialPosition.y + turbulenceY;
      cloudGroup.position.z = cloudGroup.userData.initialPosition.z + turbulenceZ;

      // Gentle rotation
      cloudGroup.rotation.y = Math.sin(time * 0.1 + cloudGroup.userData.offset) * 0.1;

      cloudGroup.children.forEach((particle) => {
        // Subtle particle rotation
        particle.rotation.z += 0.0001 * deltaTime;
        
        // Update time uniform for shader animation
        particle.material.uniforms.time.value = time;
      });
    });
  }
}