const MIRIade_BASE_URL =
  "https://ssp.imcce.fr/webservices/miriade/api/ephemcc.php";

const SUPPORTED_BODY_CODES = {
  Mercury: "p:Mercury",
  Venus: "p:Venus",
  Earth: "p:Earth",
  Mars: "p:Mars",
};

function isValidUtcDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toFiniteNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
}

function pickFirstValue(source, keys) {
  if (!source || typeof source !== "object") return null;

  for (const key of keys) {
    if (
      source[key] !== undefined &&
      source[key] !== null &&
      source[key] !== ""
    ) {
      return source[key];
    }
  }

  return null;
}

function normalizeAngle(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    return dmsToDeg(value);
  }

  return null;
}

function normalizeRadius(value) {
  return toFiniteNumber(value);
}

function normalizeBodyName(name, payload) {
  const payloadName = payload?.sso?.name;
  return typeof payloadName === "string" && payloadName.trim() ? name : name;
}

function normalizeSingleBodyResponse(name, payload) {
  // console.log("[Miriade row keys]", Object.keys(payload?.data?.[0] ?? {}));
  //console.log("[Miriade units]", payload?.unit);
  //console.log("[Miriade datacol]", payload?.datacol);
  const row = Array.isArray(payload?.data) ? (payload.data[0] ?? null) : null;

  const longitudeValue = pickFirstValue(row, [
    "Longitude",
    "longitude",
    "lon",
    "lambda",
    "ra",
    "l",
  ]);

  const latitudeValue = pickFirstValue(row, [
    "Latitude",
    "latitude",
    "lat",
    "beta",
    "dec",
    "b",
  ]);

  /*   const radiusValue = pickFirstValue(row, [
    "Radius",
    "radius",
    "range",
    "dobs",
    "heliocentric_distance",
    "distance",
    "r",
  ]); */

  const radiusValue = pickFirstValue(row, [
    "Dobs",
    "Radius",
    "radius",
    "Range",
    "range",
    "dobs",
    "heliocentric_distance",
    "distance",
    "r",
  ]);

  return {
    name: normalizeBodyName(name, payload),
    longitudeDeg: normalizeAngle(longitudeValue),
    latitudeDeg: normalizeAngle(latitudeValue),
    radiusAu: normalizeRadius(radiusValue),
    raw: payload,
  };
}
export function buildMiriadeUrl(name, dateStr) {
  const bodyCode = SUPPORTED_BODY_CODES[name];

  if (!bodyCode) {
    throw new Error(
      `[Miriade] Unsupported body "${name}". Supported bodies: ${Object.keys(
        SUPPORTED_BODY_CODES,
      ).join(", ")}`,
    );
  }

  if (!isValidUtcDateString(dateStr)) {
    throw new Error(
      `[Miriade] Invalid UTC date string "${dateStr}". Expected YYYY-MM-DD.`,
    );
  }

  // console.log("=== NEW buildMiriadeUrl version loaded ===");
  // console.log("buildMiriadeUrl params:", { name, dateStr });

  const url = new URL(MIRIade_BASE_URL);
  url.search = new URLSearchParams({
    "-name": bodyCode,
    "-type": "Planet",
    "-ep": dateStr,
    "-nbd": "1",
    "-step": "1d",
    "-tscale": "UTC",
    "-observer": "@sun",
    "-rplane": "2",
    "-teph": "1",
    "-mime": "json",
  }).toString();

  return url.toString();
}

export function dmsToDeg(value) {
  if (value == null) return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (!trimmed.includes(":")) {
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : null;
  }

  const sign = trimmed.startsWith("-") ? -1 : 1;
  const unsigned = trimmed.replace(/^[+-]/, "");
  const [degPart = "0", minPart = "0", secPart = "0"] = unsigned.split(":");

  const degrees = Number(degPart);
  const minutes = Number(minPart);
  const seconds = Number(secPart);

  if (
    !Number.isFinite(degrees) ||
    !Number.isFinite(minutes) ||
    !Number.isFinite(seconds)
  ) {
    return null;
  }

  return sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600);
}

export async function fetchBodyEphemeris(name, dateStr) {
  const url = buildMiriadeUrl(name, dateStr);
  console.log("[Miriade URL]", url);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `[Miriade] HTTP ${response.status} ${response.statusText} for ${name}`,
    );
  }

  const payload = await response.json();

  if (payload?.flag !== undefined && Number(payload.flag) !== 1) {
    throw new Error(
      `[Miriade] Request failed for ${name}: ${payload?.status || `flag=${payload.flag}`}`,
    );
  }

  return normalizeSingleBodyResponse(name, payload);
}

export async function fetchEphemeridesForBodies(dateStr, bodyNames) {
  if (!Array.isArray(bodyNames)) {
    throw new Error("[Miriade] bodyNames must be an array.");
  }

  return Promise.all(
    bodyNames.map((bodyName) => fetchBodyEphemeris(bodyName, dateStr)),
  );
}
