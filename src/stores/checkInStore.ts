import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CheckInRecord, CheckInState } from '../types';

interface CheckInStore extends CheckInState {
  // 记录完成模块
  recordModuleCompletion: (module: 'learning' | 'recognition' | 'spelling') => void;
  // 检查某天是否已打卡
  hasCheckedIn: (date: string) => boolean;
  // 获取某天的打卡记录
  getRecord: (date: string) => CheckInRecord | null;
  // 获取当前月已打卡的天数
  getCheckedInDays: (year: number, month: number) => string[];
  // 切换月份
  setMonth: (year: number, month: number) => void;
  // 重置当前月份（回到当月）
  resetToCurrentMonth: () => void;
}

export const useCheckInStore = create<CheckInStore>()(
  persist(
    (set, get) => ({
      records: {},
      currentMonth: new Date().getMonth() + 1,
      currentYear: new Date().getFullYear(),

      recordModuleCompletion: (module) => {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

        set((state) => {
          const existingRecord = state.records[dateStr];
          if (existingRecord && existingRecord.completedModules.includes(module)) {
            // 该模块今日已完成
            return state;
          }

          return {
            records: {
              ...state.records,
              [dateStr]: {
                date: dateStr,
                completedModules: existingRecord
                  ? [...existingRecord.completedModules, module]
                  : [module],
                timestamp: Date.now(),
              },
            },
          };
        });
      },

      hasCheckedIn: (date) => {
        const record = get().records[date];
        return record !== undefined && record.completedModules.length > 0;
      },

      getRecord: (date) => {
        return get().records[date] || null;
      },

      getCheckedInDays: (year, month) => {
        const records = get().records;
        const days: string[] = [];
        const prefix = `${year}-${String(month).padStart(2, '0')}-`;

        Object.keys(records).forEach((date) => {
          if (date.startsWith(prefix) && records[date].completedModules.length > 0) {
            // 提取日期中的天数部分
            const day = date.split('-')[2];
            days.push(day);
          }
        });

        return days;
      },

      setMonth: (year, month) => {
        set({ currentYear: year, currentMonth: month });
      },

      resetToCurrentMonth: () => {
        const now = new Date();
        set({ currentYear: now.getFullYear(), currentMonth: now.getMonth() + 1 });
      },
    }),
    {
      name: 'checkin-storage',
    }
  )
);