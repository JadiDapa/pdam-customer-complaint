import { notFound, redirect } from "next/navigation";
import { ComplaintService } from "@/servers/services/complaint.service";
import { CustomerService } from "@/servers/services/customer.service";
import { TechnicianService } from "@/servers/services/technician.service";
import { getCurrentUser } from "@/app/actions/user.actions";
import PageHeader from "@/components/root/PageHeader";
import DynamicBreadcrumb from "@/components/root/DynamicBreadcrumb";
import CustomerComplaintDetail from "@/components/root/complaints/CustomerComplaintDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const complaint = await ComplaintService.getById(Number(id));

  if (!complaint) notFound();

  if (user.role === "TECHNICIAN") {
    const technician = await TechnicianService.getByUserId(user.id);
    if (!technician || complaint.technicianId !== technician.id) redirect("/");
  } else {
    const customer = await CustomerService.getByUserId(user.id);
    if (!customer || complaint.customerId !== customer.id) redirect("/");
  }

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <DynamicBreadcrumb />
        <PageHeader
          title={complaint.title}
          subtitle={`Keluhan #${complaint.id}`}
        />
      </div>

      <CustomerComplaintDetail complaint={complaint} />
    </main>
  );
}
