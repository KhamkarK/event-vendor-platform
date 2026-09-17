import { CalendarClock } from "lucide-react";

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** A small "N days to go" chip, tinted by urgency, shown wherever an event date appears. */
export function EventCountdownChip({ eventDate, className = "" }: { eventDate: string; className?: string }) {
  const days = daysUntil(eventDate);

  let label: string;
  let tone: string;
  if (days > 0) {
    label = `${days} day${days === 1 ? "" : "s"} to go`;
    tone = days <= 7 ? "bg-accent-100 text-accent-700" : "bg-brand-50 text-brand-600";
  } else if (days === 0) {
    label = "Today!";
    tone = "bg-accent-400 text-white";
  } else {
    label = "Completed";
    tone = "bg-neutral-100 text-neutral-500";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${tone} ${className}`}>
      <CalendarClock size={12} />
      {label}
    </span>
  );
}
