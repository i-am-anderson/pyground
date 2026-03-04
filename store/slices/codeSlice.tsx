import { StateCreator } from "zustand";

export type CodeSlice = {
  code: string;
  addCode: (name: string) => void;
};

const createCodeSlice: StateCreator<CodeSlice> = (set) => ({
  code: "",
  addCode: (code: string) => set({ code }),
});

export default createCodeSlice;
