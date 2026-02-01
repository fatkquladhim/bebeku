// FCR (Feed Conversion Ratio) Calculation
// FCR = Total Feed Consumed (kg) / Total Weight Gain (kg)
export function calculateFCR(
  totalFeedKg: number,
  totalWeightGainKg: number
): number {
  if (totalWeightGainKg <= 0) return 0;
  return Number((totalFeedKg / totalWeightGainKg).toFixed(2));
}

// Mortality Rate Calculation
// Mortality Rate = (Total Deaths / Initial Population) × 100%
export function calculateMortalityRate(
  totalDeaths: number,
  initialPopulation: number
): number {
  if (initialPopulation <= 0) return 0;
  return Number(((totalDeaths / initialPopulation) * 100).toFixed(2));
}

// Daily Mortality Rate
export function calculateDailyMortalityRate(
  dailyDeaths: number,
  currentPopulation: number
): number {
  if (currentPopulation <= 0) return 0;
  return Number(((dailyDeaths / currentPopulation) * 100).toFixed(2));
}

// Calculate bird age in days
export function calculateBirdAge(startDate: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - new Date(startDate).getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate total feed consumed from daily records
export function calculateTotalFeed(
  feedMorningKg: number,
  feedEveningKg: number
): number {
  return Number((feedMorningKg + feedEveningKg).toFixed(2));
}

// Calculate estimated FCR for a batch
export function calculateBatchFCR(
  dailyRecords: { feedMorningKg: number; feedEveningKg: number; mortalityCount: number }[],
  initialPopulation: number,
  currentAverageWeightGr: number,
  initialWeightGr: number = 40 // DOC average weight ~40g
): { fcr: number; totalFeedKg: number; totalWeightGainKg: number } {
  const totalFeedKg = dailyRecords.reduce(
    (sum, record) =>
      sum + calculateTotalFeed(record.feedMorningKg, record.feedEveningKg),
    0
  );

  const totalDeaths = dailyRecords.reduce(
    (sum, record) => sum + record.mortalityCount,
    0
  );

  const currentPopulation = initialPopulation - totalDeaths;
  const totalInitialWeightKg = (initialPopulation * initialWeightGr) / 1000;
  const totalCurrentWeightKg = (currentPopulation * currentAverageWeightGr) / 1000;
  const totalWeightGainKg = totalCurrentWeightKg - totalInitialWeightKg;

  const fcr = calculateFCR(totalFeedKg, totalWeightGainKg);

  return { fcr, totalFeedKg, totalWeightGainKg };
}

// Calculate cost per kg of meat
export function calculateCostPerKg(
  totalCost: number,
  totalWeightKg: number
): number {
  if (totalWeightKg <= 0) return 0;
  return Number((totalCost / totalWeightKg).toFixed(0));
}

// Calculate cost per bird
export function calculateCostPerBird(
  totalCost: number,
  population: number
): number {
  if (population <= 0) return 0;
  return Number((totalCost / population).toFixed(0));
}

// Calculate egg production rate
export function calculateEggProductionRate(
  totalEggs: number,
  population: number
): number {
  if (population <= 0) return 0;
  return Number(((totalEggs / population) * 100).toFixed(2));
}

// Check if mortality is above threshold (alert)
export function isMortalityAlert(
  dailyDeaths: number,
  currentPopulation: number,
  threshold: number = 0.5 // 0.5% daily mortality threshold
): boolean {
  const dailyRate = calculateDailyMortalityRate(dailyDeaths, currentPopulation);
  return dailyRate > threshold;
}

// Calculate days until harvest
export function calculateDaysUntilHarvest(
  startDate: Date,
  targetHarvestAge: number
): number {
  const age = calculateBirdAge(startDate);
  return Math.max(0, targetHarvestAge - age);
}

// Format currency (IDR)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format number with thousand separator
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

// Format weight (grams to kg if >= 1000g)
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${grams} g`;
}

// Calculate average from array of numbers
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return Number((sum / numbers.length).toFixed(2));
}

// Generate batch code: B-YYYY-NNN
export function generateBatchCode(year: number, sequence: number): string {
  const seq = sequence.toString().padStart(3, "0");
  return `B-${year}-${seq}`;
}
