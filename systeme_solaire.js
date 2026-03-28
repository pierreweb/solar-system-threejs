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

const ambient = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambient);

const sunLight = new THREE.PointLight(0xfff4d6, 4.5, 0, 1.0);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const textureLoader = new THREE.TextureLoader();

const skyTexture = textureLoader.load("./textures/2k_stars.jpg");
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(1900, 64, 64),
  new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide }),
);
scene.add(sky);

const bodies = [
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
];

const simulation = {
  date: new Date(),
  daysPerSecond: Number(speedInput.value) || 1,
  paused: false,
  elapsedDays: 0,
};

const group = new THREE.Group();
scene.add(group);

const sunTexture = textureLoader.load("./textures/2k_sun.jpg");
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(11, 48, 48),
  new THREE.MeshBasicMaterial({
    map: sunTexture,
    color: 0xffffff,
  }),
);
group.add(sun);

const planets = bodies.map((body) => {
  const orbit = new THREE.Object3D();
  group.add(orbit);

  const texture = body.texture ? textureLoader.load(body.texture) : null;

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    emissive: 0x222222,
    emissiveMap: texture,
    emissiveIntensity: 0.12,
    roughness: 1,
    metalness: 0,
    color: body.color,
  });

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(body.radius, 32, 32),
    material,
  );

  mesh.position.x = body.distance;
  mesh.rotation.z = THREE.MathUtils.degToRad(body.tiltDeg);
  orbit.add(mesh);

  if (body.name === "Saturn") {
    const ringTexture = textureLoader.load(
      "./textures/saturn_Saturn_Rings_1__John_van_Vliet.jpg",
    );

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(body.radius * 1.3, body.radius * 2.1, 64),
      new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    mesh.add(ring);
  }

  const orbitRing = new THREE.Mesh(
    new THREE.RingGeometry(body.distance - 0.13, body.distance + 0.13, 256),
    new THREE.MeshBasicMaterial({
      color: 0xfd85aa,

      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    }),
    /*         new THREE.MeshStandardMaterial({
      map: moonTexture,
      emissive: 0x222222,
      emissiveMap: moonTexture,
      emissiveIntensity: 0.08,
      roughness: 1,
      metalness: 0,
    }), */
  );
  orbitRing.rotation.x = Math.PI / 2;
  group.add(orbitRing);

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = body.name;
  label.style.display = toggleLabelsInput.checked ? "block" : "none";
  document.body.append(label);

  return {
    body,
    orbit,
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
  simulation.daysPerSecond = Number(speedInput.value) || 0;

  if (speedOut) {
    speedOut.textContent = simulation.daysPerSecond.toFixed(1);
  }
}

speedInput.addEventListener("input", updateSpeed);

pauseInput.addEventListener("change", () => {
  simulation.paused = pauseInput.checked;
});

toggleOrbitsInput.addEventListener("change", () => {
  const visible = toggleOrbitsInput.checked;
  planets.forEach((planet) => {
    planet.orbitRing.visible = visible;
  });
});

toggleLabelsInput.addEventListener("change", () => {
  const visible = toggleLabelsInput.checked;
  planets.forEach((planet) => {
    planet.label.style.display = visible ? "block" : "none";
  });
});

dateInput.addEventListener("change", () => {
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
    const orbitAngularSpeed = (Math.PI * 2) / planet.body.yearDays; // rad / simulated day
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

  sun.rotation.y += dt * 0.24;
}

function projectLabel(planet) {
  if (!toggleLabelsInput.checked) return;

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

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
