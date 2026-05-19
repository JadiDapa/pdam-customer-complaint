"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  cancelled: number;
}

const STATUS_CONFIG = [
  { name: "Pending", key: "pending" as const, color: "hsl(var(--chart-4))" },
  { name: "In Progress", key: "inProgress" as const, color: "hsl(var(--chart-2))" },
  { name: "Resolved", key: "resolved" as const, color: "hsl(var(--chart-1))" },
  { name: "Cancelled", key: "cancelled" as const, color: "hsl(var(--muted-foreground))" },
];

export default function ComplaintStatusDonut({ stats }: { stats: Stats }) {
  const data = STATUS_CONFIG.map((s) => ({
    name: s.name,
    value: stats[s.key],
    color: s.color,
  })).filter((d) => d.value > 0);

  const isEmpty = data.length === 0;

  return (
    <Card className="border-border/60">
      <CardHeader className="px-5 pt-4 pb-2">
        <CardTitle className="text-foreground text-sm font-medium uppercase tracking-wide">
          Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {isEmpty ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Belum ada data keluhan
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
              {data.map((entry) => (
                <span
                  key={entry.name}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span
                    className="inline-block h-2 w-3 rounded-sm"
                    style={{ background: entry.color }}
                  />
                  {entry.name}: {entry.value}
                </span>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
