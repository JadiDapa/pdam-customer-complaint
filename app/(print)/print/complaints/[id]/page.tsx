import { notFound } from "next/navigation";
import { ComplaintService } from "@/servers/services/complaint.service";
import ComplaintReport from "@/components/root/complaints/detail/ComplaintReport";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintReportPage({ params }: PageProps) {
  const { id } = await params;
  const complaint = await ComplaintService.getById(Number(id));

  if (!complaint) notFound();

  // The report is only available once the complaint is resolved.
  if (complaint.status !== "RESOLVED") notFound();

  return <ComplaintReport complaint={complaint} />;
}
