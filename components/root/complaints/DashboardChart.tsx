"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  return (
    <Card className="border-border/60">
      <CardHeader className="px-5 pt-4 pb-3">
        <CardTitle className="text-foreground text-sm font-medium tracking-wide uppercase">
          Keluhan 7 Hari Terakhir
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} barSize={12} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => format(parseISO(v), "dd/MM")}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={28}
            />
            <Tooltip
              labelFormatter={(v) => format(parseISO(v as string), "dd MMM yyyy")}
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  pending: "Pending",
                  inProgress: "In Progress",
                  resolved: "Resolved",
                };
                return [value, labels[name as string] ?? name];
              }}
            />
            <Bar dataKey="pending" fill={COLORS.pending} radius={[4, 4, 0, 0]} />
            <Bar dataKey="inProgress" fill={COLORS.inProgress} radius={[4, 4, 0, 0]} />
            <Bar dataKey="resolved" fill={COLORS.resolved} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-3 flex items-center justify-center gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm" style={{ background: COLORS.pending }} />
            Pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm" style={{ background: COLORS.inProgress }} />
            In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm" style={{ background: COLORS.resolved }} />
            Resolved
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
