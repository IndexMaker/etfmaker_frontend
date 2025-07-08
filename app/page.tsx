import Logo from "@/components/icons/logo";
import Dashboard from "@/components/views/Dashboard/dashboard";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="bg-background w-[100vw] h-[100vh] flex items-center justify-center">
          <Logo className="w-20 h-20 text-muted" />
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
}
