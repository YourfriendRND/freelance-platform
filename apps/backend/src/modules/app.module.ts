import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig, authConfig } from '@freelance-platform/shared-config';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TaskCategoryModule } from './task-category/task-category.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig],
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    TaskCategoryModule,
    TaskModule,
  ],
})
export class AppModule {}
