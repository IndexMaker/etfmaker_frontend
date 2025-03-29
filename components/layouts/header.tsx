"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NetworkSwitcher } from "../elements/network-switcher";
import { CustomButton } from "../ui/custom-button";
import Navigation from "../icons/navigation";
import { LanguageSelector } from "../elements/language-selector";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const pathname = usePathname();

  // Generate breadcrumb items
  const pathSegments = pathname.split("/").filter((segment) => segment);

  // Only show breadcrumb if there is a second segment (i.e., more than one)
  const shouldShowBreadcrumb = pathSegments.length > 1;

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = `../${pathSegments.slice(0, index + 1).join("/")}`;
    return {
      name: segment.charAt(0).toUpperCase() + segment.slice(1), // Capitalize first letter
      href: path,
    };
  });

  return (
    <header className="flex h-[50px] pt-0 shrink-0 items-center border-b border-transparent bg-[#15181a] px-[11px] md:px-[40px]">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Navigation className="h-6 w-6 text-white" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Breadcrumb (only if there's a second segment) */}
      {shouldShowBreadcrumb && (
        <nav className="text-sm text-gray-400 hidden md:flex">
          <ol className="flex items-center space-x-2">
            {breadcrumbItems.map((item, index) => (
              <li key={item.href} className="flex items-center">
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-[#ffffff80] text-semibold text-[13px]">{item.name}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-[#ffffff80] text-semibold hover:text-white text-[13px]"
                  >
                    {item.name}
                    <span className="mx-2 text-[#ffffff80] text-semibold text-[13px]"> / </span>
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="md:hidden">
        <Maximize2 className="h-6 w-6 text-primary" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <LanguageSelector />
        <NetworkSwitcher />

        <CustomButton className="bg-[#2470ff] hover:bg-blue-700 text-[11px] rounded-[3px] cursor-pointer">
          Connect Wallet
        </CustomButton>
      </div>
    </header>
  );
}
