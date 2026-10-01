import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Receipt } from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { listEvents } from "@/features/events/eventsApi";
import { PrimeUpsell } from "@/features/expenses/ExpensesPage";
import { useAuthStore } from "@/store/authStore";

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
            <motion.div key={event.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
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
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
