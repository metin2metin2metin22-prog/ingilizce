import React, { useState, useRef, useEffect } from 'react';
import { lookupWord, DictionaryEntry } from '../data/dictionary';
import { Volume2, Sparkles, X } from 'lucide-react';
import { speakEnglish, sounds } from '../utils/audio';

interface InteractiveWordTextProps {
  text: string;
  className?: string;
  highlightWord?: string;
}

export const InteractiveWordText: React.FC<InteractiveWordTextProps> = ({
  text,
  className = '',
  highlightWord,
}) => {
  const [activeWordInfo, setActiveWordInfo] = useState<DictionaryEntry | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveWordInfo(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleWordClick = (e: React.MouseEvent<HTMLSpanElement>, rawWord: string) => {
    e.stopPropagation();
    sounds.playClick();
    const info = lookupWord(rawWord);
    if (!info) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPos({
      x: Math.max(10, Math.min(window.innerWidth - 240, rect.left + rect.width / 2 - 110)),
      y: rect.bottom + window.scrollY + 6,
    });
    setActiveWordInfo(info);
    speakEnglish(info.word);
  };

  // Split text by whitespace, preserving punctuation
  const tokens = text.split(/(\s+)/);

  return (
    <div ref={containerRef} className={`relative inline leading-relaxed ${className}`}>
      {tokens.map((token, idx) => {
        if (/^\s+$/.test(token)) {
          return <span key={idx}>{token}</span>;
        }

        const isHighlighted =
          highlightWord &&
          token.toLowerCase().replace(/[^a-z0-9]/gi, '') ===
            highlightWord.toLowerCase().replace(/[^a-z0-9]/gi, '');

        return (
          <span
            key={idx}
            onClick={(e) => handleWordClick(e, token)}
            className={`inline-block px-0.5 rounded cursor-pointer transition-all hover:bg-amber-400/20 hover:text-amber-200 border-b border-dotted border-slate-600 hover:border-amber-400 ${
              isHighlighted
                ? 'font-black text-amber-300 bg-amber-400/15 border-b-2 border-amber-400'
                : ''
            }`}
            title="Anlamını ve telaffuzunu görmek için tıkla"
          >
            {token}
          </span>
        );
      })}

      {/* Floating Word Popover / Mini Dictionary Card */}
      {activeWordInfo && popoverPos && (
        <div
          style={{
            position: 'fixed',
            left: `${popoverPos.x}px`,
            top: `${popoverPos.y}px`,
            zIndex: 9999,
          }}
          className="w-60 bg-slate-950 border-2 border-amber-400/80 rounded-2xl p-3.5 shadow-2xl animate-pop-in text-left text-slate-100 backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white font-heading">
                {activeWordInfo.word}
              </span>
              {activeWordInfo.phonetic && (
                <span className="text-[11px] font-mono text-slate-400">
                  {activeWordInfo.phonetic}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playClick();
                  speakEnglish(activeWordInfo.word);
                }}
                className="p-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-all cursor-pointer"
                title="Tekrar Dinle"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveWordInfo(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold uppercase">
                {activeWordInfo.partOfSpeech}
              </span>
            </div>
            <p className="text-xs font-bold text-amber-200 mt-1">
              {activeWordInfo.translation}
            </p>
            {activeWordInfo.tip && (
              <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-900 mt-1 flex items-start gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{activeWordInfo.tip}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
