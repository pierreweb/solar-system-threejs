import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.162.0/examples/jsm/controls/OrbitControls.js";

const canvas = document.getElementById("scene");
const dateInput = document.getElementById("dateInput");
const speedInput = document.getElementById("speed");
const speedOut = document.getElementById("speedOut");
const pauseInput = document.getElementById("pause");
const toggleOrbitsInput = document.getElementById("toggleOrbits");
const toggleLabelsInput = document.getElementById("toggleLabels");
const dateBadge = document.getElementById("dateBadge");
const lightModeInput = document.getElementById("lightMode");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  5000,
);
camera.position.set(0, 180, 260);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 20;
controls.maxDistance = 1200;

const LIGHT_PRESETS = {
  normal: {
    ambientIntensity: 0.0,
    ambientColor: 0xffffff,
    cameraFillIntensity: 0.0,
    cameraFillColor: 0xffffff,
    sunIntensity: 20,
    sunLightDecay: 0.3,
    sunLightColor: 0xfff4d6,
    emissiveBoost: 1,
    emissiveColor: 0x00ff00,
  },
  boost: {
    sunIntensity: 800,
    sunLightDecay: 0.3,
    sunLightColor: 0xfff4d6,
    ambientIntensity: 0.28,
    ambientColor: 0xffffff,
    cameraFillIntensity: 0.24,
    cameraFillColor: 0xffffff,
    emissiveBoost: 2,
    emissiveColor: 0x0000ff,
  },
  cinematic: {
    sunIntensity: 50,
    sunLightDecay: 0.1,
    sunLightColor: 0xfff4d6,
    ambientIntensity: 0,
    ambientColor: 0xffffff,
    cameraFillIntensity: 0,
    cameraFillColor: 0xffffff,
    emissiveBoost: 1,
    emissiveColor: 0xff0000,
  },
};

const cameraFillLight = new THREE.DirectionalLight(
  LIGHT_PRESETS.normal.cameraFillColor,
  LIGHT_PRESETS.normal.cameraFillIntensity,
);
cameraFillLight.position.set(0, 0, 1);
camera.add(cameraFillLight);
scene.add(camera);

const ambient = new THREE.AmbientLight(
  LIGHT_PRESETS.normal.ambientColor,
  LIGHT_PRESETS.normal.ambientIntensity,
);
scene.add(ambient);

const sunLight = new THREE.PointLight(
  LIGHT_PRESETS.normal.sunLightColor,
  LIGHT_PRESETS.normal.sunIntensity,
  0,
  LIGHT_PRESETS.normal.sunLightDecay,
);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const rimLight = new THREE.DirectionalLight(0x99bbff, 1);
rimLight.position.set(-1, 0.4, -0.6);
scene.add(rimLight);

const textureLoader = new THREE.TextureLoader();

const skyTexture = textureLoader.load("./textures/2k_stars.jpg");
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(1900, 64, 64),
  new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide }),
);
scene.add(sky);

const SUN_ROTATION_DAYS = 25.0;
const MOON_ORBIT_DAYS = 27.32;
const MOON_ROTATION_DAYS = 27.32;
const bodies = [
  {
    name: "Mercury",
    radius: 1.7,
    distance: 16,
    yearDays: 88,
    dayHours: 1407.6,
    tiltDeg: 0.03,
    texture: "./textures/2k_mercury.jpg",
    color: 0xb3a28a,
  },
  {
    name: "Venus",
    radius: 2.5,
    distance: 22,
    yearDays: 224.7,
    dayHours: -5832.5, // retrograde
    tiltDeg: 177.4,
    texture: "./textures/2k_venus_atmosphere.jpg",
    color: 0xd2a86b,
  },
  {
    name: "Earth",
    radius: 2.65,
    distance: 30,
    yearDays: 365.25,
    dayHours: 23.93,
    tiltDeg: 23.44,
    texture: "./textures/land_ocean_ice_cloud_2048.jpg",
    color: 0x4f86ff,
  },
  {
    name: "Mars",
    radius: 2.0,
    distance: 40,
    yearDays: 687,
    dayHours: 24.62,
    tiltDeg: 25.19,
    texture: "./textures/2k_mars.jpg",
    color: 0xc96f55,
  },
  {
    name: "Jupiter",
    radius: 8.5,
    distance: 62,
    yearDays: 4331,
    dayHours: 9.93,
    tiltDeg: 3.13,
    texture: "./textures/2k_jupiter.jpg",
    color: 0xd2b28a,
  },
  {
    name: "Saturn",
    radius: 7.2,
    distance: 88,
    yearDays: 10747,
    dayHours: 10.7,
    tiltDeg: 26.73,
    texture: "./textures/2k_saturn.jpg",
    color: 0xd9c58c,
  },
  {
    name: "Uranus",
    radius: 5.0,
    distance: 114,
    yearDays: 30589,
    dayHours: -17.24, // visual retrograde model
    tiltDeg: 97.77,
    texture: "./textures/2k_uranus.jpg",
    color: 0xa5d9e7,
  },
  {
    name: "Neptune",
    radius: 4.9,
    distance: 140,
    yearDays: 59800,
    dayHours: 16.11,
    tiltDeg: 28.32,
    texture: "./textures/2k_neptune.jpg",
    color: 0x456ddd,
  },
  {
    name: "Pluto",
    radius: 0.95,
    distance: 165,
    yearDays: 90560,
    dayHours: -153.3, // retrograde
    tiltDeg: 119.6,
    texture: "./textures/2k_pluto.jpg",
    color: 0xbfae9c,
  },
];

/* const bodies = [
  {
    name: "Mercury",
    radius: 1.7,
    distance: 16,
    yearDays: 88,
    dayHours: 1407,
    tiltDeg: 0.03,
    texture: "./textures/2k_mercury.jpg",
    color: 0xb3a28a,
  },
  {
    name: "Venus",
    radius: 2.5,
    distance: 22,
    yearDays: 225,
    dayHours: -5832,
    tiltDeg: 177,
    texture: "./textures/2k_venus_atmosphere.jpg",
    color: 0xd2a86b,
  },
  {
    name: "Earth",
    radius: 2.65,
    distance: 30,
    yearDays: 365.25,
    dayHours: 24,
    tiltDeg: 23.4,
    texture: "./textures/land_ocean_ice_cloud_2048.jpg",
    color: 0x4f86ff,
  },
  {
    name: "Mars",
    radius: 2,
    distance: 40,
    yearDays: 687,
    dayHours: 24.6,
    tiltDeg: 25,
    texture: "./textures/2k_mars.jpg",
    color: 0xc96f55,
  },
  {
    name: "Jupiter",
    radius: 8.5,
    distance: 62,
    yearDays: 4331,
    dayHours: 10,
    tiltDeg: 3.1,
    texture: "./textures/2k_jupiter.jpg",
    color: 0xd2b28a,
  },
  {
    name: "Saturn",
    radius: 7.2,
    distance: 88,
    yearDays: 10747,
    dayHours: 10.7,
    tiltDeg: 26.7,
    texture: "./textures/2k_saturn.jpg",
    color: 0xd9c58c,
  },
  {
    name: "Uranus",
    radius: 5,
    distance: 114,
    yearDays: 30589,
    dayHours: -17.2,
    tiltDeg: 97.8,
    texture: "./textures/2k_uranus.jpg",
    color: 0xa5d9e7,
  },
  {
    name: "Neptune",
    radius: 4.9,
    distance: 140,
    yearDays: 59800,
    dayHours: 16.1,
    tiltDeg: 28.3,
    texture: "./textures/2k_neptune.jpg",
    color: 0x456ddd,
  },
]; */

const simulation = {
  date: new Date(),
  daysPerSecond: Number(speedInput?.value) || 1,
  paused: false,
  elapsedDays: 0,
};

const group = new THREE.Group();
scene.add(group);

//const SUN_ROTATION_DAYS = 25;
const sunAngularSpeed = (Math.PI * 2) / SUN_ROTATION_DAYS; // rad / simulated day
const sunTexture = textureLoader.load("./textures/2k_sun.jpg");
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(11, 48, 48),
  new THREE.MeshBasicMaterial({
    map: sunTexture,
    color: 0xffffff,
  }),
);
group.add(sun);

function getPlanetEmissiveIntensity(body, preset) {
  return preset.emissiveBoost + body.distance / 20;
}

function createPlanetMaterial(body, preset) {
  const texture = body.texture ? textureLoader.load(body.texture) : null;

  return new THREE.MeshStandardMaterial({
    map: texture,
    emissiveMap: texture,
    roughness: 1,
    metalness: 1,
    color: body.color,
    emissiveIntensity: getPlanetEmissiveIntensity(body, preset),
    emissive: preset.emissiveColor,
  });
}

const planets = bodies.map((body) => {
  const orbit = new THREE.Object3D();
  group.add(orbit);

  const tiltPivot = new THREE.Object3D();
  tiltPivot.position.x = body.distance;
  tiltPivot.rotation.z = THREE.MathUtils.degToRad(body.tiltDeg);
  orbit.add(tiltPivot);

  const material = createPlanetMaterial(body, LIGHT_PRESETS.normal);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(body.radius, 32, 32),
    material,
  );
  tiltPivot.add(mesh);

  if (body.name === "Saturn") {
    const ringTexture = textureLoader.load(
      "./textures/saturn_small_ring_tex.png",
    );

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(body.radius * 1.3, body.radius * 2.1, 64),
      new THREE.MeshStandardMaterial({
        /*  map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,

        color: 0xffff01,
        emissive: 0x00ffff,
        emissiveMap: ringTexture,
        emissiveIntensity: 0.8,
        roughness: 1,
        metalness: 1, */
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        map: ringTexture,
        emissiveMap: ringTexture,
        roughness: 1,
        metalness: 1,
        color: body.color,
        emissiveIntensity: 1, //getPlanetEmissiveIntensity(body, preset),
        emissive: 0x222222, // preset.emissiveColor,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    mesh.add(ring);
  }

  const axisLine = new THREE.AxesHelper(body.radius * 2.2);
  mesh.add(axisLine);

  const orbitRing = new THREE.Mesh(
    new THREE.RingGeometry(body.distance - 0.13, body.distance + 0.13, 256),
    new THREE.MeshBasicMaterial({
      color: 0x8d85aa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    }),
  );
  orbitRing.rotation.x = Math.PI / 2;
  group.add(orbitRing);

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = body.name;
  label.style.display = toggleLabelsInput?.checked ? "block" : "none";
  document.body.append(label);

  return {
    body,
    orbit,
    tiltPivot,
    mesh,
    orbitRing,
    label,
    moon: null,
    orbitAngle: Math.random() * Math.PI * 2,
    selfRotationAngle: Math.random() * Math.PI * 2,
  };
});

const earth = planets.find((planet) => planet.body.name === "Earth");

if (earth) {
  const moonOrbit = new THREE.Object3D();
  earth.mesh.add(moonOrbit);

  const moonTexture = textureLoader.load("./textures/2k_moon.jpg");
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 24, 24),
    new THREE.MeshStandardMaterial({
      map: moonTexture,
      emissive: 0x222222,
      emissiveMap: moonTexture,
      emissiveIntensity: 0.08,
      roughness: 1,
      metalness: 0,
    }),
  );

  moon.position.x = 5.5;
  moonOrbit.add(moon);

  earth.moon = {
    orbit: moonOrbit,
    mesh: moon,
    orbitAngle: 0,
    selfRotationAngle: 0,
    yearDays: 27.3,
    dayHours: 27.3 * 24,
  };
}

function formatDateUTC(date) {
  return date.toISOString().slice(0, 10);
}

function setCurrentDate(date) {
  simulation.date = new Date(date);
  simulation.elapsedDays = simulation.date.getTime() / 86400000;

  if (dateInput) {
    dateInput.value = formatDateUTC(simulation.date);
  }

  if (dateBadge) {
    dateBadge.textContent = formatDateUTC(simulation.date);
  }
}

function updateSpeed() {
  simulation.daysPerSecond = Number(speedInput?.value) || 0;

  if (speedOut) {
    speedOut.textContent = simulation.daysPerSecond.toFixed(1);
  }
}

function applyLightPreset(mode = "normal") {
  const preset = LIGHT_PRESETS[mode] || LIGHT_PRESETS.normal;

  sunLight.intensity = preset.sunIntensity;
  sunLight.decay = preset.sunLightDecay;
  sunLight.color.setHex(preset.sunLightColor);

  ambient.intensity = preset.ambientIntensity;
  ambient.color.setHex(preset.ambientColor);

  cameraFillLight.intensity = preset.cameraFillIntensity;
  cameraFillLight.color.setHex(preset.cameraFillColor);

  planets.forEach((planet) => {
    const material = planet.mesh.material;
    if (material instanceof THREE.MeshStandardMaterial) {
      material.emissiveIntensity = getPlanetEmissiveIntensity(
        planet.body,
        preset,
      );
      material.emissive.setHex(preset.emissiveColor);
    }
  });
}

speedInput?.addEventListener("input", updateSpeed);

pauseInput?.addEventListener("change", () => {
  simulation.paused = pauseInput.checked;
});

toggleOrbitsInput?.addEventListener("change", () => {
  const visible = toggleOrbitsInput.checked;
  planets.forEach((planet) => {
    planet.orbitRing.visible = visible;
  });
});

toggleLabelsInput?.addEventListener("change", () => {
  const visible = toggleLabelsInput.checked;
  planets.forEach((planet) => {
    planet.label.style.display = visible ? "block" : "none";
  });
});

lightModeInput?.addEventListener("change", () => {
  applyLightPreset(lightModeInput.value);
});

dateInput?.addEventListener("change", () => {
  if (!dateInput.value) return;
  setCurrentDate(new Date(`${dateInput.value}T00:00:00Z`));
});

setCurrentDate(new Date());
updateSpeed();

const clock = new THREE.Clock();
const tmpWorldPos = new THREE.Vector3();

function updateCelestialPositions(deltaSeconds) {
  const dt = simulation.paused ? 0 : deltaSeconds;
  const simDayDelta = dt * simulation.daysPerSecond;

  if (simDayDelta !== 0) {
    simulation.elapsedDays += simDayDelta;
    simulation.date = new Date(simulation.elapsedDays * 86400000);

    if (dateBadge) {
      dateBadge.textContent = formatDateUTC(simulation.date);
    }

    if (dateInput) {
      dateInput.value = formatDateUTC(simulation.date);
    }
  }

  for (const planet of planets) {
    const orbitAngularSpeed = (Math.PI * 2) / planet.body.yearDays;
    const selfRotationDays = Math.abs(planet.body.dayHours) / 24;
    const selfAngularSpeed =
      selfRotationDays > 0 ? (Math.PI * 2) / selfRotationDays : 0;

    planet.orbitAngle += orbitAngularSpeed * simDayDelta;
    planet.selfRotationAngle += selfAngularSpeed * simDayDelta;

    planet.orbit.rotation.y = planet.orbitAngle;
    planet.mesh.rotation.y =
      planet.body.dayHours < 0
        ? -planet.selfRotationAngle
        : planet.selfRotationAngle;

    if (planet.moon) {
      const moonOrbitAngularSpeed = (Math.PI * 2) / planet.moon.yearDays;
      const moonSelfRotationDays = Math.abs(planet.moon.dayHours) / 24;
      const moonSelfAngularSpeed =
        moonSelfRotationDays > 0 ? (Math.PI * 2) / moonSelfRotationDays : 0;

      planet.moon.orbitAngle += moonOrbitAngularSpeed * simDayDelta;
      planet.moon.selfRotationAngle += moonSelfAngularSpeed * simDayDelta;

      planet.moon.orbit.rotation.y = planet.moon.orbitAngle;
      planet.moon.mesh.rotation.y = planet.moon.selfRotationAngle;
    }
  }

  //sun.rotation.y += dt * 0.24;

  sun.rotation.y += sunAngularSpeed * simDayDelta;
}

function projectLabel(planet) {
  if (!toggleLabelsInput?.checked) return;

  planet.mesh.getWorldPosition(tmpWorldPos);
  tmpWorldPos.project(camera);

  const x = (tmpWorldPos.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-tmpWorldPos.y * 0.5 + 0.5) * window.innerHeight;
  const hidden = tmpWorldPos.z > 1 || tmpWorldPos.z < -1;

  planet.label.style.display = hidden ? "none" : "block";
  planet.label.style.left = `${x}px`;
  planet.label.style.top = `${y}px`;
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  updateCelestialPositions(delta);
  controls.update();

  for (const planet of planets) {
    projectLabel(planet);
  }

  renderer.render(scene, camera);
}

applyLightPreset("normal");
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
