// Replace SERVER_URL with your Railway / ngrok deployment URL.
// In development, use your machine's LAN IP if testing on a real device.
export const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3000';

export const SOCKET_URL = SERVER_URL;

// Distance in meters the player must be to catch a WildMon
export const CATCH_DISTANCE_METERS = 80;

// How many creatures to show on the map at once
export const MAX_MAP_CREATURES = 8;

// How often to refresh map creatures (ms)
export const MAP_REFRESH_INTERVAL = 90_000;

// Offline creature spawn radius (lat/lng degrees)
export const OFFLINE_SPAWN_RADIUS = 0.006;

// Player location update rate (ms)
export const LOCATION_UPDATE_INTERVAL = 5_000;

export const OFFLINE_CREATURE_COUNT = 6;
