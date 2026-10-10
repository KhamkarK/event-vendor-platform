import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, CalendarDays, CheckCircle2, MapPin, Receipt } from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { getBudgetSummary } from "@/features/budget/budgetApi";
import { listEvents } from "@/features/events/eventsApi";
import { PrimeUpsell } from "@/features/expenses/ExpensesPage";
import { useAuthStore } from "@/store/authStore";
import type { EventItem } from "@/types/event";

/** One event's card on the Expenses landing page. Fetches that event's own
 * budget summary (same endpoint the per-event Expenses/Budget pages use) so
 * the customer can see at a glance, before opening the event, how much
 * they've spent, how much is left, and whether they've gone over budget. */
function EventExpenseCard({ event, delay }: { event: EventItem; delay: number }) {
  const { data: budget } = useQuery({
    queryKey: ["budget", event.id],
    queryFn: () => getBudgetSummary(event.id),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Link to={`/events/${event.id}/expenses`}>
        <Card hoverLift className="h-full cursor-pointer">
          <h3 className="text-lg font-bold text-neutral-900">{event.name}</h3>
          <div className="mt-3 flex flex-col gap-1.5 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} /> {new Date(event.event_date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> {event.location}
            </span>
          </div>

          {budget && (
            <div className="mt-4 border-t border-neutral-100 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Spent</span>
                <span className="font-semibold text-neutral-900">₹{budget.total_spent.toLocaleString()}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-neutral-500">Remaining</span>
                <span className={`font-semibold ${budget.is_over_budget ? "text-red-600" : "text-neutral-900"}`}>
                  ₹{Math.abs(budget.remaining).toLocaleString()}
                </span>
              </div>
              <span
                className={`mt-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  budget.is_over_budget ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {budget.is_over_budget ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                {budget.is_over_budget ? "Over budget" : "Under budget"}
              </span>
            </div>
          )}
        </Card>
      </Link>
    </motion.div>
  );
}

/** Landing page for the global "Expenses" nav tab — a customer picks which
 * event to log expenses against here, then lands on the per-event
 * ExpensesPage (/events/:eventId/expenses). */
export function ExpensesLandingPage() {
  const { user } = useAuthStore();
  const isPrime = !!user?.is_prime;

  const { data: events, isLoading } = useQuery({ queryKey: ["events"], queryFn: listEvents, enabled: isPrime });

  if (!isPrime) return <PrimeUpsell />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-neutral-900">Expenses</h1>
        <p className="mt-1 text-sm text-neutral-500">Pick an event to log or review its expenses.</p>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <RangoliSpinner label="Loading your events…" />
        </div>
      ) : !events || events.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No events yet"
          description="Create an event first, then come back here to track its expenses."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, idx) => (
            <EventExpenseCard key={event.id} event={event} delay={idx * 0.05} />
          ))}
        </div>
      )}
    </div>
  );
}
