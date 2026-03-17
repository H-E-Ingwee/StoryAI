import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ScenesModule } from './scenes/scenes.module';
import { FramesModule } from './frames/frames.module';
import { PromptsModule } from './prompts/prompts.module';
import { GenerationModule } from './generation/generation.module';
import { AssetsModule } from './assets/assets.module';
import { ConsistencyModule } from './consistency/consistency.module';
import { ExportsModule } from './exports/exports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    ScenesModule,
    FramesModule,
    PromptsModule,
    GenerationModule,
    AssetsModule,
    ConsistencyModule,
    ExportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
