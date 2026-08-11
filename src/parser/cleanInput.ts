export function cleanInput(input: string): string {
  return input
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s/g, '')
    .replace(/\/+/g, '/');
}
