import { Injectable } from '@nestjs/common';
import { TaskCategoryEntity } from '@freelance-platform/shared-types';
import { TaskCategoryRepository } from './task-category.repository';

@Injectable()
export class TaskCategoryService {
  constructor(private readonly taskCategoryRepository: TaskCategoryRepository) {}

  async findAll(): Promise<TaskCategoryEntity[]> {
    return this.taskCategoryRepository.findAll();
  }
}
