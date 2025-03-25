"use client";
import External from "@/components/icons/external";
import { Button } from "@/components/ui/button";
import Dashboard from "@/components/views/Dashboard/dashboard";
import Link from "next/link";
import Image from "next/image";
import { Project, projects } from "@/lib/data";

export function EcosystemPage() {
  return (
    <Dashboard>
      <div className="">
        <div>
          <h1 className="text-[38px] font-normal text-white">Ecosystem</h1>
          <p className="text-[#ffffffcc] text-[14px] mt-2">
            Projects building on Morpho
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-3 py-10">
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
  return (
    <div className="bg-[#202426] rounded-lg p-5 relative group">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-100 rounded-full bg-[#fafafa1a] hover:bg-[#2470ff] cursor-pointer w-[31px] h-[31px]"
      >
        <Link href={`/ecosystem/${project.id}`} className="block group">
          <External className="h-[2px] w-[2px] text-white" />
        </Link>
        <span className="sr-only text-white">Visit {project.name}</span>
      </Button>

      <div className="flex flex-col h-full">
        <div className="mb-4">
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
        </div>

        <h3 className="text-lg font-semibold mb-2 text-white">
          {project.name}
        </h3>
        <p className="text-sm text-muted-foreground">{project.description}</p>
      </div>
    </div>
  );
}
