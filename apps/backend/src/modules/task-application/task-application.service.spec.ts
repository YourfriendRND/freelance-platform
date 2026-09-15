import { NotFoundException } from '@nestjs/common';
import { FindTaskApplicationsQueryDto } from '@freelance-platform/shared-dto';
import {
  AuthUserPayload,
  TaskApplicationEntity,
  TaskApplicationStatus,
  TaskEntity,
  TaskExecutionType,
  TaskStatus,
  UserEntity,
  UserRole,
} from '@freelance-platform/shared-types';
import { TaskService } from '../task/task.service';
import { DuplicateTaskApplicationError } from './errors';
import { TaskApplicationRepository } from './task-application.repository';
import { TaskApplicationService } from './task-application.service';

describe('TaskApplicationService testing', () => {
  let taskApplicationRepository: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByIdWithTaskCustomer: ReturnType<typeof vi.fn>;
    findAllByPerformerId: ReturnType<typeof vi.fn>;
    findAllByCustomerId: ReturnType<typeof vi.fn>;
    findAllByCustomerIdAndTaskId: ReturnType<typeof vi.fn>;
    customerOwnsTask: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let taskService: {
    findOne: ReturnType<typeof vi.fn>;
  };
  let service: TaskApplicationService;

  const customerId = 'c8ae551b-9c3f-4781-a99d-4c81de40ab91';
  const performerId = '74412729-b4eb-4d88-b64b-a3b3446db2d5';
  const otherPerformerId = '08e1cdfb-295e-4150-b297-bbd3d514d77a';
  const otherCustomerId = '3a97706c-73df-4346-b252-089db7b081b0';
  const taskId = 'ae1c453f-b666-443f-af9d-26ce1be4a268';
  const applicationId = '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c01';
  const categoryId = '207c5b58-c95a-4ce8-a842-aff75697379e';

  const clientUser = new UserEntity({
    id: customerId,
    email: 'client@example.com',
    firstName: 'Ivan',
    role: UserRole.Client,
    createdAt: new Date('2026-09-15'),
    updatedAt: new Date('2026-09-15'),
  });

  const freelancerUser = new UserEntity({
    id: performerId,
    email: 'freelancer@example.com',
    firstName: 'John',
    role: UserRole.Freelancer,
    createdAt: new Date('2026-09-15'),
    updatedAt: new Date('2026-09-15'),
  });

  const clientAuthUser: AuthUserPayload = {
    user: clientUser,
    sessionId: '8dbbc21d-ed8c-4b11-ba3d-4dcfa0d1660b',
    token: 'test-client-token',
  };

  const freelancerAuthUser: AuthUserPayload = {
    user: freelancerUser,
    sessionId: '04c6879a-470a-40ae-b020-a94fc4b0e86a',
    token: 'test-freelancer-token',
  };

  const otherFreelancerAuthUser: AuthUserPayload = {
    user: new UserEntity({
      id: otherPerformerId,
      email: 'other-freelancer@example.com',
      firstName: 'Petr',
      role: UserRole.Freelancer,
      createdAt: new Date('2026-09-15'),
      updatedAt: new Date('2026-09-15'),
    }),
    sessionId: 'a1b2c3d4-e5f6-4781-a99d-4c81de40ab91',
    token: 'test-other-freelancer-token',
  };

  const otherClientAuthUser: AuthUserPayload = {
    user: new UserEntity({
      id: otherCustomerId,
      email: 'other-client@example.com',
      firstName: 'Anna',
      role: UserRole.Client,
      createdAt: new Date('2026-09-15'),
      updatedAt: new Date('2026-09-15'),
    }),
    sessionId: 'b2c3d4e5-f6a7-4781-a99d-4c81de40ab91',
    token: 'test-other-client-token',
  };

  const openTask = new TaskEntity({
    id: taskId,
    title: 'Разработка лендинга',
    description: 'Нужен адаптивный лендинг',
    status: TaskStatus.Open,
    budgetMin: 10000,
    budgetMax: 25000,
    executionType: TaskExecutionType.Remote,
    deadline: new Date('2026-12-01'),
    customerId,
    categoryId,
    createdAt: new Date('2026-09-15'),
    updatedAt: new Date('2026-09-15'),
  });

  const application = new TaskApplicationEntity({
    id: applicationId,
    taskId,
    performerId,
    proposedPrice: 15000,
    message: 'Готов выполнить задачу',
    status: TaskApplicationStatus.Pending,
    createdAt: new Date('2026-09-15'),
    updatedAt: new Date('2026-09-15'),
  });

  const createDto = {
    taskId,
    message: 'Готов выполнить задачу',
    proposedPrice: 15000,
  };

  beforeEach(() => {
    taskApplicationRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdWithTaskCustomer: vi.fn(),
      findAllByPerformerId: vi.fn(),
      findAllByCustomerId: vi.fn(),
      findAllByCustomerIdAndTaskId: vi.fn(),
      customerOwnsTask: vi.fn(),
      update: vi.fn(),
    };
    taskService = {
      findOne: vi.fn(),
    };

    service = new TaskApplicationService(
      taskApplicationRepository as unknown as TaskApplicationRepository,
      taskService as unknown as TaskService,
    );
  });

  it('should return performer applications for freelancer', async () => {
    taskApplicationRepository.findAllByPerformerId.mockResolvedValue([application]);

    const result = await service.findAll(new FindTaskApplicationsQueryDto(), freelancerAuthUser);

    expect(result).toEqual([application]);
    expect(taskApplicationRepository.findAllByPerformerId).toHaveBeenCalledWith(performerId);
    expect(taskApplicationRepository.findAllByCustomerId).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when freelancer passes taskId', async () => {
    const query = Object.assign(new FindTaskApplicationsQueryDto(), { taskId });

    await expect(service.findAll(query, freelancerAuthUser)).rejects.toThrow(
      'Параметр taskId доступен только заказчику',
    );
    expect(taskApplicationRepository.findAllByPerformerId).not.toHaveBeenCalled();
  });

  it('should return customer applications for client', async () => {
    taskApplicationRepository.findAllByCustomerId.mockResolvedValue([application]);

    const result = await service.findAll(new FindTaskApplicationsQueryDto(), clientAuthUser);

    expect(result).toEqual([application]);
    expect(taskApplicationRepository.findAllByCustomerId).toHaveBeenCalledWith(customerId);
  });

  it('should return applications for owned task when client passes taskId', async () => {
    const query = Object.assign(new FindTaskApplicationsQueryDto(), { taskId });
    taskApplicationRepository.customerOwnsTask.mockResolvedValue(true);
    taskApplicationRepository.findAllByCustomerIdAndTaskId.mockResolvedValue([application]);

    const result = await service.findAll(query, clientAuthUser);

    expect(result).toEqual([application]);
    expect(taskApplicationRepository.customerOwnsTask).toHaveBeenCalledWith(customerId, taskId);
    expect(taskApplicationRepository.findAllByCustomerIdAndTaskId).toHaveBeenCalledWith(
      customerId,
      taskId,
    );
  });

  it('should throw NotFoundException when client filters by foreign task', async () => {
    const query = Object.assign(new FindTaskApplicationsQueryDto(), { taskId });
    taskApplicationRepository.customerOwnsTask.mockResolvedValue(false);

    await expect(service.findAll(query, clientAuthUser)).rejects.toThrow(
      `Задача с "${taskId}" не найдена`,
    );
    expect(taskApplicationRepository.findAllByCustomerIdAndTaskId).not.toHaveBeenCalled();
  });

  it('should return an application by id for its performer', async () => {
    taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue({
      application,
      taskCustomerId: customerId,
    });

    const result = await service.findOne(applicationId, freelancerAuthUser);

    expect(result).toBe(application);
    expect(taskApplicationRepository.findByIdWithTaskCustomer).toHaveBeenCalledWith(
      applicationId,
    );
  });

  it('should return an application by id for task owner', async () => {
    taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue({
      application,
      taskCustomerId: customerId,
    });

    const result = await service.findOne(applicationId, clientAuthUser);

    expect(result).toBe(application);
  });

  it('should throw NotFoundException when application is missing', async () => {
    taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue(null);

    await expect(service.findOne(applicationId, freelancerAuthUser)).rejects.toThrow(
      `Отклик с "${applicationId}" не найден`,
    );
  });

  it('should create an application for freelancer on open task', async () => {
    taskService.findOne.mockResolvedValue(openTask);
    taskApplicationRepository.create.mockResolvedValue(application);

    const result = await service.create(createDto, freelancerAuthUser);

    expect(result).toBe(application);
    expect(taskService.findOne).toHaveBeenCalledWith(taskId);
    expect(taskApplicationRepository.create).toHaveBeenCalledWith({
      taskId,
      performerId,
      message: createDto.message,
      proposedPrice: createDto.proposedPrice,
    });
  });

  it('should omit proposedPrice when it is not provided', async () => {
    taskService.findOne.mockResolvedValue(openTask);
    taskApplicationRepository.create.mockResolvedValue(application);

    await service.create({ taskId, message: createDto.message }, freelancerAuthUser);

    expect(taskApplicationRepository.create).toHaveBeenCalledWith({
      taskId,
      performerId,
      message: createDto.message,
    });
  });

  it('should throw ConflictException on duplicate application', async () => {
    taskService.findOne.mockResolvedValue(openTask);
    taskApplicationRepository.create.mockRejectedValue(new DuplicateTaskApplicationError());

    await expect(service.create(createDto, freelancerAuthUser)).rejects.toThrow(
      'Вы уже откликались на эту задачу',
    );
  });

  it('should rethrow unexpected create errors', async () => {
    const unexpected = new Error('db down');
    taskService.findOne.mockResolvedValue(openTask);
    taskApplicationRepository.create.mockRejectedValue(unexpected);

    await expect(service.create(createDto, freelancerAuthUser)).rejects.toBe(unexpected);
  });

  it('should update message for performer while pending', async () => {
    const updated = new TaskApplicationEntity({
      ...application,
      message: 'Обновлённое сообщение',
    });
    taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue({
      application,
      taskCustomerId: customerId,
    });
    taskApplicationRepository.update.mockResolvedValue(updated);

    const result = await service.update(
      applicationId,
      { message: 'Обновлённое сообщение' },
      freelancerAuthUser,
    );

    expect(result).toBe(updated);
    expect(taskApplicationRepository.update).toHaveBeenCalledWith(applicationId, {
      message: 'Обновлённое сообщение',
    });
  });

  it('should update status for task owner', async () => {
    const updated = new TaskApplicationEntity({
      ...application,
      status: TaskApplicationStatus.Accept,
    });
    taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue({
      application,
      taskCustomerId: customerId,
    });
    taskApplicationRepository.update.mockResolvedValue(updated);

    const result = await service.update(
      applicationId,
      { status: TaskApplicationStatus.Accept },
      clientAuthUser,
    );

    expect(result).toBe(updated);
    expect(taskApplicationRepository.update).toHaveBeenCalledWith(applicationId, {
      status: TaskApplicationStatus.Accept,
    });
  });

  it('should throw NotFoundException when updated application is missing', async () => {
    taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue({
      application,
      taskCustomerId: customerId,
    });
    taskApplicationRepository.update.mockResolvedValue(null);

    await expect(
      service.update(applicationId, { message: 'Новое' }, freelancerAuthUser),
    ).rejects.toThrow(`Отклик с "${applicationId}" не найден`);
  });

  describe('business rules testing', () => {
    it('should throw ForbiddenException when client creates an application', async () => {
      await expect(service.create(createDto, clientAuthUser)).rejects.toThrow(
        'Откликаться на задачу может только исполнитель',
      );
      expect(taskService.findOne).not.toHaveBeenCalled();
      expect(taskApplicationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when task is not open', async () => {
      taskService.findOne.mockResolvedValue(
        new TaskEntity({ ...openTask, status: TaskStatus.Draft }),
      );

      await expect(service.create(createDto, freelancerAuthUser)).rejects.toThrow(
        'Откликнуться можно только на открытую задачу',
      );
      expect(taskApplicationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when freelancer applies to own task', async () => {
      taskService.findOne.mockResolvedValue(
        new TaskEntity({ ...openTask, customerId: performerId }),
      );

      await expect(service.create(createDto, freelancerAuthUser)).rejects.toThrow(
        'Нельзя откликнуться на собственную задачу',
      );
      expect(taskApplicationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when created task is missing', async () => {
      taskService.findOne.mockRejectedValue(
        new NotFoundException(`Задача с "${taskId}" не найдена`),
      );

      await expect(service.create(createDto, freelancerAuthUser)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(taskApplicationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when freelancer reads foreign application', async () => {
      taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue({
        application,
        taskCustomerId: customerId,
      });

      await expect(service.findOne(applicationId, otherFreelancerAuthUser)).rejects.toThrow(
        'Нет доступа к этому отклику',
      );
    });

    it('should throw ForbiddenException when client reads foreign application', async () => {
      taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue({
        application,
        taskCustomerId: customerId,
      });

      await expect(service.findOne(applicationId, otherClientAuthUser)).rejects.toThrow(
        'Нет доступа к этому отклику',
      );
    });

    it('should throw ForbiddenException when another freelancer updates the application', async () => {
      taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue({
        application,
        taskCustomerId: customerId,
      });

      await expect(
        service.update(applicationId, { message: 'Чужая правка' }, otherFreelancerAuthUser),
      ).rejects.toThrow('Изменять отклик может только его автор');
      expect(taskApplicationRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when freelancer changes status', async () => {
      taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue({
        application,
        taskCustomerId: customerId,
      });

      await expect(
        service.update(
          applicationId,
          { status: TaskApplicationStatus.Accept },
          freelancerAuthUser,
        ),
      ).rejects.toThrow('Исполнитель не может изменить статус отклика');
      expect(taskApplicationRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when freelancer updates non-pending application', async () => {
      taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue({
        application: new TaskApplicationEntity({
          ...application,
          status: TaskApplicationStatus.Accept,
        }),
        taskCustomerId: customerId,
      });

      await expect(
        service.update(applicationId, { message: 'После принятия' }, freelancerAuthUser),
      ).rejects.toThrow('Изменить можно только отклик на рассмотрении');
      expect(taskApplicationRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when freelancer sends empty update', async () => {
      taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue({
        application,
        taskCustomerId: customerId,
      });

      await expect(service.update(applicationId, {}, freelancerAuthUser)).rejects.toThrow(
        'Не переданы данные для обновления',
      );
      expect(taskApplicationRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when another client updates status', async () => {
      taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue({
        application,
        taskCustomerId: customerId,
      });

      await expect(
        service.update(
          applicationId,
          { status: TaskApplicationStatus.Decline },
          otherClientAuthUser,
        ),
      ).rejects.toThrow('Изменять отклик может только владелец задачи');
      expect(taskApplicationRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when client updates message', async () => {
      taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue({
        application,
        taskCustomerId: customerId,
      });

      await expect(
        service.update(applicationId, { message: 'Правка заказчика' }, clientAuthUser),
      ).rejects.toThrow('Заказчик может изменить только статус отклика');
      expect(taskApplicationRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when client omits status', async () => {
      taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue({
        application,
        taskCustomerId: customerId,
      });

      await expect(service.update(applicationId, {}, clientAuthUser)).rejects.toThrow(
        'Не передан статус отклика',
      );
      expect(taskApplicationRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when client sets pending status', async () => {
      taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue({
        application,
        taskCustomerId: customerId,
      });

      await expect(
        service.update(
          applicationId,
          { status: TaskApplicationStatus.Pending },
          clientAuthUser,
        ),
      ).rejects.toThrow('Статус можно изменить только на accept или decline');
      expect(taskApplicationRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when updated application does not exist', async () => {
      taskApplicationRepository.findByIdWithTaskCustomer.mockResolvedValue(null);

      await expect(
        service.update(applicationId, { message: 'Новое' }, freelancerAuthUser),
      ).rejects.toThrow(`Отклик с "${applicationId}" не найден`);
      expect(taskApplicationRepository.update).not.toHaveBeenCalled();
    });
  });
});
