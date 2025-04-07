import Dashboard from "@/components/views/Dashboard/dashboard";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading ecosystem...</div>}>
      <Dashboard />
    </Suspense>
  );
}
