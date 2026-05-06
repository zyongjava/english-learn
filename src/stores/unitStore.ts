import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Unit, Word } from '../types';

interface UnitStore {
  units: Unit[];
  addUnit: (name: string) => void;
  deleteUnit: (id: string) => void;
  updateUnit: (id: string, name: string) => void;
  addWord: (unitId: string, word: Omit<Word, 'id' | 'unitId'>) => void;
  updateWord: (unitId: string, wordId: string, word: Partial<Word>) => void;
  deleteWord: (unitId: string, wordId: string) => void;
  getWordById: (wordId: string) => Word | undefined;
  getUnitById: (unitId: string) => Unit | undefined;
  getUnit: (unitId: string) => Unit | undefined;
  resetToDefault: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useUnitStore = create<UnitStore>()(
  persist(
    (set, get) => ({
      units: [
        {
          id: 'demo-unit-1',
          name: 'Unit 1: Feelings',
          createdAt: Date.now(),
          words: [
            { id: 'w1', unitId: 'demo-unit-1', word: 'happy', phonetic: '/ˈhæpi/', meaning: '高兴的' },
            { id: 'w2', unitId: 'demo-unit-1', word: 'today', phonetic: '/təˈdeɪ/', meaning: '（在）今天' },
            { id: 'w3', unitId: 'demo-unit-1', word: 'clap', phonetic: '/klæp/', meaning: '拍（手）' },
            { id: 'w4', unitId: 'demo-unit-1', word: 'hand', phonetic: '/hænd/', meaning: '手' },
            { id: 'w5', unitId: 'demo-unit-1', word: 'that', phonetic: '/ðæt/', meaning: '那，那个' },
            { id: 'w6', unitId: 'demo-unit-1', word: 'again', phonetic: '/əˈɡen/', meaning: '又，再一次' },
            { id: 'w7', unitId: 'demo-unit-1', word: 'dear', phonetic: '/dɪə(r)/', meaning: '亲爱的' },
            { id: 'w8', unitId: 'demo-unit-1', word: 'please', phonetic: '/pliːz/', meaning: '请' },
            { id: 'w9', unitId: 'demo-unit-1', word: 'follow', phonetic: '/ˈfɒləʊ/', meaning: '跟着' },
            { id: 'w10', unitId: 'demo-unit-1', word: 'me', phonetic: '/miː/', meaning: '我' },
            { id: 'w11', unitId: 'demo-unit-1', word: 'walk', phonetic: '/wɔːk/', meaning: '走' },
            { id: 'w12', unitId: 'demo-unit-1', word: 'away', phonetic: '/əˈweɪ/', meaning: '离开' },
            { id: 'w13', unitId: 'demo-unit-1', word: 'no', phonetic: '/nəʊ/', meaning: '不，不是' },
            { id: 'w14', unitId: 'demo-unit-1', word: 'mum', phonetic: '/mʌm/', meaning: '妈妈' },
            { id: 'w15', unitId: 'demo-unit-1', word: 'hungry', phonetic: '/ˈhʌŋɡri/', meaning: '饥饿的' },
            { id: 'w16', unitId: 'demo-unit-1', word: 'he', phonetic: '/hiː/', meaning: '他' },
            { id: 'w17', unitId: 'demo-unit-1', word: 'tired', phonetic: '/ˈtaɪəd/', meaning: '累的' },
            { id: 'w18', unitId: 'demo-unit-1', word: 'too', phonetic: '/tuː/', meaning: '也' },
            { id: 'w19', unitId: 'demo-unit-1', word: 'sad', phonetic: '/sæd/', meaning: '难过的' },
            { id: 'w20', unitId: 'demo-unit-1', word: 'scared', phonetic: '/skeəd/', meaning: '害怕的' },
            { id: 'w21', unitId: 'demo-unit-1', word: 'so', phonetic: '/səʊ/', meaning: '这么，那么' },
            { id: 'w22', unitId: 'demo-unit-1', word: 'sorry', phonetic: '/ˈsɒri/', meaning: '对不起' },
          ],
        },
        {
          id: 'demo-unit-2',
          name: 'Unit 2: Family',
          createdAt: Date.now(),
          words: [
            { id: 'w23', unitId: 'demo-unit-2', word: 'dad', phonetic: '/dæd/', meaning: '爸爸' },
            { id: 'w24', unitId: 'demo-unit-2', word: 'brother', phonetic: '/ˈbrʌðə(r)/', meaning: '哥哥；弟弟' },
            { id: 'w25', unitId: 'demo-unit-2', word: 'sister', phonetic: '/ˈsɪstə(r)/', meaning: '姐姐；妹妹' },
            { id: 'w26', unitId: 'demo-unit-2', word: 'grandpa', phonetic: '/ˈɡrænpɑː/', meaning: '爷爷；外公' },
            { id: 'w27', unitId: 'demo-unit-2', word: 'grandma', phonetic: '/ˈɡrænmɑː/', meaning: '奶奶；外婆' },
            { id: 'w28', unitId: 'demo-unit-2', word: 'love', phonetic: '/lʌv/', meaning: '爱，关爱' },
            { id: 'w29', unitId: 'demo-unit-2', word: 'we', phonetic: '/wiː/', meaning: '我们' },
            { id: 'w30', unitId: 'demo-unit-2', word: 'each', phonetic: '/iːtʃ/', meaning: '每个' },
            { id: 'w31', unitId: 'demo-unit-2', word: 'each other', phonetic: '/iːtʃ ˈʌðə(r)/', meaning: '互相' },
            { id: 'w32', unitId: 'demo-unit-2', word: 'birthday', phonetic: '/ˈbɜːθdeɪ/', meaning: '生日' },
            { id: 'w33', unitId: 'demo-unit-2', word: 'for', phonetic: '/fɔː(r)/', meaning: '给' },
            { id: 'w34', unitId: 'demo-unit-2', word: 'baby', phonetic: '/ˈbeɪbi/', meaning: '婴儿' },
            { id: 'w35', unitId: 'demo-unit-2', word: 'family', phonetic: '/ˈfæməli/', meaning: '家庭' },
          ],
        },
        {
          id: 'demo-unit-3',
          name: 'Unit 3: Pets',
          createdAt: Date.now(),
          words: [
            { id: 'w36', unitId: 'demo-unit-3', word: 'pet', phonetic: '/pet/', meaning: '宠物' },
            { id: 'w37', unitId: 'demo-unit-3', word: 'dog', phonetic: '/dɒɡ/', meaning: '狗' },
            { id: 'w38', unitId: 'demo-unit-3', word: 'cat', phonetic: '/kæt/', meaning: '猫' },
            { id: 'w39', unitId: 'demo-unit-3', word: 'bird', phonetic: '/bɜːd/', meaning: '鸟' },
            { id: 'w40', unitId: 'demo-unit-3', word: 'fish', phonetic: '/fɪʃ/', meaning: '鱼' },
            { id: 'w41', unitId: 'demo-unit-3', word: 'rabbit', phonetic: '/ˈræbɪt/', meaning: '兔子' },
            { id: 'w42', unitId: 'demo-unit-3', word: 'have', phonetic: '/hæv/', meaning: '有' },
            { id: 'w43', unitId: 'demo-unit-3', word: 'woof', phonetic: '/wʊf/', meaning: '汪汪（狗叫声）' },
            { id: 'w44', unitId: 'demo-unit-3', word: 'meow', phonetic: '/miˈaʊ/', meaning: '喵（猫叫声）' },
          ],
        },
        {
          id: 'demo-unit-4',
          name: 'Unit 4: At the farm',
          createdAt: Date.now(),
          words: [
            { id: 'w45', unitId: 'demo-unit-4', word: 'farm', phonetic: '/fɑːm/', meaning: '农场' },
            { id: 'w46', unitId: 'demo-unit-4', word: 'cow', phonetic: '/kaʊ/', meaning: '奶牛' },
            { id: 'w47', unitId: 'demo-unit-4', word: 'pig', phonetic: '/pɪɡ/', meaning: '猪' },
            { id: 'w48', unitId: 'demo-unit-4', word: 'duck', phonetic: '/dʌk/', meaning: '鸭子' },
            { id: 'w49', unitId: 'demo-unit-4', word: 'chicken', phonetic: '/ˈtʃɪkɪn/', meaning: '小鸡' },
            { id: 'w50', unitId: 'demo-unit-4', word: 'sheep', phonetic: '/ʃiːp/', meaning: '绵羊' },
            { id: 'w51', unitId: 'demo-unit-4', word: 'horse', phonetic: '/hɔːs/', meaning: '马' },
            { id: 'w52', unitId: 'demo-unit-4', word: 'animal', phonetic: '/ˈænɪml/', meaning: '动物' },
          ],
        },
        {
          id: 'demo-unit-5',
          name: 'Unit 5: My room',
          createdAt: Date.now(),
          words: [
            { id: 'w53', unitId: 'demo-unit-5', word: 'room', phonetic: '/ruːm/', meaning: '房间' },
            { id: 'w54', unitId: 'demo-unit-5', word: 'bed', phonetic: '/bed/', meaning: '床' },
            { id: 'w55', unitId: 'demo-unit-5', word: 'desk', phonetic: '/desk/', meaning: '书桌' },
            { id: 'w56', unitId: 'demo-unit-5', word: 'chair', phonetic: '/tʃeə(r)/', meaning: '椅子' },
            { id: 'w57', unitId: 'demo-unit-5', word: 'book', phonetic: '/bʊk/', meaning: '书' },
            { id: 'w58', unitId: 'demo-unit-5', word: 'bag', phonetic: '/bæɡ/', meaning: '书包' },
            { id: 'w59', unitId: 'demo-unit-5', word: 'ball', phonetic: '/bɔːl/', meaning: '球' },
            { id: 'w60', unitId: 'demo-unit-5', word: 'toy', phonetic: '/tɔɪ/', meaning: '玩具' },
          ],
        },
        {
          id: 'demo-unit-80',
          name: 'Unit 80: Others',
          createdAt: Date.now(),
          words: [
            { id: 'w61', unitId: 'demo-unit-80', word: 'rice', phonetic: '/raɪs/', meaning: '米饭' },
            { id: 'w62', unitId: 'demo-unit-80', word: 'noodle', phonetic: '/ˈnuːdl/', meaning: '面条' },
            { id: 'w63', unitId: 'demo-unit-80', word: 'carrot', phonetic: '/ˈkærət/', meaning: '胡萝卜' },
            { id: 'w64', unitId: 'demo-unit-80', word: 'apple', phonetic: '/ˈæpl/', meaning: '苹果' },
            { id: 'w65', unitId: 'demo-unit-80', word: 'banana', phonetic: '/bəˈnænə/', meaning: '香蕉' },
            { id: 'w66', unitId: 'demo-unit-80', word: 'tomato', phonetic: '/təˈmeɪtoʊ/', meaning: '西红柿' },
            { id: 'w67', unitId: 'demo-unit-80', word: 'sunny', phonetic: '/ˈsʌni/', meaning: '晴朗的' },
            { id: 'w68', unitId: 'demo-unit-80', word: 'rainy', phonetic: '/ˈreɪni/', meaning: '下雨的' },
            { id: 'w69', unitId: 'demo-unit-80', word: 'snowy', phonetic: '/ˈsnoʊi/', meaning: '下雪的' },
          ],
        },
      ],

      addUnit: (name) => set((state) => ({
        units: [...state.units, { id: generateId(), name, words: [], createdAt: Date.now() }],
      })),

      deleteUnit: (id) => set((state) => ({
        units: state.units.filter((u) => u.id !== id),
      })),

      updateUnit: (id, name) => set((state) => ({
        units: state.units.map((u) => u.id === id ? { ...u, name } : u),
      })),

      addWord: (unitId, word) => set((state) => ({
        units: state.units.map((u) =>
          u.id === unitId
            ? { ...u, words: [...u.words, { ...word, id: generateId(), unitId }] }
            : u
        ),
      })),

      updateWord: (unitId, wordId, word) => set((state) => ({
        units: state.units.map((u) =>
          u.id === unitId
            ? { ...u, words: u.words.map((w) => w.id === wordId ? { ...w, ...word } : w) }
            : u
        ),
      })),

      deleteWord: (unitId, wordId) => set((state) => ({
        units: state.units.map((u) =>
          u.id === unitId ? { ...u, words: u.words.filter((w) => w.id !== wordId) } : u
        ),
      })),

      getWordById: (wordId) => {
        for (const unit of get().units) {
          const word = unit.words.find((w) => w.id === wordId);
          if (word) return word;
        }
        return undefined;
      },

      getUnitById: (unitId) => get().units.find((u) => u.id === unitId),
      getUnit: (unitId) => get().units.find((u) => u.id === unitId),

      resetToDefault: () => {
        const defaultUnits = [
          {
            id: 'demo-unit-1',
            name: 'Unit 1: Feelings',
            createdAt: Date.now(),
            words: [
              { id: 'w1', unitId: 'demo-unit-1', word: 'happy', phonetic: '/ˈhæpi/', meaning: '高兴的' },
              { id: 'w2', unitId: 'demo-unit-1', word: 'today', phonetic: '/təˈdeɪ/', meaning: '（在）今天' },
              { id: 'w3', unitId: 'demo-unit-1', word: 'clap', phonetic: '/klæp/', meaning: '拍（手）' },
              { id: 'w4', unitId: 'demo-unit-1', word: 'hand', phonetic: '/hænd/', meaning: '手' },
              { id: 'w5', unitId: 'demo-unit-1', word: 'that', phonetic: '/ðæt/', meaning: '那，那个' },
              { id: 'w6', unitId: 'demo-unit-1', word: 'again', phonetic: '/əˈɡen/', meaning: '又，再一次' },
              { id: 'w7', unitId: 'demo-unit-1', word: 'dear', phonetic: '/dɪə(r)/', meaning: '亲爱的' },
              { id: 'w8', unitId: 'demo-unit-1', word: 'please', phonetic: '/pliːz/', meaning: '请' },
              { id: 'w9', unitId: 'demo-unit-1', word: 'follow', phonetic: '/ˈfɒləʊ/', meaning: '跟着' },
              { id: 'w10', unitId: 'demo-unit-1', word: 'me', phonetic: '/miː/', meaning: '我' },
              { id: 'w11', unitId: 'demo-unit-1', word: 'walk', phonetic: '/wɔːk/', meaning: '走' },
              { id: 'w12', unitId: 'demo-unit-1', word: 'away', phonetic: '/əˈweɪ/', meaning: '离开' },
              { id: 'w13', unitId: 'demo-unit-1', word: 'no', phonetic: '/nəʊ/', meaning: '不，不是' },
              { id: 'w14', unitId: 'demo-unit-1', word: 'mum', phonetic: '/mʌm/', meaning: '妈妈' },
              { id: 'w15', unitId: 'demo-unit-1', word: 'hungry', phonetic: '/ˈhʌŋɡri/', meaning: '饥饿的' },
              { id: 'w16', unitId: 'demo-unit-1', word: 'he', phonetic: '/hiː/', meaning: '他' },
              { id: 'w17', unitId: 'demo-unit-1', word: 'tired', phonetic: '/ˈtaɪəd/', meaning: '累的' },
              { id: 'w18', unitId: 'demo-unit-1', word: 'too', phonetic: '/tuː/', meaning: '也' },
              { id: 'w19', unitId: 'demo-unit-1', word: 'sad', phonetic: '/sæd/', meaning: '难过的' },
              { id: 'w20', unitId: 'demo-unit-1', word: 'scared', phonetic: '/skeəd/', meaning: '害怕的' },
              { id: 'w21', unitId: 'demo-unit-1', word: 'so', phonetic: '/səʊ/', meaning: '这么，那么' },
              { id: 'w22', unitId: 'demo-unit-1', word: 'sorry', phonetic: '/ˈsɒri/', meaning: '对不起' },
            ],
          },
          {
            id: 'demo-unit-2',
            name: 'Unit 2: Family',
            createdAt: Date.now(),
            words: [
              { id: 'w23', unitId: 'demo-unit-2', word: 'dad', phonetic: '/dæd/', meaning: '爸爸' },
              { id: 'w24', unitId: 'demo-unit-2', word: 'brother', phonetic: '/ˈbrʌðə(r)/', meaning: '哥哥；弟弟' },
              { id: 'w25', unitId: 'demo-unit-2', word: 'sister', phonetic: '/ˈsɪstə(r)/', meaning: '姐姐；妹妹' },
              { id: 'w26', unitId: 'demo-unit-2', word: 'grandpa', phonetic: '/ˈɡrænpɑː/', meaning: '爷爷；外公' },
              { id: 'w27', unitId: 'demo-unit-2', word: 'grandma', phonetic: '/ˈɡrænmɑː/', meaning: '奶奶；外婆' },
              { id: 'w28', unitId: 'demo-unit-2', word: 'love', phonetic: '/lʌv/', meaning: '爱，关爱' },
              { id: 'w29', unitId: 'demo-unit-2', word: 'we', phonetic: '/wiː/', meaning: '我们' },
              { id: 'w30', unitId: 'demo-unit-2', word: 'each', phonetic: '/iːtʃ/', meaning: '每个' },
              { id: 'w31', unitId: 'demo-unit-2', word: 'each other', phonetic: '/iːtʃ ˈʌðə(r)/', meaning: '互相' },
              { id: 'w32', unitId: 'demo-unit-2', word: 'birthday', phonetic: '/ˈbɜːθdeɪ/', meaning: '生日' },
              { id: 'w33', unitId: 'demo-unit-2', word: 'for', phonetic: '/fɔː(r)/', meaning: '给' },
              { id: 'w34', unitId: 'demo-unit-2', word: 'baby', phonetic: '/ˈbeɪbi/', meaning: '婴儿' },
              { id: 'w35', unitId: 'demo-unit-2', word: 'family', phonetic: '/ˈfæməli/', meaning: '家庭' },
            ],
          },
          {
            id: 'demo-unit-3',
            name: 'Unit 3: Pets',
            createdAt: Date.now(),
            words: [
              { id: 'w36', unitId: 'demo-unit-3', word: 'pet', phonetic: '/pet/', meaning: '宠物' },
              { id: 'w37', unitId: 'demo-unit-3', word: 'dog', phonetic: '/dɒɡ/', meaning: '狗' },
              { id: 'w38', unitId: 'demo-unit-3', word: 'cat', phonetic: '/kæt/', meaning: '猫' },
              { id: 'w39', unitId: 'demo-unit-3', word: 'bird', phonetic: '/bɜːd/', meaning: '鸟' },
              { id: 'w40', unitId: 'demo-unit-3', word: 'fish', phonetic: '/fɪʃ/', meaning: '鱼' },
              { id: 'w41', unitId: 'demo-unit-3', word: 'rabbit', phonetic: '/ˈræbɪt/', meaning: '兔子' },
              { id: 'w42', unitId: 'demo-unit-3', word: 'have', phonetic: '/hæv/', meaning: '有' },
              { id: 'w43', unitId: 'demo-unit-3', word: 'woof', phonetic: '/wʊf/', meaning: '汪汪（狗叫声）' },
              { id: 'w44', unitId: 'demo-unit-3', word: 'meow', phonetic: '/miˈaʊ/', meaning: '喵（猫叫声）' },
            ],
          },
          {
            id: 'demo-unit-4',
            name: 'Unit 4: At the farm',
            createdAt: Date.now(),
            words: [
              { id: 'w45', unitId: 'demo-unit-4', word: 'farm', phonetic: '/fɑːm/', meaning: '农场' },
              { id: 'w46', unitId: 'demo-unit-4', word: 'cow', phonetic: '/kaʊ/', meaning: '奶牛' },
              { id: 'w47', unitId: 'demo-unit-4', word: 'pig', phonetic: '/pɪɡ/', meaning: '猪' },
              { id: 'w48', unitId: 'demo-unit-4', word: 'duck', phonetic: '/dʌk/', meaning: '鸭子' },
              { id: 'w49', unitId: 'demo-unit-4', word: 'chicken', phonetic: '/ˈtʃɪkɪn/', meaning: '小鸡' },
              { id: 'w50', unitId: 'demo-unit-4', word: 'sheep', phonetic: '/ʃiːp/', meaning: '绵羊' },
              { id: 'w51', unitId: 'demo-unit-4', word: 'horse', phonetic: '/hɔːs/', meaning: '马' },
              { id: 'w52', unitId: 'demo-unit-4', word: 'animal', phonetic: '/ˈænɪml/', meaning: '动物' },
            ],
          },
          {
            id: 'demo-unit-5',
            name: 'Unit 5: My room',
            createdAt: Date.now(),
            words: [
              { id: 'w53', unitId: 'demo-unit-5', word: 'room', phonetic: '/ruːm/', meaning: '房间' },
              { id: 'w54', unitId: 'demo-unit-5', word: 'bed', phonetic: '/bed/', meaning: '床' },
              { id: 'w55', unitId: 'demo-unit-5', word: 'desk', phonetic: '/desk/', meaning: '书桌' },
              { id: 'w56', unitId: 'demo-unit-5', word: 'chair', phonetic: '/tʃeə(r)/', meaning: '椅子' },
              { id: 'w57', unitId: 'demo-unit-5', word: 'book', phonetic: '/bʊk/', meaning: '书' },
              { id: 'w58', unitId: 'demo-unit-5', word: 'bag', phonetic: '/bæɡ/', meaning: '书包' },
              { id: 'w59', unitId: 'demo-unit-5', word: 'ball', phonetic: '/bɔːl/', meaning: '球' },
              { id: 'w60', unitId: 'demo-unit-5', word: 'toy', phonetic: '/tɔɪ/', meaning: '玩具' },
            ],
          },
          {
            id: 'demo-unit-80',
            name: 'Unit 80: Others',
            createdAt: Date.now(),
            words: [
              { id: 'w61', unitId: 'demo-unit-80', word: 'rice', phonetic: '/raɪs/', meaning: '米饭' },
              { id: 'w62', unitId: 'demo-unit-80', word: 'noodle', phonetic: '/ˈnuːdl/', meaning: '面条' },
              { id: 'w63', unitId: 'demo-unit-80', word: 'carrot', phonetic: '/ˈkærət/', meaning: '胡萝卜' },
              { id: 'w64', unitId: 'demo-unit-80', word: 'apple', phonetic: '/ˈæpl/', meaning: '苹果' },
              { id: 'w65', unitId: 'demo-unit-80', word: 'banana', phonetic: '/bəˈnænə/', meaning: '香蕉' },
              { id: 'w66', unitId: 'demo-unit-80', word: 'tomato', phonetic: '/təˈmeɪtoʊ/', meaning: '西红柿' },
              { id: 'w67', unitId: 'demo-unit-80', word: 'sunny', phonetic: '/ˈsʌni/', meaning: '晴朗的' },
              { id: 'w68', unitId: 'demo-unit-80', word: 'rainy', phonetic: '/ˈreɪni/', meaning: '下雨的' },
              { id: 'w69', unitId: 'demo-unit-80', word: 'snowy', phonetic: '/ˈsnoʊi/', meaning: '下雪的' },
            ],
          },
        ];
        set({ units: defaultUnits });
      },
    }),
    { name: 'unit-storage' }
  )
);