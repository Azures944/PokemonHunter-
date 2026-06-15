// WildBound Creatures Database
// All 12 original creatures with full stats, moves, and SVG art

window.TYPE_COLORS = {
  Flame:  '#FF6B35',
  Wave:   '#4ECDC4',
  Leaf:   '#52B788',
  Storm:  '#7B2D8B',
  Frost:  '#A8D8EA',
  Shadow: '#2D3561',
  Light:  '#FFD700',
  Stone:  '#8B6914',
  Wind:   '#B8E0FF',
  Cosmic: '#6C63FF'
};

// Type effectiveness chart: attacker -> [list of types it's super effective against]
window.TYPE_CHART = {
  Flame:  { beats: ['Leaf', 'Frost'],         resists: ['Wave', 'Stone'] },
  Wave:   { beats: ['Flame', 'Stone'],         resists: ['Leaf', 'Storm'] },
  Leaf:   { beats: ['Stone', 'Wave'],          resists: ['Flame', 'Frost'] },
  Storm:  { beats: ['Wave', 'Wind'],           resists: ['Leaf', 'Frost'] },
  Frost:  { beats: ['Leaf', 'Storm'],          resists: ['Flame', 'Stone'] },
  Shadow: { beats: ['Light', 'Cosmic'],        resists: ['Stone', 'Wind'] },
  Light:  { beats: ['Shadow', 'Stone'],        resists: ['Cosmic', 'Flame'] },
  Stone:  { beats: ['Flame', 'Wind'],          resists: ['Wave', 'Leaf'] },
  Wind:   { beats: ['Storm', 'Leaf'],          resists: ['Stone', 'Shadow'] },
  Cosmic: { beats: ['Flame','Wave','Leaf','Storm','Frost','Light','Stone','Wind'], resists: ['Shadow'] }
};

window.getTypeEffectiveness = function(attackType, defenseType) {
  if (attackType === 'Cosmic' && defenseType !== 'Shadow') return 2.0;
  if (defenseType === 'Cosmic' && attackType === 'Shadow') return 2.0;
  var chart = window.TYPE_CHART[attackType];
  if (!chart) return 1.0;
  if (chart.beats && chart.beats.indexOf(defenseType) !== -1) return 2.0;
  if (chart.resists && chart.resists.indexOf(defenseType) !== -1) return 0.5;
  return 1.0;
};

window.CREATURES = [
  {
    id: 1,
    name: 'Embrix',
    type: 'Flame',
    rarity: 'Common',
    hp: 80,
    maxHp: 80,
    attack: 65,
    defense: 45,
    speed: 70,
    catchRate: 0.75,
    color: '#FF6B35',
    glowColor: '#FF8C42',
    description: 'A fiery fox spirit whose tail blazes with ancestral flame energy.',
    moves: [
      { name: 'Ember Dash', power: 40, type: 'Flame', description: 'A quick flaming dash attack.' },
      { name: 'Fox Fire', power: 60, type: 'Flame', description: 'Hurls a spectral fox-fire orb.' },
      { name: 'Tail Swipe', power: 35, type: 'Flame', description: 'Scorching tail sweep attack.' },
      { name: 'Inferno Howl', power: 90, type: 'Flame', description: 'Releases a devastating fire roar.' }
    ],
    getSvg: function() {
      return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<radialGradient id="embrix-body" cx="50%" cy="60%" r="50%">' +
            '<stop offset="0%" stop-color="#FF8C42"/>' +
            '<stop offset="100%" stop-color="#CC3300"/>' +
          '</radialGradient>' +
          '<radialGradient id="embrix-belly" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#FFD0A0"/>' +
            '<stop offset="100%" stop-color="#FFB07A"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<!-- Tail -->' +
        '<ellipse cx="75" cy="72" rx="18" ry="10" fill="#FF6B35" transform="rotate(-30 75 72)"/>' +
        '<ellipse cx="80" cy="60" rx="8" ry="14" fill="#FF8C42" transform="rotate(-10 80 60)"/>' +
        '<ellipse cx="82" cy="48" rx="5" ry="8" fill="#FFD700" opacity="0.8"/>' +
        '<!-- Body -->' +
        '<ellipse cx="45" cy="68" rx="22" ry="18" fill="url(#embrix-body)"/>' +
        '<!-- Belly -->' +
        '<ellipse cx="45" cy="70" rx="12" ry="11" fill="url(#embrix-belly)"/>' +
        '<!-- Head -->' +
        '<circle cx="45" cy="42" r="20" fill="url(#embrix-body)"/>' +
        '<!-- Left Ear -->' +
        '<polygon points="28,28 22,8 36,22" fill="#FF6B35"/>' +
        '<polygon points="29,26 24,12 34,22" fill="#FF9966"/>' +
        '<!-- Right Ear -->' +
        '<polygon points="54,26 62,8 58,24" fill="#FF6B35"/>' +
        '<polygon points="54,25 60,12 57,23" fill="#FF9966"/>' +
        '<!-- Eyes -->' +
        '<circle cx="37" cy="40" r="7" fill="white"/>' +
        '<circle cx="37" cy="40" r="4" fill="#1a0a00"/>' +
        '<circle cx="38.5" cy="38.5" r="1.5" fill="white"/>' +
        '<circle cx="53" cy="40" r="7" fill="white"/>' +
        '<circle cx="53" cy="40" r="4" fill="#1a0a00"/>' +
        '<circle cx="54.5" cy="38.5" r="1.5" fill="white"/>' +
        '<!-- Nose -->' +
        '<ellipse cx="45" cy="48" rx="3" ry="2" fill="#CC3300"/>' +
        '<!-- Mouth -->' +
        '<path d="M41 51 Q45 55 49 51" stroke="#CC3300" stroke-width="1.5" fill="none"/>' +
        '<!-- Paws -->' +
        '<ellipse cx="32" cy="83" rx="7" ry="5" fill="#FF6B35"/>' +
        '<ellipse cx="58" cy="83" rx="7" ry="5" fill="#FF6B35"/>' +
        '<!-- Flame cheeks -->' +
        '<circle cx="31" cy="46" r="4" fill="#FF4500" opacity="0.5"/>' +
        '<circle cx="59" cy="46" r="4" fill="#FF4500" opacity="0.5"/>' +
      '</svg>';
    }
  },
  {
    id: 2,
    name: 'Aquiel',
    type: 'Wave',
    rarity: 'Common',
    hp: 75,
    maxHp: 75,
    attack: 55,
    defense: 60,
    speed: 50,
    catchRate: 0.75,
    color: '#4ECDC4',
    glowColor: '#7FEDE8',
    description: 'A luminous jellyfish spirit that drifts through tides of mystic energy.',
    moves: [
      { name: 'Tide Sting', power: 40, type: 'Wave', description: 'Electrified tentacle whip.' },
      { name: 'Bubble Burst', power: 55, type: 'Wave', description: 'Fires pressurized water bubbles.' },
      { name: 'Current Pulse', power: 70, type: 'Wave', description: 'Sends a shockwave through water.' },
      { name: 'Abyss Surge', power: 95, type: 'Wave', description: 'Unleashes a massive tidal surge.' }
    ],
    getSvg: function() {
      return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<radialGradient id="aquiel-body" cx="50%" cy="40%" r="60%">' +
            '<stop offset="0%" stop-color="#A0EEE8" stop-opacity="0.9"/>' +
            '<stop offset="100%" stop-color="#1AADA6" stop-opacity="0.85"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<!-- Tentacles -->' +
        '<path d="M30 68 Q25 80 28 95" stroke="#4ECDC4" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>' +
        '<path d="M38 70 Q33 83 35 98" stroke="#4ECDC4" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>' +
        '<path d="M50 72 Q50 86 50 100" stroke="#7FEDE8" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>' +
        '<path d="M62 70 Q67 83 65 98" stroke="#4ECDC4" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>' +
        '<path d="M70 68 Q75 80 72 95" stroke="#4ECDC4" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>' +
        '<!-- Inner glow tentacles -->' +
        '<path d="M43 71 Q40 85 42 99" stroke="#AAFFFA" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.5"/>' +
        '<path d="M57 71 Q60 85 58 99" stroke="#AAFFFA" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.5"/>' +
        '<!-- Bell/Body -->' +
        '<ellipse cx="50" cy="47" rx="28" ry="30" fill="url(#aquiel-body)" stroke="#4ECDC4" stroke-width="1.5" stroke-opacity="0.6"/>' +
        '<!-- Inner bell -->' +
        '<ellipse cx="50" cy="50" rx="18" ry="14" fill="#7FEDE8" opacity="0.3"/>' +
        '<!-- Eyes -->' +
        '<circle cx="40" cy="42" r="7" fill="white" opacity="0.95"/>' +
        '<circle cx="40" cy="42" r="4" fill="#006B66"/>' +
        '<circle cx="41.5" cy="40.5" r="1.5" fill="white"/>' +
        '<circle cx="60" cy="42" r="7" fill="white" opacity="0.95"/>' +
        '<circle cx="60" cy="42" r="4" fill="#006B66"/>' +
        '<circle cx="61.5" cy="40.5" r="1.5" fill="white"/>' +
        '<!-- Smile -->' +
        '<path d="M44 50 Q50 56 56 50" stroke="#006B66" stroke-width="1.5" fill="none" opacity="0.8"/>' +
        '<!-- Glow dots -->' +
        '<circle cx="35" cy="35" r="2" fill="#AAFFFA" opacity="0.6"/>' +
        '<circle cx="65" cy="35" r="2" fill="#AAFFFA" opacity="0.6"/>' +
        '<circle cx="50" cy="28" r="3" fill="#AAFFFA" opacity="0.5"/>' +
        '<!-- Top crown dots -->' +
        '<circle cx="42" cy="18" r="2.5" fill="#4ECDC4" opacity="0.7"/>' +
        '<circle cx="50" cy="14" r="3" fill="#4ECDC4" opacity="0.8"/>' +
        '<circle cx="58" cy="18" r="2.5" fill="#4ECDC4" opacity="0.7"/>' +
      '</svg>';
    }
  },
  {
    id: 3,
    name: 'Verdis',
    type: 'Leaf',
    rarity: 'Common',
    hp: 85,
    maxHp: 85,
    attack: 50,
    defense: 65,
    speed: 55,
    catchRate: 0.75,
    color: '#52B788',
    glowColor: '#74C99C',
    description: 'A gentle forest bunny that carries ancient woodland magic in its leafy fur.',
    moves: [
      { name: 'Leaf Hop', power: 35, type: 'Leaf', description: 'Bouncy leaf-powered tackle.' },
      { name: 'Vine Wrap', power: 55, type: 'Leaf', description: 'Entangles foe with magic vines.' },
      { name: 'Petal Storm', power: 70, type: 'Leaf', description: 'Summons a swirling petal storm.' },
      { name: 'Forest Bloom', power: 90, type: 'Leaf', description: 'Erupts in a explosion of life energy.' }
    ],
    getSvg: function() {
      return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<radialGradient id="verdis-body" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#74C99C"/>' +
            '<stop offset="100%" stop-color="#2D8B5E"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<!-- Long ears -->' +
        '<ellipse cx="33" cy="22" rx="7" ry="22" fill="#52B788" transform="rotate(-10 33 22)"/>' +
        '<ellipse cx="33" cy="22" rx="4" ry="17" fill="#A8E6C4" transform="rotate(-10 33 22)"/>' +
        '<ellipse cx="67" cy="22" rx="7" ry="22" fill="#52B788" transform="rotate(10 67 22)"/>' +
        '<ellipse cx="67" cy="22" rx="4" ry="17" fill="#A8E6C4" transform="rotate(10 67 22)"/>' +
        '<!-- Leaf decorations on ears -->' +
        '<path d="M29 14 Q25 8 33 5 Q34 12 29 14" fill="#3D9E6E"/>' +
        '<path d="M67 14 Q71 8 67 5 Q64 12 67 14" fill="#3D9E6E"/>' +
        '<!-- Body -->' +
        '<ellipse cx="50" cy="68" rx="22" ry="20" fill="url(#verdis-body)"/>' +
        '<!-- Belly -->' +
        '<ellipse cx="50" cy="70" rx="13" ry="12" fill="#C8F0DA"/>' +
        '<!-- Head -->' +
        '<circle cx="50" cy="46" r="20" fill="url(#verdis-body)"/>' +
        '<!-- Leaf patch on head -->' +
        '<path d="M45 30 Q50 20 55 30 Q50 35 45 30" fill="#3D9E6E" opacity="0.8"/>' +
        '<!-- Eyes -->' +
        '<circle cx="40" cy="44" r="7" fill="white"/>' +
        '<circle cx="40" cy="44" r="4.5" fill="#1A4A2E"/>' +
        '<circle cx="41.5" cy="42.5" r="1.5" fill="white"/>' +
        '<circle cx="60" cy="44" r="7" fill="white"/>' +
        '<circle cx="60" cy="44" r="4.5" fill="#1A4A2E"/>' +
        '<circle cx="61.5" cy="42.5" r="1.5" fill="white"/>' +
        '<!-- Blush -->' +
        '<circle cx="33" cy="50" r="4" fill="#FF9AAA" opacity="0.5"/>' +
        '<circle cx="67" cy="50" r="4" fill="#FF9AAA" opacity="0.5"/>' +
        '<!-- Nose -->' +
        '<ellipse cx="50" cy="52" rx="3" ry="2" fill="#FF8FAA"/>' +
        '<!-- Mouth -->' +
        '<path d="M46 55 Q50 59 54 55" stroke="#3D7055" stroke-width="1.5" fill="none"/>' +
        '<!-- Tiny leaf tail -->' +
        '<path d="M72 68 Q80 62 78 72 Q74 76 72 68" fill="#52B788"/>' +
        '<!-- Paws -->' +
        '<ellipse cx="34" cy="84" rx="8" ry="5" fill="#52B788"/>' +
        '<ellipse cx="66" cy="84" rx="8" ry="5" fill="#52B788"/>' +
      '</svg>';
    }
  },
  {
    id: 4,
    name: 'Zephon',
    type: 'Storm',
    rarity: 'Uncommon',
    hp: 90,
    maxHp: 90,
    attack: 80,
    defense: 55,
    speed: 75,
    catchRate: 0.45,
    color: '#7B2D8B',
    glowColor: '#A855C2',
    description: 'A fierce thunder wolf crackling with the raw energy of raging storms.',
    moves: [
      { name: 'Thunder Fang', power: 55, type: 'Storm', description: 'Bites with lightning-charged fangs.' },
      { name: 'Storm Howl', power: 65, type: 'Storm', description: 'A howl that summons storm clouds.' },
      { name: 'Volt Lunge', power: 75, type: 'Storm', description: 'Charges at foe with electric speed.' },
      { name: 'Tempest Roar', power: 100, type: 'Storm', description: 'Unleashes a devastating storm blast.' }
    ],
    getSvg: function() {
      return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<radialGradient id="zephon-body" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#9B4DB5"/>' +
            '<stop offset="100%" stop-color="#4A1560"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<!-- Lightning aura -->' +
        '<path d="M20 45 L25 35 L22 45 L28 40" stroke="#FFD700" stroke-width="2" fill="none" opacity="0.7"/>' +
        '<path d="M75 30 L78 20 L75 30 L82 25" stroke="#FFD700" stroke-width="2" fill="none" opacity="0.7"/>' +
        '<path d="M15 65 L18 55 L14 65 L20 60" stroke="#FFE44D" stroke-width="1.5" fill="none" opacity="0.6"/>' +
        '<!-- Tail with lightning -->' +
        '<path d="M72 72 Q85 60 88 50 Q83 55 85 45" stroke="#7B2D8B" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        '<path d="M72 72 Q85 60 88 50 Q83 55 85 45" stroke="#FFD700" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/>' +
        '<!-- Body -->' +
        '<ellipse cx="48" cy="67" rx="24" ry="18" fill="url(#zephon-body)"/>' +
        '<!-- Chest -->' +
        '<ellipse cx="48" cy="68" rx="12" ry="10" fill="#6B3080" opacity="0.5"/>' +
        '<!-- Head -->' +
        '<ellipse cx="47" cy="42" rx="22" ry="20" fill="url(#zephon-body)"/>' +
        '<!-- Wolf Ears -->' +
        '<polygon points="28,26 22,6 38,20" fill="#7B2D8B"/>' +
        '<polygon points="29,24 24,10 36,20" fill="#5A1A70"/>' +
        '<polygon points="58,24 62,6 68,22" fill="#7B2D8B"/>' +
        '<polygon points="58,23 62,10 66,21" fill="#5A1A70"/>' +
        '<!-- Mane lightning spikes -->' +
        '<path d="M30 32 L25 22 L32 30" fill="#FFD700" opacity="0.8"/>' +
        '<path d="M42 26 L40 15 L45 25" fill="#FFD700" opacity="0.8"/>' +
        '<path d="M56 26 L58 15 L60 25" fill="#FFD700" opacity="0.8"/>' +
        '<!-- Eyes (glowing) -->' +
        '<circle cx="37" cy="40" r="7" fill="white"/>' +
        '<circle cx="37" cy="40" r="4.5" fill="#FFD700"/>' +
        '<circle cx="37" cy="40" r="2" fill="#330050"/>' +
        '<circle cx="38" cy="38.5" r="1.2" fill="white"/>' +
        '<circle cx="57" cy="40" r="7" fill="white"/>' +
        '<circle cx="57" cy="40" r="4.5" fill="#FFD700"/>' +
        '<circle cx="57" cy="40" r="2" fill="#330050"/>' +
        '<circle cx="58" cy="38.5" r="1.2" fill="white"/>' +
        '<!-- Snout -->' +
        '<ellipse cx="47" cy="51" rx="10" ry="7" fill="#5A1A70"/>' +
        '<ellipse cx="47" cy="51" rx="4" ry="2.5" fill="#2A0040"/>' +
        '<!-- Fangs -->' +
        '<polygon points="42,55 40,62 44,60" fill="white"/>' +
        '<polygon points="52,55 50,62 54,60" fill="white"/>' +
        '<!-- Legs -->' +
        '<rect x="28" y="80" width="10" height="12" rx="4" fill="#5A1A70"/>' +
        '<rect x="62" y="80" width="10" height="12" rx="4" fill="#5A1A70"/>' +
      '</svg>';
    }
  },
  {
    id: 5,
    name: 'Glacis',
    type: 'Frost',
    rarity: 'Uncommon',
    hp: 80,
    maxHp: 80,
    attack: 70,
    defense: 60,
    speed: 80,
    catchRate: 0.45,
    color: '#A8D8EA',
    glowColor: '#D4EFF9',
    description: 'An ice phoenix that soars through frozen skies, leaving trails of crystal snowflakes.',
    moves: [
      { name: 'Ice Talon', power: 50, type: 'Frost', description: 'Slashes with frost-hardened talons.' },
      { name: 'Blizzard Wing', power: 65, type: 'Frost', description: 'Beats wings to unleash blizzard.' },
      { name: 'Crystal Shard', power: 75, type: 'Frost', description: 'Fires razor-sharp ice crystals.' },
      { name: 'Glacial Phoenix', power: 105, type: 'Frost', description: 'Dives in an icy phoenix form.' }
    ],
    getSvg: function() {
      return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<radialGradient id="glacis-body" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#E8F8FF"/>' +
            '<stop offset="100%" stop-color="#5FB8D8"/>' +
          '</radialGradient>' +
          '<linearGradient id="glacis-wing-l" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#D4EFF9" stop-opacity="0.9"/>' +
            '<stop offset="100%" stop-color="#7BC8E0" stop-opacity="0.7"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<!-- Wings -->' +
        '<path d="M50 50 Q20 30 5 15 Q15 35 25 55 Z" fill="url(#glacis-wing-l)" stroke="#A8D8EA" stroke-width="1"/>' +
        '<path d="M50 50 Q80 30 95 15 Q85 35 75 55 Z" fill="url(#glacis-wing-l)" stroke="#A8D8EA" stroke-width="1"/>' +
        '<!-- Wing feather tips -->' +
        '<path d="M8 18 Q12 25 10 30" stroke="#D4EFF9" stroke-width="2" fill="none"/>' +
        '<path d="M14 12 Q18 20 16 26" stroke="#D4EFF9" stroke-width="2" fill="none"/>' +
        '<path d="M91 18 Q88 25 90 30" stroke="#D4EFF9" stroke-width="2" fill="none"/>' +
        '<path d="M86 12 Q82 20 84 26" stroke="#D4EFF9" stroke-width="2" fill="none"/>' +
        '<!-- Tail feathers -->' +
        '<path d="M50 70 Q40 82 35 95" stroke="#A8D8EA" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path d="M50 70 Q50 85 50 98" stroke="#C8EEFF" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path d="M50 70 Q60 82 65 95" stroke="#A8D8EA" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<!-- Body -->' +
        '<ellipse cx="50" cy="60" rx="16" ry="18" fill="url(#glacis-body)"/>' +
        '<!-- Breast feathers -->' +
        '<ellipse cx="50" cy="62" rx="10" ry="12" fill="white" opacity="0.5"/>' +
        '<!-- Head -->' +
        '<circle cx="50" cy="38" r="17" fill="url(#glacis-body)"/>' +
        '<!-- Crest feathers -->' +
        '<path d="M50 22 Q45 10 43 5 Q48 15 50 22" fill="#7BC8E0"/>' +
        '<path d="M50 22 Q50 8 50 2 Q52 12 50 22" fill="#A8D8EA"/>' +
        '<path d="M50 22 Q55 10 57 5 Q52 15 50 22" fill="#7BC8E0"/>' +
        '<!-- Eyes -->' +
        '<circle cx="41" cy="37" r="6.5" fill="white"/>' +
        '<circle cx="41" cy="37" r="4" fill="#1A5F7A"/>' +
        '<circle cx="41" cy="37" r="2" fill="#0A2F3D"/>' +
        '<circle cx="42" cy="35.5" r="1.2" fill="white"/>' +
        '<circle cx="59" cy="37" r="6.5" fill="white"/>' +
        '<circle cx="59" cy="37" r="4" fill="#1A5F7A"/>' +
        '<circle cx="59" cy="37" r="2" fill="#0A2F3D"/>' +
        '<circle cx="60" cy="35.5" r="1.2" fill="white"/>' +
        '<!-- Beak -->' +
        '<path d="M46 44 L50 50 L54 44" fill="#7BC8E0"/>' +
        '<!-- Snowflake markings -->' +
        '<text x="43" y="30" font-size="6" fill="white" opacity="0.6">❄</text>' +
        '<text x="52" y="30" font-size="5" fill="white" opacity="0.5">❄</text>' +
        '<!-- Ice crystal legs -->' +
        '<path d="M44 78 L41 90 L44 87 L42 95" stroke="#7BC8E0" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path d="M56 78 L59 90 L56 87 L58 95" stroke="#7BC8E0" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '</svg>';
    }
  },
  {
    id: 6,
    name: 'Umbrix',
    type: 'Shadow',
    rarity: 'Uncommon',
    hp: 85,
    maxHp: 85,
    attack: 75,
    defense: 65,
    speed: 85,
    catchRate: 0.45,
    color: '#2D3561',
    glowColor: '#5060A8',
    description: 'A shadow panther that stalks between dimensions, never fully in this world.',
    moves: [
      { name: 'Shadow Slash', power: 55, type: 'Shadow', description: 'Strikes from the darkness.' },
      { name: 'Void Step', power: 40, type: 'Shadow', description: 'Teleports behind enemy to strike.' },
      { name: 'Dark Pulse', power: 75, type: 'Shadow', description: 'Emits a wave of dark energy.' },
      { name: 'Abyss Claw', power: 100, type: 'Shadow', description: 'Tears reality with shadow claws.' }
    ],
    getSvg: function() {
      return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<radialGradient id="umbrix-body" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#3D4878"/>' +
            '<stop offset="100%" stop-color="#12183A"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<!-- Shadow wisps -->' +
        '<ellipse cx="50" cy="85" rx="30" ry="8" fill="#1A1F45" opacity="0.6"/>' +
        '<path d="M20 70 Q10 60 15 50" stroke="#2D3561" stroke-width="4" fill="none" opacity="0.5"/>' +
        '<path d="M80 70 Q90 60 85 50" stroke="#2D3561" stroke-width="4" fill="none" opacity="0.5"/>' +
        '<!-- Tail -->' +
        '<path d="M68 70 Q82 60 86 48 Q80 52 82 44 Q78 50 80 40" stroke="#2D3561" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="80" cy="40" rx="4" ry="5" fill="#5060A8" opacity="0.6"/>' +
        '<!-- Body -->' +
        '<ellipse cx="48" cy="67" rx="24" ry="18" fill="url(#umbrix-body)"/>' +
        '<!-- Head -->' +
        '<ellipse cx="47" cy="43" rx="22" ry="20" fill="url(#umbrix-body)"/>' +
        '<!-- Cat Ears -->' +
        '<polygon points="28,26 23,8 38,22" fill="#2D3561"/>' +
        '<polygon points="30,25 26,12 36,22" fill="#5060A8" opacity="0.5"/>' +
        '<polygon points="60,24 62,8 70,22" fill="#2D3561"/>' +
        '<polygon points="61,24 63,12 68,22" fill="#5060A8" opacity="0.5"/>' +
        '<!-- Mystical markings -->' +
        '<path d="M32 50 Q35 55 32 60" stroke="#5060A8" stroke-width="1.5" fill="none" opacity="0.7"/>' +
        '<path d="M62 50 Q59 55 62 60" stroke="#5060A8" stroke-width="1.5" fill="none" opacity="0.7"/>' +
        '<!-- Eyes (glowing purple) -->' +
        '<circle cx="36" cy="41" r="7" fill="#1A1F45"/>' +
        '<circle cx="36" cy="41" r="5" fill="#7080CC"/>' +
        '<ellipse cx="36" cy="41" rx="2.5" ry="4" fill="#0A0E25"/>' +
        '<circle cx="36.8" cy="39" r="1.2" fill="white" opacity="0.8"/>' +
        '<circle cx="58" cy="41" r="7" fill="#1A1F45"/>' +
        '<circle cx="58" cy="41" r="5" fill="#7080CC"/>' +
        '<ellipse cx="58" cy="41" rx="2.5" ry="4" fill="#0A0E25"/>' +
        '<circle cx="58.8" cy="39" r="1.2" fill="white" opacity="0.8"/>' +
        '<!-- Snout -->' +
        '<ellipse cx="47" cy="52" rx="9" ry="6" fill="#1E2450"/>' +
        '<ellipse cx="47" cy="50" rx="3" ry="2" fill="#5060A8"/>' +
        '<!-- Whiskers -->' +
        '<line x1="25" y1="52" x2="38" y2="54" stroke="#5060A8" stroke-width="1" opacity="0.7"/>' +
        '<line x1="25" y1="55" x2="38" y2="56" stroke="#5060A8" stroke-width="1" opacity="0.7"/>' +
        '<line x1="56" y1="54" x2="69" y2="52" stroke="#5060A8" stroke-width="1" opacity="0.7"/>' +
        '<line x1="56" y1="56" x2="69" y2="55" stroke="#5060A8" stroke-width="1" opacity="0.7"/>' +
        '<!-- Paws -->' +
        '<ellipse cx="30" cy="82" rx="8" ry="5" fill="#2D3561"/>' +
        '<ellipse cx="65" cy="82" rx="8" ry="5" fill="#2D3561"/>' +
        '<!-- Claw marks -->' +
        '<line x1="27" y1="85" x2="25" y2="90" stroke="#5060A8" stroke-width="1.5" opacity="0.6"/>' +
        '<line x1="30" y1="86" x2="30" y2="91" stroke="#5060A8" stroke-width="1.5" opacity="0.6"/>' +
        '<line x1="33" y1="85" x2="35" y2="90" stroke="#5060A8" stroke-width="1.5" opacity="0.6"/>' +
      '</svg>';
    }
  },
  {
    id: 7,
    name: 'Lumira',
    type: 'Light',
    rarity: 'Rare',
    hp: 75,
    maxHp: 75,
    attack: 85,
    defense: 50,
    speed: 90,
    catchRate: 0.20,
    color: '#FFD700',
    glowColor: '#FFF176',
    description: 'A radiant crystal fairy whose wings scatter golden light across the land.',
    moves: [
      { name: 'Sparkle Shot', power: 50, type: 'Light', description: 'Fires focused beam of pure light.' },
      { name: 'Prism Dance', power: 65, type: 'Light', description: 'Rainbow light attack.' },
      { name: 'Solar Flare', power: 80, type: 'Light', description: 'Blinds and burns with solar energy.' },
      { name: 'Radiant Burst', power: 110, type: 'Light', description: 'Explodes in blinding golden light.' }
    ],
    getSvg: function() {
      return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<radialGradient id="lumira-body" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#FFF9C4"/>' +
            '<stop offset="100%" stop-color="#F9A825"/>' +
          '</radialGradient>' +
          '<radialGradient id="lumira-glow" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#FFD700" stop-opacity="0.4"/>' +
            '<stop offset="100%" stop-color="#FFD700" stop-opacity="0"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<!-- Light aura -->' +
        '<circle cx="50" cy="50" r="45" fill="url(#lumira-glow)"/>' +
        '<!-- Fairy wings (4 wings) -->' +
        '<path d="M50 52 Q28 38 18 20 Q32 30 42 48 Z" fill="#FFF9C4" stroke="#FFD700" stroke-width="0.5" opacity="0.8"/>' +
        '<path d="M50 52 Q22 52 12 40 Q30 44 42 54 Z" fill="#FFF176" stroke="#FFD700" stroke-width="0.5" opacity="0.7"/>' +
        '<path d="M50 52 Q72 38 82 20 Q68 30 58 48 Z" fill="#FFF9C4" stroke="#FFD700" stroke-width="0.5" opacity="0.8"/>' +
        '<path d="M50 52 Q78 52 88 40 Q70 44 58 54 Z" fill="#FFF176" stroke="#FFD700" stroke-width="0.5" opacity="0.7"/>' +
        '<!-- Wing sparkles -->' +
        '<circle cx="28" cy="28" r="2" fill="#FFD700" opacity="0.7"/>' +
        '<circle cx="22" cy="38" r="1.5" fill="#FFF176" opacity="0.8"/>' +
        '<circle cx="72" cy="28" r="2" fill="#FFD700" opacity="0.7"/>' +
        '<circle cx="78" cy="38" r="1.5" fill="#FFF176" opacity="0.8"/>' +
        '<!-- Dress/Body -->' +
        '<path d="M42 60 Q50 52 58 60 L60 78 Q50 82 40 78 Z" fill="url(#lumira-body)"/>' +
        '<!-- Crystal gems on dress -->' +
        '<polygon points="50,64 47,68 50,72 53,68" fill="#E8F4FD" opacity="0.8"/>' +
        '<!-- Head -->' +
        '<circle cx="50" cy="42" r="17" fill="url(#lumira-body)"/>' +
        '<!-- Crown -->' +
        '<polygon points="40,28 38,18 43,25 50,15 57,25 62,18 60,28" fill="#FFD700" stroke="#F9A825" stroke-width="0.5"/>' +
        '<!-- Crown gems -->' +
        '<circle cx="50" cy="18" r="2.5" fill="#E8F4FD"/>' +
        '<circle cx="42" cy="22" r="1.5" fill="#FFB7D5"/>' +
        '<circle cx="58" cy="22" r="1.5" fill="#B7E8FF"/>' +
        '<!-- Eyes -->' +
        '<circle cx="41" cy="41" r="6.5" fill="white"/>' +
        '<circle cx="41" cy="41" r="4" fill="#806000"/>' +
        '<circle cx="41" cy="41" r="2" fill="#FFC107"/>' +
        '<circle cx="42" cy="39.5" r="1.2" fill="white"/>' +
        '<circle cx="59" cy="41" r="6.5" fill="white"/>' +
        '<circle cx="59" cy="41" r="4" fill="#806000"/>' +
        '<circle cx="59" cy="41" r="2" fill="#FFC107"/>' +
        '<circle cx="60" cy="39.5" r="1.2" fill="white"/>' +
        '<!-- Blush -->' +
        '<circle cx="34" cy="46" r="4" fill="#FFB7D5" opacity="0.6"/>' +
        '<circle cx="66" cy="46" r="4" fill="#FFB7D5" opacity="0.6"/>' +
        '<!-- Mouth -->' +
        '<path d="M46 49 Q50 53 54 49" stroke="#F9A825" stroke-width="1.5" fill="none"/>' +
        '<!-- Hair -->' +
        '<path d="M33 35 Q30 25 38 28" stroke="#FFD700" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '<path d="M67 35 Q70 25 62 28" stroke="#FFD700" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '<!-- Wand/staff -->' +
        '<line x1="65" y1="60" x2="80" y2="80" stroke="#FFD700" stroke-width="2"/>' +
        '<polygon points="65,60 60,52 70,52" fill="#FFD700"/>' +
        '<circle cx="65" cy="54" r="4" fill="white" opacity="0.8"/>' +
      '</svg>';
    }
  },
  {
    id: 8,
    name: 'Terrox',
    type: 'Stone',
    rarity: 'Rare',
    hp: 120,
    maxHp: 120,
    attack: 75,
    defense: 100,
    speed: 25,
    catchRate: 0.20,
    color: '#8B6914',
    glowColor: '#C9A84C',
    description: 'An ancient earth golem born from the heart of mountains, slow but utterly unstoppable.',
    moves: [
      { name: 'Boulder Fist', power: 65, type: 'Stone', description: 'Smashes with massive stone fist.' },
      { name: 'Rock Slide', power: 70, type: 'Stone', description: 'Sends cascade of boulders.' },
      { name: 'Earth Tremor', power: 80, type: 'Stone', description: 'Shakes the ground violently.' },
      { name: 'Mountain Crush', power: 115, type: 'Stone', description: 'Drops an entire mountain\'s weight.' }
    ],
    getSvg: function() {
      return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<radialGradient id="terrox-body" cx="40%" cy="40%" r="60%">' +
            '<stop offset="0%" stop-color="#C9A84C"/>' +
            '<stop offset="100%" stop-color="#5C3D0A"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<!-- Ground cracks -->' +
        '<path d="M20 95 L30 85 L35 90 L45 82 L50 88 L60 80 L65 88 L75 82 L80 95" stroke="#5C3D0A" stroke-width="2" fill="none" opacity="0.4"/>' +
        '<!-- Arms -->' +
        '<rect x="8" y="42" width="18" height="28" rx="5" fill="url(#terrox-body)"/>' +
        '<rect x="74" y="42" width="18" height="28" rx="5" fill="url(#terrox-body)"/>' +
        '<!-- Stone fists -->' +
        '<rect x="5" y="67" width="22" height="16" rx="6" fill="#7A5518"/>' +
        '<rect x="73" y="67" width="22" height="16" rx="6" fill="#7A5518"/>' +
        '<!-- Body (massive) -->' +
        '<rect x="22" y="42" width="56" height="45" rx="8" fill="url(#terrox-body)"/>' +
        '<!-- Rock texture lines -->' +
        '<path d="M25 55 Q35 50 45 55 Q55 60 65 55 Q75 50 78 55" stroke="#5C3D0A" stroke-width="1.5" fill="none" opacity="0.4"/>' +
        '<path d="M28 65 Q38 62 50 65 Q62 68 72 65" stroke="#5C3D0A" stroke-width="1.5" fill="none" opacity="0.4"/>' +
        '<!-- Belly gem -->' +
        '<polygon points="50,60 44,68 50,76 56,68" fill="#C9A84C" stroke="#8B6914" stroke-width="1"/>' +
        '<polygon points="50,63 46,68 50,73 54,68" fill="#FFF3B0" opacity="0.6"/>' +
        '<!-- Head -->' +
        '<rect x="24" y="18" width="52" height="28" rx="10" fill="url(#terrox-body)"/>' +
        '<!-- Boulder bumps on head -->' +
        '<circle cx="33" cy="20" r="6" fill="#7A5518"/>' +
        '<circle cx="50" cy="16" r="7" fill="#6A4510"/>' +
        '<circle cx="67" cy="20" r="6" fill="#7A5518"/>' +
        '<!-- Eyes (glowing amber) -->' +
        '<rect x="30" y="25" width="14" height="10" rx="3" fill="#3D2508"/>' +
        '<rect x="32" y="27" width="10" height="6" rx="2" fill="#FF8C00"/>' +
        '<rect x="34" y="28" width="6" height="4" rx="1" fill="#FFD700"/>' +
        '<rect x="56" y="25" width="14" height="10" rx="3" fill="#3D2508"/>' +
        '<rect x="58" y="27" width="10" height="6" rx="2" fill="#FF8C00"/>' +
        '<rect x="60" y="28" width="6" height="4" rx="1" fill="#FFD700"/>' +
        '<!-- Nose -->' +
        '<rect x="46" y="38" width="8" height="5" rx="2" fill="#5C3D0A"/>' +
        '<!-- Mouth (grimace) -->' +
        '<rect x="35" y="43" width="30" height="5" rx="2" fill="#3D2508"/>' +
        '<line x1="40" y1="43" x2="40" y2="48" stroke="#8B6914" stroke-width="1.5"/>' +
        '<line x1="46" y1="43" x2="46" y2="48" stroke="#8B6914" stroke-width="1.5"/>' +
        '<line x1="54" y1="43" x2="54" y2="48" stroke="#8B6914" stroke-width="1.5"/>' +
        '<line x1="60" y1="43" x2="60" y2="48" stroke="#8B6914" stroke-width="1.5"/>' +
        '<!-- Legs -->' +
        '<rect x="28" y="85" width="18" height="12" rx="4" fill="#7A5518"/>' +
        '<rect x="54" y="85" width="18" height="12" rx="4" fill="#7A5518"/>' +
      '</svg>';
    }
  },
  {
    id: 9,
    name: 'Cyclosh',
    type: 'Wind',
    rarity: 'Rare',
    hp: 85,
    maxHp: 85,
    attack: 80,
    defense: 55,
    speed: 95,
    catchRate: 0.20,
    color: '#B8E0FF',
    glowColor: '#E0F4FF',
    description: 'A wind serpent dragon that weaves through storm clouds at impossible speeds.',
    moves: [
      { name: 'Gale Bite', power: 55, type: 'Wind', description: 'Bites with gale-force winds.' },
      { name: 'Tornado Spin', power: 70, type: 'Wind', description: 'Spins to create devastating tornado.' },
      { name: 'Sky Slash', power: 80, type: 'Wind', description: 'Cuts through the air at hyperspeed.' },
      { name: 'Hurricane Dive', power: 110, type: 'Wind', description: 'Dives from the sky like a hurricane.' }
    ],
    getSvg: function() {
      return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<linearGradient id="cyclosh-body" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#E0F4FF"/>' +
            '<stop offset="100%" stop-color="#6BAED6"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<!-- Serpent tail -->' +
        '<path d="M55 55 Q70 65 80 78 Q85 88 78 95 Q72 100 65 95 Q60 90 68 85 Q72 80 68 75 Q60 70 55 60" stroke="#B8E0FF" stroke-width="10" fill="none" stroke-linecap="round"/>' +
        '<path d="M55 55 Q70 65 80 78 Q85 88 78 95 Q72 100 65 95 Q60 90 68 85 Q72 80 68 75 Q60 70 55 60" stroke="#E0F4FF" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.5"/>' +
        '<!-- Wind swirls around body -->' +
        '<path d="M15 35 Q20 30 28 35 Q22 40 15 35" stroke="#B8E0FF" stroke-width="2" fill="#B8E0FF" opacity="0.4"/>' +
        '<path d="M10 50 Q18 44 26 50 Q18 56 10 50" stroke="#B8E0FF" stroke-width="2" fill="#B8E0FF" opacity="0.3"/>' +
        '<path d="M78 30 Q84 24 90 30 Q84 36 78 30" stroke="#B8E0FF" stroke-width="2" fill="#B8E0FF" opacity="0.4"/>' +
        '<!-- Wings -->' +
        '<path d="M38 42 Q20 28 8 18 Q22 30 35 46 Z" fill="#B8E0FF" opacity="0.7" stroke="#6BAED6" stroke-width="0.5"/>' +
        '<path d="M38 42 Q15 42 5 52 Q20 46 38 48 Z" fill="#D4EEFF" opacity="0.5"/>' +
        '<!-- Body -->' +
        '<ellipse cx="44" cy="52" rx="20" ry="15" fill="url(#cyclosh-body)"/>' +
        '<!-- Scale pattern -->' +
        '<path d="M30 48 Q37 44 44 48 Q51 44 58 48" stroke="#6BAED6" stroke-width="1" fill="none" opacity="0.5"/>' +
        '<path d="M28 54 Q36 50 44 54 Q52 50 60 54" stroke="#6BAED6" stroke-width="1" fill="none" opacity="0.5"/>' +
        '<!-- Belly scales -->' +
        '<ellipse cx="44" cy="53" rx="12" ry="9" fill="#E0F4FF" opacity="0.5"/>' +
        '<!-- Head -->' +
        '<ellipse cx="38" cy="32" rx="18" ry="16" fill="url(#cyclosh-body)"/>' +
        '<!-- Dragon horns -->' +
        '<path d="M30 20 Q25 8 28 5 Q30 12 32 20" fill="#6BAED6"/>' +
        '<path d="M45 18 Q44 6 47 3 Q48 11 46 18" fill="#6BAED6"/>' +
        '<!-- Eyes -->' +
        '<circle cx="30" cy="32" r="6.5" fill="white"/>' +
        '<circle cx="30" cy="32" r="4" fill="#1A4A7A"/>' +
        '<ellipse cx="30" cy="32" rx="1.5" ry="3" fill="#0A2040"/>' +
        '<circle cx="30.8" cy="30" r="1.2" fill="white"/>' +
        '<circle cx="46" cy="30" r="6.5" fill="white"/>' +
        '<circle cx="46" cy="30" r="4" fill="#1A4A7A"/>' +
        '<ellipse cx="46" cy="30" rx="1.5" ry="3" fill="#0A2040"/>' +
        '<circle cx="46.8" cy="28" r="1.2" fill="white"/>' +
        '<!-- Nostrils -->' +
        '<circle cx="34" cy="39" r="1.5" fill="#6BAED6"/>' +
        '<circle cx="42" cy="38" r="1.5" fill="#6BAED6"/>' +
        '<!-- Mouth -->' +
        '<path d="M26 40 Q38 46 50 40" stroke="#6BAED6" stroke-width="2" fill="none"/>' +
        '<!-- Fang -->' +
        '<polygon points="32,40 30,47 34,46" fill="white" opacity="0.8"/>' +
        '<!-- Wind aura dots -->' +
        '<circle cx="15" cy="25" r="2" fill="#B8E0FF" opacity="0.6"/>' +
        '<circle cx="85" cy="45" r="2.5" fill="#B8E0FF" opacity="0.5"/>' +
        '<circle cx="20" cy="70" r="1.5" fill="#B8E0FF" opacity="0.4"/>' +
      '</svg>';
    }
  },
  {
    id: 10,
    name: 'Stellix',
    type: 'Cosmic',
    rarity: 'Legendary',
    hp: 100,
    maxHp: 100,
    attack: 110,
    defense: 80,
    speed: 100,
    catchRate: 0.05,
    color: '#6C63FF',
    glowColor: '#A09AFF',
    description: 'A legendary star dragon born from the collision of galaxies, wielder of cosmic power.',
    moves: [
      { name: 'Stardust', power: 60, type: 'Cosmic', description: 'Showers foe with cosmic stardust.' },
      { name: 'Nebula Breath', power: 85, type: 'Cosmic', description: 'Breathes concentrated cosmic energy.' },
      { name: 'Galaxy Claw', power: 95, type: 'Cosmic', description: 'Tears through space with cosmic claws.' },
      { name: 'Big Bang', power: 130, type: 'Cosmic', description: 'Recreates the Big Bang at close range.' }
    ],
    getSvg: function() {
      return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<radialGradient id="stellix-body" cx="50%" cy="40%" r="60%">' +
            '<stop offset="0%" stop-color="#A09AFF"/>' +
            '<stop offset="50%" stop-color="#6C63FF"/>' +
            '<stop offset="100%" stop-color="#2A2080"/>' +
          '</radialGradient>' +
          '<radialGradient id="stellix-glow" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#6C63FF" stop-opacity="0.5"/>' +
            '<stop offset="100%" stop-color="#6C63FF" stop-opacity="0"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<!-- Cosmic aura -->' +
        '<circle cx="50" cy="50" r="48" fill="url(#stellix-glow)"/>' +
        '<!-- Stars in background -->' +
        '<circle cx="12" cy="15" r="1.5" fill="white" opacity="0.8"/>' +
        '<circle cx="88" cy="12" r="1" fill="white" opacity="0.7"/>' +
        '<circle cx="92" cy="70" r="1.5" fill="white" opacity="0.6"/>' +
        '<circle cx="8" cy="75" r="1" fill="white" opacity="0.7"/>' +
        '<circle cx="20" cy="90" r="1.5" fill="#A09AFF" opacity="0.6"/>' +
        '<circle cx="80" cy="88" r="1" fill="#A09AFF" opacity="0.7"/>' +
        '<circle cx="85" cy="30" r="1" fill="white" opacity="0.5"/>' +
        '<circle cx="15" cy="45" r="1.5" fill="white" opacity="0.5"/>' +
        '<!-- Dragon wings (massive) -->' +
        '<path d="M45 48 Q15 25 5 5 Q20 22 35 42 Z" fill="#6C63FF" stroke="#A09AFF" stroke-width="0.5" opacity="0.85"/>' +
        '<path d="M45 48 Q5 45 2 60 Q18 50 40 52 Z" fill="#8B83FF" opacity="0.6"/>' +
        '<path d="M55 48 Q85 25 95 5 Q80 22 65 42 Z" fill="#6C63FF" stroke="#A09AFF" stroke-width="0.5" opacity="0.85"/>' +
        '<path d="M55 48 Q95 45 98 60 Q82 50 60 52 Z" fill="#8B83FF" opacity="0.6"/>' +
        '<!-- Wing star patterns -->' +
        '<circle cx="22" cy="22" r="2" fill="white" opacity="0.7"/>' +
        '<circle cx="14" cy="35" r="1.5" fill="#FFF176" opacity="0.6"/>' +
        '<circle cx="78" cy="22" r="2" fill="white" opacity="0.7"/>' +
        '<circle cx="86" cy="35" r="1.5" fill="#FFF176" opacity="0.6"/>' +
        '<!-- Dragon tail -->' +
        '<path d="M60 65 Q75 72 82 85 Q85 95 78 98" stroke="#6C63FF" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        '<path d="M60 65 Q75 72 82 85 Q85 95 78 98" stroke="#A09AFF" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.5"/>' +
        '<!-- Tail star tip -->' +
        '<polygon points="78,98 74,105 82,105" fill="#FFF176" opacity="0.8"/>' +
        '<!-- Body -->' +
        '<ellipse cx="50" cy="60" rx="20" ry="17" fill="url(#stellix-body)"/>' +
        '<!-- Cosmic belly -->' +
        '<ellipse cx="50" cy="62" rx="12" ry="10" fill="#2A2080" opacity="0.5"/>' +
        '<circle cx="50" cy="62" r="5" fill="#FFF176" opacity="0.2"/>' +
        '<!-- Head -->' +
        '<ellipse cx="50" cy="38" rx="20" ry="18" fill="url(#stellix-body)"/>' +
        '<!-- Dragon horns (cosmic) -->' +
        '<path d="M37 24 Q32 10 34 5 Q37 14 39 24" fill="#A09AFF" stroke="#6C63FF" stroke-width="0.5"/>' +
        '<path d="M63 24 Q68 10 66 5 Q63 14 61 24" fill="#A09AFF" stroke="#6C63FF" stroke-width="0.5"/>' +
        '<!-- Horn glow -->' +
        '<circle cx="34" cy="6" r="3" fill="#FFF176" opacity="0.6"/>' +
        '<circle cx="66" cy="6" r="3" fill="#FFF176" opacity="0.6"/>' +
        '<!-- Small horns -->' +
        '<path d="M43 22 Q41 14 43 11 Q45 17 44 22" fill="#8B83FF"/>' +
        '<path d="M57 22 Q59 14 57 11 Q55 17 56 22" fill="#8B83FF"/>' +
        '<!-- Eyes (cosmic purple, glowing) -->' +
        '<circle cx="40" cy="37" r="8" fill="#1A1050"/>' +
        '<circle cx="40" cy="37" r="6" fill="#6C63FF"/>' +
        '<circle cx="40" cy="37" r="3" fill="#A09AFF"/>' +
        '<circle cx="40" cy="37" r="1" fill="white"/>' +
        '<circle cx="41.5" cy="35" r="1.5" fill="white" opacity="0.9"/>' +
        '<circle cx="60" cy="37" r="8" fill="#1A1050"/>' +
        '<circle cx="60" cy="37" r="6" fill="#6C63FF"/>' +
        '<circle cx="60" cy="37" r="3" fill="#A09AFF"/>' +
        '<circle cx="60" cy="37" r="1" fill="white"/>' +
        '<circle cx="61.5" cy="35" r="1.5" fill="white" opacity="0.9"/>' +
        '<!-- Snout -->' +
        '<ellipse cx="50" cy="47" rx="11" ry="8" fill="#3A2FA0"/>' +
        '<ellipse cx="50" cy="46" rx="5" ry="3" fill="#2A2080"/>' +
        '<!-- Cosmic mouth -->' +
        '<path d="M40 52 Q50 58 60 52" stroke="#A09AFF" stroke-width="1.5" fill="none"/>' +
        '<!-- Fangs -->' +
        '<polygon points="44,52 42,59 46,57" fill="white" opacity="0.8"/>' +
        '<polygon points="56,52 54,59 58,57" fill="white" opacity="0.8"/>' +
        '<!-- Galaxy markings -->' +
        '<path d="M30 48 Q35 44 40 48" stroke="#FFF176" stroke-width="1" fill="none" opacity="0.5"/>' +
        '<path d="M60 48 Q65 44 70 48" stroke="#FFF176" stroke-width="1" fill="none" opacity="0.5"/>' +
        '<!-- Cosmic legs -->' +
        '<rect x="36" y="74" width="11" height="14" rx="4" fill="#3A2FA0"/>' +
        '<rect x="53" y="74" width="11" height="14" rx="4" fill="#3A2FA0"/>' +
        '<!-- Claws -->' +
        '<path d="M37 88 L35 95 M41 88 L39 95 M45 88 L44 95" stroke="#A09AFF" stroke-width="1.5" fill="none"/>' +
        '<path d="M54 88 L52 95 M58 88 L56 95 M62 88 L61 95" stroke="#A09AFF" stroke-width="1.5" fill="none"/>' +
      '</svg>';
    }
  },
  {
    id: 11,
    name: 'Pyrix',
    type: 'Flame',
    rarity: 'Uncommon',
    hp: 82,
    maxHp: 82,
    attack: 78,
    defense: 50,
    speed: 68,
    catchRate: 0.45,
    color: '#C0392B',
    glowColor: '#E74C3C',
    description: 'A lava lizard whose scales glow with molten rock from deep within the earth.',
    moves: [
      { name: 'Magma Bite', power: 55, type: 'Flame', description: 'Bites with lava-hot jaws.' },
      { name: 'Lava Spit', power: 65, type: 'Flame', description: 'Spits a glob of molten rock.' },
      { name: 'Fire Scale', power: 75, type: 'Flame', description: 'Launches razor-hot scales.' },
      { name: 'Eruption', power: 105, type: 'Flame', description: 'Triggers a mini volcanic eruption.' }
    ],
    getSvg: function() {
      return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<radialGradient id="pyrix-body" cx="40%" cy="40%" r="60%">' +
            '<stop offset="0%" stop-color="#E74C3C"/>' +
            '<stop offset="100%" stop-color="#7B1010"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<!-- Lava cracks on ground -->' +
        '<path d="M15 92 Q30 85 50 90 Q70 85 85 92" stroke="#FF6B35" stroke-width="1.5" fill="none" opacity="0.3"/>' +
        '<!-- Tail -->' +
        '<path d="M65 72 Q80 70 88 60 Q92 50 85 45 Q80 50 82 42" stroke="#C0392B" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        '<path d="M65 72 Q80 70 88 60 Q92 50 85 45 Q80 50 82 42" stroke="#FF6B35" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.4"/>' +
        '<!-- Tail tip flame -->' +
        '<path d="M82 42 Q78 34 80 28 Q84 35 86 42 Q82 36 82 42" fill="#FF6B35" opacity="0.8"/>' +
        '<!-- Body -->' +
        '<ellipse cx="46" cy="66" rx="24" ry="18" fill="url(#pyrix-body)"/>' +
        '<!-- Belly (lighter, lava-glowing) -->' +
        '<ellipse cx="46" cy="68" rx="14" ry="11" fill="#FF8C00" opacity="0.4"/>' +
        '<!-- Scale ridge on back -->' +
        '<path d="M28 52 Q35 46 42 52 Q49 46 56 52 Q63 46 70 52" stroke="#7B1010" stroke-width="2" fill="#A31515" opacity="0.7"/>' +
        '<!-- Head -->' +
        '<ellipse cx="44" cy="44" rx="20" ry="17" fill="url(#pyrix-body)"/>' +
        '<!-- Lizard frills -->' +
        '<path d="M25 35 Q18 25 20 18 Q24 27 28 35" fill="#C0392B" stroke="#7B1010" stroke-width="0.5"/>' +
        '<path d="M25 40 Q15 35 16 26 Q22 34 27 40" fill="#A31515" opacity="0.7"/>' +
        '<!-- Head spikes -->' +
        '<polygon points="38,30 35,18 42,28" fill="#7B1010"/>' +
        '<polygon points="46,27 44,14 50,26" fill="#7B1010"/>' +
        '<polygon points="54,30 54,17 58,28" fill="#7B1010"/>' +
        '<!-- Eyes (slit lizard eyes) -->' +
        '<circle cx="35" cy="42" r="6.5" fill="#1A0808"/>' +
        '<circle cx="35" cy="42" r="4.5" fill="#CC2200"/>' +
        '<ellipse cx="35" cy="42" rx="1.5" ry="4" fill="#0A0000"/>' +
        '<circle cx="35.5" cy="40" r="1.2" fill="#FF6644" opacity="0.7"/>' +
        '<circle cx="53" cy="42" r="6.5" fill="#1A0808"/>' +
        '<circle cx="53" cy="42" r="4.5" fill="#CC2200"/>' +
        '<ellipse cx="53" cy="42" rx="1.5" ry="4" fill="#0A0000"/>' +
        '<circle cx="53.5" cy="40" r="1.2" fill="#FF6644" opacity="0.7"/>' +
        '<!-- Snout -->' +
        '<ellipse cx="44" cy="51" rx="11" ry="7" fill="#8B0A0A"/>' +
        '<ellipse cx="44" cy="50" rx="5" ry="2.5" fill="#5C0808"/>' +
        '<!-- Lava teeth -->' +
        '<polygon points="38,54 36,61 40,59" fill="#FF8C00" opacity="0.8"/>' +
        '<polygon points="44,55 42,63 46,61" fill="#FF8C00" opacity="0.8"/>' +
        '<polygon points="50,54 48,61 52,59" fill="#FF8C00" opacity="0.8"/>' +
        '<!-- Nostrils -->' +
        '<circle cx="40" cy="49" r="1.5" fill="#5C0808"/>' +
        '<circle cx="48" cy="49" r="1.5" fill="#5C0808"/>' +
        '<!-- Legs -->' +
        '<rect x="24" y="78" width="12" height="14" rx="3" fill="#A31515"/>' +
        '<rect x="60" y="78" width="12" height="14" rx="3" fill="#A31515"/>' +
        '<!-- Claws -->' +
        '<path d="M25 92 L22 98 M29 92 L27 98 M33 92 L32 98" stroke="#7B1010" stroke-width="2" fill="none"/>' +
        '<path d="M61 92 L59 98 M65 92 L64 98 M69 92 L68 98" stroke="#7B1010" stroke-width="2" fill="none"/>' +
        '<!-- Glowing cracks on body -->' +
        '<path d="M38 60 Q42 57 46 60" stroke="#FF6B35" stroke-width="1.5" fill="none" opacity="0.5"/>' +
        '<path d="M50 63 Q54 60 58 63" stroke="#FF8C00" stroke-width="1.5" fill="none" opacity="0.4"/>' +
      '</svg>';
    }
  },
  {
    id: 12,
    name: 'Coralix',
    type: 'Wave',
    rarity: 'Common',
    hp: 70,
    maxHp: 70,
    attack: 60,
    defense: 55,
    speed: 65,
    catchRate: 0.75,
    color: '#FF6B9D',
    glowColor: '#FF9DBF',
    description: 'A cheerful coral reef fish that dances through warm tropical waters.',
    moves: [
      { name: 'Coral Dash', power: 40, type: 'Wave', description: 'Zips through water at high speed.' },
      { name: 'Bubble Beam', power: 55, type: 'Wave', description: 'Fires rapid bubble projectiles.' },
      { name: 'Reef Dance', power: 65, type: 'Wave', description: 'A dazzling spinning water attack.' },
      { name: 'Ocean Surge', power: 85, type: 'Wave', description: 'Calls a surge of tropical waters.' }
    ],
    getSvg: function() {
      return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<radialGradient id="coralix-body" cx="45%" cy="45%" r="55%">' +
            '<stop offset="0%" stop-color="#FF9DBF"/>' +
            '<stop offset="100%" stop-color="#D63077"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<!-- Bubbles -->' +
        '<circle cx="20" cy="25" r="4" fill="none" stroke="#4ECDC4" stroke-width="1.5" opacity="0.5"/>' +
        '<circle cx="75" cy="20" r="3" fill="none" stroke="#4ECDC4" stroke-width="1.5" opacity="0.4"/>' +
        '<circle cx="85" cy="40" r="2.5" fill="none" stroke="#4ECDC4" stroke-width="1" opacity="0.5"/>' +
        '<circle cx="14" cy="60" r="3.5" fill="none" stroke="#4ECDC4" stroke-width="1.5" opacity="0.3"/>' +
        '<!-- Tail fin -->' +
        '<path d="M68 55 Q82 42 90 35 Q85 50 90 60 Q82 58 78 65 Q72 68 68 60 Z" fill="#D63077"/>' +
        '<path d="M68 55 Q82 42 90 35 Q85 50 90 60 Q82 58 78 65 Q72 68 68 60 Z" fill="#FF9DBF" opacity="0.3"/>' +
        '<!-- Body -->' +
        '<ellipse cx="45" cy="55" rx="28" ry="22" fill="url(#coralix-body)"/>' +
        '<!-- Stripe pattern -->' +
        '<path d="M32 40 Q35 55 32 70" stroke="#D63077" stroke-width="3" fill="none" opacity="0.4"/>' +
        '<path d="M42 37 Q45 55 42 73" stroke="#FF6B9D" stroke-width="2" fill="none" opacity="0.3"/>' +
        '<path d="M55 40 Q58 55 55 70" stroke="#D63077" stroke-width="3" fill="none" opacity="0.4"/>' +
        '<!-- Belly -->' +
        '<ellipse cx="45" cy="57" rx="18" ry="13" fill="#FFD0E4" opacity="0.4"/>' +
        '<!-- Dorsal fin -->' +
        '<path d="M30 38 Q38 20 50 35 Q55 25 62 38" stroke="#D63077" stroke-width="2" fill="#FF9DBF" opacity="0.8"/>' +
        '<!-- Pectoral fins -->' +
        '<path d="M18 52 Q10 42 16 35 Q22 44 24 55 Z" fill="#D63077" opacity="0.7"/>' +
        '<path d="M18 60 Q8 65 12 75 Q20 68 25 62 Z" fill="#FF9DBF" opacity="0.6"/>' +
        '<!-- Head / face area -->' +
        '<circle cx="35" cy="50" r="16" fill="url(#coralix-body)"/>' +
        '<!-- Eyes -->' +
        '<circle cx="28" cy="47" r="7" fill="white"/>' +
        '<circle cx="28" cy="47" r="5" fill="#1A0A15"/>' +
        '<circle cx="28" cy="47" r="2.5" fill="#D63077"/>' +
        '<circle cx="29" cy="45.5" r="1.5" fill="white"/>' +
        '<!-- Blush -->' +
        '<circle cx="22" cy="52" r="4" fill="#FF6B9D" opacity="0.4"/>' +
        '<!-- Mouth -->' +
        '<path d="M30 55 Q36 60 40 55" stroke="#D63077" stroke-width="1.5" fill="none"/>' +
        '<!-- Lips pucker -->' +
        '<ellipse cx="35" cy="58" rx="5" ry="2.5" fill="#FF9DBF" opacity="0.4"/>' +
        '<!-- Coral decorations -->' +
        '<circle cx="60" cy="44" r="3" fill="#FF6B35" opacity="0.5"/>' +
        '<circle cx="63" cy="38" r="2" fill="#FF6B35" opacity="0.5"/>' +
        '<circle cx="65" cy="50" r="2.5" fill="#FFD700" opacity="0.4"/>' +
        '<!-- Sparkle dots -->' +
        '<circle cx="50" cy="35" r="1.5" fill="white" opacity="0.6"/>' +
        '<circle cx="55" cy="32" r="1" fill="white" opacity="0.5"/>' +
      '</svg>';
    }
  }
];
