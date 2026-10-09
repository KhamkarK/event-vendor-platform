import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
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
import {
  deleteAdvertisement,
  getAllAdvertisements,
  moveAdvertisement,
  updateAdvertisement,
  uploadAdvertisement,
} from "@/features/advertisements/advertisementsApi";
import type { Advertisement } from "@/types/advertisement";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Vendors", to: "/admin/vendors", icon: ShieldCheck },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Commissions", to: "/admin/commissions", icon: Sliders },
  { label: "Advertisements", to: "/admin/advertisements", icon: Megaphone },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Reset Passwords", to: "/admin/reset-password", icon: KeyRound },
];

const ADVERTISEMENTS_QUERY_KEY = ["admin-advertisements"];

function BannerRow({ ad, position, total }: { ad: Advertisement; position: number; total: number }) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ADVERTISEMENTS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["active-advertisements"] });
  };

  const toggleMutation = useMutation({
    mutationFn: () => updateAdvertisement(ad.id, { is_active: !ad.is_active }),
    onSuccess: () => {
      invalidate();
      toast.success(ad.is_active ? "Banner paused" : "Banner is now live in the rotation");
    },
  });

  const moveMutation = useMutation({
    mutationFn: (direction: "up" | "down") => moveAdvertisement(ad.id, direction),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdvertisement(ad.id),
    onSuccess: () => {
      invalidate();
      toast.success("Banner removed");
    },
  });

  return (
    <div className="flex items-center gap-4 rounded-xl border border-neutral-200 p-3">
      <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {ad.media_type === "video" ? (
          <video src={ad.media_url} muted className="h-full w-full object-cover" />
        ) : (
          <img src={ad.media_url} alt="Banner" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900">
          Banner {position} of {total}
        </p>
        <p className="truncate text-xs text-neutral-500">{ad.link_url ? `Links to: ${ad.link_url}` : "No link"}</p>
        <span
          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            ad.is_active ? "bg-emerald-50 text-emerald-600" : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {ad.is_active ? "Live" : "Paused"}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => moveMutation.mutate("up")}
          disabled={position === 1}
          isLoading={moveMutation.isPending && moveMutation.variables === "up"}
          aria-label="Move earlier in sequence"
        >
          <ArrowUp size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => moveMutation.mutate("down")}
          disabled={position === total}
          isLoading={moveMutation.isPending && moveMutation.variables === "down"}
          aria-label="Move later in sequence"
        >
          <ArrowDown size={14} />
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleMutation.mutate()} isLoading={toggleMutation.isPending}>
          {ad.is_active ? "Pause" : "Resume"}
        </Button>
        <Button variant="danger" size="sm" onClick={() => deleteMutation.mutate()} isLoading={deleteMutation.isPending}>
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

export function AdvertisementsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState("");

  const { data: ads, isLoading } = useQuery({ queryKey: ADVERTISEMENTS_QUERY_KEY, queryFn: getAllAdvertisements });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ADVERTISEMENTS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["active-advertisements"] });
  };

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAdvertisement(file, linkUrl || undefined),
    onSuccess: () => {
      invalidate();
      setLinkUrl("");
      toast.success("Banner added to the running sequence");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? "Couldn't upload the banner");
    },
    onSettled: () => {
      if (fileInputRef.current) fileInputRef.current.value = "";
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
          Upload one or more images or videos to run as a rotating banner below the navbar on every page, for every
          customer and vendor. Each banner is cropped to the same fixed-size slot, so adding more never resizes or
          covers the page — they just take turns, in the order below.
        </p>

        {isLoading ? (
          <div className="mt-10 flex justify-center">
            <RangoliSpinner label="Loading…" />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6 sm:max-w-2xl">
            <Card>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Running sequence ({ads?.length ?? 0})
              </p>
              {!ads || ads.length === 0 ? (
                <EmptyState
                  icon={Megaphone}
                  title="No banners yet"
                  description="Upload an image or video below to start the running banner."
                />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {ads.map((ad, i) => (
                    <BannerRow key={ad.id} ad={ad} position={i + 1} total={ads.length} />
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">Add a new banner</p>
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
              <p className="mt-1.5 text-xs text-neutral-400">
                JPEG, PNG, WEBP, GIF, MP4, or WEBM. Added to the end of the running sequence — it won't replace the
                others.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
