
export function parseId(value: string): number | null {
  const id = Number(value);

  if (
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    id > 2147483647
  ) {
    return null;
  }

  return id;
}
