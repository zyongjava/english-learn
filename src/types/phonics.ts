export interface LetterData {
  letter: string;        // "A"
  lowercase: string;     // "a"
  name: string;           // "A"
  letterPhonetic: string;      // "/eɪ/" - 字母名发音
  phonicsPhonetic: string;     // "/æ/"  - 自然拼读发音
  pronunciation: string;        // "A for Apple"
}

export interface PhonicsProgress {
  learnedLetters: string[];
  lastLearnedAt: number;
}