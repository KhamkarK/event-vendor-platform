import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Plus, Receipt } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { RangoliLoadingBlock } from "@/components/common/RangoliSpinner";
import { PrimeMembershipModal } from "@/components/layout/PrimeMembershipModal";
import { getBudgetSummary } from "@/features/budget/budgetApi";
import { addExpense, listExpenses } from "@/features/expenses/expensesApi";
import { getEvent } from "@/features/events/eventsApi";
import { useAuthStore } from "@/store/authStore";

const schema = z.object({
  budget_allocation_id: z.coerce.number({ invalid_type_error: "Pick a category" }).positive("Pick a category"),
  description: z.string().min(1, "Required").max(255),
  amount: z.coerce.number({ invalid_type_error: "Enter an amount" }).positive("Must be greater than 0"),
});
type FormValues = z.infer<typeof schema>;

/** Prime-only feature: a non-Prime customer who opens this page sees an
 * upsell instead of the expense log (see app/api/v1/expenses.py::require_prime_customer
 * for the matching backend enforcement — this page isn't the only gate). */
export function PrimeUpsell() {
  const navigate = useNavigate();
  const [showPrimeModal, setShowPrimeModal] = useState(false);

  return (
    <div className="mx-auto max-w-lg">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-800"
      >
        <ArrowLeft size={15} /> Back
      </button>
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Crown size={22} />
        </span>
        <h2 className="text-lg font-bold text-neutral-900">Expense tracking is a Prime feature</h2>
        <p className="max-w-sm text-sm text-neutral-500">
          Take Prime Membership to log itemized expenses against your event&apos;s budget categories and see exactly
          how much you&apos;ve spent.
        </p>
        <Button onClick={() => setShowPrimeModal(true)} className="mt-2">
          <Crown size={15} /> Take Prime Membership
        </Button>
      </Card>
      <PrimeMembershipModal isOpen={showPrimeModal} onClose={() => setShowPrimeModal(false)} />
    </div>
  );
}

export function ExpensesPage() {
  const { user } = useAuthStore();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const id = Number(eventId);
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  const isPrime = !!user?.is_prime;

  const { data: event } = useQuery({ queryKey: ["event", id], queryFn: () => getEvent(id), enabled: !!id && isPrime });
  const { data: budget } = useQuery({
    queryKey: ["budget", id],
    queryFn: () => getBudgetSummary(id),
    enabled: !!id && isPrime,
  });
  const { data: summary, isLoading } = useQuery({
    queryKey: ["expenses", id],
    queryFn: () => listExpenses(id),
    enabled: !!id && isPrime,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => addExpense(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", id] });
      queryClient.invalidateQueries({ queryKey: ["budget", id] });
      toast.success("Expense added");
      reset();
      setShowAddModal(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? "Could not add expense");
    },
  });

  if (!isPrime) return <PrimeUpsell />;

  if (isLoading || !event || !budget) {
    return <RangoliLoadingBlock label="Loading expenses…" className="h-64" />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate(`/events/${id}/budget`)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-800"
      >
        <ArrowLeft size={15} /> Back to budget
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Expenses — {event.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">Log what you&apos;ve actually spent, category by category.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add expense
        </Button>
      </div>

      <Card className="mb-6 bg-brand-gradient text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Total spent on this event</p>
        <p className="mt-1 text-2xl font-extrabold">₹{summary?.total_spent.toLocaleString() ?? 0}</p>
      </Card>

      {!summary || summary.expenses.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-neutral-200 text-sm text-neutral-400">
          No expenses logged yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {summary.expenses.map((expense, idx) => (
            <motion.div key={expense.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}>
              <Card className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Receipt size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{expense.description}</p>
                    <p className="text-xs text-neutral-400">
                      {expense.category_name ?? "Uncategorized"} · {new Date(expense.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-neutral-800">₹{expense.amount.toLocaleString()}</span>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add expense">
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-600">Category head</label>
            <select
              {...register("budget_allocation_id")}
              defaultValue=""
              className="rounded-xl border border-neutral-200 p-3 text-sm text-neutral-800 focus:border-brand-400 focus:outline-none"
            >
              <option value="" disabled>
                Select a category
              </option>
              {budget.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.budget_allocation_id && (
              <p className="text-xs font-medium text-red-500">{errors.budget_allocation_id.message}</p>
            )}
          </div>
          <Input label="Description" placeholder="Flower decoration for stage" error={errors.description?.message} {...register("description")} />
          <Input
            label="Amount"
            type="number"
            step="0.01"
            placeholder="5000"
            error={errors.amount?.message}
            {...register("amount")}
          />
          <Button type="submit" isLoading={isSubmitting} fullWidth>
            Save expense
          </Button>
        </form>
      </Modal>
    </div>
  );
}
