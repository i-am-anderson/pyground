import { StateCreator } from "zustand";

export type UrlSlice = {
  url: string;
  name: string;
  addUrl: (url: string) => void;
  addName: (name: string) => void;
};

const createUrlSlice: StateCreator<UrlSlice> = (set) => ({
  url: "",
  name: "",
  addUrl: (url: string) => set({ url }),
  addName: (name: string) => set({ name }),
});

export default createUrlSlice;
