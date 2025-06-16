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
    const bitgetData = await this.scraperService.scrapeBitget();
    const bitListings = [...bitgetData.listings];
    const bitgetAnnouncements = [...bitgetData.announcements];
    // const transformedListings = await this.scraperService.transformData(allListings);
    await this.scraperService.saveListingsToDatabase(bitListings);
    await this.scraperService.saveAnnouncementsToDatabase(bitgetAnnouncements);

    const binanceData = await this.scraperService.scrapeBinance();
    const allListings = [...binanceData.listings];
    const allAnnouncements = [...binanceData.announcements];
    // const transformedListings = await this.scraperService.transformData(allListings);
    await this.scraperService.saveListingsToDatabase(allListings);
    await this.scraperService.saveAnnouncementsToDatabase(allAnnouncements);
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
