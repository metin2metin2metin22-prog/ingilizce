import React, { useState } from 'react';
import { PlayerPassport, DialogueScenario } from '../types';
import { BookOpen, X, Volume2, Stamp, CheckCircle2, Lock } from 'lucide-react';
import { sounds, speakEnglish } from '../utils/audio';

interface PassportModalProps {
  passport: PlayerPassport;
  scenarios: DialogueScenario[];
  isOpen: boolean;
  onClose: () => void;
}

export const PassportModal: React.FC<PassportModalProps> = ({
  passport,
  scenarios,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'VISAS' | 'VOCABULARY'>('VISAS');

  if (!isOpen) return null;

  const allWords = scenarios.flatMap(s => s.turns.map(t => ({
    word: t.targetWord,
    translation: t.targetWordTr,
    mnemonic: t.mnemonic,
    phonetic: t.targetWordPhonetic,
    example: t.npcMessageEn,
  })));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        
        {/* Passport Cover Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 p-0.5 shadow-lg flex items-center justify-center text-slate-950 text-2xl font-black">
              🇬🇧
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-heading tracking-wide">
                PASSPORT & SURVIVAL DOSSIER
              </h3>
              <p className="text-xs text-amber-400 font-mono">
                BRITISH ENTRY CLEARANCE PROTOCOL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab('VISAS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'VISAS'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Stamp className="w-4 h-4" />
            <span>Vize Damgaları ({passport.stampsCount}/4)</span>
          </button>

          <button
            onClick={() => setActiveTab('VOCABULARY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'VOCABULARY'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Diyalog Kelimeleri ({passport.masteredWords.length}/{allWords.length})</span>
          </button>
        </div>

        {/* TAB 1: VISAS */}
        {activeTab === 'VISAS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scenarios.map((sc) => {
              const isCleared = sc.stamped;

              return (
                <div
                  key={sc.id}
                  className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[150px] ${
                    isCleared
                      ? 'bg-emerald-950/20 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-950/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                        {sc.level} KADEMESİ
                      </span>
                      <h4 className="font-bold text-white text-sm mt-0.5">{sc.location.split('-')[0]}</h4>
                      <p className="text-xs text-slate-400">{sc.npcName}</p>
                    </div>

                    <span className="text-2xl">{sc.npcAvatar}</span>
                  </div>

                  {isCleared ? (
                    <div className="mt-4 p-2.5 rounded-xl border-2 border-dashed border-emerald-400/80 bg-emerald-500/10 text-center transform -rotate-1">
                      <span className="text-xs font-black text-emerald-400 tracking-wider">
                        ✓ APPROVED & COMPLETED
                      </span>
                      <p className="text-[10px] text-emerald-300 font-mono">Diyalog %100 Başarıldı</p>
                    </div>
                  ) : (
                    <div className="mt-4 p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-center text-slate-500 text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Henüz Onaylanmadı</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: VOCABULARY */}
        {activeTab === 'VOCABULARY' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto pr-1">
            {allWords.map((w, idx) => {
              const isLearned = passport.masteredWords.includes(w.word);

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isLearned
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-white text-sm font-heading">{w.word}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">{w.phonetic}</span>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        speakEnglish(w.word);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-slate-300 mt-2">{w.translation}</p>
                  <p className="text-[11px] text-slate-400 italic mt-1 leading-snug">"{w.mnemonic}"</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    {isLearned ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> %100 Hafızada
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Kilitli
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
