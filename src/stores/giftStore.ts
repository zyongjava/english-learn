import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Gift {
  id: string;
  name: string;
  points: number;
  imageUrl?: string;
  createdAt: number;
}

interface GiftState {
  gifts: Gift[];
  addGift: (name: string, points: number, imageUrl?: string) => void;
  updateGift: (id: string, name: string, points: number, imageUrl?: string) => void;
  deleteGift: (id: string) => void;
}

export const useGiftStore = create<GiftState>()(
  persist(
    (set) => ({
      gifts: [],
      addGift: (name, points, imageUrl) =>
        set((state) => ({
          gifts: [
            ...state.gifts,
            {
              id: Date.now().toString(),
              name,
              points,
              imageUrl,
              createdAt: Date.now(),
            },
          ],
        })),
      updateGift: (id, name, points, imageUrl) =>
        set((state) => ({
          gifts: state.gifts.map((g) =>
            g.id === id ? { ...g, name, points, imageUrl } : g
          ),
        })),
      deleteGift: (id) =>
        set((state) => ({
          gifts: state.gifts.filter((g) => g.id !== id),
        })),
    }),
    { name: 'gift-storage' }
  )
);