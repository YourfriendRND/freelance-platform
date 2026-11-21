import { expect, Page, test } from '@playwright/test';
import { UserRole } from '@freelance-platform/shared-types';
import { loginUserByUi, registerUserByUi, waitForAppPath } from '../support/auth';
import { createRegisterUser, type RegisterUserData } from '../support/users';

async function openAs(page: Page, user: RegisterUserData): Promise<void> {
  await registerUserByUi(page, user);
  await loginUserByUi(page, {
    email: user.email,
    password: user.password,
  });
  await expect(page.getByRole('heading', { level: 1, name: 'Задачи' })).toBeVisible();
  await expect(page.getByText('Навыки')).toHaveCount(0);
}

function uniqueSkillName(): string {
  const token = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  return `Sk${token}Skill`;
}

async function openProfileEditor(page: Page): Promise<void> {
  await page.goto('/profile');
  await waitForAppPath(page, '/profile');
  await page.getByRole('button', { name: 'Редактировать', exact: true }).click();
}

async function searchSkills(page: Page, query: string): Promise<void> {
  const searchResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/skills') && response.request().method() === 'GET',
  );

  await page.locator('#profile-skill-name').fill(query);
  await searchResponse;
}

test('shows an empty skill list for a freelancer', async ({ page }) => {
  const user = createRegisterUser('freelancer-skills', UserRole.Freelancer);
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  await openAs(page, user);

  await page.goto('/profile');
  await waitForAppPath(page, '/profile');
  await expect(page.getByRole('heading', { name: displayName })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Навыки' })).toBeVisible();
  await expect(page.getByText('Навыки пока не указаны')).toBeVisible();

  await page.goto('/analytics');
  await waitForAppPath(page, '/analytics');
  await expect(page.getByRole('heading', { name: 'Ваш профиль' })).toBeVisible();
  await expect(page.getByText('Навыки не указаны')).toBeVisible();
});

test('hides skills from a customer', async ({ page }) => {
  const user = createRegisterUser('customer-skills', UserRole.Client);
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  await openAs(page, user);

  await page.goto('/profile');
  await waitForAppPath(page, '/profile');
  await expect(page.getByRole('heading', { name: displayName })).toBeVisible();
  await expect(page.getByText('Навыки')).toHaveCount(0);

  await page.getByRole('button', { name: 'Редактировать', exact: true }).click();
  await expect(page.locator('#profile-skill-name')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Сохранить' })).toBeVisible();
  await expect(page.getByText('Навыки')).toHaveCount(0);

  await page.goto('/analytics');
  await waitForAppPath(page, '/analytics');
  await expect(page.getByText('Вот что происходит с вашими задачами')).toBeVisible();
  await expect(page.getByText('Навыки')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Ваш профиль' })).toHaveCount(0);
});

test('saves a skill, rejects a duplicate and selects the stored skill', async ({ page }) => {
  const user = createRegisterUser('freelancer-skill-edit', UserRole.Freelancer);
  const skillName = uniqueSkillName();

  await openAs(page, user);
  await openProfileEditor(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await searchSkills(page, skillName);

  const skillInput = await page.locator('#profile-skill-name').boundingBox();
  const skillMenu = await page.locator('#profile-skill-options').boundingBox();
  const addButton = await page.getByRole('button', { name: 'Добавить', exact: true }).boundingBox();

  expect(skillInput).not.toBeNull();
  expect(skillMenu).not.toBeNull();
  expect(addButton).not.toBeNull();
  expect(skillMenu!.y).toBeGreaterThan(skillInput!.y + skillInput!.height - 1);
  expect(addButton!.y).toBeGreaterThan(skillMenu!.y + skillMenu!.height - 1);

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByRole('option', { name: `Добавить «${skillName}»` }).click();
  await expect(page.getByRole('button', { name: `Удалить ${skillName}` })).toBeVisible();

  await page.locator('#profile-skill-name').fill(skillName.toLowerCase());
  await page.getByRole('button', { name: 'Добавить', exact: true }).click();

  await expect(page.getByRole('alert')).toHaveText('Навык уже добавлен');
  await expect(page.getByRole('button', { name: /^Удалить / })).toHaveCount(1);

  const createResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/users/') && response.request().method() === 'PATCH',
  );
  await page.getByRole('button', { name: 'Сохранить' }).click();
  const created = await createResponse;

  expect(created.ok()).toBe(true);
  expect(created.request().postDataJSON()).toMatchObject({ skills: [skillName] });
  await expect(page.getByRole('button', { name: 'Редактировать', exact: true })).toBeVisible();
  await expect(page.getByText('Навыки пока не указаны')).toHaveCount(0);
  await expect(page.getByText(skillName, { exact: true })).toBeVisible();

  await page.goto('/analytics');
  await waitForAppPath(page, '/analytics');
  await expect(page.getByRole('heading', { name: 'Ваш профиль' })).toBeVisible();
  await expect(page.getByText('Навыки не указаны')).toHaveCount(0);
  await expect(page.getByText(skillName, { exact: true })).toBeVisible();

  await openProfileEditor(page);
  await page.getByRole('button', { name: `Удалить ${skillName}` }).click();
  await searchSkills(page, skillName.toLowerCase());

  const storedSkill = page.getByRole('option', { name: skillName });
  await expect(storedSkill).toContainText('Существующий навык');
  await storedSkill.click();
  await expect(page.getByRole('button', { name: `Удалить ${skillName}` })).toBeVisible();

  const updateResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/users/') && response.request().method() === 'PATCH',
  );
  await page.getByRole('button', { name: 'Сохранить' }).click();
  const updated = await updateResponse;

  expect(updated.ok()).toBe(true);
  expect(updated.request().postDataJSON()).toMatchObject({ skills: [skillName] });
  await expect(page.getByText(skillName, { exact: true })).toBeVisible();
  await expect(page.getByText(skillName.toLowerCase(), { exact: true })).toHaveCount(0);
});
