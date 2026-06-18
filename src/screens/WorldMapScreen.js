import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
  ActivityIndicator, Platform,
} from 'react-native';
import MapView, { Marker, UrlTile, Circle as MapCircle } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SHADOW } from '../constants/theme';
import { useGame } from '../context/GameContext';
import { CreatureSvg } from '../components/CreatureSprite';
import { CREATURES, TYPE_COLORS } from '../constants/creatures';
import { CATCH_DISTANCE_METERS } from '../constants/config';

const { width, height } = Dimensions.get('window');

function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function CreatureMarker({ creature, onPress }) {
  const def = CREATURES[creature.type];
  const typeColor = TYPE_COLORS[def?.type] || COLORS.primary;
  return (
    <Marker
      coordinate={{ latitude: creature.lat, longitude: creature.lng }}
      onPress={() => onPress(creature)}
      tracksViewChanges={false}
    >
      <View style={[styles.markerWrap, { borderColor: typeColor }]}>
        <CreatureSvg type={creature.type} size={44} />
        {creature.rarity === 'legendary' && <Text style={styles.legendaryBadge}>★</Text>}
      </View>
      <View style={[styles.markerLabel, { backgroundColor: typeColor + 'DD' }]}>
        <Text style={styles.markerName}>{def?.name || creature.type}</Text>
        <Text style={styles.markerLv}>Lv{creature.level}</Text>
      </View>
    </Marker>
  );
}

export default function WorldMapScreen({ navigation }) {
  const { location, mapCreatures, isOnline, onlinePlayerCount, player, refreshMapCreatures } = useGame();
  const [selected, setSelected] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (location) refreshMapCreatures(location);
  }, []);

  const handleCreaturePress = useCallback((creature) => {
    if (!location) return;
    const dist = distanceMeters(location.latitude, location.longitude, creature.lat, creature.lng);
    setSelected({ ...creature, dist: Math.round(dist) });
  }, [location]);

  const handleEncounter = useCallback(() => {
    if (!selected) return;
    const dist = location
      ? distanceMeters(location.latitude, location.longitude, selected.lat, selected.lng)
      : 0;
    if (dist > CATCH_DISTANCE_METERS && !selected.offline) {
      setSelected(s => ({ ...s, tooFar: true }));
      return;
    }
    navigation.navigate('Catch', { creature: selected });
    setSelected(null);
  }, [selected, location, navigation]);

  if (!location) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Finding your location…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        onMapReady={() => setMapReady(true)}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          tileSize={256}
        />
        {/* Catch radius */}
        <MapCircle
          center={location}
          radius={CATCH_DISTANCE_METERS}
          strokeColor={COLORS.primary + '80'}
          fillColor={COLORS.primary + '18'}
          strokeWidth={2}
        />
        {mapReady && mapCreatures.map(c => (
          <CreatureMarker key={c.id} creature={c} onPress={handleCreaturePress} />
        ))}
      </MapView>

      {/* HUD top bar */}
      <View style={styles.hud}>
        <LinearGradient colors={['rgba(13,2,33,0.95)', 'transparent']} style={styles.hudGrad}>
          <View style={styles.hudRow}>
            <View style={styles.hudLeft}>
              <Text style={styles.hudName}>{player?.username}</Text>
              <Text style={styles.hudLevel}>Lv {player?.level} Hunter</Text>
            </View>
            <View style={styles.hudRight}>
              <View style={[styles.statusDot, { backgroundColor: isOnline ? COLORS.success : COLORS.warning }]} />
              <Text style={styles.hudStatus}>
                {isOnline ? `${onlinePlayerCount} online` : 'Offline'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Creature count pill */}
      <View style={styles.nearbyPill}>
        <Text style={styles.nearbyText}>
          {mapCreatures.length} WildMon{mapCreatures.length !== 1 ? 's' : ''} nearby
        </Text>
      </View>

      {/* Refresh button */}
      <TouchableOpacity style={styles.refreshBtn} onPress={() => refreshMapCreatures(location)} activeOpacity={0.8}>
        <Text style={styles.refreshIcon}>🔄</Text>
      </TouchableOpacity>

      {/* Selected creature popup */}
      {selected && (
        <TouchableOpacity style={styles.popupBackdrop} activeOpacity={1} onPress={() => setSelected(null)}>
          <View style={styles.popup} onStartShouldSetResponder={() => true}>
            <CreatureSvg type={selected.type} size={110} />
            <View style={styles.popupInfo}>
              <Text style={styles.popupName}>{CREATURES[selected.type]?.name}</Text>
              <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[CREATURES[selected.type]?.type] + 'CC' }]}>
                <Text style={styles.typeText}>{CREATURES[selected.type]?.type}</Text>
              </View>
              <Text style={styles.popupSub}>Level {selected.level}  •  {selected.rarity?.toUpperCase()}</Text>
              <Text style={styles.popupDist}>{selected.dist}m away</Text>
              {selected.tooFar && (
                <Text style={styles.tooFar}>Walk closer to catch! (&lt;{CATCH_DISTANCE_METERS}m)</Text>
              )}
              <Text style={styles.popupDesc} numberOfLines={2}>{CREATURES[selected.type]?.description}</Text>
            </View>
            <TouchableOpacity style={styles.encounterBtn} onPress={handleEncounter} activeOpacity={0.85}>
              <LinearGradient colors={['#9B30FF', '#C77DFF']} style={styles.encounterGrad}>
                <Text style={styles.encounterText}>⚡ Encounter</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loading: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: COLORS.textSecondary, fontSize: FONTS.size.base },

  hud: { position: 'absolute', top: 0, left: 0, right: 0 },
  hudGrad: { paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: 20, paddingHorizontal: 16 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hudLeft: {},
  hudName: { color: COLORS.textPrimary, fontSize: FONTS.size.lg, fontWeight: FONTS.weight.bold },
  hudLevel: { color: COLORS.primaryLight, fontSize: FONTS.size.sm },
  hudRight: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.bgOverlay, paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.full },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  hudStatus: { color: COLORS.textSecondary, fontSize: FONTS.size.sm },

  nearbyPill: {
    position: 'absolute', bottom: 110, alignSelf: 'center',
    backgroundColor: COLORS.bgOverlay, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
  },
  nearbyText: { color: COLORS.textPrimary, fontSize: FONTS.size.sm, fontWeight: FONTS.weight.bold },

  refreshBtn: {
    position: 'absolute', bottom: 120, right: 16,
    backgroundColor: COLORS.bgCard, width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border, ...SHADOW.card,
  },
  refreshIcon: { fontSize: 20 },

  markerWrap: {
    backgroundColor: COLORS.bgCard, borderRadius: 12, borderWidth: 2,
    padding: 3, ...SHADOW.card,
  },
  legendaryBadge: { position: 'absolute', top: -6, right: -6, fontSize: 14, color: COLORS.legendary },
  markerLabel: {
    marginTop: 3, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignItems: 'center',
  },
  markerName: { color: '#fff', fontSize: 9, fontWeight: FONTS.weight.bold },
  markerLv: { color: '#fff', fontSize: 8 },

  popupBackdrop: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(13,2,33,0.7)',
    justifyContent: 'flex-end',
  },
  popup: {
    backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, alignItems: 'center', gap: 8, ...SHADOW.glow,
    borderWidth: 1, borderColor: COLORS.border,
  },
  popupInfo: { alignItems: 'center', gap: 4 },
  popupName: { color: COLORS.textPrimary, fontSize: FONTS.size.xxl, fontWeight: FONTS.weight.black },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full },
  typeText: { color: '#fff', fontSize: FONTS.size.sm, fontWeight: FONTS.weight.bold },
  popupSub: { color: COLORS.textSecondary, fontSize: FONTS.size.sm },
  popupDist: { color: COLORS.accent, fontSize: FONTS.size.md, fontWeight: FONTS.weight.bold },
  tooFar: { color: COLORS.danger, fontSize: FONTS.size.sm, fontWeight: FONTS.weight.bold },
  popupDesc: { color: COLORS.textMuted, fontSize: FONTS.size.sm, textAlign: 'center', maxWidth: 280 },

  encounterBtn: { width: '100%', borderRadius: RADIUS.md, overflow: 'hidden', marginTop: 8 },
  encounterGrad: { paddingVertical: 14, alignItems: 'center' },
  encounterText: { color: '#fff', fontSize: FONTS.size.lg, fontWeight: FONTS.weight.bold },
});
