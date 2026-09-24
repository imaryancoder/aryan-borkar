/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameSettings, GameStats } from '../types/game';
import { Volume2, VolumeX, Music, Pause, Play, RotateCcw, Sliders, Crosshair, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GameHUDProps {
  stats: GameStats;
  settings: GameSettings;
  onUpdateSettings: (updater: (prev: GameSettings) => GameSettings) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onOpenPromptStudio: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  settings,
  onUpdateSettings,
  isPaused,
  onTogglePause,
  onRestart,
  onOpenSettings,
  onOpenPromptStudio,
}) => {
  const accuracy = stats.shotsFired > 0 ? Math.round((stats.shotsHit / stats.shotsFired) * 100) : 100;

  const toggleSound = () => {
    onUpdateSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const toggleMusic = () => {
    const next = !settings.musicEnabled;
    onUpdateSettings((prev) => ({ ...prev, musicEnabled: next }));
    soundManager.toggleMusic(next);
  };

  return (
    <div className="w-full max-w-[960px] mx-auto mb-3 flex flex-col gap-2">
      {/* Top Bar: Key Metrics & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/95 border border-slate-800 rounded-xl px-4 py-3 shadow-lg backdrop-blur-md">
        
        {/* Left: Score & Rule callout */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Player Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tabular-nums tracking-tight text-amber-400">
                {stats.score}
              </span>
              <span className="text-xs text-slate-400 font-medium">pts (1 pt / kill)</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          {/* High Score */}
          <div className="flex flex-col hidden sm:flex">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              High Score
            </span>
            <span className="text-lg font-bold tabular-nums text-slate-200">
              {stats.highScore}
            </span>
          </div>

          {/* Combo Indicator */}
          {stats.combo > 1 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-black tracking-wide">
                COMBO x{stats.combo}
              </span>
            </div>
          )}
        </div>

        {/* Center: Metadata Stats */}
        <div className="hidden md:flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-red-400" />
            <span>Kills: <strong className="text-slate-200">{stats.kills}</strong></span>
          </div>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <div>
            <span>Accuracy: <strong className="text-slate-200">{accuracy}%</strong></span>
          </div>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <div>
            <span>Ammo: <strong className="text-slate-200">{settings.infiniteAmmo ? '∞' : '12 Rds [R]'}</strong></span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPromptStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition active:scale-95"
            title="View & Copy AI Studio Prompts"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Copy Prompt</span>
          </button>

          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg text-xs font-medium transition ${
              settings.soundEnabled
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-500 hover:text-slate-300'
            }`}
            title={settings.soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            aria-label="Toggle Sound"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleMusic}
            className={`p-2 rounded-lg text-xs font-medium transition ${
              settings.musicEnabled
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-500 hover:text-slate-300'
            }`}
            title={settings.musicEnabled ? 'Stop Synth Music' : 'Start Synth Music'}
            aria-label="Toggle Music"
          >
            <Music className={`w-4 h-4 ${settings.musicEnabled ? 'text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={onTogglePause}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title={isPaused ? 'Resume Game [P]' : 'Pause Game [P]'}
            aria-label="Pause or Resume"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={onRestart}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Restart Run"
            aria-label="Restart Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Game Settings"
            aria-label="Open Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Help bar */}
      <div className="flex items-center justify-between px-3 text-[11px] text-slate-400 font-medium">
        <div className="flex items-center gap-3">
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">W A S D</kbd> Move</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">Mouse</kbd> Aim & Shoot</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">R</kbd> Reload</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">P</kbd> Pause</span>
        </div>
        <span className="text-amber-400/90 font-semibold hidden sm:inline">
          Rule: 1 Kill = 1 Point
        </span>
      </div>
    </div>
  );
};
