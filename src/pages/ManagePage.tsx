import { useState, useRef } from 'react';
import { useUnitStore } from '../stores/unitStore';
import { useMistakeStore } from '../stores/mistakeStore';
import { speakWord } from '../utils/quiz';
import { useSettingsStore } from '../stores/settingsStore';
import type { Unit, Word } from '../types';

interface Props {
  onBack: () => void;
}

// 单元图标颜色配置
const unitColors = [
  { bg: 'from-blue-400 to-blue-500', icon: '📘' },
  { bg: 'from-purple-400 to-purple-500', icon: '📗' },
  { bg: 'from-orange-400 to-orange-500', icon: '📙' },
  { bg: 'from-green-400 to-green-500', icon: '📕' },
  { bg: 'from-pink-400 to-pink-500', icon: '📒' },
  { bg: 'from-cyan-400 to-cyan-500', icon: '📓' },
];

export default function ManagePage({ onBack }: Props) {
  const [view, setView] = useState<'units' | 'words'>('units');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showWordForm, setShowWordForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [unitName, setUnitName] = useState('');
  const [wordForm, setWordForm] = useState({ word: '', phonetic: '', meaning: '' });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState<{ word: string; phonetic: string; meaning: string }[]>([]);
  const [importError, setImportError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllUnits, setShowAllUnits] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { units, addUnit, updateUnit, deleteUnit, addWord, updateWord, deleteWord, getUnit, resetToDefault } = useUnitStore();
  const { getMistakesByUnit, removeMistake, mistakes } = useMistakeStore();
  const { voiceName } = useSettingsStore();

  const handleSaveUnit = () => {
    if (!unitName.trim()) return;
    if (editingUnit) {
      updateUnit(editingUnit.id, unitName.trim());
    } else {
      addUnit(unitName.trim());
    }
    setUnitName('');
    setEditingUnit(null);
    setShowUnitForm(false);
  };

  const handleSaveWord = () => {
    if (!wordForm.word.trim() || !wordForm.meaning.trim() || !selectedUnit) return;
    if (editingWord) {
      updateWord(selectedUnit.id, editingWord.id, wordForm);
    } else {
      addWord(selectedUnit.id, { ...wordForm });
    }
    const updatedUnit = getUnit(selectedUnit.id);
    if (updatedUnit) setSelectedUnit(updatedUnit);
    setWordForm({ word: '', phonetic: '', meaning: '' });
    setEditingWord(null);
    setShowWordForm(false);
  };

  const handleDeleteUnit = (unit: Unit) => {
    if (confirm(`确定要删除"${unit.name}"吗？该单元下的所有单词也会被删除。`)) {
      const unitMistakes = getMistakesByUnit(unit.id);
      for (const mistake of unitMistakes) {
        removeMistake(mistake.wordId, mistake.type);
      }
      deleteUnit(unit.id);
      if (selectedUnit?.id === unit.id) {
        setSelectedUnit(null);
        setView('units');
      }
      alert('删除成功！');
    }
  };

  const handleDeleteWord = (word: Word) => {
    if (selectedUnit && confirm(`确定要删除单词"${word.word}"吗？`)) {
      deleteWord(selectedUnit.id, word.id);
      const updatedUnit = getUnit(selectedUnit.id);
      if (updatedUnit) setSelectedUnit(updatedUnit);
      alert('删除成功！');
    }
  };

  const openEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setUnitName(unit.name);
    setShowUnitForm(true);
  };

  const openEditWord = (word: Word) => {
    setEditingWord(word);
    setWordForm({ word: word.word, phonetic: word.phonetic, meaning: word.meaning });
    setShowWordForm(true);
  };

  const openAddWord = () => {
    setEditingWord(null);
    setWordForm({ word: '', phonetic: '', meaning: '' });
    setShowWordForm(true);
  };

  const parseCSV = (text: string): { word: string; phonetic: string; meaning: string }[] => {
    const lines = text.trim().split('\n');
    const results: { word: string; phonetic: string; meaning: string }[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 2 && parts[0] && parts[1]) {
        results.push({
          word: parts[0],
          phonetic: parts[2] || '',
          meaning: parts[1],
        });
      }
    }
    return results;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setImportError('无法解析 CSV 文件，请确保格式正确：单词,中文意思,音标');
        return;
      }
      setImportPreview(parsed);
      setImportError('');
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = () => {
    if (!selectedUnit || importPreview.length === 0) return;
    const count = importPreview.length;
    for (const item of importPreview) {
      addWord(selectedUnit.id, item);
    }
    const updatedUnit = getUnit(selectedUnit.id);
    if (updatedUnit) setSelectedUnit(updatedUnit);
    alert(`成功导入 ${count} 个单词！`);
    setShowImportModal(false);
    setImportPreview([]);
    setImportError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 搜索过滤
  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 显示的单元列表（默认只显示前4个，点击"查看全部"显示全部）
  const displayUnits = showAllUnits ? filteredUnits : filteredUnits.slice(0, 4);

  const filteredWords = selectedUnit?.words.filter(word =>
    word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.meaning.includes(searchQuery)
  ) || [];

  // 获取单元颜色配置
  const getUnitColor = (index: number) => unitColors[index % unitColors.length];

  // 获取掌握进度（真实数据：基于错题记录）
  // times < 0 = 已掌握，times > 0 = 未掌握，不在 mistakes 中 = 未开始
  const getProgress = (unit: Unit) => {
    if (unit.words.length === 0) return 0;

    const masteredCount = unit.words.filter(word => {
      const mistake = mistakes.find(m => m.wordId === word.id);
      // times < 0 表示答对次数超过答错次数，已掌握
      return mistake && mistake.times < 0;
    }).length;

    return Math.round((masteredCount / unit.words.length) * 100);
  };

  // 获取掌握状态文字
  const getProgressText = (unit: Unit) => {
    if (unit.words.length === 0) return '无单词';
    const progress = getProgress(unit);
    if (progress === 100) return '已全部掌握';
    const practicedCount = unit.words.filter(word =>
      mistakes.some(m => m.wordId === word.id)
    ).length;
    if (practicedCount === 0) return '未开始';
    return progress > 0 ? `${progress}% 掌握` : '需加强';
  };

  if (view === 'words' && selectedUnit) {
    return (
      <div className="min-h-screen bg-gray-50 page-content">
        {/* 渐变标题栏 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 pt-12 pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setView('units'); setSelectedUnit(null); setSearchQuery(''); }}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white flex-1 truncate">{selectedUnit.name}</h1>
            <button
              onClick={openAddWord}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
          </div>

          {/* 搜索栏 */}
          <div className="mt-4 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索单词..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-blue-600 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {selectedUnit.words.length} 单词
            </div>
          </div>
        </div>

        <div className="px-4 py-4">
          {filteredWords.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">还没有单词</h2>
              <p className="text-gray-500 mb-4">点击右上角添加第一个单词</p>
              <button onClick={openAddWord} className="btn-gradient">添加单词</button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWords.map((word) => (
                <div key={word.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-800">{word.word}</span>
                        {word.phonetic && (
                          <span className="text-sm text-gray-500 italic">{word.phonetic}</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1 truncate">{word.meaning}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => speakWord(word.word, voiceName || undefined)}
                        className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openEditWord(word)}
                        className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteWord(word)}
                        className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 添加/编辑单词模态框 */}
        {showWordForm && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingWord ? '编辑单词' : '添加单词'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">单词 (必填)</label>
                  <input
                    type="text"
                    value={wordForm.word}
                    onChange={(e) => setWordForm({ ...wordForm, word: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
                    placeholder="如: apple"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">音标</label>
                  <input
                    type="text"
                    value={wordForm.phonetic}
                    onChange={(e) => setWordForm({ ...wordForm, phonetic: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
                    placeholder="如: /ˈæpl/"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">中文意思 (必填)</label>
                  <input
                    type="text"
                    value={wordForm.meaning}
                    onChange={(e) => setWordForm({ ...wordForm, meaning: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
                    placeholder="如: 苹果"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowWordForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold">
                  取消
                </button>
                <button onClick={handleSaveWord} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold">
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 批量导入模态框 */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up max-h-[80vh] flex flex-col">
              <h2 className="text-xl font-bold text-gray-800 mb-4">批量导入单词</h2>
              <p className="text-sm text-gray-500 mb-4">CSV 格式：单词,中文意思,音标（每行一条）</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="mb-4"
              />
              {importError && (
                <div className="text-red-500 text-sm mb-4">{importError}</div>
              )}
              {importPreview.length > 0 && (
                <div className="flex-1 overflow-auto mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    预览（{importPreview.length} 个单词）：
                  </div>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {importPreview.slice(0, 20).map((item, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                        <span className="font-bold">{item.word}</span>
                        <span className="text-gray-500 mx-2">{item.meaning}</span>
                        {item.phonetic && <span className="text-gray-400">{item.phonetic}</span>}
                      </div>
                    ))}
                    {importPreview.length > 20 && (
                      <div className="text-sm text-gray-500">... 还有 {importPreview.length - 20} 个</div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-3 mt-auto">
                <button onClick={() => { setShowImportModal(false); setImportPreview([]); }} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold">
                  取消
                </button>
                <button
                  onClick={handleImportConfirm}
                  disabled={importPreview.length === 0}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  导入 {importPreview.length} 个
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 page-content">
      {/* 渐变标题栏 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white flex-1">单词管理</h1>
          <button
            onClick={() => {
              if (confirm('确定要重置为默认单词吗？这将覆盖当前所有单词数据。')) {
                resetToDefault();
                alert('已重置为默认单词');
              }
            }}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            title="重置为默认"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => { setEditingUnit(null); setUnitName(''); setShowUnitForm(true); }}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* 搜索栏 */}
        <div className="mt-4 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索单元或单词..."
            className="w-full pl-10 pr-12 py-3 bg-white rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* 我的词库标题 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">我的词库 ({units.length})</h2>
          {filteredUnits.length > 4 && (
            <button
              onClick={() => setShowAllUnits(!showAllUnits)}
              className="text-sm text-blue-600 font-medium"
            >
              {showAllUnits ? '收起' : '查看全部'}
            </button>
          )}
        </div>

        {displayUnits.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">还没有单元</h2>
            <p className="text-gray-500 mb-4">点击右上角添加第一个单元</p>
            <button onClick={() => setShowUnitForm(true)} className="btn-gradient">添加单元</button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayUnits.map((unit, index) => {
              const progress = getProgress(unit);
              const color = getUnitColor(index);
              return (
                <div
                  key={unit.id}
                  onClick={() => { setSelectedUnit(unit); setView('words'); setSearchQuery(''); }}
                  className="bg-white rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    {/* 单元图标 */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color.bg} flex items-center justify-center text-white text-xl`}>
                      {color.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{unit.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {unit.words.length} 个单词
                      </div>
                    </div>
                    {/* 操作按钮 */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditUnit(unit)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-blue-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteUnit(unit)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* 进度条 */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {getProgressText(unit)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 创建新单元按钮 */}
        <button
          onClick={() => { setEditingUnit(null); setUnitName(''); setShowUnitForm(true); }}
          className="w-full mt-4 py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          创建新单元
        </button>
      </div>

      {/* 添加/编辑单元模态框 */}
      {showUnitForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingUnit ? '编辑单元' : '添加单元'}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">单元名称</label>
              <input
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveUnit()}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
                placeholder="如: Unit 1: Hello"
                autoFocus
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowUnitForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold">
                取消
              </button>
              <button onClick={handleSaveUnit} disabled={!unitName.trim()} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
