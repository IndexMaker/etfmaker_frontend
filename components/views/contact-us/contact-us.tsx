"use client";

import type React from "react";

import Dashboard from "../Dashboard/dashboard";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "next-themes";
import { CalendlyPage } from "@/components/calendly/calendly";

export function ContactUSPage() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  return (
    <Dashboard>
      <CalendlyPage />
    </Dashboard>
  );
}