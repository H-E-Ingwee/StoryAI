import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateProjectRequest, UpdateProjectRequest } from '@storyai/types';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new project' })
  async createProject(
    @Request() req: any,
    @Body() dto: CreateProjectRequest,
  ) {
    const project = await this.projectsService.createProject(req.user.sub, dto);
    return { data: project };
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List user projects' })
  async listProjects(@Request() req: any) {
    const projects = await this.projectsService.getProjectsByUser(req.user.sub);
    return { data: projects, total: projects.length };
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get project by ID' })
  async getProject(@Request() req: any, @Param('id') projectId: string) {
    const project = await this.projectsService.getProjectById(
      projectId,
      req.user.sub,
    );
    return { data: project };
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update project' })
  async updateProject(
    @Request() req: any,
    @Param('id') projectId: string,
    @Body() dto: UpdateProjectRequest,
  ) {
    const project = await this.projectsService.updateProject(
      projectId,
      req.user.sub,
      dto,
    );
    return { data: project };
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete project' })
  async deleteProject(
    @Request() req: any,
    @Param('id') projectId: string,
  ): Promise<void> {
    await this.projectsService.deleteProject(projectId, req.user.sub);
  }
}
