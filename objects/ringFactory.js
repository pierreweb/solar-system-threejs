export function createRingObject(obj, preset, deps) {
  const { THREE, objectRegistry, textureLoader } = deps;

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
