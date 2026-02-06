export type StatBalance = "Balanced" | "Specialized" | "Skewed";

const getMean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

const getStdDev = (values: number[], mean: number) => {
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

// Deterministic balance classifier using coefficient of variation.
export const classifyStatBalance = (stats: Array<{ value: number }>): StatBalance => {
  const values = stats.map((stat) => stat.value);
  if (!values.length) return "Balanced";
  const mean = getMean(values);
  const stdDev = getStdDev(values, mean);
  const cv = stdDev / (mean || 1);

  if (cv < 0.2) return "Balanced";
  if (cv < 0.35) return "Specialized";
  return "Skewed";
};
