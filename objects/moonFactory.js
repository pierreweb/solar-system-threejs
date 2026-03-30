export function createMoonForEarth(preset, deps) {
  const {
    THREE,
    objectRegistry,
    textureLoader,
    MOON_ORBIT_DAYS,
    MOON_ROTATION_DAYS,
  } = deps;

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
