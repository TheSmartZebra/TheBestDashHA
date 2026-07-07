import { create } from "zustand";

export type MenuKey = "service" | "add" | null;

interface UiState {
  edit: boolean;
  holding: string | null;
  menu: MenuKey;
  modal: string | null;
  sbOpen: boolean;

  setEdit: (edit: boolean) => void;
  toggleEdit: () => void;
  setHolding: (id: string | null) => void;
  setMenu: (menu: MenuKey | ((m: MenuKey) => MenuKey)) => void;
  closeMenus: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  edit: false,
  holding: null,
  menu: null,
  modal: null,
  sbOpen: false,

  setEdit: (edit) => set({ edit, menu: null }),
  toggleEdit: () => set({ edit: !get().edit, menu: null }),
  setHolding: (holding) => set({ holding }),
  setMenu: (menu) => set((s) => ({ menu: typeof menu === "function" ? menu(s.menu) : menu })),
  closeMenus: () => set({ menu: null }),
  openModal: (id) => set({ modal: id, menu: null }),
  closeModal: () => set({ modal: null }),
  openSidebar: () => set({ sbOpen: true }),
  closeSidebar: () => set({ sbOpen: false })
}));
