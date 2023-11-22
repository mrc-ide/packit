export function pascalCase(str: string): string {
  return str
    .split(/[-_]/g)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("");
}
