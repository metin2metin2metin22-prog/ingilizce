import React, { useState, useEffect, useRef } from 'react';
import { DialogueScenario, DialogueTurn } from '../types';
import { 
  Volume2, Lock, Unlock, Sparkles, Check, AlertTriangle, 
  Lightbulb, Stamp, ArrowRight, RotateCcw, ShieldAlert, Award, Zap, HelpCircle, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds, speakEnglish } from '../utils/audio';

interface InteractiveDialogueProps {
  scenario: DialogueScenario;
  warningsLeft: number;
  onLoseWarning: () => void;
  onScenarioCompleted: (scenarioId: string, wordIds: string[]) => void;
  onDeported: () => void;
}

interface ChatMessage {
  id: string;
  speaker: 'NPC' | 'PLAYER';
  textEn: string;
  textTr?: string;
  targetWord?: string;
  targetWordTr?: string;
  mnemonic?: string;
}

export const InteractiveDialogue: React.FC<InteractiveDialogueProps> = ({
  scenario,
  warningsLeft,
  onLoseWarning,
  onScenarioCompleted,
  onDeported,
}) => {
  // Phase: 'DIALOGUE' (Conversational active recall) -> 'RETENTION_BLITZ' (5-word memory test) -> 'COMPLETED' (Passport Stamp Slam)
  const [phase, setPhase] = useState<'DIALOGUE' | 'RETENTION_BLITZ' | 'COMPLETED'>('DIALOGUE');

  // Dialogue progress
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wrongWordFeedback, setWrongWordFeedback] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Active micro-flashcard modal
  const [inspectWord, setInspectWord] = useState<{ word: string; phonetic: string; translation: string; mnemonic: string } | null>(null);

  // Retention Blitz state
  const [blitzIndex, setBlitzIndex] = useState<number>(0);
  const [blitzScore, setBlitzScore] = useState<number>(0);
  const [blitzOptions, setBlitzOptions] = useState<string[]>([]);
  const [blitzWrongNotice, setBlitzWrongNotice] = useState<string | null>(null);

  const safeTurns = scenario?.turns || [];
  const currentTurn: DialogueTurn | undefined = safeTurns[currentTurnIndex];
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize scenario safely
  useEffect(() => {
    setPhase('DIALOGUE');
    setCurrentTurnIndex(0);
    setSelectedWord(null);
    setWrongWordFeedback(null);
    setInspectWord(null);
    setBlitzIndex(0);
    setBlitzScore(0);

    if (safeTurns.length > 0) {
      const firstTurn = safeTurns[0];
      setMessages([
        {
          id: `msg-${Date.now()}`,
          speaker: 'NPC',
          textEn: firstTurn.npcMessageEn,
          textTr: firstTurn.npcMessageTr,
          targetWord: firstTurn.targetWord,
          targetWordTr: firstTurn.targetWordTr,
          mnemonic: firstTurn.mnemonic,
        },
      ]);
      speakEnglish(firstTurn.audioText);
    }
  }, [scenario]);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, wrongWordFeedback]);

  if (!scenario || safeTurns.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-3xl border border-slate-800">
        Diyalog yükleniyor...
      </div>
    );
  }

  // Handle player selecting a word to fill the sentence blank
  const handleSelectWord = (wordChoice: string) => {
    if (!currentTurn) return;
    setSelectedWord(wordChoice);

    const isMatch = wordChoice.toLowerCase() === currentTurn.targetWord.toLowerCase();

    if (isMatch) {
      sounds.playCorrect();
      setWrongWordFeedback(null);

      // Add completed player message to dialogue stream
      const nextMessages: ChatMessage[] = [
        ...messages,
        {
          id: `player-${Date.now()}`,
          speaker: 'PLAYER',
          textEn: currentTurn.sentenceFilled,
          textTr: currentTurn.sentenceTr,
          targetWord: currentTurn.targetWord,
          targetWordTr: currentTurn.targetWordTr,
        },
      ];
      setMessages(nextMessages);

      // Read player voice aloud
      speakEnglish(currentTurn.sentenceFilled);

      // Check if more dialogue turns remain
      if (currentTurnIndex + 1 < safeTurns.length) {
        const nextTurn = safeTurns[currentTurnIndex + 1];
        setTimeout(() => {
          setMessages([
            ...nextMessages,
            {
              id: `npc-${Date.now()}`,
              speaker: 'NPC',
              textEn: nextTurn.npcMessageEn,
              textTr: nextTurn.npcMessageTr,
              targetWord: nextTurn.targetWord,
              targetWordTr: nextTurn.targetWordTr,
              mnemonic: nextTurn.mnemonic,
            },
          ]);
          setCurrentTurnIndex(prev => prev + 1);
          setSelectedWord(null);
          speakEnglish(nextTurn.audioText);
        }, 1100);
      } else {
        // Dialogue finished! Switch to Phase 2: Retention Blitz
        setTimeout(() => {
          sounds.playAirportChime();
          setPhase('RETENTION_BLITZ');
          setupBlitzQuestion(0);
        }, 1200);
      }

    } else {
      // Wrong word chosen!
      sounds.playWarning();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      setWrongWordFeedback(
        `Memur duraksadı: '${wordChoice}' kelimesi buraya uymaz! İpucunu hatırla: '${currentTurn.targetWord}' = ${currentTurn.targetWordTr} (${currentTurn.mnemonic})`
      );
      onLoseWarning();

      if (warningsLeft <= 1) {
        setTimeout(() => onDeported(), 900);
      }
    }
  };

  // ================= RETENTION BLITZ SETUP =================
  function setupBlitzQuestion(index: number) {
    setBlitzIndex(index);
    setBlitzWrongNotice(null);
    const targetTurn = safeTurns[index];
    if (!targetTurn) return;

    const distractors = safeTurns
      .filter((_, i) => i !== index)
      .map(t => t.targetWordTr);
    const pool = [targetTurn.targetWordTr, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
    setBlitzOptions(pool);
    speakEnglish(targetTurn.targetWord);
  }

  const handleBlitzAnswer = (chosenTr: string) => {
    const currentTarget = safeTurns[blitzIndex];
    if (!currentTarget) return;

    if (chosenTr.toLowerCase() === currentTarget.targetWordTr.toLowerCase()) {
      sounds.playCorrect();
      const nextScore = blitzScore + 1;
      setBlitzScore(nextScore);

      if (blitzIndex + 1 < safeTurns.length) {
        setupBlitzQuestion(blitzIndex + 1);
      } else {
        // %100 PASSPORT STAMP SLAM!
        sounds.playPassportStamp();
        setPhase('COMPLETED');
        confetti({
          particleCount: 160,
          spread: 110,
          origin: { y: 0.6 },
        });
        onScenarioCompleted(scenario.id, safeTurns.map(t => t.targetWord));
      }
    } else {
      sounds.playWarning();
      setBlitzWrongNotice(
        `Yanlış anlam! '${currentTarget.targetWord}' kelimesi '${currentTarget.targetWordTr}' demektir. (${currentTarget.mnemonic})`
      );
      onLoseWarning();
      if (warningsLeft <= 1) {
        setTimeout(() => onDeported(), 900);
      }
    }
  };

  const progressPercent = phase === 'COMPLETED' 
    ? 100 
    : phase === 'RETENTION_BLITZ' 
    ? 60 + Math.round((blitzIndex / safeTurns.length) * 40)
    : Math.round((currentTurnIndex / safeTurns.length) * 60);

  const blankSentenceParts = currentTurn?.sentenceWithBlank?.split('[ _____ ]') || [
    currentTurn?.sentenceFilled || '',
    '',
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-2xl flex flex-col overflow-hidden min-h-[640px]">
      
      {/* Top Header */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-inner">
            {scenario.npcAvatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white font-heading">{scenario.npcName}</h2>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold">
                {scenario.level}
              </span>
            </div>
            <p className="text-xs text-slate-400">{scenario.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Warnings left */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400">
            <AlertTriangle className={`w-4 h-4 ${warningsLeft <= 1 ? 'text-rose-500 animate-bounce' : 'text-amber-400'}`} />
            <span>{warningsLeft}/3 Hak</span>
          </div>

          {/* Progress % */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold font-mono">
            <span>Ustalık: %{progressPercent}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ================= PHASE 1: LIVING DIALOGUE WITH ACTIVE RECALL ================= */}
      {phase === 'DIALOGUE' && (
        <>
          {/* Conversation Stream (Chat messages) */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[360px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 animate-pop-in ${
                  msg.speaker === 'PLAYER' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.speaker === 'NPC' && (
                  <span className="text-2xl mt-1 select-none flex-shrink-0">{scenario.npcAvatar}</span>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-lg space-y-1 shadow-md ${
                    msg.speaker === 'PLAYER'
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm sm:text-base font-semibold leading-relaxed">
                      {msg.textEn}
                    </p>
                    <button
                      onClick={() => speakEnglish(msg.textEn)}
                      className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-slate-300 hover:text-white transition-all cursor-pointer flex-shrink-0"
                      title="Seslendir"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {msg.textTr && (
                    <p className={`text-xs ${msg.speaker === 'PLAYER' ? 'text-sky-100/80' : 'text-slate-400'} pt-1 border-t border-white/10`}>
                      {msg.textTr}
                    </p>
                  )}

                  {/* Clickable Micro-Flashcard Badge inside message */}
                  {msg.targetWord && (
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        onClick={() => {
                          sounds.playClick();
                          const foundTurn = safeTurns.find(t => t.targetWord.toLowerCase() === msg.targetWord?.toLowerCase());
                          if (foundTurn) {
                            setInspectWord({
                              word: foundTurn.targetWord,
                              phonetic: foundTurn.targetWordPhonetic,
                              translation: foundTurn.targetWordTr,
                              mnemonic: foundTurn.mnemonic,
                            });
                            speakEnglish(foundTurn.targetWord);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>Kelime Kartını İncele: <strong>{msg.targetWord}</strong></span>
                      </button>
                    </div>
                  )}
                </div>

                {msg.speaker === 'PLAYER' && (
                  <span className="text-2xl mt-1 select-none flex-shrink-0">🧝‍♂️</span>
                )}
              </div>
            ))}

            <div ref={chatBottomRef} />
          </div>

          {/* Error / Correction Box */}
          {wrongWordFeedback && (
            <div className={`mx-4 sm:mx-6 mb-2 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-pop-in ${
              isShaking ? 'animate-shake' : ''
            }`}>
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300">Düzeltme: </span>
                <span>{wrongWordFeedback}</span>
              </div>
            </div>
          )}

          {/* Active Recall Input: The Sentence with the Blank */}
          {currentTurn && (
            <div className="bg-slate-950 border-t border-slate-800 p-4 sm:p-5 space-y-3.5">
              
              {/* Mission Prompt */}
              <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {currentTurn.playerPromptTr}
                </span>

                <button
                  onClick={() => {
                    sounds.playClick();
                    setInspectWord({
                      word: currentTurn.targetWord,
                      phonetic: currentTurn.targetWordPhonetic,
                      translation: currentTurn.targetWordTr,
                      mnemonic: currentTurn.mnemonic,
                    });
                    speakEnglish(currentTurn.targetWord);
                  }}
                  className="text-amber-400 hover:text-amber-300 underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>İpucu Al</span>
                </button>
              </div>

              {/* The Sentence with Blank Slot */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {blankSentenceParts[0]}
                  <span className="inline-block px-3 py-1 mx-1.5 rounded-xl bg-amber-500/20 border-2 border-dashed border-amber-400 text-amber-300 font-black animate-pulse">
                    {selectedWord || '_____ ? _____'}
                  </span>
                  {blankSentenceParts[1] || ''}
                </p>
                <p className="text-xs text-slate-400 italic">
                  "{currentTurn.sentenceTr}"
                </p>
              </div>

              {/* 4 Interactive Word Chips for Active Recall */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Boşluğa Gelecek Doğru Kelimeyi Seç:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(currentTurn.wordOptions || []).map((wordOpt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectWord(wordOpt)}
                      className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-sky-600/20 border border-slate-800 hover:border-sky-500 text-white font-black text-sm sm:text-base transition-all cursor-pointer text-center shadow-md active:scale-95"
                    >
                      {wordOpt}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* ================= PHASE 2: RETENTION BLITZ (%100 HAFIZA KİLİDİ) ================= */}
      {phase === 'RETENTION_BLITZ' && safeTurns[blitzIndex] && (
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between space-y-6 text-center animate-pop-in">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Award className="w-4 h-4 text-amber-400" />
              Diyalog Tamamlandı • Son %100 Hafıza Sınavı ({blitzIndex + 1}/{safeTurns.length})
            </div>
            <h3 className="text-2xl font-black text-white font-heading">
              Memur: "Harika konuştun! Şimdi bu kelimeleri ezberinden kanıtla!"
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Pasaportuna yeşil giriş damgasının vurulması için konuştuğumuz 5 kelimenin anlamını hatasız teyit etmelisin.
            </p>
          </div>

          {/* Current Blitz Word Card */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 max-w-md mx-auto w-full space-y-3 shadow-xl">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Telaffuz & Kelime</span>
            
            <div className="inline-flex items-center justify-center gap-3">
              <h4 className="text-3xl font-black text-white font-heading">
                {safeTurns[blitzIndex].targetWord}
              </h4>
              <button
                onClick={() => speakEnglish(safeTurns[blitzIndex].targetWord)}
                className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-md transition-all cursor-pointer"
                title="Tekrar Dinle"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 font-mono">{safeTurns[blitzIndex].targetWordPhonetic}</p>
          </div>

          {blitzWrongNotice && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold max-w-md mx-auto">
              {blitzWrongNotice}
            </div>
          )}

          {/* 4 Translation Options */}
          <div className="max-w-md mx-auto w-full space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Doğru Türkçe Karşılığı Hangisi?</span>
            <div className="grid grid-cols-2 gap-2.5">
              {blitzOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleBlitzAnswer(opt)}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:bg-sky-600/20 hover:border-sky-500 text-slate-200 hover:text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div />
        </div>
      )}

      {/* ================= PHASE 3: COMPLETED - RUBBER STAMP SLAM! ================= */}
      {phase === 'COMPLETED' && (
        <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center space-y-6 text-center animate-pop-in">
          
          {/* Heavy Rubber Stamp Animation */}
          <div className="inline-block p-4 sm:p-6 rounded-3xl border-4 border-emerald-500 bg-emerald-950/40 shadow-2xl shadow-emerald-500/30 transform -rotate-2 animate-bounce">
            <div className="border-2 border-dashed border-emerald-400/80 px-8 py-4 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                UK IMMIGRATION & ENTRY PROTOCOL
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-emerald-300 font-heading tracking-wider">
                ✓ APPROVED • %100 CLEARANCE
              </h3>
              <p className="text-xs font-mono font-bold text-emerald-400/90">
                DIALOGUE & VOCABULARY MASTERED
              </p>
            </div>
          </div>

          <div className="space-y-1 max-w-md">
            <h4 className="text-2xl font-black text-white font-heading">
              Tebrikler! Pasaportun Mühürlendi 🎉
            </h4>
            <p className="text-xs text-slate-300 italic">
              "{scenario.npcName} hem konuşmanı hem de 5 kelimeyi ezberlediğini onayladı ve geçiş vizesini vurdu!"
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 max-w-md w-full">
            <span className="text-xs font-bold text-emerald-400">
              Hafızana Kilitlenen 5 Kelime:
            </span>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {safeTurns.map((t) => (
                <span key={t.id} className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  ✓ {t.targetWord} ({t.targetWordTr})
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => sounds.playClick()}
            className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition-all cursor-pointer active:scale-95"
          >
            Sıradaki Londra Mekanına İlerle ✈️
          </button>
        </div>
      )}

      {/* ================= MICRO-FLASHCARD POPUP MODAL ================= */}
      {inspectWord && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-pop-in"
          onClick={() => setInspectWord(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl text-center space-y-4"
          >
            <button
              onClick={() => setInspectWord(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl">
              💡
            </div>

            <div>
              <div className="inline-flex items-center gap-2">
                <h3 className="text-2xl font-black text-white font-heading">{inspectWord.word}</h3>
                <button
                  onClick={() => speakEnglish(inspectWord.word)}
                  className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 font-mono">{inspectWord.phonetic}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500">Türkçe Karşılığı</span>
              <h4 className="text-lg font-black text-amber-300">{inspectWord.translation}</h4>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-left">
              <span className="font-bold text-amber-300">Akılda Kalıcı Hafıza Çivisi:</span>
              <p className="text-slate-300 mt-1 leading-relaxed">{inspectWord.mnemonic}</p>
            </div>

            <button
              onClick={() => setInspectWord(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Anladım, Diyaloğa Dön
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
