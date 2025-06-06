"use client";

import { PopupModal } from "react-calendly";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "next-themes";
import { useEffect } from "react";

interface CalendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendlyModal({ isOpen, onClose }: CalendlyModalProps) {
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
          // Add your post-scheduling logic here
          // Example: track analytics, show confirmation, etc.
        }
      });
    }

    return () => {
      window.removeEventListener("message", () => {});
    };
  }, []);

  if (typeof document === "undefined") return null;

  return (
    <PopupModal
      url={CALENDLY_ACCOUNT || ''}
      onModalClose={onClose}
      open={isOpen}
      rootElement={document.body}
      pageSettings={{
        backgroundColor: theme === "light" ? "ffffff" : "1a1a1a",
        hideEventTypeDetails: false,
        hideLandingPageDetails: false,
        primaryColor: theme === "dark" ? "3b82f6" : "2563eb", // Blue shades
        textColor: theme === "light" ? "4d5055" : "e5e7eb",
        hideGdprBanner: true,
      }}
      prefill={{
        name: "", // Prefill name if available
        email: "", // Prefill email if available
        customAnswers: {
          a1: "" // Prefill custom questions
        }
      }}
      utm={{
        utmCampaign: "Website Scheduling",
        utmSource: "Website",
        utmMedium: "PopupModal"
      }}
    />
  );
}
