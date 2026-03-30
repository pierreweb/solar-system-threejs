//data/panetData.js
import type { PlanetInfo } from "../types/planet";

export const planetData: Record<string, PlanetInfo> = {
  sun: {
    id: "sun",
    name: "Sun",
    type: "G-type main-sequence star (G2V)",
    satelliteCount: "8 planets, dwarf planets, asteroids, comets, etc.",
    mass: "1.989 × 10^30 kg",
    equatorialRadius: "695,700 km",
    density: "1.41 g/cm³",
    volume: "1.41 × 10^18 km³",
    orbitalPeriod: "Galactic orbit ≈ 225–250 million years",
    rotationPeriod: "≈ 25 days (equator), ≈ 35 days (poles)",
    distanceFromSun: "0 km",
    shortDescription:
      "The Sun is the central star of the Solar System. It contains more than 99% of the system’s total mass and provides the light and energy that sustain planetary climates and life on Earth.",
  },

  mercury: {
    id: "mercury",
    name: "Mercury",
    type: "Terrestrial planet",
    satelliteCount: "0",
    mass: "3.301 × 10^23 kg",
    equatorialRadius: "2,440 km",
    density: "5.43 g/cm³",
    volume: "6.08 × 10^10 km³",
    orbitalPeriod: "87.97 days",
    rotationPeriod: "58.65 days",
    distanceFromSun: "57.9 million km (0.39 AU)",
    shortDescription:
      "Mercury is the smallest and innermost planet in the Solar System. It has a heavily cratered surface, extreme temperature variations, and almost no substantial atmosphere.",
  },

  venus: {
    id: "venus",
    name: "Venus",
    type: "Terrestrial planet",
    satelliteCount: "0",
    mass: "4.867 × 10^24 kg",
    equatorialRadius: "6,052 km",
    density: "5.24 g/cm³",
    volume: "9.28 × 10^11 km³",
    orbitalPeriod: "224.70 days",
    rotationPeriod: "243 days (retrograde)",
    distanceFromSun: "108.2 million km (0.72 AU)",
    shortDescription:
      "Venus is similar in size to Earth but is covered by a dense carbon dioxide atmosphere with thick clouds of sulfuric acid. Its runaway greenhouse effect makes it the hottest planet in the Solar System.",
  },

  earth: {
    id: "earth",
    name: "Earth",
    type: "Terrestrial planet",
    satelliteCount: "1",
    mass: "5.972 × 10^24 kg",
    equatorialRadius: "6,378 km",
    density: "5.51 g/cm³",
    volume: "1.08 × 10^12 km³",
    orbitalPeriod: "365.25 days",
    rotationPeriod: "23 h 56 min",
    distanceFromSun: "149.6 million km (1 AU)",
    shortDescription:
      "Earth is the only known planet to support life. It has liquid water on its surface, a nitrogen-oxygen atmosphere, active geology, and a protective magnetic field.",
  },

  moon: {
    id: "moon",
    name: "Moon",
    type: "Natural satellite of Earth",
    satelliteCount: "0",
    mass: "7.35 × 10^22 kg",
    equatorialRadius: "1,737 km",
    density: "3.34 g/cm³",
    volume: "2.20 × 10^10 km³",
    orbitalPeriod: "27.32 days",
    rotationPeriod: "27.32 days (synchronous)",
    distanceFromSun: "≈ 149.6 million km (varies with Earth)",
    shortDescription:
      "The Moon is Earth’s only natural satellite. It is tidally locked, always showing the same face to Earth, and strongly influences ocean tides and Earth’s rotational stability.",
  },

  mars: {
    id: "mars",
    name: "Mars",
    type: "Terrestrial planet",
    satelliteCount: "2",
    mass: "6.417 × 10^23 kg",
    equatorialRadius: "3,390 km",
    density: "3.93 g/cm³",
    volume: "1.63 × 10^11 km³",
    orbitalPeriod: "686.98 days",
    rotationPeriod: "24 h 37 min",
    distanceFromSun: "227.9 million km (1.52 AU)",
    shortDescription:
      "Mars is a cold desert world with polar caps, giant volcanoes, vast canyons, and evidence of ancient liquid water. It is one of the most studied targets for future human exploration.",
  },

  "asteroid-belt": {
    id: "asteroid-belt",
    name: "Asteroid Belt",
    type: "Circumstellar small-body region",
    satelliteCount: "Millions of asteroids and dwarf-planet candidates",
    mass: "≈ 3.0 × 10^21 kg (total, approximate)",
    equatorialRadius: "N/A",
    density: "N/A",
    volume: "N/A",
    orbitalPeriod: "Objects typically orbit between ~3 and ~6 years",
    rotationPeriod: "Varies by object",
    distanceFromSun: "Between ~2.1 and ~3.3 AU",
    shortDescription:
      "The asteroid belt is the region between Mars and Jupiter containing countless rocky and metallic bodies. It includes dwarf planet Ceres and preserves clues about the early formation of the Solar System.",
  },

  ceres: {
    id: "ceres",
    name: "Ceres",
    type: "Dwarf planet / largest asteroid-belt object",
    satelliteCount: "0",
    mass: "9.39 × 10^20 kg",
    equatorialRadius: "≈ 473 km",
    density: "2.16 g/cm³",
    volume: "≈ 4.21 × 10^8 km³",
    orbitalPeriod: "4.61 years",
    rotationPeriod: "9 h 4 min",
    distanceFromSun: "413.7 million km (2.77 AU)",
    shortDescription:
      "Ceres is the largest object in the asteroid belt and the smallest recognized dwarf planet. It likely contains significant water ice and may have had internal geological activity.",
  },

  jupiter: {
    id: "jupiter",
    name: "Jupiter",
    type: "Gas giant",
    satelliteCount: "95+ known moons",
    mass: "1.898 × 10^27 kg",
    equatorialRadius: "71,492 km",
    density: "1.33 g/cm³",
    volume: "1.43 × 10^15 km³",
    orbitalPeriod: "11.86 years",
    rotationPeriod: "9 h 56 min",
    distanceFromSun: "778.5 million km (5.20 AU)",
    shortDescription:
      "Jupiter is the largest planet in the Solar System. It is a gas giant with powerful storms, a strong magnetic field, faint rings, and many moons including Io, Europa, Ganymede, and Callisto.",
  },

  saturn: {
    id: "saturn",
    name: "Saturn",
    type: "Gas giant",
    satelliteCount: "140+ known moons",
    mass: "5.683 × 10^26 kg",
    equatorialRadius: "60,268 km",
    density: "0.69 g/cm³",
    volume: "8.27 × 10^14 km³",
    orbitalPeriod: "29.46 years",
    rotationPeriod: "≈ 10 h 33 min",
    distanceFromSun: "1.43 billion km (9.58 AU)",
    shortDescription:
      "Saturn is famous for its spectacular ring system made of ice and rock particles. It is a low-density gas giant with a rich system of moons, including Titan and Enceladus.",
  },

  uranus: {
    id: "uranus",
    name: "Uranus",
    type: "Ice giant",
    satelliteCount: "27",
    mass: "8.681 × 10^25 kg",
    equatorialRadius: "25,559 km",
    density: "1.27 g/cm³",
    volume: "6.83 × 10^13 km³",
    orbitalPeriod: "84.01 years",
    rotationPeriod: "17 h 14 min (retrograde)",
    distanceFromSun: "2.87 billion km (19.2 AU)",
    shortDescription:
      "Uranus is an ice giant with a blue-green color caused by methane in its atmosphere. Its axis is tilted by about 98°, making it appear to rotate almost on its side.",
  },

  neptune: {
    id: "neptune",
    name: "Neptune",
    type: "Ice giant",
    satelliteCount: "14",
    mass: "1.024 × 10^26 kg",
    equatorialRadius: "24,764 km",
    density: "1.64 g/cm³",
    volume: "6.25 × 10^13 km³",
    orbitalPeriod: "164.8 years",
    rotationPeriod: "16 h 6 min",
    distanceFromSun: "4.50 billion km (30.1 AU)",
    shortDescription:
      "Neptune is the outermost major planet. It is a deep blue ice giant known for extremely strong winds, dynamic storms, and its large moon Triton.",
  },

  pluto: {
    id: "pluto",
    name: "Pluto",
    type: "Dwarf planet (Kuiper Belt object)",
    satelliteCount: "5",
    mass: "1.309 × 10^22 kg",
    equatorialRadius: "1,188 km",
    density: "1.86 g/cm³",
    volume: "7.06 × 10^9 km³",
    orbitalPeriod: "248 years",
    rotationPeriod: "6.39 days (retrograde)",
    distanceFromSun: "5.91 billion km average (39.5 AU)",
    shortDescription:
      "Pluto is a dwarf planet in the Kuiper Belt. Once considered the ninth planet, it is now classified as a dwarf planet and is known for its complex geology and its large moon Charon.",
  },
};