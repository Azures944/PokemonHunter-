// WildBound — 12 original creatures (WildMons)
// Type advantages: Fire>Nature>Water>Fire | Electric>Water | Ice>Wind>Nature
// Light>Shadow | Storm>Electric | Magma>Ice>Crystal>Shadow

export const TYPE_COLORS = {
  Fire:     '#FF5733',
  Water:    '#0099CC',
  Earth:    '#8B6914',
  Wind:     '#87CEEB',
  Electric: '#FFD700',
  Ice:      '#B0E0FF',
  Nature:   '#2ECC40',
  Light:    '#FFE45E',
  Shadow:   '#7B2FBE',
  Crystal:  '#DA70D6',
  Storm:    '#4169E1',
  Magma:    '#CC3300',
};

export const TYPE_ADVANTAGES = {
  Fire:     ['Nature', 'Ice', 'Crystal'],
  Water:    ['Fire', 'Earth', 'Magma'],
  Earth:    ['Electric', 'Storm', 'Fire'],
  Wind:     ['Nature', 'Earth'],
  Electric: ['Water', 'Wind'],
  Ice:      ['Nature', 'Wind', 'Earth'],
  Nature:   ['Water', 'Earth', 'Wind'],
  Light:    ['Shadow', 'Crystal'],
  Shadow:   ['Light', 'Psychic'],
  Crystal:  ['Shadow', 'Ice', 'Nature'],
  Storm:    ['Wind', 'Electric', 'Water'],
  Magma:    ['Ice', 'Nature', 'Crystal'],
};

export const CREATURES = {
  flambit: {
    id: 'flambit',
    name: 'Flambit',
    type: 'Fire',
    rarity: 'common',
    description: 'A blazing fox spirit that leaves trails of embers. Its tail burns brightest at midnight.',
    catchRate: 0.72,
    baseStats: { hp: 55, attack: 65, defense: 38, speed: 82 },
    moves: [
      { name: 'Ember Dash',    power: 38, type: 'Fire',   pp: 25, description: 'Blazing sprint attack' },
      { name: 'Flame Tail',    power: 55, type: 'Fire',   pp: 20, description: 'Fiery tail whip' },
      { name: 'Inferno Howl',  power: 72, type: 'Fire',   pp: 12, description: 'Devastating roar of fire' },
      { name: 'Fox Blaze',     power: 95, type: 'Fire',   pp: 5,  description: 'Ultimate spirit flame' },
    ],
    colors: { primary: '#FF6B35', secondary: '#FF4500', accent: '#FFD700', bg: '#2D0A00' },
  },

  aquora: {
    id: 'aquora',
    name: 'Aquora',
    type: 'Water',
    rarity: 'common',
    description: 'A graceful water spirit shaped like a drifting jellyfish. Its glow calms raging seas.',
    catchRate: 0.70,
    baseStats: { hp: 65, attack: 52, defense: 60, speed: 68 },
    moves: [
      { name: 'Bubble Burst',  power: 35, type: 'Water',  pp: 25, description: 'Pop bubbles on impact' },
      { name: 'Tidal Wrap',    power: 52, type: 'Water',  pp: 20, description: 'Tentacle tidal slam' },
      { name: 'Wave Crash',    power: 70, type: 'Water',  pp: 12, description: 'Massive crashing wave' },
      { name: 'Deep Current',  power: 92, type: 'Water',  pp: 5,  description: 'Unstoppable ocean force' },
    ],
    colors: { primary: '#00B4D8', secondary: '#0077B6', accent: '#90E0EF', bg: '#001A2C' },
  },

  terrox: {
    id: 'terrox',
    name: 'Terrox',
    type: 'Earth',
    rarity: 'common',
    description: 'A boulder-bodied pup forged deep underground. Its bark shakes the earth.',
    catchRate: 0.68,
    baseStats: { hp: 85, attack: 72, defense: 88, speed: 28 },
    moves: [
      { name: 'Rock Roll',     power: 42, type: 'Earth',  pp: 25, description: 'Roll into foe like a boulder' },
      { name: 'Ground Slam',   power: 60, type: 'Earth',  pp: 18, description: 'Slam the ground hard' },
      { name: 'Quake Roar',    power: 75, type: 'Earth',  pp: 10, description: 'Roar that cracks the earth' },
      { name: 'Titan Crush',   power: 100, type: 'Earth', pp: 5,  description: 'Ultimate earth smash' },
    ],
    colors: { primary: '#8B6914', secondary: '#5A3E0A', accent: '#D4A847', bg: '#1A0D00' },
  },

  zephlyn: {
    id: 'zephlyn',
    name: 'Zephlyn',
    type: 'Wind',
    rarity: 'uncommon',
    description: 'A silver bird that rides the jet stream. Spotting one brings good fortune to travelers.',
    catchRate: 0.55,
    baseStats: { hp: 48, attack: 58, defense: 42, speed: 110 },
    moves: [
      { name: 'Air Slash',     power: 40, type: 'Wind',   pp: 25, description: 'Razor sharp air cut' },
      { name: 'Gust Strike',   power: 55, type: 'Wind',   pp: 18, description: 'Wind-powered strike' },
      { name: 'Cyclone Dive',  power: 78, type: 'Wind',   pp: 10, description: 'Spiral high-speed dive' },
      { name: 'Sky Shatter',   power: 98, type: 'Wind',   pp: 5,  description: 'Rend the sky itself' },
    ],
    colors: { primary: '#B0C4DE', secondary: '#87CEEB', accent: '#FFFFFF', bg: '#0A1628' },
  },

  voltix: {
    id: 'voltix',
    name: 'Voltix',
    type: 'Electric',
    rarity: 'uncommon',
    description: 'A spiky electric rodent that stores lightning in its quills. Can power a city block for a day.',
    catchRate: 0.58,
    baseStats: { hp: 50, attack: 78, defense: 35, speed: 95 },
    moves: [
      { name: 'Zap Quill',     power: 38, type: 'Electric', pp: 25, description: 'Fire electric quills' },
      { name: 'Thunder Jab',   power: 58, type: 'Electric', pp: 18, description: 'Electrified punch' },
      { name: 'Bolt Surge',    power: 80, type: 'Electric', pp: 10, description: 'Surging lightning bolt' },
      { name: 'Overload',      power: 105, type: 'Electric', pp: 5, description: 'Discharge all stored power' },
    ],
    colors: { primary: '#FFD700', secondary: '#FFA500', accent: '#FFFFFF', bg: '#1A1200' },
  },

  frostara: {
    id: 'frostara',
    name: 'Frostara',
    type: 'Ice',
    rarity: 'uncommon',
    description: 'A fluffy ice bear cub born from the first winter snowfall. Its hug flash-freezes enemies.',
    catchRate: 0.56,
    baseStats: { hp: 75, attack: 62, defense: 72, speed: 42 },
    moves: [
      { name: 'Frost Claw',    power: 40, type: 'Ice',     pp: 25, description: 'Icy claw swipe' },
      { name: 'Blizzard Hug',  power: 60, type: 'Ice',     pp: 18, description: 'Freeze-on-contact hug' },
      { name: 'Ice Storm',     power: 78, type: 'Ice',     pp: 10, description: 'Raging blizzard strike' },
      { name: 'Glacial Roar',  power: 100, type: 'Ice',    pp: 5,  description: 'Shatter foe with cold roar' },
    ],
    colors: { primary: '#B0E0FF', secondary: '#7EC8E3', accent: '#FFFFFF', bg: '#00111A' },
  },

  thornix: {
    id: 'thornix',
    name: 'Thornix',
    type: 'Nature',
    rarity: 'uncommon',
    description: 'A vine serpent that weaves through ancient forests. Its thorns carry potent paralysis pollen.',
    catchRate: 0.54,
    baseStats: { hp: 68, attack: 60, defense: 65, speed: 60 },
    moves: [
      { name: 'Vine Lash',     power: 38, type: 'Nature',  pp: 25, description: 'Whip with razor vines' },
      { name: 'Thorn Barrage', power: 58, type: 'Nature',  pp: 18, description: 'Fire a volley of thorns' },
      { name: 'Root Crush',    power: 75, type: 'Nature',  pp: 10, description: 'Ensnare and crush' },
      { name: 'Forest Fury',   power: 98, type: 'Nature',  pp: 5,  description: 'Unleash the wild forest' },
    ],
    colors: { primary: '#2ECC40', secondary: '#1A7A2E', accent: '#90EE90', bg: '#010D02' },
  },

  luminos: {
    id: 'luminos',
    name: 'Luminos',
    type: 'Light',
    rarity: 'rare',
    description: 'A radiant deer with antlers that glow like starlight. Its presence heals all nearby wounds.',
    catchRate: 0.35,
    baseStats: { hp: 72, attack: 55, defense: 65, speed: 85 },
    moves: [
      { name: 'Star Beam',     power: 42, type: 'Light',   pp: 22, description: 'Focused beam of starlight' },
      { name: 'Radiance Rush', power: 60, type: 'Light',   pp: 15, description: 'Blinding speed dash' },
      { name: 'Solar Flare',   power: 82, type: 'Light',   pp: 8,  description: 'Explosive burst of light' },
      { name: 'Celestial Bow', power: 108, type: 'Light',  pp: 4,  description: 'Antlers fire a divine arrow' },
    ],
    colors: { primary: '#FFE45E', secondary: '#FFBF00', accent: '#FFFFFF', bg: '#1A1100' },
  },

  shadowmeld: {
    id: 'shadowmeld',
    name: 'Shadowmeld',
    type: 'Shadow',
    rarity: 'rare',
    description: 'A panther woven from living shadow. It moves between dimensions, impossible to pin down.',
    catchRate: 0.30,
    baseStats: { hp: 60, attack: 85, defense: 55, speed: 105 },
    moves: [
      { name: 'Shade Strike',  power: 45, type: 'Shadow',  pp: 22, description: 'Strike from the shadows' },
      { name: 'Dark Lunge',    power: 65, type: 'Shadow',  pp: 15, description: 'Dimensional lunge attack' },
      { name: 'Void Tear',     power: 85, type: 'Shadow',  pp: 8,  description: 'Rip open a shadow rift' },
      { name: 'Eclipse Pounce',power: 112, type: 'Shadow', pp: 4,  description: 'Ultimate shadow assassination' },
    ],
    colors: { primary: '#7B2FBE', secondary: '#3C096C', accent: '#DA70D6', bg: '#0D0018' },
  },

  crystalix: {
    id: 'crystalix',
    name: 'Crystalix',
    type: 'Crystal',
    rarity: 'rare',
    description: 'A gemstone moth with prismatic wings. Its wingbeats scatter rainbow laser light.',
    catchRate: 0.32,
    baseStats: { hp: 58, attack: 70, defense: 95, speed: 62 },
    moves: [
      { name: 'Prism Shot',    power: 40, type: 'Crystal', pp: 22, description: 'Refracted light blast' },
      { name: 'Crystal Wing',  power: 62, type: 'Crystal', pp: 15, description: 'Razor crystal wing slash' },
      { name: 'Gem Storm',     power: 84, type: 'Crystal', pp: 8,  description: 'Rain of crystal shards' },
      { name: 'Diamond Dust',  power: 110, type: 'Crystal', pp: 4, description: 'Obliterate with gem powder' },
    ],
    colors: { primary: '#DA70D6', secondary: '#9B30FF', accent: '#FFFAFF', bg: '#160024' },
  },

  stormclaw: {
    id: 'stormclaw',
    name: 'Stormclaw',
    type: 'Storm',
    rarity: 'legendary',
    description: 'An eagle forged by the most violent tempest ever recorded. Its wings create hurricanes.',
    catchRate: 0.12,
    baseStats: { hp: 90, attack: 110, defense: 68, speed: 108 },
    moves: [
      { name: 'Thunder Talon', power: 52, type: 'Storm',   pp: 20, description: 'Lightning-infused talon' },
      { name: 'Storm Dive',    power: 72, type: 'Storm',   pp: 14, description: 'Power-dive through clouds' },
      { name: 'Hurricane Wing',power: 92, type: 'Storm',   pp: 7,  description: 'Create a hurricane' },
      { name: 'Tempest Lord',  power: 125, type: 'Storm',  pp: 3,  description: 'Become the storm itself' },
    ],
    colors: { primary: '#4169E1', secondary: '#1A2980', accent: '#87CEEB', bg: '#000A1A' },
  },

  emberhound: {
    id: 'emberhound',
    name: 'Emberhound',
    type: 'Magma',
    rarity: 'legendary',
    description: 'A volcanic hound whose veins flow with molten rock. Erupts with fury when provoked.',
    catchRate: 0.10,
    baseStats: { hp: 95, attack: 118, defense: 78, speed: 70 },
    moves: [
      { name: 'Lava Bite',     power: 55, type: 'Magma',   pp: 20, description: 'Molten fangs clamp down' },
      { name: 'Magma Rush',    power: 75, type: 'Magma',   pp: 14, description: 'Charge through lava' },
      { name: 'Eruption Howl', power: 95, type: 'Magma',   pp: 7,  description: 'Volcanic eruption roar' },
      { name: 'Magma Core',    power: 130, type: 'Magma',  pp: 3,  description: 'Tap into the planet\'s core' },
    ],
    colors: { primary: '#CC3300', secondary: '#8B0000', accent: '#FF6600', bg: '#1A0000' },
  },
};

export const CREATURE_LIST = Object.values(CREATURES);

export function getCreature(id) {
  return CREATURES[id];
}

export function calcDamage(attacker, defender, move) {
  const typeBonus = TYPE_ADVANTAGES[move.type]?.includes(defender.type) ? 1.5
    : TYPE_ADVANTAGES[defender.type]?.includes(move.type) ? 0.67
    : 1.0;
  const levelMod = (2 * attacker.level / 5 + 2);
  const base = Math.floor((levelMod * move.power * attacker.stats.attack) / (defender.stats.defense * 50) + 2);
  const randomMod = 0.85 + Math.random() * 0.15;
  return Math.max(1, Math.round(base * typeBonus * randomMod));
}

export function getStatForLevel(baseStat, level) {
  return Math.floor(baseStat * (1 + (level - 1) * 0.08));
}

export function buildLiveMon(creatureData) {
  const base = CREATURES[creatureData.type];
  if (!base) return null;
  const level = creatureData.level || 1;
  return {
    ...creatureData,
    name: creatureData.nickname || base.name,
    type: base.type,
    moves: base.moves,
    colors: base.colors,
    rarity: base.rarity,
    stats: {
      hp:      getStatForLevel(base.baseStats.hp, level),
      attack:  getStatForLevel(base.baseStats.attack, level),
      defense: getStatForLevel(base.baseStats.defense, level),
      speed:   getStatForLevel(base.baseStats.speed, level),
    }
  };
}
