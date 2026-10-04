import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart3, KeyRound, LayoutDashboard, Mail, Megaphone, Phone, Search, ShieldCheck, Sliders, Store, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { MehendiCorner } from "@/assets/MehendiCorner";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import { listAllVendors, listCustomers, resetCustomerPassword, resetVendorPassword } from "@/features/admin/adminApi";
import type { User, VendorProfile } from "@/types/user";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Vendors", to: "/admin/vendors", icon: ShieldCheck },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Commissions", to: "/admin/commissions", icon: Sliders },
  { label: "Advertisements", to: "/admin/advertisements", icon: Megaphone },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Reset Passwords", to: "/admin/reset-password", icon: KeyRound },
];

type Tab = "vendor" | "customer";

const schema = z
  .object({
    new_password: z.string().min(8, "Must be at least 8 characters"),
    confirm_password: z.string().min(8, "Must be at least 8 characters"),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
type FormValues = z.infer<typeof schema>;

type Target = { kind: Tab; id: number; name: string };

export function ResetPasswordPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("vendor");
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<Target | null>(null);

  const { data: vendors, isLoading: vendorsLoading } = useQuery({ queryKey: ["admin-vendors"], queryFn: listAllVendors });
  const { data: customers, isLoading: customersLoading } = useQuery({ queryKey: ["admin-customers"], queryFn: listCustomers });

  const filteredVendors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vendors ?? [];
    return (vendors ?? []).filter((v: VendorProfile) =>
      [v.business_name, v.owner_full_name, v.owner_username].some((field) => field?.toLowerCase().includes(q))
    );
  }, [vendors, search]);

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers ?? [];
    return (customers ?? []).filter((c: User) =>
      [c.full_name, c.username, c.email].some((field) => field?.toLowerCase().includes(q))
    );
  }, [customers, search]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation<User | VendorProfile, any, { kind: Tab; id: number; new_password: string }>({
    mutationFn: ({ kind, id, new_password }) =>
      kind === "vendor" ? resetVendorPassword(id, new_password) : resetCustomerPassword(id, new_password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      toast.success(`Password reset for ${target?.name}`);
      reset();
      setTarget(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? "Could not reset password");
    },
  });

  const isLoading = tab === "vendor" ? vendorsLoading : customersLoading;
  const rows = tab === "vendor" ? filteredVendors : filteredCustomers;

  return (
    <div className="flex gap-8">
      <Sidebar title="Admin" links={sidebarLinks} />
      <div className="flex-1">
        <div className="relative">
          <MehendiCorner className="pointer-events-none absolute -right-1 -top-2 h-10 w-10 text-brand-200" />
          <h1 className="text-2xl font-extrabold text-neutral-900">Reset Passwords</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Search for a vendor or customer and set a new password for their account directly.
          </p>
        </div>

        <div className="mt-6 flex gap-2">
          {(["vendor", "customer"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setSearch("");
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                tab === t ? "bg-brand-500 text-white shadow-glow" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {t}s
            </button>
          ))}
        </div>

        <div className="relative mt-4 max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "vendor" ? "Search by business or owner name…" : "Search by name, username, or email…"}
            className="w-full rounded-xl border border-neutral-200 py-2.5 pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <RangoliSpinner label={`Loading ${tab}s…`} />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-neutral-200 text-sm text-neutral-400">
              No {tab}s match your search.
            </div>
          ) : tab === "vendor" ? (
            filteredVendors.map((vendor: VendorProfile, idx: number) => (
              <motion.div key={vendor.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}>
                <Card className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                      <Store size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{vendor.business_name}</p>
                      <p className="text-xs text-neutral-400">
                        {vendor.owner_full_name} · @{vendor.owner_username}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => setTarget({ kind: "vendor", id: vendor.id, name: vendor.business_name })}
                  >
                    <KeyRound size={14} /> Reset password
                  </Button>
                </Card>
              </motion.div>
            ))
          ) : (
            filteredCustomers.map((customer: User, idx: number) => (
              <motion.div key={customer.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}>
                <Card className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Users size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{customer.full_name}</p>
                      <p className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                        <span>@{customer.username}</span>
                        {customer.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={11} /> {customer.email}
                          </span>
                        )}
                        {customer.mobile && (
                          <span className="flex items-center gap-1">
                            <Phone size={11} /> {customer.mobile}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => setTarget({ kind: "customer", id: customer.id, name: customer.full_name })}
                  >
                    <KeyRound size={14} /> Reset password
                  </Button>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        <Modal isOpen={!!target} onClose={() => setTarget(null)} title={`Reset password for ${target?.name ?? ""}`}>
          <form
            onSubmit={handleSubmit((values) => {
              if (!target) return;
              mutation.mutate({ kind: target.kind, id: target.id, new_password: values.new_password });
            })}
            className="flex flex-col gap-4"
          >
            <Input
              label="New password"
              type="password"
              placeholder="••••••••"
              error={errors.new_password?.message}
              {...register("new_password")}
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              error={errors.confirm_password?.message}
              {...register("confirm_password")}
            />
            <Button type="submit" isLoading={isSubmitting} fullWidth>
              Set new password
            </Button>
          </form>
        </Modal>
      </div>
    </div>
  );
}
