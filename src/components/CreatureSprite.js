import React from 'react';
import Svg, { Circle, Ellipse, Polygon, Path, Rect, Line, G } from 'react-native-svg';

// Each creature is drawn in a 120×120 viewBox.
// Colors receive the creature's palette for tinting.

function Flambit({ c }) {
  return (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      {/* Body */}
      <Ellipse cx="60" cy="78" rx="30" ry="22" fill={c.primary} />
      {/* Head */}
      <Circle cx="60" cy="48" r="26" fill={c.primary} />
      {/* Ears */}
      <Polygon points="40,28 32,8 52,22" fill={c.secondary} />
      <Polygon points="80,28 88,8 68,22" fill={c.secondary} />
      <Polygon points="41,26 35,13 50,22" fill="#FFB3A0" />
      <Polygon points="79,26 85,13 70,22" fill="#FFB3A0" />
      {/* Eyes */}
      <Circle cx="51" cy="46" r="7" fill="#FFE066" />
      <Circle cx="69" cy="46" r="7" fill="#FFE066" />
      <Circle cx="52" cy="45" r="3.5" fill="#1A0500" />
      <Circle cx="70" cy="45" r="3.5" fill="#1A0500" />
      <Circle cx="53" cy="44" r="1" fill="#fff" />
      <Circle cx="71" cy="44" r="1" fill="#fff" />
      {/* Nose */}
      <Circle cx="60" cy="55" r="3.5" fill="#CC2200" />
      {/* Mouth */}
      <Path d="M54,60 Q60,65 66,60" stroke="#CC2200" strokeWidth="1.5" fill="none" />
      {/* Tail flame */}
      <Path d="M88,85 Q108,60 96,38 Q90,55 92,48 Q84,68 88,85" fill={c.secondary} />
      <Path d="M88,85 Q102,68 95,50 Q90,62 91,55 Q87,70 88,85" fill={c.accent} opacity="0.7" />
      {/* Legs */}
      <Ellipse cx="44" cy="96" rx="10" ry="7" fill={c.secondary} />
      <Ellipse cx="76" cy="96" rx="10" ry="7" fill={c.secondary} />
    </Svg>
  );
}

function Aquora({ c }) {
  return (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      {/* Bell */}
      <Ellipse cx="60" cy="50" rx="34" ry="28" fill={c.primary} opacity="0.9" />
      <Ellipse cx="60" cy="46" rx="26" ry="20" fill={c.secondary} opacity="0.5" />
      {/* Inner glow */}
      <Circle cx="60" cy="44" r="14" fill={c.accent} opacity="0.25" />
      {/* Eyes */}
      <Circle cx="51" cy="48" r="8" fill="#E0F7FF" />
      <Circle cx="69" cy="48" r="8" fill="#E0F7FF" />
      <Circle cx="51" cy="48" r="4.5" fill="#005F7F" />
      <Circle cx="69" cy="48" r="4.5" fill="#005F7F" />
      <Circle cx="52.5" cy="46.5" r="1.5" fill="#fff" />
      <Circle cx="70.5" cy="46.5" r="1.5" fill="#fff" />
      {/* Tentacles */}
      <Path d="M34,70 Q28,85 35,98 Q32,84 38,75" fill={c.primary} />
      <Path d="M46,72 Q40,90 48,105 Q44,90 52,78" fill={c.primary} />
      <Path d="M60,74 Q60,95 60,110 Q56,94 64,94 Q60,110 60,74" fill={c.primary} />
      <Path d="M74,72 Q80,90 72,105 Q76,90 68,78" fill={c.primary} />
      <Path d="M86,70 Q92,85 85,98 Q88,84 82,75" fill={c.primary} />
      {/* Bubbles */}
      <Circle cx="25" cy="55" r="4" fill={c.accent} opacity="0.5" />
      <Circle cx="95" cy="45" r="3" fill={c.accent} opacity="0.4" />
      <Circle cx="20" cy="38" r="2.5" fill={c.accent} opacity="0.35" />
    </Svg>
  );
}

function Terrox({ c }) {
  return (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      {/* Body - boxy */}
      <Rect x="24" y="58" width="72" height="48" rx="8" fill={c.primary} />
      {/* Head */}
      <Rect x="22" y="28" width="76" height="42" rx="10" fill={c.primary} />
      {/* Rock cracks */}
      <Path d="M38,42 L44,55 L40,58" stroke={c.secondary} strokeWidth="2" fill="none" />
      <Path d="M72,38 L78,50 L74,58" stroke={c.secondary} strokeWidth="2" fill="none" />
      <Path d="M50,62 L58,78 L54,88" stroke={c.secondary} strokeWidth="2" fill="none" />
      {/* Eyes - deep set */}
      <Rect x="30" y="35" width="22" height="16" rx="4" fill="#1A0D00" />
      <Rect x="68" y="35" width="22" height="16" rx="4" fill="#1A0D00" />
      <Circle cx="41" cy="43" r="6" fill={c.accent} />
      <Circle cx="79" cy="43" r="6" fill={c.accent} />
      <Circle cx="41" cy="43" r="3" fill="#1A0500" />
      <Circle cx="79" cy="43" r="3" fill="#1A0500" />
      {/* Snout */}
      <Rect x="44" y="55" width="32" height="16" rx="6" fill={c.secondary} />
      <Circle cx="54" cy="63" r="4" fill="#1A0D00" />
      <Circle cx="66" cy="63" r="4" fill="#1A0D00" />
      {/* Legs */}
      <Rect x="28" y="100" width="24" height="16" rx="6" fill={c.secondary} />
      <Rect x="68" y="100" width="24" height="16" rx="6" fill={c.secondary} />
    </Svg>
  );
}

function Zephlyn({ c }) {
  return (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      {/* Wings */}
      <Path d="M60,55 Q20,30 8,55 Q20,65 60,70" fill={c.primary} opacity="0.8" />
      <Path d="M60,55 Q100,30 112,55 Q100,65 60,70" fill={c.primary} opacity="0.8" />
      <Path d="M60,58 Q28,40 16,58 Q28,64 60,68" fill={c.accent} opacity="0.5" />
      <Path d="M60,58 Q92,40 104,58 Q92,64 60,68" fill={c.accent} opacity="0.5" />
      {/* Body */}
      <Ellipse cx="60" cy="65" rx="18" ry="22" fill={c.primary} />
      {/* Head */}
      <Circle cx="60" cy="40" r="20" fill={c.primary} />
      {/* Beak */}
      <Polygon points="60,54 54,62 66,62" fill={c.accent} />
      {/* Eyes */}
      <Circle cx="50" cy="38" r="7" fill="#E8F4FF" />
      <Circle cx="70" cy="38" r="7" fill="#E8F4FF" />
      <Circle cx="50" cy="38" r="4" fill="#003366" />
      <Circle cx="70" cy="38" r="4" fill="#003366" />
      <Circle cx="51" cy="37" r="1.5" fill="#fff" />
      <Circle cx="71" cy="37" r="1.5" fill="#fff" />
      {/* Crest */}
      <Path d="M55,22 Q60,10 65,22" stroke={c.secondary} strokeWidth="2.5" fill="none" />
      <Path d="M50,25 Q55,14 58,25" stroke={c.secondary} strokeWidth="2" fill="none" />
      {/* Tail feathers */}
      <Path d="M52,84 Q48,100 44,112" stroke={c.secondary} strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M60,86 Q60,104 60,116" stroke={c.primary} strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M68,84 Q72,100 76,112" stroke={c.secondary} strokeWidth="3" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function Voltix({ c }) {
  return (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      {/* Body - spiky */}
      <Circle cx="60" cy="68" r="26" fill={c.primary} />
      <Circle cx="60" cy="45" r="22" fill={c.primary} />
      {/* Spikes */}
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle, i) => (
        <Path
          key={i}
          d={`M${60 + 24 * Math.cos((angle * Math.PI) / 180)},${68 + 24 * Math.sin((angle * Math.PI) / 180)} L${60 + 38 * Math.cos(((angle + 5) * Math.PI) / 180)},${68 + 38 * Math.sin(((angle + 5) * Math.PI) / 180)} L${60 + 24 * Math.cos(((angle + 10) * Math.PI) / 180)},${68 + 24 * Math.sin(((angle + 10) * Math.PI) / 180)}`}
          fill={c.secondary}
        />
      ))}
      {/* Lightning cheeks */}
      <Polygon points="44,50 38,60 50,55" fill="#FF6600" opacity="0.9" />
      <Polygon points="76,50 82,60 70,55" fill="#FF6600" opacity="0.9" />
      {/* Eyes */}
      <Circle cx="51" cy="42" r="7" fill="#1A0A00" />
      <Circle cx="69" cy="42" r="7" fill="#1A0A00" />
      <Circle cx="51" cy="42" r="4" fill={c.accent} />
      <Circle cx="69" cy="42" r="4" fill={c.accent} />
      <Circle cx="52" cy="41" r="1.5" fill="#fff" />
      <Circle cx="70" cy="41" r="1.5" fill="#fff" />
      {/* Nose */}
      <Circle cx="60" cy="50" r="3" fill="#CC6600" />
      {/* Tail - lightning bolt */}
      <Path d="M82,60 L96,48 L88,56 L100,42 L86,58" stroke={c.secondary} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Ears */}
      <Polygon points="45,28 38,12 54,26" fill={c.primary} />
      <Polygon points="75,28 82,12 66,26" fill={c.primary} />
      <Polygon points="46,26 41,16 52,25" fill="#CC6600" />
      <Polygon points="74,26 79,16 68,25" fill="#CC6600" />
    </Svg>
  );
}

function Frostara({ c }) {
  return (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      {/* Body */}
      <Circle cx="60" cy="72" r="30" fill={c.primary} />
      {/* Head */}
      <Circle cx="60" cy="42" r="28" fill={c.primary} />
      {/* Ears - round */}
      <Circle cx="40" cy="20" r="12" fill={c.primary} />
      <Circle cx="80" cy="20" r="12" fill={c.primary} />
      <Circle cx="40" cy="20" r="7" fill={c.secondary} />
      <Circle cx="80" cy="20" r="7" fill={c.secondary} />
      {/* Fluffy chest */}
      <Circle cx="60" cy="78" r="16" fill="#FAFEFF" opacity="0.6" />
      {/* Ice crystal horns */}
      <Path d="M48,14 L44,2 L50,12" fill={c.accent} opacity="0.85" />
      <Path d="M72,14 L76,2 L70,12" fill={c.accent} opacity="0.85" />
      <Path d="M44,12 L40,2 L47,11" fill={c.secondary} opacity="0.7" />
      <Path d="M76,12 L80,2 L73,11" fill={c.secondary} opacity="0.7" />
      {/* Eyes */}
      <Circle cx="50" cy="42" r="8" fill="#D0EEFF" />
      <Circle cx="70" cy="42" r="8" fill="#D0EEFF" />
      <Circle cx="50" cy="42" r="5" fill="#6B2FA0" />
      <Circle cx="70" cy="42" r="5" fill="#6B2FA0" />
      <Circle cx="51.5" cy="40.5" r="2" fill="#fff" />
      <Circle cx="71.5" cy="40.5" r="2" fill="#fff" />
      {/* Nose */}
      <Circle cx="60" cy="50" r="4" fill="#9B5DE5" />
      {/* Snowflake decoration */}
      <Line x1="60" y1="8" x2="60" y2="18" stroke={c.accent} strokeWidth="1.5" opacity="0.6" />
      <Line x1="55" y1="11" x2="65" y2="15" stroke={c.accent} strokeWidth="1.5" opacity="0.6" />
      <Line x1="65" y1="11" x2="55" y2="15" stroke={c.accent} strokeWidth="1.5" opacity="0.6" />
      {/* Paws */}
      <Circle cx="38" cy="95" r="13" fill={c.primary} />
      <Circle cx="82" cy="95" r="13" fill={c.primary} />
      <Circle cx="34" cy="102" r="4" fill={c.secondary} />
      <Circle cx="42" cy="104" r="4" fill={c.secondary} />
      <Circle cx="78" cy="104" r="4" fill={c.secondary} />
      <Circle cx="86" cy="102" r="4" fill={c.secondary} />
    </Svg>
  );
}

function Thornix({ c }) {
  return (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      {/* Serpent body */}
      <Path d="M60,110 Q80,95 75,75 Q70,60 60,55 Q50,50 45,35 Q40,20 55,15" stroke={c.primary} strokeWidth="18" fill="none" strokeLinecap="round" />
      <Path d="M60,110 Q80,95 75,75 Q70,60 60,55 Q50,50 45,35 Q40,20 55,15" stroke={c.secondary} strokeWidth="10" fill="none" strokeLinecap="round" />
      {/* Leaf wings */}
      <Path d="M68,68 Q90,48 100,60 Q85,75 68,72" fill={c.primary} />
      <Path d="M52,62 Q30,42 20,54 Q35,70 52,66" fill={c.primary} />
      <Path d="M68,68 Q88,54 96,62" stroke={c.accent} strokeWidth="1.5" fill="none" />
      <Path d="M52,62 Q32,48 24,56" stroke={c.accent} strokeWidth="1.5" fill="none" />
      {/* Thorns on spine */}
      <Polygon points="62,78 68,70 62,72" fill={c.accent} />
      <Polygon points="64,90 70,82 64,84" fill={c.accent} />
      <Polygon points="58,66 64,58 58,60" fill={c.accent} />
      {/* Head */}
      <Ellipse cx="58" cy="18" rx="14" ry="12" fill={c.primary} />
      {/* Eyes */}
      <Circle cx="52" cy="16" r="5.5" fill="#90EE90" />
      <Circle cx="64" cy="16" r="5.5" fill="#90EE90" />
      <Ellipse cx="52" cy="16" rx="2" ry="4" fill="#0D2A00" />
      <Ellipse cx="64" cy="16" rx="2" ry="4" fill="#0D2A00" />
      {/* Forked tongue */}
      <Path d="M58,28 L56,36 M58,28 L60,36" stroke="#CC0000" strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

function Luminos({ c }) {
  return (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      {/* Body glow aura */}
      <Ellipse cx="60" cy="75" rx="28" ry="22" fill={c.accent} opacity="0.2" />
      {/* Body */}
      <Ellipse cx="60" cy="78" rx="20" ry="18" fill={c.primary} />
      {/* Neck */}
      <Rect x="54" y="58" width="12" height="22" rx="6" fill={c.primary} />
      {/* Head */}
      <Ellipse cx="60" cy="50" rx="18" ry="16" fill={c.primary} />
      {/* Glowing antlers */}
      <Path d="M48,38 L36,18 M48,38 L40,22 M40,22 L28,16" stroke={c.accent} strokeWidth="3" fill="none" strokeLinecap="round" />
      <Path d="M72,38 L84,18 M72,38 L80,22 M80,22 L92,16" stroke={c.accent} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Antler glow */}
      <Circle cx="36" cy="18" r="3" fill={c.accent} opacity="0.8" />
      <Circle cx="28" cy="16" r="2.5" fill={c.accent} opacity="0.8" />
      <Circle cx="84" cy="18" r="3" fill={c.accent} opacity="0.8" />
      <Circle cx="92" cy="16" r="2.5" fill={c.accent} opacity="0.8" />
      {/* Eyes - star shaped */}
      <Circle cx="52" cy="48" r="6" fill="#FFF4CC" />
      <Circle cx="68" cy="48" r="6" fill="#FFF4CC" />
      <Circle cx="52" cy="48" r="3.5" fill="#CC8800" />
      <Circle cx="68" cy="48" r="3.5" fill="#CC8800" />
      <Path d="M50,48 L54,48 M52,46 L52,50" stroke="#fff" strokeWidth="0.8" />
      <Path d="M66,48 L70,48 M68,46 L68,50" stroke="#fff" strokeWidth="0.8" />
      {/* Snout */}
      <Ellipse cx="60" cy="56" rx="6" ry="4" fill="#FFD080" />
      <Circle cx="58" cy="55" r="1.5" fill="#AA6600" />
      <Circle cx="62" cy="55" r="1.5" fill="#AA6600" />
      {/* Legs */}
      <Rect x="44" y="92" width="8" height="18" rx="4" fill={c.primary} />
      <Rect x="56" y="94" width="8" height="16" rx="4" fill={c.primary} />
      <Rect x="68" y="94" width="8" height="16" rx="4" fill={c.primary} />
      {/* Star decorations */}
      <Path d="M22,45 L24,40 L26,45 L31,43 L27,47 L29,52 L24,49 L19,52 L21,47 L17,43 Z" fill={c.accent} opacity="0.5" />
      <Path d="M92,55 L93.5,51 L95,55 L99,53.5 L96,56.5 L97.5,60.5 L93.5,58 L89.5,60.5 L91,56.5 L88,53.5 Z" fill={c.accent} opacity="0.4" />
    </Svg>
  );
}

function Shadowmeld({ c }) {
  return (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      {/* Shadow wisps */}
      <Path d="M60,110 Q45,95 38,80 Q30,65 38,55 Q46,45 60,48 Q74,45 82,55 Q90,65 82,80 Q75,95 60,110" fill={c.secondary} opacity="0.5" />
      {/* Body */}
      <Ellipse cx="60" cy="72" rx="24" ry="26" fill={c.primary} />
      {/* Head */}
      <Ellipse cx="60" cy="46" rx="22" ry="20" fill={c.primary} />
      {/* Pointed ears */}
      <Polygon points="42,32 36,14 54,30" fill={c.primary} />
      <Polygon points="78,32 84,14 66,30" fill={c.primary} />
      <Polygon points="43,30 38,16 52,29" fill={c.secondary} />
      <Polygon points="77,30 82,16 68,29" fill={c.secondary} />
      {/* Glowing eyes - crimson */}
      <Circle cx="50" cy="44" r="8" fill="#CC0022" />
      <Circle cx="70" cy="44" r="8" fill="#CC0022" />
      <Circle cx="50" cy="44" r="5" fill="#FF2244" />
      <Circle cx="70" cy="44" r="5" fill="#FF2244" />
      <Circle cx="51.5" cy="42.5" r="2" fill="#FF8899" />
      <Circle cx="71.5" cy="42.5" r="2" fill="#FF8899" />
      {/* Whiskers */}
      <Line x1="42" y1="54" x2="26" y2="50" stroke={c.accent} strokeWidth="1" opacity="0.7" />
      <Line x1="42" y1="57" x2="26" y2="56" stroke={c.accent} strokeWidth="1" opacity="0.7" />
      <Line x1="78" y1="54" x2="94" y2="50" stroke={c.accent} strokeWidth="1" opacity="0.7" />
      <Line x1="78" y1="57" x2="94" y2="56" stroke={c.accent} strokeWidth="1" opacity="0.7" />
      {/* Shadow tail */}
      <Path d="M80,88 Q100,80 108,90 Q100,100 88,95 Q96,108 85,112 Q78,100 82,96 Q70,105 68,116 Q64,102 72,98" fill={c.secondary} opacity="0.8" />
      {/* Paws */}
      <Ellipse cx="44" cy="96" rx="10" ry="7" fill={c.primary} />
      <Ellipse cx="76" cy="96" rx="10" ry="7" fill={c.primary} />
    </Svg>
  );
}

function Crystalix({ c }) {
  return (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      {/* Wings - crystal facets */}
      <Path d="M60,55 L14,28 L22,55 L14,72 Z" fill={c.primary} opacity="0.75" />
      <Path d="M60,55 L106,28 L98,55 L106,72 Z" fill={c.primary} opacity="0.75" />
      <Path d="M60,58 L20,36 L26,56 Z" fill={c.accent} opacity="0.45" />
      <Path d="M60,58 L100,36 L94,56 Z" fill={c.accent} opacity="0.45" />
      {/* Wing edges */}
      <Line x1="60" y1="55" x2="14" y2="28" stroke={c.secondary} strokeWidth="1.5" opacity="0.6" />
      <Line x1="60" y1="55" x2="106" y2="28" stroke={c.secondary} strokeWidth="1.5" opacity="0.6" />
      {/* Body - diamond */}
      <Polygon points="60,36 76,58 60,80 44,58" fill={c.primary} />
      <Polygon points="60,40 74,58 60,76 46,58" fill={c.secondary} opacity="0.5" />
      {/* Eyes - faceted */}
      <Circle cx="52" cy="55" r="7" fill="#F0E8FF" />
      <Circle cx="68" cy="55" r="7" fill="#F0E8FF" />
      <Polygon points="52,49 58,55 52,61 46,55" fill={c.primary} />
      <Polygon points="68,49 74,55 68,61 62,55" fill={c.primary} />
      <Circle cx="52" cy="55" r="2.5" fill="#fff" />
      <Circle cx="68" cy="55" r="2.5" fill="#fff" />
      {/* Antennae */}
      <Path d="M52,38 Q44,24 42,18" stroke={c.secondary} strokeWidth="2" fill="none" />
      <Path d="M68,38 Q76,24 78,18" stroke={c.secondary} strokeWidth="2" fill="none" />
      <Circle cx="42" cy="18" r="4" fill={c.accent} />
      <Circle cx="78" cy="18" r="4" fill={c.accent} />
      {/* Lower wings */}
      <Path d="M60,68 L28,96 L44,80 Z" fill={c.primary} opacity="0.65" />
      <Path d="M60,68 L92,96 L76,80 Z" fill={c.primary} opacity="0.65" />
    </Svg>
  );
}

function Stormclaw({ c }) {
  return (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      {/* Storm cloud wing hints */}
      <Ellipse cx="28" cy="55" rx="20" ry="12" fill="#334" opacity="0.6" />
      <Ellipse cx="92" cy="55" rx="20" ry="12" fill="#334" opacity="0.6" />
      {/* Wings */}
      <Path d="M60,52 Q25,22 8,40 Q22,58 60,65" fill={c.primary} />
      <Path d="M60,52 Q95,22 112,40 Q98,58 60,65" fill={c.primary} />
      <Path d="M60,54 Q30,30 14,44 Q28,58 60,64" fill={c.secondary} opacity="0.5" />
      <Path d="M60,54 Q90,30 106,44 Q92,58 60,64" fill={c.secondary} opacity="0.5" />
      {/* Body */}
      <Ellipse cx="60" cy="68" rx="18" ry="22" fill={c.primary} />
      {/* Head */}
      <Circle cx="60" cy="46" r="20" fill={c.primary} />
      {/* Hooked beak */}
      <Path d="M56,58 Q60,65 64,58 L60,62 Z" fill={c.accent} />
      {/* Eyes - fierce */}
      <Circle cx="50" cy="43" r="7" fill="#C8E8FF" />
      <Circle cx="70" cy="43" r="7" fill="#C8E8FF" />
      <Ellipse cx="50" cy="43" rx="3" ry="4.5" fill="#001A3A" />
      <Ellipse cx="70" cy="43" rx="3" ry="4.5" fill="#001A3A" />
      <Circle cx="51" cy="41" r="1.5" fill="#fff" />
      <Circle cx="71" cy="41" r="1.5" fill="#fff" />
      {/* Brow ridge */}
      <Path d="M44,36 L56,40" stroke="#001A3A" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M76,36 L64,40" stroke="#001A3A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Crest */}
      <Path d="M56,28 L52,16 L58,26 M60,26 L58,12 L62,26 M64,28 L68,16 L62,26" stroke={c.secondary} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Lightning talons */}
      <Path d="M48,86 L40,100 M50,88 L44,104 M52,90 L48,106" stroke={c.accent} strokeWidth="2" strokeLinecap="round" />
      <Path d="M72,86 L80,100 M70,88 L76,104 M68,90 L72,106" stroke={c.accent} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function Emberhound({ c }) {
  return (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      {/* Body - muscular */}
      <Ellipse cx="60" cy="72" rx="32" ry="26" fill={c.secondary} />
      <Ellipse cx="60" cy="72" rx="28" ry="22" fill={c.primary} />
      {/* Lava cracks on body */}
      <Path d="M44,68 L52,78 L48,82" stroke={c.accent} strokeWidth="1.5" fill="none" opacity="0.85" />
      <Path d="M68,65 L76,75 L72,80" stroke={c.accent} strokeWidth="1.5" fill="none" opacity="0.85" />
      <Path d="M56,78 L60,88 L58,92" stroke={c.accent} strokeWidth="1.5" fill="none" opacity="0.85" />
      {/* Head */}
      <Circle cx="60" cy="46" r="25" fill={c.primary} />
      {/* Mane of fire */}
      <Path d="M38,36 Q30,20 40,15 Q36,28 44,30" fill={c.accent} opacity="0.8" />
      <Path d="M50,30 Q46,14 56,10 Q52,24 58,26" fill={c.accent} opacity="0.8" />
      <Path d="M70,30 Q74,14 64,10 Q68,24 62,26" fill={c.accent} opacity="0.8" />
      <Path d="M82,36 Q90,20 80,15 Q84,28 76,30" fill={c.accent} opacity="0.8" />
      {/* Ears */}
      <Polygon points="42,30 36,14 54,28" fill={c.secondary} />
      <Polygon points="78,30 84,14 66,28" fill={c.secondary} />
      {/* Burning eyes */}
      <Circle cx="50" cy="44" r="8" fill="#FF6600" />
      <Circle cx="70" cy="44" r="8" fill="#FF6600" />
      <Circle cx="50" cy="44" r="5" fill="#FFCC00" />
      <Circle cx="70" cy="44" r="5" fill="#FFCC00" />
      <Circle cx="50" cy="44" r="2.5" fill="#CC0000" />
      <Circle cx="70" cy="44" r="2.5" fill="#CC0000" />
      {/* Snout */}
      <Ellipse cx="60" cy="56" rx="10" ry="7" fill={c.secondary} />
      <Circle cx="56" cy="54" r="3" fill="#1A0000" />
      <Circle cx="64" cy="54" r="3" fill="#1A0000" />
      {/* Legs */}
      <Rect x="32" y="92" width="16" height="18" rx="5" fill={c.secondary} />
      <Rect x="72" y="92" width="16" height="18" rx="5" fill={c.secondary} />
      {/* Tail with ember */}
      <Path d="M88,72 Q104,60 100,46 Q96,58 98,52 Q92,64 88,72" fill={c.secondary} />
      <Circle cx="100" cy="44" r="5" fill={c.accent} opacity="0.9" />
    </Svg>
  );
}

const SPRITE_MAP = {
  flambit:    Flambit,
  aquora:     Aquora,
  terrox:     Terrox,
  zephlyn:    Zephlyn,
  voltix:     Voltix,
  frostara:   Frostara,
  thornix:    Thornix,
  luminos:    Luminos,
  shadowmeld: Shadowmeld,
  crystalix:  Crystalix,
  stormclaw:  Stormclaw,
  emberhound: Emberhound,
};

import { CREATURES } from '../constants/creatures';

export default function CreatureSprite({ type, size = 120 }) {
  const Component = SPRITE_MAP[type] || Flambit;
  const creature = CREATURES[type] || CREATURES.flambit;
  const scale = size / 120;

  return (
    <G transform={`scale(${scale})`}>
      <Component c={creature.colors} />
    </G>
  );
}

export function CreatureSvg({ type, size = 120, style }) {
  const Component = SPRITE_MAP[type] || Flambit;
  const creature = CREATURES[type] || CREATURES.flambit;
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" style={style}>
      <Component c={creature.colors} />
    </Svg>
  );
}
