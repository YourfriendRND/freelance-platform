import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TaskCategoryModule } from '../task-category/task-category.module';
import { TaskController } from './task.controller';
import { TaskRepository } from './task.repository';
import { TaskService } from './task.service';

@Module({
  imports: [AuthModule, TaskCategoryModule],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
  exports: [TaskService],
})
export class TaskModule {}
