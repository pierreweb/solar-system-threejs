function degToRad(value) {
  return (value * Math.PI) / 180;
}

function toSupportedBodySet(value) {
  if (value instanceof Set) {
    return value;
  }

  if (Array.isArray(value)) {
    return new Set(value);
  }

  return new Set();
}

export function applyEphemerides({
  ephemerides,
  objectRegistry,
  animatedObjects,
  supportedBodyNames,
  auToSceneDistanceScale,
  minSceneDistance = 0,
  longitudeOffsetDeg = 0,
  logger = console,
}) {
  if (!Array.isArray(ephemerides)) {
    return [];
  }

  if (!Number.isFinite(auToSceneDistanceScale) || auToSceneDistanceScale <= 0) {
    throw new Error(
      "[Miriade] applyEphemerides requires a positive auToSceneDistanceScale.",
    );
  }

  const supportedBodies = toSupportedBodySet(supportedBodyNames);
  const appliedNames = [];

  for (const ephemeris of ephemerides) {
    if (!ephemeris || typeof ephemeris.name !== "string") {
      continue;
    }

    if (!supportedBodies.has(ephemeris.name)) {
      continue;
    }

    if (!Number.isFinite(ephemeris.longitudeDeg)) {
      logger.warn(
        `[Miriade] Skipping ${ephemeris.name}: missing usable longitude.`,
        ephemeris,
      );
      continue;
    }

    if (!Number.isFinite(ephemeris.radiusAu)) {
      logger.warn(
        `[Miriade] Skipping ${ephemeris.name}: missing usable radius.`,
        ephemeris,
      );
      continue;
    }

    const registryEntry = objectRegistry?.get?.(ephemeris.name);
    if (!registryEntry?.orbit || !registryEntry?.tiltPivot) {
      logger.warn(
        `[Miriade] No matching placement entry found for ${ephemeris.name}.`,
      );
      continue;
    }

    const orbitAngle = degToRad(ephemeris.longitudeDeg + longitudeOffsetDeg);
    // const sceneDistance = ephemeris.radiusAu * auToSceneDistanceScale;
    const sceneDistance =
      minSceneDistance +
      Math.log1p(ephemeris.radiusAu) * auToSceneDistanceScale;

    registryEntry.orbitAngle = orbitAngle;
    registryEntry.orbit.rotation.y = orbitAngle;
    registryEntry.tiltPivot.position.x = sceneDistance;
    registryEntry.latestEphemeris = ephemeris;
    registryEntry.latestSceneDistance = sceneDistance;

    const animatedEntry = Array.isArray(animatedObjects)
      ? animatedObjects.find((entry) => entry?.name === ephemeris.name)
      : null;

    if (animatedEntry && animatedEntry !== registryEntry) {
      animatedEntry.orbitAngle = orbitAngle;
      animatedEntry.latestEphemeris = ephemeris;
      animatedEntry.latestSceneDistance = sceneDistance;

      if (animatedEntry.orbit) {
        animatedEntry.orbit.rotation.y = orbitAngle;
      }

      if (animatedEntry.tiltPivot) {
        animatedEntry.tiltPivot.position.x = sceneDistance;
      }
    }

    appliedNames.push(ephemeris.name);
  }

  return appliedNames;
}
