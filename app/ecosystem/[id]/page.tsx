"use client";
import { ProjectDetailPage } from "@/components/views/ecosystem/project-detail";
import { projects } from "@/lib/data";
import { notFound, useParams } from "next/navigation";

export default function ProjectPage() {
  const params = useParams();
  const project_id = params.id?.toString();
  if (!project_id) {
    return notFound(); // Handle missing params
  }
  
  if (!project_id) {
    return notFound(); // Show 404 if project is not found
  }

  return <ProjectDetailPage projectId={project_id} />;
}
