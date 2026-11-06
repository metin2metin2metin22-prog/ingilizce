import React, { useState } from 'react';
import { PlayerPassport, Level } from '../types';
import { 
  Plane, AlertTriangle, Banknote, BookOpen, Stamp, 
  Volume2, VolumeX, Layers, MessageSquare, Flame, Trophy, Shield
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface SurvivalHUDProps {
  passport: PlayerPassport;
  currentLevel: Level;
  currentLocation: string;
  activeView: 'DIALOGUE' | 'FLASHCARDS';
  onChangeView: (view: 'DIALOGUE' | 'FLASHCARDS') => void;
  onOpenPassport: () => void;
  onOpenGuide: () => void;
}

export const SurvivalHUD: React.FC<SurvivalHUDProps> = ({
  passport,
  currentLevel,
  currentLocation,
  activeView,
  onChangeView,
  onOpenPassport,
  onOpenGuide,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(sounds.muted);

  const levelTags: Record<Level, { label: string; color: string }> = {
    A1: { label: 'A1 Giriş Vizesi', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30' },
    A2: { label: 'A2 Şehir İzni', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30' },
    B1: { label: 'B1 İkamet & Çalışma', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-950/30' },
    B2: { label: 'B2 Kalıcı Oturum & Yönetim', color: 'border-fuchsia-500/40 text-fuchsia-400 bg-fuchsia-950/30' },
  };

  const tag = levelTags[currentLevel] || levelTags.A1;

  const handleToggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  const xpProgress = Math.min(100, ((passport.xp || 0) % 200) / 2);
  const playerRank = passport.rank || (passport.xp > 300 ? 'Akıcı Konuşmacı' : passport.xp > 100 ? 'Londra Gezgini' : 'Çaylak Yolcu');

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/95 border-b border-slate-800/80 px-4 sm:px-6 py-3 shadow-2xl">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Logo & Current Location */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-sky-600/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Plane className="w-5 h-5 text-sky-400 transform -rotate-45" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white font-heading">
                London<span className="bg-gradient-to-r from-sky-400 to-amber-400 bg-clip-text text-transparent">Survival</span>
              </h1>
              <span className={`px-2 py-0.5 text-[10px] font-black rounded-full border ${tag.color}`}>
                {tag.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{currentLocation}</span>
            </p>
          </div>
        </div>

        {/* Gamification Bar: XP, Rank & Streaks */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 px-3.5 py-1.5 rounded-2xl border border-slate-800 text-xs">
          {/* Rank Badge */}
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{playerRank}</span>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          {/* XP Progress */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">{passport.xp || 0} XP</span>
            <div className="w-16 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-sky-400 transition-all duration-500"
                style={{ width: `${Math.max(5, xpProgress)}%` }}
              />
            </div>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          {/* Streak Flame */}
          <div className="flex items-center gap-1 font-bold text-orange-400">
            <Flame className="w-3.5 h-3.5 fill-orange-400 animate-bounce" />
            <span>{passport.streak || 0} Seri</span>
          </div>
        </div>

        {/* View Mode Switcher: Dialogue vs Flashcards */}
        <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => {
              sounds.playClick();
              onChangeView('DIALOGUE');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeView === 'DIALOGUE'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Canlı Diyalog</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onChangeView('FLASHCARDS');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeView === 'FLASHCARDS'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Kelime Kartları</span>
          </button>
        </div>

        {/* Right Stats: Cash (£), Warnings & Passport */}
        <div className="flex items-center gap-2">
          
          {/* Wallet (£ Cash) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold text-xs shadow-inner">
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span>£{passport.cashPounds}</span>
          </div>

          {/* Warnings left (Hearts/Warnings) */}
          <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-2xl border text-xs font-bold transition-all ${
            passport.warningsLeft <= 1 
              ? 'bg-rose-950/50 border-rose-500/50 text-rose-400 animate-pulse' 
              : 'bg-slate-900 border-slate-800 text-amber-400'
          }`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{passport.warningsLeft}/3</span>
          </div>

          {/* Passport Booklet Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenPassport();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Stamp className="w-3.5 h-3.5" />
            <span>Pasaport ({passport.stampsCount}/4)</span>
          </button>

          {/* Guide / Help Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenGuide();
            }}
            className="p-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400 hover:text-white transition-all cursor-pointer font-bold text-xs"
            title="Nasıl Oynanır & Dil Öğrenme Rehberi"
          >
            ❓
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-2xl border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

        </div>

      </div>
    </header>
  );
};
