//data/getPlanetInfo.ts
import { planetData } from "./planetData";

export function getPlanetInfoById(id?: string | null) {
  if (!id) return null;
  return planetData[id] ?? null;
}
