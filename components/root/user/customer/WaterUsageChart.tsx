"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  Area,
  AreaChart,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const barConfig = {
  values: {
    label: "Usage (m³)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const areaConfig = {
  values: {
    label: "Usage (m³)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface Report {
  id: number;
  technicianId: number;
  customerId: number;
  location: string;
  values: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WaterUsageChartProps {
  reports: Report[];
}

export default function WaterUsageChart({ reports }: WaterUsageChartProps) {
  const chartData = reports.map((report) => ({
    month: new Date(report.createdAt).toLocaleString("default", {
      month: "short",
    }),
    values: Number(report.values),
  }));

  return (
    <Tabs
      defaultValue="bar"
      className="bg-card w-full flex-2 flex-col gap-6 p-2"
    >
      <TabsContent value="bar">
        <Card>
          <CardHeader>
            <CardTitle>Water usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-64" config={barConfig}>
              <BarChart data={chartData} margin={{ top: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="values" fill="var(--color-values)" radius={8}>
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="area">
        <Card>
          <CardHeader>
            <CardTitle>Water usage trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-64" config={areaConfig}>
              <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="values"
                  type="natural"
                  fill="var(--color-values)"
                  fillOpacity={0.4}
                  stroke="var(--color-values)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsList className="w-full rounded-lg p-2">
        <TabsTrigger value="bar">Penggunaan Progresif</TabsTrigger>
        <TabsTrigger value="area">Selisih Bulanan</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
