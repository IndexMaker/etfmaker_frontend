import { EcosystemPage } from "@/components/views/ecosystem/ecosystem";
import { Suspense } from "react";

export default function Ecosystem() {
  return (
    <Suspense fallback={<div>Loading ecosystem...</div>}>
      <EcosystemPage />
    </Suspense>
  );
}
