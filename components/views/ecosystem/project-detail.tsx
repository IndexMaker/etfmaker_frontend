"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Dashboard from "../Dashboard/dashboard";
import { Project } from "@/lib/data";
import { CustomButton } from "@/components/ui/custom-button";
import URL from "@/components/icons/url";
import Docs from "@/components/icons/docs";
import Social from "@/components/icons/social";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "next-themes";

interface ProjectDetailPageProps {
  project: Project;
}

export function ProjectDetailPage({ project }: ProjectDetailPageProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  return (
    <Dashboard>
      <div className="flex gap-15 flex-col">
        {/* Project Header */}
        <div className="flex items-end md:items-center justify-between h-[100px] md:h-[60px]">
          <div className="flex items-center gap-3 md:gap-5 flex-col md:flex-row">
            <div className="bg-foreground w-15 h-15 rounded-full flex items-center justify-center text-xl">
              <Image
                src={
                  theme == "light"
                    ? project.icon !== "brahma"
                      ? project.icon !== "moonwell"
                        ? project.icon !== "ionic" &&
                          project.icon !== "vaultcraft"
                          ? project.icon === "safe"
                            ? `https://cdn.morpho.org/v2/communication/images/${project.icon.toLowerCase()}-logo-bw.svg`
                            : `https://cdn.morpho.org/v2/communication/images/${project.icon.toLowerCase()}-logo-bw.png`
                          : `https://cdn.morpho.org/v2/communication/images/${project.icon.toLowerCase()}-logo-bw-dark.png`
                        : `https://cdn.morpho.org/v2/communication/images/${project.icon.toLowerCase()}-logo-bw-black.png`
                      : `https://cdn.morpho.org/v2/communication/images/${project.icon.toLowerCase()}-logo-bw-dark.png`
                    : project.icon !== "ionic"
                    ? `https://cdn.morpho.org/v2/communication/images/${project.icon.toLowerCase()}-logo-bw-white.png`
                    : `https://cdn.morpho.org/v2/communication/images/${project.icon.toLowerCase()}-logo-bw-light.png`
                }
                width={24}
                height={24}
                alt={project.name}
              />
            </div>
            <p className="text-[20px] md:text-[38px] font-normal text-primary h-[24px] md:h-full">
              {project.name}
            </p>
          </div>

          <CustomButton
            variant="default"
            className="hidden md:flex bg-[#2470ff] hover:bg-blue-700 h-[26px] w-auto items-center rounded-[4px] pl-[8px] pt-[6px]"
          >
            <div className="text-[11px] primaryspace-nowrap">
              {t("common.launchApp")}
            </div>{" "}
            <ArrowRight className="ml-2 h-3 w-3 rotate-315" />
          </CustomButton>
        </div>

        {/* Project Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Screenshots - Moves first on mobile */}
          <div className="space-y-4 order-first lg:order-last">
            <div className="bg-transparent rounded-lg overflow-hidden">
              <Image
                src="/project/aragon1.png"
                alt={`${project.name} interface`}
                className="w-full h-auto"
                width={500}
                height={220}
              />
            </div>

            <div className="flex gap-4">
              <div className="bg-transparent rounded-lg overflow-hidden">
                <Image
                  src="/project/aragon1.png"
                  alt={`${project.name} interface detail`}
                  className="w-[170px] h-[108px] cursor-pointer"
                  width={170}
                  height={108}
                />
              </div>
              <div className="bg-transparent rounded-lg overflow-hidden">
                <Image
                  src="/project/aragon2.png"
                  alt={`${project.name} interface detail`}
                  className="w-[170px] h-[108px] cursor-pointer"
                  width={170}
                  height={108}
                />
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div className="space-y-8 bg-foreground p-10 rounded-md">
            <p className="text-muted text-[14px]">
              {t("ecosystem." + project.id)}
            </p>

            <div className="space-y-4">
              <h2 className="text-[16px] font-semibold text-card">
                {t("common.overview")}
              </h2>
              <p className="text-muted text-[14px]">
                {project.name} was founded in 2016 with the belief that the fate
                of humanity will be decided at the frontier of technological
                innovation. {project.name} launched the first DAO Framework in
                2017 which secures over $40 billion in TVL. {project.name}
                &lsquo;s tech stack allows anyone to launch a DAO, enabling
                organizations to securely govern their protocols and assets
                onchain.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-[16px] font-semibold text-card">
                {t("common.fundmakerIntegration")}
              </h2>
              <p className="text-muted-foreground text-[14px]">
                {project.name} is integrated with FundMaker on multiple levels.
                First, Metafundmaker vault curators can easily spin up trustless
                guardians for their vaults using the {project.name} App. For
                example, Steakhouse Financial secures vaults for their
                depositors with {project.name} Guardian DAOs. Second, any DAO or
                multisig on {project.name} can now seamlessly use FundMaker using{" "}
                {project.name}&lsquo;s DappConnect, which enables onchain
                organizations to create actions directly through a Dapps user
                interface - no code required.
              </p>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-foreground rounded-lg p-5">
            <h3 className="text-[13px] font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <URL className="h-3 w-3 text-blue-700" /> {t("common.url")}
            </h3>
            <Link
              href={`https://app.${project.id}.org`}
              target="_blank"
              className="text-primary text-[13px] flex items-center"
            >
              app.{project.id}.org{" "}
              <ArrowRight className="ml-1 h-3 w-3 rotate-315" />
            </Link>
          </div>

          <div className="bg-foreground rounded-lg p-5">
            <h3 className="text-[13px] font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Docs className="h-3 w-3 text-blue-700" />{" "}
              {t("common.integrationDocs")}
            </h3>
            <Link href="#" className="text-primary text-[13px] flex items-center">
              Docs <ArrowRight className="ml-1 h-3 w-3 rotate-315" />
            </Link>
          </div>

          <div className="bg-foreground rounded-lg p-5">
            <h3 className="text-[13px] font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Social className="h-3 w-3 text-blue-700" /> {t("common.social")}
            </h3>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-primary text-[13px] flex items-center"
              >
                X <ArrowRight className="ml-1 h-3 w-3 rotate-315" />
              </Link>
              <Link
                href="#"
                className="text-primary text-[13px] flex items-center"
              >
                Discord <ArrowRight className="ml-1 h-3 w-3 rotate-315" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
