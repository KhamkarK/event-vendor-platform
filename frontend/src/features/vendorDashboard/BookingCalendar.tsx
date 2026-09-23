import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, ClipboardList, LayoutDashboard, Package, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Card } from "@/components/common/Card";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import { blockDate, listMyBlockedDates, listVendorBookings, unblockDate } from "@/features/vendorDashboard/vendorDashboardApi";
import { getVendorAvailability } from "@/features/vendors/vendorsApi";
import { useAuthStore } from "@/store/authStore";

/** Local YYYY-MM-DD (not UTC) so it lines up with the plain `date` the backend stores/returns. */
function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/vendor-dashboard", icon: LayoutDashboard, end: true },
  { label: "Calendar", to: "/vendor-dashboard/calendar", icon: CalendarCheck },
  { label: "Packages", to: "/vendor-dashboard/packages", icon: Package },
  { label: "Quotations", to: "/vendor-dashboard/quotations", icon: ClipboardList },
  { label: "Ledger", to: "/vendor-dashboard/ledger", icon: Wallet },
];

export function BookingCalendar() {
  const { user } = useAuthStore();
  const vendorId = user?.vendor_profile?.id;
  const queryClient = useQueryClient();

  const { data: bookings } = useQuery({ queryKey: ["vendor-bookings"], queryFn: listVendorBookings });
  const { data: blockedDates } = useQuery({ queryKey: ["vendor-blocked-dates"], queryFn: listMyBlockedDates });
  const { data: unavailableDates } = useQuery({
    queryKey: ["vendor-availability", vendorId],
    queryFn: () => getVendorAvailability(vendorId as number),
    enabled: !!vendorId,
  });
  const [monthOffset, setMonthOffset] = useState(0);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["vendor-blocked-dates"] });
    queryClient.invalidateQueries({ queryKey: ["vendor-availability", vendorId] });
  };

  const blockMutation = useMutation({
    mutationFn: blockDate,
    onSuccess: invalidate,
    onError: () => toast.error("Could not block that date"),
  });
  const unblockMutation = useMutation({
    mutationFn: unblockDate,
    onSuccess: invalidate,
    onError: () => toast.error("Could not unblock that date"),
  });

  const unavailableSet = useMemo(() => new Set(unavailableDates ?? []), [unavailableDates]);
  const blockedByDate = useMemo(() => {
    const map = new Map<string, number>();
    (blockedDates ?? []).forEach((b) => map.set(b.date, b.id));
    return map;
  }, [blockedDates]);

  function toggleDate(dateKey: string) {
    const blockedId = blockedByDate.get(dateKey);
    if (blockedId) {
      unblockMutation.mutate(blockedId);
    } else if (unavailableSet.has(dateKey)) {
      toast.error("This date already has a confirmed booking");
    } else {
      blockMutation.mutate(dateKey);
    }
  }

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
          <div className="mb-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-500">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-red-200 bg-red-50" /> Blocked by you
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-neutral-300 bg-neutral-100" /> Confirmed booking
            </span>
            <span className="ml-auto text-neutral-400">Tap a date to block or unblock it</span>
          </div>
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
              const dateKey = toDateKey(monthDate.getFullYear(), monthDate.getMonth(), day);
              const manuallyBlocked = blockedByDate.has(dateKey);
              const confirmedBooked = !manuallyBlocked && unavailableSet.has(dateKey);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDate(dateKey)}
                  disabled={confirmedBooked}
                  className={`flex h-16 flex-col items-center justify-center rounded-xl border text-sm transition-colors ${
                    manuallyBlocked
                      ? "border-red-200 bg-red-50 text-red-700 font-bold"
                      : confirmedBooked
                        ? "cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-500 font-bold"
                        : count
                          ? "border-brand-200 bg-brand-50 text-brand-700 font-bold hover:bg-brand-100"
                          : "border-neutral-100 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {day}
                  {manuallyBlocked && <span className="mt-0.5 text-[10px] font-semibold">Blocked</span>}
                  {confirmedBooked && <span className="mt-0.5 text-[10px] font-semibold">Booked</span>}
                  {!manuallyBlocked && !confirmedBooked && count ? (
                    <span className="mt-0.5 text-[10px] font-semibold">{count} booking{count > 1 ? "s" : ""}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
