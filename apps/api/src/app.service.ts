import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getVersion() {
    return {
      version: '1.0.0',
      name: 'StoryAI API',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
