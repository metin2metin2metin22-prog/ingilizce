import React, { useState, useEffect } from 'react';
import { PlayerPassport, DialogueScenario } from './types';
import { DIALOGUE_SCENARIOS } from './data/dialogues';
import { SurvivalHUD } from './components/SurvivalHUD';
import { SurvivalRoadmap } from './components/SurvivalRoadmap';
import { InteractiveDialogue } from './components/InteractiveDialogue';
import { FlashcardsView } from './components/FlashcardsView';
import { PassportModal } from './components/PassportModal';
import { DeportedModal } from './components/DeportedModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { BritishSlangModal } from './components/BritishSlangModal';
import { SurvivalDocumentsModal } from './components/SurvivalDocumentsModal';
import { LuggageScannerModal } from './components/LuggageScannerModal';
import { sounds } from './utils/audio';

const STORAGE_KEY_PASSPORT = 'londondialogue_passport_v10';
const STORAGE_KEY_SCENARIOS = 'londondialogue_scenarios_v10';

const INITIAL_PASSPORT: PlayerPassport = {
  travelerName: 'Yolcu (Explorer)',
  cashPounds: 45,
  warningsLeft: 3,
  currentScenarioIndex: 0,
  stampsCount: 0,
  masteredWords: [],
  xp: 35,
  streak: 1,
  rank: 'Çaylak Yolcu',
};

export function App() {
  const [activeView, setActiveView] = useState<'DIALOGUE' | 'FLASHCARDS'>('DIALOGUE');

  const [passport, setPassport] = useState<PlayerPassport>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PASSPORT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.currentScenarioIndex === 'number') {
          return { ...INITIAL_PASSPORT, ...parsed };
        }
      }
    } catch {}
    return INITIAL_PASSPORT;
  });

  const [scenarios, setScenarios] = useState<DialogueScenario[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCENARIOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed[0]?.turns?.[0]?.optionsDetails) {
          return parsed;
        }
      }
    } catch {}
    return DIALOGUE_SCENARIOS;
  });

  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [isDeportedOpen, setIsDeportedOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isSlangOpen, setIsSlangOpen] = useState<boolean>(false);

  // Active scenario
  const safeScenarios = scenarios.length > 0 ? scenarios : DIALOGUE_SCENARIOS;
  const currentScenario = safeScenarios[passport.currentScenarioIndex] || safeScenarios[0];

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PASSPORT, JSON.stringify(passport));
    } catch {}
  }, [passport]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCENARIOS, JSON.stringify(safeScenarios));
    } catch {}
  }, [safeScenarios]);

  // Handle XP & Cash Reward / Deductions
  const handleRewardXP = (xpGain: number, poundsGain: number) => {
    setPassport((prev) => {
      const nextXP = Math.max(0, (prev.xp || 0) + xpGain);
      const nextPounds = Math.max(0, Math.round(((prev.cashPounds || 0) + poundsGain) * 10) / 10);
      const nextStreak = (prev.streak || 0) + (xpGain > 0 ? 1 : 0);
      let nextRank = 'Çaylak Yolcu';
      if (nextXP >= 800) nextRank = 'Diplomat 👑';
      else if (nextXP >= 400) nextRank = 'Yerli Londralı 🏛️';
      else if (nextXP >= 200) nextRank = 'Akıcı Konuşmacı ⚡';
      else if (nextXP >= 80) nextRank = 'Londra Gezgini 🎒';

      return {
        ...prev,
        xp: nextXP,
        cashPounds: nextPounds,
        streak: nextStreak,
        rank: nextRank,
      };
    });
  };

  // Handle warning loss
  const handleLoseWarning = () => {
    setPassport((prev) => {
      const nextWarnings = Math.max(0, prev.warningsLeft - 1);
      return { ...prev, warningsLeft: nextWarnings, streak: 0 };
    });
  };

  // Scenario 100% Cleared
  const handleScenarioCompleted = (scenarioId: string, wordIds: string[]) => {
    setScenarios((prev) =>
      prev.map((sc) => (sc.id === scenarioId ? { ...sc, stamped: true } : sc))
    );

    setPassport((prev) => ({
      ...prev,
      cashPounds: prev.cashPounds + 70,
      stampsCount: Math.min(safeScenarios.length, prev.stampsCount + 1),
      warningsLeft: 3, // Full reset upon clearance
      masteredWords: Array.from(new Set([...prev.masteredWords, ...wordIds])),
    }));
  };

  // Advance to next scenario
  const handleNextScenario = () => {
    const nextIndex = (passport.currentScenarioIndex + 1) % safeScenarios.length;
    setPassport((prev) => ({
      ...prev,
      currentScenarioIndex: nextIndex,
      warningsLeft: 3,
    }));
  };

  // Jump from Flashcards to specific Scenario
  const handleStartScenarioForWord = (scenarioIdx: number) => {
    setPassport((prev) => ({
      ...prev,
      currentScenarioIndex: scenarioIdx,
    }));
    setActiveView('DIALOGUE');
  };

  // Deported / Detention Room
  const handleDeported = () => {
    setIsDeportedOpen(true);
  };

  // Restart
  const handleRestartAfterDeport = () => {
    setPassport((prev) => ({
      ...prev,
      warningsLeft: 3,
      streak: 0,
    }));
    setIsDeportedOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 pb-16">
      
      {/* Top Survival HUD */}
      <SurvivalHUD
        passport={passport}
        currentLevel={currentScenario.level}
        currentLocation={currentScenario.location}
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenPassport={() => setIsPassportOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenDocs={() => setIsDocumentsOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenSlang={() => setIsSlangOpen(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* London Survival Roadmap / Progress Bar */}
        <SurvivalRoadmap
          scenarios={safeScenarios}
          currentIndex={passport.currentScenarioIndex}
          onSelectScenario={(idx) => {
            sounds.playClick();
            setPassport((prev) => ({ ...prev, currentScenarioIndex: idx }));
          }}
        />

        {/* View Switcher: Dialogue vs Flashcards */}
        {activeView === 'DIALOGUE' ? (
          <InteractiveDialogue
            key={currentScenario.id}
            scenario={currentScenario}
            warningsLeft={passport.warningsLeft}
            cashPounds={passport.cashPounds}
            onLoseWarning={handleLoseWarning}
            onScenarioCompleted={handleScenarioCompleted}
            onDeported={handleDeported}
            onNextScenario={handleNextScenario}
            onRewardXP={handleRewardXP}
            onOpenDocs={() => setIsDocumentsOpen(true)}
          />
        ) : (
          <FlashcardsView
            scenarios={safeScenarios}
            masteredWords={passport.masteredWords}
            onStartScenarioForWord={handleStartScenarioForWord}
          />
        )}

      </main>

      {/* Modals */}
      <PassportModal
        passport={passport}
        scenarios={safeScenarios}
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
      />

      <DeportedModal
        isOpen={isDeportedOpen}
        onRestart={handleRestartAfterDeport}
      />

      <HowToPlayModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Survival Documents & Inventory Modal */}
      <SurvivalDocumentsModal
        isOpen={isDocumentsOpen}
        onClose={() => setIsDocumentsOpen(false)}
      />

      {/* Airport X-Ray Security Scanner Mini-Game Modal */}
      <LuggageScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onRewardXP={handleRewardXP}
      />

      {/* British Slang & Idioms Modal */}
      <BritishSlangModal
        isOpen={isSlangOpen}
        onClose={() => setIsSlangOpen(false)}
      />

      {/* Footer Info */}
      <footer className="mt-12 text-center text-xs text-slate-500 py-4 border-t border-slate-900 space-y-1">
        <p>🇬🇧 London Survival Simulator • Gerçek Hayatta Kalma İngilizcesi & CEFR A1 - B2 Kelime Sistemi</p>
        <p className="text-[11px] text-slate-600">
          Tüm diyalog cümlelerindeki kelimelerin üzerine tıklayarak Türkçe anlamlarını ve telaffuzlarını anında görebilirsiniz.
        </p>
      </footer>

    </div>
  );
}
export default App;
