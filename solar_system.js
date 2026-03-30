// Solar System Visualization with Three.js
//solar_system.js
import * as THREE from "three";
import {
  SUN_ROTATION_DAYS,
  MOON_ORBIT_DAYS,
  MOON_ROTATION_DAYS,
  SHOW_AXES_HELPER,
  LIGHT_PRESETS,
  LABEL_HEIGHT_FACTOR,
} from "./config/constants.js";
import { solarObjects } from "./config/solarObjects.js";
import { formatDateUTC } from "./utils/date.js";
import {
  clearPlanetInfoDrawer,
  updatePlanetInfoDrawer,
} from "./ui/planetInfoDrawer.js";
import {
  renderer,
  scene,
  camera,
  controls,
  textureLoader,
} from "./core/sceneSetup.js";

const dateInput = document.getElementById("dateInput");
const speedInput = document.getElementById("speed");
const speedOut = document.getElementById("speedOut");
const pauseInput = document.getElementById("pause");
const toggleOrbitsInput = document.getElementById("toggleOrbits");
const toggleLabelsInput = document.getElementById("toggleLabels");
const dateBadge = document.getElementById("dateBadge");
const lightModeInput = document.getElementById("lightMode");

const planetInfoDrawer = document.getElementById("planetInfoDrawer");
const planetInfoName = document.getElementById("planetInfoName");
const planetInfoType = document.getElementById("planetInfoType");
const planetInfoBody = document.getElementById("planetInfoBody");

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickableMeshes = [];

const simulation = {
  date: new Date(),
  daysPerSecond: Number(speedInput?.value) || 1,
  paused: false,
  elapsedDays: 0,
};

const skyTexture = textureLoader.load("./textures/2k_stars.jpg");
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(1900, 64, 64),
  new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide }),
);
scene.add(sky);

const group = new THREE.Group();
scene.add(group);

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

const sunAngularSpeed = (Math.PI * 2) / SUN_ROTATION_DAYS;
const sunTexture = textureLoader.load("./textures/2k_sun.jpg");
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(11, 48, 48),
  new THREE.MeshBasicMaterial({
    map: sunTexture,
    color: 0xffffff,
  }),
);
group.add(sun);

const objectRegistry = new Map();
const animatedObjects = [];
const orbitRingObjects = [];
const labelObjects = [];
let asteroidBeltEntry = null;

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

function getVisualBoostByRole(obj, preset) {
  if (obj.visualRole === "planet") return preset.planetEmissiveBoost;
  if (obj.visualRole === "dwarf") return preset.dwarfEmissiveBoost;
  if (obj.visualRole === "ring") return preset.ringEmissiveBoost;
  if (obj.visualRole === "belt") return preset.beltEmissiveBoost;
  if (obj.visualRole === "moon") return preset.moonEmissiveBoost;
  return 0;
}

function getVisualColorByRole(obj, preset) {
  if (obj.visualRole === "planet") return preset.planetEmissiveColor;
  if (obj.visualRole === "dwarf") return preset.dwarfEmissiveColor;
  if (obj.visualRole === "ring") return preset.ringEmissiveColor;
  if (obj.visualRole === "belt") return preset.beltEmissiveColor;
  if (obj.visualRole === "moon") return preset.moonEmissiveColor;
  return 0x111111;
}

function getPlanetLikeEmissiveIntensity(obj, preset) {
  const baseBoost = getVisualBoostByRole(obj, preset);
  const distanceFactor = obj.distance ? obj.distance / 20 : 0;
  return baseBoost + distanceFactor;
}

function createPlanetLikeMaterial(obj, preset) {
  const texture = obj.texture ? textureLoader.load(obj.texture) : null;

  return new THREE.MeshStandardMaterial({
    map: texture,
    emissiveMap: texture,
    roughness: 1,
    metalness: 1,
    color: obj.color,
    emissiveIntensity: getPlanetLikeEmissiveIntensity(obj, preset),
    emissive: getVisualColorByRole(obj, preset),
  });
}

function createLabel(text) {
  const label = document.createElement("div");
  label.className = "label";
  label.textContent = text;
  label.style.display = toggleLabelsInput?.checked ? "block" : "none";
  document.body.append(label);
  return label;
}

function createOrbitRing(distance) {
  const orbitRing = new THREE.Mesh(
    new THREE.RingGeometry(distance - 0.13, distance + 0.13, 256),
    new THREE.MeshBasicMaterial({
      color: 0x8d85aa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    }),
  );
  orbitRing.rotation.x = Math.PI / 2;
  group.add(orbitRing);
  orbitRingObjects.push(orbitRing);
  return orbitRing;
}

function createPlanetObject(obj, preset) {
  const orbit = new THREE.Object3D();
  group.add(orbit);

  const tiltPivot = new THREE.Object3D();
  tiltPivot.position.x = obj.distance;
  tiltPivot.rotation.z = THREE.MathUtils.degToRad(obj.tiltDeg || 0);
  orbit.add(tiltPivot);

  const material = createPlanetLikeMaterial(obj, preset);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(obj.radius, 32, 32),
    material,
  );

  tiltPivot.add(mesh);

  mesh.userData.bodyName = obj.name;
  mesh.userData.clickable = true;
  clickableMeshes.push(mesh);

  if (SHOW_AXES_HELPER) {
    const axisLine = new THREE.AxesHelper(obj.radius * 2.2);
    mesh.add(axisLine);
  }

  const orbitRing = obj.hasOrbitRing ? createOrbitRing(obj.distance) : null;
  const label = obj.hasLabel ? createLabel(obj.name) : null;

  const entry = {
    ...obj,
    orbit,
    tiltPivot,
    mesh,
    orbitRing,
    label,
    moon: null,
    orbitAngle: Math.random() * Math.PI * 2,
    selfRotationAngle: Math.random() * Math.PI * 2,
  };

  objectRegistry.set(obj.name, entry);
  animatedObjects.push(entry);
  labelObjects.push(entry);

  return entry;
}

function createRingObject(obj, preset) {
  const parent = objectRegistry.get(obj.parentName);
  if (!parent) {
    console.warn(`Parent not found for ring: ${obj.name}`);
    return null;
  }

  const ringTexture = obj.texture ? textureLoader.load(obj.texture) : null;

  const ringMaterial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    opacity: preset.ringOpacity,
    map: ringTexture,
    emissiveMap: ringTexture,
    roughness: 1,
    metalness: 1,
    color: obj.color ?? preset.ringTint,
    emissiveIntensity: preset.ringEmissiveBoost,
    emissive: preset.ringEmissiveColor,
  });

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(obj.innerRadius, obj.outerRadius, 96),
    ringMaterial,
  );
  ring.rotation.x = Math.PI / 2;
  parent.mesh.add(ring);

  const entry = {
    ...obj,
    mesh: ring,
    parent,
  };

  objectRegistry.set(obj.name, entry);
  return entry;
}

function createBeltObject(obj, preset) {
  const orbit = new THREE.Object3D();
  group.add(orbit);

  const beltGroup = new THREE.Group();
  orbit.add(beltGroup);

  const asteroidGeometry = new THREE.IcosahedronGeometry(0.12, 0);
  const beltMaterial = new THREE.MeshStandardMaterial({
    color: preset.beltTint,
    roughness: 1,
    metalness: 0,
    emissive: preset.beltEmissiveColor,
    emissiveIntensity: preset.beltEmissiveBoost,
  });

  for (let i = 0; i < obj.count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = THREE.MathUtils.lerp(
      obj.innerRadius,
      obj.outerRadius,
      Math.random(),
    );
    const y = (Math.random() - 0.5) * obj.thickness;

    const asteroid = new THREE.Mesh(asteroidGeometry, beltMaterial);
    asteroid.position.set(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius,
    );
    asteroid.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI,
    );

    const scale = THREE.MathUtils.lerp(0.7, 2.2, Math.random());
    asteroid.scale.setScalar(scale);

    beltGroup.add(asteroid);
  }

  const entry = {
    ...obj,
    orbit,
    group: beltGroup,
    material: beltMaterial,
    orbitAngle: Math.random() * Math.PI * 2,
  };

  objectRegistry.set(obj.name, entry);
  asteroidBeltEntry = entry;
  return entry;
}

function createMoonForEarth(preset) {
  const earth = objectRegistry.get("Earth");
  if (!earth) return;

  const moonOrbit = new THREE.Object3D();
  earth.mesh.add(moonOrbit);

  const moonTexture = textureLoader.load("./textures/2k_moon.jpg");
  const moonMaterial = new THREE.MeshStandardMaterial({
    map: moonTexture,
    emissive: preset.moonEmissiveColor,
    emissiveMap: moonTexture,
    emissiveIntensity: preset.moonEmissiveBoost,
    roughness: 1,
    metalness: 0,
  });

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 24, 24),
    moonMaterial,
  );

  moon.position.x = 5.5;
  moonOrbit.add(moon);

  earth.moon = {
    name: "Moon",
    visualRole: "moon",
    orbit: moonOrbit,
    mesh: moon,
    material: moonMaterial,
    orbitAngle: 0,
    selfRotationAngle: 0,
    yearDays: MOON_ORBIT_DAYS,
    dayHours: MOON_ROTATION_DAYS * 24,
  };
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

  animatedObjects.forEach((entry) => {
    const material = entry.mesh.material;
    if (material instanceof THREE.MeshStandardMaterial) {
      material.emissiveIntensity = getPlanetLikeEmissiveIntensity(
        entry,
        preset,
      );
      material.emissive.setHex(getVisualColorByRole(entry, preset));
    }
  });

  const saturnRing = objectRegistry.get("Saturn Ring");
  if (saturnRing?.mesh?.material instanceof THREE.MeshStandardMaterial) {
    saturnRing.mesh.material.opacity = preset.ringOpacity;
    saturnRing.mesh.material.color.setHex(preset.ringTint);
    saturnRing.mesh.material.emissiveIntensity = preset.ringEmissiveBoost;
    saturnRing.mesh.material.emissive.setHex(preset.ringEmissiveColor);
  }

  if (asteroidBeltEntry?.material instanceof THREE.MeshStandardMaterial) {
    asteroidBeltEntry.material.color.setHex(preset.beltTint);
    asteroidBeltEntry.material.emissive.setHex(preset.beltEmissiveColor);
    asteroidBeltEntry.material.emissiveIntensity = preset.beltEmissiveBoost;
  }

  const earth = objectRegistry.get("Earth");
  if (earth?.moon?.material instanceof THREE.MeshStandardMaterial) {
    earth.moon.material.emissiveIntensity = preset.moonEmissiveBoost;
    earth.moon.material.emissive.setHex(preset.moonEmissiveColor);
  }
}

/* function projectLabel(entry, tmpWorldPos) {
  if (!toggleLabelsInput?.checked || !entry.label) return;

  entry.mesh.getWorldPosition(tmpWorldPos);
  tmpWorldPos.project(camera);

  const x = (tmpWorldPos.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-tmpWorldPos.y * 0.5 + 0.5) * window.innerHeight;
  const hidden = tmpWorldPos.z > 1 || tmpWorldPos.z < -1;

  entry.label.style.display = hidden ? "none" : "block";
  entry.label.style.left = `${x}px`;
  entry.label.style.top = `${y}px`;
} */

function projectLabel(entry, worldPos) {
  if (!toggleLabelsInput?.checked) return;

  tmpLabelWorldPos.copy(worldPos).project(camera);

  const x = (tmpLabelWorldPos.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-tmpLabelWorldPos.y * 0.5 + 0.5) * window.innerHeight;
  const hidden = tmpLabelWorldPos.z > 1 || tmpLabelWorldPos.z < -1;

  entry.label.style.display = hidden ? "none" : "block";
  entry.label.style.left = `${x}px`;
  entry.label.style.top = `${y}px`;
}

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

  for (const entry of animatedObjects) {
    const orbitAngularSpeed = (Math.PI * 2) / entry.yearDays;
    const selfRotationDays = Math.abs(entry.dayHours) / 24;
    const selfAngularSpeed =
      selfRotationDays > 0 ? (Math.PI * 2) / selfRotationDays : 0;

    entry.orbitAngle += orbitAngularSpeed * simDayDelta;
    entry.selfRotationAngle += selfAngularSpeed * simDayDelta;

    entry.orbit.rotation.y = entry.orbitAngle;
    entry.mesh.rotation.y =
      entry.dayHours < 0 ? -entry.selfRotationAngle : entry.selfRotationAngle;

    if (entry.moon) {
      const moonOrbitAngularSpeed = (Math.PI * 2) / entry.moon.yearDays;
      const moonSelfRotationDays = Math.abs(entry.moon.dayHours) / 24;
      const moonSelfAngularSpeed =
        moonSelfRotationDays > 0 ? (Math.PI * 2) / moonSelfRotationDays : 0;

      entry.moon.orbitAngle += moonOrbitAngularSpeed * simDayDelta;
      entry.moon.selfRotationAngle += moonSelfAngularSpeed * simDayDelta;

      entry.moon.orbit.rotation.y = entry.moon.orbitAngle;
      entry.moon.mesh.rotation.y =
        entry.moon.dayHours < 0
          ? -entry.moon.selfRotationAngle
          : entry.moon.selfRotationAngle;
    }
  }

  if (asteroidBeltEntry) {
    const beltAngularSpeed = (Math.PI * 2) / asteroidBeltEntry.yearDays;
    asteroidBeltEntry.orbitAngle += beltAngularSpeed * simDayDelta;
    asteroidBeltEntry.orbit.rotation.y = asteroidBeltEntry.orbitAngle;
  }

  sun.rotation.y += sunAngularSpeed * simDayDelta;
}

solarObjects.forEach((obj) => {
  if (obj.kind === "planet" || obj.kind === "dwarf") {
    createPlanetObject(obj, LIGHT_PRESETS.normal);
  }
});

solarObjects.forEach((obj) => {
  if (obj.kind === "ring") {
    createRingObject(obj, LIGHT_PRESETS.normal);
  }
});

solarObjects.forEach((obj) => {
  if (obj.kind === "belt") {
    createBeltObject(obj, LIGHT_PRESETS.normal);
  }
});

createMoonForEarth(LIGHT_PRESETS.normal);

speedInput?.addEventListener("input", updateSpeed);

pauseInput?.addEventListener("change", () => {
  simulation.paused = pauseInput.checked;
});

toggleOrbitsInput?.addEventListener("change", () => {
  const visible = toggleOrbitsInput.checked;
  orbitRingObjects.forEach((orbitRing) => {
    orbitRing.visible = visible;
  });
});

toggleLabelsInput?.addEventListener("change", () => {
  const visible = toggleLabelsInput.checked;
  labelObjects.forEach((entry) => {
    if (entry.label) {
      entry.label.style.display = visible ? "block" : "none";
    }
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
clearPlanetInfoDrawer({
  planetInfoDrawer,
  planetInfoName,
  planetInfoType,
  planetInfoBody,
});
//updatePlanetInfoDrawer("Saturn"); //pour test

const clock = new THREE.Clock();

/* const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickableMeshes = []; */

//const tmpLabelPos = new THREE.Vector3();
//const labelOffset = new THREE.Vector3(0, 6, 0);
const tmpWorldPos = new THREE.Vector3();
const tmpLabelWorldPos = new THREE.Vector3();
const tmpOffset = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  updateCelestialPositions(delta);
  controls.update();

  /*  for (const entry of labelObjects) {
    console.log("Updating label for", entry.name);

    if (
      entry.name === "Jupiter" ||
      entry.name === "Saturn" ||
      entry.name === "Neptune" ||
      entry.name === "Uranus"
    ) {
      tmpLabelPos.copy(tmpWorldPos).add(labelOffset);
      projectLabel(entry, tmpLabelPos);
    } else {
      projectLabel(entry, tmpWorldPos);
    }
  } */

  for (const entry of labelObjects) {
    if (!entry.label || !entry.mesh) continue;

    const radius = entry.body?.radius ?? entry.radius ?? 2;

    entry.mesh.getWorldPosition(tmpWorldPos);

    tmpOffset.set(0, 0.4 * radius * LABEL_HEIGHT_FACTOR, 0);
    tmpLabelWorldPos.copy(tmpWorldPos).add(tmpOffset);

    projectLabel(entry, tmpLabelWorldPos);
  }

  renderer.render(scene, camera);
}

window.addEventListener("pointerdown", onPointerDown);

function onPointerDown(event) {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(clickableMeshes, true);

  if (!intersects.length) {
    clearPlanetInfoDrawer({
      planetInfoDrawer,
      planetInfoName,
      planetInfoType,
      planetInfoBody,
    });
    return;
  }

  let clickedObject = intersects[0].object;

  while (clickedObject && !clickedObject.userData?.clickable) {
    clickedObject = clickedObject.parent;
  }

  if (!clickedObject || !clickedObject.userData?.bodyName) {
    clearPlanetInfoDrawer({
      planetInfoDrawer,
      planetInfoName,
      planetInfoType,
      planetInfoBody,
    });
    return;
  }

  updatePlanetInfoDrawer(clickedObject.userData.bodyName, {
    planetInfoDrawer,
    planetInfoName,
    planetInfoType,
    planetInfoBody,
  });
}

applyLightPreset("normal");

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
