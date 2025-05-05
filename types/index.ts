export interface Project {
  id: number;
  projectId: string;
  name: string;
  description: string;
  icon: string;
  websiteUrl?: string;
  docsUrl?: string;
  twitterUrl?: string;
  discordUrl?: string;
  screenshots?: string[];
  overview?: string;
  integrationDetails?: string;
}
