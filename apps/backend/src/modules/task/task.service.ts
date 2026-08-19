import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from '@freelance-platform/shared-dto';
import {
  AuthUserPayload,
  TaskEntity,
  TaskStatus,
  UserRole,
} from '@freelance-platform/shared-types';
import { TaskCategoryService } from '../task-category/task-category.service';
import { TaskRepository } from './task.repository';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly taskCategoryService: TaskCategoryService,
  ) {}

  async create(dto: CreateTaskDto, authUser: AuthUserPayload): Promise<TaskEntity> {
    const {
      title,
      description,
      status,
      budgetMin,
      budgetMax,
      executionType,
      deadline,
      categoryId,
    } = dto;
    const { user: { id: customerId, role } } = authUser;

    if (role !== UserRole.Client) {
      throw new ForbiddenException('Создавать задачу может только заказчик');
    }

    await this.taskCategoryService.findOne(categoryId);

    return this.taskRepository.create({
      title,
      description,
      status: status ?? TaskStatus.Draft,
      budgetMin,
      budgetMax,
      executionType,
      deadline: new Date(deadline),
      customerId,
      categoryId,
    });
  }

  async findAll(): Promise<TaskEntity[]> {
    return this.taskRepository.findAll();
  }

  async findOne(id: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new NotFoundException(`Задача с "${id}" не найдена`);
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto, authUser: AuthUserPayload): Promise<TaskEntity> {
    const currentTask = await this.findOne(id);
    const { user: { id: userId } } = authUser;

    if (currentTask.customerId !== userId) {
      throw new ForbiddenException('Изменять задачу может только владелец');
    }

    if (currentTask.status === TaskStatus.Closed) {
      throw new ForbiddenException('Закрытую задачу нельзя изменить');
    }

    const { deadline, categoryId, ...rest } = dto;

    if (categoryId !== undefined) {
      await this.taskCategoryService.findOne(categoryId);
    }

    const task = await this.taskRepository.update(id, {
      ...rest,
      ...(categoryId !== undefined && { categoryId }),
      ...(deadline !== undefined && { deadline: new Date(deadline) }),
    });

    if (!task) {
      throw new NotFoundException(`Задача с "${id}" не найдена`);
    }

    return task;
  }

  async delete(id: string, authUser: AuthUserPayload): Promise<void> {
    const task = await this.findOne(id);
    const { user: { id: userId } } = authUser;

    if (task.customerId !== userId) {
      throw new ForbiddenException('Удалять задачу может только владелец');
    }

    await this.taskRepository.deleteById(id);
  }
}
