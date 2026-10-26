export function findButtonByLabel(root: ParentNode, label: string): HTMLButtonElement {
  const match = Array.from(root.querySelectorAll('button')).find(
    (item) => item.textContent?.trim() === label,
  );

  if (!match) {
    throw new Error(`Button "${label}" was not found`);
  }

  return match;
}
