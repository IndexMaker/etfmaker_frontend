"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { VaultDocument } from "@/lib/types/vault";

interface VaultLiteratureProps {
  literature: VaultDocument[];
}

export function VaultLiteratureSection({ literature }: VaultLiteratureProps) {
  if (literature.length === 0) {
    return (
      <div className="bg-foreground rounded-lg p-6 border border-[#afafaf1a] text-center">
        <p className="text-zinc-400">No literature available for this vault.</p>
      </div>
    );
  }

  return (
    <div className="p-[10px] md:p-5 bg-foreground">
      <div className="grid custom-3xl-grid gap-x-8 gap-y-6">
        {literature.map((doc) => (
          <Link
            key={doc.id}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-3 items-center opacity-80 hover:opacity-100 transition-opacity"
          >
            <div className="flex-shrink-0 w-12 h-14 border border-zinc-700 rounded-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-4 h-4 border-b border-r border-zinc-700 rounded-br-sm"></div>
              <FileText className="absolute bottom-2 left-1/2 transform -translate-x-1/2 h-6 w-6 text-zinc-400" />
            </div>
            <div className="pt-0">
              <h3 className="text-secondary text-[12px] font-normal group-hover:text-primary transition-colors leading-[16px] overflow-hidden text-ellipsis whitespace-normal line-clamp-3">
                {doc.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
