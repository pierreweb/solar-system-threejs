export function updateCelestialPositions(deltaSeconds, deps) {
  const {
    simulation,
    animatedObjects,
    asteroidBeltEntry,
    sun,
    sunAngularSpeed,
    dateInput,
    dateBadge,
    formatDateUTC,
  } = deps;

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
