import * as THREE from 'three';
import { GameLoop } from './loop.js';
import { updateHudCount } from './menu.js';
import { getRenderScale, onRenderScaleChange, getQualityProfile, getQualityTier } from './render-scale.js';

const SHADOW_TYPES = {
  basic: THREE.BasicShadowMap,
  pcf: THREE.PCFShadowMap,
  pcfsoft: THREE.PCFSoftShadowMap,
};
const TONE_MAPPINGS = {
  none: THREE.NoToneMapping,
  linear: THREE.LinearToneMapping,
  aces: THREE.ACESFilmicToneMapping,
};

const RAMP_INTERVAL = 3;
const RAMP_AMOUNT = 8;
const INITIAL_COUNT = 20;
const MAX_OBJECTS = 300;

export function startLitScene(canvas) {
  const profile = getQualityProfile();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: profile.antialias, alpha: false });
  renderer.setPixelRatio(getRenderScale());
  const unsubRenderScale = onRenderScaleChange((v) => renderer.setPixelRatio(v));
  renderer.setClearColor(0x08080e);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = SHADOW_TYPES[profile.shadowMapType];
  renderer.toneMapping = TONE_MAPPINGS[profile.toneMapping];
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  if (profile.fog) scene.fog = new THREE.Fog(0x08080e, 15, 50);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 8, 18);
  camera.lookAt(0, 0, 0);

  const groundGeo = new THREE.PlaneGeometry(60, 60);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.85,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const ambient = new THREE.AmbientLight(0x303050, 0.6);
  scene.add(ambient);

  const LIGHT_COLORS = [0x00d4ff, 0x7b68ee, 0xff6b9d, 0xfbbf24, 0x34d399];
  const lights = [];
  for (let i = 0; i < 5; i++) {
    const light = new THREE.PointLight(LIGHT_COLORS[i], 30, 25);
    const angle = (i / 5) * Math.PI * 2;
    light.position.set(Math.cos(angle) * 8, 3, Math.sin(angle) * 8);
    light.castShadow = true;
    light.shadow.mapSize.width = profile.shadowMapSize;
    light.shadow.mapSize.height = profile.shadowMapSize;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 25;
    scene.add(light);
    lights.push({ light, baseAngle: angle, radius: 8, speed: 0.3 + i * 0.1, yOffset: 2 + i * 0.5 });
  }

  const MESH_TYPES = [
    () => new THREE.SphereGeometry(0.5, 16, 16),
    () => new THREE.BoxGeometry(0.8, 0.8, 0.8),
    () => new THREE.TorusGeometry(0.4, 0.15, 12, 24),
    () => new THREE.CylinderGeometry(0.3, 0.3, 1, 12),
    () => new THREE.IcosahedronGeometry(0.5, 1),
  ];

  const objects = [];
  const loop = new GameLoop();
  let elapsed = 0;
  let targetCount = INITIAL_COUNT;

  function makeObject() {
    const geoFn = MESH_TYPES[Math.floor(Math.random() * MESH_TYPES.length)];
    const hue = Math.random();
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(hue, 0.6, 0.45),
      roughness: 0.2 + Math.random() * 0.5,
      metalness: 0.4 + Math.random() * 0.5,
    });
    const mesh = new THREE.Mesh(geoFn(), mat);
    const radius = 2 + Math.random() * 12;
    const angle = Math.random() * Math.PI * 2;
    mesh.position.set(
      Math.cos(angle) * radius,
      0.5 + Math.random() * 4,
      Math.sin(angle) * radius,
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.rotSpeed = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
    );
    mesh.userData.floatSpeed = 0.5 + Math.random() * 1.5;
    mesh.userData.floatOffset = Math.random() * Math.PI * 2;
    mesh.userData.baseY = mesh.position.y;
    scene.add(mesh);
    objects.push(mesh);
  }

  for (let i = 0; i < INITIAL_COUNT; i++) makeObject();

  const profileOverlay = document.createElement('div');
  profileOverlay.style.cssText = 'position:fixed;bottom:8px;left:8px;background:rgba(0,0,0,0.75);color:#00d4ff;font:11px/1.45 ui-monospace,Menlo,Consolas,monospace;padding:8px 10px;border-radius:4px;z-index:9999;pointer-events:none;white-space:pre;letter-spacing:0.02em';
  profileOverlay.textContent = 'profiling…';
  document.body.appendChild(profileOverlay);

  const PROFILE_SMOOTH = 30;
  let updateAccum = 0;
  let renderAccum = 0;
  let profileSamples = 0;
  let smoothedUpdateMs = 0;
  let smoothedRenderMs = 0;
  let lastDrawCalls = 0;
  let lastTriangles = 0;
  let lastPrograms = 0;

  const ctrl = {
    shadowsOn: true,
    activeLights: lights.length,
  };

  function applyLighting() {
    for (let i = 0; i < lights.length; i++) {
      const active = i < ctrl.activeLights;
      lights[i].light.visible = active;
      lights[i].light.castShadow = active && ctrl.shadowsOn;
    }
  }

  const ctrlPanel = document.createElement('div');
  ctrlPanel.style.cssText = 'position:fixed;bottom:8px;right:8px;display:flex;flex-direction:column;gap:6px;z-index:9999;pointer-events:auto';

  function makeGroup(label, options, getValue, onPick) {
    const wrap = document.createElement('div');
    wrap.className = 'bench-fps-cap';
    const lbl = document.createElement('span');
    lbl.className = 'bench-fps-label';
    lbl.textContent = label;
    wrap.appendChild(lbl);
    const btns = [];
    for (const opt of options) {
      const b = document.createElement('button');
      b.className = 'bench-fps-btn';
      b.textContent = opt.label;
      if (opt.value === getValue()) b.classList.add('active');
      b.addEventListener('click', () => {
        onPick(opt.value);
        for (const sib of btns) sib.classList.remove('active');
        b.classList.add('active');
      });
      btns.push(b);
      wrap.appendChild(b);
    }
    return wrap;
  }

  ctrlPanel.appendChild(makeGroup('SHADOWS',
    [{ label: 'OFF', value: false }, { label: 'ON', value: true }],
    () => ctrl.shadowsOn,
    (v) => { ctrl.shadowsOn = v; applyLighting(); },
  ));

  ctrlPanel.appendChild(makeGroup('LIGHTS',
    [{ label: '1', value: 1 }, { label: '3', value: 3 }, { label: '5', value: 5 }],
    () => ctrl.activeLights,
    (v) => { ctrl.activeLights = v; applyLighting(); },
  ));

  document.body.appendChild(ctrlPanel);

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
    const t0 = performance.now();

    elapsed += dt;

    if (elapsed >= RAMP_INTERVAL && targetCount < MAX_OBJECTS) {
      elapsed = 0;
      targetCount = Math.min(targetCount + RAMP_AMOUNT, MAX_OBJECTS);
    }

    while (objects.length < targetCount) makeObject();

    const t = performance.now() * 0.001;

    for (const ld of lights) {
      const a = ld.baseAngle + t * ld.speed;
      ld.light.position.x = Math.cos(a) * ld.radius;
      ld.light.position.z = Math.sin(a) * ld.radius;
      ld.light.position.y = ld.yOffset + Math.sin(t * ld.speed * 2) * 1.5;
    }

    for (const obj of objects) {
      obj.rotation.x += obj.userData.rotSpeed.x * dt;
      obj.rotation.y += obj.userData.rotSpeed.y * dt;
      obj.rotation.z += obj.userData.rotSpeed.z * dt;
      obj.position.y = obj.userData.baseY + Math.sin(t * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.5;
    }

    camera.position.x = Math.sin(t * 0.1) * 18;
    camera.position.z = Math.cos(t * 0.1) * 18;
    camera.position.y = 6 + Math.sin(t * 0.15) * 2;
    camera.lookAt(0, 1, 0);

    updateHudCount(objects.length + lights.length);

    updateAccum += performance.now() - t0;
  }

  function render() {
    const t0 = performance.now();
    renderer.render(scene, camera);
    renderAccum += performance.now() - t0;

    profileSamples++;
    if (profileSamples >= PROFILE_SMOOTH) {
      smoothedUpdateMs = updateAccum / profileSamples;
      smoothedRenderMs = renderAccum / profileSamples;
      lastDrawCalls = renderer.info.render.calls;
      lastTriangles = renderer.info.render.triangles;
      lastPrograms = renderer.info.programs ? renderer.info.programs.length : 0;
      updateAccum = 0;
      renderAccum = 0;
      profileSamples = 0;

      const fps = loop.fps || 0;
      const frameMs = fps > 0 ? (1000 / fps).toFixed(1) : '—';
      profileOverlay.textContent =
        `fps        ${fps}\n` +
        `frame      ${frameMs} ms\n` +
        `update     ${smoothedUpdateMs.toFixed(2)} ms\n` +
        `render(js) ${smoothedRenderMs.toFixed(2)} ms\n` +
        `draws      ${lastDrawCalls}\n` +
        `tris       ${lastTriangles.toLocaleString()}\n` +
        `programs   ${lastPrograms}\n` +
        `objects    ${objects.length}\n` +
        `lights     ${lights.length}\n` +
        `tier       ${getQualityTier()} (aa=${profile.antialias?'y':'n'} sm=${profile.shadowMapSize} ${profile.shadowMapType})\n` +
        `dpr        ${renderer.getPixelRatio().toFixed(2)}\n` +
        `size       ${renderer.domElement.width}x${renderer.domElement.height}`;
    }
  }

  loop.start(update, render);

  return () => {
    loop.stop();
    window.removeEventListener('resize', resize);
    unsubRenderScale();
    profileOverlay.remove();
    ctrlPanel.remove();
    for (const m of objects) {
      m.geometry.dispose();
      m.material.dispose();
    }
    ground.geometry.dispose();
    ground.material.dispose();
    renderer.dispose();
  };
}
