import React, { useState, useEffect } from 'react';
import { TrainingCampState } from '../types';
import { sounds, speakEnglish, speakEnglishSlow } from '../utils/audio';
import { 
  AlertTriangle, CheckCircle2, RotateCcw, Volume2, 
  ArrowRight, Sparkles, Award, Dumbbell, ShieldAlert,
  Flame, BookOpen, Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TrainingCampModalProps {
  isOpen: boolean;
  trainingData: TrainingCampState | null;
  onCompleteTraining: () => void;
}

export const TrainingCampModal: React.FC<TrainingCampModalProps> = ({
  isOpen,
  trainingData,
  onCompleteTraining,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
  // Drill 1: Scramble
  const [scrambleLetters, setScrambleLetters] = useState<{ id: string; char: string; used: boolean }[]>([]);
  const [scrambleTyped, setScrambleTyped] = useState<string>('');
  const [step1Done, setStep1Done] = useState<boolean>(false);

  // Drill 2: Sentence Token selection
  const [sentenceOptions, setSentenceOptions] = useState<string[]>([]);
  const [selectedWordForBlank, setSelectedWordForBlank] = useState<string | null>(null);
  const [step2Done, setStep2Done] = useState<boolean>(false);

  // Drill 3: Listen & Repeat
  const [hasListened, setHasListened] = useState<boolean>(false);
  const [step3Done, setStep3Done] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && trainingData) {
      setCurrentStep(1);
      setScrambleTyped('');
      setStep1Done(false);
      setSelectedWordForBlank(null);
      setStep2Done(false);
      setHasListened(false);
      setStep3Done(false);

      // Setup Scramble
      const cleanTarget = trainingData.correctWord.toUpperCase();
      const chars = cleanTarget.split('').map((c, i) => ({
        id: `${c}-${i}-${Date.now()}`,
        char: c,
        used: false,
      }));
      setScrambleLetters(chars.sort(() => Math.random() - 0.5));

      // Setup Sentence Options (Correct word + 3 distractors including the blunder!)
      const opts = [
        trainingData.correctWord,
        trainingData.mistakeWord,
        'Secret',
        'Danger',
      ].filter((v, i, a) => a.indexOf(v) === i);
      setSentenceOptions(opts.sort(() => Math.random() - 0.5));

      sounds.playWarning();
    }
  }, [isOpen, trainingData]);

  if (!isOpen || !trainingData) return null;

  // Handle Letter Click in Drill 1
  const handleLetterClick = (item: { id: string; char: string; used: boolean }) => {
    if (item.used || step1Done) return;
    sounds.playClick();

    const nextTyped = scrambleTyped + item.char;
    setScrambleTyped(nextTyped);
    setScrambleLetters((prev) =>
      prev.map((l) => (l.id === item.id ? { ...l, used: true } : l))
    );

    const targetUpper = trainingData.correctWord.toUpperCase();
    if (nextTyped === targetUpper) {
      sounds.playCorrect();
      setStep1Done(true);
      setTimeout(() => {
        sounds.playLevelUp();
        setCurrentStep(2);
      }, 900);
    } else if (nextTyped.length === targetUpper.length) {
      sounds.playWrong();
      setTimeout(() => {
        setScrambleTyped('');
        setScrambleLetters((prev) => prev.map((l) => ({ ...l, used: false })));
      }, 500);
    }
  };

  // Handle Blank Selection in Drill 2
  const handleSelectBlankWord = (word: string) => {
    setSelectedWordForBlank(word);
    if (word.toLowerCase() === trainingData.correctWord.toLowerCase()) {
      sounds.playCorrect();
      setStep2Done(true);
      setTimeout(() => {
        sounds.playLevelUp();
        setCurrentStep(3);
      }, 900);
    } else {
      sounds.playWrong();
    }
  };

  // Complete All Drills
  const handleFinishDrills = () => {
    sounds.playLevelUp();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setStep3Done(true);
    setTimeout(() => {
      onCompleteTraining();
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-950/50 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner animate-bounce">
              🏋️‍♂️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold">
                  GÜMRÜK HAYATTA KALMA REHABİLİTASYONU
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                  Acil Antrenman
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Dil Antrenman Odası: Çuvalladığın Kelimeyi Kurtar!
              </h2>
            </div>
          </div>
        </div>

        {/* Absurd Incident Dossier / Blunder Recap */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 space-y-2">
          <div className="flex items-start gap-2.5 text-xs">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-slate-300">
                <strong className="text-rose-400">Neden Buradasın?</strong> Memur Smith ile konuşurken{' '}
                <span className="line-through text-rose-300 font-bold">&ldquo;{trainingData.mistakeWord}&rdquo; ({trainingData.mistakeWordTr})</span>{' '}
                dediğin için konu absürt bir yere gitti!
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 italic">
                👮‍♂️ Memurun Tepkisi: &ldquo;{trainingData.officerSpeechEn}&rdquo;
                <p className="text-slate-400 not-italic text-[10px] mt-0.5">({trainingData.officerSpeechTr})</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Steps Progress Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 text-xs font-bold bg-slate-950/40">
          <div className={`p-3 text-center transition ${
            currentStep === 1 ? 'border-b-2 border-amber-400 text-amber-300 bg-amber-500/10' :
            step1Done ? 'text-emerald-400' : 'text-slate-500'
          }`}>
            <span>1. Harfleri Düzelt</span> {step1Done && '✓'}
          </div>
          <div className={`p-3 text-center transition ${
            currentStep === 2 ? 'border-b-2 border-amber-400 text-amber-300 bg-amber-500/10' :
            step2Done ? 'text-emerald-400' : 'text-slate-500'
          }`}>
            <span>2. Cümleye Yerleştir</span> {step2Done && '✓'}
          </div>
          <div className={`p-3 text-center transition ${
            currentStep === 3 ? 'border-b-2 border-amber-400 text-amber-300 bg-amber-500/10' :
            step3Done ? 'text-emerald-400' : 'text-slate-500'
          }`}>
            <span>3. Memura Kanıtla</span> {step3Done && '✓'}
          </div>
        </div>

        {/* Training Work Area */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* STEP 1: Fix Spelling by Clicking Scrambled Letters */}
          {currentStep === 1 && (
            <div className="space-y-5 text-center animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  Doğru Kelimeyi Harf Harf Zihnine Kazı
                </span>
                <h3 className="text-xl font-black text-white">
                  &ldquo;{trainingData.correctWordTr}&rdquo; = ?
                </h3>
                {trainingData.easyPhoneticTr && (
                  <p className="text-xs text-slate-400 font-mono">Okunuşu: {trainingData.easyPhoneticTr}</p>
                )}
              </div>

              {/* Typed letters slot */}
              <div className="flex items-center justify-center gap-1.5 min-h-[50px]">
                {trainingData.correctWord.toUpperCase().split('').map((char, idx) => {
                  const typed = scrambleTyped[idx];
                  return (
                    <div
                      key={idx}
                      className={`w-10 h-12 rounded-xl flex items-center justify-center font-mono font-black text-xl border-2 transition-all ${
                        typed
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg'
                          : 'bg-slate-950 border-slate-800 text-slate-600'
                      }`}
                    >
                      {typed || '_'}
                    </div>
                  );
                })}
              </div>

              {/* Clickable letter bank */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm mx-auto">
                  {scrambleLetters.map((l) => (
                    <button
                      key={l.id}
                      disabled={l.used || step1Done}
                      onClick={() => handleLetterClick(l)}
                      className={`w-11 h-11 rounded-xl font-black text-lg transition-all active:scale-90 ${
                        l.used
                          ? 'bg-slate-900 text-slate-700 border border-slate-800 opacity-20 cursor-not-allowed'
                          : 'bg-slate-800 hover:bg-amber-500 text-white hover:text-slate-950 border border-slate-700 shadow-md'
                      }`}
                    >
                      {l.char}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    setScrambleTyped('');
                    setScrambleLetters((prev) => prev.map((l) => ({ ...l, used: false })));
                  }}
                  className="text-xs text-slate-400 hover:text-amber-300 underline font-mono"
                >
                  Harfleri Sıfırla ↺
                </button>
              </div>

              {step1Done && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-pop-in">
                  ✓ Doğru! Yazım başarıyla hafızaya kilitlendi. 2. Aşamaya geçiliyor...
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Fill in the Blank inside the Survival Sentence */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn text-center">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  2. Aşama: Cümledeki Boşluğu Doldur
                </span>
                <p className="text-xs text-slate-400">
                  Memurun şüphelenmemesi için aşağıdaki cümleyi doğru kelimeyle tamamla:
                </p>
              </div>

              {/* The Sentence with Blank */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-base font-mono font-bold text-white leading-relaxed">
                {trainingData.sentenceWithBlank.replace('[ _____ ]', `[ ${selectedWordForBlank || '_______'} ]`)}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                {sentenceOptions.map((opt, i) => {
                  const isPicked = selectedWordForBlank === opt;
                  const isCorrect = opt.toLowerCase() === trainingData.correctWord.toLowerCase();
                  return (
                    <button
                      key={i}
                      disabled={step2Done}
                      onClick={() => handleSelectBlankWord(opt)}
                      className={`p-3.5 rounded-2xl border text-sm font-bold transition-all active:scale-95 ${
                        isPicked && isCorrect
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                          : isPicked && !isCorrect
                          ? 'bg-rose-900/60 border-rose-500 text-rose-200 animate-shake'
                          : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {step2Done && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-pop-in">
                  ✓ Harika! Cümle kalıbı kusursuz oturdu. Son aşamaya geçiliyor...
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Listen, Pronounce & Certify */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn text-center">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                  3. Aşama: Memurun Karşısına Çık ve Onayla
                </span>
                <h3 className="text-lg font-bold text-white">
                  Tam İngilizce Cümleyi Dinle ve Özümse
                </h3>
              </div>

              {/* Full sentence audio box */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 text-center space-y-3">
                <p className="text-base sm:text-lg font-mono font-bold text-emerald-300">
                  &ldquo;{trainingData.sentenceFilled}&rdquo;
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      speakEnglish(trainingData.sentenceFilled);
                      setHasListened(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>İngiliz Aksanıyla Dinle</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      speakEnglishSlow(trainingData.sentenceFilled);
                      setHasListened(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-2"
                  >
                    <span>🐢 Yavaş Dinle</span>
                  </button>
                </div>
              </div>

              {/* Grammar / Culture Tip Reminder */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-left text-xs flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">Altın Kural:</span>
                  <p className="text-slate-300 mt-0.5">{trainingData.grammarTipTr}</p>
                </div>
              </div>

              {/* Ready to Return Button */}
              <button
                disabled={!hasListened || step3Done}
                onClick={handleFinishDrills}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/25 active:scale-95 disabled:opacity-40"
              >
                {step3Done ? '✓ Onaylandı! Masaya Dönülüyor...' : 'Antrenmanı Tamamladım! Masaya Geri Dön & Doğru Cevapla (+50 XP, 3 Hak Yenilenir)'}
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
