import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart3, CircleDollarSign, LayoutDashboard, ShieldCheck, Sliders, Store, Users } from "lucide-react";

import { MehendiCorner } from "@/assets/MehendiCorner";
import { AnimatedCounter } from "@/components/common/AnimatedCounter";
import { Card } from "@/components/common/Card";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import { getDashboardStats } from "@/features/admin/adminApi";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Vendors", to: "/admin/vendors", icon: ShieldCheck },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Commissions", to: "/admin/commissions", icon: Sliders },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
];

const statCards = [
  { key: "total_users" as const, label: "Customers", icon: Users, color: "text-blue-500 bg-blue-50" },
  { key: "total_vendors" as const, label: "Total vendors", icon: Store, color: "text-brand-500 bg-brand-50" },
  { key: "approved_vendors" as const, label: "Approved vendors", icon: ShieldCheck, color: "text-emerald-500 bg-emerald-50" },
  { key: "pending_vendors" as const, label: "Pending approvals", icon: Sliders, color: "text-amber-500 bg-amber-50" },
  { key: "total_bookings" as const, label: "Total bookings", icon: BarChart3, color: "text-purple-500 bg-purple-50" },
  { key: "total_transacted_volume" as const, label: "Transacted volume", icon: CircleDollarSign, color: "text-accent-500 bg-accent-50", isCurrency: true },
];

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({ queryKey: ["admin-dashboard"], queryFn: getDashboardStats });

  return (
    <div className="flex gap-8">
      <Sidebar title="Admin" links={sidebarLinks} />
      <div className="flex-1">
        <div className="relative">
          <MehendiCorner className="pointer-events-none absolute -right-1 -top-2 h-10 w-10 text-brand-200" />
          <h1 className="text-2xl font-extrabold text-neutral-900">Platform Overview</h1>
          <p className="mt-1 text-sm text-neutral-500">Monitor vendors, bookings, and transacted volume at a glance.</p>
        </div>

        {isLoading || !stats ? (
          <div className="mt-10 flex justify-center">
            <RangoliSpinner label="Crunching the numbers…" />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              const value = stats[card.key];
              return (
                <motion.div key={card.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card>
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                      <Icon size={18} />
                    </span>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">{card.label}</p>
                    <AnimatedCounter
                      value={Number(value)}
                      format={card.isCurrency ? (n) => `₹${n.toLocaleString()}` : undefined}
                      className="mt-1 block text-2xl font-extrabold text-neutral-900"
                    />
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
