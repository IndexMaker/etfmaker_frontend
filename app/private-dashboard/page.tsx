"use client"
import Dashboard from "@/components/views/Dashboard/dashboard";
import { AdminDashboard } from "@/components/views/private-dashboard/admin-dashboard";
import { Suspense } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { useRouter } from "next/navigation";
export default function PrivateDashboard() {
  const router = useRouter();

  const { isAdmin } = useWallet();
  if (!isAdmin) {
    router.push("/");
  }
  return (
    <Suspense fallback={<div>Loading FundMaker...</div>}>
      <Dashboard>
        <AdminDashboard />
      </Dashboard>
    </Suspense>
  );
}
