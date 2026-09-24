/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { PromptHub } from './components/PromptHub';
import { SettingsModal } from './components/SettingsModal';
import { GameSettings, GameStats } from './types/game';
import { MASTER_PROMPT } from './data/prompts';
import { Crosshair, Sparkles, Copy, Check, Gamepad2, FileText, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'game' | 'prompts'>('game');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [copiedMaster, setCopiedMaster] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    musicEnabled: false,
    volume: 0.8,
    splatterType: 'arcade_sparks',
    environment: 'day',
    weather: 'clear',
    infiniteAmmo: false,
    spawnRate: 3,
    screenShake: true,
  });

  // Game Stats
  const [stats, setStats] = useState<GameStats>(() => {
    let savedHigh = 0;
    try {
      savedHigh = parseInt(localStorage.getItem('road_shooter_high_score') || '0', 10);
    } catch {
      // ignore
    }
    return {
      score: 0,
      highScore: savedHigh,
      kills: 0,
      shotsFired: 0,
      shotsHit: 0,
      combo: 1,
      maxCombo: 1,
      timeSurvived: 0,
    };
  });

  const handleRestart = () => {
    setStats((prev) => ({
      score: 0,
      highScore: prev.highScore,
      kills: 0,
      shotsFired: 0,
      shotsHit: 0,
      combo: 1,
      maxCombo: prev.maxCombo,
      timeSurvived: 0,
    }));
    setIsPaused(false);
  };

  const handleCopyMasterPrompt = () => {
    navigator.clipboard.writeText(MASTER_PROMPT);
    setCopiedMaster(true);
    setTimeout(() => setCopiedMaster(false), 2400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white uppercase">
                  Road Marksman
                </h1>
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 hidden sm:inline">
                  AI Studio Game & Prompts
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                1 Kill = 1 Point · Man with a gun on the road
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('game')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'game'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Play Game</span>
            </button>

            <button
              onClick={() => setActiveTab('prompts')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'prompts'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>AI Studio Prompts</span>
            </button>
          </div>

          {/* Quick Copy Main Prompt Action */}
          <div className="hidden sm:flex items-center">
            <button
              onClick={handleCopyMasterPrompt}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold text-xs transition active:scale-95 shadow ${
                copiedMaster
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
              title="Copy the master prompt directly to paste into Google AI Studio"
            >
              {copiedMaster ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Prompt Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 flex flex-col items-center">
        
        {activeTab === 'game' ? (
          <div className="w-full flex flex-col items-center">
            
            {/* Quick Informational Notice with direct copy CTA */}
            <div className="w-full max-w-[960px] mb-3 bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300">
                  <strong className="text-amber-400">Playable Game & Ready Prompt:</strong> You play the man with a gun. Every kill on the road adds 1 point. Need to recreate this in AI Studio?
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyMasterPrompt}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition active:scale-95 ${
                    copiedMaster ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  }`}
                >
                  {copiedMaster ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMaster ? 'Copied!' : 'Copy AI Studio Prompt'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('prompts')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  More Variations
                </button>
              </div>
            </div>

            {/* Game Heads Up Display */}
            <GameHUD
              stats={stats}
              settings={settings}
              onUpdateSettings={setSettings}
              isPaused={isPaused}
              onTogglePause={() => setIsPaused((p) => !p)}
              onRestart={handleRestart}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenPromptStudio={() => setActiveTab('prompts')}
            />

            {/* Canvas Shooter Screen */}
            <GameCanvas
              settings={settings}
              stats={stats}
              onUpdateStats={setStats}
              isPaused={isPaused}
              onTogglePause={() => setIsPaused((p) => !p)}
            />

            {/* Below Canvas: Direct Prompt Preview Card */}
            <div className="w-full max-w-[960px] mt-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Prompt to Paste Directly in AI Studio
                  </h3>
                </div>
                <button
                  onClick={handleCopyMasterPrompt}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${
                    copiedMaster
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {copiedMaster ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMaster ? 'Copied!' : 'Copy Prompt'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-400">
                You asked for a prompt for this game. Here is the exact, complete prompt engineered specifically for Google AI Studio:
              </p>
              <pre className="bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-56 border border-slate-800">
                {MASTER_PROMPT}
              </pre>
            </div>

          </div>
        ) : (
          /* Prompts Hub View */
          <PromptHub onClose={() => setActiveTab('game')} />
        )}

      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        <span>Road Marksman · 1 Kill = 1 Point · Built for Google AI Studio</span>
      </footer>

    </div>
  );
}
