import { UsersIcon } from "lucide-react";

interface CustomerStatsProps {
  total: number;
  activeThisMonth: number;
  inactiveThisMonth: number;
}

export default function CustomerStats({
  total,
  activeThisMonth,
  inactiveThisMonth,
}: CustomerStatsProps) {
  const stats = [
    { title: "Total Customers", value: total },
    { title: "Active This Month", value: activeThisMonth },
    { title: "Inactive This Month", value: inactiveThisMonth },
  ];

  return (
    <div className="bg-card flex flex-col overflow-hidden rounded-xl border sm:flex-row">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`flex flex-1 items-center gap-4 p-5 sm:p-6 ${
            i !== stats.length - 1 ? "border-b sm:border-b-0 sm:border-r" : ""
          }`}
        >
          <div className="bg-primary text-primary-foreground rounded-md p-2">
            <UsersIcon />
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">{stat.title}</p>
            <h3 className="text-xl font-semibold tracking-tight">
              {stat.value.toLocaleString()}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
}
