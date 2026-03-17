import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  CreateProjectRequest,
  UpdateProjectRequest,
  Project,
  ProjectListItem,
} from '@storyai/types';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger('ProjectsService');

  constructor(private prisma: PrismaService) {}

  async createProject(
    userId: string,
    dto: CreateProjectRequest,
  ): Promise<Project> {
    // Generate slug from title
    const slug = this.generateSlug(dto.title);

    // Check if slug already exists for this user
    const existing = await this.prisma.project.findUnique({
      where: { userId_slug: { userId, slug } },
    });

    if (existing) {
      throw new BadRequestException('Project with this title already exists');
    }

    const project = await this.prisma.project.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        slug,
      },
    });

    this.logger.log(  `✓ Project created: ${project.id} by user ${userId}`);
    return this.mapProjectToResponse(project);
  }

  async getProjectsByUser(userId: string): Promise<ProjectListItem[]> {
    const projects = await this.prisma.project.findMany({
      where: { userId, deletedAt: null },
      include: {
        _count: { select: { frames: true } },
      },
      orderBy: { lastAccessedAt: 'desc' },
    });

    return projects.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status as any,
      thumbnailUrl: p.thumbnailUrl,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      frameCount: p._count.frames,
    }));
  }

  async getProjectById(projectId: string, userId?: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.deletedAt) {
      throw new NotFoundException('Project not found');
    }

    // Check ownership if userId provided
    if (userId && project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.mapProjectToResponse(project);
  }

  async updateProject(
    projectId: string,
    userId: string,
    dto: UpdateProjectRequest,
  ): Promise<Project> {
    const project = await this.getProjectById(projectId, userId);

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        title: dto.title ?? project.title,
        description: dto.description ?? project.description,
        status: dto.status ?? project.status,
        visibility: dto.visibility ?? project.visibility,
        globalStyle: dto.globalStyle ?? project.globalStyle,
        globalCharacterRefs: dto.globalCharacterRefs
          ? JSON.stringify(dto.globalCharacterRefs)
          : project.globalCharacterRefs,
        globalLocationRef: dto.globalLocationRef ?? project.globalLocationRef,
        updatedAt: new Date(),
      },
    });

    return this.mapProjectToResponse(updated);
  }

  async deleteProject(projectId: string, userId: string): Promise<void> {
    const project = await this.getProjectById(projectId, userId);

    await this.prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`✓ Project deleted: ${projectId}`);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }

  private mapProjectToResponse(project: any): Project {
    return {
      id: project.id,
      userId: project.userId,
      title: project.title,
      description: project.description,
      slug: project.slug,
      status: project.status,
      visibility: project.visibility,
      thumbnailUrl: project.thumbnailUrl,
      globalStyle: project.globalStyle,
      globalCharacterRefs: project.globalCharacterRefs
        ? JSON.parse(project.globalCharacterRefs)
        : undefined,
      globalLocationRef: project.globalLocationRef,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      lastAccessedAt: project.lastAccessedAt.toISOString(),
      archivedAt: project.archivedAt?.toISOString(),
      frameCount: 0, // Will be populated with _count if needed
    };
  }
}
