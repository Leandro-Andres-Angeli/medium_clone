import { Controller, Get } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagEntity } from './tag.entity';

@Controller('tags')
export default class TagController {
  constructor(private readonly tagService: TagService) {}
  @Get('')
  async findAll() {
    return await this.tagService.findAll();
  }
}
