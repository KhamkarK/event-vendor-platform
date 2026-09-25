import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { PrimeMembershipBody } from "@/components/layout/PrimeMembershipModal";

interface PrimeMembershipDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Desktop presentation of the "Join Prime Membership" nav tab: an anchored
 * dropdown below the tab, matching AccountDetailsDropdown. The caller wraps
 * the trigger button and this component in a shared `relative` container
 * with its own outside-click-to-close ref. See PrimeMembershipModal for the
 * mobile (centered) presentation of the same body. */
export function PrimeMembershipDropdown({ isOpen, onClose }: PrimeMembershipDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="absolute left-0 top-full z-50 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-5 shadow-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-neutral-900">Join Prime Membership</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <PrimeMembershipBody />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
