"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  HelpCircle,
  MessageSquare,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Blockchain from "../icons/blockchain";
import { usePathname } from "next/navigation";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  // Function to check if a route is active
  const isRouteActive = (href: string): boolean => {
    // Exact match for home page
    if (href === "/" && pathname === "/") {
      return true;
    }

    // For other routes, check if pathname starts with href (for nested routes)
    // But only if href is not the home page
    if (href !== "/" && pathname.startsWith(href)) {
      return true;
    }

    return false;
  };
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#202426] backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed text-xs font-bold inset-y-0 left-0 z-50 flex flex-col bg-[#202426] transition-all duration-300 ease-in-out md:relative md:z-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "w-16" : "w-[250px]"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-[50px] items-center",
            collapsed ? "justify-center" : "px-4"
          )}
        >
          <Link href="/" className="flex items-center">
            <Blockchain className="h-6 w-6 text-primary" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-3 md:hidden"
            onClick={() => setOpen(false)}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col justify-between h-full">
          <nav
            className={cn(
              "space-y-1 text-xs font-bold",
              collapsed ? "px-0" : "px-2"
            )}
          >
            <NavItem href="/" active={isRouteActive("/")} icon={TrendingUp} collapsed={collapsed}>
              Earn
            </NavItem>
            <NavItem href="/ecosystem" active={isRouteActive("/ecosystem")} icon={Settings} collapsed={collapsed}>
              Ecosystem
            </NavItem>
          </nav>

          <div
            className={cn(
              "pt-4 text-xs font-bold",
              collapsed ? "hidden" : "px-0"
            )}
          >
            <div className={cn("space-y-1", collapsed ? "px-0" : "px-2")}>
              <NavItem href="/analytics" active={isRouteActive("/analytics")} icon={BarChart2} collapsed={collapsed}>
                Analytics
              </NavItem>
              <NavItem
                href="/app"
                icon={Settings}
                external
                collapsed={collapsed}
              >
                Morpho App V2
              </NavItem>
              <NavItem
                href="/delegate"
                icon={ExternalLink}
                external
                collapsed={collapsed}
              >
                Delegate
              </NavItem>
              <NavItem
                href="/docs"
                icon={FileText}
                external
                collapsed={collapsed}
              >
                Morpho Docs
              </NavItem>
              <NavItem
                href="/optimizers"
                icon={Settings}
                external
                collapsed={collapsed}
              >
                Morpho Optimizers
              </NavItem>
              <NavItem
                href="/feedback"
                icon={MessageSquare}
                external
                collapsed={collapsed}
              >
                Feedback
              </NavItem>
              <NavItem
                href="/terms"
                icon={HelpCircle}
                external
                collapsed={collapsed}
              >
                Terms of Use
              </NavItem>
            </div>
          </div>
        </div>

        {/* Theme toggle and collapse/expand button */}
        <div
          className={cn(
            "flex h-12 items-center text-zinc-400 hover:text-white",
            collapsed ? "justify-center" : "px-4"
          )}
        >
          {collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(false)}
              className="hover:bg-transparent cursor-pointer hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Expand sidebar</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(true)}
              className="hover:bg-transparent float-right cursor-pointer hover:text-white ml-auto"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Collapse sidebar</span>
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  active?: boolean;
  external?: boolean;
  collapsed?: boolean;
}

function NavItem({
  href,
  icon: Icon,
  children,
  active,
  external,
  collapsed,
}: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-sm py-[6px] text-xs font-medium transition-colors",
        collapsed ? "justify-center px-0" : "px-[10px]",
        active
          ? "bg-[#fafafa1a] text-white"
          : "text-zinc-400 hover:bg-[#fafafa20] hover:text-white"
      )}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      <Icon className="h-4 w-4" />
      {!collapsed && (
        <>
          <span>{children}</span>
          {external && <ExternalLink className="ml-auto h-4 w-4 opacity-70" />}
        </>
      )}
    </Link>
  );
}
