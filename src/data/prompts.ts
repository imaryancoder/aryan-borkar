/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PromptPreset {
  id: string;
  title: string;
  tagline: string;
  badge: string;
  description: string;
  fullPrompt: string;
}

export const MASTER_PROMPT = `Create a high-action 2D arcade shooter web game where the player controls a man with a gun on a busy city street, and people walk along the road and sidewalks.

### Core Gameplay & Mechanics:
1. **Player Character ("The Marksman")**:
   - Control a man holding a firearm with smooth movement (WASD or Arrow keys, or touch virtual joystick).
   - Aim freely 360 degrees using the mouse cursor (or touch drag on mobile).
   - Left-click or Spacebar fires bullets towards the cursor with realistic muzzle flash, weapon kickback recoil, and ejected brass casings.
   - Smooth walking animations (legs/arms cycle) and directional orientation matching player aim.
   - Magazine capacity (e.g., 12 rounds) with a reload mechanic (press R or auto-reload on empty) with a reload progress indicator, or a toggle for infinite ammo.

2. **Road & Moving Pedestrians**:
   - A detailed asphalt street with lanes, road markings, crosswalks, sidewalks, streetlamps, and urban decor.
   - Pedestrians continuously spawn from the left and right edges, walking along sidewalks and crossing the road in both directions.
   - Diverse pedestrian varieties with different walking speeds, clothing colors, accessories (briefcases, phones, umbrellas, hats), and walking animations.
   - Reactive AI: when gunshots are fired nearby, close pedestrians enter a panicked fleeing state, running faster with alert indicators.

3. **Scoring System**:
   - EXACT RULE: Every kill grants 1 point to the player score.
   - Visually show a floating "+1" text at the exact elimination coordinate that gently rises and fades out.
   - Combo counter: rapid consecutive kills within 2 seconds trigger combo multipliers (x2, x3, x5) for extra arcade excitement while strictly recording total base kills.
   - Persistent High Score saved in localStorage.

4. **Visual Polish & Effects**:
   - 60 FPS HTML5 Canvas rendering.
   - Dynamic particle system: muzzle fire sparks, bullet trail lines, impact splatter/bursts, smoke puffs, and bouncing shell casings.
   - Subtle screen shake on shooting and impacts (toggleable in settings).
   - Splatter style selector: Arcade Neon Sparks, Paintball Splashes, or Retro Pixel bursts for customizable aesthetics.
   - Day/Night lighting cycle or atmosphere selector (Day, Sunset, Rainy Night, Cyberpunk Neon).

5. **Audio Synthesis (Web Audio API)**:
   - Zero external audio files required (100% self-contained synthesized sounds):
     - Punchy gunshot blast (shaped white noise + low punch).
     - Bullet impact thud.
     - Rewarding melodic chime for the "+1" point score.
     - Realistic mechanical slide and click for reloading.
     - Optional procedural synthwave background beat.

6. **User Interface & Controls**:
   - Sleek heads-up display (HUD) showing:
     - Score (Total Kills: 1 pt each)
     - High Score
     - Ammo counter & circular reload timer
     - Kill combo streak meter
     - Accuracy % (Shots fired vs Hits)
   - Custom crosshair tracking the cursor.
   - Pause / Resume, Restart, and Settings modal (Sound FX volume, Music toggle, Day/Night theme, Splatter style, Spawn rate).
   - Full mobile responsiveness with intuitive on-screen touch joystick and tap-to-shoot.`;

export const PROMPT_PRESETS: PromptPreset[] = [
  {
    id: 'master',
    title: 'Ultimate Arcade Road Marksman',
    tagline: 'The complete, fully-featured arcade street shooter specification',
    badge: 'Recommended',
    description: 'Full-featured specification covering canvas physics, reactive AI pedestrians, +1 point system, combo streaks, Web Audio synth sounds, and day/night street lighting.',
    fullPrompt: MASTER_PROMPT,
  },
  {
    id: 'cyberpunk',
    title: 'Neon Cyberpunk Street Hunter',
    tagline: 'Rainy neon-soaked asphalt with cyborg pedestrians & laser blasters',
    badge: 'Cyberpunk',
    description: 'Tailored for dark futuristic aesthetic with neon glow effects, laser energy bolts, cyber-pedestrians with glowing visors, and synthwave ambiance.',
    fullPrompt: `Build a neon cyberpunk 2D arcade shooter in React + HTML5 Canvas. The player is an undercover cyber-enforcer with a high-tech laser pistol positioned on a rainy, neon-lit futuristic street. 

Key Requirements:
- Visuals: Dark rainy asphalt reflecting neon pink/cyan billboards, puddles with ripple effects, rain particles, and street steam vents.
- Player: Cyber-operative with a glowing energy weapon that rotates 360° towards the mouse crosshair. Fires glowing laser bolts with light trails and blue muzzle flares.
- Street Targets: Cyborgs and street pedestrians in futuristic trench coats with holographic visors and neon clothing walking along sidewalks and crossing the illuminated road.
- Scoring: Every kill grants 1 point with a neon "+1" floating damage text and glowing digital spark explosions.
- Multiplier: Fast consecutive hits build a "CYBER STREAK" combo multiplier.
- Sound: Web Audio API synthesized laser pew sounds, electric zap impact, digital +1 point chime, and atmospheric bass synth.
- Controls: WASD/Arrows to move, Mouse to aim & shoot, R to vent heat/reload, touch virtual sticks for mobile.`,
  },
  {
    id: 'western',
    title: 'Wild West Dusty Road Gunslinger',
    tagline: 'High-noon frontier showdown with revolvers and saloon townsfolk',
    badge: 'Western',
    description: 'Western frontier setting with dusty dirt road, wooden hitching posts, outlaw townsfolk, six-shooter cylinder reloading, and acoustic twang SFX.',
    fullPrompt: `Create a Wild West top-down arcade shooting game. The player is a frontier sheriff armed with a six-shooter revolver standing on the main dirt road of an old western town.

Key Features:
- Setting: A dusty western main street with wooden boardwalk sidewalks, saloons, hitching posts, tumbleweeds blowing across the road, and warm desert sunlight.
- Player: Cowboy with a wide-brim hat holding a revolver that aims precisely at the mouse cursor. 6-shot cylinder capacity with a manual spin-and-load reload animation.
- Townsfolk / Outlaws: People in period western attire (cowboy hats, vests, long dresses, boots) strolling across the dirt road and walking along boardwalks.
- Shooting & Points: Clicking fires a smoke-heavy gunshot with gun smoke puff particles. Every hit eliminates the target and grants 1 point. Floating gold "+1 BOUNTY" text appears above them.
- Sound: Procedural Web Audio API gunshot crack, ricochet whine, coin jingling point chime, and wooden click reload sound.
- HUD: Wooden parchment UI displaying Bounty Score (1 pt per hit), High Score, Cylinder bullets remaining, and Accuracy.`,
  },
  {
    id: 'paintball',
    title: 'Paintball Carnival Street Blaster',
    tagline: '100% family-friendly vibrant paint splashes and carnival targets',
    badge: 'Family Safe',
    description: 'Non-violent, high-energy paintball marker game with neon paint splatters on the asphalt, carnival music, and cheering +1 popups.',
    fullPrompt: `Create a colorful, family-friendly 2D street paintball blaster arcade game in React and HTML5 Canvas.

Key Features:
- Concept: The player holds a professional paintball marker on a sun-drenched festival road. Targets are carnival characters and street performers walking along the street.
- Visuals: Cheerful cartoon aesthetic. When a paint pellet hits a target, it bursts into large vibrant splatters of neon paint (magenta, lime green, bright yellow, cyan) that coat the road surface!
- Scoring: Every direct paintball hit tags the person and awards 1 point to the player. A bouncy "+1 TAG!" badge pops up with colorful confetti bursts.
- Player Mechanics: Move with WASD, aim with a custom paint-splat reticle, click to rapid-fire paint pellets with satisfying splat physics and paintball tank pressure gauge.
- Sound: Web Audio API pneumatic "pop-pop" marker shots, squishy paint splat sounds, and cheerful xylophone point bells.
- Settings: Paint color selector, hopper ammo capacity, target walking speed slider, and cheerful carnival atmosphere.`,
  },
  {
    id: 'sniper',
    title: 'Rooftop Road Watcher (Sniper Scope)',
    tagline: 'Overlooking the busy highway road through a sniper crosshair',
    badge: 'Tactical',
    description: 'A rooftop vantage point looking down upon a busy street with moving cars and pedestrians, precision bolt-action rifle, zoom scope, and wind physics.',
    fullPrompt: `Create a precision tactical road shooter game where the player is an operative perched on an elevated rooftop overlooking a bustling metropolitan road.

Key Mechanics:
- Perspective: Top-down / isometric sniper view looking down at a multi-lane roadway with moving vehicles and pedestrians walking on crosswalks and sidewalks.
- Crosshair & Scope: The mouse moves a realistic tactical sniper crosshair with subtle breathing sway and distance rangefinder markings.
- Rifle Mechanics: High-powered bolt-action rifle with loud resonant gunshot crack, bullet travel velocity, and manual bolt cycling between shots.
- Rule: Eliminating targets walking on the road grants 1 point each with a "+1 CONFIRMED" popup.
- Pedestrian Behavior: Civilians walk at varied speeds. If a shot hits near them or a target falls, surrounding pedestrians duck, scatter, and sprint for cover.
- Web Audio API: Deep supersonic crack, metallic bolt-cycle reload, echoing gunshot reverberation, and tactical radio beep.
- Features: Night-vision thermal toggle, zoom level switcher (1x, 2x, 4x), hit streak multiplier, and stats dashboard.`,
  },
];

export function buildCustomPrompt(options: {
  theme: string;
  perspective: string;
  weapon: string;
  splatter: string;
  hasReload: boolean;
  hasCombos: boolean;
  hasPanicAI: boolean;
  hasDayNight: boolean;
  hasAudio: boolean;
}): string {
  return `Build a high-performance 2D arcade shooting game in React with HTML5 Canvas.

**Concept & Setting**:
- Theme: ${options.theme}
- Perspective: ${options.perspective}
- Environment: A road with moving pedestrians/characters crossing and walking along the sidewalks.

**Player Character & Weapon**:
- The player controls a character armed with a ${options.weapon}.
- Movement: Smooth WASD / Arrow keys movement with collision boundaries.
- Aiming: 360-degree free aim tracking mouse position (or touch virtual joystick on mobile).
- Shooting: Left-click or Space fires projectiles with realistic muzzle flash and recoil physics.
${options.hasReload ? '- Ammo System: Magazine capacity with reload timer (R key) and on-screen ammo counter.' : '- Infinite rapid-fire ammunition.'}

**Target Pedestrians & Behaviors**:
- Pedestrians constantly spawn from off-screen and walk across the road at varying speeds.
${options.hasPanicAI ? '- Reactive AI: Gunfire within close proximity causes pedestrians to enter a panicked state (running faster with warning indicators).' : '- Pedestrians walk along defined sidewalk and crosswalk pathways.'}

**Scoring & Feedback**:
- **Core Rule: Every single hit/kill grants 1 point to the player.**
- Floating animated "+1" score indicators rise from the elimination point.
${options.hasCombos ? '- Kill combo counter: Consecutive rapid eliminations multiply combo score.' : ''}
- Persistent High Score saved in localStorage.

**Visual Effects & Audio**:
- Particle FX: ${options.splatter} impact effects, bullet trails, and ejected shell casings.
${options.hasDayNight ? '- Dynamic lighting: Day, sunset, and night streetlamp modes.' : ''}
${options.hasAudio ? '- 100% self-contained synthesized Web Audio API sounds for gunshots, impacts, +1 point ding, and reload.' : ''}

**Controls & UI**:
- Responsive desktop and mobile layout with customizable crosshair.
- Full HUD: Score, High Score, Ammo, Accuracy %, and settings modal.`;
}
