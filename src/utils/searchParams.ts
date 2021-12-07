export const getIntegerFromSearchParams = (
  searchParams: string | null,
  defaultValue: number
): number => {
  if (searchParams === null) return defaultValue;

  const parseIntResult = parseInt(searchParams, 10);
  if (isNaN(parseIntResult) || parseIntResult < 0) return defaultValue;

  return parseIntResult;
};
