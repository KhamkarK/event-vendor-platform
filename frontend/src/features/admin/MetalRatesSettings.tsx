import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Coins, KeyRound, LayoutDashboard, Megaphone, ShieldCheck, Sliders, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import { getMetalRate, updateMetalRate } from "@/features/metalRates/metalRatesApi";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Service Providers", to: "/admin/vendors", icon: ShieldCheck },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Commissions", to: "/admin/commissions", icon: Sliders },
  { label: "Advertisements", to: "/admin/advertisements", icon: Megaphone },
  { label: "Metal Rates", to: "/admin/metal-rates", icon: Coins },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Reset Passwords", to: "/admin/reset-password", icon: KeyRound },
];

export function MetalRatesSettings() {
  const queryClient = useQueryClient();
  const { data: rate, isLoading } = useQuery({ queryKey: ["metal-rate"], queryFn: getMetalRate });
  const [gold, setGold] = useState("");
  const [silver, setSilver] = useState("");

  // Seed the form from whatever is currently saved, once it loads.
  useEffect(() => {
    if (!rate) return;
    setGold(rate.gold_rate_per_10g != null ? String(rate.gold_rate_per_10g) : "");
    setSilver(rate.silver_rate_per_kg != null ? String(rate.silver_rate_per_kg) : "");
  }, [rate]);

  const mutation = useMutation({
    mutationFn: () => updateMetalRate({ gold_rate_per_10g: Number(gold), silver_rate_per_kg: Number(silver) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metal-rate"] });
      toast.success("Rates updated");
    },
  });

  const goldValid = gold.trim() !== "" && Number(gold) >= 0 && !Number.isNaN(Number(gold));
  const silverValid = silver.trim() !== "" && Number(silver) >= 0 && !Number.isNaN(Number(silver));

  return (
    <div className="flex gap-8">
      <Sidebar title="Admin" links={sidebarLinks} />
      <div className="max-w-md flex-1">
        <h1 className="text-2xl font-extrabold text-neutral-900">Metal Rates</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Shown as a running strip on every page, to every vendor and customer.
        </p>

        <Card className="mt-6 flex flex-col gap-4">
          {isLoading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-neutral-100" />
          ) : (
            <>
              <Input
                label="Gold rate (₹ per 10g)"
                type="number"
                min={0}
                step="1"
                value={gold}
                onChange={(e) => setGold(e.target.value)}
                placeholder="e.g. 68500"
              />
              <Input
                label="Silver rate (₹ per kg)"
                type="number"
                min={0}
                step="1"
                value={silver}
                onChange={(e) => setSilver(e.target.value)}
                placeholder="e.g. 94200"
              />
              <Button
                onClick={() => mutation.mutate()}
                isLoading={mutation.isPending}
                disabled={!goldValid || !silverValid}
              >
                Save rates
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
