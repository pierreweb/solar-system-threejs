export function createBeltObject(obj, preset, deps) {
  const { THREE, group, objectRegistry } = deps;

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
  return entry;
}
