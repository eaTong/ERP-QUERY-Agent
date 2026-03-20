import { create } from 'zustand';
import { authApi } from '../services/auth';

interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
}

interface MenuState {
  menus: MenuItem[];
  isLoading: boolean;
  loadMenus: () => Promise<void>;
  clearMenus: () => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  menus: [],
  isLoading: false,

  loadMenus: async () => {
    set({ isLoading: true });
    try {
      const menus = await authApi.getMenus();
      set({ menus, isLoading: false });
    } catch (error) {
      console.error('Failed to load menus:', error);
      set({ menus: [], isLoading: false });
    }
  },

  clearMenus: () => {
    set({ menus: [] });
  },
}));
