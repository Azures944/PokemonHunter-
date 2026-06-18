import React from 'react';
import { View } from 'react-native';
// Stub for react-native-maps on web — WorldMapScreen.web.js handles the real UI
export default function MapView({ children, style }) { return <View style={style}>{children}</View>; }
export function Marker() { return null; }
export function UrlTile() { return null; }
export const Circle = () => null;
export const Polyline = () => null;
export const Polygon = () => null;
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = null;
