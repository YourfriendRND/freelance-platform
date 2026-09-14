import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateTaskApplicationDto,
  FindTaskApplicationsQueryDto,
  UpdateTaskApplicationDto,
} from '@freelance-platform/shared-dto';
import {
  AuthUserPayload,
  TaskApplicationEntity,
  TaskApplicationStatus,
  TaskStatus,
  UpdateTaskApplicationRecord,
  UserRole,
} from '@freelance-platform/shared-types';
import { TaskService } from '../task/task.service';
import { DuplicateTaskApplicationError } from './errors';
import { TaskApplicationRepository } from './task-application.repository';

@Injectable()
export class TaskApplicationService {
  constructor(
    private readonly taskApplicationRepository: TaskApplicationRepository,
    private readonly taskService: TaskService,
  ) {}

  async findAll(
    query: FindTaskApplicationsQueryDto,
    authUser: AuthUserPayload,
  ): Promise<TaskApplicationEntity[]> {
    const { taskId } = query;
    const { user: { id: userId, role } } = authUser;

    if (role === UserRole.Freelancer) {
      if (taskId !== undefined) {
        throw new BadRequestException('Параметр taskId доступен только заказчику');
      }

      return this.taskApplicationRepository.findAllByPerformerId(userId);
    }

    if (taskId !== undefined) {
      const ownsTask = await this.taskApplicationRepository.customerOwnsTask(
        userId,
        taskId,
      );

      if (!ownsTask) {
        throw new NotFoundException(`Задача с "${taskId}" не найдена`);
      }

      return this.taskApplicationRepository.findAllByCustomerIdAndTaskId(
        userId,
        taskId,
      );
    }

    return this.taskApplicationRepository.findAllByCustomerId(userId);
  }

  async findOne(id: string, authUser: AuthUserPayload): Promise<TaskApplicationEntity> {
    const { user: { id: userId, role } } = authUser;
    const found = await this.taskApplicationRepository.findByIdWithTaskCustomer(id);

    if (!found) {
      throw new NotFoundException(`Отклик с "${id}" не найден`);
    }

    const { application, taskCustomerId } = found;

    if (role === UserRole.Freelancer && application.performerId !== userId) {
      throw new ForbiddenException('Нет доступа к этому отклику');
    }

    if (role === UserRole.Client && taskCustomerId !== userId) {
      throw new ForbiddenException('Нет доступа к этому отклику');
    }

    return application;
  }

  async create(
    dto: CreateTaskApplicationDto,
    authUser: AuthUserPayload,
  ): Promise<TaskApplicationEntity> {
    const { taskId, message, proposedPrice } = dto;
    const { user: { id: performerId, role } } = authUser;

    if (role !== UserRole.Freelancer) {
      throw new ForbiddenException('Откликаться на задачу может только исполнитель');
    }

    const task = await this.taskService.findOne(taskId);

    if (task.status !== TaskStatus.Open) {
      throw new ForbiddenException('Откликнуться можно только на открытую задачу');
    }

    if (task.customerId === performerId) {
      throw new ForbiddenException('Нельзя откликнуться на собственную задачу');
    }

    try {
      return await this.taskApplicationRepository.create({
        taskId,
        performerId,
        message,
        ...(proposedPrice !== undefined && { proposedPrice }),
      });
    } catch (error) {
      if (error instanceof DuplicateTaskApplicationError) {
        throw new ConflictException('Вы уже откликались на эту задачу');
      }

      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateTaskApplicationDto,
    authUser: AuthUserPayload,
  ): Promise<TaskApplicationEntity> {
    const { user: { id: userId, role } } = authUser;
    const found = await this.taskApplicationRepository.findByIdWithTaskCustomer(id);

    if (!found) {
      throw new NotFoundException(`Отклик с "${id}" не найден`);
    }

    const { application, taskCustomerId } = found;
    const updatedFields =
      role === UserRole.Freelancer
        ? this.buildPerformerUpdate(application, dto, userId)
        : this.buildCustomerUpdate(dto, taskCustomerId, userId);

    const updatedApplication = await this.taskApplicationRepository.update(
      id,
      updatedFields,
    );

    if (!updatedApplication) {
      throw new NotFoundException(`Отклик с "${id}" не найден`);
    }

    return updatedApplication;
  }

  private buildPerformerUpdate(
    application: TaskApplicationEntity,
    dto: UpdateTaskApplicationDto,
    performerId: string,
  ): UpdateTaskApplicationRecord {
    const { message, proposedPrice, status } = dto;

    if (application.performerId !== performerId) {
      throw new ForbiddenException('Изменять отклик может только его автор');
    }

    if (status !== undefined) {
      throw new ForbiddenException('Исполнитель не может изменить статус отклика');
    }

    if (application.status !== TaskApplicationStatus.Pending) {
      throw new ForbiddenException('Изменить можно только отклик на рассмотрении');
    }

    if (message === undefined && proposedPrice === undefined) {
      throw new BadRequestException('Не переданы данные для обновления');
    }

    return {
      ...(message !== undefined && { message }),
      ...(proposedPrice !== undefined && { proposedPrice }),
    };
  }

  private buildCustomerUpdate(
    dto: UpdateTaskApplicationDto,
    taskCustomerId: string,
    customerId: string,
  ): UpdateTaskApplicationRecord {
    const { message, proposedPrice, status } = dto;

    if (taskCustomerId !== customerId) {
      throw new ForbiddenException('Изменять отклик может только владелец задачи');
    }

    if (message !== undefined || proposedPrice !== undefined) {
      throw new ForbiddenException('Заказчик может изменить только статус отклика');
    }

    if (status === undefined) {
      throw new BadRequestException('Не передан статус отклика');
    }

    if (
      status !== TaskApplicationStatus.Accept &&
      status !== TaskApplicationStatus.Decline
    ) {
      throw new BadRequestException('Статус можно изменить только на accept или decline');
    }

    return { status };
  }
}
