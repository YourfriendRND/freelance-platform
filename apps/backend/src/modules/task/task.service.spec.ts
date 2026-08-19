import { NotFoundException } from '@nestjs/common';
import {
  AuthUserPayload,
  TaskEntity,
  TaskExecutionType,
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
    findById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    deleteById: ReturnType<typeof vi.fn>;
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
      findById: vi.fn(),
      update: vi.fn(),
      deleteById: vi.fn(),
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

  it('should return tasks from repository', async () => {
    const tasks = [task];
    taskRepository.findAll.mockResolvedValue(tasks);

    const result = await service.findAll();

    expect(result).toBe(tasks);
    expect(taskRepository.findAll).toHaveBeenCalled();
  });

  it('should return an empty list when there are no tasks', async () => {
    taskRepository.findAll.mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual([]);
  });

  it('should return a task by id', async () => {
    taskRepository.findById.mockResolvedValue(task);

    const result = await service.findOne(taskId);

    expect(result).toBe(task);
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
  });

  it('should throw NotFoundException when task is missing', async () => {
    taskRepository.findById.mockResolvedValue(null);

    await expect(service.findOne(taskId)).rejects.toThrow(
      `Задача с "${taskId}" не найдена`,
    );
  });

  it('should update a task', async () => {
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

  it('should delete a task', async () => {
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
});
