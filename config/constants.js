export const SUN_ROTATION_DAYS = 25.0;
export const MOON_ORBIT_DAYS = 27.32;
export const MOON_ROTATION_DAYS = 27.32;
export const SHOW_AXES_HELPER = true;

export const LIGHT_PRESETS = {
  normal: {
    ambientIntensity: 0.0,
    ambientColor: 0xffffff,
    cameraFillIntensity: 0.0,
    cameraFillColor: 0xffffff,
    sunIntensity: 20,
    sunLightDecay: 0.3,
    sunLightColor: 0xfff4d6,

    planetEmissiveBoost: 1.0,
    planetEmissiveColor: 0x00ff00,

    dwarfEmissiveBoost: 0.8,
    dwarfEmissiveColor: 0x00ff00,

    moonEmissiveBoost: 0.08,
    moonEmissiveColor: 0x222222,

    ringEmissiveBoost: 1.0,
    ringEmissiveColor: 0x222222,
    ringOpacity: 0.95,
    ringTint: 0xffffff,

    beltEmissiveBoost: 0.03,
    beltEmissiveColor: 0x111111,
    beltTint: 0x8f8476,
  },

  boost: {
    ambientIntensity: 0.28,
    ambientColor: 0xffffff,
    cameraFillIntensity: 0.24,
    cameraFillColor: 0xffffff,
    sunIntensity: 800,
    sunLightDecay: 0.3,
    sunLightColor: 0xfff4d6,

    planetEmissiveBoost: 2.0,
    planetEmissiveColor: 0x0000ff,

    dwarfEmissiveBoost: 1.5,
    dwarfEmissiveColor: 0x0000ff,

    moonEmissiveBoost: 0.18,
    moonEmissiveColor: 0x222244,

    ringEmissiveBoost: 1.6,
    ringEmissiveColor: 0x3333aa,
    ringOpacity: 0.98,
    ringTint: 0xffffff,

    beltEmissiveBoost: 0.08,
    beltEmissiveColor: 0x222244,
    beltTint: 0xb0a392,
  },

  cinematic: {
    ambientIntensity: 0.0,
    ambientColor: 0xffffff,
    cameraFillIntensity: 0.0,
    cameraFillColor: 0xffffff,
    sunIntensity: 50,
    sunLightDecay: 0.1,
    sunLightColor: 0xfff4d6,

    planetEmissiveBoost: 1.0,
    planetEmissiveColor: 0xff0000,

    dwarfEmissiveBoost: 0.8,
    dwarfEmissiveColor: 0xaa0000,

    moonEmissiveBoost: 0.03,
    moonEmissiveColor: 0x111111,

    ringEmissiveBoost: 0.5,
    ringEmissiveColor: 0x330000,
    ringOpacity: 0.9,
    ringTint: 0xf4ead0,

    beltEmissiveBoost: 0.01,
    beltEmissiveColor: 0x111111,
    beltTint: 0x6f675c,
  },
};

export const LABEL_HEIGHT_FACTOR = 2.0;
