import { notFound } from "next/navigation";
import { ComplaintService } from "@/servers/services/complaint.service";
import { TechnicianService } from "@/servers/services/technician.service";
import DynamicBreadcrumb from "@/components/root/DynamicBreadcrumb";
import PageHeader from "@/components/root/PageHeader";
import ComplaintDetail from "@/components/root/complaints/detail/ComplaintDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailPage({ params }: PageProps) {
  const { id } = await params;
  const complaint = await ComplaintService.getById(Number(id));

  if (!complaint) notFound();

  const technicians = await TechnicianService.getAll();

  return (
    <main className="min-h-screen w-full space-y-6 md:rounded-2xl">
      <div className="flex flex-col items-start justify-between gap-2 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <DynamicBreadcrumb />
          <PageHeader
            title={complaint.title}
            subtitle={`Complaint #${complaint.id} · ${complaint.customer?.customerId ?? "No Customer"}`}
          />
        </div>
      </div>

      <ComplaintDetail complaint={complaint} technicians={technicians} />
    </main>
  );
}
