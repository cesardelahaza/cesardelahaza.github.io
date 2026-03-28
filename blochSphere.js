import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { multiply, matrix } from 'https://esm.sh/mathjs';


const container = document.getElementById("bloch");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(2.2, 1.4, 2.8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Sphere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1.2, 48, 48),
  new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.08 })
);
scene.add(sphere);

// Axes
function makeAxis(dir, len, color) {
  const pts = [new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(len)];
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 }));
}

const xAxis = makeAxis(new THREE.Vector3(1, 0, 0), 1.5, 0xff6060);
xAxis.material.depthTest = false;
xAxis.material.renderOrder = 1;

const yAxis = makeAxis(new THREE.Vector3(0, 1, 0), 1.5, 0x60ff90);
yAxis.material.depthTest = false;
yAxis.material.renderOrder = 1;

const zAxis = makeAxis(new THREE.Vector3(0, 0, 1), 1.5, 0x6090ff);
zAxis.material.depthTest = false;
zAxis.material.renderOrder = 1;

sphere.material.depthWrite = false;
sphere.renderOrder = 0;

// Add group for the axis
const axesGroup = new THREE.Group();
axesGroup.add(xAxis);
axesGroup.add(yAxis);
axesGroup.add(zAxis);
scene.add(axesGroup);

// Circles
function createCircle(normalAxis, color) {
  const points = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a)*1.2, Math.sin(a)*1.2, 0));
  }
  const geom = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4, depthTest: false });
  const circle = new THREE.Line(geom, mat);

  // Rotate the plane based on the normal axis
  if (normalAxis === 'x') circle.rotation.y = Math.PI / 2; // plane YZ
  if (normalAxis === 'z') circle.rotation.x = Math.PI / 2; // plane XZ

  return circle;
}

const circleXY = createCircle('z', 0x4444ff); 
const circleYZ = createCircle('x', 0xff4444); // plane YZ — normal X
const circleXZ = createCircle('y', 0x44ff44); // plane XZ — normal Y

axesGroup.add(circleXY);
axesGroup.add(circleYZ);
axesGroup.add(circleXZ);

// State vector
const arrowDir = new THREE.Vector3(0, 0, 1);
const arrow = new THREE.ArrowHelper(
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, 0),
  1.5,
  0xffe040,
  0.18,
  0.08
);
scene.add(arrow);

camera.position.z = 3;

// Labels
const labelX = document.getElementById("label-x");
const labelY = document.getElementById("label-y");
const labelZ = document.getElementById("label-z");

function projectToScreen(v3) {
  const v = v3.clone().project(camera);
  return {
    x: (v.x * 0.5 + 0.5) * window.innerWidth,
    y: (-v.y * 0.5 + 0.5) * window.innerHeight
  };
}

function updateLabel(el, localDir, len) {
  const world = localDir.clone().multiplyScalar(len * 1.15).applyQuaternion(axesGroup.quaternion);
  const s = projectToScreen(world);
  el.style.left = s.x + "px";
  el.style.top = s.y + "px";
}

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const COLORS = {
  dark: {sphere: 0xF5F5F5},
  light: {sphere: 0x303030}
};

window.addEventListener('themeChange', (e) => {
  const c = e.detail.dark ? COLORS.dark : COLORS.light;

  sphere.material.color.setHex(c.sphere);
});

const qX = new THREE.Quaternion();
const qY = new THREE.Quaternion();
const qZ = new THREE.Quaternion();
const axX = new THREE.Vector3(1, 0, 0);
const axY = new THREE.Vector3(0, 1, 0);
const axZ = new THREE.Vector3(0, 0, 1);

const stateVec = new THREE.Vector3(0, 0, 1);
const stateQ = new THREE.Quaternion();

// Animation
function animate() {
  requestAnimationFrame(animate);

  const t = performance.now() * 0.001;

  // Global rotation
  qX.setFromAxisAngle(axX, t * 0.20);
  qY.setFromAxisAngle(axY, t * 0.35);
  qZ.setFromAxisAngle(axZ, t * 0.15);
  axesGroup.quaternion.copy(qZ).multiply(qY).multiply(qX);

  // Vector |ψ⟩
  stateQ.setFromAxisAngle(axZ, t * 1.1);
  const dir = new THREE.Vector3(Math.sin(t * 0.7), 0, Math.cos(t * 0.7))
    .applyQuaternion(stateQ).normalize();
  arrow.setDirection(dir);

  // Update labels
  updateLabel(labelX, new THREE.Vector3(1, 0, 0), 1.5);
  updateLabel(labelY, new THREE.Vector3(0, 1, 0), 1.5);
  updateLabel(labelZ, new THREE.Vector3(0, 0, 1), 1.5);

  renderer.render(scene, camera);
}

animate();