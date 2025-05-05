"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Dashboard from "@/components/views/Dashboard/dashboard";

export default function NotFound() {
  return (
    <Dashboard>
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-lg">Project not found</p>
        <Button asChild variant="default">
          <Link href="/ecosystem">Back to Ecosystem</Link>
        </Button>
      </div>
    </Dashboard>
  );
}
