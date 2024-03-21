// IndicatorChart.tsx
import React from 'react';
import { HistoricalData } from './types';  // Adjust the import based on your file structure

interface IndicatorChartProps {
  data: HistoricalData[];
  indicator: string;
}

const IndicatorChart = (data: HistoricalData[], indicator: keyof HistoricalData): HistoricalData[] => {
// const IndicatorChart: React.FC<IndicatorChartProps> = ({ data, indicator }) => {
  
  let indicatorData: HistoricalData[] = []
  
  switch (indicator){
    case "rsi":
      indicatorData = calculateRSI(data)
      break;
    default:
        console.log('Default')
  }

  // Render logic for the indicator chart
  // You'll need to implement the rendering based on `indicatorData`
  // For example, you might use D3.js to draw the lines or bars representing the indicator values


  return indicatorData
  // return (
  //   <div>
  //     {/* Placeholder rendering - replace with actual chart rendering logic */}
  //     <p>{indicator} chart goes here.</p>
  //   </div>
  // );
};

function calculateRSI(data: HistoricalData[]): HistoricalData[] {
// function calculateRSI(data: HistoricalData[]): { datetime: Date, rsi: number }[] {
  const period = 14;
  // const initialPrices = [...prevData.slice(-period), ...data.slice(0, period)].map(d => d.close);
  // const initialRsi = calculateRsiValue(initialPrices);

  // const rsiValues = [];
  // const rsiValues = [{
  //   time: data[0].time,
  //   rsi: initialRsi
  // }];

  for (let i = period; i < data.length; i++) {
    const prices = data.slice(i - period, i);
    // const prices = data.slice(i - period, i).map(d => d.close);
    const rsi = calculateRsiValue(prices);
    // rsiValues.push({ ...data[i], rsi });
    // rsiValues.push({ datetime: data[i].datetime, rsi });
    data[i]['rsi'] = rsi;
  }

  return data;
}

function calculateRsiValue(prices: HistoricalData[]): number {
  const period = 14;
  const gains = [];
  const losses = [];

  // Calculate gains and losses
  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i]['close'] - prices[i - 1]['close'];
    console.log('diff: ', diff)
    if (diff > 0) {
      gains.push(diff);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(Math.abs(diff));
    }
  }

  // Calculate average gain and average loss
  console.log('gains.length: ', gains.length)
  console.log('period: ', period)
  console.log('gains: ', gains)
  console.log('gains.slice(gains.length - period): ', gains.slice(gains.length - period))
  console.log('losses: ', losses)
  console.log('gains.slice(gains.length - period).reduce: ', gains.slice(gains.length - period).reduce((sum, gain) => sum + gain, 0))
  const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / period;
  const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / period;
  // const avgGain = gains.slice(gains.length - period).reduce((sum, gain) => sum + gain, 0) / period;
  // const avgLoss = losses.slice(losses.length - period).reduce((sum, loss) => sum + loss, 0) / period;

  console.log('avgGain: ', avgGain)
  console.log('avgLoss: ', avgLoss)

  // Calculate RSI
  if(avgLoss === 0){
    return 100;
  }
  const rs = avgGain / avgLoss;
  console.log('rs: ', rs)
  const rsi = 100 - (100 / (1 + rs));
  console.log('rsi: ', rsi)

  return rsi;
}

export default IndicatorChart;
