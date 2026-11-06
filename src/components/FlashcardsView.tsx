import React, { useState, useMemo } from 'react';
import { DialogueScenario, Level } from '../types';
import { 
  Volume2, Search, Lightbulb, CheckCircle2, 
  Lock, MessageSquare, Layers, BookOpen, Sparkles
} from 'lucide-react';
import { sounds, speakEnglish, speakEnglishSlow } from '../utils/audio';
import { InteractiveWordText } from './InteractiveWordText';

interface FlashcardsViewProps {
  scenarios: DialogueScenario[];
  masteredWords: string[];
  onStartScenarioForWord: (scenarioIndex: number) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  scenarios,
  masteredWords,
  onStartScenarioForWord,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<Level | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'LEARNED' | 'PENDING'>('ALL');

  // Flatten all words with parent scenario context
  const allWordCards = useMemo(() => {
    return scenarios.flatMap((sc, scenarioIdx) =>
      sc.turns.map((turn) => ({
        scenarioIndex: scenarioIdx,
        scenarioLocation: sc.location,
        scenarioNpc: sc.npcName,
        level: sc.level,
        word: turn.targetWord,
        translation: turn.targetWordTr,
        phonetic: turn.targetWordPhonetic,
        partOfSpeech: turn.partOfSpeech,
        grammarPattern: turn.grammarPattern,
        grammarExplanation: turn.grammarExplanation,
        mnemonic: turn.mnemonic,
        exampleEn: turn.sentenceFilled,
        exampleTr: turn.sentenceTr,
      }))
    );
  }, [scenarios]);

  // Filtered cards
  const filteredCards = useMemo(() => {
    return allWordCards.filter((card) => {
      // Level
      if (selectedLevel !== 'ALL' && card.level !== selectedLevel) return false;

      // Mastered status
      const isMastered = masteredWords.includes(card.word);
      if (filterStatus === 'LEARNED' && !isMastered) return false;
      if (filterStatus === 'PENDING' && isMastered) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchWord = card.word.toLowerCase().includes(q);
        const matchTr = card.translation.toLowerCase().includes(q);
        if (!matchWord && !matchTr) return false;
      }
      return true;
    });
  }, [allWordCards, selectedLevel, filterStatus, searchQuery, masteredWords]);

  const levelStyles: Record<Level, { badge: string; border: string }> = {
    A1: { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', border: 'border-emerald-500/30' },
    A2: { badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', border: 'border-cyan-500/30' },
    B1: { badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', border: 'border-indigo-500/30' },
    B2: { badge: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30', border: 'border-fuchsia-500/30' },
  };

  return (
    <div className="space-y-6 animate-pop-in">
      
      {/* Search and Filters Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white font-heading flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-400" />
              Kelime ve Cümle Kalıbı Kütüphanesi (A1 - B2)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tüm kelimeleri gramer kalıbı, hafıza şifresi ve telaffuzlarıyla incele. Cümledeki herhangi bir kelimeye tıklayıp anlamını görebilirsin.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kelime veya Türkçe ara..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Level Tabs & Status filter */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80">
          
          {/* Level Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  sounds.playClick();
                  setSelectedLevel(lvl);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {lvl === 'ALL' ? 'Tüm Seviyeler' : `${lvl}`}
              </button>
            ))}
          </div>

          {/* Status buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterStatus === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tümü ({allWordCards.length})
            </button>
            <button
              onClick={() => setFilterStatus('LEARNED')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterStatus === 'LEARNED' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hafızada ({masteredWords.length})
            </button>
          </div>

        </div>

      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card, idx) => {
          const isMastered = masteredWords.includes(card.word);
          const currentStyle = levelStyles[card.level] || levelStyles.A1;

          return (
            <div
              key={idx}
              className={`relative flex flex-col justify-between rounded-3xl p-5 border transition-all duration-300 bg-slate-900/90 shadow-lg ${
                isMastered
                  ? 'border-emerald-500/40 bg-gradient-to-b from-slate-900 to-emerald-950/20 shadow-emerald-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header: Level & Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-black uppercase ${currentStyle.badge}`}>
                    {card.level}
                  </span>
                  {card.partOfSpeech && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {card.partOfSpeech}
                    </span>
                  )}
                </div>

                {isMastered ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> %100 Vize Alındı
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">
                    <Lock className="w-3 h-3" /> Öğrenilecek
                  </span>
                )}
              </div>

              {/* Word & Pronunciation */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h4 className="text-2xl font-black text-white font-heading">{card.word}</h4>
                    <span className="text-xs text-slate-500 font-mono">{card.phonetic}</span>
                  </div>

                  {/* Audio buttons (Normal & Slow) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        speakEnglish(card.word);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-sky-600/30 text-slate-300 hover:text-sky-300 transition-all cursor-pointer"
                      title="Normal Hızda Dinle"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        speakEnglishSlow(card.word);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-amber-600/30 text-slate-300 hover:text-amber-300 transition-all cursor-pointer text-xs"
                      title="Yavaş Hızda Dinle (Tane Tane)"
                    >
                      🐢
                    </button>
                  </div>
                </div>

                {/* Meaning */}
                <div className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <p className="text-sm font-bold text-amber-300">{card.translation}</p>
                </div>

                {/* Mnemonic Hint */}
                <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 text-[11px] flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-300 leading-snug">
                    <strong className="text-amber-300">İpucu:</strong> {card.mnemonic}
                  </p>
                </div>

                {/* Grammar Pattern */}
                {card.grammarPattern && (
                  <div className="p-2.5 rounded-xl bg-sky-950/30 border border-sky-800/30 text-[11px] space-y-0.5">
                    <span className="text-[10px] font-bold text-sky-400 uppercase">Gramer Kalıbı:</span>
                    <p className="text-slate-200 font-mono font-semibold">{card.grammarPattern}</p>
                  </div>
                )}

                {/* Example sentence with Interactive Tap-to-Translate */}
                <div className="text-[11px] space-y-0.5 pt-1">
                  <p className="text-slate-200 italic font-semibold leading-relaxed">
                    <InteractiveWordText text={card.exampleEn} highlightWord={card.word} />
                  </p>
                  <p className="text-slate-400 leading-relaxed">{card.exampleTr}</p>
                </div>
              </div>

              {/* Action Button: Jump into dialogue */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                  {card.scenarioLocation.split('-')[0]}
                </span>

                <button
                  onClick={() => {
                    sounds.playClick();
                    onStartScenarioForWord(card.scenarioIndex);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600 border border-sky-500/30 hover:border-sky-500 text-sky-300 hover:text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Diyalogda Pratik Yap</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
