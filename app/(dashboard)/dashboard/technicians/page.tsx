import PageHeader from "@/components/root/PageHeader";
import DynamicBreadcrumb from "@/components/root/DynamicBreadcrumb";
import { TechnicianService } from "@/servers/services/technician.service";
import TechnicianTable from "@/components/root/user/technician/TechnicianTable";
import TechnicianStats from "@/components/root/user/technician/TechnicianStats";
import CreateTechnicianDialog from "@/components/root/user/technician/CreateTechnicianDialog";

export default async function TechnicianPage() {
  const technicians = await TechnicianService.getAll();
  const activeThisMonth = technicians.filter((t) => t.complaints.length > 0).length;

  return (
    <main className="min-h-screen w-full space-y-6 md:rounded-2xl">
      <div className="flex flex-col items-center justify-between lg:flex-row">
        <div className="space-y-2">
          <DynamicBreadcrumb />
          <PageHeader title="Technician List" subtitle="Manage all technicians" />
        </div>
        <CreateTechnicianDialog />
      </div>

      <TechnicianStats
        total={technicians.length}
        activeThisMonth={activeThisMonth}
        inactiveThisMonth={technicians.length - activeThisMonth}
      />

      <div className="space-y-2">
        <h2 className="text-foreground text-xl font-medium tracking-tight">
          Technician List
        </h2>
        <TechnicianTable technicians={technicians} />
      </div>
    </main>
  );
}
