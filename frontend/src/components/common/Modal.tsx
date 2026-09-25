import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Tailwind max-width utility for the modal panel. Defaults to "max-w-lg". */
  maxWidthClassName?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidthClassName = "max-w-lg" }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className={`flex w-full ${maxWidthClassName} max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-2xl`}
          >
            <div className="mb-4 flex shrink-0 items-center justify-between">
              {title && <h3 className="text-lg font-bold text-neutral-900">{title}</h3>}
              <button
                onClick={onClose}
                className="ml-auto rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
