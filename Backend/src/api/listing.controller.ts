import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ScraperService } from 'src/modules/scraper/scraperService';
import { UpdateProjectDto } from 'src/projects/dto/update-project.dto';

@ApiTags('listing')
@Controller('listing')
export class ListingController {
  constructor(
    private readonly scraperService: ScraperService,
  ) {}

  @Get('/scraping')
  async scraping() {
    const result = await this.scraperService.scrapeBitget()
    console.log(result)
  }

//   @Get()
//   findAll() {
//     return this.projectsService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.projectsService.findOne(+id);
//   }

//   @Get('by-project-id/:projectId')
//   findByProjectId(@Param('projectId') projectId: string) {
//     return this.projectsService.findById(projectId);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
//     return this.projectsService.update(+id, updateProjectDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.projectsService.remove(+id);
//   }
}
