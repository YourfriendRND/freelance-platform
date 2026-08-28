import { Client } from 'pg';
import { TaskExecutionType, TaskStatus } from '@freelance-platform/shared-types';
import { TASK_CATEGORY_IDS } from './task-categories.seed';
import { TASK_CUSTOMER_IDS } from './task-customers.seed';

type TaskSeed = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  budgetMin: number;
  budgetMax: number;
  executionType: TaskExecutionType;
  deadline: string;
  createdAt: string;
  customerId: string;
  categoryId: string;
};

const TASKS: TaskSeed[] = [
  {
    id: '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c01',
    title: 'Разработка адаптивного лендинга',
    description:
      'Нужен адаптивный лендинг для запуска продукта: вёрстка по макету, анимации и интеграция формы заявки с отправкой на почту.',
    status: TaskStatus.Open,
    budgetMin: 25000,
    budgetMax: 40000,
    executionType: TaskExecutionType.Remote,
    deadline: '2026-09-15',
    createdAt: '2026-08-20T09:00:00.000Z',
    customerId: TASK_CUSTOMER_IDS.ivanov,
    categoryId: TASK_CATEGORY_IDS.it,
  },
  {
    id: '8f3b6d24-0a02-4c73-9e22-6d8e9f0a1b02',
    title: 'Дизайн мобильного приложения',
    description:
      'Спроектировать интерфейс фитнес-приложения для iOS и Android: основные экраны, состояния и UI-kit с компонентами.',
    status: TaskStatus.Open,
    budgetMin: 45000,
    budgetMax: 70000,
    executionType: TaskExecutionType.Remote,
    deadline: '2026-10-01',
    createdAt: '2026-08-18T11:30:00.000Z',
    customerId: TASK_CUSTOMER_IDS.smirnova,
    categoryId: TASK_CATEGORY_IDS.design,
  },
  {
    id: '2e9c4f81-0a03-4d84-8f33-5c7d8e9f0a03',
    title: 'Статьи для блога и SEO',
    description:
      'Написать серию экспертных статей для блога: структура, работа с ключевыми запросами и редактура готовых материалов.',
    status: TaskStatus.Open,
    budgetMin: 12000,
    budgetMax: 20000,
    executionType: TaskExecutionType.Remote,
    deadline: '2026-09-20',
    createdAt: '2026-08-16T08:15:00.000Z',
    customerId: TASK_CUSTOMER_IDS.ivanov,
    categoryId: TASK_CATEGORY_IDS.texts,
  },
  {
    id: '7b1d8a35-0a04-4e95-9a44-4b6c7d8e9f04',
    title: 'Настройка рекламы в соцсетях',
    description:
      'Запустить рекламные кампании: собрать аудитории, подготовить креативы и присылать еженедельные отчёты по результатам.',
    status: TaskStatus.Open,
    budgetMin: 20000,
    budgetMax: 35000,
    executionType: TaskExecutionType.Remote,
    deadline: '2026-09-30',
    createdAt: '2026-08-14T14:45:00.000Z',
    customerId: TASK_CUSTOMER_IDS.volkov,
    categoryId: TASK_CATEGORY_IDS.marketing,
  },
  {
    id: '4a6f2c98-0a05-4f06-8b55-3a5b6c7d8e05',
    title: 'Сборка и установка мебели',
    description:
      'Собрать кухонный гарнитур и шкаф-купе, проверить фурнитуру, выставить по уровню и закрепить к стене.',
    status: TaskStatus.Open,
    budgetMin: 8000,
    budgetMax: 12000,
    executionType: TaskExecutionType.CustomerPlace,
    deadline: '2026-09-05',
    createdAt: '2026-08-12T10:00:00.000Z',
    customerId: TASK_CUSTOMER_IDS.smirnova,
    categoryId: TASK_CATEGORY_IDS.furniture,
  },
  {
    id: '9d5b7e12-0a06-4a17-9c66-2f4a5b6c7d06',
    title: 'Юридическая проверка договора',
    description:
      'Проверить договор подряда, указать риски и предложить правки по ответственности сторон и порядку оплаты.',
    status: TaskStatus.Draft,
    budgetMin: 7000,
    budgetMax: 11000,
    executionType: TaskExecutionType.Remote,
    deadline: '2026-09-10',
    createdAt: '2026-08-10T16:20:00.000Z',
    customerId: TASK_CUSTOMER_IDS.ivanov,
    categoryId: TASK_CATEGORY_IDS.legal,
  },
  {
    id: '3c8a1f56-0a07-4b28-8d77-1e3f4a5b6c07',
    title: 'Съёмка интерьера квартиры',
    description:
      'Сделать серию фотографий квартиры для объявления: работа со светом, ракурсы и базовая цветокоррекция.',
    status: TaskStatus.Open,
    budgetMin: 6000,
    budgetMax: 9000,
    executionType: TaskExecutionType.CustomerPlace,
    deadline: '2026-09-08',
    createdAt: '2026-08-08T12:10:00.000Z',
    customerId: TASK_CUSTOMER_IDS.volkov,
    categoryId: TASK_CATEGORY_IDS.media,
  },
  {
    id: '6e2d9b74-0a08-4c39-9e88-0d2e3f4a5b08',
    title: 'Репетитор по математике',
    description:
      'Подготовить ученика девятого класса к экзамену: алгебра, геометрия и разбор типовых заданий два раза в неделю.',
    status: TaskStatus.Open,
    budgetMin: 15000,
    budgetMax: 22000,
    executionType: TaskExecutionType.Remote,
    deadline: '2026-11-01',
    createdAt: '2026-08-06T07:40:00.000Z',
    customerId: TASK_CUSTOMER_IDS.smirnova,
    categoryId: TASK_CATEGORY_IDS.education,
  },
  {
    id: '1f7c5a38-0a09-4d40-8f99-9c1d2e3f4a09',
    title: 'Уборка квартиры после ремонта',
    description:
      'Выполнить генеральную уборку после ремонта: пыль, окна, сантехника и вынос остатков строительного мусора.',
    status: TaskStatus.Closed,
    budgetMin: 10000,
    budgetMax: 15000,
    executionType: TaskExecutionType.CustomerPlace,
    deadline: '2026-08-25',
    createdAt: '2026-08-04T09:30:00.000Z',
    customerId: TASK_CUSTOMER_IDS.ivanov,
    categoryId: TASK_CATEGORY_IDS.cleaning,
  },
  {
    id: '8b4e6d92-0a0a-4e51-9a0a-8b0c1d2e3f0a',
    title: 'Замена электрики в квартире',
    description:
      'Заменить проводку в двух комнатах, установить новые розетки и подключить освещение по согласованной схеме.',
    status: TaskStatus.Open,
    budgetMin: 30000,
    budgetMax: 55000,
    executionType: TaskExecutionType.CustomerPlace,
    deadline: '2026-09-25',
    createdAt: '2026-08-02T13:00:00.000Z',
    customerId: TASK_CUSTOMER_IDS.volkov,
    categoryId: TASK_CATEGORY_IDS.electrics,
  },
  {
    id: '5d1a8f47-0a0b-4f62-8b1b-7a9b0c1d2e0b',
    title: 'Настройка домашнего компьютера',
    description:
      'Переустановить систему, перенести файлы, настроить принтер и рабочие программы, объяснить основные действия.',
    status: TaskStatus.Draft,
    budgetMin: 4000,
    budgetMax: 7000,
    executionType: TaskExecutionType.CustomerPlace,
    deadline: '2026-09-02',
    createdAt: '2026-07-30T15:15:00.000Z',
    customerId: TASK_CUSTOMER_IDS.smirnova,
    categoryId: TASK_CATEGORY_IDS.devices,
  },
  {
    id: '2c6b3e85-0a0c-4a73-9c2c-6f8a9b0c1d0c',
    title: 'Перевозка вещей при переезде',
    description:
      'Перевезти вещи из двухкомнатной квартиры: упаковка хрупких предметов, погрузка, разгрузка и подъём на пятый этаж.',
    status: TaskStatus.Closed,
    budgetMin: 9000,
    budgetMax: 14000,
    executionType: TaskExecutionType.CustomerPlace,
    deadline: '2026-08-20',
    createdAt: '2026-07-28T08:50:00.000Z',
    customerId: TASK_CUSTOMER_IDS.ivanov,
    categoryId: TASK_CATEGORY_IDS.movers,
  },
];

export const seed = {
  name: 'tasks',
  checksum: 'c93e5a17b46d82f0e15c7a93d6b428f0',
  async run(client: Client): Promise<void> {
    for (const task of TASKS) {
      const {
        id,
        title,
        description,
        status,
        budgetMin,
        budgetMax,
        executionType,
        deadline,
        createdAt,
        customerId,
        categoryId,
      } = task;

      await client.query(
        `
          INSERT INTO tasks (
            id,
            title,
            description,
            status,
            budget_min,
            budget_max,
            execution_type,
            deadline,
            customer_id,
            category_id,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            budget_min = EXCLUDED.budget_min,
            budget_max = EXCLUDED.budget_max,
            execution_type = EXCLUDED.execution_type,
            deadline = EXCLUDED.deadline,
            customer_id = EXCLUDED.customer_id,
            category_id = EXCLUDED.category_id,
            updated_at = now()
        `,
        [
          id,
          title,
          description,
          status,
          budgetMin,
          budgetMax,
          executionType,
          deadline,
          customerId,
          categoryId,
          createdAt,
        ],
      );
    }
  },
};
