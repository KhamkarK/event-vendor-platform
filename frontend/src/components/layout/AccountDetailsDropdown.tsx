import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { AccountDetailsContent } from "@/components/layout/AccountDetailsModal";
import type { User } from "@/types/user";

interface AccountDetailsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

/** Desktop presentation of the account chip's details: an anchored dropdown
 * below the chip. The caller wraps the trigger button and this component in
 * a shared `relative` container with its own outside-click-to-close ref,
 * matching the pattern already used by the Event Types dropdown
 * (frontend/src/features/events/EventTypesPage.tsx). See AccountDetailsModal
 * for the mobile (centered) presentation of the same content. */
export function AccountDetailsDropdown({ isOpen, onClose, user }: AccountDetailsDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="absolute right-0 top-full z-50 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-5 shadow-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-neutral-900">Your details</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <AccountDetailsContent user={user} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
