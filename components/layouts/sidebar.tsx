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
  Moon,
  Settings,
  Sun,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import DARK from "../../public/logo/dark.png";
import LIGHT from "../../public/logo/light.png";
import Image from "next/image";
import RightArrow from "../icons/right-arrow";
import EcosystemSvg from "../icons/ecosystem";
import AnalyticsSvg from "../icons/analytics";
import Morpho from "../icons/morpho";
import MorphoSvg from "../icons/morphoSvg";
import MorphoDoc from "../icons/morphoDoc";
import Feedback from "../icons/feedback";
import TOS from "../icons/tos";
import Blockchain from "../icons/blockchain";

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
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed text-xs font-bold inset-y-0 left-0 z-50 flex flex-col bg-[#202426] transition-all duration-300 ease-in-out md:relative md:z-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "w-[52px] px-[10px]" : "w-[250px]"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-[52px] items-center",
            collapsed ? "justify-center" : "px-5"
          )}
        >
          <Link href="/" className="flex items-center">
            {collapsed ? (
              //   <Image
              //     src={DARK}
              //     alt={"LOGO"}
              //     width={30}
              //     height={12}
              //     className="object-none text-primary"
              //   />
              <Blockchain className="w-6 h-6" />
            ) : (
              //   <Image
              //     src={DARK}
              //     alt={"LOGO"}
              //     width={90}
              //     height={24}
              //     className="text-primary"
              //   />
              <Blockchain className="w-6 h-6" />
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-3 md:hidden"
            onClick={() => setOpen(false)}
          >
            <X className="h-6 w-6 text-white" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col justify-between h-full">
          <nav
            className={cn(
              "space-y-1 text-xs font-bold",
              collapsed ? "px-0" : "px-[10px]"
            )}
          >
            <NavItem
              href="/"
              active={isRouteActive("/")}
              className="text-[13px] text-[#ffffffcc] py-[6px] px-[10px] h-[32px]"
              icon={TrendingUp}
              collapsed={collapsed}
            >
              Earn
            </NavItem>
            <NavItem
              href="/ecosystem"
              active={isRouteActive("/ecosystem")}
              className="text-[13px] text-[#ffffffcc] py-[6px] px-[10px] h-[32px]"
              icon={EcosystemSvg}
              collapsed={collapsed}
              iconClassName={"p-[1px]"}
            >
              Ecosystem
            </NavItem>
          </nav>

          <div
            className={cn(
              "pt-4 text-xs font-bold",
              collapsed ? "hidden" : "px-0"
            )}
          >
            <div className={cn("space-y-1", collapsed ? "px-0" : "px-[14px]")}>
              <NavItem
                href="/analytics"
                active={isRouteActive("/analytics")}
                className="text-[#ffffff80] h-[28px] px-[6px] py-[2px]"
                icon={AnalyticsSvg}
                collapsed={collapsed}
                iconClassName="mr-[2px]"
              >
                Analytics
              </NavItem>
              <NavItem
                href="https://app.morpho.org/"
                icon={MorphoSvg}
                external
                className="text-[#ffffff80] h-[28px] px-[6px] py-[2px]"
                collapsed={collapsed}
                iconClassName="mr-[2px]"
              >
                Morpho App V2
              </NavItem>
              <NavItem
                href="https://delegate.morpho.org/"
                icon={MorphoSvg}
                external
                className="text-[#ffffff80] h-[28px] px-[6px] py-[2px]"
                collapsed={collapsed}
                iconClassName="mr-[2px]"
              >
                Delegate
              </NavItem>
              <NavItem
                href="https://docs.morpho.org/"
                icon={MorphoDoc}
                external
                className="text-[#ffffff80] h-[28px] px-[6px] py-[2px]"
                collapsed={collapsed}
                iconClassName="mr-[2px]"
              >
                Morpho Docs
              </NavItem>
              <NavItem
                href="https://optimizers.morpho.org/"
                icon={MorphoSvg}
                external
                className="text-[#ffffff80] h-[28px] px-[6px] py-[2px]"
                collapsed={collapsed}
                iconClassName="mr-[2px]"
              >
                Morpho Optimizers
              </NavItem>
              <NavItem
                href="https://docs.google.com/forms/d/e/1FAIpQLSc3ZpfvlcBmMgCDfg6ahM6cKNm003bbns5Ao6QfXJNfcfpATw/viewform?embedded=true"
                icon={Feedback}
                external
                className="text-[#ffffff80] h-[28px] px-[6px] py-[2px]"
                collapsed={collapsed}
                iconClassName="mr-[2px]"
              >
                Feedback
              </NavItem>
              <NavItem
                href="https://cdn.morpho.org/documents/Morpho_Terms_of_Use.pdf"
                icon={TOS}
                external
                className="text-[#ffffff80] h-[28px] px-[6px] py-[2px]"
                collapsed={collapsed}
                iconClassName="mr-[2px]"
              >
                Terms of Use
              </NavItem>
            </div>
          </div>
        </div>

        {/* Theme toggle and collapse/expand button */}
        <div
          className={cn(
            "flex h-16 items-center text-zinc-400 hover:text-white",
            collapsed
              ? "justify-center"
              : "pt-[24px] pr-[10px] pb-[16px] pl-[16px]"
          )}
        >
          {collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(false)}
              className="hover:bg-transparent cursor-pointer hover:text-white h-4 w-4 p-1"
            >
              <div>
                <svg
                  width="20"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="#e5e5e5"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.14645 11.1464C1.95118 11.3417 1.95118 11.6583 2.14645 11.8536C2.34171 12.0488 2.65829 12.0488 2.85355 11.8536L6.85355 7.85355C7.04882 7.65829 7.04882 7.34171 6.85355 7.14645L2.85355 3.14645C2.65829 2.95118 2.34171 2.95118 2.14645 3.14645C1.95118 3.34171 1.95118 3.65829 2.14645 3.85355L5.79289 7.5L2.14645 11.1464ZM8.14645 11.1464C7.95118 11.3417 7.95118 11.6583 8.14645 11.8536C8.34171 12.0488 8.65829 12.0488 8.85355 11.8536L12.8536 7.85355C13.0488 7.65829 13.0488 7.34171 12.8536 7.14645L8.85355 3.14645C8.65829 2.95118 8.34171 2.95118 8.14645 3.14645C7.95118 3.34171 7.95118 3.65829 8.14645 3.85355L11.7929 7.5L8.14645 11.1464Z"
                    fill="var(--colors-icon-secondary)"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <span className="sr-only">Expand sidebar</span>
            </Button>
          ) : (
            <div className="flex justify-start items-center p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(true)}
                className="hover:bg-transparent float-right cursor-pointer hover:text-white h-4 w-4"
              >
                <div>
                  <svg
                    width="20"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="#e5e5e5"
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.85355 3.85355C7.04882 3.65829 7.04882 3.34171 6.85355 3.14645C6.65829 2.95118 6.34171 2.95118 6.14645 3.14645L2.14645 7.14645C1.95118 7.34171 1.95118 7.65829 2.14645 7.85355L6.14645 11.8536C6.34171 12.0488 6.65829 12.0488 6.85355 11.8536C7.04882 11.6583 7.04882 11.3417 6.85355 11.1464L3.20711 7.5L6.85355 3.85355ZM12.8536 3.85355C13.0488 3.65829 13.0488 3.34171 12.8536 3.14645C12.6583 2.95118 12.3417 2.95118 12.1464 3.14645L8.14645 7.14645C7.95118 7.34171 7.95118 7.65829 8.14645 7.85355L12.1464 11.8536C12.3417 12.0488 12.6583 12.0488 12.8536 11.8536C13.0488 11.6583 13.0488 11.3417 12.8536 11.1464L9.20711 7.5L12.8536 3.85355Z"
                      fill="var(--colors-icon-secondary)"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <span className="sr-only">Collapse sidebar</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent float-right cursor-pointer hover:text-white pl-1"
              >
                <Sun className="h-5 w-5" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
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
  className?: string;
  iconClassName?: string;
}

function NavItem({
  href,
  icon: Icon,
  children,
  active,
  external,
  collapsed,
  className,
  iconClassName,
}: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-sm py-[6px] font-[500] transition-colors ",
        collapsed ? "justify-center px-0" : "px-[10px]",
        className,
        active
          ? "bg-[#fafafa1a] text-white"
          : " hover:bg-[#fafafa20] hover:text-white"
      )}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      <Icon
        className={`h-4 w-4 ${active ? `text-[#2470ff]` : ``} ${
          iconClassName || ""
        }`}
      />
      {!collapsed && (
        <>
          <span className="">{children}</span>
          {external && (
            <RightArrow
              className="ml-auto rotate-135 p-[2px]"
              width="17px"
              height="17px"
            />
          )}
        </>
      )}
    </Link>
  );
}
