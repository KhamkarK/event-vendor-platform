import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarCheck, ClipboardList, IndianRupee, LayoutDashboard, Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import { addLedgerEntry, getMyLedger } from "@/features/vendorDashboard/vendorDashboardApi";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/vendor-dashboard", icon: LayoutDashboard, end: true },
  { label: "Calendar", to: "/vendor-dashboard/calendar", icon: CalendarCheck },
  { label: "Quotations", to: "/vendor-dashboard/quotations", icon: ClipboardList },
  { label: "Ledger", to: "/vendor-dashboard/ledger", icon: Wallet },
];

const schema = z.object({
  entry_type: z.enum(["credit", "debit"]),
  amount: z.coerce.number().positive("Enter a valid amount"),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function LedgerPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const { data: ledger, isLoading } = useQuery({ queryKey: ["ledger"], queryFn: getMyLedger });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { entry_type: "credit" } });

  const mutation = useMutation({
    mutationFn: addLedgerEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
      toast.success("Ledger entry added");
      reset();
      setModalOpen(false);
    },
  });

  return (
    <div className="flex gap-8">
      <Sidebar title="Vendor" links={sidebarLinks} />
      <div className="flex-1">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-900">Khatabook Ledger</h1>
            <p className="mt-1 text-sm text-neutral-500">Track customer payments, dues, and invoices.</p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Add entry
          </Button>
        </div>

        {isLoading || !ledger ? (
          <div className="h-40 animate-pulse rounded-2xl bg-neutral-100" />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="border-l-4 border-l-emerald-400">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  <TrendingUp size={14} className="text-emerald-500" /> Total credit
                </p>
                <p className="mt-1 text-2xl font-extrabold text-neutral-900">₹{ledger.total_credit.toLocaleString()}</p>
              </Card>
              <Card className="border-l-4 border-l-red-400">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  <TrendingDown size={14} className="text-red-500" /> Total debit
                </p>
                <p className="mt-1 text-2xl font-extrabold text-neutral-900">₹{ledger.total_debit.toLocaleString()}</p>
              </Card>
              <Card className="border-l-4 border-l-brand-400">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  <IndianRupee size={14} className="text-brand-500" /> Pending dues
                </p>
                <p className="mt-1 text-2xl font-extrabold text-neutral-900">₹{ledger.pending_dues.toLocaleString()}</p>
              </Card>
            </div>

            <h2 className="mb-3 mt-8 text-lg font-bold text-neutral-900">Recent entries</h2>
            {ledger.entries.length === 0 ? (
              <p className="text-sm text-neutral-500">No entries yet — record your first payment.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {ledger.entries.map((entry, idx) => (
                  <motion.div key={entry.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                    <Card className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${
                            entry.entry_type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                          }`}
                        >
                          {entry.entry_type === "credit" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-neutral-800">{entry.description ?? "No description"}</p>
                          <p className="text-xs text-neutral-400">{new Date(entry.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-bold ${entry.entry_type === "credit" ? "text-emerald-600" : "text-red-600"}`}>
                        {entry.entry_type === "credit" ? "+" : "-"}₹{entry.amount.toLocaleString()}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add ledger entry">
          <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              {(["credit", "debit"] as const).map((type) => (
                <label
                  key={type}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 p-3 text-sm font-medium capitalize has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50"
                >
                  <input type="radio" value={type} {...register("entry_type")} className="accent-brand-500" />
                  {type}
                </label>
              ))}
            </div>
            <Input label="Amount (₹)" type="number" step="0.01" error={errors.amount?.message} {...register("amount")} />
            <Input label="Description (optional)" placeholder="Advance payment for booking #4" {...register("description")} />
            <Button type="submit" isLoading={isSubmitting} fullWidth>
              Save entry
            </Button>
          </form>
        </Modal>
      </div>
    </div>
  );
}
