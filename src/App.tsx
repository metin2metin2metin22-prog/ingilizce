import React, { useState, useEffect } from 'react';
import { PlayerPassport, DialogueScenario } from './types';
import { DIALOGUE_SCENARIOS } from './data/dialogues';
import { SurvivalHUD } from './components/SurvivalHUD';
import { SurvivalRoadmap } from './components/SurvivalRoadmap';
import { InteractiveDialogue } from './components/InteractiveDialogue';
import { PassportModal } from './components/PassportModal';
import { DeportedModal } from './components/DeportedModal';

const STORAGE_KEY_PASSPORT = 'londondialogue_passport_v6';
const STORAGE_KEY_SCENARIOS = 'londondialogue_scenarios_v6';

const INITIAL_PASSPORT: PlayerPassport = {
  travelerName: 'Yolcu (Explorer)',
  cashPounds: 45,
  warningsLeft: 3,
  currentScenarioIndex: 0,
  stampsCount: 0,
  masteredWords: [],
};

export function App() {
  const [passport, setPassport] = useState<PlayerPassport>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PASSPORT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.currentScenarioIndex === 'number') {
          return parsed;
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
        // Validate that schema is fresh
        if (Array.isArray(parsed) && parsed[0]?.turns?.[0]?.sentenceWithBlank) {
          return parsed;
        }
      }
    } catch {}
    return DIALOGUE_SCENARIOS;
  });

  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [isDeportedOpen, setIsDeportedOpen] = useState<boolean>(false);

  // Active scenario with defensive fallback
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

  // Handle warning loss
  const handleLoseWarning = () => {
    setPassport((prev) => {
      const nextWarnings = Math.max(0, prev.warningsLeft - 1);
      return { ...prev, warningsLeft: nextWarnings };
    });
  };

  // Scenario 100% Cleared
  const handleScenarioCompleted = (scenarioId: string, wordIds: string[]) => {
    setScenarios((prev) =>
      prev.map((sc) => (sc.id === scenarioId ? { ...sc, stamped: true } : sc))
    );

    const nextIndex = Math.min(safeScenarios.length - 1, passport.currentScenarioIndex + 1);

    setPassport((prev) => ({
      ...prev,
      cashPounds: prev.cashPounds + 70,
      stampsCount: prev.stampsCount + 1,
      warningsLeft: 3, // Reset warnings on success
      currentScenarioIndex: nextIndex,
      masteredWords: Array.from(new Set([...prev.masteredWords, ...wordIds])),
    }));
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
        onOpenPassport={() => setIsPassportOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* City Dialogue Roadmap */}
        <SurvivalRoadmap
          scenarios={safeScenarios}
          currentIndex={passport.currentScenarioIndex}
          onSelectScenario={(idx) => {
            setPassport((prev) => ({ ...prev, currentScenarioIndex: idx }));
          }}
        />

        {/* The Core Interactive Dialogue Component */}
        <InteractiveDialogue
          key={currentScenario.id}
          scenario={currentScenario}
          warningsLeft={passport.warningsLeft}
          onLoseWarning={handleLoseWarning}
          onScenarioCompleted={handleScenarioCompleted}
          onDeported={handleDeported}
        />

      </main>

      {/* Passport & Learned Words Modal */}
      <PassportModal
        passport={passport}
        scenarios={safeScenarios}
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
      />

      {/* Detention / Deported Modal */}
      <DeportedModal
        isOpen={isDeportedOpen}
        onRestart={handleRestartAfterDeport}
      />

    </div>
  );
}
