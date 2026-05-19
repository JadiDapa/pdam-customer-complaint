import { UserCogIcon } from "lucide-react";

interface TechnicianStatsProps {
  total: number;
  activeThisMonth: number;
  inactiveThisMonth: number;
}

export default function TechnicianStats({
  total,
  activeThisMonth,
  inactiveThisMonth,
}: TechnicianStatsProps) {
  const stats = [
    { title: "Total Technicians", value: total },
    { title: "Active This Month", value: activeThisMonth },
    { title: "Inactive This Month", value: inactiveThisMonth },
  ];

  return (
    <div className="bg-card flex flex-row overflow-hidden rounded-xl border px-6 py-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`flex flex-1 items-center gap-4 p-6 ${
            i !== stats.length - 1 ? "border-r" : ""
          }`}
        >
          <div className="bg-primary text-primary-foreground rounded-md p-2">
            <UserCogIcon />
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
