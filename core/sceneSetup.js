import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.162.0/examples/jsm/controls/OrbitControls.js";

const canvas = document.getElementById("scene");

export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

export const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  5000,
);
camera.position.set(0, 180, 260);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 20;
controls.maxDistance = 1200;

export const textureLoader = new THREE.TextureLoader();
