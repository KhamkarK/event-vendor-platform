import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import {
  Badge,
  Cake,
  Camera,
  GripVertical,
  Gift,
  Landmark,
  Mic,
  PartyPopper,
  Plane,
  Shirt,
  Sparkles,
  Utensils,
} from "lucide-react";

import type { BudgetAllocation } from "@/types/event";

const iconMap: Record<string, typeof Sparkles> = {
  shirt: Shirt,
  landmark: Landmark,
  utensils: Utensils,
  camera: Camera,
  plane: Plane,
  cake: Cake,
  "party-popper": PartyPopper,
  gift: Gift,
  badge: Badge,
  mic: Mic,
  sparkles: Sparkles,
};

interface BudgetCategoryCardProps {
  allocation: BudgetAllocation;
  totalBudget: number;
  onAmountChange: (id: number, amount: number) => void;
}

export function BudgetCategoryCard({ allocation, totalBudget, onAmountChange }: BudgetCategoryCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: allocation.id });
  const Icon = iconMap[allocation.icon] ?? Sparkles;
  const percentage = totalBudget > 0 ? Math.min(100, (allocation.allocated_amount / totalBudget) * 100) : 0;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-card"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-neutral-300 transition-colors hover:text-neutral-500 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical size={18} />
      </button>

      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
        <Icon size={20} />
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-neutral-800">{allocation.name}</p>
          <p className="whitespace-nowrap text-sm font-bold text-neutral-900">₹{allocation.allocated_amount.toLocaleString()}</p>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <motion.div
            className="h-full rounded-full bg-brand-gradient"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(totalBudget, allocation.allocated_amount)}
          step={500}
          value={allocation.allocated_amount}
          onChange={(e) => onAmountChange(allocation.id, Number(e.target.value))}
          className="mt-2 w-full accent-brand-500"
        />
      </div>
    </motion.div>
  );
}
