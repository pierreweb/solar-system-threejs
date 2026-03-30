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
  getVisualColorByRole,
  getPlanetLikeEmissiveIntensity,
  createPlanetLikeMaterial,
} from "./objects/materials.js";
import { createLabel, projectLabel } from "./objects/labels.js";
import { createOrbitRing } from "./objects/orbitRings.js";
import { createPlanetObject } from "./objects/planetFactory.js";
import { createRingObject } from "./objects/ringFactory.js";
import { createBeltObject } from "./objects/beltFactory.js";
import { createMoonForEarth } from "./objects/moonFactory.js";
import { updateCelestialPositions } from "./simulation/updateCelestialPositions.js";
import { applyEphemerides } from "./simulation/applyEphemerides.js";
import {
  fetchEphemeridesForBodies,
  fetchMoonEphemeris,
} from "./api/miriade.js";
import { onPointerDown } from "./ui/interactions.js";
import { applyLightPreset } from "./core/lighting.js";
import { setupResizeHandler } from "./ui/resizeHandler.js";
import {
  renderer,
  scene,
  camera,
  controls,
  textureLoader,
} from "./core/sceneSetup.js";

const MIRIADE_SUPPORTED_BODIES = [
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Ceres",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
];
const MIRIADE_LOG_DISTANCE_SCALE = 70;
const MIRIADE_MIN_SCENE_DISTANCE = 8;
const MIRIADE_LONGITUDE_OFFSET_DEG = 0;
const MIRIADE_MOON_AU_TO_SCENE_DISTANCE = 2200;
const MIRIADE_MOON_LONGITUDE_OFFSET_DEG = 0;

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

const miriadeState = {
  requestToken: 0,
  latestEphemerides: [],
  lastRequestedDateStr: null,
  moonRequestToken: 0,
  latestMoonEphemeris: null,
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

function applyMoonEphemeris(moonEphemeris) {
  const earth = objectRegistry.get("Earth");
  const moon = earth?.moon;

  if (!moon?.orbit || !moon?.mesh) {
    console.warn("[Miriade] Moon structure is not available on Earth.");
    return false;
  }

  if (!Number.isFinite(moonEphemeris?.longitudeDeg)) {
    console.warn(
      "[Miriade] Skipping Moon: missing usable longitude.",
      moonEphemeris,
    );
    return false;
  }

  if (!Number.isFinite(moonEphemeris?.radiusAu)) {
    console.warn(
      "[Miriade] Skipping Moon: missing usable radius.",
      moonEphemeris,
    );
    return false;
  }

  const orbitAngle = THREE.MathUtils.degToRad(
    moonEphemeris.longitudeDeg + MIRIADE_MOON_LONGITUDE_OFFSET_DEG,
  );
  const sceneDistance =
    moonEphemeris.radiusAu * MIRIADE_MOON_AU_TO_SCENE_DISTANCE;

  moon.orbitAngle = orbitAngle;
  moon.orbit.rotation.y = orbitAngle;
  moon.mesh.position.x = sceneDistance;
  moon.latestEphemeris = moonEphemeris;
  moon.latestSceneDistance = sceneDistance;

  return true;
}

async function refreshMiriadeEphemerides(dateStr) {
  if (!dateStr) return;

  const requestToken = ++miriadeState.requestToken;
  miriadeState.lastRequestedDateStr = dateStr;

  try {
    const ephemerides = await fetchEphemeridesForBodies(
      dateStr,
      MIRIADE_SUPPORTED_BODIES,
    );

    if (requestToken !== miriadeState.requestToken) {
      return;
    }

    miriadeState.latestEphemerides = ephemerides;

    console.info(
      `[Miriade] Normalized heliocentric ephemerides for ${dateStr}`,
      ephemerides,
    );

    applyEphemerides({
      ephemerides,
      objectRegistry,
      animatedObjects,
      supportedBodyNames: MIRIADE_SUPPORTED_BODIES,
      auToSceneDistanceScale: MIRIADE_LOG_DISTANCE_SCALE,
      minSceneDistance: MIRIADE_MIN_SCENE_DISTANCE,
      longitudeOffsetDeg: MIRIADE_LONGITUDE_OFFSET_DEG,
      logger: console,
    });
  } catch (error) {
    if (requestToken !== miriadeState.requestToken) {
      return;
    }

    console.error(
      `[Miriade] Failed to fetch heliocentric ephemerides for ${dateStr}`,
      error,
    );
  }
}

async function refreshMoonEphemeris(dateStr) {
  if (!dateStr) return;

  const requestToken = ++miriadeState.moonRequestToken;

  try {
    const moonEphemeris = await fetchMoonEphemeris(dateStr);

    if (requestToken !== miriadeState.moonRequestToken) {
      return;
    }

    miriadeState.latestMoonEphemeris = moonEphemeris;

    console.info(
      `[Miriade] Normalized geocentric Moon ephemeris for ${dateStr}`,
      moonEphemeris,
    );

    applyMoonEphemeris(moonEphemeris);
  } catch (error) {
    if (requestToken !== miriadeState.moonRequestToken) {
      return;
    }

    console.error(
      `[Miriade] Failed to fetch geocentric Moon ephemeris for ${dateStr}`,
      error,
    );
  }
}

solarObjects.forEach((obj) => {
  if (obj.kind === "planet" || obj.kind === "dwarf") {
    createPlanetObject(obj, LIGHT_PRESETS.normal, {
      THREE,
      group,
      objectRegistry,
      animatedObjects,
      labelObjects,
      clickableMeshes,
      createPlanetLikeMaterial,
      createOrbitRing,
      createLabel,
      textureLoader,
      toggleLabelsInput,
      orbitRingObjects,
      SHOW_AXES_HELPER,
    });
  }
});

solarObjects.forEach((obj) => {
  if (obj.kind === "ring") {
    createRingObject(obj, LIGHT_PRESETS.normal, {
      THREE,
      objectRegistry,
      textureLoader,
    });
  }
});

solarObjects.forEach((obj) => {
  if (obj.kind === "belt") {
    asteroidBeltEntry = createBeltObject(obj, LIGHT_PRESETS.normal, {
      THREE,
      group,
      objectRegistry,
      logDistanceScale: MIRIADE_LOG_DISTANCE_SCALE,
      minSceneDistance: MIRIADE_MIN_SCENE_DISTANCE,
    });
  }
});

createMoonForEarth(LIGHT_PRESETS.normal, {
  THREE,
  objectRegistry,
  textureLoader,
  MOON_ORBIT_DAYS,
  MOON_ROTATION_DAYS,
  SHOW_AXES_HELPER,
  clickableMeshes,
});

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
  applyLightPreset({
    mode: lightModeInput.value,
    LIGHT_PRESETS,
    sunLight,
    ambient,
    cameraFillLight,
    animatedObjects,
    objectRegistry,
    asteroidBeltEntry,
    THREE,
    getPlanetLikeEmissiveIntensity,
    getVisualColorByRole,
  });
});

dateInput?.addEventListener("change", () => {
  if (!dateInput.value) return;
  setCurrentDate(new Date(`${dateInput.value}T00:00:00Z`));
  refreshMiriadeEphemerides(dateInput.value);
  refreshMoonEphemeris(dateInput.value);
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

refreshMiriadeEphemerides(formatDateUTC(simulation.date));
refreshMoonEphemeris(formatDateUTC(simulation.date));

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

  updateCelestialPositions(delta, {
    simulation,
    animatedObjects,
    asteroidBeltEntry,
    sun,
    sunAngularSpeed,
    dateInput,
    dateBadge,
    formatDateUTC,
  });
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

    projectLabel(entry, tmpLabelWorldPos, { toggleLabelsInput, camera });
  }

  renderer.render(scene, camera);
}

window.addEventListener("pointerdown", (event) =>
  onPointerDown(event, {
    renderer,
    mouse,
    raycaster,
    camera,
    clickableMeshes,
    clearPlanetInfoDrawer,
    updatePlanetInfoDrawer,
    planetInfoDrawer,
    planetInfoName,
    planetInfoType,
    planetInfoBody,
  }),
);

applyLightPreset({
  mode: "normal",
  LIGHT_PRESETS,
  sunLight,
  ambient,
  cameraFillLight,
  animatedObjects,
  objectRegistry,
  asteroidBeltEntry,
  THREE,
  getPlanetLikeEmissiveIntensity,
  getVisualColorByRole,
});

animate();

setupResizeHandler({ camera, renderer });
