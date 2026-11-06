import React from 'react';
import { X, ShieldAlert, Sparkles, Mic, BookOpen, Stamp, Flame, Banknote } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-pop-in">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-sky-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-xl">
              🇬🇧
            </div>
            <div>
              <h3 className="text-base font-black text-white font-heading">
                London Survival: Nasıl Oynanır & Nasıl Öğretir?
              </h3>
              <p className="text-xs text-sky-400 font-medium">Hayatta Kalma & Dil Öğrenme Rehberi</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Core Pillars */}
        <div className="space-y-3.5 text-xs">
          
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">1. Aşama: Kelimeleri Zihnine Kodla</h4>
              <p className="text-slate-300 mt-0.5 leading-relaxed">
                Memurun karşısına çıkmadan önce 5 kelimeyi harf harf dizerek yazımını öğren veya 30 saniyelik hızlı eşleştirme ile refleks kazan. Altın cümle kalıplarını incele.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <Mic className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">2. Aşama: Canlı Diyalogda Konuş</h4>
              <p className="text-slate-300 mt-0.5 leading-relaxed">
                Memur Smith ve diğer Londralı karakterler soru sorduğunda mikrofona basarak İngilizce konuşabilir veya klavyenizdeki <strong>1, 2, 3, 4</strong> tuşlarına basarak anında yanıtlayabilirsiniz. Cümledeki bilmediğiniz <strong>her kelimeye tıklayarak</strong> anında Türkçe çevirisini görebilirsiniz.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">3. Şüphe Barı & Para Cezaları</h4>
              <p className="text-slate-300 mt-0.5 leading-relaxed">
                Şüpheli veya tehlikeli kelimeler (örn: <em>danger, weapon, smuggle</em>) söylerseniz polis şüphe barını yükseltir ve para cezası keser! Doğru kelimeler ve kombolar ise şüpheyi sıfırlar.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <Stamp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">4. %100 Vize Damgası & Birleşik Krallık Pasaportu</h4>
              <p className="text-slate-300 mt-0.5 leading-relaxed">
                Diyaloğu tamamlayınca hızlı hafıza mühürlemesini geçip pasaportunuza yeşil giriş vizesini vurdurun ve sıradaki Londra mekanına ilerleyin!
              </p>
            </div>
          </div>

        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-sky-600/30"
        >
          Hazırım! Londra Macerasına Devam Et 🇬🇧
        </button>

      </div>
    </div>
  );
};
