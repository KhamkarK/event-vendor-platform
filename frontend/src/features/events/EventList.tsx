import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Plus, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { EventCountdownChip } from "@/components/common/EventCountdownChip";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { listEvents } from "@/features/events/eventsApi";

const typeBadgeColor: Record<string, string> = {
  marriage: "bg-brand-50 text-brand-600",
  birthday: "bg-accent-100 text-accent-700",
  corporate: "bg-teal-50 text-teal-700",
};

export function EventList() {
  const { data: events, isLoading } = useQuery({ queryKey: ["events"], queryFn: listEvents });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">My Events</h1>
          <p className="mt-1 text-sm text-neutral-500">Track budgets and bookings across all your events.</p>
        </div>
        <Link to="/events/new">
          <Button>
            <Plus size={16} /> New event
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <RangoliSpinner label="Loading your events…" />
        </div>
      ) : !events || events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events yet"
          description="Create your first event to get auto-generated budget categories and vendor recommendations."
          action={
            <Link to="/events/new">
              <Button>
                <Plus size={16} /> Create your first event
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, idx) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Link to={`/events/${event.id}/budget`}>
                <Card hoverLift className="h-full cursor-pointer">
                  <div className="mb-3 flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${typeBadgeColor[event.event_type]}`}>
                      {event.event_type}
                    </span>
                    <EventCountdownChip eventDate={event.event_date} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900">{event.name}</h3>
                  <div className="mt-3 flex flex-col gap-1.5 text-sm text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} /> {new Date(event.event_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} /> {event.location}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-neutral-700">
                      <Wallet size={14} /> ₹{event.total_budget.toLocaleString()}
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
