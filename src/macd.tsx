import { HistoricalData, MACDData } from "./types";
import * as d3 from "d3";
import { HEIGHT_RATIO } from "./constant";

const CHART_HEIGHT_RATIO = HEIGHT_RATIO;

export const transformData = (
  data: HistoricalData[]
) =>
  data.map((d) => ({
    ...d,
    datetime: new Date(d.datetime),
    // macd: {...d['macd'], +d['macd'][nestedkey]},
    macd: {
      macdLine: +d["macd"]["macdLine"],
      signalLine: +d["macd"]["signalLine"],
      histogram: +d["macd"]["histogram"],
    },
  }));

const createMACDChart = (
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
    .attr("class", "macdChart")
    .attr("width", width)
    .attr("height", height / CHART_HEIGHT_RATIO);

  const g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${marginLeft}, ${marginTop / CHART_HEIGHT_RATIO})`
    );

  const macdData = IndicatorChart(data, indicatorType);

  // X-axis
  g.append("g").attr(
    "transform",
    `translate(0,${height / CHART_HEIGHT_RATIO})`
  );
  // const transformedData = transformData(rsiData, indicatorType);

  const transformedData = transformData(macdData);
  console.log("transformedData: ", transformedData)
  // const transformedSignalLine = transformData(transformedMACD, 'signalLine');
  // const transformedHistogram = transformData(macdData, 'histogram');

  const newX = x
    .copy()
    .domain(transformedData.map((d) => d.datetime.toString()));

  // const newY = y
  //   .copy()
  //   .domain([-1, 1])
  //   .rangeRound([height / CHART_HEIGHT_RATIO, 0]);

  const newY = y
    .copy()
    .domain([
      d3.min(transformedData, (d) => d.macd.macdLine),
      d3.max(transformedData, (d) => d.macd.macdLine),
    ] as [number, number])
    .rangeRound([height / CHART_HEIGHT_RATIO, 0]);
  // Y-axis
  g.append("g")
    .call(d3.axisLeft(newY))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", 0 - height / CHART_HEIGHT_RATIO / 2)
    .style("text-anchor", "middle")
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("MACD");

  const macdLine = d3
    .line<HistoricalData>()
    .x((d, i) => newX(d.datetime.toString())! + newX.bandwidth() / 2)
    .y((d) => newY(d.macd.macdLine));

  g.append("path")
    .datum(transformedData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", macdLine);

  const signalLine = d3
    .line<HistoricalData>()
    .x((d, i) => newX(d.datetime.toString())! + newX.bandwidth() / 2)
    .y((d) => newY(d.macd.signalLine));

  g.append("path")
    .datum(transformedData)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    .attr("d", signalLine);

    // const histogramBar = d3.area<MACDPoint>()
    // .defined(d => d.histogram !== null)
    // .x(d => x(d.date))
    // .y0(y(0))
    // .y1(d => y(d.histogram));

  const histogram = d3
    .area<HistoricalData>()
    .x((d, i) => newX(d.datetime.toString())! + newX.bandwidth() / 2)
    .y0(newY(0))
    .y1((d) => newY(d.macd.signalLine));

  g.append("path")
    .datum(transformedData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", histogram);
};

const calculateEMA = (data: number[], period: number): number[] => {
  let ema: number[] = [];
  let multiplier = 2 / (period + 1);

  // Start by calculating the simple average for the initial EMA value
  let initialSum = 0;
  for (let i = 0; i < period; i++) {
    initialSum += +data[i];
    ema[i] = 0;
  }
  ema[period - 1] = initialSum / period;

  // Calculate the rest of the EMA values
  for (let i = period; i < data.length; i++) {
    ema[i] = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
  }

  return ema;
};

const IndicatorChart = (
  data: HistoricalData[],
  indicator: keyof HistoricalData
): HistoricalData[] => {
  // let indicatorData: HistoricalData[] = [];

  // switch (indicator) {
  //   case "rsi":
  const indicatorData = calculateMACD([...data]);
  //   break;
  // default:
  //   console.log("Default");
  // }

  return indicatorData;
};

const calculateMACD = (data: HistoricalData[]): HistoricalData[] => {
  let newData = [...data];
  const closingPrices = newData.map((d) => d.close);
  const ema12 = calculateEMA(closingPrices, 12);
  const ema26 = calculateEMA(closingPrices, 26);
  
  let macdLine: number[] = [];
  for (let i = 0; i < closingPrices.length; i++) {
    if (ema12[i] && ema26[i]) {
      macdLine[i] = ema12[i] - ema26[i];
    } else {
      macdLine[i] = 0;
    }
    newData[i] = {
      ...newData[i],
      macd: { ...newData[i]["macd"], macdLine: macdLine[i] },
    };
  }

  const signalLine = calculateEMA(
    macdLine.filter((m) => m !== null) as number[],
    9
  );

  // Add nulls back to the start of the signal line to align with the original data
  for (let i = 0, len = macdLine.length - signalLine.length; i < len; i++) {
    signalLine.unshift(0);
  }

  let histogram: number[] = [];
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] !== null && signalLine[i] !== null) {
      histogram[i] = macdLine[i] - signalLine[i];
    } else {
      histogram[i] = 0;
    }
  }
  newData.forEach((e, i) => {
    e.macd.macdLine = macdLine[i];
    e.macd.signalLine = signalLine[i];
    e.macd.histogram = histogram[i];
  });

  return newData;
};

export default createMACDChart;

// const { macdLine, signalLine, histogram } = calculateMACD(data);
// console.log({ macdLine, signalLine, histogram });
