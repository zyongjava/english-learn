import { useState, useEffect } from 'react';
import { useCheckInStore } from '../stores/checkInStore';

interface Props {
  onBack: () => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function CheckInPage({ onBack }: Props) {
  const { currentYear, currentMonth, getCheckedInDays, hasCheckedIn } = useCheckInStore();
  const [displayYear, setDisplayYear] = useState(currentYear);
  const [displayMonth, setDisplayMonth] = useState(currentMonth);

  useEffect(() => {
    setDisplayYear(currentYear);
    setDisplayMonth(currentMonth);
  }, [currentYear, currentMonth]);

  const checkedInDays = getCheckedInDays(displayYear, displayMonth);

  const firstDayOfMonth = new Date(displayYear, displayMonth - 1, 1).getDay();
  const daysInMonth = new Date(displayYear, displayMonth, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === displayYear && today.getMonth() + 1 === displayMonth;

  const handlePrevMonth = () => {
    if (displayMonth === 1) {
      setDisplayMonth(12);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 12) {
      setDisplayMonth(1);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const isCheckedIn = (day: number): boolean => {
    const dateStr = `${displayYear}-${String(displayMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return hasCheckedIn(dateStr);
  };

  const isToday = (day: number): boolean => {
    return isCurrentMonth && day === today.getDate();
  };

  // 计算打卡完成率
  const completionRate = Math.round((checkedInDays.length / daysInMonth) * 100);

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
          <h1 className="text-xl font-bold text-white">打卡记录</h1>
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* 月份切换 */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-lg font-bold text-gray-800">
            {displayYear}年{displayMonth}月
          </div>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 日历 */}
        <div className="card-modern p-4 mb-4">
          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day, index) => (
              <div key={index} className="text-center text-sm font-medium py-2 text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const checkedIn = isCheckedIn(day);
              const todayFlag = isToday(day);

              return (
                <div
                  key={day}
                  className={`aspect-square rounded-full flex items-center justify-center text-sm font-medium ${
                    checkedIn
                      ? todayFlag
                        ? 'bg-green-500 text-white border-2 border-blue-500'
                        : 'bg-green-500 text-white'
                      : todayFlag
                        ? 'border-2 border-blue-500 text-blue-600'
                        : 'text-gray-700'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="card-modern p-4 mb-4 bg-green-50 border border-green-100">
          <h3 className="font-bold text-green-800 mb-3">
            本月打卡统计
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-600 mb-1">打卡天数</p>
              <p className="text-3xl font-bold text-green-700">{checkedInDays.length}<span className="text-sm font-normal"> days</span></p>
            </div>
            <div>
              <p className="text-sm text-green-600 mb-1">打卡完成率</p>
              <p className="text-3xl font-bold text-green-700">{completionRate}%</p>
            </div>
          </div>
        </div>

        {/* 打卡说明 */}
        <div className="card-modern p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
              i
            </div>
            打卡规则
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <p className="text-sm text-gray-600">每日完成至少一个课程模块即可自动打卡。</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <p className="text-sm text-gray-600">连续打卡7天可获得专属成就勋章。</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <p className="text-sm text-gray-600">遗漏打卡可使用补签卡在3日内补签。</p>
            </div>
          </div>
        </div>

        {/* 学习插图卡片 */}
        <div className="card-modern p-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
          <div className="relative z-10 p-6 flex items-center gap-4">
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-white/20 rounded-lg text-white text-sm font-medium mb-2">
                Learning
              </div>
              <h3 className="text-white font-bold text-lg">保持学习</h3>
              <p className="text-white/70 text-sm">坚持每日打卡，养成好习惯</p>
            </div>
            <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
