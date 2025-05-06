import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { DbService } from 'src/db/db.service';
import { projects } from 'src/db/schema';

@Injectable()
export class ProjectsService {
  constructor(private readonly db: DbService) {}

  async create(createProjectDto: CreateProjectDto): Promise<ProjectResponseDto> {
    const [project] = await this.db.getDb()
      .insert({projects})
      .values({
        ...createProjectDto,
        screenshots: createProjectDto.screenshots || [], // Ensure array exists
      })
      .returning();
    return project;
  }

  async findAll(): Promise<ProjectResponseDto[]> {
    const result = await this.db.getDb().select().from(projects);
    return result.map(project => ({
      ...project,
      screenshots: project.screenshots || [], // Ensure array exists
    }));
  }

  async findOne(id: number): Promise<ProjectResponseDto | null> {
    const [project] = await this.db.getDb()
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project ? { ...project, screenshots: project.screenshots || [] } : null;
  }

  async findById(projectId: string): Promise<ProjectResponseDto | null> {
    const [project] = await this.db.getDb()
      .select()
      .from(projects)
      .where(eq(projects.projectId, projectId));
    return project ? { ...project, screenshots: project.screenshots || [] } : null;
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto | null> {
    const [project] = await this.db.getDb()
      .update(projects)
      .set({
        ...updateProjectDto,
        screenshots: updateProjectDto.screenshots || undefined, // Preserve existing if not provided
      })
      .where(eq(projects.id, id))
      .returning();
    return project ? { ...project, screenshots: project.screenshots || [] } : null;
  }

  async remove(id: number): Promise<void> {
    await this.db.getDb().delete(projects).where(eq(projects.id, id));
  }
}