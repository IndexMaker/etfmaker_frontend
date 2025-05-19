"use client";
import { ProjectDetailPage } from "@/components/views/ecosystem/project-detail";
import { notFound, useParams } from "next/navigation";
import dynamic from "next/dynamic";

const ProjectPageContent = () => {
  const params = useParams();
  const project_id = params.id?.toString();
  
  if (!project_id) {
    notFound();
  }

  return <ProjectDetailPage projectId={project_id} />;
};

// Disable SSR completely for this page
export default dynamic(() => Promise.resolve(ProjectPageContent), {
  ssr: false
});