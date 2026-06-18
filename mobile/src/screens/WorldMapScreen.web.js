// Web version of WorldMapScreen — radar view (react-native-maps doesn't support web)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
  Animated, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SHADOW } from '../constants/theme';
import { useGame } from '../context/GameContext';
import { CreatureSvg } from '../components/CreatureSprite';
import { CREATURES, TYPE_COLORS } from '../constants/creatures';
import { CATCH_DISTANCE_METERS } from '../constants/config';

const { width } = Dimensions.get('window');
const RADAR_SIZE = Math.min(width - 40, 360);
const R = RADAR_SIZE / 2;
const VIEW_RADIUS_METERS = 400;

function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingDeg(lat1, lng1, lat2, lng2) {
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function creatureToRadar(creature, userLat, userLng) {
  const dist = distanceMeters(userLat, userLng, creature.lat, creature.lng);
  const bearing = bearingDeg(userLat, userLng, creature.lat, creature.lng);
  const clampedDist = Math.min(dist, VIEW_RADIUS_METERS);
  const pct = clampedDist / VIEW_RADIUS_METERS;
  const rad = (bearing - 90) * Math.PI / 180;
  return {
    x: R + Math.cos(rad) * pct * (R - 28),
    y: R + Math.sin(rad) * pct * (R - 28),
    dist: Math.round(dist),
    inRange: dist <= CATCH_DISTANCE_METERS,
  };
}

export default function WorldMapScreen({ navigation }) {
  const { location, mapCreatures, isOnline, onlinePlayerCount, player, refreshMapCreatures } = useGame();
  const [selected, setSelected] = useState(null);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Radar scan animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, { toValue: 1, duration: 3000, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const scanRotate = scanAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  if (!location) {
    return (
      <LinearGradient colors={[COLORS.bg, COLORS.bgCard]} style={styles.container}>
        <View style={styles.loadingBox}>
          <Text style={styles.loadingEmoji}>📡</Text>
          <Text style={styles.loadingText}>Acquiring location…</Text>
          <Text style={styles.loadingHint}>Allow location access in your browser when prompted</Text>
        </View>
      </LinearGradient>
    );
  }

  const positioned = mapCreatures.map(c => ({
    ...c,
    ...creatureToRadar(c, location.latitude, location.longitude),
  }));

  return (
    <LinearGradient colors={[COLORS.bg, '#0A001A']} style={styles.container}>
      {/* HUD */}
      <View style={styles.hud}>
        <View>
          <Text style={styles.hudName}>{player?.username}</Text>
          <Text style={styles.hudLv}>Lv {player?.level} Hunter</Text>
        </View>
        <View style={styles.hudRight}>
          <View style={[styles.dot, { backgroundColor: isOnline ? COLORS.success : COLORS.warning }]} />
          <Text style={styles.hudStatus}>{isOnline ? `${onlinePlayerCount} online` : 'Offline'}</Text>
        </View>
      </View>

      {/* Radar */}
      <View style={styles.radarWrap}>
        <Animated.View style={[styles.radarOuter, { transform: [{ scale: pulseAnim }] }]}>
          {/* Distance rings */}
          {[0.25, 0.5, 0.75, 1].map(pct => (
            <View key={pct} style={[styles.ring, {
              width: RADAR_SIZE * pct, height: RADAR_SIZE * pct,
              borderRadius: RADAR_SIZE * pct / 2,
              opacity: 0.15 + pct * 0.1,
            }]} />
          ))}

          {/* Catch zone */}
          <View style={[styles.catchZone, {
            width: RADAR_SIZE * (CATCH_DISTANCE_METERS / VIEW_RADIUS_METERS) * 2,
            height: RADAR_SIZE * (CATCH_DISTANCE_METERS / VIEW_RADIUS_METERS) * 2,
            borderRadius: RADAR_SIZE,
          }]} />

          {/* Cross-hairs */}
          <View style={styles.crossH} />
          <View style={styles.crossV} />

          {/* Scan sweep */}
          <Animated.View style={[styles.sweep, { transform: [{ rotate: scanRotate }] }]} />

          {/* Creatures */}
          {positioned.map(c => {
            const def = CREATURES[c.type];
            const color = TYPE_COLORS[def?.type] || COLORS.primary;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.creatureDot, {
                  left: c.x - 22,
                  top: c.y - 22,
                  borderColor: color,
                  backgroundColor: color + '22',
                }]}
                onPress={() => setSelected(c)}
                activeOpacity={0.75}
              >
                <CreatureSvg type={c.type} size={36} />
                {c.rarity === 'legendary' && <Text style={styles.legStar}>★</Text>}
              </TouchableOpacity>
            );
          })}

          {/* Player dot */}
          <View style={styles.playerDot}>
            <Text style={styles.playerDotText}>YOU</Text>
          </View>
        </Animated.View>

        {/* Range label */}
        <Text style={styles.rangeLabel}>{VIEW_RADIUS_METERS}m radius</Text>
      </View>

      {/* Nearby list */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nearbyScroll} contentContainerStyle={styles.nearbyRow}>
        {positioned.sort((a, b) => a.dist - b.dist).map(c => {
          const def = CREATURES[c.type];
          return (
            <TouchableOpacity key={c.id} style={[styles.nearbyCard, { borderColor: TYPE_COLORS[def?.type] + '88' }]} onPress={() => setSelected(c)} activeOpacity={0.8}>
              <CreatureSvg type={c.type} size={46} />
              <Text style={styles.nearbyName}>{def?.name}</Text>
              <Text style={styles.nearbyDist}>{c.dist}m</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.refreshBtn} onPress={() => refreshMapCreatures(location)} activeOpacity={0.8}>
        <Text style={styles.refreshText}>🔄 Scan Area</Text>
      </TouchableOpacity>

      {/* Selected popup */}
      {selected && (
        <TouchableOpacity style={styles.popupBg} activeOpacity={1} onPress={() => setSelected(null)}>
          <View style={styles.popup} onStartShouldSetResponder={() => true}>
            <CreatureSvg type={selected.type} size={120} />
            <Text style={styles.popupName}>{CREATURES[selected.type]?.name}</Text>
            <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[CREATURES[selected.type]?.type] + 'CC' }]}>
              <Text style={styles.typeText}>{CREATURES[selected.type]?.type}</Text>
            </View>
            <Text style={styles.popupSub}>Level {selected.level}  ·  {selected.rarity?.toUpperCase()}</Text>
            <Text style={styles.popupDist}>{selected.dist}m away</Text>
            {selected.dist > CATCH_DISTANCE_METERS && (
              <Text style={styles.tooFar}>Move within {CATCH_DISTANCE_METERS}m to catch!</Text>
            )}
            <TouchableOpacity
              style={styles.encounterBtn}
              onPress={() => { navigation.navigate('Catch', { creature: selected }); setSelected(null); }}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#9B30FF', '#C77DFF']} style={styles.encounterGrad}>
                <Text style={styles.encounterText}>⚡ Encounter!</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Text style={styles.dismiss}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 },
  loadingEmoji: { fontSize: 52 },
  loadingText: { color: COLORS.textPrimary, fontSize: FONTS.size.xl, fontWeight: FONTS.weight.bold },
  loadingHint: { color: COLORS.textMuted, fontSize: FONTS.size.sm, textAlign: 'center' },

  hud: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  hudName: { color: COLORS.textPrimary, fontSize: FONTS.size.lg, fontWeight: FONTS.weight.black },
  hudLv: { color: COLORS.primaryLight, fontSize: FONTS.size.sm },
  hudRight: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.bgCard, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  dot: { width: 8, height: 8, borderRadius: 4 },
  hudStatus: { color: COLORS.textSecondary, fontSize: FONTS.size.sm },

  radarWrap: { alignItems: 'center', paddingVertical: 8 },
  radarOuter: {
    width: RADAR_SIZE, height: RADAR_SIZE, borderRadius: RADAR_SIZE / 2,
    backgroundColor: '#0A0018', borderWidth: 2, borderColor: COLORS.primary + '66',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    ...SHADOW.glow,
  },
  ring: {
    position: 'absolute', borderWidth: 1, borderColor: COLORS.primary,
  },
  catchZone: {
    position: 'absolute', borderWidth: 1.5, borderColor: COLORS.success + '66',
    backgroundColor: COLORS.success + '08',
  },
  crossH: { position: 'absolute', width: RADAR_SIZE - 4, height: 1, backgroundColor: COLORS.primary + '30' },
  crossV: { position: 'absolute', width: 1, height: RADAR_SIZE - 4, backgroundColor: COLORS.primary + '30' },
  sweep: {
    position: 'absolute', width: R, height: R,
    top: 0, left: R,
    borderTopRightRadius: R,
    backgroundColor: 'transparent',
    borderRightWidth: 0,
    // Wedge using border trick
    transform: [{ rotate: '0deg' }, { skewY: '-45deg' }],
    borderTopColor: COLORS.primary + '40',
    borderTopWidth: R,
    borderRightColor: 'transparent',
    borderRightWidth: R,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    borderLeftWidth: 0,
    borderLeftColor: 'transparent',
    width: 0, height: 0,
  },
  creatureDot: {
    position: 'absolute', width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  legStar: { position: 'absolute', top: -6, right: -4, fontSize: 11, color: COLORS.legendary },
  playerDot: {
    position: 'absolute', width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary, borderWidth: 2, borderColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  playerDotText: { color: '#fff', fontSize: 7, fontWeight: FONTS.weight.black },
  rangeLabel: { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 6 },

  nearbyScroll: { maxHeight: 120 },
  nearbyRow: { paddingHorizontal: 16, gap: 10, alignItems: 'center' },
  nearbyCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: 10,
    alignItems: 'center', gap: 4, borderWidth: 1.5, minWidth: 80,
  },
  nearbyName: { color: COLORS.textPrimary, fontSize: FONTS.size.xs, fontWeight: FONTS.weight.bold },
  nearbyDist: { color: COLORS.accent, fontSize: FONTS.size.xs },

  refreshBtn: { alignSelf: 'center', marginVertical: 8, backgroundColor: COLORS.bgCard, paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  refreshText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, fontWeight: FONTS.weight.bold },

  popupBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(13,2,33,0.85)', justifyContent: 'center', alignItems: 'center' },
  popup: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 28, alignItems: 'center', gap: 8, width: 300, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.glow },
  popupName: { color: COLORS.textPrimary, fontSize: FONTS.size.xxl, fontWeight: FONTS.weight.black },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full },
  typeText: { color: '#fff', fontSize: FONTS.size.sm, fontWeight: FONTS.weight.bold },
  popupSub: { color: COLORS.textSecondary, fontSize: FONTS.size.sm },
  popupDist: { color: COLORS.accent, fontSize: FONTS.size.md, fontWeight: FONTS.weight.bold },
  tooFar: { color: COLORS.warning, fontSize: FONTS.size.sm },
  encounterBtn: { width: '100%', borderRadius: RADIUS.md, overflow: 'hidden', marginTop: 6 },
  encounterGrad: { paddingVertical: 13, alignItems: 'center' },
  encounterText: { color: '#fff', fontSize: FONTS.size.lg, fontWeight: FONTS.weight.bold },
  dismiss: { color: COLORS.textMuted, fontSize: FONTS.size.sm, marginTop: 4 },
});
