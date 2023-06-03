import create from "zustand";

type AppStore = {
  pageIndex: number;
  setPageIndex: (index: number) => void;
  pageName: string;
  setPageName: (name: string) => void;
};

const useAppStore = create<AppStore>((set) => ({
  pageIndex: 0,
  setPageIndex: (index) => set({ pageIndex: index }),

  pageName: "Bookings",
  setPageName: (name) => set({ pageName: name }),
}));

export default useAppStore;
