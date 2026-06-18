import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  ScrollView, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SHADOW } from '../constants/theme';
import { CreatureSvg } from '../components/CreatureSprite';
import StatBar from '../components/StatBar';
import { CREATURES, TYPE_COLORS, buildLiveMon, calcDamage } from '../constants/creatures';
import { useGame } from '../context/GameContext';

const AI_NAMES = ['Rivax', 'Seraphyne', 'Korruk', 'Lumineth', 'Zarvok', 'Echidria'];
const AI_MONS = ['zephlyn', 'voltix', 'frostara', 'aquora', 'thornix', 'shadowmeld'];

function buildAiTeam(playerLevel) {
  const name = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
  const type = AI_MONS[Math.floor(Math.random() * AI_MONS.length)];
  const level = Math.max(1, playerLevel + Math.floor(Math.random() * 5) - 2);
  const mon = buildLiveMon({ id: 'ai_mon', type, level });
  return { name, mon };
}

const PHASES = { SELECT_MON: 'select_mon', BATTLING: 'battling', MOVE_SELECT: 'move_select', ANIMATING: 'animating', WIN: 'win', LOSE: 'lose' };

function HPBar({ current, max, color }) {
  const pct = Math.max(0, current / max);
  return (
    <View style={hpStyles.track}>
      <View style={[hpStyles.fill, { width: `${pct * 100}%`, backgroundColor: color || (pct > 0.5 ? COLORS.success : pct > 0.25 ? COLORS.warning : COLORS.danger) }]} />
    </View>
  );
}

const hpStyles = StyleSheet.create({
  track: { height: 10, backgroundColor: COLORS.bgCard, borderRadius: 99, overflow: 'hidden', width: '100%' },
  fill: { height: 10, borderRadius: 99 },
});

export default function BattleScreen() {
  const { collection, player, isOnline } = useGame();
  const [phase, setPhase] = useState(PHASES.SELECT_MON);
  const [playerMon, setPlayerMon] = useState(null);
  const [aiInfo, setAiInfo] = useState(null);
  const [playerHp, setPlayerHp] = useState(0);
  const [aiHp, setAiHp] = useState(0);
  const [log, setLog] = useState([]);
  const [selectedMon, setSelectedMon] = useState(null);
  const logRef = useRef(null);

  const playerShake = useRef(new Animated.Value(0)).current;
  const aiShake = useRef(new Animated.Value(0)).current;

  function shake(anim, cb) {
    Animated.sequence([
      Animated.timing(anim, { toValue: 12, duration: 80, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -12, duration: 80, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 8, duration: 80, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start(cb);
  }

  function startBattle(mon) {
    const live = buildLiveMon(mon);
    const ai = buildAiTeam(player?.level || 1);
    setPlayerMon(live);
    setAiInfo(ai);
    setPlayerHp(live.stats.hp);
    setAiHp(ai.mon.stats.hp);
    setLog([`⚔️ Battle Start!`, `You sent out ${live.name}!`, `${ai.name} sent out ${ai.mon.name}!`]);
    setPhase(PHASES.MOVE_SELECT);
  }

  const addLog = useCallback((msg) => {
    setLog(prev => [...prev, msg]);
    setTimeout(() => logRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const executeMove = useCallback(async (move) => {
    if (phase !== PHASES.MOVE_SELECT) return;
    setPhase(PHASES.ANIMATING);

    const pMon = playerMon;
    const aMon = aiInfo.mon;

    // AI picks a random move
    const aiMove = aMon.moves[Math.floor(Math.random() * aMon.moves.length)];

    const pFirst = pMon.stats.speed >= aMon.stats.speed;
    let curAiHp = aiHp;
    let curPHp = playerHp;

    async function doTurn(attacker, attackerMon, defender, defenderMon, usedMove, isPlayer) {
      const dmg = calcDamage(
        { level: attackerMon.level || 1, stats: attackerMon.stats },
        { type: defenderMon.type, stats: defenderMon.stats },
        usedMove
      );
      addLog(`${attackerMon.name} used ${usedMove.name}! (${dmg} dmg)`);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return new Promise(resolve => {
        shake(isPlayer ? aiShake : playerShake, resolve);
        if (isPlayer) { curAiHp = Math.max(0, curAiHp - dmg); setAiHp(curAiHp); }
        else { curPHp = Math.max(0, curPHp - dmg); setPlayerHp(curPHp); }
      });
    }

    if (pFirst) {
      await doTurn(null, pMon, aMon, aMon, move, true);
      if (curAiHp <= 0) { setPhase(PHASES.WIN); return; }
      await new Promise(r => setTimeout(r, 600));
      await doTurn(null, aMon, pMon, pMon, aiMove, false);
      if (curPHp <= 0) { setPhase(PHASES.LOSE); return; }
    } else {
      await doTurn(null, aMon, pMon, pMon, aiMove, false);
      if (curPHp <= 0) { setPhase(PHASES.LOSE); return; }
      await new Promise(r => setTimeout(r, 600));
      await doTurn(null, pMon, aMon, aMon, move, true);
      if (curAiHp <= 0) { setPhase(PHASES.WIN); return; }
    }

    setPhase(PHASES.MOVE_SELECT);
  }, [phase, playerMon, aiInfo, playerHp, aiHp, addLog]);

  if (phase === PHASES.SELECT_MON) {
    const available = collection.filter(m => CREATURES[m.type]);
    return (
      <LinearGradient colors={[COLORS.bg, COLORS.bgCard]} style={styles.screen}>
        <SafeAreaView style={styles.safe}>
          <Text style={styles.title}>Choose Your Fighter</Text>
          <Text style={styles.subtitle}>Select a WildMon to battle</Text>
          {available.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>⚔️</Text>
              <Text style={styles.emptyTitle}>No WildMons!</Text>
              <Text style={styles.emptyText}>Catch some WildMons on the Map first.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.monList}>
              {available.map((mon, i) => {
                const def = CREATURES[mon.type];
                const live = buildLiveMon(mon);
                return (
                  <TouchableOpacity key={i} style={[styles.monCard, selectedMon === i && styles.monCardSelected]} onPress={() => setSelectedMon(i)} activeOpacity={0.8}>
                    <LinearGradient colors={[def.colors.bg, COLORS.bgCard]} style={styles.monCardGrad}>
                      <CreatureSvg type={mon.type} size={72} />
                      <View style={styles.monCardInfo}>
                        <Text style={styles.monCardName}>{mon.nickname || def.name}</Text>
                        <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[def.type] + 'BB' }]}>
                          <Text style={styles.typeBadgeText}>{def.type}</Text>
                        </View>
                        <Text style={styles.monCardSub}>Lv {mon.level}  ·  HP {live.stats.hp}  ·  ATK {live.stats.attack}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
          {selectedMon !== null && (
            <TouchableOpacity style={styles.startBtn} onPress={() => startBattle(available[selectedMon])} activeOpacity={0.85}>
              <LinearGradient colors={['#9B30FF', '#C77DFF']} style={styles.startBtnGrad}>
                <Text style={styles.startBtnText}>⚔️ Battle!</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const def = playerMon ? CREATURES[playerMon.type] : null;
  const aiDef = aiInfo ? CREATURES[aiInfo.mon.type] : null;

  return (
    <LinearGradient colors={[COLORS.bg, '#0A0018']} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        {/* Arena */}
        <View style={styles.arena}>
          {/* AI side */}
          <View style={styles.combatantBlock}>
            <Text style={styles.trainerName}>{aiInfo?.name}</Text>
            <Text style={styles.monName}>{aiInfo?.mon.name}</Text>
            <HPBar current={aiHp} max={aiInfo?.mon.stats.hp || 1} />
            <Text style={styles.hpText}>{aiHp} / {aiInfo?.mon.stats.hp}</Text>
          </View>

          {/* Sprites */}
          <View style={styles.spritesRow}>
            <Animated.View style={{ transform: [{ translateX: aiShake }] }}>
              <CreatureSvg type={aiInfo?.mon.type || 'flambit'} size={130} />
            </Animated.View>
            <Text style={styles.vsText}>VS</Text>
            <Animated.View style={[styles.playerSpriteFlip, { transform: [{ translateX: playerShake }] }]}>
              <CreatureSvg type={playerMon?.type || 'flambit'} size={130} />
            </Animated.View>
          </View>

          {/* Player side */}
          <View style={[styles.combatantBlock, styles.playerBlock]}>
            <Text style={styles.trainerName}>You</Text>
            <Text style={styles.monName}>{playerMon?.name}</Text>
            <HPBar current={playerHp} max={playerMon?.stats.hp || 1} />
            <Text style={styles.hpText}>{playerHp} / {playerMon?.stats.hp}</Text>
          </View>
        </View>

        {/* Battle log */}
        <ScrollView ref={logRef} style={styles.logBox} showsVerticalScrollIndicator={false}>
          {log.map((l, i) => <Text key={i} style={styles.logLine}>{l}</Text>)}
        </ScrollView>

        {/* Move buttons or result */}
        {(phase === PHASES.MOVE_SELECT || phase === PHASES.ANIMATING) && (
          <View style={styles.movesGrid}>
            {playerMon?.moves.map(move => (
              <TouchableOpacity
                key={move.name}
                style={[styles.moveBtn, phase === PHASES.ANIMATING && styles.moveBtnDisabled,
                  { borderColor: TYPE_COLORS[move.type] + '88' }]}
                onPress={() => executeMove(move)}
                disabled={phase === PHASES.ANIMATING}
                activeOpacity={0.75}
              >
                <Text style={styles.moveBtnName}>{move.name}</Text>
                <Text style={styles.moveBtnPower}>PWR {move.power}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {(phase === PHASES.WIN || phase === PHASES.LOSE) && (
          <View style={[styles.resultBox, { backgroundColor: phase === PHASES.WIN ? '#0A2A0A' : '#2A0A0A' }]}>
            <Text style={styles.resultEmoji}>{phase === PHASES.WIN ? '🏆' : '💀'}</Text>
            <Text style={styles.resultTitle}>{phase === PHASES.WIN ? 'Victory!' : 'Defeated!'}</Text>
            <Text style={styles.resultSub}>{phase === PHASES.WIN ? `You beat ${aiInfo?.name}!` : `${aiInfo?.name} won this time…`}</Text>
            <TouchableOpacity style={styles.rematchBtn} onPress={() => setPhase(PHASES.SELECT_MON)} activeOpacity={0.85}>
              <Text style={styles.rematchText}>Battle Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 16 },
  title: { color: COLORS.textPrimary, fontSize: FONTS.size.xxl, fontWeight: FONTS.weight.black, textAlign: 'center', marginTop: 8 },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, textAlign: 'center', marginBottom: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: FONTS.size.xl, fontWeight: FONTS.weight.bold },
  emptyText: { color: COLORS.textSecondary, fontSize: FONTS.size.base, textAlign: 'center' },

  monList: { gap: 10, paddingBottom: 20 },
  monCard: { borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1.5, borderColor: COLORS.border, ...SHADOW.card },
  monCardSelected: { borderColor: COLORS.primary },
  monCardGrad: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  monCardInfo: { flex: 1, gap: 4 },
  monCardName: { color: COLORS.textPrimary, fontSize: FONTS.size.lg, fontWeight: FONTS.weight.bold },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full },
  typeBadgeText: { color: '#fff', fontSize: FONTS.size.xs, fontWeight: FONTS.weight.bold },
  monCardSub: { color: COLORS.textMuted, fontSize: FONTS.size.xs },

  startBtn: { borderRadius: RADIUS.md, overflow: 'hidden', marginVertical: 12 },
  startBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  startBtnText: { color: '#fff', fontSize: FONTS.size.lg, fontWeight: FONTS.weight.bold },

  arena: { gap: 8 },
  combatantBlock: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: 10, borderWidth: 1, borderColor: COLORS.border },
  playerBlock: { borderColor: COLORS.primary + '66' },
  trainerName: { color: COLORS.textMuted, fontSize: FONTS.size.xs },
  monName: { color: COLORS.textPrimary, fontSize: FONTS.size.lg, fontWeight: FONTS.weight.bold, marginBottom: 6 },
  hpText: { color: COLORS.textSecondary, fontSize: FONTS.size.xs, textAlign: 'right', marginTop: 3 },

  spritesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 8 },
  playerSpriteFlip: { transform: [{ scaleX: -1 }] },
  vsText: { color: COLORS.textMuted, fontSize: FONTS.size.xl, fontWeight: FONTS.weight.black },

  logBox: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: 10, marginVertical: 8, borderWidth: 1, borderColor: COLORS.border, maxHeight: 100 },
  logLine: { color: COLORS.textSecondary, fontSize: FONTS.size.xs, marginBottom: 2 },

  movesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  moveBtn: { flex: 1, minWidth: '45%', backgroundColor: COLORS.bgCardLight, borderRadius: RADIUS.md, padding: 12, borderWidth: 1, alignItems: 'center', gap: 4 },
  moveBtnDisabled: { opacity: 0.4 },
  moveBtnName: { color: COLORS.textPrimary, fontSize: FONTS.size.sm, fontWeight: FONTS.weight.bold, textAlign: 'center' },
  moveBtnPower: { color: COLORS.accent, fontSize: FONTS.size.xs },

  resultBox: { borderRadius: RADIUS.xl, padding: 24, alignItems: 'center', gap: 10, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  resultEmoji: { fontSize: 52 },
  resultTitle: { color: COLORS.textPrimary, fontSize: FONTS.size.xxl, fontWeight: FONTS.weight.black },
  resultSub: { color: COLORS.textSecondary, fontSize: FONTS.size.base },
  rematchBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 28, paddingVertical: 12, marginTop: 6 },
  rematchText: { color: '#fff', fontSize: FONTS.size.base, fontWeight: FONTS.weight.bold },
});
