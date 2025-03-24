"use client"

import { Bell, Maximize2, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NetworkSwitcher } from "../elements/network-switcher"
import { CustomButton } from "../ui/custom-button"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  return (
    <header className="flex h-[50px] border-bottom-[1px] shrink-0 items-center bg-[#15181a] px-4 md:px-6">
      <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="md:hidden">
        <Maximize2 className="h-6 w-6 text-primary" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <NetworkSwitcher />

        <CustomButton className="bg-blue-600 hover:bg-blue-700 text-xs rounded-[3px] cursor-pointer">Connect Wallet</CustomButton>
      </div>
    </header>
  )
}

