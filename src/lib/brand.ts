/** Resolve supported site-name placeholders and legacy store names at render/send time. */
const legacyStoreNames = /(?:بوتیک(?:\s|‌)*مه[\s‌]*لقا|(?<![\p{L}])مه[\s‌]*لقا(?![\p{L}])|سبزینه)/gu;

export function siteBrandText(value: string | null | undefined, siteName: string): string {
  return (value ?? "")
    .replace(legacyStoreNames, () => siteName)
    .replace(/\{\{\s*(?:siteName|shop)\s*\}\}/g, siteName);
}
