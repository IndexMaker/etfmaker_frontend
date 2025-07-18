import Dashboard from "@/components/views/Dashboard/dashboard";
import { AdminDashboard } from "@/components/views/private-dashboard/admin-dashboard";
import { Suspense} from "react";
export default function PrivateDashboard() {

  
  return (
    <Suspense fallback={<div>Loading IndexMaker...</div>}>
      <Dashboard>
        <AdminDashboard />
      </Dashboard>
    </Suspense>
  );
}
