import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Search, User as UserIcon, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { DiyaIcon } from "@/assets/DiyaIcon";
import { Button } from "@/components/common/Button";
import { AccountDetailsModal } from "@/components/layout/AccountDetailsModal";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";

const navLinksByRole: Record<string, { label: string; to: string }[]> = {
  customer: [
    { label: "Find Vendors", to: "/vendors" },
    { label: "My Events", to: "/events" },
  ],
  vendor: [
    { label: "Dashboard", to: "/vendor-dashboard" },
    { label: "Calendar", to: "/vendor-dashboard/calendar" },
    { label: "Packages", to: "/vendor-dashboard/packages" },
    { label: "Quotations", to: "/vendor-dashboard/quotations" },
    { label: "Ledger", to: "/vendor-dashboard/ledger" },
  ],
  admin: [
    { label: "Overview", to: "/admin" },
    { label: "Vendors", to: "/admin/vendors" },
    { label: "Commissions", to: "/admin/commissions" },
    { label: "Reports", to: "/admin/reports" },
  ],
};

/** For a vendor, the business identity is what the rest of the platform (and
 * their customers) knows them by — show that instead of the personal name
 * used to sign up. Every other role still shows their own name. */
function displayName(user: { role: string; full_name: string; vendor_profile: { business_name: string } | null }) {
  if (user.role === "vendor" && user.vendor_profile) {
    return user.vendor_profile.business_name;
  }
  return user.full_name.split(" ")[0];
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const openCommandPalette = useUIStore((s) => s.openCommandPalette);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  const links = user ? navLinksByRole[user.role] ?? [] : [{ label: "Find Vendors", to: "/vendors" }];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <DiyaIcon className="h-[18px] w-[18px]" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-neutral-900">
            Event<span className="text-brand-500">Karma</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={openCommandPalette}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:border-brand-300 hover:text-brand-600"
          >
            <Search size={13} />
            <kbd className="font-sans">⌘K</kbd>
          </button>
          {isAuthenticated && user ? (
            <>
              <button
                onClick={() => setShowAccountDetails(true)}
                className="flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
                aria-label="View account details"
              >
                <UserIcon size={15} className="text-brand-500" />
                {displayName(user)}
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                  {user.role}
                </span>
              </button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-neutral-100 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  {user && (
                    <button
                      onClick={() => {
                        setShowAccountDetails(true);
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      <UserIcon size={15} className="text-brand-500" /> {displayName(user)}
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="flex-1">
                    <Button variant="outline" size="sm" fullWidth>
                      Log in
                    </Button>
                  </Link>
                  <Link to="/signup" className="flex-1">
                    <Button variant="primary" size="sm" fullWidth>
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {user && <AccountDetailsModal isOpen={showAccountDetails} onClose={() => setShowAccountDetails(false)} user={user} />}
    </header>
  );
}
