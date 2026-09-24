/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Bullet, FloatingText, GameSettings, GameStats, Particle, Pedestrian, Player } from '../types/game';
import { soundManager } from '../utils/audio';

interface GameCanvasProps {
  settings: GameSettings;
  stats: GameStats;
  onUpdateStats: (updater: (prev: GameStats) => GameStats) => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

const SHIRT_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#e11d48',
  '#d97706', '#059669', '#2563eb', '#7c3aed', '#f97316'
];
const PANTS_COLORS = ['#1e293b', '#334155', '#475569', '#0f172a', '#1e1b4b', '#312e81', '#262626'];
const SKIN_TONES = ['#fcd34d', '#fbcfe8', '#fed7aa', '#fca5a5', '#d97706', '#b45309', '#78350f'];
const HAIR_COLORS = ['#171717', '#451a03', '#78350f', '#eab308', '#ca8a04', '#a8a29e', '#525252'];

export const GameCanvas: React.FC<GameCanvasProps> = ({
  settings,
  stats,
  onUpdateStats,
  isPaused,
  onTogglePause,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Crosshair state
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 400, y: 300 });
  const isMouseDownRef = useRef<boolean>(false);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const shakeRef = useRef<number>(0);

  // Entities
  const playerRef = useRef<Player>({
    x: 400,
    y: 420,
    radius: 18,
    angle: 0,
    speed: 3.5,
    ammo: 12,
    maxAmmo: 12,
    isReloading: false,
    reloadProgress: 0,
    shotsFired: 0,
    kills: 0,
    recoilOffset: 0,
    facing: 'right',
    walkCycle: 0,
    isMoving: false,
  });

  const pedestriansRef = useRef<Pedestrian[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const lastShootRef = useRef<number>(0);
  const lastComboHitRef = useRef<number>(0);

  // Virtual joystick for mobile
  const [touchAimActive, setTouchAimActive] = useState(false);

  // Helper to spawn a new pedestrian
  const spawnPedestrian = useCallback((canvasWidth: number, canvasHeight: number) => {
    const fromLeft = Math.random() > 0.5;
    const roadTop = canvasHeight * 0.28;
    const roadBottom = canvasHeight * 0.72;
    const sidewalkTop = canvasHeight * 0.16;
    const sidewalkBottom = canvasHeight * 0.84;

    // Pick lane
    const laneChoice = Math.random();
    let y = roadTop + Math.random() * (roadBottom - roadTop);
    let lane: Pedestrian['lane'] = 'road_upper';

    if (laneChoice < 0.3) {
      y = sidewalkTop + (Math.random() * 20 - 10);
      lane = 'sidewalk_top';
    } else if (laneChoice > 0.7) {
      y = sidewalkBottom + (Math.random() * 20 - 10);
      lane = 'sidewalk_bottom';
    } else if (laneChoice > 0.5) {
      lane = 'road_lower';
    }

    const direction = fromLeft ? 'right' : 'left';
    const baseSpeed = 1.0 + Math.random() * 1.5;
    const vx = direction === 'right' ? baseSpeed : -baseSpeed;
    const x = fromLeft ? -30 : canvasWidth + 30;

    const accessories: Pedestrian['accessory'][] = ['hat', 'phone', 'bag', 'none'];
    const acc = accessories[Math.floor(Math.random() * accessories.length)];

    const newPed: Pedestrian = {
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      radius: 14,
      targetY: y,
      vx,
      vy: 0,
      speed: baseSpeed,
      direction,
      clothesColor: SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)],
      pantsColor: PANTS_COLORS[Math.floor(Math.random() * PANTS_COLORS.length)],
      skinColor: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
      accessory: acc,
      state: 'walking',
      scaredTimer: 0,
      walkCycle: Math.random() * Math.PI * 2,
      health: 1,
      maxHealth: 1,
      pointsValue: 1,
      lane,
    };

    pedestriansRef.current.push(newPed);
  }, []);

  // Reload trigger
  const triggerReload = useCallback(() => {
    const p = playerRef.current;
    if (p.isReloading || p.ammo === p.maxAmmo) return;
    p.isReloading = true;
    p.reloadProgress = 0;
    if (settings.soundEnabled) {
      soundManager.playReload();
    }
  }, [settings.soundEnabled]);

  // Fire weapon
  const fireBullet = useCallback(() => {
    const p = playerRef.current;
    const now = performance.now();
    if (now - lastShootRef.current < 160) return; // Fire rate throttle

    if (p.isReloading) return;

    if (!settings.infiniteAmmo && p.ammo <= 0) {
      if (settings.soundEnabled) soundManager.playEmptyClick();
      triggerReload();
      return;
    }

    lastShootRef.current = now;
    if (!settings.infiniteAmmo) {
      p.ammo--;
    }

    p.shotsFired++;
    p.recoilOffset = 8;
    if (settings.screenShake) {
      shakeRef.current = 5;
    }

    if (settings.soundEnabled) {
      soundManager.playGunshot();
    }

    // Gun muzzle position
    const gunLength = 28;
    const muzzleX = p.x + Math.cos(p.angle) * gunLength;
    const muzzleY = p.y + Math.sin(p.angle) * gunLength;

    // Bullet direction with tiny spread
    const spread = (Math.random() - 0.5) * 0.04;
    const bulletAngle = p.angle + spread;
    const bulletSpeed = 22;

    bulletsRef.current.push({
      id: Math.random().toString(),
      x: muzzleX,
      y: muzzleY,
      vx: Math.cos(bulletAngle) * bulletSpeed,
      vy: Math.sin(bulletAngle) * bulletSpeed,
      distanceTraveled: 0,
      maxDistance: 900,
    });

    // Muzzle flash particles
    for (let i = 0; i < 6; i++) {
      const pAngle = bulletAngle + (Math.random() - 0.5) * 0.8;
      const pSpeed = 3 + Math.random() * 5;
      particlesRef.current.push({
        id: Math.random().toString(),
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(pAngle) * pSpeed,
        vy: Math.sin(pAngle) * pSpeed,
        color: Math.random() > 0.5 ? '#f59e0b' : '#fbbf24',
        size: 3 + Math.random() * 3,
        alpha: 1,
        decay: 0.1,
        type: 'spark',
      });
    }

    // Smoke puff
    particlesRef.current.push({
      id: Math.random().toString(),
      x: muzzleX,
      y: muzzleY,
      vx: Math.cos(bulletAngle) * 1.5,
      vy: Math.sin(bulletAngle) * 1.5 - 0.5,
      color: '#94a3b8',
      size: 8,
      alpha: 0.6,
      decay: 0.03,
      type: 'smoke',
    });

    // Ejected shell casing
    const casingAngle = p.angle + (p.facing === 'right' ? Math.PI / 2 : -Math.PI / 2) + (Math.random() - 0.5) * 0.4;
    particlesRef.current.push({
      id: Math.random().toString(),
      x: p.x + Math.cos(p.angle) * 10,
      y: p.y + Math.sin(p.angle) * 10,
      vx: Math.cos(casingAngle) * (2 + Math.random() * 2),
      vy: Math.sin(casingAngle) * (2 + Math.random() * 2) - 1,
      color: '#d97706',
      size: 4,
      alpha: 1,
      decay: 0.02,
      type: 'casing',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
    });

    // Scare nearby pedestrians
    pedestriansRef.current.forEach((ped) => {
      const dist = Math.hypot(ped.x - p.x, ped.y - p.y);
      if (dist < 320) {
        ped.state = 'scared';
        ped.scaredTimer = 180; // 3 seconds at 60fps
        ped.vx = (ped.direction === 'right' ? 1 : -1) * (ped.speed * 2.2);
      }
    });

    onUpdateStats((prev) => ({
      ...prev,
      shotsFired: prev.shotsFired + 1,
    }));
  }, [settings.infiniteAmmo, settings.screenShake, settings.soundEnabled, triggerReload, onUpdateStats]);

  // Handle elimination / impact effects
  const triggerImpact = useCallback((victim: Pedestrian, impactX: number, impactY: number) => {
    // 1 Kill = 1 Point rule!
    const now = performance.now();
    const comboTime = 2500; // 2.5 seconds window for combo
    let currentCombo = 1;

    if (now - lastComboHitRef.current < comboTime) {
      currentCombo = Math.min(10, stats.combo + 1);
    }
    lastComboHitRef.current = now;

    if (settings.soundEnabled) {
      soundManager.playHit();
      soundManager.playPointChime(currentCombo);
    }

    // Floating "+1" point text!
    const comboText = currentCombo > 1 ? `+1 (x${currentCombo})` : '+1';
    const comboColor = currentCombo >= 5 ? '#ec4899' : currentCombo >= 3 ? '#f59e0b' : '#10b981';

    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x: impactX,
      y: impactY - 15,
      text: comboText,
      color: comboColor,
      size: currentCombo > 2 ? 22 : 18,
      alpha: 1,
      vy: -1.6,
    });

    // Splatter particles based on user preference
    const splatterType = settings.splatterType;
    const particleCount = splatterType === 'paintball' ? 24 : 18;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      let pColor = '#ef4444';

      if (splatterType === 'neon') {
        pColor = Math.random() > 0.5 ? '#06b6d4' : '#ec4899';
      } else if (splatterType === 'paintball') {
        const paintColors = ['#ec4899', '#3b82f6', '#10b981', '#eab308', '#a855f7'];
        pColor = paintColors[Math.floor(Math.random() * paintColors.length)];
      } else if (splatterType === 'arcade_sparks') {
        pColor = Math.random() > 0.5 ? '#f59e0b' : '#fbbf24';
      } else if (splatterType === 'retro_pixel') {
        pColor = '#e11d48';
      }

      particlesRef.current.push({
        id: Math.random().toString(),
        x: impactX,
        y: impactY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: pColor,
        size: splatterType === 'paintball' ? 4 + Math.random() * 5 : 3 + Math.random() * 3,
        alpha: 1,
        decay: splatterType === 'paintball' ? 0.015 : 0.03,
        type: 'splatter',
      });
    }

    onUpdateStats((prev) => {
      const newScore = prev.score + 1; // Exactly 1 point per kill
      const newKills = prev.kills + 1;
      const newShotsHit = prev.shotsHit + 1;
      const newMaxCombo = Math.max(prev.maxCombo, currentCombo);
      const newHighScore = Math.max(prev.highScore, newScore);

      try {
        localStorage.setItem('road_shooter_high_score', newHighScore.toString());
      } catch {
        // ignore
      }

      return {
        ...prev,
        score: newScore,
        kills: newKills,
        shotsHit: newShotsHit,
        combo: currentCombo,
        maxCombo: newMaxCombo,
        highScore: newHighScore,
      };
    });
  }, [settings.soundEnabled, settings.splatterType, stats.combo, onUpdateStats]);

  // Mouse / Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'r') {
        triggerReload();
      }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        fireBullet();
      }
      if (e.key.toLowerCase() === 'p') {
        onTogglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;

      mousePosRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDownRef.current = true;
        fireBullet();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDownRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [fireBullet, triggerReload, onTogglePause]);

  // Continuous auto-fire when mouse held down
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMouseDownRef.current && !isPaused) {
        fireBullet();
      }
    }, 180);
    return () => clearInterval(interval);
  }, [fireBullet, isPaused]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set internal resolution
    canvas.width = 960;
    canvas.height = 540;

    // Initial pedestrians
    if (pedestriansRef.current.length === 0) {
      for (let i = 0; i < 8; i++) {
        spawnPedestrian(canvas.width, canvas.height);
        // Distribute them evenly across width
        const ped = pedestriansRef.current[pedestriansRef.current.length - 1];
        if (ped) {
          ped.x = Math.random() * canvas.width;
        }
      }
    }

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (!isPaused) {
        // --- 1. UPDATE PLAYER ---
        const p = playerRef.current;
        const keys = keysPressedRef.current;
        let dx = 0;
        let dy = 0;

        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;

        if (dx !== 0 && dy !== 0) {
          const invSqrt2 = 0.7071;
          dx *= invSqrt2;
          dy *= invSqrt2;
        }

        p.isMoving = dx !== 0 || dy !== 0;
        if (p.isMoving) {
          p.walkCycle += 0.2;
          p.x = Math.max(30, Math.min(canvas.width - 30, p.x + dx * p.speed));
          p.y = Math.max(canvas.height * 0.15, Math.min(canvas.height * 0.88, p.y + dy * p.speed));
        }

        // Angle to cursor
        const targetAngle = Math.atan2(mousePosRef.current.y - p.y, mousePosRef.current.x - p.x);
        p.angle = targetAngle;
        p.facing = Math.cos(targetAngle) >= 0 ? 'right' : 'left';

        // Recoil decay
        if (p.recoilOffset > 0) {
          p.recoilOffset = Math.max(0, p.recoilOffset - 0.8);
        }

        // Reload timer
        if (p.isReloading) {
          p.reloadProgress += dt / 1.2; // 1.2 sec reload
          if (p.reloadProgress >= 1) {
            p.ammo = p.maxAmmo;
            p.isReloading = false;
            p.reloadProgress = 0;
          }
        }

        // Screen shake decay
        if (shakeRef.current > 0) {
          shakeRef.current = Math.max(0, shakeRef.current - dt * 20);
        }

        // Combo timeout reset
        if (performance.now() - lastComboHitRef.current > 2500 && stats.combo > 1) {
          onUpdateStats((prev) => ({ ...prev, combo: 1 }));
        }

        // --- 2. PEDESTRIAN SPAWNING & UPDATE ---
        const spawnInterval = Math.max(600, 2200 - settings.spawnRate * 350);
        if (currentTime - lastSpawnRef.current > spawnInterval) {
          lastSpawnRef.current = currentTime;
          if (pedestriansRef.current.length < 18) {
            spawnPedestrian(canvas.width, canvas.height);
          }
        }

        for (let i = pedestriansRef.current.length - 1; i >= 0; i--) {
          const ped = pedestriansRef.current[i];
          ped.walkCycle += (Math.abs(ped.vx) / 2) * 0.15;
          ped.x += ped.vx;
          ped.y += ped.vy;

          if (ped.state === 'scared') {
            ped.scaredTimer--;
            if (ped.scaredTimer <= 0) {
              ped.state = 'walking';
              ped.vx = (ped.direction === 'right' ? 1 : -1) * ped.speed;
            }
          }

          // Despawn offscreen
          if (
            (ped.direction === 'right' && ped.x > canvas.width + 60) ||
            (ped.direction === 'left' && ped.x < -60)
          ) {
            pedestriansRef.current.splice(i, 1);
          }
        }

        // --- 3. BULLETS & COLLISION ---
        for (let b = bulletsRef.current.length - 1; b >= 0; b--) {
          const bullet = bulletsRef.current[b];
          bullet.x += bullet.vx;
          bullet.y += bullet.vy;
          bullet.distanceTraveled += Math.hypot(bullet.vx, bullet.vy);

          // Check hit against pedestrians
          let hit = false;
          for (let pIdx = pedestriansRef.current.length - 1; pIdx >= 0; pIdx--) {
            const victim = pedestriansRef.current[pIdx];
            const dist = Math.hypot(bullet.x - victim.x, bullet.y - victim.y);
            if (dist < victim.radius + 6) {
              // HIT!
              triggerImpact(victim, bullet.x, bullet.y);
              pedestriansRef.current.splice(pIdx, 1);
              hit = true;
              break;
            }
          }

          if (hit || bullet.distanceTraveled >= bullet.maxDistance ||
              bullet.x < -20 || bullet.x > canvas.width + 20 ||
              bullet.y < -20 || bullet.y > canvas.height + 20) {
            bulletsRef.current.splice(b, 1);
          }
        }

        // --- 4. PARTICLES ---
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const pt = particlesRef.current[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.alpha -= pt.decay;
          if (pt.rotation !== undefined && pt.rotationSpeed !== undefined) {
            pt.rotation += pt.rotationSpeed;
          }
          if (pt.type === 'casing') {
            pt.vy += 0.2; // gravity
          }
          if (pt.alpha <= 0) {
            particlesRef.current.splice(i, 1);
          }
        }

        // --- 5. FLOATING TEXTS ---
        for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
          const ft = floatingTextsRef.current[i];
          ft.y += ft.vy;
          ft.alpha -= 0.018;
          if (ft.alpha <= 0) {
            floatingTextsRef.current.splice(i, 1);
          }
        }

        // Time survived update
        onUpdateStats((prev) => ({
          ...prev,
          timeSurvived: prev.timeSurvived + dt,
        }));
      }

      // --- 6. RENDER EVERYTHING ---
      ctx.save();

      // Screen shake translation
      if (shakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * shakeRef.current;
        const shakeY = (Math.random() - 0.5) * shakeRef.current;
        ctx.translate(shakeX, shakeY);
      }

      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Environment (Road, Sidewalks, Markings, Decor)
      drawEnvironment(ctx, canvas.width, canvas.height, settings.environment);

      // Draw Pedestrians (Sorted by Y for correct 2.5D depth)
      const renderEntities: Array<{ type: 'ped' | 'player'; y: number; data: any }> = [];
      pedestriansRef.current.forEach((ped) => renderEntities.push({ type: 'ped', y: ped.y, data: ped }));
      renderEntities.push({ type: 'player', y: playerRef.current.y, data: playerRef.current });
      renderEntities.sort((a, b) => a.y - b.y);

      renderEntities.forEach((entity) => {
        if (entity.type === 'ped') {
          drawPedestrian(ctx, entity.data);
        } else {
          drawPlayer(ctx, entity.data);
        }
      });

      // Draw Bullets & Tracers
      bulletsRef.current.forEach((bullet) => {
        ctx.save();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bullet.x, bullet.y);
        ctx.lineTo(bullet.x - bullet.vx * 0.7, bullet.y - bullet.vy * 0.7);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Particles
      particlesRef.current.forEach((pt) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        if (pt.type === 'casing') {
          ctx.translate(pt.x, pt.y);
          ctx.rotate(pt.rotation || 0);
          ctx.fillStyle = pt.color;
          ctx.fillRect(-3, -1.5, 6, 3);
        } else {
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Draw Floating "+1" score texts
      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = `bold ${ft.size}px monospace, sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // Draw Weather & Atmospheric Lighting Overlay
      drawAtmosphere(ctx, canvas.width, canvas.height, settings.environment, settings.weather);

      // Draw Custom Animated Crosshair
      drawCrosshair(ctx, mousePosRef.current.x, mousePosRef.current.y, playerRef.current.recoilOffset);

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, onTogglePause, onUpdateStats, settings, spawnPedestrian, triggerImpact]);

  // Environment Drawing Routine
  const drawEnvironment = (ctx: CanvasRenderingContext2D, width: number, height: number, env: string) => {
    const roadTop = height * 0.26;
    const roadBottom = height * 0.74;

    // Upper sidewalk
    ctx.fillStyle = env === 'cyberpunk' ? '#181824' : '#64748b';
    ctx.fillRect(0, 0, width, roadTop);

    // Sidewalk curb top
    ctx.fillStyle = env === 'cyberpunk' ? '#0f172a' : '#475569';
    ctx.fillRect(0, roadTop - 4, width, 4);

    // Road surface
    ctx.fillStyle = env === 'cyberpunk' ? '#090d16' : '#1e293b';
    ctx.fillRect(0, roadTop, width, roadBottom - roadTop);

    // Lower sidewalk
    ctx.fillStyle = env === 'cyberpunk' ? '#181824' : '#64748b';
    ctx.fillRect(0, roadBottom, width, height - roadBottom);

    // Sidewalk curb bottom
    ctx.fillStyle = env === 'cyberpunk' ? '#0f172a' : '#475569';
    ctx.fillRect(0, roadBottom, width, 4);

    // Sidewalk paving tile grooves
    ctx.strokeStyle = env === 'cyberpunk' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, roadTop - 4);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, roadBottom + 4);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Road White Dashed Lane Lines
    const roadMidY = (roadTop + roadBottom) / 2;
    ctx.strokeStyle = env === 'cyberpunk' ? '#06b6d4' : '#f8fafc';
    ctx.lineWidth = 3;
    ctx.setLineDash([26, 20]);
    ctx.beginPath();
    ctx.moveTo(0, roadMidY);
    ctx.lineTo(width, roadMidY);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Yellow Boundary Lines
    ctx.strokeStyle = env === 'cyberpunk' ? '#ec4899' : '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, roadTop + 8);
    ctx.lineTo(width, roadTop + 8);
    ctx.moveTo(0, roadBottom - 8);
    ctx.lineTo(width, roadBottom - 8);
    ctx.stroke();

    // Zebra Crosswalk
    const zebraX = width * 0.5 - 40;
    ctx.fillStyle = env === 'cyberpunk' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(255, 255, 255, 0.4)';
    for (let y = roadTop + 12; y < roadBottom - 12; y += 22) {
      ctx.fillRect(zebraX, y, 80, 12);
    }

    // Street Decor (Streetlights, Trees, Benches)
    const streetLightX = [80, 360, 640, 880];
    streetLightX.forEach((lx) => {
      // Top streetlight
      ctx.fillStyle = '#334155';
      ctx.fillRect(lx - 3, roadTop - 28, 6, 26);
      ctx.beginPath();
      ctx.arc(lx, roadTop - 28, 6, 0, Math.PI * 2);
      ctx.fillStyle = env === 'night' || env === 'cyberpunk' ? '#fde047' : '#94a3b8';
      ctx.fill();

      // Streetlight glow at night/cyberpunk
      if (env === 'night' || env === 'cyberpunk') {
        const glow = ctx.createRadialGradient(lx, roadTop, 5, lx, roadTop + 40, 120);
        glow.addColorStop(0, 'rgba(253, 224, 71, 0.18)');
        glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lx, roadTop + 30, 120, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bottom streetlight
      ctx.fillStyle = '#334155';
      ctx.fillRect(lx - 3, roadBottom + 4, 6, 26);
      ctx.beginPath();
      ctx.arc(lx, roadBottom + 30, 6, 0, Math.PI * 2);
      ctx.fillStyle = env === 'night' || env === 'cyberpunk' ? '#fde047' : '#94a3b8';
      ctx.fill();
    });

    // Benches on bottom sidewalk
    [200, 520, 780].forEach((bx) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(bx - 18, roadBottom + 16, 36, 10);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bx - 16, roadBottom + 14, 4, 14);
      ctx.fillRect(bx + 12, roadBottom + 14, 4, 14);
    });
  };

  // Pedestrian Drawing Routine
  const drawPedestrian = (ctx: CanvasRenderingContext2D, ped: Pedestrian) => {
    ctx.save();
    ctx.translate(ped.x, ped.y);

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const legSwing = Math.sin(ped.walkCycle) * 5;

    // Legs / Pants
    ctx.fillStyle = ped.pantsColor;
    ctx.fillRect(-6 + legSwing * 0.5, 4, 4, 10);
    ctx.fillRect(2 - legSwing * 0.5, 4, 4, 10);

    // Torso / Shirt
    ctx.fillStyle = ped.clothesColor;
    ctx.beginPath();
    ctx.roundRect(-8, -8, 16, 13, 3);
    ctx.fill();

    // Arms swinging
    ctx.fillStyle = ped.clothesColor;
    ctx.fillRect(-10, -6 - legSwing * 0.5, 3, 9);
    ctx.fillRect(7, -6 + legSwing * 0.5, 3, 9);

    // Head
    ctx.fillStyle = ped.skinColor;
    ctx.beginPath();
    ctx.arc(0, -14, 7, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = ped.hairColor;
    ctx.beginPath();
    ctx.arc(0, -16, 7, Math.PI, Math.PI * 2);
    ctx.fill();

    // Accessory
    if (ped.accessory === 'hat') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-9, -21, 18, 3);
      ctx.fillRect(-6, -26, 12, 5);
    } else if (ped.accessory === 'bag') {
      ctx.fillStyle = '#92400e';
      ctx.fillRect(8, -4, 5, 8);
    } else if (ped.accessory === 'phone') {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(7, -8, 4, 6);
    }

    // Scared Exclamation Mark
    if (ped.state === 'scared') {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', 0, -26);
    }

    ctx.restore();
  };

  // Player Character Routine (Man with a Gun)
  const drawPlayer = (ctx: CanvasRenderingContext2D, p: Player) => {
    ctx.save();
    ctx.translate(p.x, p.y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs animation
    const legSwing = p.isMoving ? Math.sin(p.walkCycle) * 7 : 0;
    ctx.fillStyle = '#0f172a'; // tactical dark trousers
    ctx.fillRect(-7 + legSwing * 0.4, 5, 5, 12);
    ctx.fillRect(2 - legSwing * 0.4, 5, 5, 12);

    // Shoes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8 + legSwing * 0.4, 16, 7, 3);
    ctx.fillRect(1 - legSwing * 0.4, 16, 7, 3);

    // Torso (tactical trench coat / jacket)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-10, -9, 20, 16, 4);
    ctx.fill();

    // Holster belt
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-10, 4, 20, 3);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-2, 4, 4, 3);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -16, 8, 0, Math.PI * 2);
    ctx.fill();

    // Marksman hair / fedora / tactical cap
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -18, 8, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();
    ctx.fillRect(-10, -21, 20, 3);

    // --- GUN & ARMS ROTATING TOWARD AIM ---
    ctx.save();
    // Gun pivots at shoulder center
    ctx.translate(0, -3);
    ctx.rotate(p.angle);

    // Recoil pushback
    ctx.translate(-p.recoilOffset, 0);

    // Arms
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(2, -4, 14, 5);
    ctx.fillRect(4, 2, 10, 4);

    // Hands
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(16, -1, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Gun body (Tactical Pistol / Handgun)
    ctx.fillStyle = '#0f172a'; // receiver
    ctx.fillRect(14, -4, 16, 5);
    ctx.fillStyle = '#475569'; // slide
    ctx.fillRect(14, -5, 14, 3);
    ctx.fillStyle = '#64748b'; // barrel tip
    ctx.fillRect(28, -4, 4, 3);

    // Reloading indicator on player
    if (p.isReloading) {
      ctx.rotate(-p.angle); // unrotate for UI circle
      ctx.beginPath();
      ctx.arc(0, -32, 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -32, 12, -Math.PI / 2, -Math.PI / 2 + p.reloadProgress * Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.restore(); // restore gun rotation

    ctx.restore(); // restore player
  };

  // Weather & Atmosphere Routine
  const drawAtmosphere = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    env: string,
    weather: string
  ) => {
    if (env === 'sunset') {
      ctx.fillStyle = 'rgba(249, 115, 22, 0.12)';
      ctx.fillRect(0, 0, width, height);
    } else if (env === 'night') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
      ctx.fillRect(0, 0, width, height);
    } else if (env === 'cyberpunk') {
      ctx.fillStyle = 'rgba(88, 28, 135, 0.18)';
      ctx.fillRect(0, 0, width, height);
    }

    // Rain effect
    if (weather === 'rain') {
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
      ctx.lineWidth = 1;
      const now = performance.now() * 0.001;
      for (let i = 0; i < 40; i++) {
        const rx = ((i * 47 + now * 400) % width);
        const ry = ((i * 31 + now * 800) % height);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 4, ry + 16);
        ctx.stroke();
      }
    }
  };

  // Custom Animated Crosshair
  const drawCrosshair = (ctx: CanvasRenderingContext2D, x: number, y: number, recoil: number) => {
    ctx.save();
    ctx.translate(x, y);

    const radius = 12 + recoil * 1.5;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;

    // Outer reticle circle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Cross ticks
    const tickLen = 6;
    ctx.beginPath();
    ctx.moveTo(0, -radius - 2);
    ctx.lineTo(0, -radius - 2 - tickLen);
    ctx.moveTo(0, radius + 2);
    ctx.lineTo(0, radius + 2 + tickLen);
    ctx.moveTo(-radius - 2, 0);
    ctx.lineTo(-radius - 2 - tickLen, 0);
    ctx.moveTo(radius + 2, 0);
    ctx.lineTo(radius + 2 + tickLen, 0);
    ctx.stroke();

    ctx.restore();
  };

  // Touch virtual aim button for mobile
  const handleTouchShoot = () => {
    fireBullet();
  };

  return (
    <div className="relative w-full max-w-[960px] mx-auto rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-auto block cursor-crosshair aspect-video"
      />

      {/* Touch Mobile Controls overlay (visible on small screens) */}
      <div className="md:hidden absolute bottom-3 right-3 flex items-center gap-2">
        <button
          onClick={triggerReload}
          className="px-3 py-2 bg-slate-900/80 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 backdrop-blur active:scale-95"
        >
          RELOAD
        </button>
        <button
          onClick={handleTouchShoot}
          className="w-16 h-16 rounded-full bg-red-600/90 text-white font-black text-sm flex items-center justify-center border-2 border-red-400 shadow-lg active:scale-90"
        >
          FIRE
        </button>
      </div>

      {/* Pause banner */}
      {isPaused && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white">
          <span className="text-3xl font-black tracking-widest mb-2 text-amber-400">GAME PAUSED</span>
          <p className="text-slate-400 text-sm mb-4">Press [P] or click below to resume</p>
          <button
            onClick={onTogglePause}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition active:scale-95 shadow-lg"
          >
            Resume Game
          </button>
        </div>
      )}
    </div>
  );
};
