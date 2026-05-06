import { useRef, useState } from 'react';
import { useUnitStore } from '../stores/unitStore';
import { useMistakeStore } from '../stores/mistakeStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAchievementStore } from '../stores/achievementStore';
import { useCheckInStore } from '../stores/checkInStore';
import { usePhonicsStore } from '../stores/phonicsStore';

interface Props {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { units } = useUnitStore();
  const { mistakes } = useMistakeStore();
  const { soundEnabled, dailyGoal, questionsPerQuiz, toggleSound, setDailyGoal, setQuestionsPerQuiz } = useSettingsStore();
  const { unlockedAchievements, stats: achievementStats } = useAchievementStore();
  const { records: checkInRecords } = useCheckInStore();
  const { learnedLetters } = usePhonicsStore();

  const handleExport = async () => {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      units,
      mistakes,
      settings: { soundEnabled, dailyGoal, questionsPerQuiz },
      achievements: {
        unlockedAchievements,
        stats: achievementStats,
      },
      checkIn: {
        records: checkInRecords,
      },
      phonics: {
        learnedLetters,
      },
    };

    const filename = `新启航英语备份_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
    const jsonContent = JSON.stringify(data, null, 2);

    const isAndroid = typeof window !== 'undefined' &&
                      typeof navigator !== 'undefined' &&
                      navigator.userAgent.includes('Android');

    if (!isAndroid && 'showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'JSON 文件',
              accept: { 'application/json': ['.json'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(jsonContent);
        await writable.close();
        setMessage({ type: 'success', text: '导出成功！' });
        setTimeout(() => setMessage(null), 2000);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        console.error('导出失败:', err);
        fallbackDownload(jsonContent, filename);
      }
    } else if (isAndroid) {
      try {
        const { Filesystem } = await import('@capacitor/filesystem');
        await (Filesystem as any).writeFile({
          path: filename,
          data: jsonContent,
          directory: 'DOCUMENTS',
          encoding: 'utf8',
        });
        setMessage({ type: 'success', text: `导出成功！文件已保存到 Documents/${filename}` });
        setTimeout(() => setMessage(null), 4000);
        return;
      } catch (err: any) {
        console.error('Filesystem写入失败:', err);
      }
      fallbackDownload(jsonContent, filename);
    } else {
      fallbackDownload(jsonContent, filename);
    }
  };

  const fallbackDownload = (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: '导出成功！' });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.version || !data.units) {
          throw new Error('文件格式不正确');
        }
        const checkInDays = data.checkIn?.records
          ? Object.values(data.checkIn.records).filter((r: any) => r.completedModules?.length > 0).length
          : 0;
        const phonicsLetters = data.phonics?.learnedLetters?.length || 0;
        const confirmed = confirm(
          `确定要导入数据吗？\n\n` +
          `- 将导入 ${data.units.length} 个单元\n` +
          `- 将导入 ${data.mistakes?.length || 0} 条错题记录\n` +
          (data.achievements ? `- 将导入 ${data.achievements.unlockedAchievements?.length || 0} 个已解锁成就\n` : '') +
          (checkInDays > 0 ? `- 将导入 ${checkInDays} 天打卡记录\n` : '') +
          (phonicsLetters > 0 ? `- 将导入 ${phonicsLetters} 个字母拼读进度\n` : '') +
          `注意：这将覆盖您现有的数据！`
        );
        if (!confirmed) return;
        useUnitStore.setState({ units: data.units });
        useMistakeStore.setState({ mistakes: data.mistakes || [] });
        if (data.settings) {
          useSettingsStore.setState({
            soundEnabled: data.settings.soundEnabled ?? true,
            dailyGoal: data.settings.dailyGoal ?? 10,
            questionsPerQuiz: data.settings.questionsPerQuiz ?? 10,
          });
        }
        if (data.achievements) {
          useAchievementStore.setState({
            unlockedAchievements: data.achievements.unlockedAchievements || [],
            stats: {
              ...useAchievementStore.getState().stats,
              ...data.achievements.stats,
              learnedWordIds: data.achievements.stats?.learnedWordIds || [],
            }
          });
        }
        if (data.checkIn) {
          useCheckInStore.setState({
            records: data.checkIn.records || {},
          });
        }
        if (data.phonics) {
          usePhonicsStore.setState({
            learnedLetters: data.phonics.learnedLetters || [],
          });
        }
        setMessage({ type: 'success', text: '导入成功！页面将刷新...' });
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        setMessage({ type: 'error', text: '导入失败：文件格式不正确' });
        setTimeout(() => setMessage(null), 3000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 page-content">
      {/* 顶部渐变导航栏 */}
      <div className="bg-gradient-primary px-4 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-white p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">设置</h1>
        </div>
      </div>

      <div className="px-4 py-4">
        {message && (
          <div className={`card-modern mb-4 text-center py-3 ${message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
            <span className={message.type === 'success' ? 'text-green-600' : 'text-red-600'}>
              {message.text}
            </span>
          </div>
        )}

        {/* 数据管理卡片 */}
        <div className="card-modern p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">数据管理</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              导出数据
            </button>

            <label className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              导入数据
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-gray-500 text-sm">
            您可以备份您的学习记录或从其他设备同步进度。
          </p>
        </div>

        {/* 学习设置卡片 */}
        <div className="card-modern p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">学习设置</h2>
          </div>

          <div className="space-y-4">
            {/* 音效反馈 */}
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">音效反馈</span>
              <button
                onClick={toggleSound}
                className={`w-12 h-7 rounded-full transition-colors relative ${soundEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${soundEnabled ? 'left-6' : 'left-1'}`}
                />
              </button>
            </div>

            {/* 每次练习题目数 */}
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">每次练习题目数</span>
              <div className="relative">
                <select
                  value={questionsPerQuiz}
                  onChange={(e) => setQuestionsPerQuiz(Number(e.target.value))}
                  className="appearance-none bg-blue-50 text-blue-600 font-semibold py-2 px-4 pr-8 rounded-lg focus:outline-none"
                >
                  <option value={5}>5 题</option>
                  <option value={10}>10 题</option>
                  <option value={15}>15 题</option>
                  <option value={20}>20 题</option>
                  <option value={30}>30 题</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 每日学习目标 */}
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">每日学习目标</span>
              <div className="relative">
                <select
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="appearance-none bg-blue-50 text-blue-600 font-semibold py-2 px-4 pr-8 rounded-lg focus:outline-none"
                >
                  <option value={5}>5 题</option>
                  <option value={10}>10 题</option>
                  <option value={20}>20 题</option>
                  <option value={30}>30 题</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

                      </div>
        </div>

        {/* 关于 */}
        <div className="card-modern p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">关于</h2>
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">新启航英语学习系统</h3>
            <p className="text-gray-500 text-sm">版本 v1.0</p>
          </div>

          <div className="mt-4 border-t border-gray-100">
            <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 transition-colors">
              <span className="text-gray-700">用户协议</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 transition-colors border-t border-gray-100">
              <span className="text-gray-700">隐私政策</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 保存并返回按钮 */}
        <button
          onClick={onBack}
          className="btn-gradient w-full"
        >
          保存并返回
        </button>
      </div>
    </div>
  );
}
