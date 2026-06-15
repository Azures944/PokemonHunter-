import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PLAYER:     'wb_player',
  COLLECTION: 'wb_collection',
  SETTINGS:   'wb_settings',
  OFFLINE_Q:  'wb_offline_queue',
};

export async function savePlayer(player) {
  await AsyncStorage.setItem(KEYS.PLAYER, JSON.stringify(player));
}

export async function loadPlayer() {
  const raw = await AsyncStorage.getItem(KEYS.PLAYER);
  return raw ? JSON.parse(raw) : null;
}

export async function clearPlayer() {
  await AsyncStorage.multiRemove([KEYS.PLAYER, KEYS.COLLECTION, KEYS.OFFLINE_Q]);
}

export async function saveCollection(collection) {
  await AsyncStorage.setItem(KEYS.COLLECTION, JSON.stringify(collection));
}

export async function loadCollection() {
  const raw = await AsyncStorage.getItem(KEYS.COLLECTION);
  return raw ? JSON.parse(raw) : [];
}

export async function addToOfflineQueue(action) {
  const raw = await AsyncStorage.getItem(KEYS.OFFLINE_Q);
  const queue = raw ? JSON.parse(raw) : [];
  queue.push({ ...action, queuedAt: Date.now() });
  await AsyncStorage.setItem(KEYS.OFFLINE_Q, JSON.stringify(queue));
}

export async function flushOfflineQueue() {
  const raw = await AsyncStorage.getItem(KEYS.OFFLINE_Q);
  const queue = raw ? JSON.parse(raw) : [];
  await AsyncStorage.removeItem(KEYS.OFFLINE_Q);
  return queue;
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function loadSettings() {
  const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
  return raw ? JSON.parse(raw) : { soundEnabled: true, vibrateEnabled: true };
}
