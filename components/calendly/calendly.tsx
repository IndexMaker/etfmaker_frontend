"use client";

import { InlineWidget } from "react-calendly";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export function CalendlyPage() {
  const { t } = useLanguage();
  const CALENDLY_ACCOUNT = process.env.NEXT_PUBLIC_CALENDLY_ACCOUNT;
  const { theme } = useTheme();

  // Event handlers for Calendly events
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Event when scheduled successfully
      window.addEventListener("message", (e) => {
        if (e.data.event === "calendly.event_scheduled") {
          console.log("Meeting scheduled:", e.data.payload);
        }
      });
    }

    return () => {
      window.removeEventListener("message", () => {});
    };
  }, []);

  return (
    <div className="space-y-6 relative flex h-auto">
      <div className="flex-1 space-y-6 overflow-auto">
        <div className="flex flex-col justify-between">
          <h1 className="text-[34px] w-full text-primary flex items-center text-center">
            Want to learn more? Schedule time with our team now
          </h1>
          <div className="min-h-[800px] h-[calc(100vh-300px)] pt-2">
            <InlineWidget
              url={CALENDLY_ACCOUNT || ""}
              pageSettings={{
                backgroundColor: "ff0000",
                hideEventTypeDetails: false,
                hideLandingPageDetails: false,
                //   primaryColor: theme === "dark" ? "3b82f6" : "2563eb", // Blue shades
                //   textColor: theme === "light" ? "4d5055" : "e5e7eb",
                hideGdprBanner: true,
              }}
              prefill={{
                name: "", // Prefill name if available
                email: "", // Prefill email if available
                customAnswers: {
                  a1: "", // Prefill custom questions
                },
              }}
              utm={{
                utmCampaign: "Website Scheduling",
                utmSource: "Website",
                utmMedium: "InlineWidget",
              }}
              styles={{
                height: "100%",
                width: "100%",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
