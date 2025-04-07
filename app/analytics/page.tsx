import { AnalyticsPage } from "@/components/views/analytics/analytics";
import { Suspense } from "react";

export default function Analytics() {
  return (
    <Suspense fallback={<div>Loading analytics...</div>}>
      <AnalyticsPage />
    </Suspense>
  );
}
