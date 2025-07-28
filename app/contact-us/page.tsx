
import { ContactUSPage } from "@/components/views/contact-us/contact-us";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function ContactUS() {
  redirect('/');
  return (
    <Suspense fallback={<div>Loading calendly...</div>}>
      <ContactUSPage />
    </Suspense>
  );
}
