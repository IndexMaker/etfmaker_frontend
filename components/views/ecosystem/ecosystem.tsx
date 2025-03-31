"use client";
import External from "@/components/icons/external";
import { Button } from "@/components/ui/button";
import Dashboard from "@/components/views/Dashboard/dashboard";
import Link from "next/link";
import Image from "next/image";
import { Project, projects } from "@/lib/data";
import { useLanguage } from "@/contexts/language-context";

export function EcosystemPage() {
  const { t } = useLanguage();
  return (
    <Dashboard>
      <div className="flex flex-col gap-4">
        <div className="flex gap-5 flex-col">
          <h1 className="text-[38px] font-normal text-white h-[44px] items-center flex">
            {t("common.ecosystem")}
          </h1>
          <p className="text-[#ffffffcc] text-[14px]">
            {t("common.projectsOnMorpho")}
          </p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 custom-3xl-grid gap-3 py-10">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </Dashboard>
  );
}

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useLanguage();
  return (
    <div className="bg-[#202426] rounded-lg p-5 flex h-[240px]">
      <div className="flex flex-col h-full justify-between w-full">
        <div className="mb-4 flex justify-between">
          <div className="bg-[#fafafa1a] w-[60px] h-[60px] rounded-full flex items-center justify-center text-xl">
            <Image
              src={
                project.icon !== "ionic"
                  ? `https://cdn.morpho.org/v2/communication/images/${project.icon.toLowerCase()}-logo-bw-white.png`
                  : `https://cdn.morpho.org/v2/communication/images/${project.icon.toLowerCase()}-logo-bw-light.png`
              }
              width={24}
              height={24}
              alt={project.name}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-[#fafafa1a] hover:bg-[#2470ff] cursor-pointer w-[31px] h-[31px]"
          >
            <Link href={`/ecosystem/${project.id}`} className="block group">
              <External className="h-[2px] w-[2px] text-white" width="6px" />
            </Link>
            <span className="sr-only text-white">
              {t("common.visit")} {project.name}
            </span>
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-[20px] font-normal text-white">
            {project.name}
          </div>
          <p className="text-[14px] text-[#ffffff80] leading-[16px] overflow-hidden text-ellipsis whitespace-normal line-clamp-4">
            {project.description}
          </p>
        </div>
      </div>
    </div>
  );
}
