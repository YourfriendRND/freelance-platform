import { Client } from 'pg';

type TaskCategorySeed = {
  id: string;
  title: string;
  description: string;
};

export const TASK_CATEGORY_IDS = {
  education: '9b1f4d2a-3c81-4e6f-8a12-1d4c7b90e001',
  it: '7c2a8e14-5d93-4f1b-9b27-2e5d8c01f102',
  design: '4e6d9b31-7a52-4c08-8d3e-3f6a9d12b203',
  media: '2a8c5f47-9b13-4d72-9e4f-4a7b0c23d304',
  texts: '6d3b7e29-1c84-4a95-8f51-5b8c1d34e405',
  marketing: '1f5e2c83-4d76-4b19-9a62-6c9d2e45f506',
  renovation: '8a4c1d97-2e58-4f63-8b73-7d0e3f56a607',
  plumbing: '3c9e6b15-8f24-4a71-9c84-8e1f4a67b708',
  electrics: '5b7d3f21-6a49-4c85-8d95-9f2a5b78c809',
  furniture: '0e2c8a56-3b71-4d94-9e06-0a3b6c89d90a',
  cleaning: '7f4a1b68-5c92-4e03-8a17-1b4c7d90ea0b',
  movers: '2d6e9c74-8a15-4b26-9b28-2c5d8e01fb0c',
  transport: '9c1b5d82-4e63-4f37-8c39-3d6e9f12ac0d',
  delivery: '4a8f2e96-1b74-4c48-9d4a-4e7f0a23bd0e',
  cars: '6b3d7a08-9c85-4e59-8e5b-5f8a1b34ce0f',
  beauty: '1c5f9b24-2d96-4a6a-9f6c-6a9b2c45df10',
  health: '8d2a6c39-7e07-4b7b-8a7d-7b0c3d56ea11',
  pets: '3e7b1f45-4a18-4c8c-9b8e-8c1d4e67fb12',
  events: '5f9c4a51-6b29-4d9d-8c9f-9d2e5f78ac13',
  household: '0a4d8b67-3c3a-4e0e-9d0a-0e3f6a89bd14',
  garden: '7b1e5c73-8d4b-4f1f-8e1b-1f4a7b90ce15',
  legal: '2c6f9d89-5e5c-4a20-9f2c-2a5b8c01df16',
  business: '9d3a7e95-1f6d-4b31-8a3d-3b6c9d12ea17',
  devices: '4e8b1f01-6a7e-4c42-9b4e-4c7d0e23fb18',
  other: '6f2c5a17-3b8f-4d53-8c5f-5d8e1f34ac19',
} as const;

const TASK_CATEGORIES: TaskCategorySeed[] = [
  {
    id: TASK_CATEGORY_IDS.education,
    title: 'Образование и репетиторство',
    description: 'Репетиторы, подготовка к экзаменам, помощь с обучением.',
  },
  {
    id: TASK_CATEGORY_IDS.it,
    title: 'Программирование и IT',
    description: 'Разработка сайтов, приложений, настройка серверов, консультации.',
  },
  {
    id: TASK_CATEGORY_IDS.design,
    title: 'Дизайн и графика',
    description: 'Логотипы, баннеры, презентации, UI/UX.',
  },
  {
    id: TASK_CATEGORY_IDS.media,
    title: 'Фото и видеосъёмка',
    description: 'Фотограф, видеограф, обработка фотографий и видео.',
  },
  {
    id: TASK_CATEGORY_IDS.texts,
    title: 'Тексты и переводы',
    description: 'Копирайтинг, редактура, переводы, расшифровка аудио.',
  },
  {
    id: TASK_CATEGORY_IDS.marketing,
    title: 'Маркетинг и реклама',
    description: 'Продвижение, реклама, SEO, SMM.',
  },
  {
    id: TASK_CATEGORY_IDS.renovation,
    title: 'Ремонт квартир и домов',
    description: 'Общие ремонтные работы, отделка, монтаж.',
  },
  {
    id: TASK_CATEGORY_IDS.plumbing,
    title: 'Сантехника',
    description: 'Установка и ремонт сантехники, устранение протечек.',
  },
  {
    id: TASK_CATEGORY_IDS.electrics,
    title: 'Электрика',
    description: 'Розетки, освещение, электропроводка, подключение техники.',
  },
  {
    id: TASK_CATEGORY_IDS.furniture,
    title: 'Мебель и сборка',
    description: 'Сборка, ремонт и установка мебели.',
  },
  {
    id: TASK_CATEGORY_IDS.cleaning,
    title: 'Клининг',
    description: 'Уборка квартир, домов, офисов и помещений.',
  },
  {
    id: TASK_CATEGORY_IDS.movers,
    title: 'Грузчики и переезды',
    description: 'Погрузка, разгрузка, перевозка, помощь при переезде.',
  },
  {
    id: TASK_CATEGORY_IDS.transport,
    title: 'Перевозки и транспорт',
    description:
      'Перевозка грузов и вещей, доставка крупногабаритных предметов, услуги водителей и грузового транспорта.',
  },
  {
    id: TASK_CATEGORY_IDS.delivery,
    title: 'Доставка и курьерские услуги',
    description: 'Доставка документов, покупок и других товаров.',
  },
  {
    id: TASK_CATEGORY_IDS.cars,
    title: 'Автомобили',
    description: 'Ремонт, обслуживание, диагностика, шиномонтаж.',
  },
  {
    id: TASK_CATEGORY_IDS.beauty,
    title: 'Красота и уход',
    description: 'Парикмахеры, визажисты, маникюр, косметические услуги.',
  },
  {
    id: TASK_CATEGORY_IDS.health,
    title: 'Здоровье и спорт',
    description: 'Тренеры, спортивные занятия, оздоровительные услуги.',
  },
  {
    id: TASK_CATEGORY_IDS.pets,
    title: 'Домашние животные',
    description: 'Выгул, передержка, уход и дрессировка животных.',
  },
  {
    id: TASK_CATEGORY_IDS.events,
    title: 'Мероприятия и праздники',
    description: 'Ведущие, музыканты, организация мероприятий.',
  },
  {
    id: TASK_CATEGORY_IDS.household,
    title: 'Помощь по хозяйству',
    description: 'Мелкие бытовые работы, установка, перенос вещей.',
  },
  {
    id: TASK_CATEGORY_IDS.garden,
    title: 'Сад и участок',
    description: 'Покос травы, уход за растениями, уборка участка.',
  },
  {
    id: TASK_CATEGORY_IDS.legal,
    title: 'Юридические услуги',
    description: 'Консультации, документы, договоры и другие юридические задачи.',
  },
  {
    id: TASK_CATEGORY_IDS.business,
    title: 'Бизнес и консалтинг',
    description: 'Бухгалтерия, аналитика, консультации для бизнеса.',
  },
  {
    id: TASK_CATEGORY_IDS.devices,
    title: 'Помощь с техникой',
    description: 'Настройка компьютеров, телефонов, телевизоров и другой техники.',
  },
  {
    id: TASK_CATEGORY_IDS.other,
    title: 'Прочие услуги',
    description: 'Задачи, которые не подходят под остальные категории.',
  },
];

export const seed = {
  name: 'task-categories',
  checksum: 'f4b7c2e91d6a3508b7c4e2f19d6a3508',
  async run(client: Client): Promise<void> {
    for (const { id, title, description } of TASK_CATEGORIES) {
      await client.query(
        `
          INSERT INTO task_categories (id, title, description)
          VALUES ($1, $2, $3)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            updated_at = now()
        `,
        [id, title, description],
      );
    }
  },
};
