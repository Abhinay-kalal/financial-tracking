import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  updateRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateRole: (role) =>
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        })),
    }),
    {
      name: 'fc_auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// UI Store
interface UIStore {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCollapse: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    { name: 'fc_ui', partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }) }
  )
);

// Invoice Store
interface InvoiceStore {
  draftInvoice: Partial<import('@/types').Invoice> | null;
  setDraftInvoice: (invoice: Partial<import('@/types').Invoice>) => void;
  clearDraft: () => void;
}

export const useInvoiceStore = create<InvoiceStore>()((set) => ({
  draftInvoice: null,
  setDraftInvoice: (invoice) => set({ draftInvoice: invoice }),
  clearDraft: () => set({ draftInvoice: null }),
}));
