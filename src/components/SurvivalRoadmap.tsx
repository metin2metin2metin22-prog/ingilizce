import React from 'react';
import { DialogueScenario } from '../types';
import { CheckCircle2, Lock, ArrowRight, Plane, Coffee, Building, Landmark } from 'lucide-react';
import { sounds } from '../utils/audio';

interface SurvivalRoadmapProps {
  scenarios: DialogueScenario[];
  currentIndex: number;
  onSelectScenario: (index: number) => void;
}

export const SurvivalRoadmap: React.FC<SurvivalRoadmapProps> = ({
  scenarios,
  currentIndex,
  onSelectScenario,
}) => {
  const icons = [
    <Plane className="w-5 h-5" />,
    <Coffee className="w-5 h-5" />,
    <Building className="w-5 h-5" />,
    <Landmark className="w-5 h-5" />,
  ];

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-white font-heading uppercase tracking-wider">
            Londra Canlı Diyalog Haritası
          </h3>
          <p className="text-xs text-slate-400">
            Havalimanından CEO zirvesine adım adım interaktif diyaloglar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {scenarios.map((sc, idx) => {
          const isCurrent = idx === currentIndex;
          const isDone = sc.stamped;
          const isLocked = idx > currentIndex && !isDone;

          return (
            <button
              key={sc.id}
              disabled={isLocked}
              onClick={() => {
                sounds.playClick();
                onSelectScenario(idx);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-sky-950/40 border-sky-400 ring-2 ring-sky-400/30 shadow-lg'
                  : isDone
                  ? 'bg-emerald-950/20 border-emerald-500/50 hover:bg-emerald-950/40 cursor-pointer'
                  : isLocked
                  ? 'bg-slate-950/60 border-slate-800 opacity-40 cursor-not-allowed'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                  isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {sc.level}
                </span>

                <div className="text-slate-400">
                  {icons[idx] || <Plane className="w-4 h-4" />}
                </div>
              </div>

              <div className="mt-3">
                <h4 className="text-xs font-bold text-white truncate">{sc.location.split('-')[0]}</h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{sc.npcName}</p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                {isDone ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Vize Alındı
                  </span>
                ) : isCurrent ? (
                  <span className="text-sky-400 font-bold flex items-center gap-1">
                    Aktif Diyalog <ArrowRight className="w-3 h-3" />
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Kilitli
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
