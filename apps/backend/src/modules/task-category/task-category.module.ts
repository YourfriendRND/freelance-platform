import { Module } from '@nestjs/common';
import { TaskCategoryController } from './task-category.controller';
import { TaskCategoryService } from './task-category.service';
import { TaskCategoryRepository } from './task-category.repository';

@Module({
  imports: [],
  controllers: [TaskCategoryController],
  providers: [TaskCategoryService, TaskCategoryRepository],
  exports: [TaskCategoryService],
})
export class TaskCategoryModule {}
