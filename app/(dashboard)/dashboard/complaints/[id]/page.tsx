import Link from "next/link";
import { notFound } from "next/navigation";
import { FileDown } from "lucide-react";
import { ComplaintService } from "@/servers/services/complaint.service";
import { TechnicianService } from "@/servers/services/technician.service";
import { getCurrentUser } from "@/app/actions/user.actions";
import DynamicBreadcrumb from "@/components/root/DynamicBreadcrumb";
import PageHeader from "@/components/root/PageHeader";
import ComplaintDetail from "@/components/root/complaints/detail/ComplaintDetail";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [complaint, user] = await Promise.all([
    ComplaintService.getById(Number(id)),
    getCurrentUser(),
  ]);

  if (!complaint) notFound();

  // Field officers may only open complaints assigned to them.
  if (user.role === "TECHNICIAN") {
    const tech = await TechnicianService.getByUserId(user.id);
    if (!tech || complaint.technicianId !== tech.id) notFound();
  }

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

        {complaint.status === "RESOLVED" && (
          <Button asChild variant="outline" className="shrink-0">
            <Link href={`/print/complaints/${complaint.id}`} target="_blank">
              <FileDown size={16} />
              Export PDF
            </Link>
          </Button>
        )}
      </div>

      <ComplaintDetail
        complaint={complaint}
        technicians={technicians}
        role={user.role}
      />
    </main>
  );
}
