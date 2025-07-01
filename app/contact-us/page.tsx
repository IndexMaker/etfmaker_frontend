
import { ContactUSPage } from "@/components/views/contact-us/contact-us";
import { Suspense } from "react";

export default function ContactUS() {
  return (
    <Suspense fallback={<div>Loading calendly...</div>}>
      <ContactUSPage />
    </Suspense>
  );
}
