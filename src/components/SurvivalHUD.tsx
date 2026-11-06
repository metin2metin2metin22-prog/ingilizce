import React from 'react';
import { PlayerPassport, Level } from '../types';
import { Plane, AlertTriangle, ShieldCheck, Banknote, BookOpen, Stamp } from 'lucide-react';
import { sounds } from '../utils/audio';

interface SurvivalHUDProps {
  passport: PlayerPassport;
  currentLevel: Level;
  currentLocation: string;
  onOpenPassport: () => void;
}

export const SurvivalHUD: React.FC<SurvivalHUDProps> = ({
  passport,
  currentLevel,
  currentLocation,
  onOpenPassport,
}) => {
  const levelTags: Record<Level, { label: string; color: string }> = {
    A1: { label: 'A1 Giriş Vizesi', color: 'border-emerald-500/40 text-emerald-400' },
    A2: { label: 'A2 Şehir İzni', color: 'border-cyan-500/40 text-cyan-400' },
    B1: { label: 'B1 İkamet & Çalışma', color: 'border-indigo-500/40 text-indigo-400' },
    B2: { label: 'B2 Kalıcı Oturum & Yönetim', color: 'border-fuchsia-500/40 text-fuchsia-400' },
  };

  const tag = levelTags[currentLevel] || levelTags.A1;

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

        {/* Vital Survival Stats */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Warnings Left (Can) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-bold" title="Polis / Görevli Uyarı Hakkı (3 Hata = Sorgu Odası!)">
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

          {/* Stamped Visas */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
            <Stamp className="w-4 h-4 text-purple-400" />
            <span>{passport.stampsCount}/4 Vize Damgası</span>
          </div>

          {/* Passport & Learned Words Book */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenPassport();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-sky-600/25 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Pasaport & Kelimeler</span>
            <span className="px-1.5 py-0.2 rounded-md bg-sky-800 text-[11px] ml-0.5">
              {passport.masteredWords.length}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
};
