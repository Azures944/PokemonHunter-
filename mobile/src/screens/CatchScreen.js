import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated, PanResponder,
  Dimensions, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { COLORS, FONTS, RADIUS } from '../constants/theme';
import { CreatureSvg } from '../components/CreatureSprite';
import { CREATURES, TYPE_COLORS } from '../constants/creatures';
import { useGame } from '../context/GameContext';
import { catchCreature } from '../services/api';

const { width, height } = Dimensions.get('window');
const BALL_START_Y = height - 140;
const BALL_START_X = width / 2;

function BindBall({ size = 60 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Circle cx="30" cy="30" r="28" fill="#C77DFF" stroke="#9B30FF" strokeWidth="2" />
      <Path d="M4,30 Q30,18 56,30" fill="#9B30FF" />
      <Path d="M4,30 Q30,42 56,30" fill="#7B2FBE" />
      <Line x1="4" y1="30" x2="56" y2="30" stroke="#FFE45E" strokeWidth="2.5" />
      <Circle cx="30" cy="30" r="8" fill="#1A0A2E" stroke="#FFE45E" strokeWidth="2" />
      <Circle cx="30" cy="30" r="4" fill="#C77DFF" />
      <Circle cx="26" cy="14" r="4" fill="#E8B5FF" opacity="0.5" />
    </Svg>
  );
}

const SHAKE_DURATION = 300;
const PHASES = { IDLE: 'idle', THROWING: 'throwing', SHAKING: 'shaking', CAUGHT: 'caught', ESCAPED: 'escaped' };

export default function CatchScreen({ route, navigation }) {
  const { creature } = route.params;
  const { player, isOnline, addCaught } = useGame();
  const def = CREATURES[creature.type];

  const ballPos = useRef(new Animated.ValueXY({ x: BALL_START_X - 30, y: BALL_START_Y })).current;
  const creatureShake = useRef(new Animated.Value(0)).current;
  const ballScale = useRef(new Animated.Value(1)).current;
  const creatureScale = useRef(new Animated.Value(1)).current;
  const ballOpacity = useRef(new Animated.Value(1)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;

  const [phase, setPhase] = useState(PHASES.IDLE);
  const [shakeCount, setShakeCount] = useState(0);
  const [hint, setHint] = useState('Swipe UP to throw a BindBall!');
  const phaseRef = useRef(PHASES.IDLE);
  phaseRef.current = phase;

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => phaseRef.current === PHASES.IDLE,
    onMoveShouldSetPanResponder: () => phaseRef.current === PHASES.IDLE,
    onPanResponderGrant: () => {
      ballPos.setOffset({ x: ballPos.x._value, y: ballPos.y._value });
      ballPos.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: ballPos.x, dy: ballPos.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (_, g) => {
      ballPos.flattenOffset();
      if (g.dy < -80) {
        throwBall();
      } else {
        // snap back
        Animated.spring(ballPos, {
          toValue: { x: BALL_START_X - 30, y: BALL_START_Y },
          useNativeDriver: false,
        }).start();
      }
    },
  })).current;

  const throwBall = useCallback(() => {
    if (phaseRef.current !== PHASES.IDLE) return;
    setPhase(PHASES.THROWING);
    setHint('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const targetY = height * 0.3;
    const targetX = width / 2 - 30;

    Animated.parallel([
      Animated.timing(ballPos, { toValue: { x: targetX, y: targetY }, duration: 500, useNativeDriver: false }),
      Animated.sequence([
        Animated.timing(ballScale, { toValue: 0.6, duration: 500, useNativeDriver: true }),
      ]),
    ]).start(() => {
      Animated.timing(creatureScale, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        Animated.parallel([
          Animated.timing(ballOpacity, { toValue: 1, useNativeDriver: true, duration: 0 }),
        ]).start();
        setPhase(PHASES.SHAKING);
        setShakeCount(0);
        shakeLoop(0, def?.catchRate ?? 0.5);
      });
    });
  }, []);

  function shakeLoop(count, catchRate) {
    if (count >= 3) {
      resolveCatch(catchRate);
      return;
    }
    setShakeCount(count + 1);
    Animated.sequence([
      Animated.timing(creatureShake, { toValue: 10, duration: SHAKE_DURATION / 4, useNativeDriver: true }),
      Animated.timing(creatureShake, { toValue: -10, duration: SHAKE_DURATION / 4, useNativeDriver: true }),
      Animated.timing(creatureShake, { toValue: 6, duration: SHAKE_DURATION / 4, useNativeDriver: true }),
      Animated.timing(creatureShake, { toValue: 0, duration: SHAKE_DURATION / 4, useNativeDriver: true }),
    ]).start(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => shakeLoop(count + 1, catchRate), 600);
    });
  }

  async function resolveCatch(catchRate) {
    const levelPenalty = Math.max(0, (creature.level - 1) * 0.02);
    const finalRate = Math.max(0.05, catchRate - levelPenalty);
    const caught = Math.random() < finalRate;

    if (caught) {
      setPhase(PHASES.CAUGHT);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setHint('');
      Animated.spring(resultAnim, { toValue: 1, useNativeDriver: true }).start();

      const caughtData = { ...creature, spawnId: creature.id };
      try {
        const res = await catchCreature(player?.id, caughtData, isOnline);
        if (res && !res.offline && res.player) {
          await addCaught(caughtData, res.player);
        } else {
          await addCaught(caughtData, null);
        }
      } catch {
        await addCaught(caughtData, null);
      }
    } else {
      setPhase(PHASES.ESCAPED);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.timing(ballScale, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      Animated.timing(creatureScale, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      setHint(`${def?.name} broke free!`);
    }
  }

  const bgColor = def?.colors?.bg || COLORS.bg;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <LinearGradient
        colors={[bgColor, COLORS.bg]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wild {def?.name} appeared!</Text>
        <View style={[styles.typePill, { backgroundColor: TYPE_COLORS[def?.type] + 'BB' }]}>
          <Text style={styles.typeText}>{def?.type}</Text>
        </View>
      </View>

      {/* Creature info */}
      <View style={styles.creatureInfo}>
        <Text style={styles.creatureName}>{def?.name}</Text>
        <Text style={styles.creatureSub}>Level {creature.level}  ·  {def?.rarity?.toUpperCase()}</Text>
        <Text style={styles.catchRate}>Catch rate: {Math.round((def?.catchRate || 0.5) * 100)}%</Text>
      </View>

      {/* Creature or caught ball */}
      <View style={styles.arenaCenter}>
        <Animated.View style={[styles.creatureArea, {
          transform: [{ translateX: creatureShake }, { scale: creatureScale }],
        }]}>
          {(phase === PHASES.IDLE || phase === PHASES.THROWING || phase === PHASES.ESCAPED) && (
            <CreatureSvg type={creature.type} size={160} />
          )}
        </Animated.View>

        {phase === PHASES.SHAKING && (
          <Animated.View style={[styles.shakingBall, { transform: [{ translateX: creatureShake }] }]}>
            <BindBall size={90} />
            <Text style={styles.shakeCountText}>{'· '.repeat(shakeCount).trim()}</Text>
          </Animated.View>
        )}
      </View>

      {/* Hint text */}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      {/* Result overlay */}
      {(phase === PHASES.CAUGHT || phase === PHASES.ESCAPED) && (
        <Animated.View style={[styles.resultBox, { opacity: resultAnim }]}>
          <LinearGradient
            colors={phase === PHASES.CAUGHT ? ['#1A3A0A', '#2ECC4020'] : ['#3A0A0A', '#CC000020']}
            style={styles.resultGrad}
          >
            <Text style={styles.resultEmoji}>{phase === PHASES.CAUGHT ? '🎉' : '💨'}</Text>
            <Text style={styles.resultTitle}>{phase === PHASES.CAUGHT ? `${def?.name} caught!` : `${def?.name} fled!`}</Text>
            {phase === PHASES.CAUGHT && (
              <Text style={styles.resultSub}>Added to your collection</Text>
            )}
            <TouchableOpacity
              style={styles.resultBtn}
              onPress={() => navigation.navigate('Collection')}
              activeOpacity={0.8}
            >
              <Text style={styles.resultBtnText}>
                {phase === PHASES.CAUGHT ? 'View Collection' : 'Back to Map'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.resultBack}>
              <Text style={styles.resultBackText}>← Back to Map</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Throw area */}
      {phase === PHASES.IDLE && (
        <Animated.View
          style={[styles.ball, {
            transform: [
              ...ballPos.getTranslateTransform(),
              { scale: ballScale },
            ],
          }]}
          {...panResponder.panHandlers}
        >
          <BindBall size={60} />
        </Animated.View>
      )}

      {/* Ball in flight */}
      {phase === PHASES.THROWING && (
        <Animated.View style={[styles.ball, {
          transform: [...ballPos.getTranslateTransform(), { scale: ballScale }],
        }]}>
          <BindBall size={60} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 54, paddingHorizontal: 16,
    paddingBottom: 8, gap: 10,
  },
  backBtn: { padding: 8 },
  backText: { color: COLORS.textSecondary, fontSize: FONTS.size.xl },
  headerTitle: { flex: 1, color: COLORS.textPrimary, fontSize: FONTS.size.base, fontWeight: FONTS.weight.bold },
  typePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  typeText: { color: '#fff', fontSize: FONTS.size.xs, fontWeight: FONTS.weight.bold },

  creatureInfo: { alignItems: 'center', paddingVertical: 8 },
  creatureName: { color: COLORS.textPrimary, fontSize: FONTS.size.xxl, fontWeight: FONTS.weight.black },
  creatureSub: { color: COLORS.textSecondary, fontSize: FONTS.size.sm },
  catchRate: { color: COLORS.accent, fontSize: FONTS.size.sm, marginTop: 4 },

  arenaCenter: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  creatureArea: { alignItems: 'center', justifyContent: 'center' },
  shakingBall: { alignItems: 'center', gap: 12 },
  shakeCountText: { color: COLORS.accent, fontSize: FONTS.size.xl, letterSpacing: 8 },

  hint: {
    color: COLORS.textSecondary, textAlign: 'center', fontSize: FONTS.size.base,
    marginBottom: 120, fontWeight: FONTS.weight.medium,
  },

  ball: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 60,
    height: 60,
    zIndex: 10,
  },

  resultBox: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  resultGrad: {
    width: width - 48, borderRadius: 24, padding: 32,
    alignItems: 'center', gap: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  resultEmoji: { fontSize: 56 },
  resultTitle: { color: COLORS.textPrimary, fontSize: FONTS.size.xl, fontWeight: FONTS.weight.black, textAlign: 'center' },
  resultSub: { color: COLORS.textSecondary, fontSize: FONTS.size.md },
  resultBtn: {
    marginTop: 8, backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    paddingHorizontal: 28, paddingVertical: 13,
  },
  resultBtnText: { color: '#fff', fontSize: FONTS.size.base, fontWeight: FONTS.weight.bold },
  resultBack: { marginTop: 4 },
  resultBackText: { color: COLORS.textMuted, fontSize: FONTS.size.sm },
});
