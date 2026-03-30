import { getPlanetInfo } from "../data/planetInfodata.js";

export function renderInfoRow(label, value) {
  return `
    <div class="planet-info-row">
      <span class="planet-info-label">${label}</span>
      <span class="planet-info-value">${value ?? "—"}</span>
    </div>
  `;
}

export function clearPlanetInfoDrawer({
  planetInfoDrawer,
  planetInfoName,
  planetInfoType,
  planetInfoBody,
}) {
  if (
    !planetInfoDrawer ||
    !planetInfoName ||
    !planetInfoType ||
    !planetInfoBody
  ) {
    return;
  }

  planetInfoDrawer.classList.add("is-empty");
  planetInfoDrawer.classList.remove("is-open");

  planetInfoName.textContent = "No selection";
  planetInfoType.textContent = "Select a planet to view information";
  planetInfoBody.innerHTML = `
    <div class="planet-info-empty">
      Select a planet to view information
    </div>
  `;
}

export function updatePlanetInfoDrawer(
  name,
  {
    planetInfoDrawer,
    planetInfoName,
    planetInfoType,
    planetInfoBody,
  },
) {
  if (
    !planetInfoDrawer ||
    !planetInfoName ||
    !planetInfoType ||
    !planetInfoBody
  ) {
    return;
  }

  const info = getPlanetInfo(name);

  if (!info) {
    clearPlanetInfoDrawer({
      planetInfoDrawer,
      planetInfoName,
      planetInfoType,
      planetInfoBody,
    });
    return;
  }

  planetInfoDrawer.classList.remove("is-empty");
  planetInfoDrawer.classList.add("is-open");

  planetInfoName.textContent = info.name ?? "Unknown object";
  planetInfoType.textContent = info.type ?? "";

  planetInfoBody.innerHTML = `
    <div class="planet-info-grid">
      ${renderInfoRow("Mass", info.mass)}
      ${renderInfoRow("Equatorial radius", info.equatorialRadius)}
      ${renderInfoRow("Density", info.density)}
      ${renderInfoRow("Volume", info.volume)}
      ${renderInfoRow("Orbital period", info.orbitalPeriod)}
      ${renderInfoRow("Rotation period", info.rotationPeriod)}
      ${renderInfoRow("Distance from Sun", info.distanceFromSun)}
      ${renderInfoRow("Min temperature", info.minTemperature)}
      ${renderInfoRow("Max temperature", info.maxTemperature)}
      ${renderInfoRow("Mean temperature", info.meanTemperature)}
      ${renderInfoRow("Gravity", info.gravity)}
      ${renderInfoRow("Albedo", info.albedo)}
      ${renderInfoRow("Moons", info.moons)}
    </div>

    <div class="planet-info-description">
      <p>${info.description ?? ""}</p>
    </div>
  `;
}
