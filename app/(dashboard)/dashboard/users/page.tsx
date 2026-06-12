import PageHeader from "@/components/root/PageHeader";
import { UserService } from "@/servers/services/user.service";
import DynamicBreadcrumb from "@/components/root/DynamicBreadcrumb";
import UserStats from "@/components/root/user/UserStats";
import UserTable from "@/components/root/user/UserTable";

export default async function UserPage() {
  const users = await UserService.getAll();

  return (
    <main className="min-h-screen w-full space-y-6 md:rounded-2xl">
      <div className="flex flex-col items-center justify-between lg:flex-row">
        <div className="space-y-2">
          <DynamicBreadcrumb />
          <PageHeader title="User List" subtitle="Manage all users" />
        </div>
        {/* <CreateUserDialog /> */}
      </div>

      <UserStats users={users} />

      <div className="space-y-2">
        <h2 className="text-foreground text-xl font-medium tracking-tight">
          User List
        </h2>
        <UserTable users={users} />
      </div>
    </main>
  );
}
