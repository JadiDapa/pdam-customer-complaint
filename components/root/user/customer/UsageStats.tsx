"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Report {
  id: number;
  technicianId: number;
  customerId: number;
  location: string;
  values: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UsageStatsProps {
  reports: Report[];
}

export default function UsageStats({ reports }: UsageStatsProps) {
  const totalUsage = reports.reduce((sum, r) => sum + Number(r.values), 0);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const thisMonthUsage = reports
    .filter((r) => {
      const d = new Date(r.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((sum, r) => sum + Number(r.values), 0);

  const lastMonthUsage = reports
    .filter((r) => {
      const d = new Date(r.createdAt);
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    })
    .reduce((sum, r) => sum + Number(r.values), 0);

  const diff = thisMonthUsage - lastMonthUsage;
  const diffPercent =
    lastMonthUsage > 0 ? ((diff / lastMonthUsage) * 100).toFixed(1) : null;
  const isUp = diff >= 0;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-muted-foreground text-lg font-medium">
            Total usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1">
            <span className="text-5xl font-semibold">
              {totalUsage.toLocaleString()}
            </span>
            <span className="text-muted-foreground mb-0.5 text-sm">m³</span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-muted-foreground text-lg font-medium">
            This month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1">
            <span className="text-5xl font-semibold">
              {thisMonthUsage.toLocaleString()}
            </span>
            <span className="text-muted-foreground mb-0.5 text-sm">m³</span>
          </div>
          {diffPercent !== null ? (
            <div
              className={`mt-1 flex items-center gap-1 text-xs font-medium ${isUp ? "text-red-500" : "text-green-500"}`}
            >
              {isUp ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isUp ? "+" : ""}
              {diffPercent}% from last month
            </div>
          ) : (
            <p className="text-muted-foreground mt-1 text-xs">
              No data last month
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
