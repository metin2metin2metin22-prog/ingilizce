import React, { useState, useEffect, useRef } from 'react';
import { DialogueScenario, DialogueTurn, TurnOption } from '../types';
import { 
  Volume2, Sparkles, AlertTriangle, 
  Lightbulb, Stamp, ArrowRight, ArrowLeft, RotateCcw, 
  ShieldAlert, Award, BookOpen, GraduationCap, MessageSquare,
  Mic, MicOff, Headphones, Eye, CheckCircle2, Flame,
  Timer, Zap, Shield, Plane, Banknote, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  sounds, speakEnglish, speakEnglishSlow, 
  startSpeechRecognition, stopSpeechRecognition, isSpeechRecognitionSupported 
} from '../utils/audio';
import { InteractiveWordText } from './InteractiveWordText';

interface InteractiveDialogueProps {
  scenario: DialogueScenario;
  warningsLeft: number;
  cashPounds: number;
  onLoseWarning: () => void;
  onScenarioCompleted: (scenarioId: string, wordIds: string[]) => void;
  onDeported: () => void;
  onNextScenario: () => void;
  onRewardXP: (xp: number, pounds: number) => void;
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

type OfficerMood = 'NEUTRAL' | 'SUSPICIOUS' | 'ANGRY' | 'IMPRESSED';

export const InteractiveDialogue: React.FC<InteractiveDialogueProps> = ({
  scenario,
  warningsLeft,
  cashPounds,
  onLoseWarning,
  onScenarioCompleted,
  onDeported,
  onNextScenario,
  onRewardXP,
}) => {
  // Mode:
  // 1. 'LEARN': 5 kelimeyi harf dizme, hızlı eşleştirme ve sesli pratikle öğreten interaktif ders
  // 2. 'DIALOGUE': Canlı hayatta kalma diyalogu (Gerilim barı, kombolar, mikrofon, cümle kurma)
  // 3. 'RETENTION_BLITZ': %100 hafıza mühürleme sınavı
  // 4. 'COMPLETED': Pasaporta yeşil damga vurulma anı
  const [mode, setMode] = useState<'LEARN' | 'DIALOGUE' | 'RETENTION_BLITZ' | 'COMPLETED'>('LEARN');

  // Step 1: Learning Card index & interactive practice
  const [learningCardIndex, setLearningCardIndex] = useState<number>(0);
  const [spellingInput, setSpellingInput] = useState<string>('');
  const [scrambledLetters, setScrambledLetters] = useState<{ id: string; letter: string; used: boolean }[]>([]);
  const [spellingSuccess, setSpellingSuccess] = useState<boolean>(false);
  const [masteredLearnIndices, setMasteredLearnIndices] = useState<number[]>([]);
  const [showGrammarTip, setShowGrammarTip] = useState<boolean>(false);

  // Rapid Matching Mini-Game in Step 1
  const [step1SubTab, setStep1SubTab] = useState<'SPELL' | 'MATCH_GAME'>('SPELL');
  const [matchSelectedEn, setMatchSelectedEn] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  // Voice Speech Recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);

  // Dynamic Officer Tension & Mood
  const [officerMood, setOfficerMood] = useState<OfficerMood>('NEUTRAL');
  const [suspicionPercent, setSuspicionPercent] = useState<number>(20);
  const [comboCount, setComboCount] = useState<number>(0);
  const [comboBanner, setComboBanner] = useState<string | null>(null);
  const [officerLiveReaction, setOfficerLiveReaction] = useState<string | null>(null);

  // Adrenaline Timer
  const [isAdrenalineMode, setIsAdrenalineMode] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(18);
  const timerRef = useRef<any>(null);

  // Ambience audio
  const [isAmbienceActive, setIsAmbienceActive] = useState<boolean>(sounds.isAmbiencePlaying);

  // Step 2: Dialogue state
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wrongWordFeedback, setWrongWordFeedback] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [earTrainingHideText, setEarTrainingHideText] = useState<boolean>(false);
  const [revealedNpcText, setRevealedNpcText] = useState<boolean>(false);

  // Sentence Builder Mode in Dialogue
  const [dialogueInputMode, setDialogueInputMode] = useState<'FILL_BLANK' | 'BUILD_SENTENCE'>('FILL_BLANK');
  const [assembledTokens, setAssembledTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<{ id: string; text: string; used: boolean }[]>([]);

  // Step 3: Retention Blitz state
  const [blitzIndex, setBlitzIndex] = useState<number>(0);
  const [blitzScore, setBlitzScore] = useState<number>(0);
  const [blitzOptions, setBlitzOptions] = useState<string[]>([]);
  const [blitzWrongNotice, setBlitzWrongNotice] = useState<string | null>(null);

  const safeTurns = scenario?.turns || [];
  const currentTurn: DialogueTurn | undefined = safeTurns[currentTurnIndex];
  const currentLearnWord: DialogueTurn | undefined = safeTurns[learningCardIndex];
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Setup Scrambled Letters for Step 1 Spelling Practice
  useEffect(() => {
    if (mode === 'LEARN' && currentLearnWord) {
      speakEnglish(currentLearnWord.targetWord);
      setSpellingInput('');
      setSpellingSuccess(false);
      setSpeechFeedback(null);
      setShowGrammarTip(false);

      const letters = currentLearnWord.targetWord.toUpperCase().split('');
      const shuffled = letters
        .map((l, idx) => ({ id: `${l}-${idx}-${Date.now()}`, letter: l, used: false }))
        .sort(() => Math.random() - 0.5);
      setScrambledLetters(shuffled);
    }
  }, [learningCardIndex, mode, currentLearnWord]);

  // Reset scenario when scenario changes
  useEffect(() => {
    setMode('LEARN');
    setLearningCardIndex(0);
    setCurrentTurnIndex(0);
    setSelectedWord(null);
    setWrongWordFeedback(null);
    setBlitzIndex(0);
    setBlitzScore(0);
    setMasteredLearnIndices([]);
    setOfficerMood('NEUTRAL');
    setSuspicionPercent(20);
    setComboCount(0);
    setMatchedPairs([]);
    setOfficerLiveReaction(null);
  }, [scenario]);

  // Adrenaline Timer loop
  useEffect(() => {
    if (mode === 'DIALOGUE' && isAdrenalineMode && currentTurn) {
      setTimeLeft(18);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeExpired();
            return 0;
          }
          if (prev === 5) {
            sounds.playHeartbeat();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, isAdrenalineMode, currentTurnIndex, currentTurn]);

  // Setup Sentence Builder tokens when turn changes
  useEffect(() => {
    if (currentTurn) {
      const tokens = currentTurn.sentenceTokens || currentTurn.sentenceFilled.split(' ');
      const shuffled = tokens
        .map((t, idx) => ({ id: `tok-${idx}-${t}`, text: t, used: false }))
        .sort(() => Math.random() - 0.5);
      setAvailableTokens(shuffled);
      setAssembledTokens([]);
    }
  }, [currentTurnIndex, currentTurn]);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, wrongWordFeedback, officerLiveReaction]);

  // Clean up mic & ambience
  useEffect(() => {
    return () => {
      stopSpeechRecognition();
    };
  }, []);

  // Time expired in Adrenaline Mode
  const handleTimeExpired = () => {
    sounds.playWarning();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    setOfficerMood('SUSPICIOUS');
    setSuspicionPercent((prev) => Math.min(100, prev + 35));
    setComboCount(0);
    setWrongWordFeedback('Süre doldu! Memur duraksamandan şüphelendi: "Neden tereddüt ettiniz?"');
    onLoseWarning();

    if (warningsLeft <= 1 || suspicionPercent >= 90) {
      setTimeout(() => onDeported(), 900);
    }
  };

  // Handle letter click in Step 1 Spelling Challenge
  const handleLetterClick = (letterObj: { id: string; letter: string; used: boolean }) => {
    if (letterObj.used || spellingSuccess || !currentLearnWord) return;
    sounds.playClick();

    const nextInput = spellingInput + letterObj.letter;
    setSpellingInput(nextInput);

    setScrambledLetters((prev) =>
      prev.map((l) => (l.id === letterObj.id ? { ...l, used: true } : l))
    );

    const targetClean = currentLearnWord.targetWord.toUpperCase();
    if (nextInput === targetClean) {
      sounds.playCorrect();
      sounds.playCoin();
      setSpellingSuccess(true);
      setMasteredLearnIndices((prev) => Array.from(new Set([...prev, learningCardIndex])));
      onRewardXP(20, 2);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else if (!targetClean.startsWith(nextInput)) {
      sounds.playWarning();
      setTimeout(() => {
        setSpellingInput('');
        setScrambledLetters((prev) => prev.map((l) => ({ ...l, used: false })));
      }, 450);
    }
  };

  const handleResetSpelling = () => {
    sounds.playClick();
    setSpellingInput('');
    setScrambledLetters((prev) => prev.map((l) => ({ ...l, used: false })));
  };

  // Rapid Match Mini-Game Logic (Step 1)
  const handleMatchWord = (wordEn: string) => {
    sounds.playClick();
    setMatchSelectedEn(wordEn);
  };

  const handleMatchTr = (trMeaning: string) => {
    if (!matchSelectedEn) return;
    const targetTurn = safeTurns.find((t) => t.targetWord.toLowerCase() === matchSelectedEn.toLowerCase());

    if (targetTurn && targetTurn.targetWordTr.toLowerCase() === trMeaning.toLowerCase()) {
      sounds.playCorrect();
      sounds.playCoin();
      const nextMatched = [...matchedPairs, matchSelectedEn];
      setMatchedPairs(nextMatched);
      setMatchSelectedEn(null);
      onRewardXP(15, 1);

      if (nextMatched.length === safeTurns.length) {
        sounds.playLevelUp();
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        setMasteredLearnIndices(safeTurns.map((_, i) => i));
      }
    } else {
      sounds.playWarning();
      setMatchSelectedEn(null);
    }
  };

  // Voice Practice via Microphone in Step 1 or Step 2
  const handleToggleVoiceInput = (isStep1: boolean = false) => {
    if (isListening) {
      stopSpeechRecognition();
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setSpeechFeedback('Tarayıcınız mikrofon ses tanımayı desteklemiyor. Butonlara tıklayabilirsiniz.');
      return;
    }

    setIsListening(true);
    setSpeechFeedback('Dinleniyor... Lütfen İngilizce konuşun 🎙️');

    startSpeechRecognition(
      (spokenText: string) => {
        setIsListening(false);
        const cleanedSpoken = spokenText.toLowerCase().trim();

        if (isStep1 && currentLearnWord) {
          const target = currentLearnWord.targetWord.toLowerCase();
          if (cleanedSpoken.includes(target)) {
            sounds.playCorrect();
            sounds.playCoin();
            setSpeechFeedback(`✓ Mükemmel telaffuz! Duyulan: "${spokenText}" (+25 XP)`);
            setSpellingSuccess(true);
            setMasteredLearnIndices((prev) => Array.from(new Set([...prev, learningCardIndex])));
            onRewardXP(25, 3);
          } else {
            sounds.playWarning();
            setSpeechFeedback(`Duyulan: "${spokenText}" - Tekrar dene veya harfleri diz!`);
          }
        } else if (!isStep1 && currentTurn) {
          const target = currentTurn.targetWord.toLowerCase();
          if (cleanedSpoken.includes(target)) {
            setSpeechFeedback(`✓ Doğru kelime algılandı: "${spokenText}" (+30 XP)`);
            handleSelectWord(currentTurn.targetWord);
          } else {
            sounds.playWarning();
            setSpeechFeedback(`Duyulan: "${spokenText}" - İpucu: '${currentTurn.targetWord}' demelisin.`);
          }
        }
      },
      (error: string) => {
        setIsListening(false);
        setSpeechFeedback(`Mikrofon uyarısı: ${error}`);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  // Start Dialogue after learning
  const handleStartDialogue = () => {
    sounds.playAirportChime();
    setMode('DIALOGUE');
    setCurrentTurnIndex(0);
    setSelectedWord(null);
    setWrongWordFeedback(null);
    setSpeechFeedback(null);
    setRevealedNpcText(false);
    setOfficerMood('NEUTRAL');
    setSuspicionPercent(20);
    setComboCount(0);
    setOfficerLiveReaction(null);

    const firstTurn = safeTurns[0];
    if (firstTurn) {
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
  };

  if (!scenario || safeTurns.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-3xl border border-slate-800">
        Diyalog yükleniyor...
      </div>
    );
  }

  // Handle player selecting a word in dialogue (Rich options & dramatic reactions)
  const handleSelectWord = (wordChoice: string) => {
    if (!currentTurn) return;
    setSelectedWord(wordChoice);

    const isMatch = wordChoice.toLowerCase() === currentTurn.targetWord.toLowerCase();
    const optionDetail = currentTurn.optionsDetails?.find(
      (opt) => opt.word.toLowerCase() === wordChoice.toLowerCase()
    );

    if (isMatch) {
      // Correct! Dopamine combo surge
      const nextCombo = comboCount + 1;
      setComboCount(nextCombo);
      sounds.playCombo(nextCombo);

      const xpEarned = 20 + nextCombo * 10;
      const poundsEarned = (currentTurn.costPounds || 0) + (nextCombo >= 3 ? 5 : 2);
      onRewardXP(xpEarned, poundsEarned);

      // Lower suspicion & improve mood
      setSuspicionPercent((prev) => Math.max(0, prev - 25));
      setOfficerMood(nextCombo >= 2 ? 'IMPRESSED' : 'NEUTRAL');
      setOfficerLiveReaction(optionDetail?.reaction || 'Memur onayladı: "Very well."');

      // Combo banner
      if (nextCombo === 2) {
        setComboBanner('🔥 2X KOMBO! Harika akıcılık! (+30 XP)');
      } else if (nextCombo === 3) {
        setComboBanner('⚡ 3X KOMBO! Londra Aksanı! (+50 XP, +£5)');
        sounds.playCoin();
      } else if (nextCombo >= 4) {
        setComboBanner(`👑 ${nextCombo}X EFSANEVİ SERİ! (+${xpEarned} XP, +£5)`);
        sounds.playCoin();
      }
      setTimeout(() => setComboBanner(null), 2500);

      setWrongWordFeedback(null);
      setSpeechFeedback(null);

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
      speakEnglish(currentTurn.sentenceFilled);

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
          setCurrentTurnIndex((prev) => prev + 1);
          setSelectedWord(null);
          setRevealedNpcText(false);
          setOfficerLiveReaction(null);
          speakEnglish(nextTurn.audioText);
        }, 1300);
      } else {
        // Dialogue passed! Transition to Retention Blitz
        setTimeout(() => {
          sounds.playAirportChime();
          setMode('RETENTION_BLITZ');
          setupBlitzQuestion(0);
        }, 1300);
      }
    } else {
      // Wrong word: Suspicion surge + Hilarious Officer Reaction!
      sounds.playWarning();
      sounds.playHeartbeat();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      setComboCount(0);
      setOfficerMood('SUSPICIOUS');
      const nextSuspicion = Math.min(100, suspicionPercent + 35);
      setSuspicionPercent(nextSuspicion);

      // Fine penalty if applicable
      if (optionDetail?.finePounds) {
        onRewardXP(0, -optionDetail.finePounds);
      }

      const specificReaction = optionDetail?.reaction || `Memur duraksadı: '${wordChoice}' kelimesi buraya uymaz!`;
      const penaltyNotice = optionDetail?.finePounds ? ` (💸 -£${optionDetail.finePounds} Ceza kesildi!)` : '';

      setOfficerLiveReaction(specificReaction);
      setWrongWordFeedback(
        `${specificReaction}${penaltyNotice} İpucu: '${currentTurn.targetWord}' = ${currentTurn.targetWordTr} (${currentTurn.mnemonic})`
      );
      onLoseWarning();

      if (warningsLeft <= 1 || nextSuspicion >= 100) {
        setOfficerMood('ANGRY');
        setTimeout(() => onDeported(), 900);
      }
    }
  };

  // Sentence Builder Token Selection
  const handleSelectSentenceToken = (tok: { id: string; text: string; used: boolean }) => {
    if (tok.used || !currentTurn) return;
    sounds.playClick();

    const nextAssembled = [...assembledTokens, tok.text];
    setAssembledTokens(nextAssembled);
    setAvailableTokens((prev) =>
      prev.map((t) => (t.id === tok.id ? { ...t, used: true } : t))
    );

    const fullSentence = currentTurn.sentenceTokens || currentTurn.sentenceFilled.split(' ');
    const targetString = fullSentence.join(' ').toLowerCase().replace(/[.,!?;]/g, '');
    const currentString = nextAssembled.join(' ').toLowerCase().replace(/[.,!?;]/g, '');

    if (nextAssembled.length === fullSentence.length) {
      if (currentString === targetString) {
        handleSelectWord(currentTurn.targetWord);
      } else {
        sounds.playWarning();
        setWrongWordFeedback('Cümle sırası hatalı oldu! İngilizce söz dizilişine dikkat et: Özne + Fiil + Nesne.');
        setTimeout(() => {
          setAssembledTokens([]);
          setAvailableTokens((prev) => prev.map((t) => ({ ...t, used: false })));
        }, 800);
      }
    }
  };

  const handleResetSentenceBuilder = () => {
    sounds.playClick();
    setAssembledTokens([]);
    setAvailableTokens((prev) => prev.map((t) => ({ ...t, used: false })));
  };

  // Retention Blitz setup
  function setupBlitzQuestion(index: number) {
    setBlitzIndex(index);
    setBlitzWrongNotice(null);
    const targetTurn = safeTurns[index];
    if (!targetTurn) return;

    const distractors = safeTurns
      .filter((_, i) => i !== index)
      .map((t) => t.targetWordTr);
    const pool = [targetTurn.targetWordTr, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
    setBlitzOptions(pool);
    speakEnglish(targetTurn.targetWord);
  }

  const handleBlitzAnswer = (chosenTr: string) => {
    const currentTarget = safeTurns[blitzIndex];
    if (!currentTarget) return;

    if (chosenTr.toLowerCase() === currentTarget.targetWordTr.toLowerCase()) {
      sounds.playCorrect();
      sounds.playCoin();
      const nextScore = blitzScore + 1;
      setBlitzScore(nextScore);
      onRewardXP(15, 2);

      if (blitzIndex + 1 < safeTurns.length) {
        setupBlitzQuestion(blitzIndex + 1);
      } else {
        // 100% STAMP SLAM
        sounds.playPassportStamp();
        sounds.playLevelUp();
        setMode('COMPLETED');
        onRewardXP(100, 30);
        confetti({
          particleCount: 160,
          spread: 110,
          origin: { y: 0.6 },
        });
        onScenarioCompleted(scenario.id, safeTurns.map((t) => t.targetWord));
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

  const blankSentenceParts = currentTurn?.sentenceWithBlank?.split('[ _____ ]') || [
    currentTurn?.sentenceFilled || '',
    '',
  ];

  // Dynamic Avatar & Mood text
  const officerMoodDetails = {
    NEUTRAL: {
      avatar: scenario.npcAvatar,
      label: 'Sert & Dikkatli',
      color: 'text-slate-400',
      banner: 'Cevabınızı bekliyor...',
    },
    SUSPICIOUS: {
      avatar: '🤨',
      label: 'Şüphelendi!',
      color: 'text-amber-400 animate-pulse',
      banner: '"Emin misiniz? Tutarsızlık seziyorum..."',
    },
    ANGRY: {
      avatar: '🚨',
      label: 'Sorgulama Alarmı!',
      color: 'text-rose-400 animate-bounce',
      banner: '"Telsize uzandı: Son uyarım, doğruyu söyleyin!"',
    },
    IMPRESSED: {
      avatar: '😊',
      label: 'Hayran Kaldı!',
      color: 'text-emerald-400',
      banner: '"Mükemmel telaffuz ve akıcı İngilizce!"',
    },
  }[officerMood];

  return (
    <div className={`relative w-full max-w-4xl mx-auto rounded-3xl bg-slate-900 border-2 shadow-2xl flex flex-col overflow-hidden min-h-[710px] transition-all duration-300 ${
      officerMood === 'SUSPICIOUS' ? 'border-amber-500/60 shadow-amber-950/40' :
      officerMood === 'ANGRY' ? 'border-rose-600 shadow-rose-950/60 ring-4 ring-rose-600/30' :
      officerMood === 'IMPRESSED' ? 'border-emerald-500/60 shadow-emerald-950/40' :
      'border-slate-800'
    }`}>
      
      {/* Top Header: NPC Details, Location, Ambience & Suspicion Gauge */}
      <div className="bg-slate-950/95 border-b border-slate-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-inner">
            {officerMoodDetails.avatar}
            {comboCount >= 2 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-orange-500 text-slate-950 font-black text-[9px] animate-bounce">
                {comboCount}x🔥
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white font-heading">{scenario.npcName}</h2>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold">
                {scenario.level}
              </span>
              <span className={`text-[11px] font-bold ${officerMoodDetails.color}`}>
                • {officerMoodDetails.label}
              </span>
            </div>
            <p className="text-xs text-slate-400">{scenario.location}</p>
          </div>
        </div>

        {/* Suspicion Meter & Ambience Toggle */}
        <div className="flex items-center gap-3">
          
          <button
            onClick={() => {
              const next = sounds.toggleAmbience();
              setIsAmbienceActive(next);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              isAmbienceActive
                ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Londra havalimanı ve tren ortam sesleri"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>{isAmbienceActive ? 'Ambiyans Açık' : 'Ambiyans'}</span>
          </button>

          {/* Suspicion Meter (Şüphe Barı) */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-2xl border border-slate-800 text-xs">
            <div className="space-y-0.5 text-right">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Şüphe: %{suspicionPercent}
              </span>
              <div className="w-24 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    suspicionPercent >= 70
                      ? 'bg-rose-500 animate-pulse'
                      : suspicionPercent >= 40
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${suspicionPercent}%` }}
                />
              </div>
            </div>
            <ShieldAlert className={`w-4 h-4 ${suspicionPercent >= 70 ? 'text-rose-500 animate-bounce' : 'text-slate-500'}`} />
          </div>

        </div>

        {/* 3 Steps Navigation Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setMode('LEARN')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              mode === 'LEARN'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Kodla & Oyna</span>
          </button>

          <button
            onClick={() => {
              if (mode === 'LEARN') handleStartDialogue();
              else setMode('DIALOGUE');
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              mode === 'DIALOGUE'
                ? 'bg-sky-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>2. Canlı Konuş</span>
          </button>

          <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold ${
            mode === 'COMPLETED' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-500'
          }`}>
            <Stamp className="w-3.5 h-3.5" />
            <span>3. %100 Vize</span>
          </div>
        </div>

      </div>

      {/* Dynamic Officer Reaction Banner */}
      {officerLiveReaction && (
        <div className={`px-5 py-2 text-xs font-bold flex items-center justify-between animate-pop-in ${
          officerMood === 'SUSPICIOUS' ? 'bg-amber-500/20 text-amber-300 border-b border-amber-500/30' :
          officerMood === 'ANGRY' ? 'bg-rose-500/25 text-rose-200 border-b border-rose-500/40' :
          'bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30'
        }`}>
          <span className="flex items-center gap-2">
            <span>{officerLiveReaction}</span>
          </span>
          <span className="text-[10px] uppercase font-mono">
            {officerMood === 'IMPRESSED' ? '✓ Şüphe Azaldı (-25%)' : '⚠️ Şüphe Arttı (+35%)'}
          </span>
        </div>
      )}

      {/* Floating Combo Toast Banner */}
      {comboBanner && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-2xl shadow-orange-500/40 animate-bounce flex items-center gap-2">
          <Flame className="w-4 h-4 fill-slate-950" />
          <span>{comboBanner}</span>
        </div>
      )}

      {/* ================= STEP 1: GERÇEK ÖĞRETİM & OYUN MODU ================= */}
      {mode === 'LEARN' && currentLearnWord && (
        <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between space-y-5 animate-pop-in">
          
          {/* Mission Dossier & Boarding Pass Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-sky-950/40 to-slate-950 border border-sky-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-black">
                <Plane className="w-4 h-4 transform -rotate-45" />
                <span>GÖREV BRİFİNGİ • {scenario.flightCode || 'BRITISH AIRWAYS'}</span>
              </div>
              <p className="text-white font-bold text-sm">{scenario.missionObjective}</p>
              <p className="text-slate-400 text-xs">{scenario.introDescription}</p>
            </div>

            <button
              onClick={handleStartDialogue}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-sky-600/30 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Masaya Adım At 👮‍♂️</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Header Sub-tabs: Spelling vs Rapid Match Game */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  Hayati 5 Kelimeyi Çantana At
                </span>
                <p className="text-xs text-slate-400">
                  Memurun soracağı 5 kelimeyi harf harf diz veya 30 saniye hızlı eşleştirmeyle hafızana kilitle!
                </p>
              </div>
            </div>

            {/* Sub-tab Switcher: Harf Dizme vs Hızlı Eşleştirme */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setStep1SubTab('SPELL')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  step1SubTab === 'SPELL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                🧩 Harf Dizme
              </button>
              <button
                onClick={() => setStep1SubTab('MATCH_GAME')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  step1SubTab === 'MATCH_GAME' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>⚡ 30sn Hızlı Eşleştirme</span>
              </button>
            </div>
          </div>

          {/* Sub-tab A: Rich Spelling & Grammar Masterclass */}
          {step1SubTab === 'SPELL' && (
            <>
              {/* Stepper dots */}
              <div className="flex items-center justify-center gap-1.5">
                {safeTurns.map((turn, idx) => {
                  const isMastered = masteredLearnIndices.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => setLearningCardIndex(idx)}
                      className={`flex items-center justify-center rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                        idx === learningCardIndex
                          ? 'bg-amber-400 text-slate-950 w-8 h-7 shadow-md'
                          : isMastered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 w-7 h-7'
                          : 'bg-slate-800 text-slate-400 w-7 h-7'
                      }`}
                    >
                      {isMastered ? '✓' : idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Masterclass Card Body */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* Left Column: Word Identity, Meaning & Memory Trick */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
                  
                  {/* Word & Audio */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {currentLearnWord.partOfSpeech || 'Kelime'} • {scenario.level}
                      </span>
                      {masteredLearnIndices.includes(learningCardIndex) && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Zihne Kazındı
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <h3 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight">
                        {currentLearnWord.targetWord}
                      </h3>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            sounds.playClick();
                            speakEnglish(currentLearnWord.targetWord);
                          }}
                          className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30 transition-all cursor-pointer"
                          title="Normal Hızda Dinle"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            sounds.playClick();
                            speakEnglishSlow(currentLearnWord.targetWord);
                          }}
                          className="p-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30 transition-all cursor-pointer text-xs"
                          title="Yavaş Tane Tane Dinle"
                        >
                          🐢
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-400 font-mono text-xs">{currentLearnWord.targetWordPhonetic}</p>
                  </div>

                  {/* Meaning */}
                  <div className="py-2.5 px-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Türkçe Anlamı</span>
                    <h4 className="text-xl font-black text-amber-300 mt-0.5">{currentLearnWord.targetWordTr}</h4>
                  </div>

                  {/* Memory Mnemonic Clue */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-left text-xs flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300">💡 Hafıza Şifresi:</span>
                      <p className="text-slate-200 mt-0.5 leading-relaxed font-medium">{currentLearnWord.mnemonic}</p>
                    </div>
                  </div>

                  {/* Grammar Pattern */}
                  {currentLearnWord.grammarPattern && (
                    <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-800/40 text-left text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider">
                          🧠 Cümle Kalıbı Formülü:
                        </span>
                        <button
                          onClick={() => setShowGrammarTip(!showGrammarTip)}
                          className="text-[10px] text-sky-300 hover:underline cursor-pointer"
                        >
                          {showGrammarTip ? 'Gizle ▲' : 'Detayı Gör ▼'}
                        </button>
                      </div>
                      <p className="text-white font-mono font-bold bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                        {currentLearnWord.grammarPattern}
                      </p>
                      {showGrammarTip && currentLearnWord.grammarExplanation && (
                        <p className="text-slate-300 text-[11px] pt-1.5 leading-relaxed">
                          {currentLearnWord.grammarExplanation}
                        </p>
                      )}
                    </div>
                  )}

                </div>

                {/* Right Column: Interactive Practice: Letter Scramble & Microphone */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Kelimeni Pratik Et (Yaz & Konuş)
                      </span>
                      <span className="text-[10px] text-slate-400">Harfleri sırayla diz</span>
                    </div>

                    {/* Scramble Letter Target Slot */}
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Harf Dizilişi:</span>
                      <div className="min-h-[42px] flex items-center justify-center gap-1.5 flex-wrap">
                        {currentLearnWord.targetWord.toUpperCase().split('').map((char, idx) => {
                          const typedChar = spellingInput[idx];
                          return (
                            <div
                              key={idx}
                              className={`w-9 h-10 rounded-xl flex items-center justify-center font-mono font-black text-lg border-2 transition-all ${
                                typedChar
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-600'
                              }`}
                            >
                              {typedChar || '_'}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Scrambled Clickable Letter Tiles */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Harflere tıkla:</span>
                        <button
                          onClick={handleResetSpelling}
                          className="text-amber-400 hover:text-amber-300 underline cursor-pointer text-[10px]"
                        >
                          Sıfırla ↺
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-center">
                        {scrambledLetters.map((item) => (
                          <button
                            key={item.id}
                            disabled={item.used || spellingSuccess}
                            onClick={() => handleLetterClick(item)}
                            className={`w-10 h-10 rounded-xl font-black text-base transition-all cursor-pointer active:scale-90 ${
                              item.used
                                ? 'bg-slate-900 text-slate-700 border border-slate-800 opacity-30 cursor-not-allowed'
                                : 'bg-slate-800 hover:bg-sky-600 border border-slate-700 hover:border-sky-400 text-white shadow-md'
                            }`}
                          >
                            {item.letter}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Success Banner */}
                    {spellingSuccess && (
                      <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-pop-in flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Harika! Yazım hafızana kodlandı (+20 XP, +£2).</span>
                      </div>
                    )}

                    {/* Microphone Practice Button */}
                    <div className="pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleVoiceInput(true)}
                          className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            isListening
                              ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                          }`}
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-sky-400" />}
                          <span>{isListening ? 'Dinliyor... Durdur' : '🎙️ Mikrofonla Telaffuz Et (+25 XP)'}</span>
                        </button>

                        <button
                          onClick={() => {
                            sounds.playCorrect();
                            sounds.playCoin();
                            setSpellingSuccess(true);
                            setMasteredLearnIndices((prev) => Array.from(new Set([...prev, learningCardIndex])));
                            onRewardXP(15, 1);
                          }}
                          className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                          title="Biliyorum, Ezberledim Olarak İşaretle"
                        >
                          ✓ Ezberledim
                        </button>
                      </div>

                      {speechFeedback && (
                        <p className="text-[11px] font-bold text-center mt-2 text-sky-300 animate-pop-in">
                          {speechFeedback}
                        </p>
                      )}
                    </div>

                  </div>

                  {/* Usage In Sentence Preview with Interactive Tap-to-Translate */}
                  <div className="p-3.5 rounded-2xl bg-sky-950/20 border border-sky-900/40 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-sky-400">
                      Diyalogda Nasıl Geçecek? (Kelimelere tıklayıp anlamlarına bakabilirsin):
                    </span>
                    <p className="text-white font-semibold">
                      <InteractiveWordText text={currentLearnWord.sentenceFilled} highlightWord={currentLearnWord.targetWord} />
                    </p>
                    <p className="text-slate-400 text-[11px]">{currentLearnWord.sentenceTr}</p>
                  </div>

                </div>

              </div>

              {/* Stepper Footer Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  disabled={learningCardIndex === 0}
                  onClick={() => setLearningCardIndex((prev) => prev - 1)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    learningCardIndex === 0
                      ? 'bg-slate-900 text-slate-600 border-slate-800 opacity-40 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 cursor-pointer'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Önceki Kelime</span>
                </button>

                {learningCardIndex + 1 < safeTurns.length ? (
                  <button
                    onClick={() => setLearningCardIndex((prev) => prev + 1)}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
                  >
                    <span>Sıradaki Kelimeyi Kodla ({learningCardIndex + 2}/5)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleStartDialogue}
                    className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xl shadow-orange-500/25 transition-all cursor-pointer active:scale-95 ring-2 ring-amber-400/40"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>5 Kelimeyi de Kodladım! Canlı Konuşmaya Başla 💬</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* Sub-tab B: 30-Second Rapid Match Mini-Game */}
          {step1SubTab === 'MATCH_GAME' && (
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-6 text-center animate-pop-in">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase">
                  ⚡ 30 Saniye Hızlı Eşleştirme Meydan Okuması
                </span>
                <h3 className="text-2xl font-black text-white font-heading">
                  İngilizce Kelimeleri Türkçe Karşılıklarıyla Eşleştir!
                </h3>
                <p className="text-xs text-slate-400">
                  Önce İngilizce kelimeye tıkla, sonra Türkçe anlamına basarak çiftleri erit!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
                {/* English Column */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-sky-400 uppercase">İngilizce</span>
                  {safeTurns.map((turn) => {
                    const isMatched = matchedPairs.includes(turn.targetWord);
                    const isSelected = matchSelectedEn === turn.targetWord;

                    return (
                      <button
                        key={turn.id}
                        disabled={isMatched}
                        onClick={() => handleMatchWord(turn.targetWord)}
                        className={`w-full p-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                          isMatched
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 opacity-40'
                            : isSelected
                            ? 'bg-sky-600 text-white ring-2 ring-sky-400 shadow-lg'
                            : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white'
                        }`}
                      >
                        {turn.targetWord} {isMatched && '✓'}
                      </button>
                    );
                  })}
                </div>

                {/* Turkish Column (Shuffled) */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase">Türkçe Anlamı</span>
                  {[...safeTurns]
                    .sort((a, b) => a.targetWordTr.localeCompare(b.targetWordTr))
                    .map((turn) => {
                      const isMatched = matchedPairs.includes(turn.targetWord);

                      return (
                        <button
                          key={turn.id}
                          disabled={isMatched}
                          onClick={() => handleMatchTr(turn.targetWordTr)}
                          className={`w-full p-3 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                            isMatched
                              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 opacity-40'
                              : 'bg-slate-900 hover:bg-amber-600/20 border border-slate-800 hover:border-amber-500 text-slate-200'
                          }`}
                        >
                          {turn.targetWordTr} {isMatched && '✓'}
                        </button>
                      );
                    })}
                </div>
              </div>

              {matchedPairs.length === safeTurns.length && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold space-y-2 animate-pop-in">
                  <p>🎉 Tebrikler! Tüm kelimeleri başarıyla eşleştirdin (+75 XP, +£10)!</p>
                  <button
                    onClick={handleStartDialogue}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase cursor-pointer"
                  >
                    Canlı Konuşmaya Geç 💬
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ================= STEP 2: GERÇEK CANLI DİYALOG ================= */}
      {mode === 'DIALOGUE' && (
        <>
          {/* Conversation Stream Tools: Ear Training Toggle, Adrenaline Timer & Sentence Builder */}
          <div className="bg-slate-950/80 px-5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            
            {/* Ear Training & Adrenaline Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setEarTrainingHideText(!earTrainingHideText);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                  earTrainingHideText
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Memurun sözlerini gizleyip önce sadece kulakla anlamaya çalışın"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{earTrainingHideText ? '🎧 Kulak Eğitimi Açık' : '🎧 Kulak Eğitimi'}</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setIsAdrenalineMode(!isAdrenalineMode);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                  isAdrenalineMode
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="15 saniyelik gerçek zamanlı heyecan modu"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{isAdrenalineMode ? `⏱️ ${timeLeft}sn Kaldı` : '⏱️ Adrenalin Süresi'}</span>
              </button>
            </div>

            {/* Answer Input Mode: Fill blank vs Sentence builder */}
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setDialogueInputMode('FILL_BLANK')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  dialogueInputMode === 'FILL_BLANK'
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Boşluk Doldur
              </button>
              <button
                onClick={() => setDialogueInputMode('BUILD_SENTENCE')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  dialogueInputMode === 'BUILD_SENTENCE'
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🧩 Cümleyi Diz
              </button>
            </div>
          </div>

          {/* Adrenaline countdown progress bar */}
          {isAdrenalineMode && (
            <div className="w-full h-1 bg-slate-950">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 5 ? 'bg-rose-500' : 'bg-sky-500'
                }`}
                style={{ width: `${(timeLeft / 18) * 100}%` }}
              />
            </div>
          )}

          {/* Conversation Chat Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[330px]">
            {messages.map((msg, idx) => {
              const isLatestNpc = msg.speaker === 'NPC' && idx === messages.length - 1;
              const hideThisText = isLatestNpc && earTrainingHideText && !revealedNpcText;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 animate-pop-in ${
                    msg.speaker === 'PLAYER' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.speaker === 'NPC' && (
                    <span className="text-2xl mt-1 select-none flex-shrink-0">
                      {isLatestNpc ? officerMoodDetails.avatar : scenario.npcAvatar}
                    </span>
                  )}

                  <div
                    className={`p-4 rounded-2xl max-w-lg space-y-1.5 shadow-md ${
                      msg.speaker === 'PLAYER'
                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {hideThisText ? (
                        <div className="space-y-1">
                          <p className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                            <Headphones className="w-4 h-4" />
                            Kulak Eğitimi: Sesi dinle ve ne dediğini tahmin et!
                          </p>
                          <button
                            onClick={() => {
                              sounds.playClick();
                              setRevealedNpcText(true);
                            }}
                            className="text-[11px] underline text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Metni Göster</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm sm:text-base font-semibold leading-relaxed">
                          <InteractiveWordText text={msg.textEn} highlightWord={msg.targetWord} />
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => speakEnglish(msg.textEn)}
                          className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-slate-300 hover:text-white transition-all cursor-pointer flex-shrink-0"
                          title="Normal Seslendir"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => speakEnglishSlow(msg.textEn)}
                          className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-slate-300 hover:text-amber-300 transition-all cursor-pointer flex-shrink-0 text-xs"
                          title="Yavaş Seslendir (Tane Tane)"
                        >
                          🐢
                        </button>
                      </div>
                    </div>

                    {!hideThisText && msg.textTr && (
                      <p className={`text-xs ${msg.speaker === 'PLAYER' ? 'text-sky-100/80' : 'text-slate-400'} pt-1 border-t border-white/10`}>
                        {msg.textTr}
                      </p>
                    )}
                  </div>

                  {msg.speaker === 'PLAYER' && (
                    <span className="text-2xl mt-1 select-none flex-shrink-0">🧝‍♂️</span>
                  )}
                </div>
              );
            })}

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

          {/* Active Recall Dialogue Input Deck */}
          {currentTurn && (
            <div className="bg-slate-950 border-t border-slate-800 p-4 sm:p-5 space-y-3.5">
              
              {/* Mission Prompt & Helper Links */}
              <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {currentTurn.playerPromptTr}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setMode('LEARN');
                      setLearningCardIndex(currentTurnIndex);
                    }}
                    className="text-amber-400 hover:text-amber-300 underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ders Kartı</span>
                  </button>
                </div>
              </div>

              {/* MODE 1: Fill the blank with Dramatic Multi-Choice Options */}
              {dialogueInputMode === 'FILL_BLANK' && (
                <>
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

                  {/* 4 Interactive Word Chips with Turkish Meanings & Warnings */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>DOĞRU KELİMEYİ SEÇ (DİKKAT: YANLIŞ CEVAP POLİSİ ŞÜPHELENDİRİR!):</span>
                      <button
                        onClick={() => handleToggleVoiceInput(false)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isListening
                            ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-sky-400'
                        }`}
                      >
                        {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        <span>{isListening ? 'Dinleniyor...' : '🎙️ Sesli Söyle (+30 XP)'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {(currentTurn.optionsDetails || currentTurn.wordOptions.map(w => ({ word: w, tr: '', reaction: '', isCorrect: w === currentTurn.targetWord }))).map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectWord(opt.word)}
                          className="p-3 sm:p-3.5 rounded-2xl bg-slate-900 hover:bg-sky-600/20 border border-slate-800 hover:border-sky-500 text-white transition-all cursor-pointer text-center shadow-md active:scale-95 group"
                        >
                          <div className="font-black text-sm sm:text-base group-hover:text-amber-300 transition-colors">
                            {opt.word}
                          </div>
                          {opt.tr && (
                            <div className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5">
                              {opt.tr}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {speechFeedback && (
                      <p className="text-[11px] font-bold text-center text-sky-300 animate-pop-in">
                        {speechFeedback}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* MODE 2: Sentence Builder (Duolingo Style Word Tiles) */}
              {dialogueInputMode === 'BUILD_SENTENCE' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 min-h-[64px] flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {assembledTokens.length === 0 ? (
                        <span className="text-slate-500 text-xs italic">
                          Aşağıdaki kelimelere sırayla basarak İngilizce cümleyi kur...
                        </span>
                      ) : (
                        assembledTokens.map((tok, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl bg-sky-600 text-white font-bold text-xs shadow"
                          >
                            {tok}
                          </span>
                        ))
                      )}
                    </div>
                    {assembledTokens.length > 0 && (
                      <button
                        onClick={handleResetSentenceBuilder}
                        className="text-amber-400 hover:text-amber-300 text-xs underline cursor-pointer flex-shrink-0"
                      >
                        Sıfırla ↺
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 italic text-center">
                    "{currentTurn.sentenceTr}"
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {availableTokens.map((tok) => (
                      <button
                        key={tok.id}
                        disabled={tok.used}
                        onClick={() => handleSelectSentenceToken(tok)}
                        className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                          tok.used
                            ? 'bg-slate-900 text-slate-700 border border-slate-800 opacity-30 cursor-not-allowed'
                            : 'bg-slate-900 hover:bg-sky-600/30 border border-slate-700 text-white shadow active:scale-95'
                        }`}
                      >
                        {tok.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </>
      )}

      {/* ================= STEP 3: RETENTION BLITZ (%100 HAFIZA KİLİDİ) ================= */}
      {mode === 'RETENTION_BLITZ' && safeTurns[blitzIndex] && (
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

      {/* ================= STEP 4: PASSPORT RUBBER STAMP SLAMMED! ================= */}
      {mode === 'COMPLETED' && (
        <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center space-y-6 text-center animate-pop-in">
          
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
              Tebrikler! Vizen Onaylandı 🎉
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
            onClick={() => {
              sounds.playAirportChime();
              onNextScenario();
            }}
            className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <span>Sıradaki Londra Mekanına İlerle</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
