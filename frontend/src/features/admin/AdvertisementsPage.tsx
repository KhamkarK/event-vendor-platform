import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  ImagePlus,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  ShieldCheck,
  Sliders,
  Trash2,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { EmptyState } from "@/components/common/EmptyState";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import { getActiveAdvertisement, removeActiveAdvertisement, uploadAdvertisement } from "@/features/advertisements/advertisementsApi";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Vendors", to: "/admin/vendors", icon: ShieldCheck },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Commissions", to: "/admin/commissions", icon: Sliders },
  { label: "Advertisements", to: "/admin/advertisements", icon: Megaphone },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Reset Passwords", to: "/admin/reset-password", icon: KeyRound },
];

export function AdvertisementsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState("");

  const { data: ad, isLoading } = useQuery({ queryKey: ["active-advertisement"], queryFn: getActiveAdvertisement });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["active-advertisement"] });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAdvertisement(file, linkUrl || undefined),
    onSuccess: () => {
      invalidate();
      setLinkUrl("");
      toast.success("Advertisement is now live on every page");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? "Couldn't upload the advertisement");
    },
    onSettled: () => {
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeActiveAdvertisement,
    onSuccess: () => {
      invalidate();
      toast.success("Advertisement removed");
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    const file = files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  return (
    <div className="flex gap-8">
      <Sidebar title="Admin" links={sidebarLinks} />
      <div className="flex-1">
        <h1 className="text-2xl font-extrabold text-neutral-900">Advertisements</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Upload one image or video to show as a banner below the navbar on every page, for every customer and vendor.
          Uploading a new one replaces whatever is currently live.
        </p>

        {isLoading ? (
          <div className="mt-10 flex justify-center">
            <RangoliSpinner label="Loading…" />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6 sm:max-w-xl">
            <Card>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">Currently live</p>
              {!ad ? (
                <EmptyState icon={Megaphone} title="No advertisement is live" description="Upload an image or video below to start showing one." />
              ) : (
                <div>
                  <div className="overflow-hidden rounded-xl border border-neutral-200">
                    {ad.media_type === "video" ? (
                      <video src={ad.media_url} controls muted className="max-h-56 w-full object-contain" />
                    ) : (
                      <img src={ad.media_url} alt="Current advertisement" className="max-h-56 w-full object-contain" />
                    )}
                  </div>
                  {ad.link_url && <p className="mt-2 truncate text-xs text-neutral-500">Links to: {ad.link_url}</p>}
                  <Button
                    variant="danger"
                    size="sm"
                    className="mt-3"
                    onClick={() => removeMutation.mutate()}
                    isLoading={removeMutation.isPending}
                  >
                    <Trash2 size={14} /> Remove advertisement
                  </Button>
                </div>
              )}
            </Card>

            <Card>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">Upload new advertisement</p>
              <Input
                label="Link URL (optional)"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <p className="mb-1.5 mt-4 text-sm font-medium text-neutral-700">Image or video</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-300 py-8 text-neutral-400 transition-colors hover:border-brand-300 hover:text-brand-500 disabled:opacity-50"
              >
                {uploadMutation.isPending ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-500" />
                ) : (
                  <>
                    <ImagePlus size={22} />
                    <span className="text-xs font-medium">Click to choose a file</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              <p className="mt-1.5 text-xs text-neutral-400">JPEG, PNG, WEBP, GIF, MP4, or WEBM. Uploading replaces the current advertisement.</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
