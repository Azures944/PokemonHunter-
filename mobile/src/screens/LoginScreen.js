import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Polygon, Ellipse, G } from 'react-native-svg';
import { COLORS, FONTS, RADIUS } from '../constants/theme';
import { registerPlayer } from '../services/api';
import { useGame } from '../context/GameContext';

function LogoSvg() {
  return (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      <Circle cx="60" cy="60" r="56" fill="#1A0A2E" stroke="#9B30FF" strokeWidth="3" />
      {/* Globe lines */}
      <Ellipse cx="60" cy="60" rx="40" ry="40" fill="none" stroke="#4A1A7E" strokeWidth="1" />
      <Ellipse cx="60" cy="60" rx="20" ry="40" fill="none" stroke="#4A1A7E" strokeWidth="1" />
      <Path d="M20,60 L100,60" stroke="#4A1A7E" strokeWidth="1" />
      <Path d="M30,40 L90,40" stroke="#4A1A7E" strokeWidth="1" />
      <Path d="M30,80 L90,80" stroke="#4A1A7E" strokeWidth="1" />
      {/* Creature silhouette */}
      <Circle cx="60" cy="52" r="14" fill="#9B30FF" />
      <Polygon points="50,42 44,30 58,40" fill="#9B30FF" />
      <Polygon points="70,42 76,30 62,40" fill="#9B30FF" />
      <Circle cx="54" cy="50" r="3.5" fill="#FFE45E" />
      <Circle cx="66" cy="50" r="3.5" fill="#FFE45E" />
      {/* BindBall */}
      <Circle cx="60" cy="78" r="12" fill="#C77DFF" />
      <Path d="M49,78 L71,78" stroke="#1A0A2E" strokeWidth="2" />
      <Circle cx="60" cy="78" r="4" fill="#1A0A2E" stroke="#C77DFF" strokeWidth="1.5" />
    </Svg>
  );
}

export default function LoginScreen() {
  const { login } = useGame();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  async function handleStart() {
    const name = username.trim();
    if (name.length < 2) {
      setError('Name must be at least 2 characters.');
      shake();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { player } = await registerPlayer(name);
      await login(player);
    } catch {
      // Offline fallback: create local player
      const offlinePlayer = {
        id: `local_${Date.now()}`,
        username: name,
        level: 1, xp: 0, xpToNext: 100,
        collection: [], catchCount: 0,
        battleWins: 0, battleLosses: 0,
        createdAt: Date.now(), offline: true,
      };
      await login(offlinePlayer);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#0D0221', '#1A0A2E', '#260C45']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <View style={styles.logoArea}>
          <LogoSvg />
          <Text style={styles.title}>WildBound</Text>
          <Text style={styles.subtitle}>Hunt. Catch. Battle.</Text>
        </View>

        <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={styles.label}>Choose your Hunter name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name..."
            placeholderTextColor={COLORS.textMuted}
            value={username}
            onChangeText={t => { setUsername(t); setError(''); }}
            maxLength={20}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleStart}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleStart}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#9B30FF', '#C77DFF']} style={styles.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Start Adventure</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.features}>
          {[
            ['🗺️', 'Explore the real world'],
            ['⚡', '12 unique WildMons to catch'],
            ['🌐', 'Play online or offline'],
          ].map(([icon, text]) => (
            <View key={text} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{icon}</Text>
              <Text style={styles.featureText}>{text}</Text>
            </View>
          ))}
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  logoArea: { alignItems: 'center', marginBottom: 40 },
  title: {
    fontSize: FONTS.size.hero,
    fontWeight: FONTS.weight.black,
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginTop: 16,
  },
  subtitle: {
    fontSize: FONTS.size.lg,
    color: COLORS.primaryLight,
    letterSpacing: 4,
    marginTop: 4,
    fontWeight: FONTS.weight.medium,
  },
  form: { width: '100%', marginBottom: 32 },
  label: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginBottom: 8, fontWeight: FONTS.weight.bold },
  input: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: 16,
    color: COLORS.textPrimary,
    fontSize: FONTS.size.base,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  error: { color: COLORS.danger, fontSize: FONTS.size.sm, marginBottom: 8 },
  btn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnGrad: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: FONTS.size.lg, fontWeight: FONTS.weight.bold, letterSpacing: 1 },
  features: { gap: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureIcon: { fontSize: 20 },
  featureText: { color: COLORS.textSecondary, fontSize: FONTS.size.md },
});
