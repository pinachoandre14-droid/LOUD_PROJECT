import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b1c1f);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(8, 6, 10);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.addEventListener('change', render);

scene.add(new THREE.HemisphereLight(0xbcc7ff, 0x2a2318, 1.2));
const sun = new THREE.DirectionalLight(0xffd9a0, 1.5);
sun.position.set(5, 10, 6);
scene.add(sun);

// Placeholder: three stacked slabs (stand-in for the three floors)
const mat = new THREE.MeshStandardMaterial({ color: 0x3a3c42, roughness: 0.7, metalness: 0.2 });
for (let i = 0; i < 3; i++) {
  const slab = new THREE.Mesh(new THREE.BoxGeometry(8, 3, 6), mat);
  slab.position.y = 1.6 + i * 3.5;
  scene.add(slab);
}

function render() {
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
});

// Render on demand (damping keeps the loop alive only while moving)
function tick() {
  if (controls.update()) render();
  requestAnimationFrame(tick);
}
render();
tick();
