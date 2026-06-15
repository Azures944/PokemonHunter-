# WildBound 🌿⚡

An open-world monster-hunting mobile game built with **Expo** + **Node.js**.  
Play online or offline, explore the real world, and catch 12 original WildMons!

---

## 🎮 The 12 WildMons

| Name | Type | Rarity | Description |
|------|------|--------|-------------|
| **Flambit** | Fire | Common | Blazing fox with a fiery tail |
| **Aquora** | Water | Common | Graceful jellyfish spirit |
| **Terrox** | Earth | Common | Boulder-bodied rock pup |
| **Zephlyn** | Wind | Uncommon | Silver jet-stream bird |
| **Voltix** | Electric | Uncommon | Spiky electric rodent |
| **Frostara** | Ice | Uncommon | Fluffy ice bear cub |
| **Thornix** | Nature | Uncommon | Vine serpent with leaf wings |
| **Luminos** | Light | Rare | Radiant glowing deer |
| **Shadowmeld** | Shadow | Rare | Living-shadow panther |
| **Crystalix** | Crystal | Rare | Prismatic gemstone moth |
| **Stormclaw** | Storm | Legendary | Hurricane-wing eagle |
| **Emberhound** | Magma | Legendary | Volcanic lava hound |

---

## Quick Start

### 1. Start the backend server

```bash
npm install
npm start
```

### 2. Set up the mobile app

```bash
cd mobile
npm install
```

### 3. Configure server URL

Edit `mobile/src/constants/config.js` and set `SERVER_URL` to your machine's LAN IP or deployed URL.

### 4. Run in Expo Go

```bash
cd mobile
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

---

## Features

- Real-world map (OpenStreetMap, no API key needed)
- BindBall catch mechanic — swipe up to throw
- Turn-based battles vs AI or real players online
- Full WildMon collection with stats and moves
- Online/Offline sync
- Leaderboard
- 12 unique WildMons with original SVG art

## Tech Stack

- Expo SDK 51 + React Native
- react-native-maps + OpenStreetMap
- react-native-svg for creature artwork
- React Navigation v6
- Socket.io for real-time online play
- Node.js + Express backend
- Railway for deployment
