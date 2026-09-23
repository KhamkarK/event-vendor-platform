import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Home,
  Search,
  ShieldCheck,
  Sliders,
  Store,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";

interface TabItem {
  label: string;
  to?: string;
  icon: LucideIcon;
  end?: boolean;
  onClick?: () => void;
}

/**
 * A persistent bottom navigation bar for small screens — the desktop navbar collapses
 * behind a hamburger on mobile, so the pages used most (per role) get a thumb-reachable
 * bar instead of requiring the menu every time.
 */
export function MobileTabBar() {
  const { user, isAuthenticated } = useAuthStore();
  const openCommandPalette = useUIStore((s) => s.openCommandPalette);

  let tabs: TabItem[];
  if (!isAuthenticated || !user) {
    tabs = [
      { label: "Home", to: "/", icon: Home, end: true },
      { label: "Vendors", to: "/vendors", icon: Store },
      { label: "Log in", to: "/login", icon: ClipboardList },
    ];
  } else if (user.role === "vendor") {
    tabs = [
      { label: "Dashboard", to: "/vendor-dashboard", icon: BarChart3, end: true },
      { label: "Calendar", to: "/vendor-dashboard/calendar", icon: CalendarCheck },
      { label: "Quotes", to: "/vendor-dashboard/quotations", icon: ClipboardList },
      { label: "Ledger", to: "/vendor-dashboard/ledger", icon: Wallet },
    ];
  } else if (user.role === "admin") {
    tabs = [
      { label: "Overview", to: "/admin", icon: BarChart3, end: true },
      { label: "Vendors", to: "/admin/vendors", icon: ShieldCheck },
      { label: "Customers", to: "/admin/customers", icon: Users },
      { label: "Fees", to: "/admin/commissions", icon: Sliders },
      { label: "Reports", to: "/admin/reports", icon: ClipboardList },
    ];
  } else {
    tabs = [
      { label: "Home", to: "/", icon: Home, end: true },
      { label: "Vendors", to: "/vendors", icon: Store },
      { label: "Events", to: "/events", icon: CalendarDays },
      { label: "Search", icon: Search, onClick: openCommandPalette },
    ];
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-4" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((tab) =>
          tab.onClick ? (
            <button
              key={tab.label}
              onClick={tab.onClick}
              className="flex flex-col items-center gap-1 py-2.5 text-neutral-500 transition-colors hover:text-brand-600"
            >
              <tab.icon size={19} />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          ) : (
            <NavLink
              key={tab.to}
              to={tab.to!}
              end={tab.end}
              className={({ isActive }) =>
                clsx("relative flex flex-col items-center gap-1 py-2.5 transition-colors", isActive ? "text-brand-600" : "text-neutral-500")
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="mobile-tab-active"
                      className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-gradient"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <tab.icon size={19} />
                  <span className="text-[11px] font-medium">{tab.label}</span>
                </>
              )}
            </NavLink>
          )
        )}
      </div>
    </nav>
  );
}
