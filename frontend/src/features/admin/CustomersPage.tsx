import { DndContext, type DragEndEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart3, Crown, GripVertical, LayoutDashboard, Mail, Phone, ShieldCheck, Sliders, Users } from "lucide-react";
import toast from "react-hot-toast";

import { MehendiCorner } from "@/assets/MehendiCorner";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import { listCustomers, setCustomerPrime } from "@/features/admin/adminApi";
import type { User } from "@/types/user";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Vendors", to: "/admin/vendors", icon: ShieldCheck },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Commissions", to: "/admin/commissions", icon: Sliders },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
];

type ColumnId = "standard" | "prime";

const columnMeta: Record<ColumnId, { title: string; tint: string }> = {
  standard: { title: "Standard", tint: "bg-neutral-50 border-neutral-200" },
  prime: { title: "Prime Members", tint: "bg-accent-50 border-accent-200" },
};

function columnOf(customer: User): ColumnId {
  return customer.is_prime ? "prime" : "standard";
}

/** Read-only card: shows what the customer registered with. The only action
 * this page offers is dragging a customer between Standard and Prime — no
 * approve/block controls, since customer accounts aren't gated. */
function CustomerDragCard({ customer }: { customer: User }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: customer.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 20 } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-xl border border-neutral-100 bg-white p-3 shadow-card ${isDragging ? "opacity-50" : ""}`}
    >
      <button {...attributes} {...listeners} className="cursor-grab touch-none text-neutral-300 hover:text-neutral-500 active:cursor-grabbing">
        <GripVertical size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-800">{customer.full_name}</p>
        <p className="truncate text-xs text-neutral-400">@{customer.username}</p>
        {customer.email && (
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-neutral-500">
            <Mail size={11} /> {customer.email}
          </p>
        )}
        {customer.mobile && (
          <p className="flex items-center gap-1 truncate text-xs text-neutral-500">
            <Phone size={11} /> {customer.mobile}
          </p>
        )}
        <p className="mt-1 text-xs text-neutral-400">
          Joined {new Date(customer.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
        </p>
        {customer.prime_requested && !customer.is_prime && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-700">
            <Crown size={10} /> Requested
          </span>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ id, customers }: { id: ColumnId; customers: User[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const meta = columnMeta[id];

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[200px] flex-1 flex-col gap-2 rounded-2xl border-2 border-dashed p-3 transition-colors ${meta.tint} ${
        isOver ? "ring-2 ring-brand-300" : ""
      }`}
    >
      <div className="mb-1 flex items-center justify-between px-1">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-neutral-600">
          {id === "prime" && <Crown size={12} className="text-accent-500" />}
          {meta.title}
        </p>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold text-neutral-500">{customers.length}</span>
      </div>
      {customers.length === 0 ? (
        <p className="px-1 py-6 text-center text-xs text-neutral-400">Drag a customer here</p>
      ) : (
        customers.map((customer) => <CustomerDragCard key={customer.id} customer={customer} />)
      )}
    </div>
  );
}

export function CustomersPage() {
  const queryClient = useQueryClient();
  const { data: customers, isLoading } = useQuery({ queryKey: ["admin-customers"], queryFn: listCustomers });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const primeMutation = useMutation({
    mutationFn: ({ id, prime }: { id: number; prime: boolean }) => setCustomerPrime(id, prime),
    onSuccess: (_, { prime }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      toast.success(prime ? "Customer marked Prime" : "Customer moved back to Standard");
    },
  });

  const columns: Record<ColumnId, User[]> = { standard: [], prime: [] };
  (customers ?? []).forEach((c) => columns[columnOf(c)].push(c));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const customerId = Number(active.id);
    const customer = (customers ?? []).find((c) => c.id === customerId);
    if (!customer) return;

    const from = columnOf(customer);
    const to = over.id as ColumnId;
    if (from === to) return;

    primeMutation.mutate({ id: customerId, prime: to === "prime" });
  };

  return (
    <div className="flex gap-8">
      <Sidebar title="Admin" links={sidebarLinks} />
      <div className="flex-1">
        <div className="relative">
          <MehendiCorner className="pointer-events-none absolute -right-1 -top-2 h-10 w-10 text-brand-200" />
          <h1 className="text-2xl font-extrabold text-neutral-900">Customers</h1>
          <p className="mt-1 text-sm text-neutral-500">Drag a customer into Prime Members to tag them. No approval is required for customers.</p>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <RangoliSpinner label="Loading customers…" />
            </div>
          ) : !customers || customers.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-neutral-200 text-sm text-neutral-400">
              No customers yet — they&apos;ll appear here once they sign up.
            </div>
          ) : (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row">
                <KanbanColumn id="standard" customers={columns.standard} />
                <KanbanColumn id="prime" customers={columns.prime} />
              </motion.div>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}
