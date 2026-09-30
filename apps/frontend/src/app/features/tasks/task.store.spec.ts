import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { TaskApi, TaskCategoryApi } from '@freelance-platform/client-api';
import { TaskStore } from '@freelance-platform/client-state';
import {
  createMockTaskCategoryResponse,
  createMockTaskListResponse,
  createMockTaskResponse,
} from '@freelance-platform/shared-mock';
import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  TaskListResponse,
  TaskResponse,
  TaskSort,
  TaskStatus,
} from '@freelance-platform/shared-types';
import { TASKS_TEST_BUDGET_MAX, TASKS_TEST_BUDGET_MIN } from './tasks-test.constants';

describe('TaskStore testing', () => {
  let store: InstanceType<typeof TaskStore>;
  let taskApi: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };
  let taskCategoryApi: { findAll: ReturnType<typeof vi.fn> };

  const category = createMockTaskCategoryResponse();

  const task = createMockTaskResponse({
    categoryId: category.id,
  });

  const taskList: TaskListResponse = createMockTaskListResponse({ items: [task] });

  beforeEach(() => {
    taskApi = { create: vi.fn(), findAll: vi.fn(), findOne: vi.fn() };
    taskCategoryApi = { findAll: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        TaskStore,
        { provide: TaskApi, useValue: taskApi },
        { provide: TaskCategoryApi, useValue: taskCategoryApi },
      ],
    });

    store = TestBed.inject(TaskStore);
  });

  it('should start with an empty idle state', () => {
    expect(store.tasks()).toEqual([]);
    expect(store.categories()).toEqual([]);
    expect(store.selectedTask()).toBeNull();
    expect(store.total()).toBe(0);
    expect(store.page()).toBe(PAGINATION_DEFAULT_PAGE);
    expect(store.limit()).toBe(PAGINATION_DEFAULT_LIMIT);
    expect(store.listQuery()).toEqual({
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
    });
    expect(store.isLoading()).toBe(false);
    expect(store.isSelectedLoading()).toBe(false);
    expect(store.isListLoaded()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.selectedError()).toBeNull();
  });

  it('should load tasks and categories together', () => {
    taskApi.findAll.mockReturnValue(of(taskList));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.load();

    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.tasks()).toEqual([task]);
    expect(store.total()).toBe(taskList.total);
    expect(store.page()).toBe(taskList.page);
    expect(store.limit()).toBe(taskList.limit);
    expect(store.categories()).toEqual([category]);
    expect(store.categoryTitleById().get(category.id)).toBe(category.title);
    expect(taskApi.findAll).toHaveBeenCalledWith({
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
    });
    expect(store.listQuery()).toEqual({
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
    });
  });

  it('should keep a single in-flight request', () => {
    const tasks = new Subject<TaskListResponse>();
    taskApi.findAll.mockReturnValue(tasks.asObservable());
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.load();
    store.load();

    expect(taskApi.findAll).toHaveBeenCalledTimes(1);
    expect(taskCategoryApi.findAll).toHaveBeenCalledTimes(1);
    expect(store.isLoading()).toBe(true);

    tasks.next(taskList);
    tasks.complete();

    expect(store.isLoading()).toBe(false);
    expect(store.tasks()).toEqual([task]);
  });

  it('should store the API error message when loading fails', () => {
    taskApi.findAll.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: { message: 'Сервис недоступен' },
          }),
      ),
    );
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.load();

    expect(store.isLoading()).toBe(false);
    expect(store.tasks()).toEqual([]);
    expect(store.error()).toBe('Сервис недоступен');
  });

  it('should fall back to a default error message', () => {
    taskApi.findAll.mockReturnValue(of(taskList));
    taskCategoryApi.findAll.mockReturnValue(throwError(() => new Error('network')));

    store.load();

    expect(store.error()).toBe('Не удалось загрузить задачи');
    expect(store.isLoading()).toBe(false);
  });

  it('should not reload the list after a successful load', () => {
    taskApi.findAll.mockReturnValue(of(taskList));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.load();
    store.load();

    expect(taskApi.findAll).toHaveBeenCalledTimes(1);
    expect(taskCategoryApi.findAll).toHaveBeenCalledTimes(1);
    expect(store.isListLoaded()).toBe(true);
  });

  it('should load the next page without refetching categories', () => {
    const secondPageTask = createMockTaskResponse({
      id: '2c8e1a97-0a01-4b62-8d11-7e9f0a1b2c02',
      categoryId: category.id,
    });
    const secondPage: TaskListResponse = createMockTaskListResponse({
      items: [secondPageTask],
      total: 21,
      page: 2,
      limit: PAGINATION_DEFAULT_LIMIT,
    });

    taskApi.findAll
      .mockReturnValueOnce(of(taskList))
      .mockReturnValueOnce(of(secondPage));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.load();
    store.load({
      ...store.listQuery(),
      page: 2,
    });

    expect(taskApi.findAll).toHaveBeenNthCalledWith(1, {
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
    });
    expect(taskApi.findAll).toHaveBeenNthCalledWith(2, {
      page: 2,
      limit: PAGINATION_DEFAULT_LIMIT,
    });
    expect(taskCategoryApi.findAll).toHaveBeenCalledTimes(1);
    expect(store.tasks()).toEqual([secondPageTask]);
    expect(store.total()).toBe(21);
    expect(store.page()).toBe(2);
    expect(store.limit()).toBe(PAGINATION_DEFAULT_LIMIT);
  });

  it('should reload the list when filters change', () => {
    const filteredList: TaskListResponse = createMockTaskListResponse({
      items: [task],
      total: 1,
    });

    taskApi.findAll
      .mockReturnValueOnce(of(taskList))
      .mockReturnValueOnce(of(filteredList));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.load();
    store.load({
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      categoryId: category.id,
      status: TaskStatus.Open,
      budgetMin: TASKS_TEST_BUDGET_MIN,
      budgetMax: TASKS_TEST_BUDGET_MAX,
    });

    expect(taskApi.findAll).toHaveBeenNthCalledWith(2, {
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      categoryId: category.id,
      status: TaskStatus.Open,
      budgetMin: TASKS_TEST_BUDGET_MIN,
      budgetMax: TASKS_TEST_BUDGET_MAX,
    });
    expect(store.listQuery()).toEqual({
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      categoryId: category.id,
      status: TaskStatus.Open,
      budgetMin: TASKS_TEST_BUDGET_MIN,
      budgetMax: TASKS_TEST_BUDGET_MAX,
    });
  });

  it('should keep filters when loading the next page', () => {
    taskApi.findAll.mockReturnValue(of(taskList));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.load({
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      categoryId: category.id,
    });
    store.load({
      ...store.listQuery(),
      page: 2,
    });

    expect(taskApi.findAll).toHaveBeenNthCalledWith(2, {
      page: 2,
      limit: PAGINATION_DEFAULT_LIMIT,
      categoryId: category.id,
    });
  });

  it('should reload the list when sort changes', () => {
    taskApi.findAll.mockReturnValue(of(taskList));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.load();
    store.load({
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      sort: TaskSort.Oldest,
    });

    expect(taskApi.findAll).toHaveBeenNthCalledWith(2, {
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      sort: TaskSort.Oldest,
    });
    expect(store.listQuery()).toEqual({
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      sort: TaskSort.Oldest,
    });
  });

  it('should keep sort when loading the next page', () => {
    taskApi.findAll.mockReturnValue(of(taskList));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.load({
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      sort: TaskSort.BudgetAsc,
    });
    store.load({
      ...store.listQuery(),
      page: 2,
    });

    expect(taskApi.findAll).toHaveBeenNthCalledWith(2, {
      page: 2,
      limit: PAGINATION_DEFAULT_LIMIT,
      sort: TaskSort.BudgetAsc,
    });
  });

  it('should create a task and mark the loaded list stale', () => {
    taskApi.findAll.mockReturnValue(of(taskList));
    taskApi.create.mockReturnValue(of(task));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.load();
    store.create({
      title: task.title,
      description: task.description,
      status: task.status,
      budgetMin: task.budgetMin,
      budgetMax: task.budgetMax,
      executionType: task.executionType,
      deadline: task.deadline,
      categoryId: task.categoryId,
    }).subscribe();

    expect(taskApi.create).toHaveBeenCalledTimes(1);
    expect(store.isListLoaded()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should load a task by id with categories', () => {
    taskApi.findOne.mockReturnValue(of(task));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.loadById(task.id);

    expect(store.isSelectedLoading()).toBe(false);
    expect(store.selectedError()).toBeNull();
    expect(store.selectedTask()).toEqual(task);
    expect(store.categories()).toEqual([category]);
  });

  it('should keep a single in-flight loadById request', () => {
    const selectedTask = new Subject<TaskResponse>();
    taskApi.findOne.mockReturnValue(selectedTask.asObservable());
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.loadById(task.id);
    store.loadById(task.id);

    expect(taskApi.findOne).toHaveBeenCalledTimes(1);
    expect(store.isSelectedLoading()).toBe(true);

    selectedTask.next(task);
    selectedTask.complete();

    expect(store.isSelectedLoading()).toBe(false);
    expect(store.selectedTask()).toEqual(task);
  });

  it('should not refetch categories when they are already loaded', () => {
    taskApi.findOne.mockReturnValue(of(task));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.loadById(task.id);
    store.clearSelected();
    store.loadById(task.id);

    expect(taskApi.findOne).toHaveBeenCalledTimes(2);
    expect(taskCategoryApi.findAll).toHaveBeenCalledTimes(1);
  });

  it('should store the API error message when loadById fails', () => {
    taskApi.findOne.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { message: 'Задача с "5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c01" не найдена' },
          }),
      ),
    );
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.loadById(task.id);

    expect(store.isSelectedLoading()).toBe(false);
    expect(store.selectedTask()).toBeNull();
    expect(store.selectedError()).toBe(
      'Задача с "5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c01" не найдена',
    );
  });

  it('should fall back to a default error message when loadById fails', () => {
    taskApi.findOne.mockReturnValue(throwError(() => new Error('network')));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.loadById(task.id);

    expect(store.selectedError()).toBe('Не удалось загрузить задачу');
    expect(store.isSelectedLoading()).toBe(false);
  });

  it('should clear the selected task', () => {
    taskApi.findOne.mockReturnValue(of(task));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.loadById(task.id);
    store.clearSelected();

    expect(store.selectedTask()).toBeNull();
    expect(store.isSelectedLoading()).toBe(false);
    expect(store.selectedError()).toBeNull();
    expect(store.categories()).toEqual([category]);
  });
});
