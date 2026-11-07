import React, { useState } from 'react';
import { LUGGAGE_SECURITY_ITEMS, LuggageItem } from '../data/luggageItems';
import { sounds, speakEnglish } from '../utils/audio';
import { X, Volume2, ShieldAlert, Sparkles, CheckCircle2, AlertOctagon, RotateCcw, Trophy } from 'lucide-react';

interface LuggageScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardXP: (xp: number, pounds: number) => void;
}

export const LuggageScannerModal: React.FC<LuggageScannerModalProps> = ({
  isOpen,
  onClose,
  onRewardXP,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
    actionDone: string;
  } | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentItem: LuggageItem | undefined = LUGGAGE_SECURITY_ITEMS[currentIndex];

  const handleAction = (action: 'TRAY' | 'PROHIBITED' | 'KEEP_IN_HAND' | 'POCKET_EMPTY' | 'CABIN_ONLY') => {
    if (!currentItem || feedback) return;

    sounds.playScannerBeep();
    const isCorrect = currentItem.actionRequired === action;

    if (isCorrect) {
      sounds.playCorrect();
      setScore((prev) => prev + currentItem.points);
      setFeedback({
        isCorrect: true,
        message: `Tebrikler! ${currentItem.actionPromptTr}`,
        actionDone: currentItem.actionPromptEn,
      });
    } else {
      sounds.playAlarmSiren();
      setFeedback({
        isCorrect: false,
        message: `Hata! Güvenlik Memuru Uyardı: Doğrusu "${currentItem.actionPromptTr}" olmalıydı!`,
        actionDone: currentItem.actionPromptEn,
      });
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex + 1 < LUGGAGE_SECURITY_ITEMS.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsGameOver(true);
        sounds.playLevelUp();
        onRewardXP(60, 25);
      }
    }, 2200);
  };

  const handleRestart = () => {
    sounds.playClick();
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setIsGameOver(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Terminal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner">
              🧳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold">
                  HEATHROW T5 • SECURITY X-RAY SCANNER
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Havalimanı Bagaj & X-Ray Güvenlik Taraması
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-amber-400">
              Skor: {score} XP
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {!isGameOver && currentItem ? (
            <>
              {/* Progress counter */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Konveyördeki Eşya: {currentIndex + 1} / {LUGGAGE_SECURITY_ITEMS.length}</span>
                <span className="text-emerald-400">Canlı X-Ray Frekansı: 120 GHz</span>
              </div>

              {/* X-Ray Scanner Screen View */}
              <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-950 border-2 border-emerald-500/40 shadow-[inset_0_0_30px_rgba(16,185,129,0.15)] flex flex-col items-center justify-center text-center overflow-hidden">
                
                {/* Luminous Grid lines effect */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Sweeping Laser Line */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse top-1/2 pointer-events-none" />

                {/* Scanned Item Icon & Name */}
                <div className="relative z-10 flex flex-col items-center space-y-2">
                  <div className="text-6xl drop-shadow-[0_0_20px_rgba(16,185,129,0.5)] transform hover:scale-110 transition duration-300">
                    {currentItem.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                        {currentItem.nameEn}
                      </h3>
                      <button
                        onClick={() => {
                          sounds.playClick();
                          speakEnglish(currentItem.nameEn);
                        }}
                        className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 transition"
                        title="İngilizce Telaffuz"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-emerald-400 font-bold">{currentItem.nameTr}</p>
                    <p className="text-xs text-slate-400 font-mono">{currentItem.phoneticTr}</p>
                  </div>
                </div>

                {/* Instant Feedback Overlay */}
                {feedback && (
                  <div
                    className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-fadeIn ${
                      feedback.isCorrect
                        ? 'bg-emerald-950/85 text-emerald-100'
                        : 'bg-rose-950/85 text-rose-100'
                    }`}
                  >
                    {feedback.isCorrect ? (
                      <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                    ) : (
                      <AlertOctagon className="w-12 h-12 text-rose-400 mb-2 animate-pulse" />
                    )}
                    <h4 className="text-base font-bold mb-1">{feedback.message}</h4>
                    <p className="text-xs font-mono opacity-80">&ldquo;{feedback.actionDone}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Educational Rule Explanation Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-300">Havalimanı Güvenlik Kuralı:</span>
                  <p className="mt-0.5 text-slate-400">{currentItem.securityExplanation}</p>
                </div>
              </div>

              {/* Action Decision Buttons */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  Gümrük kuralına göre bu eşyaya ne yapmalısın?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    disabled={Boolean(feedback)}
                    onClick={() => handleAction('TRAY')}
                    className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-left text-xs font-semibold border border-slate-700 hover:border-emerald-400 transition flex items-center gap-2 group disabled:opacity-50"
                  >
                    <span className="text-lg">📦</span>
                    <div>
                      <span className="text-slate-100 font-bold block group-hover:text-emerald-300">
                        Ayrı Plastik Sepete Çıkar
                      </span>
                      <span className="text-[11px] text-slate-400">Place in a separate tray</span>
                    </div>
                  </button>

                  <button
                    disabled={Boolean(feedback)}
                    onClick={() => handleAction('PROHIBITED')}
                    className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-left text-xs font-semibold border border-slate-700 hover:border-rose-400 transition flex items-center gap-2 group disabled:opacity-50"
                  >
                    <span className="text-lg">🚫</span>
                    <div>
                      <span className="text-slate-100 font-bold block group-hover:text-rose-300">
                        Yasak! Çöpe At / Müsadere
                      </span>
                      <span className="text-[11px] text-slate-400">Forbidden / Surrender item</span>
                    </div>
                  </button>

                  <button
                    disabled={Boolean(feedback)}
                    onClick={() => handleAction('KEEP_IN_HAND')}
                    className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-left text-xs font-semibold border border-slate-700 hover:border-amber-400 transition flex items-center gap-2 group disabled:opacity-50"
                  >
                    <span className="text-lg">✋</span>
                    <div>
                      <span className="text-slate-100 font-bold block group-hover:text-amber-300">
                        Elde Tut / Sepete Bırakma
                      </span>
                      <span className="text-[11px] text-slate-400">Keep in hand at all times</span>
                    </div>
                  </button>

                  <button
                    disabled={Boolean(feedback)}
                    onClick={() => handleAction('CABIN_ONLY')}
                    className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-left text-xs font-semibold border border-slate-700 hover:border-sky-400 transition flex items-center gap-2 group disabled:opacity-50"
                  >
                    <span className="text-lg">🎒</span>
                    <div>
                      <span className="text-slate-100 font-bold block group-hover:text-sky-300">
                        Sadece Kabin Çantasına Koy
                      </span>
                      <span className="text-[11px] text-slate-400">Cabin luggage only (No cargo)</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Game Over / Clearance Completed Screen */
            <div className="py-8 px-4 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
                <Trophy className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Güvenlik Taraması Başarıyla Tamamlandı!
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Heathrow T5 güvenlik kurallarını ve 8 kritik bagaj eşyasını başarıyla öğrendiniz.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 max-w-sm mx-auto flex items-center justify-around font-mono">
                <div>
                  <span className="text-[11px] text-slate-400 block">Kazanılan XP</span>
                  <span className="text-lg font-black text-amber-300">+{score + 60} XP</span>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Ödül Harçlık</span>
                  <span className="text-lg font-black text-emerald-400">+£25</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Tekrar Oyna
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-lg shadow-emerald-500/25"
                >
                  Diyaloğa Dön
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
