import 'react-native-gesture-handler';
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';

import { GameProvider, useGame } from './src/context/GameContext';
import { COLORS, FONTS } from './src/constants/theme';

import LoginScreen     from './src/screens/LoginScreen';
import WorldMapScreen  from './src/screens/WorldMapScreen';
import CatchScreen     from './src/screens/CatchScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import BattleScreen    from './src/screens/BattleScreen';
import ProfileScreen   from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── Tab Icons ───────────────────────────────────────────────────────────────

function MapIcon({ color, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={color} />
      <Circle cx="12" cy="9" r="2.5" fill={COLORS.bg} />
    </Svg>
  );
}

function BagIcon({ color, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 6V4c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M3 8h18v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" fill={color} opacity="0.85" />
    </Svg>
  );
}

function SwordIcon({ color, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14.5 17.5L3 6V3h3l11.5 11.5-3 3z" fill={color} />
      <Path d="M13 19l6-6 2 2-6 6-2-2z" fill={color} opacity="0.6" />
    </Svg>
  );
}

function UserIcon({ color, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" fill={color} />
      <Path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" fill={color} opacity="0.75" />
    </Svg>
  );
}

// ─── Bottom Tabs ─────────────────────────────────────────────────────────────

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor:   COLORS.primaryLight,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: FONTS.size.xs,
          fontWeight: FONTS.weight.bold,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={WorldMapStack}
        options={{
          tabBarLabel: 'World',
          tabBarIcon: ({ color, size }) => <MapIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Collection"
        component={CollectionScreen}
        options={{
          tabBarLabel: 'Collection',
          tabBarIcon: ({ color, size }) => <BagIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Battle"
        component={BattleScreen}
        options={{
          tabBarLabel: 'Battle',
          tabBarIcon: ({ color, size }) => <SwordIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Stack for world map so CatchScreen can push on top
const WorldStack = createNativeStackNavigator();
function WorldMapStack() {
  return (
    <WorldStack.Navigator screenOptions={{ headerShown: false }}>
      <WorldStack.Screen name="WorldMap" component={WorldMapScreen} />
      <WorldStack.Screen
        name="Catch"
        component={CatchScreen}
        options={{ presentation: 'card', animation: 'slide_from_bottom' }}
      />
    </WorldStack.Navigator>
  );
}

// ─── Root navigator (auth gate) ───────────────────────────────────────────────

function RootNavigator() {
  const { player, loading } = useGame();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {player ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <GameProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </GameProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
});
