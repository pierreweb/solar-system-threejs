function degToRad(value) {
  return (value * Math.PI) / 180;
}

export function applyEphemerides({
  ephemerides,
  objectRegistry,
  animatedObjects,
  logger = console,
}) {
  if (!Array.isArray(ephemerides)) {
    return [];
  }

  const appliedNames = [];

  for (const ephemeris of ephemerides) {
    if (!ephemeris || typeof ephemeris.name !== "string") {
      continue;
    }

    if (!Number.isFinite(ephemeris.longitudeDeg)) {
      logger.warn(
        `[Miriade] Skipping ${ephemeris.name}: missing usable longitude.`,
        ephemeris,
      );
      continue;
    }

    const registryEntry = objectRegistry?.get?.(ephemeris.name);
    if (!registryEntry?.orbit) {
      logger.warn(
        `[Miriade] No matching orbit entry found for ${ephemeris.name}.`,
      );
      continue;
    }

    const orbitAngle = degToRad(ephemeris.longitudeDeg);
    registryEntry.orbitAngle = orbitAngle;
    registryEntry.orbit.rotation.y = orbitAngle;
    registryEntry.latestEphemeris = ephemeris;

    const animatedEntry = Array.isArray(animatedObjects)
      ? animatedObjects.find((entry) => entry?.name === ephemeris.name)
      : null;

    if (animatedEntry && animatedEntry !== registryEntry) {
      animatedEntry.orbitAngle = orbitAngle;
      animatedEntry.latestEphemeris = ephemeris;

      if (animatedEntry.orbit) {
        animatedEntry.orbit.rotation.y = orbitAngle;
      }
    }

    appliedNames.push(ephemeris.name);
  }

  return appliedNames;
}
