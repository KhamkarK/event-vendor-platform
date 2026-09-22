import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, ClipboardList, LayoutDashboard, Package, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { Card } from "@/components/common/Card";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import { listVendorBookings } from "@/features/vendorDashboard/vendorDashboardApi";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/vendor-dashboard", icon: LayoutDashboard, end: true },
  { label: "Calendar", to: "/vendor-dashboard/calendar", icon: CalendarCheck },
  { label: "Packages", to: "/vendor-dashboard/packages", icon: Package },
  { label: "Quotations", to: "/vendor-dashboard/quotations", icon: ClipboardList },
  { label: "Ledger", to: "/vendor-dashboard/ledger", icon: Wallet },
];

export function BookingCalendar() {
  const { data: bookings } = useQuery({ queryKey: ["vendor-bookings"], queryFn: listVendorBookings });
  const [monthOffset, setMonthOffset] = useState(0);

  const monthDate = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const firstWeekday = monthDate.getDay();

  const bookingsByDay = useMemo(() => {
    const map: Record<number, number> = {};
    (bookings ?? []).forEach((b) => {
      const created = new Date(b.created_at);
      if (created.getMonth() === monthDate.getMonth() && created.getFullYear() === monthDate.getFullYear()) {
        map[created.getDate()] = (map[created.getDate()] ?? 0) + 1;
      }
    });
    return map;
  }, [bookings, monthDate]);

  return (
    <div className="flex gap-8">
      <Sidebar title="Vendor" links={sidebarLinks} />
      <div className="flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-neutral-900">Availability Calendar</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setMonthOffset((m) => m - 1)} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50">
              Prev
            </button>
            <span className="min-w-[140px] text-center text-sm font-semibold text-neutral-700">
              {monthDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </span>
            <button onClick={() => setMonthOffset((m) => m + 1)} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50">
              Next
            </button>
          </div>
        </div>

        <Card>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase text-neutral-400">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const count = bookingsByDay[day];
              return (
                <div
                  key={day}
                  className={`flex h-16 flex-col items-center justify-center rounded-xl border text-sm transition-colors ${
                    count ? "border-brand-200 bg-brand-50 text-brand-700 font-bold" : "border-neutral-100 text-neutral-600"
                  }`}
                >
                  {day}
                  {count && <span className="mt-0.5 text-[10px] font-semibold">{count} booking{count > 1 ? "s" : ""}</span>}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
