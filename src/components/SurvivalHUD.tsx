import React, { useState } from 'react';
import { PlayerPassport, Level } from '../types';
import { 
  Plane, AlertTriangle, Banknote, BookOpen, Stamp, 
  Volume2, VolumeX, Layers, MessageSquare 
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface SurvivalHUDProps {
  passport: PlayerPassport;
  currentLevel: Level;
  currentLocation: string;
  activeView: 'DIALOGUE' | 'FLASHCARDS';
  onChangeView: (view: 'DIALOGUE' | 'FLASHCARDS') => void;
  onOpenPassport: () => void;
}

export const SurvivalHUD: React.FC<SurvivalHUDProps> = ({
  passport,
  currentLevel,
  currentLocation,
  activeView,
  onChangeView,
  onOpenPassport,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(sounds.muted);

  const levelTags: Record<Level, { label: string; color: string }> = {
    A1: { label: 'A1 Giriş Vizesi', color: 'border-emerald-500/40 text-emerald-400' },
    A2: { label: 'A2 Şehir İzni', color: 'border-cyan-500/40 text-cyan-400' },
    B1: { label: 'B1 İkamet & Çalışma', color: 'border-indigo-500/40 text-indigo-400' },
    B2: { label: 'B2 Kalıcı Oturum & Yönetim', color: 'border-fuchsia-500/40 text-fuchsia-400' },
  };

  const tag = levelTags[currentLevel] || levelTags.A1;

  const handleToggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 px-4 sm:px-6 py-3.5">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Terminal Location */}
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
              <span className={`px-2 py-0.5 text-[10px] font-black rounded-full border bg-slate-900 ${tag.color}`}>
                {tag.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{currentLocation}</span>
            </p>
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
            <span>Kelime Kartları (A1-B2)</span>
          </button>
        </div>

        {/* Vital Survival Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Warnings Left */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-bold" title="Memur Uyarı Hakkı">
            <AlertTriangle className={`w-4 h-4 ${passport.warningsLeft <= 1 ? 'text-rose-500 animate-bounce' : 'text-amber-400'}`} />
            <span className="text-slate-300">Uyarı:</span>
            <span className={`font-mono ${passport.warningsLeft <= 1 ? 'text-rose-400' : 'text-amber-300'}`}>
              {passport.warningsLeft}/3
            </span>
          </div>

          {/* Cash In Pounds */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-bold font-mono">
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span>£{passport.cashPounds}</span>
          </div>

          {/* Audio Mute/Unmute toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title={isMuted ? 'Sesleri Aç' : 'Sesleri Kapat'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Passport & Learned Words Book */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenPassport();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-sky-600/25 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Pasaport</span>
            <span className="px-1.5 py-0.2 rounded-md bg-sky-800 text-[11px] ml-0.5">
              {passport.masteredWords.length}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
};
