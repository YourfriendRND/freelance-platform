import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReviewModule } from '../review/review.module';
import { TaskCategoryModule } from '../task-category/task-category.module';
import { TaskController } from './task.controller';
import { TaskRepository } from './task.repository';
import { TaskService } from './task.service';

@Module({
  imports: [AuthModule, TaskCategoryModule, ReviewModule],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
  exports: [TaskService],
})
export class TaskModule {}
