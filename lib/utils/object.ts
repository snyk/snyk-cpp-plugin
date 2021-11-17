export function isEmpty(obj: Record<string, unknown>): boolean {
  return obj && Object.keys(obj).length === 0;
}
