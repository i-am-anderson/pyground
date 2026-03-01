import { create } from "zustand";
import createUrlSlice from "./slices/urlSlice";
import createCodeSlice from "./slices/codeSlice";

const useCustomStore = create((...a) => ({
  ...createUrlSlice(...a),
  ...createCodeSlice(...a),
}));

export default useCustomStore;
