import { CustomerService } from "@/servers/services/customer.service";
import { getCurrentUser } from "@/app/actions/user.actions";
import { Hash, Phone, MapPin, Calendar, User, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

export default async function CustomerProfilePage() {
  const user = await getCurrentUser();
  const customer = await CustomerService.getByUserId(user.id);

  const initials = user.fullname
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-8">
      {/* Identity hero strip */}
      <div className="border-border flex items-center gap-5 border-b pb-7">
        <div className="bg-primary/10 text-primary flex size-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="text-foreground text-2xl leading-tight font-semibold">
            {user.fullname}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            @{user.username}
          </p>
        </div>
        <div className="ml-auto shrink-0">
          <span className="bg-primary/8 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
            <ShieldCheck size={12} />
            {user.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Account info */}
        <section>
          <SectionLabel>Akun</SectionLabel>
          <dl className="divide-border/50 mt-3 divide-y">
            <InfoRow
              icon={<User size={14} />}
              label="Nama lengkap"
              value={user.fullname}
            />
            <InfoRow
              icon={<Hash size={14} />}
              label="Username"
              value={`@${user.username}`}
            />
            <InfoRow
              icon={<ShieldCheck size={14} />}
              label="Role"
              value={user.role}
            />
          </dl>
        </section>

        {/* Customer data */}
        <section>
          <SectionLabel>Data pelanggan</SectionLabel>
          {customer ? (
            <dl className="divide-border/50 mt-3 divide-y">
              <InfoRow
                icon={<Hash size={14} />}
                label="Customer ID"
                value={customer.customerId}
              />
              <InfoRow
                icon={<Phone size={14} />}
                label="Telepon"
                value={customer.phoneNumber}
              />
              <InfoRow
                icon={<MapPin size={14} />}
                label="Alamat"
                value={customer.address}
              />
              <InfoRow
                icon={<Calendar size={14} />}
                label="Terdaftar sejak"
                value={format(new Date(customer.createdAt), "dd MMM yyyy")}
              />
            </dl>
          ) : (
            <div className="border-border mt-3 rounded-lg border border-dashed py-8 text-center">
              <p className="text-muted-foreground text-sm">
                Data pelanggan belum tersedia.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-foreground border-primary border-l-2 pl-3 text-sm font-medium">
      {children}
    </p>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="text-muted-foreground/60 shrink-0">{icon}</span>
      <span className="text-muted-foreground w-32 shrink-0 text-sm">
        {label}
      </span>
      <span className="text-foreground min-w-0 truncate text-sm">{value}</span>
    </div>
  );
}
