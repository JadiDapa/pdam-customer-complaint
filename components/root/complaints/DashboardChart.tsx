"use client";

import { useState, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

type DailyEntry = {
  date: string;
  pending: number;
  inProgress: number;
  resolved: number;
};

const COLORS = {
  pending: "hsl(var(--chart-4))",
  inProgress: "hsl(var(--chart-2))",
  resolved: "hsl(var(--chart-1))",
};

interface Props {
  data: DailyEntry[];
}

export default function DashboardChart({ data }: Props) {
  const [period, setPeriod] = useState<7 | 30>(30);

  const chartData = useMemo(() => data.slice(-period), [data, period]);

  const totals = useMemo(
    () =>
      chartData.reduce(
        (acc, d) => ({
          pending: acc.pending + d.pending,
          inProgress: acc.inProgress + d.inProgress,
          resolved: acc.resolved + d.resolved,
        }),
        { pending: 0, inProgress: 0, resolved: 0 },
      ),
    [chartData],
  );

  return (
    <Card className="border-border/60">
      <CardHeader className="px-5 pt-4 pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Keluhan Masuk
            </p>
            <div className="mt-2 flex flex-wrap gap-5">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: COLORS.pending }}
                />
                <div>
                  <p className="text-muted-foreground text-xs">Pending</p>
                  <p className="text-foreground text-lg font-bold leading-tight">
                    {totals.pending}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: COLORS.inProgress }}
                />
                <div>
                  <p className="text-muted-foreground text-xs">In Progress</p>
                  <p className="text-foreground text-lg font-bold leading-tight">
                    {totals.inProgress}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: COLORS.resolved }}
                />
                <div>
                  <p className="text-muted-foreground text-xs">Resolved</p>
                  <p className="text-foreground text-lg font-bold leading-tight">
                    {totals.resolved}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-border flex shrink-0 overflow-hidden rounded-lg border text-xs">
            {([7, 30] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`cursor-pointer px-3 py-1.5 transition-colors ${
                  period === p
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === 7 ? "7 Hari" : "30 Hari"}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={chartData}
            barSize={period === 7 ? 14 : 7}
            barGap={2}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={period === 30 ? 4 : 0}
              tickFormatter={(v) =>
                format(parseISO(v), period === 30 ? "d/M" : "dd/MM")
              }
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={28}
            />
            <Tooltip
              labelFormatter={(v) =>
                format(parseISO(v as string), "dd MMM yyyy")
              }
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  pending: "Pending",
                  inProgress: "In Progress",
                  resolved: "Resolved",
                };
                return [value, labels[name as string] ?? name];
              }}
            />
            <Bar
              dataKey="pending"
              fill={COLORS.pending}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="inProgress"
              fill={COLORS.inProgress}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="resolved"
              fill={COLORS.resolved}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
