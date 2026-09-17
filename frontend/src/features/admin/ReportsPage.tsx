import { useQuery } from "@tanstack/react-query";
import { BarChart3, LayoutDashboard, ShieldCheck, Sliders } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { MehendiCorner } from "@/assets/MehendiCorner";
import { Card } from "@/components/common/Card";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import { getDashboardStats, listAllVendors } from "@/features/admin/adminApi";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Vendors", to: "/admin/vendors", icon: ShieldCheck },
  { label: "Commissions", to: "/admin/commissions", icon: Sliders },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
];

// Sequential single hue for magnitude-by-category bars (per the dataviz palette: blue, light→dark).
const SEQUENTIAL_BLUE = "#2a78d6";
const STATUS_GOOD = "#0ca30c";
const STATUS_WARNING = "#fab219";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-neutral-700">{label}</p>
      <p className="text-neutral-600">{payload[0].value} vendors</p>
    </div>
  );
}

export function ReportsPage() {
  const { data: vendors, isLoading: loadingVendors } = useQuery({ queryKey: ["admin-vendors"], queryFn: listAllVendors });
  const { data: stats, isLoading: loadingStats } = useQuery({ queryKey: ["admin-dashboard"], queryFn: getDashboardStats });

  const categoryData = (() => {
    const counts: Record<string, number> = {};
    (vendors ?? []).forEach((v) => {
      counts[v.category] = (counts[v.category] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  })();

  const approvalData = stats
    ? [
        { status: "Approved", count: stats.approved_vendors, fill: STATUS_GOOD },
        { status: "Pending", count: stats.pending_vendors, fill: STATUS_WARNING },
      ]
    : [];

  return (
    <div className="flex gap-8">
      <Sidebar title="Admin" links={sidebarLinks} />
      <div className="flex-1">
        <div className="relative">
          <MehendiCorner className="pointer-events-none absolute -right-1 -top-2 h-10 w-10 text-brand-200" />
          <h1 className="text-2xl font-extrabold text-neutral-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-neutral-500">Vendor mix and approval pipeline across the platform.</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 text-sm font-bold text-neutral-800">Vendors by category</h3>
            {loadingVendors || categoryData.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                {loadingVendors ? <RangoliSpinner label="Loading…" /> : <p className="text-sm text-neutral-400">No vendor data yet</p>}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid horizontal={false} stroke="#e1e0d9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#898781" }} axisLine={{ stroke: "#c3c2b7" }} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={140}
                    tick={{ fontSize: 12, fill: "#52514e" }}
                    axisLine={{ stroke: "#c3c2b7" }}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(42,120,214,0.06)" }} />
                  <Bar dataKey="count" fill={SEQUENTIAL_BLUE} radius={[0, 4, 4, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card>
            <h3 className="mb-4 text-sm font-bold text-neutral-800">Vendor approval pipeline</h3>
            {loadingStats ? (
              <div className="flex h-64 items-center justify-center">
                <RangoliSpinner label="Loading…" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={approvalData} margin={{ top: 8 }}>
                  <CartesianGrid vertical={false} stroke="#e1e0d9" />
                  <XAxis dataKey="status" tick={{ fontSize: 12, fill: "#52514e" }} axisLine={{ stroke: "#c3c2b7" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#898781" }} axisLine={{ stroke: "#c3c2b7" }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(11,11,11,0.03)" }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={64}>
                    {approvalData.map((entry) => (
                      <Cell key={entry.status} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
