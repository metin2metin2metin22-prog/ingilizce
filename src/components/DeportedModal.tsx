import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { sounds } from '../utils/audio';

interface DeportedModalProps {
  isOpen: boolean;
  onRestart: () => void;
}

export const DeportedModal: React.FC<DeportedModalProps> = ({ isOpen, onRestart }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-pop-in">
      <div className="relative w-full max-w-md bg-slate-950 border-2 border-rose-600 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
        
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-950/60 border border-rose-600/40 flex items-center justify-center text-4xl shadow-xl shadow-rose-950/80 animate-pulse">
          🚨
        </div>

        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-wider">
            3 Uyarı Sınırı Aşıldı
          </span>
          <h3 className="text-2xl font-black text-white font-heading">
            Sorgulama Odasına Alındın!
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Sorulan hayati İngilizce kelimeleri yanıtlayamadın. Görevli seni kenara çekti! Cep rehberini dikkatle çalışmalı ve kelimeleri hafızana alarak tekrar sıraya girmelisin.
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playAirportChime();
            onRestart();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Evrakları Tekrar Çalış & Sıraya Gir (3 Hak Yenilenir)</span>
        </button>

      </div>
    </div>
  );
};
