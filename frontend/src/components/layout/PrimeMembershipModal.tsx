import { useState } from "react";
import { Check, Crown, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { requestPrimeMembership } from "@/features/auth/authApi";
import { useAuthStore } from "@/store/authStore";

const PRIME_PRICE = 199;
const COUPON_CODE = "EventKarma";

interface PrimeMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Customer self-service entry point for the admin-managed Prime tag (see
 * AdminService.set_customer_prime / CustomersPage.tsx). Confirming here only
 * records a request — no payment is actually charged, coupon or not — an
 * admin still has to drag the customer into "Prime Members" to activate it. */
export function PrimeMembershipModal({ isOpen, onClose }: PrimeMembershipModalProps) {
  const { user, updateUser } = useAuthStore();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const applyCoupon = () => {
    if (coupon.trim().toLowerCase() === COUPON_CODE.toLowerCase()) {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponApplied(false);
      setCouponError("Invalid coupon code");
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const updated = await requestPrimeMembership();
      updateUser(updated);
      toast.success("Prime membership request submitted!");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail ?? "Could not submit your request");
    } finally {
      setSubmitting(false);
    }
  };

  const pending = !!user?.prime_requested && !user?.is_prime;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Prime Membership" maxWidthClassName="max-w-sm">
      <div className="flex items-start gap-3 rounded-xl bg-accent-50 p-3 text-sm text-accent-700">
        <Sparkles size={16} className="mt-0.5 shrink-0" />
        <p>Get unlimited vendor details across all categories with Prime Membership.</p>
      </div>

      {pending ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-neutral-200 p-4 text-sm text-neutral-600">
          <Crown size={16} className="text-accent-500" />
          Your Prime membership request is pending admin approval.
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-baseline gap-2">
            {couponApplied ? (
              <>
                <span className="text-2xl font-extrabold text-neutral-900">₹0</span>
                <span className="text-sm text-neutral-400 line-through">₹{PRIME_PRICE}</span>
              </>
            ) : (
              <span className="text-2xl font-extrabold text-neutral-900">₹{PRIME_PRICE}</span>
            )}
          </div>

          <div className="mt-3">
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Have a coupon code?</label>
            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={(e) => {
                  setCoupon(e.target.value);
                  setCouponApplied(false);
                  setCouponError("");
                }}
                placeholder="Enter coupon code"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-all duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              />
              <Button type="button" variant="outline" size="sm" onClick={applyCoupon}>
                Apply
              </Button>
            </div>
            {couponApplied && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
                <Check size={12} /> Coupon applied
              </p>
            )}
            {couponError && <p className="mt-1.5 text-xs font-medium text-red-500">{couponError}</p>}
          </div>

          <Button onClick={handleConfirm} isLoading={submitting} fullWidth className="mt-5">
            Confirm request
          </Button>
          <p className="mt-2 text-center text-xs text-neutral-400">
            Your Prime membership request will be reviewed and activated by our team.
          </p>
        </>
      )}
    </Modal>
  );
}
