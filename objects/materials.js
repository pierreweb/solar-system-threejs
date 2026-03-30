import * as THREE from "three";

export function getVisualBoostByRole(obj, preset) {
  if (obj.visualRole === "planet") return preset.planetEmissiveBoost;
  if (obj.visualRole === "dwarf") return preset.dwarfEmissiveBoost;
  if (obj.visualRole === "ring") return preset.ringEmissiveBoost;
  if (obj.visualRole === "belt") return preset.beltEmissiveBoost;
  if (obj.visualRole === "moon") return preset.moonEmissiveBoost;
  return 0;
}

export function getVisualColorByRole(obj, preset) {
  if (obj.visualRole === "planet") return preset.planetEmissiveColor;
  if (obj.visualRole === "dwarf") return preset.dwarfEmissiveColor;
  if (obj.visualRole === "ring") return preset.ringEmissiveColor;
  if (obj.visualRole === "belt") return preset.beltEmissiveColor;
  if (obj.visualRole === "moon") return preset.moonEmissiveColor;
  return 0x111111;
}

export function getPlanetLikeEmissiveIntensity(obj, preset) {
  const baseBoost = getVisualBoostByRole(obj, preset);
  const distanceFactor = obj.distance ? obj.distance / 20 : 0;
  return baseBoost + distanceFactor;
}

export function createPlanetLikeMaterial(obj, preset, { textureLoader }) {
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
