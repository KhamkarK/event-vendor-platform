import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { KeyRound, User as UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { DiyaIcon } from "@/assets/DiyaIcon";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { loginRequest } from "@/features/auth/authApi";
import { useAuthStore } from "@/store/authStore";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const auth = await loginRequest(values);
      setSession(auth);
      toast.success(`Welcome back, ${auth.user.full_name.split(" ")[0]}!`);
      const redirectByRole = { customer: "/vendors", vendor: "/vendor-dashboard", admin: "/admin" } as const;
      navigate(redirectByRole[auth.user.role]);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail ?? "Invalid username or password");
    }
  };

  return (
    <div className="auth-surface flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="accent-bar-top w-full max-w-md overflow-hidden rounded-2xl2 bg-white p-8 shadow-2xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <DiyaIcon className="h-[22px] w-[22px]" />
          </span>
          <h1 className="text-2xl font-extrabold text-neutral-900">Welcome back</h1>
          <p className="mt-1 text-sm text-neutral-500">Log in to plan your next event</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Username" placeholder="yourname" icon={<UserIcon size={16} />} error={errors.username?.message} {...register("username")} />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<KeyRound size={16} />}
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" isLoading={isSubmitting} fullWidth className="mt-2">
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-semibold text-brand-600 hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
