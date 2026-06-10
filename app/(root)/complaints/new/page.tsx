import { redirect } from "next/navigation";
import PageHeader from "@/components/root/PageHeader";
import DynamicBreadcrumb from "@/components/root/DynamicBreadcrumb";
import { getCurrentUser } from "@/app/actions/user.actions";
import { CustomerService } from "@/servers/services/customer.service";
import { ComplaintService } from "@/servers/services/complaint.service";
import CreateComplaintForm from "@/components/root/complaints/CreateComplaintForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function NewComplaintPage() {
  const user = await getCurrentUser();

  if (user.role === "TECHNICIAN") {
    redirect("/");
  }

  const customer = await CustomerService.getByUserId(user.id);

  const hasActive = customer
    ? await ComplaintService.hasActiveComplaint(customer.id)
    : false;

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <DynamicBreadcrumb />
        <PageHeader
          title="Buat Keluhan"
          subtitle="Ajukan keluhan gangguan air"
        />
      </div>

      {hasActive ? (
        <Card className="max-w-lg border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="flex flex-col items-start gap-4 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-yellow-600" />
              <div>
                <p className="text-foreground font-semibold">
                  Masih ada keluhan aktif
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Kamu hanya bisa memiliki 1 keluhan yang aktif pada satu waktu.
                  Tunggu hingga keluhan yang ada selesai sebelum mengajukan
                  keluhan baru.
                </p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="cursor-pointer">
                Lihat Keluhan Aktif
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <CreateComplaintForm customerId={customer?.id} />
      )}
    </main>
  );
}
