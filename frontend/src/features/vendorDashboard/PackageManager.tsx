import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  ClipboardList,
  ImagePlus,
  LayoutDashboard,
  Package as PackageIcon,
  Pencil,
  Plus,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import {
  createPackage,
  deletePackage,
  listMyPackages,
  updatePackage,
  uploadPackagePhoto,
  type VendorPackagePayload,
} from "@/features/vendorDashboard/packagesApi";
import type { VendorPackage } from "@/types/vendor";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/vendor-dashboard", icon: LayoutDashboard, end: true },
  { label: "Calendar", to: "/vendor-dashboard/calendar", icon: CalendarCheck },
  { label: "Packages", to: "/vendor-dashboard/packages", icon: PackageIcon },
  { label: "Quotations", to: "/vendor-dashboard/quotations", icon: ClipboardList },
  { label: "Ledger", to: "/vendor-dashboard/ledger", icon: Wallet },
];

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  category: z.string().min(2, "Category is required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Enter a valid budget amount"),
});
type FormValues = z.infer<typeof schema>;

export function PackageManager() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<VendorPackage | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { data: packages, isLoading } = useQuery({ queryKey: ["vendor-packages"], queryFn: listMyPackages });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["vendor-packages"] });

  const saveMutation = useMutation({
    mutationFn: (payload: VendorPackagePayload) =>
      editingPackage ? updatePackage(editingPackage.id, payload) : createPackage(payload),
    onSuccess: () => {
      invalidate();
      toast.success(editingPackage ? "Package updated" : "Package created");
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePackage,
    onSuccess: () => {
      invalidate();
      toast.success("Package removed");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => updatePackage(id, { is_active }),
    onSuccess: () => {
      invalidate();
      toast.success("Package updated");
    },
  });

  const openCreateModal = () => {
    setEditingPackage(null);
    setPhotos([]);
    reset({ title: "", category: "", description: "", price: undefined as unknown as number });
    setModalOpen(true);
  };

  const openEditModal = (pkg: VendorPackage) => {
    setEditingPackage(pkg);
    setPhotos(pkg.photos ?? []);
    reset({ title: pkg.title, category: pkg.category, description: pkg.description ?? "", price: pkg.price });
    setModalOpen(true);
  };

  const handlePhotoSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingPhoto(true);
    try {
      const uploaded = await Promise.all(Array.from(files).map((file) => uploadPackagePhoto(file)));
      setPhotos((current) => [...current, ...uploaded]);
    } catch {
      toast.error("Couldn't upload one or more photos");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (url: string) => setPhotos((current) => current.filter((p) => p !== url));

  const onSubmit = (values: FormValues) => {
    saveMutation.mutate({ ...values, photos });
  };

  return (
    <div className="flex gap-8">
      <Sidebar title="Vendor" links={sidebarLinks} />
      <div className="flex-1">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-900">Packages</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Manage the packages and budgets customers see on your listing — add as many as you like.
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus size={16} /> Add package
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <RangoliSpinner label="Loading packages…" />
          </div>
        ) : !packages || packages.length === 0 ? (
          <EmptyState
            icon={PackageIcon}
            title="No packages yet"
            description="Add your first package so customers can see what you offer and at what price."
            action={
              <Button onClick={openCreateModal}>
                <Plus size={16} /> Add package
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {packages.map((pkg, idx) => (
              <motion.div key={pkg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                <Card className="overflow-hidden">
                  {pkg.photos && pkg.photos.length > 0 ? (
                    <div className="mb-4 -m-5 mb-4 flex gap-1 overflow-x-auto">
                      {pkg.photos.map((photo, i) => (
                        <img key={i} src={photo} alt="" className="h-32 w-full shrink-0 object-cover" />
                      ))}
                    </div>
                  ) : (
                    <div className="mb-4 -m-5 mb-4 flex h-32 items-center justify-center bg-neutral-50 text-neutral-300">
                      <ImagePlus size={28} />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-neutral-900">{pkg.title}</h3>
                      <p className="text-xs font-medium uppercase tracking-wide text-brand-500">{pkg.category}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        pkg.is_active ? "bg-emerald-50 text-emerald-600" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {pkg.is_active ? "Visible" : "Hidden"}
                    </span>
                  </div>

                  {pkg.description && <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{pkg.description}</p>}
                  <p className="mt-3 text-lg font-extrabold text-neutral-900">₹{pkg.price.toLocaleString()}</p>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditModal(pkg)}>
                      <Pencil size={14} /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleActiveMutation.mutate({ id: pkg.id, is_active: !pkg.is_active })}
                    >
                      {pkg.is_active ? "Hide" : "Show"}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(pkg.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingPackage ? "Edit package" : "Add package"}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Title" placeholder="e.g. Premium Wedding Photography" error={errors.title?.message} {...register("title")} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Category" placeholder="e.g. Photography" error={errors.category?.message} {...register("category")} />
              <Input label="Budget / price (₹)" type="number" step="0.01" error={errors.price?.message} {...register("price")} />
            </div>
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Description (optional)</label>
              <textarea
                rows={3}
                placeholder="What's included in this package?"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-all duration-150 placeholder:text-neutral-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                {...register("description")}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Photos</label>
              <div className="flex flex-wrap gap-2">
                {photos.map((url) => (
                  <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-neutral-200">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(url)}
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900/70 text-white"
                      aria-label="Remove photo"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-brand-300 hover:text-brand-500 disabled:opacity-50"
                >
                  {uploadingPhoto ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-500" />
                  ) : (
                    <>
                      <ImagePlus size={18} />
                      <span className="text-[10px] font-medium">Add</span>
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotoSelect(e.target.files)}
                />
              </div>
              <p className="mt-1.5 text-xs text-neutral-400">Customers see these photos on your package listing.</p>
            </div>

            <Button type="submit" isLoading={isSubmitting || saveMutation.isPending} fullWidth className="mt-2">
              {editingPackage ? "Save changes" : "Create package"}
            </Button>
          </form>
        </Modal>
      </div>
    </div>
  );
}
