"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Maximize2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NetworkSwitcher } from "../elements/network-switcher";
import { CustomButton } from "../ui/custom-button";

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

  console.log(breadcrumbItems)

  return (
    <header className="flex h-[50px] shrink-0 items-center bg-[#15181a] px-[40px] md:px-[40px]">
      <Button
        variant="ghost"
        size="icon"
        className="mr-2 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Breadcrumb (only if there's a second segment) */}
      {shouldShowBreadcrumb && (
        <nav className="text-sm text-gray-400">
          <ol className="flex items-center space-x-2">
            {breadcrumbItems.map((item, index) => (
              <li key={item.href} className="flex items-center">
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-white">{item.name}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-white"
                  >
                    {item.name}
                    <span className="mx-2"> / </span>
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
        <NetworkSwitcher />

        <CustomButton className="bg-blue-600 hover:bg-blue-700 text-xs rounded-[3px] cursor-pointer">
          Connect Wallet
        </CustomButton>
      </div>
    </header>
  );
}
