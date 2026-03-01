const createCodeSlice = (set) => ({
  code: "",
  addCode: (code: string) => set({ code }),
});

export default createCodeSlice;
