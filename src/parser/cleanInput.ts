export function cleanInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\s\u200B\u00A0\uFEFF]+/g, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/+/g, '/');
}
