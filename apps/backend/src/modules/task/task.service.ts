import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateTaskDto,
  FindMyTasksQueryDto,
  FindTasksQueryDto,
  UpdateTaskDto,
} from '@freelance-platform/shared-dto';
import {
  AuthUserPayload,
  CustomerTaskStats,
  PaginationResult,
  TaskEntity,
  TaskStatus,
  UserRole,
} from '@freelance-platform/shared-types';
import { ReviewService } from '../review/review.service';
import { TaskCategoryService } from '../task-category/task-category.service';
import { TaskRepository } from './task.repository';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly taskCategoryService: TaskCategoryService,
    private readonly reviewService: ReviewService,
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

    const task = await this.taskRepository.create({
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
    const { author } = task;

    if (author?.id) {
      const { rating, reviewsCount } = await this.reviewService.getStats(author.id);
      author.rating = rating;
      author.reviewsCount = reviewsCount;
    }

    return task;
  }

  async findAll(
    query: FindTasksQueryDto,
    authUser?: AuthUserPayload,
  ): Promise<PaginationResult<TaskEntity>> {
    const { categoryId, status, budgetMin, budgetMax, sort, page, limit } = query;
    const filters = {
      categoryId,
      status,
      budgetMin,
      budgetMax,
      sort,
      page,
      limit,
    };

    const foundTasks = authUser?.user.role === UserRole.Freelancer
      ? await this.taskRepository.findAll(filters, authUser.user.id)
      : await this.taskRepository.findAll(filters);
    const authorIds = foundTasks.items.flatMap((task) => (task.author?.id ? [task.author.id] : []));

    if (authorIds.length > 0) {
      const stats = await this.reviewService.getStatsByUserIds(authorIds);
      const statsByUserId = new Map(stats.map((item) => [item.userId, item]));

      foundTasks.items.forEach((task) => {
        const { author } = task;

        if (!author?.id) {
          return;
        }

        const current = statsByUserId.get(author.id);
        author.rating = current?.rating ?? 0;
        author.reviewsCount = current?.reviewsCount ?? 0;
      });
    }

    return foundTasks;
  }

  async findAllByCustomer(
    query: FindMyTasksQueryDto,
    authUser: AuthUserPayload,
  ): Promise<PaginationResult<TaskEntity>> {
    const { user: { id: customerId, role } } = authUser;

    if (role !== UserRole.Client) {
      throw new ForbiddenException('Смотреть свои задачи может только заказчик');
    }

    const { categoryId, status, budgetMin, budgetMax, sort, page, limit } = query;

    const customerTasks = await this.taskRepository.findAllByCustomer(customerId, {
      categoryId,
      status,
      budgetMin,
      budgetMax,
      sort,
      page,
      limit,
    });
    const authorIds = customerTasks.items.flatMap((task) => (task.author?.id ? [task.author.id] : []));

    if (authorIds.length > 0) {
      const stats = await this.reviewService.getStatsByUserIds(authorIds);
      const statsByUserId = new Map(stats.map((item) => [item.userId, item]));

      customerTasks.items.forEach((task) => {
        const { author } = task;

        if (!author?.id) {
          return;
        }

        const current = statsByUserId.get(author.id);
        author.rating = current?.rating ?? 0;
        author.reviewsCount = current?.reviewsCount ?? 0;
      });
    }

    return customerTasks;
  }

  async getCustomerStats(authUser: AuthUserPayload): Promise<CustomerTaskStats> {
    const { user: { id: customerId, role } } = authUser;

    if (role !== UserRole.Client) {
      throw new ForbiddenException('Смотреть статистику задач может только заказчик');
    }

    return this.taskRepository.countCustomerStats(customerId);
  }

  async findOne(id: string, authUser?: AuthUserPayload): Promise<TaskEntity> {
    const performerId = authUser?.user.role === UserRole.Freelancer
      ? authUser.user.id
      : undefined;
    const task = await this.getTask(id, performerId);
    const { status, customerId } = task;

    if (status === TaskStatus.Draft && customerId !== authUser?.user.id) {
      throw new NotFoundException(`Задача с "${id}" не найдена`);
    }

    if (!authUser) {
      const { author } = task;

      if (author?.id) {
        const { rating, reviewsCount } = await this.reviewService.getStats(author.id);
        author.rating = rating;
        author.reviewsCount = reviewsCount;
      }

      return task;
    }

    const { user: { id: userId } } = authUser;

    await this.taskRepository.recordView(userId, id);

    const viewed = await this.getTask(id, performerId);
    const { author } = viewed;

    if (author?.id) {
      const { rating, reviewsCount } = await this.reviewService.getStats(author.id);
      author.rating = rating;
      author.reviewsCount = reviewsCount;
    }

    return viewed;
  }

  async getTask(id: string, performerId?: string): Promise<TaskEntity> {
    const task = performerId !== undefined
      ? await this.taskRepository.findById(id, performerId)
      : await this.taskRepository.findById(id);

    if (!task) {
      throw new NotFoundException(`Задача с "${id}" не найдена`);
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto, authUser: AuthUserPayload): Promise<TaskEntity> {
    const currentTask = await this.getTask(id);
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

    const { author } = task;

    if (author?.id) {
      const { rating, reviewsCount } = await this.reviewService.getStats(author.id);
      author.rating = rating;
      author.reviewsCount = reviewsCount;
    }

    return task;
  }

  async delete(id: string, authUser: AuthUserPayload): Promise<void> {
    const task = await this.getTask(id);
    const { user: { id: userId } } = authUser;

    if (task.customerId !== userId) {
      throw new ForbiddenException('Удалять задачу может только владелец');
    }

    await this.taskRepository.deleteById(id);
  }
}
