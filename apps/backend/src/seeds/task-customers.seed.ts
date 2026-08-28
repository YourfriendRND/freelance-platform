import { Client } from 'pg';
import { loadAuthConfig } from '@freelance-platform/shared-config';
import { UserRole } from '@freelance-platform/shared-types';
import { hashPassword } from '../common/hash-password';

type TaskCustomerSeed = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

const SEED_PASSWORD = 'Password123';

export const TASK_CUSTOMER_IDS = {
  ivanov: 'b7e14a02-91c3-4d58-8a6f-1c2d3e4f5a61',
  smirnova: 'd3a58c14-72b9-4e01-9b7c-2d3e4f5a6b72',
  volkov: 'f1c92b36-58d4-4a27-8c8d-3e4f5a6b7c83',
} as const;

const TASK_CUSTOMERS: TaskCustomerSeed[] = [
  {
    id: TASK_CUSTOMER_IDS.ivanov,
    email: 'ivan.petrov@example.com',
    firstName: 'Иван',
    lastName: 'Петров',
  },
  {
    id: TASK_CUSTOMER_IDS.smirnova,
    email: 'anna.smirnova@example.com',
    firstName: 'Анна',
    lastName: 'Смирнова',
  },
  {
    id: TASK_CUSTOMER_IDS.volkov,
    email: 'sergey.volkov@example.com',
    firstName: 'Сергей',
    lastName: 'Волков',
  },
];

export const seed = {
  name: 'task-customers',
  checksum: 'a5d81c37e94b62f0d8a3c51e97b46280',
  async run(client: Client): Promise<void> {
    const { saltWord } = loadAuthConfig();

    for (const { id, email, firstName, lastName } of TASK_CUSTOMERS) {
      const passwordHash = await hashPassword(SEED_PASSWORD, saltWord);

      await client.query(
        `
          INSERT INTO users (id, email, first_name, last_name, password_hash, role)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            updated_at = now()
        `,
        [id, email, firstName, lastName, passwordHash, UserRole.Client],
      );
    }
  },
};
