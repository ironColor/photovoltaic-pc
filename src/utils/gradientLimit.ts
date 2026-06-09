export const isAdjacentGradientTooLarge = (value: any, limit?: number) => {
  if (limit === undefined) return false;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue < 0 && Math.abs(numericValue) > Math.abs(limit);
};
