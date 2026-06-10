import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

interface Detail {
  label: string;
  value: string | null | undefined;
}

interface ProfileCardProps {
  fullname: string;
  username: string;
  role: string;
  details?: Detail[];
}

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: "Pelanggan",
  TECHNICIAN: "Teknisi",
  ADMIN: "Admin",
};

export default function ProfileCard({
  fullname,
  username,
  role,
  details = [],
}: ProfileCardProps) {
  const initials = fullname
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-base font-semibold leading-tight">
              {fullname}
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm">@{username}</p>
          </div>

          <span className="bg-primary/8 text-primary inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
            <ShieldCheck size={12} />
            {ROLE_LABELS[role] ?? role}
          </span>
        </div>

        {details.length > 0 && (
          <dl className="divide-border/50 mt-4 divide-y border-t pt-4">
            {details
              .filter((d) => d.value)
              .map((d) => (
                <div key={d.label} className="flex items-center gap-3 py-2">
                  <span className="text-muted-foreground w-28 shrink-0 text-xs">
                    {d.label}
                  </span>
                  <span className="text-foreground min-w-0 truncate text-sm font-medium">
                    {d.value}
                  </span>
                </div>
              ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
