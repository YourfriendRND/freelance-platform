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
  ReviewStats,
  TaskApplicationEntity,
  TaskApplicationStats,
  TaskApplicationStatus,
  TaskStatus,
  UpdateTaskApplicationRecord,
  UserRole,
} from '@freelance-platform/shared-types';
import { ReviewService } from '../review/review.service';
import { TaskService } from '../task/task.service';
import { DuplicateTaskApplicationError } from './errors';
import { TaskApplicationRepository } from './task-application.repository';

@Injectable()
export class TaskApplicationService {
  constructor(
    private readonly taskApplicationRepository: TaskApplicationRepository,
    private readonly taskService: TaskService,
    private readonly reviewService: ReviewService,
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

      const applications = await this.taskApplicationRepository.findAllByPerformerId(userId);

      const statsByUserId = await this.reviewStatsByUser(applications);

      applications.forEach((application) => {
        const people = [application.user, application.task?.author];

        people.forEach((person) => {
          if (!person?.id) {
            return;
          }

          const current = statsByUserId.get(person.id);
          person.rating = current?.rating ?? 0;
          person.reviewsCount = current?.reviewsCount ?? 0;
        });
      });

      return applications;
    }

    if (taskId !== undefined) {
      const ownsTask = await this.taskApplicationRepository.customerOwnsTask(
        userId,
        taskId,
      );

      if (!ownsTask) {
        throw new NotFoundException(`Задача с "${taskId}" не найдена`);
      }

      const applications = await this.taskApplicationRepository.findAllByCustomerIdAndTaskId(
        userId,
        taskId,
      );

      const statsByUserId = await this.reviewStatsByUser(applications);

      applications.forEach((application) => {
        const people = [application.user, application.task?.author];

        people.forEach((person) => {
          if (!person?.id) {
            return;
          }

          const current = statsByUserId.get(person.id);
          person.rating = current?.rating ?? 0;
          person.reviewsCount = current?.reviewsCount ?? 0;
        });
      });

      return applications;
    }

    const applications = await this.taskApplicationRepository.findAllByCustomerId(userId);

    const statsByUserId = await this.reviewStatsByUser(applications);

    applications.forEach((application) => {
      const people = [application.user, application.task?.author];

      people.forEach((person) => {
        if (!person?.id) {
          return;
        }

        const current = statsByUserId.get(person.id);
        person.rating = current?.rating ?? 0;
        person.reviewsCount = current?.reviewsCount ?? 0;
      });
    });

    return applications;
  }

  async getStats(authUser: AuthUserPayload): Promise<TaskApplicationStats> {
    const { user: { id: userId, role } } = authUser;

    if (role === UserRole.Freelancer) {
      return this.taskApplicationRepository.countByPerformerId(userId);
    }

    return this.taskApplicationRepository.countByCustomerId(userId);
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

    const statsByUserId = await this.reviewStatsByUser([application]);
    const people = [application.user, application.task?.author];

    people.forEach((person) => {
      if (!person?.id) {
        return;
      }

      const current = statsByUserId.get(person.id);
      person.rating = current?.rating ?? 0;
      person.reviewsCount = current?.reviewsCount ?? 0;
    });

    return application;
  }

  async create(
    dto: CreateTaskApplicationDto,
    authUser: AuthUserPayload,
  ): Promise<TaskApplicationEntity> {
    const { taskId, message, proposedPrice, timeline } = dto;
    const { user: { id: performerId, role } } = authUser;

    if (role !== UserRole.Freelancer) {
      throw new ForbiddenException('Откликаться на задачу может только исполнитель');
    }

    const task = await this.taskService.getTask(taskId);

    if (task.status !== TaskStatus.Open) {
      throw new ForbiddenException('Откликнуться можно только на открытую задачу');
    }

    if (task.customerId === performerId) {
      throw new ForbiddenException('Нельзя откликнуться на собственную задачу');
    }

    try {
      const created = await this.taskApplicationRepository.create({
        taskId,
        performerId,
        message,
        ...(proposedPrice !== undefined && { proposedPrice }),
        ...(timeline !== undefined && { timeline }),
      });
      const statsByUserId = await this.reviewStatsByUser([created]);
      const people = [created.user, created.task?.author];

      people.forEach((person) => {
        if (!person?.id) {
          return;
        }

        const current = statsByUserId.get(person.id);
        person.rating = current?.rating ?? 0;
        person.reviewsCount = current?.reviewsCount ?? 0;
      });

      return created;
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

    const statsByUserId = await this.reviewStatsByUser([updatedApplication]);
    const people = [updatedApplication.user, updatedApplication.task?.author];

    people.forEach((person) => {
      if (!person?.id) {
        return;
      }

      const current = statsByUserId.get(person.id);
      person.rating = current?.rating ?? 0;
      person.reviewsCount = current?.reviewsCount ?? 0;
    });

    return updatedApplication;
  }

  private async reviewStatsByUser(
    applications: TaskApplicationEntity[],
  ): Promise<Map<string, ReviewStats>> {
    const userIds = applications.flatMap((application) => [
      ...(application.user?.id ? [application.user.id] : []),
      ...(application.task?.author?.id ? [application.task.author.id] : []),
    ]);
    const stats = await this.reviewService.getStatsByUserIds(userIds);

    const statsByUserId = new Map<string, ReviewStats>();

    stats.forEach((item) => {
      const { userId, rating, reviewsCount } = item;
      statsByUserId.set(userId, { rating, reviewsCount });
    });

    return statsByUserId;
  }

  private buildPerformerUpdate(
    application: TaskApplicationEntity,
    dto: UpdateTaskApplicationDto,
    performerId: string,
  ): UpdateTaskApplicationRecord {
    const { message, proposedPrice, timeline, status } = dto;

    if (application.performerId !== performerId) {
      throw new ForbiddenException('Изменять отклик может только его автор');
    }

    if (status !== undefined) {
      throw new ForbiddenException('Исполнитель не может изменить статус отклика');
    }

    if (application.status !== TaskApplicationStatus.Pending) {
      throw new ForbiddenException('Изменить можно только отклик на рассмотрении');
    }

    if (message === undefined && proposedPrice === undefined && timeline === undefined) {
      throw new BadRequestException('Не переданы данные для обновления');
    }

    return {
      ...(message !== undefined && { message }),
      ...(proposedPrice !== undefined && { proposedPrice }),
      ...(timeline !== undefined && { timeline }),
    };
  }

  private buildCustomerUpdate(
    dto: UpdateTaskApplicationDto,
    taskCustomerId: string,
    customerId: string,
  ): UpdateTaskApplicationRecord {
    const { message, proposedPrice, timeline, status } = dto;

    if (taskCustomerId !== customerId) {
      throw new ForbiddenException('Изменять отклик может только владелец задачи');
    }

    if (message !== undefined || proposedPrice !== undefined || timeline !== undefined) {
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
