export function applyLightPreset({
  mode = "normal",
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
}) {
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
