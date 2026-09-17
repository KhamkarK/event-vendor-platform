import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Columns3, LayoutList, Package, Store } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { listEventBookings } from "@/features/events/bookingsApi";
import { getEvent } from "@/features/events/eventsApi";
import type { Booking } from "@/types/booking";

const statusTone: Record<Booking["status"], string> = {
  interested: "bg-neutral-100 text-neutral-600",
  quote_requested: "bg-amber-50 text-amber-700",
  quoted: "bg-blue-50 text-blue-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  completed: "bg-purple-50 text-purple-700",
  cancelled: "bg-red-50 text-red-700",
};

function latestQuotationAmount(booking: Booking): number | null {
  if (!booking.quotations.length) return null;
  return [...booking.quotations].sort((a, b) => b.created_at.localeCompare(a.created_at))[0].amount;
}

export function EventBookingsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const id = Number(eventId);
  const [view, setView] = useState<"cards" | "compare">("cards");

  const { data: event } = useQuery({ queryKey: ["event", id], queryFn: () => getEvent(id), enabled: !!id });
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["event-bookings", id],
    queryFn: () => listEventBookings(id),
    enabled: !!id,
  });

  const withQuotations = useMemo(() => (bookings ?? []).filter((b) => b.quotations.length > 0), [bookings]);
  const canCompare = withQuotations.length >= 2;

  return (
    <div className="mx-auto max-w-4xl">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-800">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">{event ? `${event.name} — Bookings` : "Bookings"}</h1>
          <p className="mt-1 text-sm text-neutral-500">Every vendor you&apos;ve reached out to for this event, in one place.</p>
        </div>
        {canCompare && (
          <div className="flex items-center gap-1 rounded-xl border border-neutral-200 p-1">
            <button
              onClick={() => setView("cards")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                view === "cards" ? "bg-brand-50 text-brand-700" : "text-neutral-500"
              }`}
            >
              <LayoutList size={14} /> Cards
            </button>
            <button
              onClick={() => setView("compare")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                view === "compare" ? "bg-brand-50 text-brand-700" : "text-neutral-500"
              }`}
            >
              <Columns3 size={14} /> Compare quotations
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <RangoliSpinner label="Loading bookings…" />
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No vendor bookings yet"
          description="Reach out to vendors from the marketplace and they'll show up here."
          action={
            <Link to="/vendors">
              <span className="text-sm font-semibold text-brand-600 hover:underline">Browse vendors</span>
            </Link>
          }
        />
      ) : view === "compare" ? (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-xs font-bold uppercase tracking-wide text-neutral-400">
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Quoted amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {withQuotations
                .slice()
                .sort((a, b) => (latestQuotationAmount(a) ?? Infinity) - (latestQuotationAmount(b) ?? Infinity))
                .map((booking, idx) => {
                  const amount = latestQuotationAmount(booking);
                  return (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`border-b border-neutral-50 last:border-0 ${idx === 0 ? "bg-emerald-50/40" : ""}`}
                    >
                      <td className="px-4 py-3 font-semibold text-neutral-800">
                        {booking.vendor_name ?? `Vendor #${booking.vendor_id}`}
                        {idx === 0 && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Lowest</span>}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{booking.package_title ?? "—"}</td>
                      <td className="px-4 py-3 font-bold text-neutral-900">{amount !== null ? `₹${amount.toLocaleString()}` : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusTone[booking.status]}`}>
                          {booking.status.replace("_", " ")}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((booking, idx) => {
            const amount = latestQuotationAmount(booking);
            return (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link to={`/vendors/${booking.vendor_id}`} className="font-semibold text-neutral-800 hover:text-brand-600">
                        {booking.vendor_name ?? `Vendor #${booking.vendor_id}`}
                      </Link>
                    </div>
                    {booking.package_title && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                        <Package size={12} /> {booking.package_title}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {amount !== null && <span className="text-sm font-bold text-neutral-900">₹{amount.toLocaleString()}</span>}
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusTone[booking.status]}`}>
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
