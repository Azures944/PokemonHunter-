import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS, SHADOW, RARITY_COLORS } from '../constants/theme';
import { CreatureSvg } from '../components/CreatureSprite';
import StatBar from '../components/StatBar';
import { CREATURES, TYPE_COLORS, getStatForLevel } from '../constants/creatures';
import { useGame } from '../context/GameContext';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 3;

const TYPES = ['All', 'Fire', 'Water', 'Earth', 'Wind', 'Electric', 'Ice', 'Nature', 'Light', 'Shadow', 'Crystal', 'Storm', 'Magma'];

function MonCard({ mon, onPress }) {
  const def = CREATURES[mon.type];
  if (!def) return null;
  const rarityColor = RARITY_COLORS[def.rarity];
  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: rarityColor + '88' }]}
      onPress={() => onPress(mon)}
      activeOpacity={0.8}
    >
      <LinearGradient colors={[def.colors.bg, COLORS.bgCard]} style={styles.cardGrad}>
        <CreatureSvg type={mon.type} size={CARD_SIZE - 20} />
        <Text style={[styles.cardRarity, { color: rarityColor }]}>
          {def.rarity === 'legendary' ? '★' : def.rarity === 'rare' ? '◆' : def.rarity === 'uncommon' ? '●' : '·'}
        </Text>
        <Text style={styles.cardName} numberOfLines={1}>{mon.nickname || def.name}</Text>
        <Text style={styles.cardLv}>Lv {mon.level}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function DetailModal({ mon, onClose }) {
  const def = CREATURES[mon.type];
  if (!def) return null;
  const stats = {
    hp:      getStatForLevel(def.baseStats.hp,      mon.level),
    attack:  getStatForLevel(def.baseStats.attack,  mon.level),
    defense: getStatForLevel(def.baseStats.defense, mon.level),
    speed:   getStatForLevel(def.baseStats.speed,   mon.level),
  };
  const maxStat = 180;
  const typeColor = TYPE_COLORS[def.type];
  const rarityColor = RARITY_COLORS[def.rarity];

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalSheet, { borderColor: typeColor + '60' }]}>
          <LinearGradient colors={[def.colors.bg, COLORS.bgCard, COLORS.bg]} style={styles.modalGrad}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Close */}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>

              {/* Sprite */}
              <View style={styles.modalSprite}>
                <CreatureSvg type={mon.type} size={170} />
              </View>

              {/* Name and badges */}
              <Text style={styles.modalName}>{mon.nickname || def.name}</Text>
              {mon.nickname && <Text style={styles.modalOrigName}>{def.name}</Text>}

              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: typeColor + 'CC' }]}>
                  <Text style={styles.badgeText}>{def.type}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: rarityColor + 'AA' }]}>
                  <Text style={styles.badgeText}>{def.rarity.toUpperCase()}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: COLORS.bgCardLight }]}>
                  <Text style={styles.badgeText}>LV {mon.level}</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.modalDesc}>{def.description}</Text>

              {/* Stats */}
              <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>Battle Stats</Text>
                <StatBar label="HP"  value={stats.hp}      max={maxStat} color={COLORS.success} />
                <StatBar label="ATK" value={stats.attack}   max={maxStat} color={COLORS.danger} />
                <StatBar label="DEF" value={stats.defense}  max={maxStat} color={COLORS.info} />
                <StatBar label="SPD" value={stats.speed}    max={maxStat} color={COLORS.warning} />
              </View>

              {/* Moves */}
              <View style={styles.movesSection}>
                <Text style={styles.sectionTitle}>Moves</Text>
                {def.moves.map(move => (
                  <View key={move.name} style={styles.moveRow}>
                    <View style={styles.moveLeft}>
                      <Text style={styles.moveName}>{move.name}</Text>
                      <Text style={styles.moveDesc}>{move.description}</Text>
                    </View>
                    <View style={styles.moveRight}>
                      <View style={[styles.moveBadge, { backgroundColor: typeColor + '88' }]}>
                        <Text style={styles.moveBadgeText}>{move.type}</Text>
                      </View>
                      <Text style={styles.movePower}>PWR {move.power}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Caught date */}
              <Text style={styles.caughtDate}>
                Caught {new Date(mon.caughtAt || Date.now()).toLocaleDateString()}
              </Text>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

export default function CollectionScreen() {
  const { collection } = useGame();
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    if (filter === 'All') return collection;
    return collection.filter(m => CREATURES[m.type]?.type === filter);
  }, [collection, filter]);

  const seenTypes = useMemo(() => {
    const s = new Set(collection.map(m => CREATURES[m.type]?.type));
    return ['All', ...TYPES.slice(1).filter(t => s.has(t))];
  }, [collection]);

  return (
    <LinearGradient colors={[COLORS.bg, COLORS.bgCard]} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>WildMon Collection</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{collection.length}</Text>
          </View>
        </View>

        {/* Type filter */}
        {seenTypes.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
            {seenTypes.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.filterChip, filter === t && styles.filterChipActive, filter === t && { backgroundColor: (TYPE_COLORS[t] || COLORS.primary) + 'CC' }]}
                onPress={() => setFilter(t)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, filter === t && styles.filterTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Grid */}
        {collection.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌿</Text>
            <Text style={styles.emptyTitle}>No WildMons yet!</Text>
            <Text style={styles.emptySubtitle}>Head to the Map and catch some.</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(_, i) => String(i)}
            numColumns={3}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => <MonCard mon={item} onPress={setSelected} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>

      {selected && <DetailModal mon={selected} onClose={() => setSelected(null)} />}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  headerTitle: { flex: 1, color: COLORS.textPrimary, fontSize: FONTS.size.xl, fontWeight: FONTS.weight.black },
  countBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full },
  countText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: FONTS.weight.bold },

  filterScroll: { maxHeight: 46 },
  filterRow: { paddingHorizontal: 12, gap: 8, alignItems: 'center' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { borderColor: 'transparent' },
  filterText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, fontWeight: FONTS.weight.medium },
  filterTextActive: { color: '#fff', fontWeight: FONTS.weight.bold },

  grid: { padding: 12, gap: 8 },
  card: {
    width: CARD_SIZE, height: CARD_SIZE + 30, borderRadius: RADIUS.md,
    overflow: 'hidden', borderWidth: 1.5, margin: 4, ...SHADOW.card,
  },
  cardGrad: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 4 },
  cardRarity: { position: 'absolute', top: 6, right: 8, fontSize: 12, fontWeight: FONTS.weight.bold },
  cardName: { color: COLORS.textPrimary, fontSize: 10, fontWeight: FONTS.weight.bold, marginTop: 4 },
  cardLv: { color: COLORS.textMuted, fontSize: 9 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: FONTS.size.xl, fontWeight: FONTS.weight.bold },
  emptySubtitle: { color: COLORS.textSecondary, fontSize: FONTS.size.base },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(13,2,33,0.85)', justifyContent: 'flex-end' },
  modalSheet: { maxHeight: '92%', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', borderWidth: 1 },
  modalGrad: { flex: 1 },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 8 },
  closeText: { color: COLORS.textSecondary, fontSize: FONTS.size.xl },
  modalSprite: { alignItems: 'center', paddingTop: 24 },
  modalName: { color: COLORS.textPrimary, fontSize: FONTS.size.xxl, fontWeight: FONTS.weight.black, textAlign: 'center', paddingHorizontal: 20, marginTop: 8 },
  modalOrigName: { color: COLORS.textMuted, fontSize: FONTS.size.sm, textAlign: 'center' },
  badgeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8, marginBottom: 4 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: RADIUS.full },
  badgeText: { color: '#fff', fontSize: FONTS.size.xs, fontWeight: FONTS.weight.bold },
  modalDesc: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, textAlign: 'center', paddingHorizontal: 24, marginVertical: 12 },

  statsSection: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONTS.size.base, fontWeight: FONTS.weight.bold, marginBottom: 10 },

  movesSection: { paddingHorizontal: 20, marginBottom: 12 },
  moveRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  moveLeft: { flex: 1, gap: 2 },
  moveName: { color: COLORS.textPrimary, fontSize: FONTS.size.md, fontWeight: FONTS.weight.bold },
  moveDesc: { color: COLORS.textMuted, fontSize: FONTS.size.xs },
  moveRight: { alignItems: 'flex-end', gap: 4 },
  moveBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  moveBadgeText: { color: '#fff', fontSize: 9, fontWeight: FONTS.weight.bold },
  movePower: { color: COLORS.accent, fontSize: FONTS.size.xs, fontWeight: FONTS.weight.bold },
  caughtDate: { color: COLORS.textMuted, fontSize: FONTS.size.xs, textAlign: 'center', marginBottom: 32 },
});
