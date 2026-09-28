import { DndContext, type DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardList, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import { MehendiCorner } from "@/assets/MehendiCorner";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { EventCountdownChip } from "@/components/common/EventCountdownChip";
import { RangoliLoadingBlock } from "@/components/common/RangoliSpinner";
import { BudgetCategoryCard } from "@/features/budget/BudgetCategoryCard";
import { BudgetOverageModal } from "@/features/budget/BudgetOverageModal";
import { getBudgetSummary, reorderAllocations, updateAllocation } from "@/features/budget/budgetApi";
import { getEvent, updateEvent } from "@/features/events/eventsApi";
import type { BudgetAllocation } from "@/types/event";

export function BudgetAllocator() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const id = Number(eventId);
  const queryClient = useQueryClient();

  const { data: event } = useQuery({ queryKey: ["event", id], queryFn: () => getEvent(id), enabled: !!id });
  const { data: summary, isLoading } = useQuery({
    queryKey: ["budget", id],
    queryFn: () => getBudgetSummary(id),
    enabled: !!id,
  });

  const [items, setItems] = useState<BudgetAllocation[]>([]);
  const [pendingChangeId, setPendingChangeId] = useState<number | null>(null);
  const [overagePrompt, setOveragePrompt] = useState<{ overage: number } | null>(null);
  const [resolvingOverage, setResolvingOverage] = useState(false);

  useEffect(() => {
    if (summary) setItems(summary.categories);
  }, [summary]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const totalAllocated = items.reduce((sum, item) => sum + item.allocated_amount, 0);
  const totalBudget = event?.total_budget ?? summary?.total_budget ?? 0;
  const remaining = totalBudget - totalAllocated;
  const isOverBudget = totalAllocated > totalBudget;
  const progressPct = totalBudget > 0 ? Math.min(100, (totalAllocated / totalBudget) * 100) : 0;

  const persistOrder = async (next: BudgetAllocation[]) => {
    await reorderAllocations(
      id,
      next.map((item, index) => ({ id: item.id, sort_order: index, allocated_amount: item.allocated_amount }))
    );
    queryClient.invalidateQueries({ queryKey: ["budget", id] });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((current) => {
      const oldIndex = current.findIndex((i) => i.id === active.id);
      const newIndex = current.findIndex((i) => i.id === over.id);
      const next = arrayMove(current, oldIndex, newIndex);
      persistOrder(next);
      return next;
    });
  };

  const handleAmountChange = (allocationId: number, amount: number) => {
    setPendingChangeId(allocationId);
    setItems((current) => current.map((item) => (item.id === allocationId ? { ...item, allocated_amount: amount } : item)));
  };

  const persistItems = async (list: BudgetAllocation[]) => {
    await Promise.all(list.map((i) => updateAllocation(id, i.id, { allocated_amount: i.allocated_amount })));
    queryClient.invalidateQueries({ queryKey: ["budget", id] });
  };

  const handleAmountCommit = async () => {
    if (overagePrompt) return; // a decision is already pending — don't re-trigger from a stray pointerup (e.g. clicking the modal)
    // Persist all allocation amounts on pointer release (lightweight alternative to debouncing every slider tick).
    if (totalAllocated > totalBudget) {
      setOveragePrompt({ overage: Math.round((totalAllocated - totalBudget) * 100) / 100 });
      return;
    }
    await persistItems(items);
  };

  /** "Adjust within existing budget" — proportionally trims every other category
   * to absorb the overage, floored at ₹0. If the others can't fully absorb it
   * even at zero, the remainder is trimmed back off the category that was just
   * increased, so the total always lands back at exactly the existing budget. */
  const handleAdjustWithinBudget = async () => {
    if (!overagePrompt) return;
    setResolvingOverage(true);
    try {
      const overage = overagePrompt.overage;
      const others = items.filter((i) => i.id !== pendingChangeId);
      const othersTotal = others.reduce((sum, i) => sum + i.allocated_amount, 0);
      const reducible = Math.min(overage, othersTotal);
      const leftover = overage - reducible;

      let nextItems = items.map((item) => {
        if (item.id === pendingChangeId || othersTotal <= 0) return item;
        const reduced = item.allocated_amount - reducible * (item.allocated_amount / othersTotal);
        return { ...item, allocated_amount: Math.max(0, Math.round(reduced * 100) / 100) };
      });

      if (leftover > 0) {
        nextItems = nextItems.map((item) =>
          item.id === pendingChangeId
            ? { ...item, allocated_amount: Math.max(0, Math.round((item.allocated_amount - leftover) * 100) / 100) }
            : item
        );
      }

      setItems(nextItems);
      await persistItems(nextItems);
      toast.success("Adjusted within your existing budget");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail ?? "Couldn't adjust the budget");
    } finally {
      setResolvingOverage(false);
      setOveragePrompt(null);
      setPendingChangeId(null);
    }
  };

  /** "Increase the budget instead" — raises total_budget by the overage and
   * leaves every category's amount exactly as the customer set it. */
  const handleIncreaseBudget = async () => {
    if (!overagePrompt) return;
    setResolvingOverage(true);
    try {
      await updateEvent(id, { total_budget: totalBudget + overagePrompt.overage });
      await persistItems(items);
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      toast.success("Budget increased");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail ?? "Couldn't increase the budget");
    } finally {
      setResolvingOverage(false);
      setOveragePrompt(null);
      setPendingChangeId(null);
    }
  };

  const handleCancelOverage = () => {
    if (summary) setItems(summary.categories); // discard the uncommitted drag
    setOveragePrompt(null);
    setPendingChangeId(null);
  };

  if (isLoading || !event) {
    return <RangoliLoadingBlock label="Loading your budget…" className="h-64" />;
  }

  return (
    <div className="mx-auto max-w-3xl" onPointerUp={handleAmountCommit}>
      <button onClick={() => navigate("/events")} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-800">
        <ArrowLeft size={15} /> Back to events
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold text-neutral-900">{event.name}</h1>
            <EventCountdownChip eventDate={event.event_date} />
          </div>
          <p className="mt-1 text-sm text-neutral-500">Drag to reorder priorities, drag the sliders to reallocate.</p>
        </div>
      </div>

      <Card className="relative mb-6 overflow-hidden bg-brand-gradient text-white">
        <MehendiCorner className="pointer-events-none absolute right-3 top-3 h-12 w-12 text-white" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Total budget</p>
            <p className="text-2xl font-extrabold">₹{totalBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Allocated</p>
            <p className="text-2xl font-extrabold">₹{totalAllocated.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{isOverBudget ? "Over by" : "Remaining"}</p>
            <p className="text-2xl font-extrabold">₹{Math.abs(remaining).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/25">
          <motion.div
            className={`h-full rounded-full ${isOverBudget ? "bg-red-300" : "bg-white"}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </Card>

      <AnimatePresence>
        {isOverBudget && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            <AlertTriangle size={16} /> You&apos;ve allocated more than your total budget. Trim a category to balance it out.
          </motion.div>
        )}
        {!isOverBudget && totalAllocated === totalBudget && totalBudget > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
          >
            <CheckCircle2 size={16} /> Fully allocated — nice work!
          </motion.div>
        )}
      </AnimatePresence>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <BudgetCategoryCard key={item.id} allocation={item} totalBudget={totalBudget} onAmountChange={handleAmountChange} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(`/events/${id}/bookings`)}>
          <ClipboardList size={16} /> View bookings & quotations
        </Button>
        <Button variant="outline" onClick={() => navigate("/vendors")}>
          <Wallet size={16} /> Find vendors for this budget
        </Button>
      </div>

      <BudgetOverageModal
        isOpen={!!overagePrompt}
        overage={overagePrompt?.overage ?? 0}
        currentBudget={totalBudget}
        isProcessing={resolvingOverage}
        onAdjustWithinBudget={handleAdjustWithinBudget}
        onIncreaseBudget={handleIncreaseBudget}
        onCancel={handleCancelOverage}
      />
    </div>
  );
}
