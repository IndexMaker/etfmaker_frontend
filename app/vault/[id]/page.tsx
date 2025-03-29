"use client";
import { notFound, useParams } from "next/navigation";
import { getVaultById } from "@/lib/data";
import { VaultDetailPage } from "@/components/views/vault/vault-detail";

export default function VaultPage() {
  const params = useParams();
  const vault_id = params.id?.toString();
  if (!vault_id) {
    notFound();
  }
  const vault = getVaultById(vault_id);

  if (!vault) {
    notFound();
  }

  return <VaultDetailPage vault={vault} />;
}
