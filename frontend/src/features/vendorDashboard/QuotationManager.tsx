import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, CheckCircle2, ClipboardList, LayoutDashboard, Wallet, XCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { PetalBurst } from "@/components/common/PetalBurst";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import { listVendorBookings, updateBookingStatus } from "@/features/vendorDashboard/vendorDashboardApi";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/vendor-dashboard", icon: LayoutDashboard, end: true },
  { label: "Calendar", to: "/vendor-dashboard/calendar", icon: CalendarCheck },
  { label: "Quotations", to: "/vendor-dashboard/quotations", icon: ClipboardList },
  { label: "Ledger", to: "/vendor-dashboard/ledger", icon: Wallet },
];

export function QuotationManager() {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading } = useQuery({ queryKey: ["vendor-bookings"], queryFn: listVendorBookings });
  const [showBurst, setShowBurst] = useState(false);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "confirmed" | "completed" | "cancelled" }) => updateBookingStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-bookings"] });
      toast.success("Booking updated");
      if (variables.status === "confirmed") setShowBurst(true);
    },
  });

  const requestedBookings = (bookings ?? []).filter((b) => ["interested", "quote_requested", "quoted"].includes(b.status));

  return (
    <div className="flex gap-8">
      <PetalBurst show={showBurst} onDone={() => setShowBurst(false)} />
      <Sidebar title="Vendor" links={sidebarLinks} />
      <div className="flex-1">
        <h1 className="text-2xl font-extrabold text-neutral-900">Quotations & Requests</h1>
        <p className="mt-1 text-sm text-neutral-500">Respond to interest and quotation requests from customers.</p>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <RangoliSpinner label="Loading requests…" />
            </div>
          ) : requestedBookings.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Nothing pending" description="New booking requests and quotations will show up here." />
          ) : (
            <div className="flex flex-col gap-3">
              {requestedBookings.map((booking) => (
                <Card key={booking.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Booking #{booking.id} — Event #{booking.event_id}</p>
                    <p className="text-xs capitalize text-neutral-500">Status: {booking.status.replace("_", " ")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => statusMutation.mutate({ id: booking.id, status: "confirmed" })}
                    >
                      <CheckCircle2 size={15} /> Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => statusMutation.mutate({ id: booking.id, status: "cancelled" })}
                    >
                      <XCircle size={15} /> Decline
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
