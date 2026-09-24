import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Briefcase, Building2, Mail, MapPin, Phone, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { DiyaIcon } from "@/assets/DiyaIcon";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { HERO_IMAGE_URL } from "@/constants/heroImage";
import { VENDOR_CATEGORIES } from "@/constants/vendorCategories";
import { VENDOR_LOCATIONS } from "@/constants/vendorLocations";
import { signupRequest } from "@/features/auth/authApi";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types/user";

const schema = z
  .object({
    full_name: z.string().min(2, "Enter your full name"),
    username: z.string().min(3, "At least 3 characters"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    mobile: z.string().optional().or(z.literal("")),
    password: z.string().min(8, "At least 8 characters"),
    role: z.enum(["customer", "vendor"]),
    business_name: z.string().optional(),
    category: z.string().optional(),
    location: z.string().optional(),
  })
  .refine((data) => data.role !== "vendor" || !!data.business_name, {
    message: "Business name is required for vendors",
    path: ["business_name"],
  })
  .refine((data) => data.role !== "vendor" || !!data.category, {
    message: "Category is required for vendors",
    path: ["category"],
  })
  .refine((data) => data.role !== "vendor" || !!data.location, {
    message: "Location is required for vendors",
    path: ["location"],
  });

type FormValues = z.infer<typeof schema>;

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  { value: "customer", label: "Plan an event", description: "Create events & book vendors" },
  { value: "vendor", label: "I'm a vendor", description: "List packages & manage bookings" },
];

export function SignupPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [role, setRole] = useState<UserRole>("customer");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: "customer" } });

  const selectRole = (value: UserRole) => {
    setRole(value);
    setValue("role", value as "customer" | "vendor");
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const auth = await signupRequest({
        ...values,
        email: values.email || undefined,
        mobile: values.mobile || undefined,
      });
      setSession(auth);
      toast.success(`Welcome to EventKarma, ${auth.user.full_name.split(" ")[0]}!`);
      const redirectByRole = { customer: "/vendors", vendor: "/vendor-dashboard", admin: "/admin" } as const;
      navigate(redirectByRole[auth.user.role]);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail ?? "Could not create your account");
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-neutral-900 bg-cover bg-center px-4 py-10"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(20,12,10,0.55), rgba(20,12,10,0.7)), url(${HERO_IMAGE_URL})`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="accent-bar-top w-full max-w-lg overflow-hidden rounded-2xl2 bg-white p-8 shadow-2xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <DiyaIcon className="h-[22px] w-[22px]" />
          </span>
          <h1 className="text-2xl font-extrabold text-neutral-900">Create your account</h1>
          <p className="mt-1 text-sm text-neutral-500">Plan events smarter, or grow your vendor business</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          {roleOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => selectRole(option.value)}
              className={`rounded-xl border p-3 text-left transition-all ${
                role === option.value ? "border-brand-400 bg-brand-50 ring-2 ring-brand-100" : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <p className="text-sm font-semibold text-neutral-800">{option.label}</p>
              <p className="text-xs text-neutral-500">{option.description}</p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Full name" icon={<UserIcon size={16} />} error={errors.full_name?.message} {...register("full_name")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Username" error={errors.username?.message} {...register("username")} />
            <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email (optional)" icon={<Mail size={16} />} error={errors.email?.message} {...register("email")} />
            <Input label="Mobile (optional)" icon={<Phone size={16} />} error={errors.mobile?.message} {...register("mobile")} />
          </div>

          {role === "vendor" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-2 gap-3">
              <Input
                label="Business name"
                icon={<Building2 size={16} />}
                error={errors.business_name?.message}
                {...register("business_name")}
              />
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Category</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Briefcase size={16} />
                  </span>
                  <select
                    defaultValue=""
                    className={`w-full appearance-none rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none transition-all duration-150 focus:ring-4 focus:ring-brand-100 ${
                      errors.category ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-brand-400"
                    }`}
                    {...register("category")}
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {VENDOR_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category?.message && <p className="mt-1 text-xs font-medium text-red-500">{errors.category.message}</p>}
              </div>
              <div className="col-span-2 w-full">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Location</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <MapPin size={16} />
                  </span>
                  <select
                    defaultValue=""
                    className={`w-full appearance-none rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none transition-all duration-150 focus:ring-4 focus:ring-brand-100 ${
                      errors.location ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-brand-400"
                    }`}
                    {...register("location")}
                  >
                    <option value="" disabled>
                      Select a location
                    </option>
                    {VENDOR_LOCATIONS.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.location?.message && <p className="mt-1 text-xs font-medium text-red-500">{errors.location.message}</p>}
              </div>
            </motion.div>
          )}

          <Button type="submit" isLoading={isSubmitting} fullWidth className="mt-2">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
