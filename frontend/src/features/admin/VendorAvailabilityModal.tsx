import { useQuery } from "@tanstack/react-query";

import { BlockedDatesList } from "@/components/common/BlockedDatesList";
import { Modal } from "@/components/common/Modal";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { getVendorAvailability } from "@/features/vendors/vendorsApi";
import type { VendorProfile } from "@/types/user";

interface VendorAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorProfile | null;
}

/** Admin-facing read-only view of a vendor's unavailable dates. Fetched on demand
 * (only while open) rather than eagerly for every vendor in the Kanban boards. */
export function VendorAvailabilityModal({ isOpen, onClose, vendor }: VendorAvailabilityModalProps) {
  const { data: unavailableDates, isLoading } = useQuery({
    queryKey: ["vendor-availability", vendor?.id],
    queryFn: () => getVendorAvailability(vendor!.id),
    enabled: isOpen && !!vendor,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={vendor ? `${vendor.business_name} — Availability` : "Availability"}>
      {isLoading ? (
        <div className="flex h-24 items-center justify-center">
          <RangoliSpinner label="Loading availability…" />
        </div>
      ) : (
        <BlockedDatesList dates={unavailableDates ?? []} />
      )}
    </Modal>
  );
}
