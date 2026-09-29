import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthResponse, User } from "@/types/user";

interface AdminSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  /** Transient flag: true right after a fresh login/signup, until the welcome brochure is dismissed. */
  showBrochure: boolean;
  /** The admin's own session, stashed while impersonating a customer/vendor. */
  adminSession: AdminSession | null;
  isImpersonating: boolean;
  setSession: (auth: AuthResponse) => void;
  /** Merges fields into the current user (e.g. after a self-service update like
   * a Prime membership request) without requiring a full re-login. */
  updateUser: (patch: Partial<User>) => void;
  dismissBrochure: () => void;
  logout: () => void;
  /** Admin-only: stash the admin's own session and switch into the target
   * user's session, so the admin can use the app exactly as that user would. */
  startImpersonation: (auth: AuthResponse) => void;
  /** Restores the stashed admin session that startImpersonation saved. */
  stopImpersonation: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      showBrochure: false,
      adminSession: null,
      isImpersonating: false,
      setSession: (auth) =>
        set({
          user: auth.user,
          accessToken: auth.access_token,
          refreshToken: auth.refresh_token,
          isAuthenticated: true,
          showBrochure: true,
        }),
      updateUser: (patch) => set((state) => (state.user ? { user: { ...state.user, ...patch } } : {})),
      dismissBrochure: () => set({ showBrochure: false }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          showBrochure: false,
          adminSession: null,
          isImpersonating: false,
        }),
      startImpersonation: (auth) =>
        set((state) => ({
          adminSession:
            state.adminSession ??
            (state.user && state.accessToken && state.refreshToken
              ? { user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken }
              : null),
          user: auth.user,
          accessToken: auth.access_token,
          refreshToken: auth.refresh_token,
          isAuthenticated: true,
          isImpersonating: true,
          showBrochure: false,
        })),
      stopImpersonation: () =>
        set((state) =>
          state.adminSession
            ? {
                user: state.adminSession.user,
                accessToken: state.adminSession.accessToken,
                refreshToken: state.adminSession.refreshToken,
                adminSession: null,
                isImpersonating: false,
                isAuthenticated: true,
              }
            : {}
        ),
    }),
    { name: "evp-auth" }
  )
);
