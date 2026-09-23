import { CalendarX2 } from "lucide-react";

interface BlockedDatesListProps {
  dates: string[];
  emptyLabel?: string;
}

/** Read-only chip list of a vendor's unavailable dates (manually blocked + already
 * confirmed-booked) — shared by the customer-facing vendor detail page and the
 * admin Vendor Management "view availability" modal. */
export function BlockedDatesList({ dates, emptyLabel = "No unavailable dates right now" }: BlockedDatesListProps) {
  if (dates.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-neutral-500">
        <CalendarX2 className="h-4 w-4" /> {emptyLabel}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {dates.map((date) => (
        <span
          key={date}
          className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
        >
          {new Date(`${date}T00:00:00`).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ))}
    </div>
  );
}
