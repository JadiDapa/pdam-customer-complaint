import PageHeader from "@/components/root/PageHeader";
import { CustomerService } from "@/servers/services/customer.service";
import DynamicBreadcrumb from "@/components/root/DynamicBreadcrumb";
import CreateCustomerDialog from "@/components/root/user/customer/CreateCustomerDialog";
import ImportCustomersDialog from "@/components/root/user/customer/ImportCustomersDialog";
import CustomerStats from "@/components/root/user/customer/CustomerStats";
import CustomerTable from "@/components/root/user/customer/CustomerTable";

export default async function CustomerPage() {
  const customers = await CustomerService.getAll();
  const activeThisMonth = customers.filter((c) => c.complaints.length > 0).length;

  return (
    <main className="min-h-screen w-full space-y-6 md:rounded-2xl">
      <div className="flex flex-col items-center justify-between lg:flex-row">
        <div className="space-y-2">
          <DynamicBreadcrumb />
          <PageHeader title="Customer List" subtitle="Manage all customers" />
        </div>
        <div className="flex items-center gap-2">
          <ImportCustomersDialog />
          <CreateCustomerDialog />
        </div>
      </div>

      <CustomerStats
        total={customers.length}
        activeThisMonth={activeThisMonth}
        inactiveThisMonth={customers.length - activeThisMonth}
      />

      <div className="space-y-2">
        <h2 className="text-foreground text-xl font-medium tracking-tight">
          Customer List
        </h2>
        <CustomerTable customers={customers} />
      </div>
    </main>
  );
}
