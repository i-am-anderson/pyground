const createUrlSlice = (set) => ({
  url: "",
  name: "",
  addUrl: (url: string) => set({ url }),
  addName: (name: string) => set({ name }),
});

export default createUrlSlice;
