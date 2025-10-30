import { getUser } from '@/lib/supabase-server';
import AdminSidebarNew from '@/components/admin/AdminSidebarNew';
import AdminHeader from '@/components/admin/AdminHeader';
import { getMaintenanceSettings } from '@/app/actions/settings';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  // If no user, render without layout (for login page)
  if (!user) {
    return children;
  }

  // Get maintenance mode status
  const maintenanceSettings = await getMaintenanceSettings();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <AdminSidebarNew />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <AdminHeader user={user} maintenanceMode={maintenanceSettings.enabled} />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
