import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

export default function StatBar({ label, value, max, color, showValue = true, height = 10 }) {
  const anim = useRef(new Animated.Value(0)).current;
  const pct = Math.max(0, Math.min(1, value / max));

  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 600, useNativeDriver: false }).start();
  }, [pct]);

  const barColor = color || (pct > 0.5 ? COLORS.success : pct > 0.25 ? COLORS.warning : COLORS.danger);

  return (
    <View style={styles.row}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.track, { height, flex: 1 }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              backgroundColor: barColor,
              width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
      {showValue ? (
        <Text style={styles.value}>{value}/{max}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 3,
  },
  label: {
    width: 36,
    color: COLORS.textSecondary,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
  },
  track: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 99,
    overflow: 'hidden',
    flex: 1,
  },
  fill: {
    borderRadius: 99,
  },
  value: {
    width: 54,
    color: COLORS.textPrimary,
    fontSize: FONTS.size.xs,
    textAlign: 'right',
  },
});
