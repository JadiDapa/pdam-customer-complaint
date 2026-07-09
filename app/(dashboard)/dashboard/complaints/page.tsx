import { Suspense } from "react";
import PageHeader from "@/components/root/PageHeader";
import { ComplaintService } from "@/servers/services/complaint.service";
import { TechnicianService } from "@/servers/services/technician.service";
import DynamicBreadcrumb from "@/components/root/DynamicBreadcrumb";
import ComplaintTable from "@/components/root/complaints/ComplaintTable";
import TodayComplaints from "@/components/root/complaints/TodayComplaints";
import ComplaintSearchBar from "@/components/root/complaints/ComplaintSearchBar";
import ServerPagination from "@/components/root/ServerPagination";
import ComplaintPageStats from "@/components/root/complaints/ComplaintPageStats";
import ComplaintStatusDonut from "@/components/root/complaints/ComplaintStatusDonut";
import { ComplaintStatus, DisturbanceType } from "@/generated/prisma";
import { getCurrentUser } from "@/app/actions/user.actions";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    customerName?: string;
    technicianId?: string;
    disturbanceType?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function ComplaintPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = Math.max(Number(params.page ?? 1), 1);
  const search = params.search?.trim() || undefined;
  const customerName = params.customerName?.trim() || undefined;

  const statusParam = params.status as ComplaintStatus | undefined;
  const status =
    statusParam && Object.values(ComplaintStatus).includes(statusParam)
      ? statusParam
      : undefined;

  const disturbanceTypeParam = params.disturbanceType as
    | DisturbanceType
    | undefined;
  const disturbanceType =
    disturbanceTypeParam &&
    Object.values(DisturbanceType).includes(disturbanceTypeParam)
      ? disturbanceTypeParam
      : undefined;

  // Field officers (TECHNICIAN) only ever see complaints assigned to them —
  // this scope overrides any technicianId filter from the query string.
  const user = await getCurrentUser();
  const isTechnician = user.role === "TECHNICIAN";
  let scopedTechnicianId: number | undefined;
  if (isTechnician) {
    const tech = await TechnicianService.getByUserId(user.id);
    // Fall back to a non-existent id so a mislinked account sees nothing.
    scopedTechnicianId = tech?.id ?? -1;
  }

  const technicianId =
    scopedTechnicianId ??
    (params.technicianId ? Number(params.technicianId) : undefined);

  // dateFrom = start of selected day, dateTo = end of selected day (exclusive next day)
  let createdAfter: Date | undefined;
  let createdBefore: Date | undefined;
  if (params.dateFrom) {
    createdAfter = new Date(params.dateFrom);
    createdAfter.setHours(0, 0, 0, 0);
  }
  if (params.dateTo) {
    createdBefore = new Date(params.dateTo);
    createdBefore.setDate(createdBefore.getDate() + 1);
    createdBefore.setHours(0, 0, 0, 0);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [{ items, meta }, todayComplaints, stats, { items: technicians }] =
    await Promise.all([
      ComplaintService.list({
        page,
        pageSize: 20,
        title: search,
        status,
        customerName,
        technicianId,
        disturbanceType,
        createdAfter,
        createdBefore,
      }),
      ComplaintService.list({
        pageSize: 100,
        createdAfter: today,
        createdBefore: tomorrow,
        technicianId: scopedTechnicianId,
      }),
      ComplaintService.getStats(),
      TechnicianService.list({ pageSize: 100 }),
    ]);

  return (
    <main className="min-h-screen w-full space-y-6 md:rounded-2xl">
      <div className="flex flex-col items-center justify-between lg:flex-row">
        <div className="space-y-2">
          <DynamicBreadcrumb />
          <PageHeader
            title="Complaint List"
            subtitle={
              isTechnician
                ? "Keluhan yang ditugaskan kepada Anda"
                : "Manage all complaints"
            }
          />
        </div>
      </div>

      <TodayComplaints
        complaints={todayComplaints.items}
        linkBase="/dashboard/complaints"
      />

      <div className="space-y-3">
        <h2 className="text-foreground text-xl font-medium tracking-tight">
          Complaint List
        </h2>

        {!isTechnician && (
          <div className="">
            <ComplaintPageStats stats={stats} />
          </div>
        )}

        <Suspense>
          <ComplaintSearchBar
            search={search}
            status={status}
            customerName={customerName}
            technicianId={isTechnician ? undefined : technicianId}
            disturbanceType={disturbanceType}
            dateFrom={params.dateFrom}
            dateTo={params.dateTo}
            technicians={
              isTechnician
                ? []
                : technicians.map((t) => ({ id: t.id, fullname: t.fullname }))
            }
          />
        </Suspense>

        <ComplaintTable
          complaints={items}
          linkBase="/dashboard/complaints"
          hidePagination
        />

        <Suspense>
          <ServerPagination
            page={page}
            totalPages={meta.totalPages}
            total={meta.total}
            pageSize={meta.pageSize}
          />
        </Suspense>
      </div>
    </main>
  );
}
