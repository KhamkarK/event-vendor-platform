import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";

interface BudgetOverageModalProps {
  isOpen: boolean;
  /** How much the pending change pushes total allocated past the total budget. */
  overage: number;
  /** The event's current total budget, before any increase. */
  currentBudget: number;
  isProcessing: boolean;
  onAdjustWithinBudget: () => void;
  onIncreaseBudget: () => void;
  onCancel: () => void;
}

/** Shown when a category's slider is dragged high enough to push total allocated
 * past the event's total budget. Lets the customer choose whether to trim other
 * categories to absorb the difference, or raise the total budget instead. */
export function BudgetOverageModal({
  isOpen,
  overage,
  currentBudget,
  isProcessing,
  onAdjustWithinBudget,
  onIncreaseBudget,
  onCancel,
}: BudgetOverageModalProps) {
  const newBudget = currentBudget + overage;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="You're over budget">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>
            This change puts you <span className="font-bold">₹{overage.toLocaleString()}</span> over your{" "}
            <span className="font-bold">₹{currentBudget.toLocaleString()}</span> budget. How would you like to handle it?
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Button fullWidth isLoading={isProcessing} onClick={onAdjustWithinBudget}>
            Adjust within existing budget
          </Button>
          <p className="-mt-1 px-1 text-xs text-neutral-500">
            We'll trim your other categories to make room, so your ₹{currentBudget.toLocaleString()} budget stays the same.
          </p>

          <Button fullWidth variant="outline" isLoading={isProcessing} onClick={onIncreaseBudget}>
            Increase budget to ₹{newBudget.toLocaleString()}
          </Button>
          <p className="-mt-1 px-1 text-xs text-neutral-500">Your other categories stay untouched.</p>
        </div>

        <Button fullWidth variant="ghost" disabled={isProcessing} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
