import React, { useState } from 'react';
import { BRITISH_SLANG_ITEMS, BritishSlangItem } from '../data/britishSlang';
import { sounds, speakEnglish } from '../utils/audio';
import { Volume2, X, Search, Sparkles, BookOpen } from 'lucide-react';

interface BritishSlangModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BritishSlangModal: React.FC<BritishSlangModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = [
    { id: 'ALL', label: 'Tümü' },
    { id: 'GÜNLÜK', label: '🗣️ Günlük Konuşma' },
    { id: 'ULAŞIM', label: '🚇 Metro & Ulaşım' },
    { id: 'YEME_İÇME', label: '☕ Yeme & İçme' },
    { id: 'PARA', label: '💷 Para & Harcama' },
  ];

  const filtered = BRITISH_SLANG_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.phrase.toLowerCase().includes(search.toLowerCase()) ||
      item.meaningTr.toLowerCase().includes(search.toLowerCase()) ||
      item.phoneticTr.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-red-950/40 via-slate-900 to-blue-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
              🇬🇧
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-300 flex items-center gap-2">
                Londra Sokak Dili & Doğal İfadeler
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                Ders kitaplarında olmayan, gerçek İngilizlerin her gün kullandığı altın kalıplar
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="İfade veya anlam ara... (örneğin: quid, gap, yorgun)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slang Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-slate-800/50">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Aradığınız kriterde deyim veya ifade bulunamadı.
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="pt-3.5 first:pt-0 group">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition space-y-2.5">
                  
                  {/* Top: Phrase + Phonetic + Speaker */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <h3 className="text-base font-bold text-amber-200 group-hover:text-amber-300 transition">
                          {item.phrase}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono font-medium">
                          {item.phoneticTr}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 italic">
                        Birebir çeviri: &ldquo;{item.literalTr}&rdquo;
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        speakEnglish(item.phrase);
                      }}
                      className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 transition flex items-center justify-center flex-shrink-0"
                      title="İngiliz aksanıyla dinle"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Meaning & Usage Context */}
                  <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                    <p className="font-medium text-slate-200">{item.meaningTr}</p>
                    <p className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{item.usageContext}</span>
                    </p>
                  </div>

                  {/* Example Dialogue */}
                  <div className="text-xs bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60 flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-slate-300 font-mono text-[11px] font-semibold">
                        &ldquo;{item.exampleEn}&rdquo;
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        {item.exampleTr}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        speakEnglish(item.exampleEn);
                      }}
                      className="text-slate-400 hover:text-amber-300 p-1 transition flex-shrink-0"
                      title="Örneği dinle"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-between">
          <span>💡 İpucu: Bir İngiliz ile konuşurken &ldquo;Cheers, mate!&rdquo; demek anında sempati kazandırır.</span>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition text-xs"
          >
            Anladım
          </button>
        </div>

      </div>
    </div>
  );
};
