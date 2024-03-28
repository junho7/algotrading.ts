import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { HistoricalData } from "./types";
import createRSIChart from "./rsiChart";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./store";
import { updateMinimapSelection } from "./actions";
import { HEIGHT_RATIO } from "./constant";
import createMACDChart from "./macd";

export const transformData = (
  data: HistoricalData[],
  key: keyof HistoricalData
) =>
  data.map((d) => ({
    ...d,
    datetime: new Date(d.datetime),
    [key]: +d[key],
  }));
const MINIMAP_HEIGHT_RATIO = HEIGHT_RATIO;

const Chart = (props: IChartProps) => {
  const { data: chartData, selection: minimapSelection } = useSelector(
    (state: RootState) => state.chart
  );
  const dispatch = useDispatch();
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData]);

  const mainChartRef = useRef(null);
  const minimapRef = useRef(null);
  const indicatorChartRef = useRef(null);
  const width = props.width;
  const height = props.height;

  const draw = () => {
    if (
      chartData.length > 1 &&
      mainChartRef.current &&
      minimapRef.current &&
      indicatorChartRef.current
    ) {
      console.log("draw");
      d3.select(mainChartRef.current).selectAll("*").remove();

      const miniSvg = d3.select(minimapRef.current);
      miniSvg.selectAll("*").remove();

      d3.select(indicatorChartRef.current).selectAll("*").remove();

      const innerWidth = width - props.left - props.right;
      const innerHeight = height - props.top - props.bottom;
      const marginLeft = props.left;
      const marginTop = props.top;
      const marginRight = props.right;
      const marginBottom = props.bottom;

      let data = chartData.map((x) => Object.assign({}, x));

      const transformedData = transformData(data, "close");

      const x = d3.scaleBand().range([0, innerWidth]).padding(0.5);
      const y = d3
        .scaleLinear()
        .rangeRound([height - marginBottom - marginTop, marginTop]);

      x.domain(data.map((d) => d.datetime.toString()));
      y.domain([
        d3.min(transformedData, (d) => d.close),
        d3.max(transformedData, (d) => d.close),
      ] as [number, number]);

      createMainChart(
        data,
        innerWidth,
        innerHeight,
        marginLeft,
        marginTop,
        marginRight,
        marginBottom,
        x,
        y
      );

      createRSIChart(
        "rsi",
        data,
        innerWidth,
        innerHeight,
        marginLeft,
        marginTop,
        marginRight,
        marginBottom,
        x,
        y
      );

      createMinimap(
        miniSvg,
        data,
        innerWidth,
        innerHeight,
        marginLeft,
        marginTop,
        marginRight,
        marginBottom,
        x,
        y
      );
    }
  };

  const createMainChart = (
    data: HistoricalData[],
    innerWidth: number,
    innerHeight: number,
    marginLeft: number,
    marginTop: number,
    marginRight: number,
    marginBottom: number,
    x: d3.ScaleBand<string>,
    y: d3.ScaleLinear<number, number, never>
  ) => {
    const svg = d3
      .select(".chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${marginLeft}, ${marginTop})`);

    const timeFormat = d3.timeFormat("%Y-%m-%d %H:%M");

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(x.domain().filter((_, i) => i % 20 === 0))
          .tickFormat((d, i) => timeFormat(new Date(d)))
      )
      .selectAll("text")
      .attr("y", 0)
      .attr("x", -50)
      .attr("transform", "rotate(-90)");

    // Y-axis
    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Close");

    // Define the arrow markers for buy and sell signals
    svg
      .append("defs")
      .selectAll("marker")
      .data(["buy", "sell"])
      .enter()
      .append("marker")
      .attr("id", (d) => d)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", (d) => (d === "buy" ? "green" : "red"))
      .attr("d", (d) => (d === "buy" ? "M0,-5L10,0L0,5" : "M10,-5L0,0L10,5"));

    const line = d3
      .line<HistoricalData>()
      .x((d, i) => x(d.datetime.toString())! + x.bandwidth() / 2)
      .y((d) => y(d.close));

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    // Buy and sell signals
    // g.selectAll('buySignal')
    //     .data(data.filter(d => d.signal === 'BUY'))
    //     .enter().append('line')
    //     .attr('x1', d => x(new Date(d.datetime)))
    //     .attr('y1', d => y(d.close))
    //     .attr('x2', d => x(new Date(d.datetime)))
    //     .attr('y2', d => y(d.close) - 10)
    //     .attr('stroke', 'green')
    //     .attr('marker-end', 'url(#buy)');

    // g.selectAll('sellSignal')
    //     .data(data.filter(d => d.signal === 'SELL'))
    //     .enter().append('line')
    //     .attr('x1', d => x(new Date(d.datetime)))
    //     .attr('y1', d => y(d.close))
    //     .attr('x2', d => x(new Date(d.datetime)))
    //     .attr('y2', d => y(d.close) + 10)
    //     .attr('stroke', 'red')
    //     .attr('marker-end', 'url(#sell)');
  };

  const createMinimap = (
    svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    data: HistoricalData[],
    innerWidth: number,
    innerHeight: number,
    marginLeft: number,
    marginTop: number,
    marginRight: number,
    marginBottom: number,
    mainX: d3.ScaleBand<string>,
    mainY: d3.ScaleLinear<number, number, never>
  ) => {
    const transformedData = transformData(data, "close");

    const newX = mainX
      .copy()
      .domain(transformedData.map((d) => d.datetime.toString()))
      .range([0, innerWidth])
      .padding(0.5);

    const y = mainY
      .copy()
      .domain([
        d3.min(transformedData, (d) => d.close),
        d3.max(transformedData, (d) => d.close),
      ] as [number, number])
      .rangeRound([height / MINIMAP_HEIGHT_RATIO, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .attr("width", width - marginLeft - marginRight)
      .attr("height", height / MINIMAP_HEIGHT_RATIO + marginTop + marginBottom);

    const line = d3
      .line<HistoricalData>()
      .x((d, i) => newX(d.datetime.toString())! + newX.bandwidth() / 2)
      .y((d) => y(d.close));

    g.append("path")
      .datum(transformedData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    // Brush for selecting the region
    const brush = d3.brushX();

    brush
      .extent([
        [0, 0],
        [innerWidth, height / MINIMAP_HEIGHT_RATIO],
      ])
      .on("brush end", brushed);

    const brushArea = svg
      .append("g")
      .attr("class", "brush-area")
      .attr("transform", `translate(${marginLeft},0)`);

    brushArea.call(brush);
    const brushNode = brushArea.node();
    if (
      brushNode instanceof SVGGElement &&
      minimapSelection.toString() !== "-1,-1"
    ) {
      brush.move(brushArea as any, minimapSelection);
    } else {
      brush.move(brushArea as any, [
        ((width - marginLeft - marginRight) / 4) * 3,
        width - marginLeft - marginRight,
      ]);
    }

    function brushed(event: d3.D3BrushEvent<SVGGElement>) {
      const selection = event.selection as [number, number];
      dispatch(updateMinimapSelection(selection));
      if (selection) {
        const [x0, x1] = selection.map((r) => invertPointScale(newX, r));
        if (x0 && x1) {
          if (mainChartRef.current) {
            const mainSvg = d3.select<SVGSVGElement, unknown>(
              mainChartRef.current
            );
            mainSvg.selectAll("*").remove();
            d3.select(indicatorChartRef.current).selectAll("*").remove();

            const filteredData = data.filter(
              (d) =>
                new Date(d.datetime) >= new Date(newX.domain()[x0]) &&
                new Date(d.datetime) <= new Date(newX.domain()[x1])
            );
            const newMainX = newX
              .copy()
              .domain(filteredData.map((d) => d.datetime.toString()));

            const newY = mainY
              .copy()
              .domain([
                d3.min(transformedData, (d) => d.close),
                d3.max(transformedData, (d) => d.close),
              ] as [number, number])
              .rangeRound([height - marginBottom - marginTop, marginTop]);

            createMainChart(
              filteredData,
              innerWidth,
              innerHeight,
              marginLeft,
              marginTop,
              marginRight,
              marginBottom,
              newMainX,
              newY
            );

            const temp = ["rsi", "macd"];
            temp.forEach((indicatorType) => {
              switch (indicatorType) {
                case "rsi":
                  createRSIChart(
                    indicatorType as keyof HistoricalData,
                    filteredData,
                    width,
                    height,
                    marginLeft,
                    marginTop,
                    marginRight,
                    marginBottom,
                    newX,
                    y
                  );
                  break;
                case "macd":
                  createMACDChart(
                    indicatorType as keyof HistoricalData,
                    filteredData,
                    width,
                    height,
                    marginLeft,
                    marginTop,
                    marginRight,
                    marginBottom,
                    newX,
                    y
                  )
                  break;
                default:
                  console.log("Default");
              }
            });
          }
        }
      }
    }

    function invertPointScale(
      scale: d3.ScaleBand<string>,
      rangeValue: number
    ): number {
      const domain = scale.domain();
      const range = scale.range();
      const rangePoints = d3.range(range[0], range[1], newX.step());
      const index = d3.bisect(rangePoints, rangeValue);
      return Math.max(0, Math.min(index, domain.length - 1));
    }
  };

  // const createRSIChart = (
  //   indicatorType: keyof HistoricalData,
  //   data: HistoricalData[],
  //   innerWidth: number,
  //   innerHeight: number,
  //   marginLeft: number,
  //   marginTop: number,
  //   marginRight: number,
  //   marginBottom: number,
  //   x: d3.ScaleBand<string>,
  //   y: d3.ScaleLinear<number, number, never>
  // ) => {
  //   const svg = d3
  //     .select(".indicatorChart")
  //     .append("svg")
  //     .attr("width", width)
  //     .attr("height", height / MINIMAPHEIGHTRATIO );

  //   const g = svg
  //     .append("g")
  //     .attr(
  //       "transform",
  //       `translate(${marginLeft}, ${marginTop / MINIMAPHEIGHTRATIO})`
  //     );

  //   const rsiData = IndicatorChart(data, indicatorType);

  //   // X-axis
  //   g.append("g").attr(
  //     "transform",
  //     `translate(0,${height / MINIMAPHEIGHTRATIO})`
  //   );
  //   const transformedData = transformData(rsiData, indicatorType);

  //   const newX = x
  //     .copy()
  //     .domain(transformedData.map((d) => d.datetime.toString()));

  //   const newY = y
  //     .copy()
  //     .domain([0, 100])
  //     .rangeRound([height / MINIMAPHEIGHTRATIO, 0]);
  //   // Y-axis
  //   g.append("g")
  //     .call(d3.axisLeft(newY))
  //     .append("text")
  //     .attr("fill", "#000")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", -30)
  //     .attr("x", 0 - height / MINIMAPHEIGHTRATIO / 2)
  //     .style("text-anchor", "middle")
  //     .attr("dy", "0.71em")
  //     .attr("text-anchor", "end")
  //     .text("RSI");

  //   const line = d3
  //     .line<HistoricalData>()
  //     .x((d, i) => newX(d.datetime.toString())! + newX.bandwidth() / 2)
  //     .y((d) => y(d.close));

  //   g.append("path")
  //     .datum(transformedData)
  //     .attr("fill", "none")
  //     .attr("stroke", "steelblue")
  //     .attr("stroke-width", 1.5)
  //     .attr("d", line);
  // };

  return (
    <>
      <div className="chart" ref={mainChartRef}></div>
      <div>
        <svg
          width={width}
          height={height / MINIMAP_HEIGHT_RATIO}
          ref={minimapRef}
        />
      </div>
      <div className="indicatorChart" ref={indicatorChartRef} />
    </>
  );
};

export interface IChartProps {
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export default Chart;
