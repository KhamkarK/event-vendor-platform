import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthResponse, User } from "@/types/user";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  /** Transient flag: true right after a fresh login/signup, until the welcome brochure is dismissed. */
  showBrochure: boolean;
  setSession: (auth: AuthResponse) => void;
  dismissBrochure: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      showBrochure: false,
      setSession: (auth) =>
        set({
          user: auth.user,
          accessToken: auth.access_token,
          refreshToken: auth.refresh_token,
          isAuthenticated: true,
          showBrochure: true,
        }),
      dismissBrochure: () => set({ showBrochure: false }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          showBrochure: false,
        }),
    }),
    { name: "evp-auth" }
  )
);
