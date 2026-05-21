import * as THREE from 'three';
import { GameLoop } from './loop.js';
import { updateHudCount } from './menu.js';
import { getRenderScale, onRenderScaleChange, getQualityProfile } from './render-scale.js';

const TONE_MAPPINGS = {
  none: THREE.NoToneMapping,
  linear: THREE.LinearToneMapping,
  aces: THREE.ACESFilmicToneMapping,
};

const RAMP_INTERVAL = 2;
const RAMP_AMOUNT = 100;
const INITIAL_COUNT = 100;
const MAX_OBJECTS = 5000;

const GEOMETRIES = [
  () => new THREE.BoxGeometry(0.3, 0.3, 0.3),
  () => new THREE.IcosahedronGeometry(0.18, 0),
  () => new THREE.OctahedronGeometry(0.2, 0),
  () => new THREE.TetrahedronGeometry(0.22, 0),
];

const COLORS = [0x00d4ff, 0x7b68ee, 0xff6b9d, 0xc084fc, 0x34d399, 0xfbbf24];

export function startThreeDemo(canvas) {
  const profile = getQualityProfile();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: profile.antialias, alpha: false });
  renderer.setPixelRatio(getRenderScale());
  const unsubRenderScale = onRenderScaleChange((v) => renderer.setPixelRatio(v));
  renderer.setClearColor(0x0a0a0f);
  renderer.toneMapping = TONE_MAPPINGS[profile.toneMapping];

  const scene = new THREE.Scene();
  if (profile.fog) scene.fog = new THREE.FogExp2(0x0a0a0f, 0.04);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 5, 20);
  camera.lookAt(0, 0, 0);

  const meshes = [];
  const loop = new GameLoop();
  let elapsed = 0;
  let targetCount = INITIAL_COUNT;

  function makeMesh() {
    const geoFn = GEOMETRIES[Math.floor(Math.random() * GEOMETRIES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geoFn(), mat);
    mesh.position.set(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 40,
    );
    mesh.userData.vel = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
    );
    mesh.userData.rotSpeed = new THREE.Vector3(
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 3,
    );
    scene.add(mesh);
    meshes.push(mesh);
  }

  for (let i = 0; i < INITIAL_COUNT; i++) makeMesh();

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  resize();
  window.addEventListener('resize', resize);

  function update(dt) {
    elapsed += dt;

    if (elapsed >= RAMP_INTERVAL && targetCount < MAX_OBJECTS) {
      elapsed = 0;
      targetCount = Math.min(targetCount + RAMP_AMOUNT, MAX_OBJECTS);
    }

    while (meshes.length < targetCount) makeMesh();

    const BOUNDS = 25;
    for (const m of meshes) {
      m.position.addScaledVector(m.userData.vel, dt);
      m.rotation.x += m.userData.rotSpeed.x * dt;
      m.rotation.y += m.userData.rotSpeed.y * dt;
      m.rotation.z += m.userData.rotSpeed.z * dt;

      if (Math.abs(m.position.x) > BOUNDS) m.userData.vel.x *= -1;
      if (Math.abs(m.position.y) > BOUNDS) m.userData.vel.y *= -1;
      if (Math.abs(m.position.z) > BOUNDS) m.userData.vel.z *= -1;
    }

    const t = performance.now() * 0.001;
    camera.position.x = Math.sin(t * 0.15) * 22;
    camera.position.z = Math.cos(t * 0.15) * 22;
    camera.lookAt(0, 0, 0);

    updateHudCount(meshes.length);
  }

  function render() {
    renderer.render(scene, camera);
  }

  loop.start(update, render);

  return () => {
    loop.stop();
    window.removeEventListener('resize', resize);
    unsubRenderScale();
    for (const m of meshes) {
      m.geometry.dispose();
      m.material.dispose();
    }
    renderer.dispose();
  };
}
