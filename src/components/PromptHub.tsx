/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MASTER_PROMPT, PROMPT_PRESETS, buildCustomPrompt } from '../data/prompts';
import { Copy, Check, Sparkles, Sliders, ExternalLink, Terminal, ShieldAlert } from 'lucide-react';

interface PromptHubProps {
  onClose?: () => void;
}

export const PromptHub: React.FC<PromptHubProps> = ({ onClose }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('master');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom Prompt Builder state
  const [customTheme, setCustomTheme] = useState('Urban City Street (Day / Night)');
  const [customPerspective, setCustomPerspective] = useState('Top-down 2D road view with smooth 360-degree aiming');
  const [customWeapon, setCustomWeapon] = useState('Tactical Handgun with recoil and reload slide');
  const [customSplatter, setCustomSplatter] = useState('Arcade Neon Sparks & floating combat numbers');
  const [hasReload, setHasReload] = useState(true);
  const [hasCombos, setHasCombos] = useState(true);
  const [hasPanicAI, setHasPanicAI] = useState(true);
  const [hasDayNight, setHasDayNight] = useState(true);
  const [hasAudio, setHasAudio] = useState(true);
  const [activeTab, setActiveTab] = useState<'presets' | 'builder'>('presets');

  const selectedPreset = PROMPT_PRESETS.find((p) => p.id === selectedPresetId) || PROMPT_PRESETS[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2400);
  };

  const customGeneratedPrompt = buildCustomPrompt({
    theme: customTheme,
    perspective: customPerspective,
    weapon: customWeapon,
    splatter: customSplatter,
    hasReload,
    hasCombos,
    hasPanicAI,
    hasDayNight,
    hasAudio,
  });

  return (
    <div className="w-full max-w-[960px] mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Ready-to-Paste AI Studio Prompts
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Optimized for AI Studio Build</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Road Marksman Prompt Generator
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Copy this expertly-engineered prompt directly into Google AI Studio to generate this full playable game, complete with road pedestrians, 360° aim, Web Audio SFX, and 1-point-per-kill scoring.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'presets'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ready Presets
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'builder'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Builder
          </button>
        </div>
      </div>

      {activeTab === 'presets' ? (
        <>
          {/* Preset Selector Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {PROMPT_PRESETS.map((preset) => {
              const isActive = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                    isActive
                      ? 'bg-slate-800 text-amber-400 border-amber-500/50 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {preset.title}
                </button>
              );
            })}
          </div>

          {/* Active Preset Card */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{selectedPreset.title}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {selectedPreset.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{selectedPreset.description}</p>
              </div>

              {/* Primary Copy Button */}
              <button
                onClick={() => handleCopy(selectedPreset.fullPrompt, selectedPreset.id)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition shadow-lg active:scale-95 ${
                  copiedId === selectedPreset.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {copiedId === selectedPreset.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Prompt for AI Studio</span>
                  </>
                )}
              </button>
            </div>

            {/* Prompt Text Box */}
            <div className="relative">
              <pre className="w-full bg-slate-900/90 text-slate-200 text-xs font-mono p-4 rounded-lg overflow-x-auto max-h-[340px] whitespace-pre-wrap leading-relaxed border border-slate-800 selection:bg-amber-500 selection:text-slate-950">
                {selectedPreset.fullPrompt}
              </pre>
            </div>
          </div>
        </>
      ) : (
        /* Custom Prompt Builder */
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
            {/* Theme */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Environment Theme</label>
              <select
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Urban City Street (Day / Night)">Urban City Street (Day / Night)</option>
                <option value="Neon Cyberpunk Rainy Asphalt">Neon Cyberpunk Rainy Asphalt</option>
                <option value="Wild West Dusty Frontier Town">Wild West Dusty Frontier Town</option>
                <option value="Sunny Paintball Carnival">Sunny Paintball Carnival</option>
                <option value="Zombie Highway Quarantine Zone">Zombie Highway Quarantine Zone</option>
              </select>
            </div>

            {/* Perspective */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Camera Perspective</label>
              <select
                value={customPerspective}
                onChange={(e) => setCustomPerspective(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Top-down 2D road view with smooth 360-degree aiming">Top-down 2D Road View</option>
                <option value="Side-scroller road view with horizontal pedestrian lanes">Side-scroller 2D Roadside</option>
                <option value="Rooftop sniper crosshair vantage point">Rooftop Tactical Sniper Scope</option>
              </select>
            </div>

            {/* Weapon */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Player Firearm</label>
              <select
                value={customWeapon}
                onChange={(e) => setCustomWeapon(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Tactical Handgun with recoil and reload slide">Tactical Handgun</option>
                <option value="High-Caliber Sniper Rifle with scope sway">High-Caliber Sniper Rifle</option>
                <option value="Futuristic Laser Blaster with blue plasma bolts">Futuristic Laser Blaster</option>
                <option value="Pneumatic Paintball Marker with splatter bursts">Paintball Marker</option>
                <option value="Six-Shooter Western Revolver with cylinder spin">Six-Shooter Revolver</option>
              </select>
            </div>

            {/* Splatter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Impact Effect Style</label>
              <select
                value={customSplatter}
                onChange={(e) => setCustomSplatter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Arcade Neon Sparks & floating combat numbers">Arcade Neon Sparks</option>
                <option value="Vibrant Paintball Splashes that coat the road">Paintball Splashes</option>
                <option value="Retro 16-Bit Pixel Explosions">Retro 16-Bit Pixel Bursts</option>
                <option value="Realistic Gunsmoke, sparks, and brass casings">Sparks, Gunsmoke & Casings</option>
              </select>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={hasReload}
                onChange={(e) => setHasReload(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>Ammo Magazine & Reload [R]</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={hasCombos}
                onChange={(e) => setHasCombos(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>Combo Multiplier Streaks</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={hasPanicAI}
                onChange={(e) => setHasPanicAI(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>Panic / Fleeing Pedestrian AI</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={hasDayNight}
                onChange={(e) => setHasDayNight(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>Day / Sunset / Night Cycle</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={hasAudio}
                onChange={(e) => setHasAudio(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>Synthesized Web Audio SFX</span>
            </label>
          </div>

          {/* Custom Generated Prompt Output */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Generated Custom AI Studio Prompt
              </span>
              <button
                onClick={() => handleCopy(customGeneratedPrompt, 'custom')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold text-xs transition active:scale-95 ${
                  copiedId === 'custom'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {copiedId === 'custom' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Custom Prompt</span>
                  </>
                )}
              </button>
            </div>

            <pre className="w-full bg-slate-900/90 text-slate-200 text-xs font-mono p-4 rounded-lg overflow-x-auto max-h-[300px] whitespace-pre-wrap leading-relaxed border border-slate-800">
              {customGeneratedPrompt}
            </pre>
          </div>
        </div>
      )}

      {/* AI Studio Pro Tips */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-start gap-3">
          <Terminal className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">How to use in AI Studio:</span>
            <p className="text-slate-400 mt-0.5">
              Copy any prompt above, paste it into the prompt box of Google AI Studio, and press Enter. AI Studio will automatically generate all HTML5 canvas physics, responsive controls, and audio synthesizers!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
