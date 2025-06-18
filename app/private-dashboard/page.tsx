"use client"
import Dashboard from "@/components/views/Dashboard/dashboard";
import { AdminDashboard } from "@/components/views/private-dashboard/admin-dashboard";
import { Suspense, useEffect } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { useRouter } from "next/navigation";
export default function PrivateDashboard() {
  const router = useRouter();

  const { isAdmin } = useWallet();
  useEffect(() => {
    if (!isAdmin) {
      router.push('/')
    }
  }, [isAdmin, router])

  if (!isAdmin) return null // Redirect will happen
  
  return (
    <Suspense fallback={<div>Loading FundMaker...</div>}>
      <Dashboard>
        <AdminDashboard />
      </Dashboard>
    </Suspense>
  );
}
