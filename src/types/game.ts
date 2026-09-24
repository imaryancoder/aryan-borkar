/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SplatterType = 'neon' | 'paintball' | 'arcade_sparks' | 'retro_pixel';
export type DayNightCycle = 'day' | 'sunset' | 'night' | 'cyberpunk';
export type WeatherType = 'clear' | 'rain' | 'fog';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  splatterType: SplatterType;
  environment: DayNightCycle;
  weather: WeatherType;
  infiniteAmmo: boolean;
  spawnRate: number; // 1 to 5
  screenShake: boolean;
}

export interface Player {
  x: number;
  y: number;
  radius: number;
  angle: number; // in radians pointing to crosshair
  speed: number;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  reloadProgress: number; // 0 to 1
  shotsFired: number;
  kills: number;
  recoilOffset: number;
  facing: 'left' | 'right';
  walkCycle: number;
  isMoving: boolean;
}

export interface Pedestrian {
  id: string;
  x: number;
  y: number;
  radius: number;
  targetY: number;
  vx: number;
  vy: number;
  speed: number;
  direction: 'left' | 'right';
  clothesColor: string;
  pantsColor: string;
  skinColor: string;
  hairColor: string;
  accessory: 'hat' | 'phone' | 'bag' | 'none';
  state: 'walking' | 'scared' | 'fleeing';
  scaredTimer: number;
  walkCycle: number;
  health: number;
  maxHealth: number;
  pointsValue: number; // standard: 1 point
  lane: 'sidewalk_top' | 'road_upper' | 'road_lower' | 'sidewalk_bottom' | 'crossing';
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  distanceTraveled: number;
  maxDistance: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  type: 'spark' | 'smoke' | 'splatter' | 'rain' | 'casing';
  rotation?: number;
  rotationSpeed?: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  alpha: number;
  vy: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  kills: number;
  shotsFired: number;
  shotsHit: number;
  combo: number;
  maxCombo: number;
  timeSurvived: number;
}
