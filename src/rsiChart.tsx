// IndicatorChart.tsx
import { HistoricalData } from "./types";
import * as d3 from "d3";
import { transformData } from "./chart";
import { HEIGHT_RATIO } from "./constant";

const CHART_HEIGHT_RATIO = HEIGHT_RATIO;

const createRSIChart = (
  indicatorType: keyof HistoricalData,
  data: HistoricalData[],
  width: number,
  height: number,
  marginLeft: number,
  marginTop: number,
  marginRight: number,
  marginBottom: number,
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number, never>
) => {
  const svg = d3
    .select(".indicatorChart")
    .append("svg")
    .attr("class", "rsiChart")
    .attr("width", width)
    .attr("height", height / CHART_HEIGHT_RATIO);

  const g = svg
    .append("g")
    .attr("width", width - marginLeft - marginRight)
    .attr("height", height / CHART_HEIGHT_RATIO + marginTop + marginBottom)
    .attr(
      "transform",
      `translate(${marginLeft}, ${marginTop / CHART_HEIGHT_RATIO})`
    );

  const rsiData = IndicatorChart(data, indicatorType);

  // X-axis
  g.append("g").attr(
    "transform",
    `translate(0,${height / CHART_HEIGHT_RATIO})`
  );
  const transformedData = transformData(rsiData, indicatorType);

  const newX = x
    .copy()
    .domain(transformedData.map((d) => d.datetime.toString()));

  const newY = y
    .copy()
    .domain([0, 100])
    .rangeRound([height / CHART_HEIGHT_RATIO, 0]);
  // Y-axis
  g.append("g")
    .call(d3.axisLeft(newY))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", -30)
    .attr("x", 0 - height / CHART_HEIGHT_RATIO / 2)
    .style("text-anchor", "middle")
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("RSI");

  const line = d3
    .line<HistoricalData>()
    .x((d, i) => newX(d.datetime.toString())! + newX.bandwidth() / 2)
    .y((d) => newY(d.rsi));

  g.append("path")
    .datum(transformedData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);
};

const IndicatorChart = (
  data: HistoricalData[],
  indicator: keyof HistoricalData
): HistoricalData[] => {
  let indicatorData: HistoricalData[] = [];

  indicatorData = calculateRSI([...data]);

  return indicatorData;
};

function calculateRSI(data: HistoricalData[]): HistoricalData[] {
  const period = 14;
  let newData = [...data];

  for (let i = 0; i < period; i++) {
    newData[i] = { ...newData[i], rsi: 0 };
  }

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

export default createRSIChart;
