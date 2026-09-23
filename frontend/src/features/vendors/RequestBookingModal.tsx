import { useQuery } from "@tanstack/react-query";
import { CalendarX2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { listEvents } from "@/features/events/eventsApi";
import { createBooking, getVendorAvailability } from "@/features/vendors/vendorsApi";
import type { VendorDetail } from "@/types/vendor";

interface RequestBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorDetail;
}

/** Lets a customer request this vendor for one of their existing events. Events whose
 * date the vendor is unavailable for are disabled so the customer can't submit a
 * booking the backend would reject anyway. */
export function RequestBookingModal({ isOpen, onClose, vendor }: RequestBookingModalProps) {
  const navigate = useNavigate();
  const [eventId, setEventId] = useState<number | "">("");
  const [packageId, setPackageId] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

  const { data: events } = useQuery({ queryKey: ["my-events"], queryFn: listEvents, enabled: isOpen });
  const { data: unavailableDates } = useQuery({
    queryKey: ["vendor-availability", vendor.id],
    queryFn: () => getVendorAvailability(vendor.id),
    enabled: isOpen,
  });
  const unavailableSet = new Set(unavailableDates ?? []);

  const handleSubmit = async () => {
    if (!eventId) {
      toast.error("Choose an event to book this vendor for");
      return;
    }
    setSubmitting(true);
    try {
      await createBooking({ event_id: eventId, vendor_id: vendor.id, package_id: packageId || undefined });
      toast.success("Booking request sent to the vendor");
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail ?? "Could not send the booking request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book ${vendor.business_name}`}>
      {!events || events.length === 0 ? (
        <div className="text-sm text-neutral-600">
          <p>You don't have any events yet.</p>
          <Button
            className="mt-4"
            fullWidth
            onClick={() => {
              onClose();
              navigate("/events");
            }}
          >
            Create an event first
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Event</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
            >
              <option value="">Select an event…</option>
              {events.map((event) => {
                const unavailable = unavailableSet.has(event.event_date);
                return (
                  <option key={event.id} value={event.id} disabled={unavailable}>
                    {event.name} — {event.event_date}
                    {unavailable ? " (vendor unavailable)" : ""}
                  </option>
                );
              })}
            </select>
            {eventId && unavailableSet.has(events.find((e) => e.id === eventId)?.event_date ?? "") && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                <CalendarX2 className="h-3.5 w-3.5" /> This vendor isn't available on that date.
              </p>
            )}
          </div>

          {vendor.packages.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Package (optional)</label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value ? Number(e.target.value) : "")}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
              >
                <option value="">No specific package</option>
                {vendor.packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.title} — ₹{pkg.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button fullWidth isLoading={submitting} onClick={handleSubmit}>
            Send booking request
          </Button>
        </div>
      )}
    </Modal>
  );
}
