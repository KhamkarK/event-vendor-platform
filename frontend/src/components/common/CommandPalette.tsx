import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  CornerDownLeft,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Sliders,
  Store,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";

interface CommandItem {
  label: string;
  hint?: string;
  icon: typeof Search;
  action: () => void;
}

/**
 * A Cmd/Ctrl+K quick-action palette — role-aware shortcuts to the pages each role
 * uses most, so the app doesn't rely on the navbar alone once there's real data to
 * navigate around.
 */
export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const closeCommandPalette = useUIStore((s) => s.closeCommandPalette);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const setOpen = (next: boolean) => (next ? useUIStore.getState().openCommandPalette() : closeCommandPalette());
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const items: CommandItem[] = useMemo(() => {
    const go = (to: string) => () => navigate(to);
    const base: CommandItem[] = [];

    if (!isAuthenticated || !user) {
      base.push({ label: "Browse vendors", icon: Store, action: go("/vendors") });
      return base;
    }

    if (user.role === "customer") {
      base.push(
        { label: "Find vendors", icon: Store, action: go("/vendors") },
        { label: "My events", icon: CalendarDays, action: go("/events") },
        { label: "Create new event", hint: "budget & vendors", icon: Plus, action: go("/events/new") }
      );
    } else if (user.role === "vendor") {
      base.push(
        { label: "Vendor dashboard", icon: LayoutDashboard, action: go("/vendor-dashboard") },
        { label: "Availability calendar", icon: CalendarCheck, action: go("/vendor-dashboard/calendar") },
        { label: "Quotations & requests", icon: ClipboardList, action: go("/vendor-dashboard/quotations") },
        { label: "Ledger", icon: Wallet, action: go("/vendor-dashboard/ledger") }
      );
    } else if (user.role === "admin") {
      base.push(
        { label: "Platform overview", icon: LayoutDashboard, action: go("/admin") },
        { label: "Vendor management", icon: ShieldCheck, action: go("/admin/vendors") },
        { label: "Commission settings", icon: Sliders, action: go("/admin/commissions") },
        { label: "Reports & analytics", icon: BarChart3, action: go("/admin/reports") }
      );
    }

    base.push({
      label: "Log out",
      icon: LogOut,
      action: () => {
        logout();
        navigate("/login");
      },
    });

    return base;
  }, [user, isAuthenticated, navigate, logout]);

  const filtered = useMemo(
    () => (query.trim() ? items.filter((i) => i.label.toLowerCase().includes(query.trim().toLowerCase())) : items),
    [items, query]
  );

  useEffect(() => setActiveIndex(0), [query, open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommandPalette();
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleCommandPalette]);

  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      filtered[activeIndex].action();
      setOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-neutral-900/40 px-4 pt-24 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
              <Search size={16} className="text-neutral-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Jump to…"
                className="w-full bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
              />
              <kbd className="rounded border border-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400">esc</kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-neutral-400">No matching action</p>
              ) : (
                filtered.map((item, idx) => (
                  <button
                    key={item.label}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => {
                      item.action();
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      idx === activeIndex ? "bg-brand-50 text-brand-700" : "text-neutral-700"
                    }`}
                  >
                    <item.icon size={16} className={idx === activeIndex ? "text-brand-500" : "text-neutral-400"} />
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.hint && <span className="text-xs text-neutral-400">{item.hint}</span>}
                    {idx === activeIndex && <CornerDownLeft size={13} className="text-brand-400" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
