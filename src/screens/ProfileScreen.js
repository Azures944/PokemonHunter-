import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { COLORS, FONTS, RADIUS, SHADOW, RARITY_COLORS } from '../constants/theme';
import { CREATURES } from '../constants/creatures';
import { fetchLeaderboard } from '../services/api';
import { useGame } from '../context/GameContext';

function Avatar({ name, size = 80 }) {
  const colors = [
    '#9B30FF', '#FF6B35', '#00B4D8', '#2ECC40', '#FFD700',
    '#DA70D6', '#4169E1', '#CC3300',
  ];
  const seed = name ? name.charCodeAt(0) + name.charCodeAt(name.length - 1) : 0;
  const bg = colors[seed % colors.length];
  const initial = name ? name[0].toUpperCase() : '?';
  const r = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={r} cy={r} r={r - 2} fill={bg} />
      <Circle cx={r} cy={r} r={r - 8} fill="none" stroke="#ffffff33" strokeWidth="1.5" />
      <SvgText x={r} y={r + FONTS.size.xl * 0.38} textAnchor="middle" fill="#fff" fontSize={FONTS.size.xl} fontWeight="bold">
        {initial}
      </SvgText>
    </Svg>
  );
}

function StatCard({ label, value, emoji }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { player, collection, isOnline, logout } = useGame();
  const [leaderboard, setLeaderboard] = useState([]);
  const [sound, setSound] = useState(true);
  const [vibrate, setVibrate] = useState(true);

  useEffect(() => {
    if (isOnline) {
      fetchLeaderboard().then(r => setLeaderboard(r.leaderboard || [])).catch(() => {});
    }
  }, [isOnline]);

  if (!player) return null;

  const xpPct = player.xp / (player.xpToNext || 100);
  const rarityBreakdown = { legendary: 0, rare: 0, uncommon: 0, common: 0 };
  collection.forEach(m => {
    const r = CREATURES[m.type]?.rarity || 'common';
    rarityBreakdown[r] = (rarityBreakdown[r] || 0) + 1;
  });

  const winRate = player.battleWins + player.battleLosses > 0
    ? Math.round((player.battleWins / (player.battleWins + player.battleLosses)) * 100)
    : 0;

  return (
    <LinearGradient colors={[COLORS.bg, COLORS.bgCard]} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile card */}
          <View style={styles.profileCard}>
            <LinearGradient colors={['#1A0A2E', '#261545']} style={styles.profileGrad}>
              <Avatar name={player.username} size={88} />
              <Text style={styles.username}>{player.username}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Level {player.level} Hunter</Text>
              </View>
              {/* XP bar */}
              <View style={styles.xpArea}>
                <Text style={styles.xpLabel}>{player.xp} / {player.xpToNext} XP</Text>
                <View style={styles.xpTrack}>
                  <View style={[styles.xpFill, { width: `${Math.min(xpPct * 100, 100)}%` }]} />
                </View>
              </View>
              {/* Online indicator */}
              <View style={styles.onlineRow}>
                <View style={[styles.onlineDot, { backgroundColor: isOnline ? COLORS.success : COLORS.warning }]} />
                <Text style={styles.onlineText}>{isOnline ? 'Online' : 'Offline Mode'}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <StatCard label="Caught" value={player.catchCount} emoji="🎯" />
            <StatCard label="Wins" value={player.battleWins} emoji="🏆" />
            <StatCard label="Win Rate" value={`${winRate}%`} emoji="⚡" />
            <StatCard label="Collection" value={collection.length} emoji="🌿" />
          </View>

          {/* Rarity breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Collection Rarity</Text>
            {Object.entries(rarityBreakdown).filter(([, v]) => v > 0).map(([rarity, count]) => (
              <View key={rarity} style={styles.rarityRow}>
                <View style={[styles.rarityDot, { backgroundColor: RARITY_COLORS[rarity] }]} />
                <Text style={styles.rarityLabel}>{rarity.charAt(0).toUpperCase() + rarity.slice(1)}</Text>
                <Text style={styles.rarityCount}>{count}</Text>
              </View>
            ))}
            {Object.values(rarityBreakdown).every(v => v === 0) && (
              <Text style={styles.emptyText}>No WildMons caught yet!</Text>
            )}
          </View>

          {/* Leaderboard */}
          {isOnline && leaderboard.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏅 Top Hunters</Text>
              {leaderboard.slice(0, 10).map((entry, i) => (
                <View key={i} style={[styles.leaderRow, entry.username === player.username && styles.leaderRowSelf]}>
                  <Text style={styles.leaderRank}>{i + 1}</Text>
                  <Text style={styles.leaderName}>{entry.username}</Text>
                  <Text style={styles.leaderLevel}>Lv {entry.level}</Text>
                  <Text style={styles.leaderCatch}>{entry.catchCount} caught</Text>
                </View>
              ))}
            </View>
          )}

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>🔊 Sound</Text>
              <Switch value={sound} onValueChange={setSound} trackColor={{ true: COLORS.primary }} />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>📳 Vibration</Text>
              <Switch value={vibrate} onValueChange={setVibrate} trackColor={{ true: COLORS.primary }} />
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },

  profileCard: { margin: 16, borderRadius: RADIUS.xl, overflow: 'hidden', ...SHADOW.glow },
  profileGrad: { alignItems: 'center', padding: 24, gap: 8 },
  username: { color: COLORS.textPrimary, fontSize: FONTS.size.xxl, fontWeight: FONTS.weight.black, letterSpacing: 1 },
  levelBadge: { backgroundColor: COLORS.primary + 'AA', paddingHorizontal: 16, paddingVertical: 5, borderRadius: RADIUS.full },
  levelText: { color: '#fff', fontSize: FONTS.size.sm, fontWeight: FONTS.weight.bold },
  xpArea: { width: '80%', gap: 4 },
  xpLabel: { color: COLORS.textMuted, fontSize: FONTS.size.xs, textAlign: 'right' },
  xpTrack: { height: 8, backgroundColor: COLORS.bg, borderRadius: 99, overflow: 'hidden' },
  xpFill: { height: 8, backgroundColor: COLORS.accent, borderRadius: 99 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  onlineText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  statCard: {
    flex: 1, minWidth: '44%', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 16, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.card,
  },
  statEmoji: { fontSize: 28 },
  statValue: { color: COLORS.textPrimary, fontSize: FONTS.size.xl, fontWeight: FONTS.weight.black },
  statLabel: { color: COLORS.textSecondary, fontSize: FONTS.size.xs },

  section: { marginHorizontal: 16, marginBottom: 16, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONTS.size.base, fontWeight: FONTS.weight.bold, marginBottom: 12 },

  rarityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 },
  rarityDot: { width: 10, height: 10, borderRadius: 5 },
  rarityLabel: { flex: 1, color: COLORS.textSecondary, fontSize: FONTS.size.md },
  rarityCount: { color: COLORS.textPrimary, fontSize: FONTS.size.md, fontWeight: FONTS.weight.bold },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.size.sm, textAlign: 'center', paddingVertical: 8 },

  leaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  leaderRowSelf: { backgroundColor: COLORS.primary + '22', borderRadius: RADIUS.sm, paddingHorizontal: 6 },
  leaderRank: { width: 28, color: COLORS.accent, fontSize: FONTS.size.md, fontWeight: FONTS.weight.bold, textAlign: 'center' },
  leaderName: { flex: 1, color: COLORS.textPrimary, fontSize: FONTS.size.md, fontWeight: FONTS.weight.medium },
  leaderLevel: { color: COLORS.textMuted, fontSize: FONTS.size.xs },
  leaderCatch: { color: COLORS.textSecondary, fontSize: FONTS.size.xs },

  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  settingLabel: { flex: 1, color: COLORS.textPrimary, fontSize: FONTS.size.base },

  logoutBtn: { marginHorizontal: 16, marginBottom: 32, borderRadius: RADIUS.md, backgroundColor: COLORS.bgCardLight, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.danger + '55' },
  logoutText: { color: COLORS.danger, fontSize: FONTS.size.base, fontWeight: FONTS.weight.bold },
});
