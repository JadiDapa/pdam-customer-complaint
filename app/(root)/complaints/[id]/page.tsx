import { notFound, redirect } from "next/navigation";
import { ComplaintService } from "@/servers/services/complaint.service";
import { CustomerService } from "@/servers/services/customer.service";
import { getCurrentUser } from "@/app/actions/user.actions";
import PageHeader from "@/components/root/PageHeader";
import DynamicBreadcrumb from "@/components/root/DynamicBreadcrumb";
import CustomerComplaintDetail from "@/components/root/complaints/CustomerComplaintDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerComplaintDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const customer = await CustomerService.getByUserId(user.id);

  if (!customer) redirect("/");

  const complaint = await ComplaintService.getById(Number(id));

  if (!complaint) notFound();

  if (complaint.customerId !== customer.id) redirect("/");

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
