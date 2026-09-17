import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarCheck, ClipboardList, IndianRupee, LayoutDashboard, Wallet } from "lucide-react";

import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import { listVendorBookings } from "@/features/vendorDashboard/vendorDashboardApi";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/vendor-dashboard", icon: LayoutDashboard, end: true },
  { label: "Calendar", to: "/vendor-dashboard/calendar", icon: CalendarCheck },
  { label: "Quotations", to: "/vendor-dashboard/quotations", icon: ClipboardList },
  { label: "Ledger", to: "/vendor-dashboard/ledger", icon: Wallet },
];

const statusColors: Record<string, string> = {
  interested: "bg-neutral-100 text-neutral-600",
  quote_requested: "bg-amber-50 text-amber-600",
  quoted: "bg-blue-50 text-blue-600",
  confirmed: "bg-emerald-50 text-emerald-600",
  completed: "bg-brand-50 text-brand-700",
  cancelled: "bg-red-50 text-red-600",
};

export function VendorDashboardPage() {
  const { data: bookings, isLoading } = useQuery({ queryKey: ["vendor-bookings"], queryFn: listVendorBookings });

  const totalRevenue = bookings?.reduce((sum, b) => sum + b.total_amount, 0) ?? 0;
  const activeCount = bookings?.filter((b) => !["completed", "cancelled"].includes(b.status)).length ?? 0;

  return (
    <div className="flex gap-8">
      <Sidebar title="Vendor" links={sidebarLinks} />
      <div className="flex-1">
        <h1 className="text-2xl font-extrabold text-neutral-900">Vendor Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">Track bookings, quotations, and payments in one place.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Active bookings</p>
            <p className="mt-1 text-3xl font-extrabold text-neutral-900">{activeCount}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Total bookings</p>
            <p className="mt-1 text-3xl font-extrabold text-neutral-900">{bookings?.length ?? 0}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Booked value</p>
            <p className="mt-1 flex items-center text-3xl font-extrabold text-neutral-900">
              <IndianRupee size={22} /> {totalRevenue.toLocaleString()}
            </p>
          </Card>
        </div>

        <h2 className="mb-3 mt-8 text-lg font-bold text-neutral-900">Recent bookings</h2>
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-neutral-100" />
        ) : !bookings || bookings.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No bookings yet" description="When customers show interest, bookings will appear here." />
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((booking, idx) => (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                <Card className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Booking #{booking.id}</p>
                    <p className="text-xs text-neutral-500">Event #{booking.event_id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-neutral-800">₹{booking.total_amount.toLocaleString()}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusColors[booking.status]}`}>
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
