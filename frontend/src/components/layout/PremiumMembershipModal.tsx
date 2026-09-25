import { useState } from "react";
import { Check, Crown, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { requestPremiumMembership } from "@/features/auth/authApi";
import { useAuthStore } from "@/store/authStore";

const PREMIUM_PRICE = 2999;
const COUPON_CODE = "EventKarma";

interface PremiumMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Shared coupon/submit body for the Premium Membership request — used by
 * both the mobile centered Modal (PremiumMembershipModal, below) and the
 * desktop anchored dropdown (PremiumMembershipDropdown). Confirming here only
 * records a request — no payment is actually charged, coupon or not — an
 * admin still has to drag the vendor into "Premium" (see
 * AdminService.set_featured / VendorApprovalPage.tsx's "Premium Vendors"
 * board) to activate it. */
export function PremiumMembershipBody() {
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
      const updated = await requestPremiumMembership();
      updateUser(updated);
      toast.success("Premium membership request submitted!");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail ?? "Could not submit your request");
    } finally {
      setSubmitting(false);
    }
  };

  const pending = !!user?.vendor_profile?.featured_requested && !user?.vendor_profile?.is_featured;

  return (
    <>
      <div className="flex items-start gap-3 rounded-xl bg-accent-50 p-3 text-sm text-accent-700">
        <Sparkles size={16} className="mt-0.5 shrink-0" />
        <p>
          Become a preferred vendor, recommended to customers across all categories. More visibility means more
          bookings and reviews over time.
        </p>
      </div>

      {pending ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-neutral-200 p-4 text-sm text-neutral-600">
          <Crown size={16} className="text-accent-500" />
          Your Premium membership request is pending admin approval.
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-baseline gap-2">
            {couponApplied ? (
              <>
                <span className="text-2xl font-extrabold text-neutral-900">₹0</span>
                <span className="text-sm text-neutral-400 line-through">₹{PREMIUM_PRICE}</span>
              </>
            ) : (
              <span className="text-2xl font-extrabold text-neutral-900">₹{PREMIUM_PRICE}</span>
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
            Your Premium membership request will be reviewed and activated by our team.
          </p>
        </>
      )}
    </>
  );
}

/** Mobile presentation: the shared centered Modal. See PremiumMembershipDropdown
 * for the desktop tab's anchored-below-the-tab presentation of the same body. */
export function PremiumMembershipModal({ isOpen, onClose }: PremiumMembershipModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Premium Membership" maxWidthClassName="max-w-sm">
      <PremiumMembershipBody />
    </Modal>
  );
}
