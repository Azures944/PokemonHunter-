export const COLORS = {
  // Backgrounds
  bg:           '#0D0221',
  bgCard:       '#1A0A2E',
  bgCardLight:  '#261545',
  bgOverlay:    'rgba(13,2,33,0.92)',

  // Brand
  primary:      '#9B30FF',
  primaryLight: '#C77DFF',
  primaryDark:  '#6A0DAD',
  secondary:    '#00D4FF',
  accent:       '#FFE45E',

  // Feedback
  success:      '#2ECC40',
  danger:       '#FF4136',
  warning:      '#FF9500',
  info:         '#00D4FF',

  // Text
  textPrimary:  '#F0EAFF',
  textSecondary:'#A89BCC',
  textMuted:    '#6B5F88',

  // Rarity
  common:     '#A0A0A0',
  uncommon:   '#2ECC40',
  rare:       '#0099CC',
  legendary:  '#FFD700',

  // UI
  border:     '#2A1A45',
  shadow:     'rgba(155,48,255,0.3)',
  white:      '#FFFFFF',
  black:      '#000000',
};

export const FONTS = {
  size: {
    xs:   10,
    sm:   12,
    md:   14,
    base: 16,
    lg:   18,
    xl:   22,
    xxl:  28,
    hero: 36,
  },
  weight: {
    regular: '400',
    medium:  '500',
    bold:    '700',
    black:   '900',
  },
};

export const RADIUS = {
  sm:   8,
  md:   14,
  lg:   20,
  xl:   28,
  full: 9999,
};

export const SHADOW = {
  card: {
    shadowColor: '#9B30FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: '#C77DFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
  },
};

export const RARITY_COLORS = {
  common:    COLORS.common,
  uncommon:  COLORS.uncommon,
  rare:      COLORS.rare,
  legendary: COLORS.legendary,
};
