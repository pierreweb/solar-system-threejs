import React from "react";
import type { PlanetInfo } from "../types/planet";

type PlanetInfoCardProps = {
  planet?: PlanetInfo | null;
  isExpanded?: boolean;
};

const rows: Array<{ key: keyof PlanetInfo; label: string }> = [
  { key: "type", label: "Type" },
  { key: "satelliteCount", label: "Satellites" },
  { key: "mass", label: "Mass" },
  { key: "equatorialRadius", label: "Equatorial radius" },
  { key: "density", label: "Density" },
  { key: "volume", label: "Volume" },
  { key: "orbitalPeriod", label: "Orbital period" },
  { key: "rotationPeriod", label: "Rotation period" },
  { key: "distanceFromSun", label: "Distance from Sun" },
];

export default function PlanetInfoCard({
  planet,
  isExpanded = false,
}: PlanetInfoCardProps) {
  const hasPlanet = Boolean(planet);

  return (
    <aside
      className={[
        "planet-info-drawer",
        isExpanded ? "is-expanded" : "",
        hasPlanet ? "has-planet" : "is-empty",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Planet information"
    >
      <div className="planet-info-card">
        <div className="planet-info-header">
          <div className="planet-info-kicker">Planetary data</div>
          <h3 className="planet-info-title">
            {planet?.name ?? "No selection"}
          </h3>
        </div>

        {!hasPlanet ? (
          <div className="planet-info-empty">
            <p>Select a planet to view information</p>
          </div>
        ) : (
          <>
            <div className="planet-info-grid">
              {rows.map(({ key, label }) => (
                <div className="planet-info-row" key={String(key)}>
                  <span className="planet-info-label">{label}</span>
                  <span className="planet-info-value">{planet?.[key]}</span>
                </div>
              ))}
            </div>

            <div className="planet-info-description">
              <p>{planet?.shortDescription}</p>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
