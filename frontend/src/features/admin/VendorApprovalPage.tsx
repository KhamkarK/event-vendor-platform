import { DndContext, type DragEndEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart3, Ban, Crown, GripVertical, LayoutDashboard, ShieldCheck, Sliders, Star, Users } from "lucide-react";
import toast from "react-hot-toast";

import { MehendiCorner } from "@/assets/MehendiCorner";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import { approveVendor, blockVendor, listAllVendors, setFeatured, unblockVendor } from "@/features/admin/adminApi";
import type { VendorProfile } from "@/types/user";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Vendors", to: "/admin/vendors", icon: ShieldCheck },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Commissions", to: "/admin/commissions", icon: Sliders },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
];

type ColumnId = "pending" | "approved" | "blocked";

const columnMeta: Record<ColumnId, { title: string; tint: string }> = {
  pending: { title: "Pending", tint: "bg-amber-50 border-amber-200" },
  approved: { title: "Approved", tint: "bg-emerald-50 border-emerald-200" },
  blocked: { title: "Blocked", tint: "bg-red-50 border-red-200" },
};

function columnOf(vendor: VendorProfile): ColumnId {
  if (vendor.is_blocked) return "blocked";
  if (vendor.is_approved) return "approved";
  return "pending";
}

function VendorDragCard({ vendor }: { vendor: VendorProfile }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: vendor.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 20 }
    : undefined;

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
        <p className="truncate text-sm font-semibold text-neutral-800">{vendor.business_name}</p>
        {vendor.owner_full_name && (
          <p className="truncate text-xs text-neutral-400">Registered by {vendor.owner_full_name}</p>
        )}
        <p className="truncate text-xs text-neutral-500">{vendor.category}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
          <Star size={11} className="fill-accent-400 text-accent-400" /> {vendor.rating_avg.toFixed(1)} · {vendor.commission_rate}%
        </p>
      </div>
    </div>
  );
}

function KanbanColumn({ id, vendors }: { id: ColumnId; vendors: VendorProfile[] }) {
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
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-600">{meta.title}</p>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold text-neutral-500">{vendors.length}</span>
      </div>
      {vendors.length === 0 ? (
        <p className="px-1 py-6 text-center text-xs text-neutral-400">Drag a vendor here</p>
      ) : (
        vendors.map((vendor) => <VendorDragCard key={vendor.id} vendor={vendor} />)
      )}
    </div>
  );
}

// Premium tier: a separate drag board scoped to approved, unblocked vendors only —
// reuses the existing (previously unused) is_featured flag via the existing
// setFeatured() API function, rather than the approve/block Kanban above.
type FeatureColumnId = "standard" | "premium";

const featureColumnMeta: Record<FeatureColumnId, { title: string; tint: string }> = {
  standard: { title: "Standard", tint: "bg-neutral-50 border-neutral-200" },
  premium: { title: "Premium", tint: "bg-accent-50 border-accent-200" },
};

function columnOfFeature(vendor: VendorProfile): FeatureColumnId {
  return vendor.is_featured ? "premium" : "standard";
}

function FeatureKanbanColumn({ id, vendors }: { id: FeatureColumnId; vendors: VendorProfile[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const meta = featureColumnMeta[id];

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[200px] flex-1 flex-col gap-2 rounded-2xl border-2 border-dashed p-3 transition-colors ${meta.tint} ${
        isOver ? "ring-2 ring-brand-300" : ""
      }`}
    >
      <div className="mb-1 flex items-center justify-between px-1">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-neutral-600">
          {id === "premium" && <Crown size={12} className="text-accent-500" />}
          {meta.title}
        </p>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold text-neutral-500">{vendors.length}</span>
      </div>
      {vendors.length === 0 ? (
        <p className="px-1 py-6 text-center text-xs text-neutral-400">Drag a vendor here</p>
      ) : (
        vendors.map((vendor) => <VendorDragCard key={vendor.id} vendor={vendor} />)
      )}
    </div>
  );
}

export function VendorApprovalPage() {
  const queryClient = useQueryClient();
  const { data: vendors, isLoading } = useQuery({ queryKey: ["admin-vendors"], queryFn: listAllVendors });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });

  const approveMutation = useMutation({
    mutationFn: approveVendor,
    onSuccess: () => {
      invalidate();
      toast.success("Vendor approved");
    },
  });
  const blockMutation = useMutation({
    mutationFn: blockVendor,
    onSuccess: () => {
      invalidate();
      toast.success("Vendor blocked");
    },
  });
  const unblockMutation = useMutation({
    mutationFn: unblockVendor,
    onSuccess: () => {
      invalidate();
      toast.success("Vendor unblocked");
    },
  });
  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: number; featured: boolean }) => setFeatured(id, featured),
    onSuccess: (_, { featured }) => {
      invalidate();
      toast.success(featured ? "Vendor marked Premium" : "Vendor moved back to Standard");
    },
  });

  const columns: Record<ColumnId, VendorProfile[]> = { pending: [], approved: [], blocked: [] };
  (vendors ?? []).forEach((v) => columns[columnOf(v)].push(v));

  const activeVendors = (vendors ?? []).filter((v) => v.is_approved && !v.is_blocked);
  const featureColumns: Record<FeatureColumnId, VendorProfile[]> = { standard: [], premium: [] };
  activeVendors.forEach((v) => featureColumns[columnOfFeature(v)].push(v));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const vendorId = Number(active.id);
    const vendor = (vendors ?? []).find((v) => v.id === vendorId);
    if (!vendor) return;

    const from = columnOf(vendor);
    const to = over.id as ColumnId;
    if (from === to) return;

    if (to === "blocked") {
      blockMutation.mutate(vendorId);
    } else if (to === "approved") {
      if (from === "pending") approveMutation.mutate(vendorId);
      else if (from === "blocked") unblockMutation.mutate(vendorId);
    } else if (to === "pending") {
      if (from === "blocked") unblockMutation.mutate(vendorId);
      else toast.error("An approved vendor can't be moved back to pending here.");
    }
  };

  const handleFeatureDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const vendorId = Number(active.id);
    const vendor = activeVendors.find((v) => v.id === vendorId);
    if (!vendor) return;

    const from = columnOfFeature(vendor);
    const to = over.id as FeatureColumnId;
    if (from === to) return;

    featureMutation.mutate({ id: vendorId, featured: to === "premium" });
  };

  return (
    <div className="flex gap-8">
      <Sidebar title="Admin" links={sidebarLinks} />
      <div className="flex-1">
        <div className="relative">
          <MehendiCorner className="pointer-events-none absolute -right-1 -top-2 h-10 w-10 text-brand-200" />
          <h1 className="text-2xl font-extrabold text-neutral-900">Vendor Management</h1>
          <p className="mt-1 text-sm text-neutral-500">Drag a vendor between columns to approve, block, or reinstate them.</p>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <RangoliSpinner label="Loading vendors…" />
            </div>
          ) : !vendors || vendors.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-neutral-200 text-sm text-neutral-400">
              No vendors yet — they&apos;ll appear here once they sign up.
            </div>
          ) : (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 sm:flex-row"
              >
                <KanbanColumn id="pending" vendors={columns.pending} />
                <KanbanColumn id="approved" vendors={columns.approved} />
                <KanbanColumn id="blocked" vendors={columns.blocked} />
              </motion.div>
            </DndContext>
          )}
        </div>

        <div className="mt-10">
          <h2 className="flex items-center gap-1.5 text-lg font-bold text-neutral-900">
            <Crown size={16} className="text-accent-500" /> Premium Vendors
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Drag an approved vendor into Premium to feature them (only approved, unblocked vendors are eligible).
          </p>

          <div className="mt-4">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <RangoliSpinner label="Loading vendors…" />
              </div>
            ) : activeVendors.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-neutral-200 text-sm text-neutral-400">
                No approved vendors yet — approve a vendor above to feature them here.
              </div>
            ) : (
              <DndContext sensors={sensors} onDragEnd={handleFeatureDragEnd}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4 sm:flex-row"
                >
                  <FeatureKanbanColumn id="standard" vendors={featureColumns.standard} />
                  <FeatureKanbanColumn id="premium" vendors={featureColumns.premium} />
                </motion.div>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
