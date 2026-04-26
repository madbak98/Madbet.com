"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type DemoSettlement = "pending" | "won_demo" | "lost_demo" | "void_demo";

export type SportsDemoBetRow = {
  id: string;
  placedAt: string;
  stake: number;
  combinedOdds: number;
  potentialReturn: number;
  legs: string[];
  status: DemoSettlement;
};

type State = {
  bets: SportsDemoBetRow[];
  addPendingBet: (row: Omit<SportsDemoBetRow, "id" | "placedAt" | "status">) => string;
  settleBet: (id: string, status: Exclude<DemoSettlement, "pending">) => void;
};

export const useSportsDemoStore = create<State>()(
  persist(
    (set) => ({
      bets: [],
      addPendingBet: (row) => {
        const id = crypto.randomUUID();
        const placedAt = new Date().toISOString();
        set((s) => ({
          bets: [{ ...row, id, placedAt, status: "pending" as const }, ...s.bets].slice(0, 80),
        }));
        return id;
      },
      settleBet: (id, status) =>
        set((s) => ({
          bets: s.bets.map((b) => (b.id === id ? { ...b, status } : b)),
        })),
    }),
    {
      name: "madbak-sports-demo-bets",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
