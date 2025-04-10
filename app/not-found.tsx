"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home after 2 seconds (or immediately if you want)
    router.push("/");
  }, []);

  return <p>Redirecting to home...</p>;
}
