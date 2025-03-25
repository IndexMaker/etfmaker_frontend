import { ProjectDetailPage } from "@/components/views/ecosystem/project-detail";
import { projects } from "@/lib/data";
import { notFound } from "next/navigation";

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}

export default function ProjectPage({ params }: ProjectPageProps) {
  if (!params || !params.id) {
    return notFound(); // Handle missing params
  }

  const project = projects.find((p) => p.id === decodeURIComponent(params?.id));

  if (!project) {
    return notFound(); // Show 404 if project is not found
  }

  return <ProjectDetailPage project={project} />;
}
