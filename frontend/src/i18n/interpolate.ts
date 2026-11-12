const PLACEHOLDER = /\{(\w+)\}/gu;

export function interpolate(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(PLACEHOLDER, (match, key: string) => (Object.hasOwn(values, key) ? String(values[key]) : match));
}
