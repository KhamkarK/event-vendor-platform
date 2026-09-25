import { Building2, Mail, MapPin, Phone, ShieldCheck, Star, User as UserIcon } from "lucide-react";

import { Modal } from "@/components/common/Modal";
import type { User } from "@/types/user";

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-400">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{label}</p>
        <p className="truncate text-sm font-medium text-neutral-800">{value}</p>
      </div>
    </div>
  );
}

/** Everything the person entered at registration — the account fields every
 * role has, plus the full vendor-profile block for vendors. Pulled straight
 * from the already-loaded auth user, no extra API call. Shared by the mobile
 * AccountDetailsModal (below) and the desktop AccountDetailsDropdown. */
export function AccountDetailsContent({ user }: { user: User }) {
  const profile = user.vendor_profile;

  return (
    <>
      <div className="divide-y divide-neutral-100">
        <Row icon={<UserIcon size={15} />} label="Full name" value={user.full_name} />
        <Row icon={<UserIcon size={15} />} label="Username" value={user.username} />
        <Row icon={<Mail size={15} />} label="Email" value={user.email} />
        <Row icon={<Phone size={15} />} label="Mobile" value={user.mobile} />
        <Row
          icon={<ShieldCheck size={15} />}
          label="Member since"
          value={new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        />
      </div>

      {profile && (
        <>
          <p className="mb-1 mt-5 text-xs font-bold uppercase tracking-wider text-neutral-400">Business details</p>
          <div className="divide-y divide-neutral-100">
            <Row icon={<Building2 size={15} />} label="Business name" value={profile.business_name} />
            <Row icon={<Building2 size={15} />} label="Category" value={profile.category} />
            <Row icon={<MapPin size={15} />} label="Location" value={profile.location} />
            <Row icon={<UserIcon size={15} />} label="Description" value={profile.description} />
            <Row
              icon={<Star size={15} />}
              label="Rating"
              value={`${profile.rating_avg.toFixed(1)} (${profile.rating_count} review${profile.rating_count === 1 ? "" : "s"})`}
            />
            <Row icon={<ShieldCheck size={15} />} label="Commission rate" value={`${profile.commission_rate}%`} />
            <Row
              icon={<ShieldCheck size={15} />}
              label="Approval status"
              value={profile.is_blocked ? "Blocked" : profile.is_approved ? "Approved" : "Pending approval"}
            />
          </div>
        </>
      )}
    </>
  );
}

/** Mobile presentation of the account chip's details: the shared Modal
 * (centered dialog), used by the hamburger-menu trigger. See
 * AccountDetailsDropdown for the desktop chip's anchored-below-the-button
 * presentation of the same content. */
export function AccountDetailsModal({ isOpen, onClose, user }: AccountDetailsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your details" maxWidthClassName="max-w-md">
      <AccountDetailsContent user={user} />
    </Modal>
  );
}
