import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AssistantService, AssistantQueryDto } from './assistant.service.js';

@ApiTags('Craft Advisor')
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('query')
  @ApiOperation({ summary: 'Ask the Craft Advisor for personalized artisan catalogue recommendations' })
  async query(@Body() body: AssistantQueryDto) {
    return this.assistantService.processQuery(body);
  }
}
