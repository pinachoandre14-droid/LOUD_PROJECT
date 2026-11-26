import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { t, lang, setLang, zoneName, hotspotText } from './i18n.js';
import './style.css';

const BASE = import.meta.env.BASE_URL;
const FLOORS = ['F00', 'F01', 'F02', 'ROOF'];
const isMobile = matchMedia('(pointer: coarse)').matches || innerWidth < 800;
const $ = (s) => document.querySelector(s);

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
$('#app').appendChild(renderer.domElement);

const labels = new CSS2DRenderer();
labels.setSize(innerWidth, innerHeight);
labels.domElement.className = 'labels';
$('#app').appendChild(labels.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2233);           // blue hour
scene.fog = new THREE.Fog(0x1a2233, 70, 160);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 400);
// glTF space: x along the street, y up, z = -(Rhino y); the street facade faces +z.
// Home view: three-quarter street view, distance fitted so the ~34 m wide building fits any aspect ratio.
const HOME_DIR = new THREE.Vector3(0.32, 0.16, 1).normalize();
function homeView() {
  // on laptop the side panel covers the right ~quarter, so frame a wider strip and shift the target right
  const target = new THREE.Vector3(isMobile ? 13.5 : 18.5, 5.5, -7);
  const halfW = isMobile ? 17 : 23;
  const vfov = THREE.MathUtils.degToRad(camera.fov);
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
  const d = Math.max(halfW / Math.tan(hfov / 2), 9 / Math.tan(vfov / 2)) * 1.05;
  return { pos: target.clone().addScaledVector(HOME_DIR, d), target };
}
const HOME = homeView();
camera.position.copy(HOME.pos);

const controls = new OrbitControls(camera, labels.domElement);
controls.target.copy(HOME.target);
// on phones without bloom, push the emissive LEDs a bit so they still read as light lines
const EMISSIVE_BOOST = isMobile ? 1.6 : 1;
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 3;
controls.maxDistance = 120;
controls.addEventListener('change', requestRender);

scene.add(new THREE.HemisphereLight(0x8ea4d6, 0x2a2420, 0.9));
const moon = new THREE.DirectionalLight(0xa9b8ff, 0.6);
moon.position.set(-20, 40, 30);
scene.add(moon);

let composer = null;
if (!isMobile) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.55, 0.5, 0.9));
  composer.addPass(new OutputPass());
}

// ---------- state ----------
const state = { floor: 'ALL', explode: 0, zones: false, context: true, lights: true };
const groups = {};                 // floor -> THREE.Group
const zoneMeshes = [];             // { mesh, id, floor, label }
const hotspots = [];               // { id, floor, obj, base }
const pointLights = [];
let ctxGroup;

// ---------- load ----------
const loader = new GLTFLoader();
const [gltf, data] = await Promise.all([
  new Promise((res, rej) => loader.load(`${BASE}models/building.glb`, res, (e) => {
    if (e.total) $('#bar').style.width = `${Math.round((e.loaded / e.total) * 100)}%`;
  }, rej)),
  fetch(`${BASE}data/scene.json`).then((r) => r.json()),
]);

for (const f of FLOORS) { groups[f] = new THREE.Group(); groups[f].name = f; scene.add(groups[f]); }
ctxGroup = new THREE.Group(); scene.add(ctxGroup);

const meshes = [];
gltf.scene.traverse((o) => { if (o.isMesh) meshes.push(o); });
for (const m of meshes) {
  const [grp, sub] = (m.name || m.parent?.name || '').split('|');
  tuneMaterial(m, grp, sub);
  if (grp === 'CTX') { ctxGroup.add(m); continue; }
  if (grp === 'ZONES') {
    const floor = sub.slice(2, 5);
    groups[floor].add(m);
    m.visible = false;
    m.renderOrder = 2;
    const box = new THREE.Box3().setFromObject(m);
    const c = box.getCenter(new THREE.Vector3());
    const el = document.createElement('div');
    el.className = 'zone-label';
    const label = new CSS2DObject(el);
    label.position.set(c.x, box.max.y + 0.4, c.z);
    label.visible = false;
    groups[floor].add(label);
    zoneMeshes.push({ mesh: m, id: sub, floor, label, color: '#' + m.material.color.getHexString() });
    continue;
  }
  (groups[grp] || groups.F00).add(m);
}

// interior point lights from the model (scene.json)
for (const L of data.lights) {
  const p = new THREE.PointLight(L.color, L.intensity, L.distance, 2);
  p.position.fromArray(L.position);
  (groups[L.floor] || groups.F00).add(p);
  pointLights.push(p);
}

// hotspots
for (const h of data.hotspots) {
  const floor = h.floor === 'EXT' ? 'F00' : h.floor;
  const el = document.createElement('button');
  el.className = 'hotspot';
  el.addEventListener('click', (ev) => { ev.stopPropagation(); openHotspot(h); });
  const obj = new CSS2DObject(el);
  obj.position.fromArray(h.position);
  groups[floor].add(obj);
  hotspots.push({ ...h, floor, obj, el });
}

function tuneMaterial(m, grp, sub) {
  const mat = m.material;
  const n = mat.name || '';
  mat.envMapIntensity = 0.6;
  if (n === 'MAT_Glass') {
    m.material = new THREE.MeshStandardMaterial({
      name: n, color: 0x223540, metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.3,
      depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.4,
    });
    m.renderOrder = 1;
  } else if (n === 'MAT_LED_Warm') {
    mat.emissive.set(0xffa64d); mat.emissiveIntensity = 4 * EMISSIVE_BOOST;
  } else if (n === 'MAT_Sign_White') {
    // Only the facade sign glows; cyclorama, softboxes and room signs stay matte white.
    if (sub === 'Sign') { mat.emissive.set(0xdfe9ff); mat.emissiveIntensity = 3; }
    else { m.material = mat.clone(); m.material.emissiveIntensity = 0.12; }
  } else if (n === 'MAT_Yellow_Lobby') {
    mat.emissive.set(0xf2b31a); mat.emissiveIntensity = 0.6;
  } else if (n.startsWith('MAT_Z_')) {
    mat.transparent = true; mat.opacity = 0.6; mat.depthWrite = false; mat.side = THREE.DoubleSide;
    mat.emissiveIntensity = 0.8;
    mat.polygonOffset = true; mat.polygonOffsetFactor = -2;
  }
}

// ---------- apply state ----------
function apply() {
  const idx = state.floor === 'ALL' ? 99 : FLOORS.indexOf(state.floor);
  FLOORS.forEach((f, i) => {
    groups[f].visible = i <= idx && !(state.floor !== 'ALL' && f === 'ROOF');
    groups[f].position.y = i * state.explode;
  });
  for (const z of zoneMeshes) {
    const on = state.zones && groups[z.floor].visible;
    z.mesh.visible = on;
    z.label.visible = on;
    z.label.element.textContent = zoneName(z.id);
  }
  for (const h of hotspots) {
    h.obj.visible = groups[h.floor].visible && !state.zones;
    h.el.title = hotspotText(h.id).title;
  }
  ctxGroup.visible = state.context;
  for (const p of pointLights) p.visible = state.lights;
  renderLegend();
  requestRender();
}

// ---------- UI ----------
function buildUI() {
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
  $('#lang-es').classList.toggle('on', lang() === 'es');
  $('#lang-en').classList.toggle('on', lang() === 'en');
  const floorsEl = $('#floors');
  floorsEl.innerHTML = '';
  for (const f of ['ALL', 'F00', 'F01', 'F02']) {
    const b = document.createElement('button');
    b.textContent = f === 'ALL' ? t('all') : t(f);
    b.className = state.floor === f ? 'on' : '';
    b.onclick = () => { state.floor = f; buildUI(); apply(); };
    floorsEl.appendChild(b);
  }
  const list = $('#hs-list');
  list.innerHTML = '';
  for (const h of hotspots) {
    const b = document.createElement('button');
    b.textContent = hotspotText(h.id).title;
    b.onclick = () => openHotspot(h);
    list.appendChild(b);
  }
}

function renderLegend() {
  const lg = $('#legend');
  const vis = zoneMeshes.filter((z) => z.mesh.visible).sort((a, b) => a.id.localeCompare(b.id));
  lg.hidden = vis.length === 0;
  lg.innerHTML = `<h3>${t('legend')}</h3>` + vis.map((z) =>
    `<div><i style="background:${z.color}"></i>${zoneName(z.id)}</div>`).join('');
}

$('#lang-es').onclick = () => { setLang('es'); buildUI(); apply(); closeCard(); };
$('#lang-en').onclick = () => { setLang('en'); buildUI(); apply(); closeCard(); };
$('#explode').oninput = (e) => { state.explode = Number(e.target.value); apply(); };
$('#zones').onchange = (e) => { state.zones = e.target.checked; apply(); };
$('#context').onchange = (e) => { state.context = e.target.checked; apply(); };
$('#lights').onchange = (e) => { state.lights = e.target.checked; apply(); };
$('#reset').onclick = () => { state.floor = 'ALL'; buildUI(); apply(); const h = homeView(); flyTo(h.pos, h.target); closeCard(); };
$('#panel-toggle').onclick = () => $('#panel').classList.toggle('open');
$('#card-close').onclick = closeCard;

function openHotspot(h) {
  const { title, body } = hotspotText(h.id);
  $('#card-title').textContent = title;
  $('#card-body').textContent = body;
  $('#card').hidden = false;
  if (h.floor !== 'F00' || hotspotIsInterior(h)) {
    state.floor = h.id === 'HS_FacadeWall' || h.id === 'HS_Terrace' ? 'ALL' : h.floor;
  } else state.floor = 'ALL';
  buildUI(); apply();
  const target = new THREE.Vector3().fromArray(h.position);
  target.y += FLOORS.indexOf(h.floor) * state.explode;
  const exterior = ['HS_Entrance', 'HS_GoldScreen', 'HS_FacadeWall', 'HS_Terrace'].includes(h.id);
  const offset = exterior ? new THREE.Vector3(2, 2.5, 13) : new THREE.Vector3(6, 11, 10);
  flyTo(target.clone().add(offset), target);
  if (isMobile) $('#panel').classList.remove('open');
}
const hotspotIsInterior = (h) => !['HS_Entrance', 'HS_GoldScreen'].includes(h.id);
function closeCard() { $('#card').hidden = true; }

// ---------- camera tween ----------
let tween = null;
function flyTo(pos, target, ms = 1100) {
  tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos.clone(), t1: target.clone(), start: performance.now(), ms };
  requestRender();
}
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// ---------- render loop (on demand) ----------
let dirty = true;
function requestRender() { dirty = true; }
function frame(now) {
  requestAnimationFrame(frame);
  if (tween) {
    const k = Math.min(1, (now - tween.start) / tween.ms);
    camera.position.lerpVectors(tween.p0, tween.p1, ease(k));
    controls.target.lerpVectors(tween.t0, tween.t1, ease(k));
    if (k >= 1) tween = null;
    dirty = true;
  }
  if (controls.update()) dirty = true;
  if (!dirty) return;
  dirty = false;
  if (composer) composer.render(); else renderer.render(scene, camera);
  labels.render(scene, camera);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  labels.setSize(innerWidth, innerHeight);
  composer?.setSize(innerWidth, innerHeight);
  requestRender();
});

if (isMobile) $('#panel').classList.remove('open');
buildUI();
apply();
$('#loader').classList.add('done');
requestAnimationFrame(frame);
window.__loud = { scene, camera, controls, groups, state, apply, renderer };   // debugging hook
