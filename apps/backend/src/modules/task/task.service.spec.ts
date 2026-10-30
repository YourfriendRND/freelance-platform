import { NotFoundException } from '@nestjs/common';
import { FindMyTasksQueryDto, FindTasksQueryDto } from '@freelance-platform/shared-dto';
import {
  AuthUserPayload,
  CustomerTaskStats,
  TaskEntity,
  TaskExecutionType,
  TaskSort,
  TaskStatus,
  UserEntity,
  UserRole,
} from '@freelance-platform/shared-types';

import { TaskCategoryService } from '../task-category/task-category.service';
import { TaskRepository } from './task.repository';
import { TaskService } from './task.service';

describe('TaskService testing', () => {
  let taskRepository: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findAllByCustomer: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    recordView: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    deleteById: ReturnType<typeof vi.fn>;
    countCustomerStats: ReturnType<typeof vi.fn>;
  };
  let taskCategoryService: {
    findOne: ReturnType<typeof vi.fn>;
  };
  let service: TaskService;

  const customerId = 'c8ae551b-9c3f-4781-a99d-4c81de40ab91';
  const categoryId = '207c5b58-c95a-4ce8-a842-aff75697379e';
  const taskId = 'ae1c453f-b666-443f-af9d-26ce1be4a268';

  const user = new UserEntity({
    id: customerId,
    email: 'client@example.com',
    firstName: 'Ivan',
    role: UserRole.Client,
    createdAt: new Date('2026-08-19'),
    updatedAt: new Date('2026-08-19'),
  });

  const authUser: AuthUserPayload = {
    user,
    sessionId: '8dbbc21d-ed8c-4b11-ba3d-4dcfa0d1660b',
    token: 'test-token-1',
  };

  const freelancerId = '74412729-b4eb-4d88-b64b-a3b3446db2d5';
  const freelancerAuthUser: AuthUserPayload = {
    user: new UserEntity({
      id: freelancerId,
      email: 'freelancer@example.com',
      firstName: 'Petr',
      role: UserRole.Freelancer,
      createdAt: new Date('2026-08-19'),
      updatedAt: new Date('2026-08-19'),
    }),
    sessionId: '19a5d0c2-6b44-4f0a-9c31-2d8e7b6a5c10',
    token: 'test-token-2',
  };

  const createDto = {
    title: 'Разработка лендинга',
    description: 'Нужен адаптивный лендинг для запуска продукта',
    budgetMin: 10000,
    budgetMax: 25000,
    executionType: TaskExecutionType.Remote,
    deadline: '2026-09-01',
    categoryId,
  };

  const task = new TaskEntity({
    id: taskId,
    title: createDto.title,
    description: createDto.description,
    status: TaskStatus.Draft,
    budgetMin: createDto.budgetMin,
    budgetMax: createDto.budgetMax,
    executionType: createDto.executionType,
    deadline: new Date(createDto.deadline),
    customerId,
    categoryId,
    createdAt: new Date('2026-08-19'),
    updatedAt: new Date('2026-08-19'),
  });

  beforeEach(() => {
    taskRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findAllByCustomer: vi.fn(),
      findById: vi.fn(),
      recordView: vi.fn(),
      update: vi.fn(),
      deleteById: vi.fn(),
      countCustomerStats: vi.fn(),
    };
    taskCategoryService = {
      findOne: vi.fn(),
    };

    service = new TaskService(
      taskRepository as unknown as TaskRepository,
      taskCategoryService as unknown as TaskCategoryService,
    );
  });

  it('should create a draft task when status is omitted', async () => {
    taskCategoryService.findOne.mockResolvedValue({ id: categoryId });
    taskRepository.create.mockResolvedValue(task);

    const result = await service.create(createDto, authUser);

    expect(result).toBe(task);
    expect(taskCategoryService.findOne).toHaveBeenCalledWith(categoryId);
    expect(taskRepository.create).toHaveBeenCalledWith({
      title: createDto.title,
      description: createDto.description,
      status: TaskStatus.Draft,
      budgetMin: createDto.budgetMin,
      budgetMax: createDto.budgetMax,
      executionType: createDto.executionType,
      deadline: new Date(createDto.deadline),
      customerId,
      categoryId,
    });
  });

  it('should create an open task when status is provided', async () => {
    const openTask = new TaskEntity({ ...task, status: TaskStatus.Open });
    taskCategoryService.findOne.mockResolvedValue({ id: categoryId });
    taskRepository.create.mockResolvedValue(openTask);

    const result = await service.create(
      { ...createDto, status: TaskStatus.Open },
      authUser,
    );

    expect(result).toBe(openTask);
    expect(taskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: TaskStatus.Open }),
    );
  });

  it('should throw NotFoundException when category is missing on create', async () => {
    taskCategoryService.findOne.mockRejectedValue(
      new NotFoundException(`Категория с "${categoryId}" не найдена`),
    );

    await expect(service.create(createDto, authUser)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(taskRepository.create).not.toHaveBeenCalled();
  });

  it('should pass query params to repository', async () => {
    const query = Object.assign(new FindTasksQueryDto(), {
      categoryId,
      status: TaskStatus.Open,
      budgetMin: 10000,
      budgetMax: 50000,
      sort: TaskSort.Newest,
      page: 2,
      limit: 10,
    });
    const paginated = {
      items: [task],
      total: 1,
      page: 2,
      limit: 10,
    };
    taskRepository.findAll.mockResolvedValue(paginated);

    const result = await service.findAll(query);

    expect(result).toBe(paginated);
    expect(taskRepository.findAll).toHaveBeenCalledWith({
      categoryId,
      status: TaskStatus.Open,
      budgetMin: 10000,
      budgetMax: 50000,
      sort: TaskSort.Newest,
      page: 2,
      limit: 10,
    });
  });

  it('should pass performer id when the viewer is a freelancer', async () => {
    const paginated = { items: [task], total: 1, page: 1, limit: 20 };
    taskRepository.findAll.mockResolvedValue(paginated);

    const result = await service.findAll(new FindTasksQueryDto(), freelancerAuthUser);

    expect(result).toBe(paginated);
    expect(taskRepository.findAll).toHaveBeenCalledWith(
      expect.any(Object),
      freelancerId,
    );
  });

  it('should not pass performer id when the viewer is a customer', async () => {
    taskRepository.findAll.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });

    await service.findAll(new FindTasksQueryDto(), authUser);

    expect(taskRepository.findAll).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should pass performer id when loading one task for a freelancer', async () => {
    const openTask = new TaskEntity({ ...task, status: TaskStatus.Open });
    taskRepository.findById.mockResolvedValue(openTask);

    const result = await service.findOne(taskId, freelancerAuthUser);

    expect(result).toBe(openTask);
    expect(taskRepository.recordView).toHaveBeenCalledWith(freelancerId, taskId);
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId, freelancerId);
    expect(taskRepository.findById).toHaveBeenCalledTimes(2);
  });

  it('should load one task without performer id for a customer', async () => {
    taskRepository.findById.mockResolvedValue(task);

    await service.findOne(taskId, authUser);

    expect(taskRepository.recordView).toHaveBeenCalledWith(customerId, taskId);
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(taskRepository.findById).toHaveBeenCalledTimes(2);
  });

  it('should return the task loaded after the view is recorded', async () => {
    const openTask = new TaskEntity({ ...task, status: TaskStatus.Open });
    const viewedTask = new TaskEntity({ ...task, status: TaskStatus.Open });
    openTask.viewsCount = 0;
    viewedTask.viewsCount = 1;
    taskRepository.findById
      .mockResolvedValueOnce(openTask)
      .mockResolvedValueOnce(viewedTask);

    const result = await service.findOne(taskId, authUser);

    expect(taskRepository.recordView).toHaveBeenCalledWith(customerId, taskId);
    expect(result).toBe(viewedTask);
  });

  it('should return the customer tasks including a draft filter', async () => {
    const query = Object.assign(new FindMyTasksQueryDto(), {
      status: TaskStatus.Draft,
    });
    const paginated = { items: [task], total: 1, page: 1, limit: 20 };
    taskRepository.findAllByCustomer.mockResolvedValue(paginated);

    const result = await service.findAllByCustomer(query, authUser);

    expect(result).toBe(paginated);
    expect(taskRepository.findAllByCustomer).toHaveBeenCalledWith(
      customerId,
      expect.objectContaining({ status: TaskStatus.Draft }),
    );
  });

  it('should forbid a freelancer from listing own tasks', async () => {
    await expect(
      service.findAllByCustomer(new FindMyTasksQueryDto(), freelancerAuthUser),
    ).rejects.toThrow('Смотреть свои задачи может только заказчик');
    expect(taskRepository.findAllByCustomer).not.toHaveBeenCalled();
  });

  it('should return an empty page when there are no tasks', async () => {
    taskRepository.findAll.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    const result = await service.findAll(new FindTasksQueryDto());

    expect(result).toEqual({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });
  });

  it('should return a task by id', async () => {
    const openTask = new TaskEntity({ ...task, status: TaskStatus.Open });
    taskRepository.findById.mockResolvedValue(openTask);

    const result = await service.findOne(taskId);

    expect(result).toBe(openTask);
    expect(taskRepository.recordView).not.toHaveBeenCalled();
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(taskRepository.findById).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException when task is missing', async () => {
    taskRepository.findById.mockResolvedValue(null);

    await expect(service.findOne(taskId)).rejects.toThrow(
      `Задача с "${taskId}" не найдена`,
    );
    expect(taskRepository.recordView).not.toHaveBeenCalled();
  });

  it('should update a draft task by owner', async () => {
    const updated = new TaskEntity({ ...task, title: 'Новое название' });
    taskRepository.findById.mockResolvedValue(task);
    taskRepository.update.mockResolvedValue(updated);

    const result = await service.update(taskId, { title: 'Новое название' }, authUser);

    expect(result).toBe(updated);
    expect(taskCategoryService.findOne).not.toHaveBeenCalled();
    expect(taskRepository.update).toHaveBeenCalledWith(taskId, {
      title: 'Новое название',
    });
  });

  it('should check category when categoryId is updated', async () => {
    const nextCategoryId = '45dcc444-09e9-4847-8f85-9b1aedf3d712';
    const updated = new TaskEntity({ ...task, categoryId: nextCategoryId });
    taskRepository.findById.mockResolvedValue(task);
    taskCategoryService.findOne.mockResolvedValue({ id: nextCategoryId });
    taskRepository.update.mockResolvedValue(updated);

    const result = await service.update(taskId, { categoryId: nextCategoryId }, authUser);

    expect(result).toBe(updated);
    expect(taskCategoryService.findOne).toHaveBeenCalledWith(nextCategoryId);
    expect(taskRepository.update).toHaveBeenCalledWith(taskId, {
      categoryId: nextCategoryId,
    });
  });

  it('should throw NotFoundException when updated task is missing', async () => {
    taskRepository.findById.mockResolvedValue(null);

    await expect(
      service.update(taskId, { title: 'Новое название' }, authUser),
    ).rejects.toThrow(`Задача с "${taskId}" не найдена`);
    expect(taskRepository.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when category is missing on update', async () => {
    taskRepository.findById.mockResolvedValue(task);
    taskCategoryService.findOne.mockRejectedValue(
      new NotFoundException(`Категория с "${categoryId}" не найдена`),
    );

    await expect(
      service.update(taskId, { categoryId }, authUser),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(taskRepository.update).not.toHaveBeenCalled();
  });

  it('should delete a draft task by owner', async () => {
    taskRepository.findById.mockResolvedValue(task);
    taskRepository.deleteById.mockResolvedValue(true);

    await service.delete(taskId, authUser);

    expect(taskRepository.deleteById).toHaveBeenCalledWith(taskId);
  });

  it('should throw NotFoundException when deleted task is missing', async () => {
    taskRepository.findById.mockResolvedValue(null);

    await expect(service.delete(taskId, authUser)).rejects.toThrow(
      `Задача с "${taskId}" не найдена`,
    );
    expect(taskRepository.deleteById).not.toHaveBeenCalled();
  });

  describe('business rules testing', () => {
    const freelancerAuthUser: AuthUserPayload = {
      user: new UserEntity({
        id: '74412729-b4eb-4d88-b64b-a3b3446db2d5',
        email: 'random-freelancer@example.com',
        firstName: 'John',
        role: UserRole.Freelancer,
        createdAt: new Date('2026-08-19'),
        updatedAt: new Date('2026-08-19'),
      }),
      sessionId: '04c6879a-470a-40ae-b020-a94fc4b0e86a',
      token: 'test-freelancer-token-2',
    };

    const otherClientAuthUser: AuthUserPayload = {
      user: new UserEntity({
        id: '08e1cdfb-295e-4150-b297-bbd3d514d77a',
        email: 'other-client@example.com',
        firstName: 'Anna',
        role: UserRole.Client,
        createdAt: new Date('2026-08-19'),
        updatedAt: new Date('2026-08-19'),
      }),
      sessionId: '3a97706c-73df-4346-b252-089db7b081b0',
      token: 'test-other-client-token-3',
    };

    it('should return a draft to the owner', async () => {
      taskRepository.findById.mockResolvedValue(task);

      const result = await service.findOne(taskId, authUser);

      expect(result).toBe(task);
    });

    it('should hide a draft from a guest', async () => {
      taskRepository.findById.mockResolvedValue(task);

      await expect(service.findOne(taskId)).rejects.toThrow(
        `Задача с "${taskId}" не найдена`,
      );
      expect(taskRepository.recordView).not.toHaveBeenCalled();
    });

    it('should hide a draft from a freelancer', async () => {
      taskRepository.findById.mockResolvedValue(task);

      await expect(service.findOne(taskId, freelancerAuthUser)).rejects.toThrow(
        `Задача с "${taskId}" не найдена`,
      );
      expect(taskRepository.recordView).not.toHaveBeenCalled();
    });

    it('should hide a draft from another customer', async () => {
      taskRepository.findById.mockResolvedValue(task);

      await expect(service.findOne(taskId, otherClientAuthUser)).rejects.toThrow(
        `Задача с "${taskId}" не найдена`,
      );
      expect(taskRepository.recordView).not.toHaveBeenCalled();
    });

    it('should return an open task to another customer', async () => {
      const openTask = new TaskEntity({ ...task, status: TaskStatus.Open });
      taskRepository.findById.mockResolvedValue(openTask);

      const result = await service.findOne(taskId, otherClientAuthUser);

      expect(result).toBe(openTask);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    });

    it('should return a closed task to a guest', async () => {
      const closedTask = new TaskEntity({ ...task, status: TaskStatus.Closed });
      taskRepository.findById.mockResolvedValue(closedTask);

      const result = await service.findOne(taskId);

      expect(result).toBe(closedTask);
    });

    it('should return a closed task to a freelancer', async () => {
      const closedTask = new TaskEntity({ ...task, status: TaskStatus.Closed });
      taskRepository.findById.mockResolvedValue(closedTask);

      const result = await service.findOne(taskId, freelancerAuthUser);

      expect(result).toBe(closedTask);
      expect(taskRepository.findById).toHaveBeenCalledWith(
        taskId,
        freelancerAuthUser.user.id,
      );
    });

    it('should return a closed task to another customer', async () => {
      const closedTask = new TaskEntity({ ...task, status: TaskStatus.Closed });
      taskRepository.findById.mockResolvedValue(closedTask);

      const result = await service.findOne(taskId, otherClientAuthUser);

      expect(result).toBe(closedTask);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    });

    it('should throw ForbiddenException when freelancer creates a task', async () => {
      await expect(service.create(createDto, freelancerAuthUser)).rejects.toThrow(
        'Создавать задачу может только заказчик',
      );
      expect(taskCategoryService.findOne).not.toHaveBeenCalled();
      expect(taskRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when another user updates the task', async () => {
      taskRepository.findById.mockResolvedValue(task);

      await expect(
        service.update(taskId, { title: 'Чужая правка' }, otherClientAuthUser),
      ).rejects.toThrow('Изменять задачу может только владелец');
      expect(taskRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when another user deletes the task', async () => {
      taskRepository.findById.mockResolvedValue(task);

      await expect(service.delete(taskId, otherClientAuthUser)).rejects.toThrow(
        'Удалять задачу может только владелец',
      );
      expect(taskRepository.deleteById).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when closed task is updated', async () => {
      const closedTask = new TaskEntity({ ...task, status: TaskStatus.Closed });
      taskRepository.findById.mockResolvedValue(closedTask);

      await expect(
        service.update(taskId, { title: 'После закрытия' }, authUser),
      ).rejects.toThrow('Закрытую задачу нельзя изменить');
      expect(taskRepository.update).not.toHaveBeenCalled();
    });

    it('should delete a closed task by owner', async () => {
      const closedTask = new TaskEntity({ ...task, status: TaskStatus.Closed });
      taskRepository.findById.mockResolvedValue(closedTask);
      taskRepository.deleteById.mockResolvedValue(true);

      await service.delete(taskId, authUser);

      expect(taskRepository.deleteById).toHaveBeenCalledWith(taskId);
    });
  });

  describe('customer stats', () => {
    const stats: CustomerTaskStats = {
      open: 2,
      closed: 1,
      draft: 3,
      pendingApplications: 4,
    };

    it('should return task counters for the customer', async () => {
      taskRepository.countCustomerStats.mockResolvedValue(stats);

      const result = await service.getCustomerStats(authUser);

      expect(result).toEqual(stats);
      expect(taskRepository.countCustomerStats).toHaveBeenCalledWith(customerId);
    });

    it('should return zeros when the customer has no tasks', async () => {
      const emptyStats: CustomerTaskStats = {
        open: 0,
        closed: 0,
        draft: 0,
        pendingApplications: 0,
      };
      taskRepository.countCustomerStats.mockResolvedValue(emptyStats);

      const result = await service.getCustomerStats(authUser);

      expect(result).toEqual(emptyStats);
    });

    it('should throw ForbiddenException when freelancer requests task stats', async () => {
      await expect(service.getCustomerStats(freelancerAuthUser)).rejects.toThrow(
        'Смотреть статистику задач может только заказчик',
      );
      expect(taskRepository.countCustomerStats).not.toHaveBeenCalled();
    });
  });
});
