"use client";
import { useEffect, useState } from "react";
import { fetchProjects } from "@/api/projects";
import { useLanguage } from "@/contexts/language-context";
import Dashboard from "@/components/views/Dashboard/dashboard";
import { Project } from "@/types";
import { fallbackProjects } from "@/lib/fallback-projects";
import { ProjectCard } from "@/components/views/ecosystem/ecosystem";

export default function EcosystemPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects();
        if (data.length === 0) {
          setProjects(fallbackProjects)
        }
        else{
          setProjects(data);
        }
      } catch (err) {
        setProjects(fallbackProjects)
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);


  return (
    <Dashboard>
      <div className="flex flex-col gap-4">
        <div className="flex gap-5 flex-col">
          <h1 className="text-[38px] font-normal text-primary h-[44px] items-center flex">
            {t("common.ecosystem")}
          </h1>
          <p className="text-secondary text-[14px]">
            {t("common.projectsOnFundMaker")}
          </p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 custom-3xl-grid gap-3 py-10">
          {projects.map((project) => (
            <ProjectCard project={project} />
          ))}
        </div>
      </div>
    </Dashboard>
  );
}
