import { create } from "zustand";
import createUrlSlice, { UrlSlice } from "@/store/slices/urlSlice";
import createCodeSlice, { CodeSlice } from "@/store/slices/codeSlice";

type CustomStore = UrlSlice & CodeSlice;

const useCustomStore = create<CustomStore>((...a) => ({
  ...createUrlSlice(...a),
  ...createCodeSlice(...a),
}));

export default useCustomStore;
