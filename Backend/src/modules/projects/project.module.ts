import { Module } from '@nestjs/common';
import { ProjectsController } from 'src/api/project.controller';
import { DbService } from 'src/db/db.service';
import { ProjectsService } from 'src/projects/project.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, DbService],
  exports: [ProjectsService], // Export if you need to use the service in other modules
})
export class ProjectsModule {}