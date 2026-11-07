import React from 'react';
import { AbsurdFollowUp } from '../types';
import { sounds, speakEnglish } from '../utils/audio';
import { AlertOctagon, Volume2, ShieldAlert, ArrowRight, RotateCcw, Dumbbell } from 'lucide-react';

interface AbsurdBranchCardProps {
  absurdData: AbsurdFollowUp;
  onRecover: () => void;
  onGoToTraining: () => void;
}

export const AbsurdBranchCard: React.FC<AbsurdBranchCardProps> = ({
  absurdData,
  onRecover,
  onGoToTraining,
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-rose-950/80 via-slate-900 to-slate-950 border-2 border-rose-500/60 shadow-2xl space-y-4 animate-pop-in text-slate-100">
      
      {/* Top Warning Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-rose-500/30">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-400 animate-bounce" />
          <span className="text-xs font-black uppercase text-rose-300 tracking-wider">
            {absurdData.officerReactionBadge || '🚨 ABSÜRT DURUM TIRMANIŞI!'}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
          Diyalog Çığırından Çıktı!
        </span>
      </div>

      {/* Officer Shocked Speech */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/40 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              👮‍♂️ Memur Smith Hayretle Bağırdı:
            </span>
            <p className="text-sm sm:text-base font-bold text-white font-mono leading-relaxed">
              &ldquo;{absurdData.officerSpeechEn}&rdquo;
            </p>
            <p className="text-xs text-rose-300 italic">
              ({absurdData.officerSpeechTr})
            </p>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              speakEnglish(absurdData.officerSpeechEn);
            }}
            className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 transition flex items-center justify-center flex-shrink-0"
            title="Memurun Şok Tepkisini Dinle"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prompt */}
      <p className="text-xs font-bold text-slate-300 text-center">
        {absurdData.absurdPromptTr || 'Memur kelepçeye uzanmak üzere! Bu durumu nasıl toparlayacaksın?'}
      </p>

      {/* Comeback Decision Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {absurdData.comebacks.map((comeback, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (comeback.isRecovery) {
                sounds.playCorrect();
                onRecover();
              } else {
                sounds.playAlarmSiren();
                onGoToTraining();
              }
            }}
            className={`p-3 rounded-2xl text-left text-xs font-semibold border transition-all active:scale-95 group ${
              comeback.isRecovery
                ? 'bg-slate-900 hover:bg-emerald-950/60 border-slate-700 hover:border-emerald-500 text-slate-200 hover:text-emerald-200'
                : 'bg-slate-900 hover:bg-rose-950/60 border-slate-700 hover:border-rose-500 text-slate-200 hover:text-rose-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold uppercase ${
                comeback.isRecovery ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {comeback.isRecovery ? '🟢 Özür Dile & Kurtar' : '🔴 Absürt Cevapta Israr Et'}
              </span>
            </div>
            <p className="font-bold text-white group-hover:text-amber-300 text-[11px] font-mono">
              &ldquo;{comeback.textEn}&rdquo;
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {comeback.textTr}
            </p>
          </button>
        ))}
      </div>

      {/* Direct Training Camp Trigger */}
      <div className="pt-2 text-center">
        <button
          onClick={() => {
            sounds.playClick();
            onGoToTraining();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition cursor-pointer"
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Bu kelimede tıkandım! Antrenman Odasına Git & Doğrusunu Öğren</span>
        </button>
      </div>

    </div>
  );
};
