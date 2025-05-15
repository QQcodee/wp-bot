type OddsFormat = "decimal" | "american";

interface ArbitrageInput {
  oddsA: number;
  oddsB: number;
  totalStake: number;
  format?: OddsFormat; // default: "decimal"
}

interface ArbitrageResult {
  isArbitrage: boolean;
  arbitragePercent: number;
  stakeA: number;
  stakeB: number;
  profit: number;
}

function toDecimal(american: number): number {
  return american > 0 ? 1 + american / 100 : 1 + 100 / Math.abs(american);
}

export function calculateArbitrage({
  oddsA,
  oddsB,
  totalStake,
  format = "decimal",
}: ArbitrageInput): ArbitrageResult {
  const oA = format === "american" ? toDecimal(oddsA) : oddsA;
  const oB = format === "american" ? toDecimal(oddsB) : oddsB;

  const arbitragePercent = 1 / oA + 1 / oB;
  const isArbitrage = arbitragePercent < 1;

  const stakeA = totalStake / oA / arbitragePercent;
  const stakeB = totalStake / oB / arbitragePercent;
  const profit = isArbitrage ? totalStake * (1 - arbitragePercent) : 0;

  return {
    isArbitrage,
    arbitragePercent,
    stakeA: parseFloat(stakeA.toFixed(2)),
    stakeB: parseFloat(stakeB.toFixed(2)),
    profit: parseFloat(profit.toFixed(2)),
  };
}
