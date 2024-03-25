// IndicatorChart.tsx
import { HistoricalData } from "./types";

const IndicatorChart = (
  data: HistoricalData[],
  indicator: keyof HistoricalData
): HistoricalData[] => {
  let indicatorData: HistoricalData[] = [];

  switch (indicator) {
    case "rsi":
      indicatorData = calculateRSI([...data]);
      break;
    default:
      console.log("Default");
  }

  return indicatorData;
};

function calculateRSI(data: HistoricalData[]): HistoricalData[] {
  const period = 14;
  let newData = [...data];

  for (let i = period; i < data.length; i++) {
    const prices = newData.slice(i - period, i);
    const rsi = calculateRsiValue(prices);
    newData[i] = { ...newData[i], rsi };
  }

  return newData;
}

function calculateRsiValue(prices: HistoricalData[]): number {
  const period = 14;
  const gains = [];
  const losses = [];

  // Calculate gains and losses
  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i]["close"] - prices[i - 1]["close"];
    if (diff > 0) {
      gains.push(diff);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(Math.abs(diff));
    }
  }

  // Calculate average gain and average loss
  const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / period;
  const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / period;

  // Calculate RSI
  if (avgLoss === 0) {
    return 100;
  }
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return rsi;
}

export default IndicatorChart;
