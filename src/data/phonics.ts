import type { LetterData } from '../types/phonics';

// letterPhonetic: 字母名称音（Letter Name）
// phonicsPhonetic: 自然拼读音（Phonics Sound）- 字母在单词中的发音

export const phonicsLetters: LetterData[] = [
  { letter: 'A', lowercase: 'a', name: 'A', letterPhonetic: '/eɪ/', phonicsPhonetic: '/æ/', pronunciation: 'A for Apple' },
  { letter: 'B', lowercase: 'b', name: 'B', letterPhonetic: '/biː/', phonicsPhonetic: '/b/', pronunciation: 'B for Ball' },
  { letter: 'C', lowercase: 'c', name: 'C', letterPhonetic: '/siː/', phonicsPhonetic: '/k/', pronunciation: 'C for Cat' },
  { letter: 'D', lowercase: 'd', name: 'D', letterPhonetic: '/diː/', phonicsPhonetic: '/d/', pronunciation: 'D for Dog' },
  { letter: 'E', lowercase: 'e', name: 'E', letterPhonetic: '/iː/', phonicsPhonetic: '/ɛ/', pronunciation: 'E for Egg' },
  { letter: 'F', lowercase: 'f', name: 'F', letterPhonetic: '/ɛf/', phonicsPhonetic: '/f/', pronunciation: 'F for Fish' },
  { letter: 'G', lowercase: 'g', name: 'G', letterPhonetic: '/dʒiː/', phonicsPhonetic: '/g/', pronunciation: 'G for Girl' },
  { letter: 'H', lowercase: 'h', name: 'H', letterPhonetic: '/eɪtʃ/', phonicsPhonetic: '/h/', pronunciation: 'H for Hand' },
  { letter: 'I', lowercase: 'i', name: 'I', letterPhonetic: '/aɪ/', phonicsPhonetic: '/ɪ/', pronunciation: 'I for Ice' },
  { letter: 'J', lowercase: 'j', name: 'J', letterPhonetic: '/dʒeɪ/', phonicsPhonetic: '/dʒ/', pronunciation: 'J for Jam' },
  { letter: 'K', lowercase: 'k', name: 'K', letterPhonetic: '/keɪ/', phonicsPhonetic: '/k/', pronunciation: 'K for Kite' },
  { letter: 'L', lowercase: 'l', name: 'L', letterPhonetic: '/ɛl/', phonicsPhonetic: '/l/', pronunciation: 'L for Lion' },
  { letter: 'M', lowercase: 'm', name: 'M', letterPhonetic: '/ɛm/', phonicsPhonetic: '/m/', pronunciation: 'M for Moon' },
  { letter: 'N', lowercase: 'n', name: 'N', letterPhonetic: '/ɛn/', phonicsPhonetic: '/n/', pronunciation: 'N for Nest' },
  { letter: 'O', lowercase: 'o', name: 'O', letterPhonetic: '/oʊ/', phonicsPhonetic: '/ɒ/', pronunciation: 'O for Orange' },
  { letter: 'P', lowercase: 'p', name: 'P', letterPhonetic: '/piː/', phonicsPhonetic: '/p/', pronunciation: 'P for Pig' },
  { letter: 'Q', lowercase: 'q', name: 'Q', letterPhonetic: '/kjuː/', phonicsPhonetic: '/kw/', pronunciation: 'Q for Queen' },
  { letter: 'R', lowercase: 'r', name: 'R', letterPhonetic: '/ɑːr/', phonicsPhonetic: '/r/', pronunciation: 'R for Rain' },
  { letter: 'S', lowercase: 's', name: 'S', letterPhonetic: '/ɛs/', phonicsPhonetic: '/s/', pronunciation: 'S for Sun' },
  { letter: 'T', lowercase: 't', name: 'T', letterPhonetic: '/tiː/', phonicsPhonetic: '/t/', pronunciation: 'T for Tree' },
  { letter: 'U', lowercase: 'u', name: 'U', letterPhonetic: '/juː/', phonicsPhonetic: '/ʌ/', pronunciation: 'U for Umbrella' },
  { letter: 'V', lowercase: 'v', name: 'V', letterPhonetic: '/viː/', phonicsPhonetic: '/v/', pronunciation: 'V for Van' },
  { letter: 'W', lowercase: 'w', name: 'W', letterPhonetic: '/ˈdʌbəljuː/', phonicsPhonetic: '/w/', pronunciation: 'W for Water' },
  { letter: 'X', lowercase: 'x', name: 'X', letterPhonetic: '/ɛks/', phonicsPhonetic: '/ks/', pronunciation: 'X for Box' },
  { letter: 'Y', lowercase: 'y', name: 'Y', letterPhonetic: '/waɪ/', phonicsPhonetic: '/j/', pronunciation: 'Y for Yellow' },
  { letter: 'Z', lowercase: 'z', name: 'Z', letterPhonetic: '/ziː/', phonicsPhonetic: '/z/', pronunciation: 'Z for Zoo' },
];

export const getVideoUrl = (letter: string): string => {
  return `/phonics/${letter}.mp4`;
};

export const hasVideo = (letter: string): boolean => {
  return phonicsLetters.some(l => l.letter === letter);
};