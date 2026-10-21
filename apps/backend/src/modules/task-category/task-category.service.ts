import { Injectable, NotFoundException } from '@nestjs/common';
import { PopularTaskCategory, TaskCategoryEntity } from '@freelance-platform/shared-types';
import { TaskCategoryRepository } from './task-category.repository';

@Injectable()
export class TaskCategoryService {
  constructor(private readonly taskCategoryRepository: TaskCategoryRepository) {}

  async findAll(): Promise<TaskCategoryEntity[]> {
    return this.taskCategoryRepository.findAll();
  }

  async findPopular(): Promise<PopularTaskCategory[]> {
    return this.taskCategoryRepository.findPopular();
  }

  async findOne(id: string): Promise<TaskCategoryEntity> {
    const category = await this.taskCategoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException(`Категория с "${id}" не найдена`);
    }

    return category;
  }
}
