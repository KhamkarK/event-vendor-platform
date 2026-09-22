import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, LayoutDashboard, ShieldCheck, Sliders, Star } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import { listAllVendors, setCommission, setFeatured } from "@/features/admin/adminApi";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Vendors", to: "/admin/vendors", icon: ShieldCheck },
  { label: "Commissions", to: "/admin/commissions", icon: Sliders },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
];

export function CommissionSettings() {
  const queryClient = useQueryClient();
  const { data: vendors, isLoading } = useQuery({ queryKey: ["admin-vendors"], queryFn: listAllVendors });
  const [drafts, setDrafts] = useState<Record<number, number>>({});

  const commissionMutation = useMutation({
    mutationFn: ({ id, rate }: { id: number; rate: number }) => setCommission(id, rate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
      toast.success("Commission updated");
    },
  });

  const featuredMutation = useMutation({
    mutationFn: ({ id, featured }: { id: number; featured: boolean }) => setFeatured(id, featured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
      toast.success("Featured status updated");
    },
  });

  return (
    <div className="flex gap-8">
      <Sidebar title="Admin" links={sidebarLinks} />
      <div className="flex-1">
        <h1 className="text-2xl font-extrabold text-neutral-900">Commission & Featured Listings</h1>
        <p className="mt-1 text-sm text-neutral-500">Set the platform commission (5–15%) and promote featured vendors.</p>

        <div className="mt-6">
          {isLoading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-neutral-100" />
          ) : (
            <div className="flex flex-col gap-3">
              {(vendors ?? []).map((vendor) => (
                <Card key={vendor.id} className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-neutral-800">{vendor.business_name}</p>
                    {vendor.owner_full_name && (
                      <p className="text-xs text-neutral-400">Registered by {vendor.owner_full_name}</p>
                    )}
                    <p className="flex items-center gap-1 text-xs text-neutral-500">
                      <Star size={12} className="fill-accent-400 text-accent-400" /> {vendor.rating_avg.toFixed(1)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={15}
                        step={0.5}
                        value={drafts[vendor.id] ?? vendor.commission_rate}
                        onChange={(e) => setDrafts((d) => ({ ...d, [vendor.id]: Number(e.target.value) }))}
                        className="w-20 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
                      />
                      <span className="text-sm text-neutral-500">%</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => commissionMutation.mutate({ id: vendor.id, rate: drafts[vendor.id] ?? vendor.commission_rate })}
                      >
                        Save
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant={vendor.is_featured ? "primary" : "secondary"}
                      onClick={() => featuredMutation.mutate({ id: vendor.id, featured: !vendor.is_featured })}
                    >
                      {vendor.is_featured ? "Featured" : "Feature"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
