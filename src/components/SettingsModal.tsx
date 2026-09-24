/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameSettings, SplatterType, DayNightCycle, WeatherType } from '../types/game';
import { X, Volume2, Sun, Shield, Zap, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (updater: (prev: GameSettings) => GameSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleVolumeChange = (vol: number) => {
    onUpdateSettings((prev) => ({ ...prev, volume: vol }));
    soundManager.setVolume(vol);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Game & Environment Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4 text-xs overflow-y-auto max-h-[75vh]">
          
          {/* Environment Lighting */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Street Lighting & Atmosphere</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['day', 'sunset', 'night', 'cyberpunk'] as DayNightCycle[]).map((env) => (
                <button
                  key={env}
                  onClick={() => onUpdateSettings((prev) => ({ ...prev, environment: env }))}
                  className={`py-2 px-3 rounded-lg font-medium capitalize transition border ${
                    settings.environment === env
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          {/* Splatter Effect Type */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Hit Particle / Splatter Style</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'arcade_sparks', label: 'Arcade Sparks' },
                { id: 'neon', label: 'Neon Cyber Glow' },
                { id: 'paintball', label: 'Paintball (Friendly)' },
                { id: 'retro_pixel', label: 'Classic Action' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdateSettings((prev) => ({ ...prev, splatterType: item.id as SplatterType }))}
                  className={`py-2 px-3 rounded-lg font-medium transition border ${
                    settings.splatterType === item.id
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-300">Weather Overlay</label>
            <div className="grid grid-cols-2 gap-2">
              {(['clear', 'rain'] as WeatherType[]).map((w) => (
                <button
                  key={w}
                  onClick={() => onUpdateSettings((prev) => ({ ...prev, weather: w }))}
                  className={`py-2 px-3 rounded-lg font-medium capitalize transition border ${
                    settings.weather === w
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {w === 'clear' ? 'Clear Sky' : 'Rainy Asphalt'}
                </button>
              ))}
            </div>
          </div>

          {/* Ammo Mode */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">Infinite Ammo</span>
              <span className="text-slate-500 text-[11px]">Bypass 12-round reload limitation</span>
            </div>
            <input
              type="checkbox"
              checked={settings.infiniteAmmo}
              onChange={(e) => onUpdateSettings((prev) => ({ ...prev, infiniteAmmo: e.target.checked }))}
              className="w-4 h-4 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Screen Shake */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">Camera Recoil Shake</span>
              <span className="text-slate-500 text-[11px]">Subtle viewport kickback on shots</span>
            </div>
            <input
              type="checkbox"
              checked={settings.screenShake}
              onChange={(e) => onUpdateSettings((prev) => ({ ...prev, screenShake: e.target.checked }))}
              className="w-4 h-4 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Pedestrian Density / Spawn Rate */}
          <div className="flex flex-col gap-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200">Pedestrian Traffic Density</span>
              <span className="text-amber-400 font-bold">{settings.spawnRate} / 5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={settings.spawnRate}
              onChange={(e) => onUpdateSettings((prev) => ({ ...prev, spawnRate: parseInt(e.target.value) }))}
              className="accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Master Volume */}
          <div className="flex flex-col gap-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Audio Volume</span>
              </span>
              <span className="text-amber-400 font-bold">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="accent-amber-500 cursor-pointer"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
