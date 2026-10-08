import { Building2, Link as LinkIcon, Mail, MapPin, Phone, ShieldCheck, Star, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { updateVendorProfile } from "@/features/auth/authApi";
import { useAuthStore } from "@/store/authStore";
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
const MAX_PROFILE_URLS = 3;

function ProfileUrlField({ profile }: { profile: NonNullable<User["vendor_profile"]> }) {
  const updateUser = useAuthStore((state) => state.updateUser);
  const savedUrls = profile.profile_urls ?? [];
  const [editing, setEditing] = useState(false);
  const [urls, setUrls] = useState<string[]>(savedUrls.length ? savedUrls : [""]);

  const mutation = useMutation({
    mutationFn: (cleaned: string[]) => updateVendorProfile({ profile_urls: cleaned }),
    onSuccess: (updated) => {
      updateUser({ vendor_profile: updated.vendor_profile });
      setUrls(updated.vendor_profile?.profile_urls?.length ? updated.vendor_profile.profile_urls : [""]);
      toast.success("Profile links updated");
      setEditing(false);
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Could not update profile links");
    },
  });

  const handleSave = () => {
    const cleaned = urls.map((url) => url.trim()).filter(Boolean);
    if (cleaned.some((url) => !/^https?:\/\//i.test(url))) {
      toast.error("Each link must start with http:// or https://");
      return;
    }
    mutation.mutate(cleaned);
  };

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-3 py-2">
        <Row
          icon={<LinkIcon size={15} />}
          label="Profile links (Instagram/website)"
          value={
            savedUrls.length
              ? savedUrls.map((url) => (
                  <span key={url} className="block truncate">
                    {url}
                  </span>
                ))
              : "Not set"
          }
        />
        <button onClick={() => setEditing(true)} className="mt-3 shrink-0 text-xs font-semibold text-brand-500 hover:underline">
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="py-2">
      <p className="mb-1.5 text-sm font-medium text-neutral-700">Profile links (Instagram/website) — up to {MAX_PROFILE_URLS}</p>
      <div className="flex flex-col gap-2">
        {urls.map((url, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                placeholder="https://instagram.com/yourbusiness"
                value={url}
                onChange={(e) => setUrls((current) => current.map((u, i) => (i === index ? e.target.value : u)))}
              />
            </div>
            {urls.length > 1 && (
              <button
                type="button"
                onClick={() => setUrls((current) => current.filter((_, i) => i !== index))}
                className="shrink-0 text-xs font-semibold text-red-500 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      {urls.length < MAX_PROFILE_URLS && (
        <button
          type="button"
          onClick={() => setUrls((current) => [...current, ""])}
          className="mt-2 text-xs font-semibold text-brand-500 hover:underline"
        >
          + Add another link
        </button>
      )}
      <div className="mt-3 flex gap-2">
        <Button type="button" isLoading={mutation.isPending} onClick={handleSave}>
          Save
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setUrls(savedUrls.length ? savedUrls : [""]);
            setEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

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
            <ProfileUrlField profile={profile} />
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
