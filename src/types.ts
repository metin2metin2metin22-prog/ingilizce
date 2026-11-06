export type Level = 'A1' | 'A2' | 'B1' | 'B2';

export interface TurnOption {
  word: string;
  tr: string;
  reaction: string;
  isCorrect: boolean;
  finePounds?: number;
}

export interface DialogueTurn {
  id: string;
  npcMessageEn: string;
  npcMessageTr: string;
  audioText: string;
  targetWord: string;
  targetWordTr: string;
  targetWordPhonetic: string;
  partOfSpeech?: string;
  mnemonic: string;
  grammarPattern?: string;       // e.g. "The purpose of [X] is [Y]"
  grammarExplanation?: string;   // e.g. "Bir ziyaretin ya da eylemin amacını resmi ve net belirtirken 'The purpose of ... is ...' kalıbı kullanılır."
  playerPromptTr: string;        // "Memura seyahat amacının turizm olduğunu söylemek için boşluğu doldur"
  sentenceWithBlank: string;    // "The [ _____ ] of my visit is tourism and sightseeing."
  sentenceFilled: string;       // "The purpose of my visit is tourism and sightseeing."
  sentenceTr: string;           // "Ziyaretimin amacı turizm ve şehri gezmektir."
  wordOptions: string[];        // ["Purpose", "Danger", "Secret", "Accident"]
  optionsDetails?: TurnOption[];// Detailed options with hilarious/dramatic officer reactions
  sentenceTokens?: string[];    // ["The", "purpose", "of", "my", "visit", "is", "tourism", "and", "sightseeing."]
  officerReactionAngry?: string;    // e.g. "Memur kaşlarını çattı: 'Cevabınız şüphe uyandırıyor!'"
  officerReactionImpressed?: string;// e.g. "Memur başını salladı: 'Harika bir İngilizce, hoş geldiniz.'"
  costPounds?: number;          // e.g. -3.80 at King's Cross for latte!
}

export interface DialogueScenario {
  id: string;
  level: Level;
  location: string;
  npcName: string;
  npcTitle: string;
  npcAvatar: string;
  introDescription: string;
  flightCode?: string;          // e.g. "TK1985 (IST -> LHR)"
  missionObjective: string;     // e.g. "Pasaport memurunu geç ve Londra'ya adım at!"
  turns: DialogueTurn[];
  stamped: boolean;
  backgroundTheme?: string;
}

export interface PlayerPassport {
  travelerName: string;
  cashPounds: number;
  warningsLeft: number;
  currentScenarioIndex: number;
  stampsCount: number;
  masteredWords: string[];
  xp: number;
  streak: number;
  rank: string;
}
