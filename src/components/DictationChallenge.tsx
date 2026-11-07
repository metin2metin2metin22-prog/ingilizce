import React, { useState, useEffect, useRef } from 'react';
import { sounds, speakEnglish, speakEnglishSlow } from '../utils/audio';
import { Volume2, Sparkles, CheckCircle2, AlertCircle, Lightbulb, Play, RotateCcw } from 'lucide-react';

interface DictationChallengeProps {
  targetWord: string;
  targetWordTr: string;
  phoneticTr?: string;
  easyPhoneticTr?: string;
  onSuccess: () => void;
}

export const DictationChallenge: React.FC<DictationChallengeProps> = ({
  targetWord,
  targetWordTr,
  phoneticTr,
  easyPhoneticTr,
  onSuccess,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasPlayedInitial, setHasPlayedInitial] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputVal('');
    setHintLevel(0);
    setIsSuccess(false);
    setErrorMsg(null);
    setHasPlayedInitial(false);
  }, [targetWord]);

  const cleanTarget = targetWord.trim().toLowerCase();

  const handlePlayNormal = () => {
    sounds.playClick();
    speakEnglish(targetWord);
    setHasPlayedInitial(true);
  };

  const handlePlaySlow = () => {
    sounds.playClick();
    speakEnglishSlow(targetWord);
    setHasPlayedInitial(true);
  };

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    if (inputVal.trim().toLowerCase() === cleanTarget) {
      sounds.playCorrect();
      setIsSuccess(true);
      setErrorMsg(null);
      setTimeout(() => {
        onSuccess();
      }, 1400);
    } else {
      sounds.playWrong();
      setErrorMsg(`Yanlış harf! Dikkatle dinleyin ve tekrar deneyin.`);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleGiveHint = () => {
    sounds.playClick();
    setHintLevel((prev) => Math.min(prev + 1, cleanTarget.length - 1));
  };

  // Generate masked hint string
  const renderMaskedHint = () => {
    if (hintLevel === 0) return null;
    return cleanTarget
      .split('')
      .map((char, idx) => (idx < hintLevel || idx === cleanTarget.length - 1 ? char.toUpperCase() : '•'))
      .join(' ');
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-sky-500/30 space-y-4 text-slate-100 shadow-xl">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
            🎧
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-sky-300">
              Memuru Dinle & Dikte Yazma (Audio Dictation)
            </h4>
            <p className="text-[11px] text-slate-400">
              İngiliz sınır memurunun sesini dinleyin ve duyduğunuz kelimeyi doğru yazın
            </p>
          </div>
        </div>

        {easyPhoneticTr && (
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-mono font-bold">
            {easyPhoneticTr}
          </span>
        )}
      </div>

      {/* Audio Playback Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 py-2">
        <button
          type="button"
          onClick={handlePlayNormal}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-sky-600/20"
        >
          <Volume2 className="w-4 h-4" />
          <span>🇬🇧 Dinle (Normal)</span>
        </button>

        <button
          type="button"
          onClick={handlePlaySlow}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold transition flex items-center gap-2 border border-slate-700"
        >
          <span>🐢 Yavaş Dinle (0.6x)</span>
        </button>

        <button
          type="button"
          onClick={handleGiveHint}
          disabled={hintLevel >= cleanTarget.length - 1 || isSuccess}
          className="px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Harf İpucu ({hintLevel})</span>
        </button>
      </div>

      {/* Masked letter hint if active */}
      {hintLevel > 0 && (
        <div className="text-center py-1">
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-amber-500/30 font-mono text-sm tracking-widest text-amber-400 font-bold">
            {renderMaskedHint()}
          </span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => {
            sounds.playTypeKey();
            setInputVal(e.target.value);
            setErrorMsg(null);
          }}
          disabled={isSuccess}
          placeholder="Duyduğunuz İngilizce kelimeyi buraya yazın..."
          className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition"
        />

        <button
          type="submit"
          disabled={!inputVal.trim() || isSuccess}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40 shadow-lg shadow-emerald-600/20"
        >
          <span>Kontrol Et</span>
        </button>
      </form>

      {/* Feedback Messages */}
      {isSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Harika dinleme! &ldquo;{targetWord}&rdquo; ({targetWordTr}) doğru yazıldı (+25 XP).</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300 font-bold animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

    </div>
  );
};
