import React from 'react';
import { Sparkles, Trophy, Flame, Plus, RotateCcw, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { sounds } from '../utils/audio';

interface NavbarProps {
  totalWords: number;
  masteredCount: number;
  streak: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAddModal: () => void;
  onResetProgress: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalWords,
  masteredCount,
  streak,
  soundEnabled,
  onToggleSound,
  onOpenAddModal,
  onResetProgress,
}) => {
  const percent = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="text-2xl select-none">🔒</span>
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-heading">
                Lingo<span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Lock</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                %100 Kuralı
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Öğrenmeden kapatılamayan akıllı kelime kartları
            </p>
          </div>
        </div>

        {/* Global Progress & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Streak pill */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 font-semibold text-xs sm:text-sm"
            title="Günlük Ustalık Serisi"
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span>{streak} Gün</span>
          </div>

          {/* Mastered Counter */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-white">{masteredCount}</span>
            <span className="text-slate-500">/</span>
            <span>{totalWords}</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold">
              %{percent}
            </span>
          </div>

          {/* Add Word Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAddModal();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Kelime</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sounds.playClick();
            }}
            title={soundEnabled ? 'Sesleri Kapat' : 'Sesleri Aç'}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* Reset progress button */}
          <button
            onClick={onResetProgress}
            title="Tüm İlerlemeyi Sıfırla"
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-800/40 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
