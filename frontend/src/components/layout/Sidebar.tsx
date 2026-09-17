import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

export interface SidebarLink {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

interface SidebarProps {
  title: string;
  links: SidebarLink[];
}

export function Sidebar({ title, links }: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-24">
        <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-neutral-400">{title}</p>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                clsx(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "text-brand-700" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-brand-50"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <link.icon size={17} className="relative z-10" />
                  <span className="relative z-10">{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
