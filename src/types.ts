export type Level = 'A1' | 'A2' | 'B1' | 'B2';

export interface DialogueTurn {
  id: string;
  npcMessageEn: string;
  npcMessageTr: string;
  audioText: string;
  targetWord: string;
  targetWordTr: string;
  targetWordPhonetic: string;
  mnemonic: string;
  playerPromptTr: string; // "Memura ziyaret amacının turizm olduğunu söyle"
  sentenceWithBlank: string; // "The [ _____ ] of my visit is tourism and sightseeing."
  sentenceFilled: string;   // "The purpose of my visit is tourism and sightseeing."
  sentenceTr: string;       // "Ziyaretimin amacı turizm ve şehri gezmektir."
  wordOptions: string[];    // ["Purpose", "Declare", "Address", "Return"]
}

export interface DialogueScenario {
  id: string;
  level: Level;
  location: string;
  npcName: string;
  npcTitle: string;
  npcAvatar: string;
  introDescription: string;
  turns: DialogueTurn[];
  stamped: boolean;
}

export interface PlayerPassport {
  travelerName: string;
  cashPounds: number;
  warningsLeft: number;
  currentScenarioIndex: number;
  stampsCount: number;
  masteredWords: string[];
}
