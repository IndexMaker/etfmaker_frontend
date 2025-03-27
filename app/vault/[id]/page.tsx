import { notFound } from "next/navigation"
import { getVaultById } from "@/lib/data"
import { VaultDetailPage } from "@/components/views/vault/vault-detail"

interface VaultPageProps {
  params: {
    id: string
  }
}

export default function VaultPage({ params }: VaultPageProps) {
  const vault = getVaultById(params.id)

  if (!vault) {
    notFound()
  }

  return <VaultDetailPage vault={vault} />
}

