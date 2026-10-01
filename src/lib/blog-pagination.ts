/** Keep invalid query values on page one; never accept partial numbers. */
export function parseBlogPage(raw?: string): number {
  if (!raw || !/^[1-9]\d*$/.test(raw)) return 1;
  const page = Number(raw);
  return Number.isSafeInteger(page) ? page : 1;
}
