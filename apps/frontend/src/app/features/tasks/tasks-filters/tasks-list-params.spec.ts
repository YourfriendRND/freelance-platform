import { convertToParamMap } from '@angular/router';
import { PAGINATION_DEFAULT_PAGE, TaskSort, TaskStatus } from '@freelance-platform/shared-types';
import { toMyTasksQuery, toPublicTasksQuery } from './tasks-filters.model';
import {
  isCanonicalTasksListQuery,
  parseTasksListParams,
  TasksListParamsMode,
  TasksListQueryParam,
  toTasksListQueryParams,
} from './tasks-list-params';

const CATEGORY_ID = '7c2a8e14-5d93-4f1b-9b27-2e5d8c01f102';

describe('parseTasksListParams function testing', () => {
  it('should read a canonical public list from the address', () => {
    const params = parseTasksListParams(
      convertToParamMap({
        [TasksListQueryParam.Search]: '  верстка  ',
        [TasksListQueryParam.CategoryId]: CATEGORY_ID,
        [TasksListQueryParam.Status]: TaskStatus.Open,
        [TasksListQueryParam.BudgetMin]: '1000.9',
        [TasksListQueryParam.BudgetMax]: '5000',
        [TasksListQueryParam.Sort]: TaskSort.Oldest,
        [TasksListQueryParam.Page]: '2',
      }),
      TasksListParamsMode.Public,
    );

    expect(params).toEqual({
      selection: {
        search: 'верстка',
        categoryId: CATEGORY_ID,
        status: TaskStatus.Open,
        budgetMin: 1000,
        budgetMax: 5000,
        sort: TaskSort.Oldest,
      },
      page: 2,
    });
    expect(toTasksListQueryParams(params)).toEqual({
      [TasksListQueryParam.Search]: 'верстка',
      [TasksListQueryParam.CategoryId]: CATEGORY_ID,
      [TasksListQueryParam.Status]: TaskStatus.Open,
      [TasksListQueryParam.BudgetMin]: '1000',
      [TasksListQueryParam.BudgetMax]: '5000',
      [TasksListQueryParam.Sort]: TaskSort.Oldest,
      [TasksListQueryParam.Page]: '2',
    });
  });

  it('should drop invalid values and keep the defaults out of the address', () => {
    const params = parseTasksListParams(
      convertToParamMap({
        [TasksListQueryParam.Search]: '   ',
        [TasksListQueryParam.CategoryId]: '  ',
        [TasksListQueryParam.Status]: 'archived',
        [TasksListQueryParam.BudgetMin]: '0',
        [TasksListQueryParam.BudgetMax]: 'abc',
        [TasksListQueryParam.Sort]: 'popular',
        [TasksListQueryParam.Page]: '0',
      }),
      TasksListParamsMode.Public,
    );

    expect(params).toEqual({
      selection: { sort: TaskSort.Newest },
      page: PAGINATION_DEFAULT_PAGE,
    });
    expect(toTasksListQueryParams(params)).toEqual({});
    expect(isCanonicalTasksListQuery(convertToParamMap({}), TasksListParamsMode.Public)).toBe(
      true,
    );
  });

  it('should treat explicit defaults and unknown keys as non-canonical', () => {
    expect(
      isCanonicalTasksListQuery(
        convertToParamMap({
          [TasksListQueryParam.Sort]: TaskSort.Newest,
          [TasksListQueryParam.Page]: '1',
        }),
        TasksListParamsMode.Public,
      ),
    ).toBe(false);
    expect(
      isCanonicalTasksListQuery(convertToParamMap({ extra: '1' }), TasksListParamsMode.Public),
    ).toBe(false);
    expect(
      isCanonicalTasksListQuery(
        convertToParamMap({
          [TasksListQueryParam.CategoryId]: CATEGORY_ID,
          [TasksListQueryParam.Sort]: TaskSort.BudgetDesc,
          [TasksListQueryParam.Page]: '3',
        }),
        TasksListParamsMode.Public,
      ),
    ).toBe(true);
  });

  it('should drop a draft status from the public list and keep it for my tasks', () => {
    const source = convertToParamMap({
      [TasksListQueryParam.Status]: TaskStatus.Draft,
      [TasksListQueryParam.Search]: 'черновик',
    });
    const publicParams = parseTasksListParams(source, TasksListParamsMode.Public);
    const mineParams = parseTasksListParams(source, TasksListParamsMode.Mine);

    expect(publicParams.selection.status).toBeUndefined();
    expect(toTasksListQueryParams(publicParams)).toEqual({
      [TasksListQueryParam.Search]: 'черновик',
    });
    expect(mineParams.selection.status).toBe(TaskStatus.Draft);
    expect(toTasksListQueryParams(mineParams)).toEqual({
      [TasksListQueryParam.Search]: 'черновик',
      [TasksListQueryParam.Status]: TaskStatus.Draft,
    });
  });

  it('should keep search in the address and out of the api query', () => {
    const params = parseTasksListParams(
      convertToParamMap({
        [TasksListQueryParam.Search]: 'логотип',
        [TasksListQueryParam.Status]: TaskStatus.Closed,
        [TasksListQueryParam.Page]: '4',
      }),
      TasksListParamsMode.Mine,
    );

    expect(toTasksListQueryParams(params)[TasksListQueryParam.Search]).toBe('логотип');
    expect(toPublicTasksQuery(params.selection)).toEqual({
      status: TaskStatus.Closed,
      sort: TaskSort.Newest,
    });
    expect(toPublicTasksQuery(params.selection)).not.toHaveProperty(TasksListQueryParam.Search);
    expect(toMyTasksQuery(params.selection)).toEqual({
      status: TaskStatus.Closed,
      sort: TaskSort.Newest,
    });
    expect(toMyTasksQuery(params.selection)).not.toHaveProperty(TasksListQueryParam.Search);
  });
});
