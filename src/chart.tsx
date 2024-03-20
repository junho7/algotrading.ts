import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { HistoricalData } from "./types";
import IndicatorChart from "./IndicatorChart";

const transformData = (data: HistoricalData[], key: string) =>
  data.map((d) => ({
    ...d,
    datetime: new Date(d.datetime),
    [key]: +d[key],
  }));
const MINIMAPHEIGHTRATIO = 10;

const Chart = (props: IChartProps) => {
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  const mainChartRef = useRef(null);
  const minimapRef = useRef(null);
  const indicatorChartRef = useRef(null);
  const width = props.width;
  const height = props.height;

  const draw = () => {
    if (
      props.data &&
      mainChartRef.current &&
      minimapRef.current &&
      indicatorChartRef.current
    ) {
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

      const svg = d3
        .select(".chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      let data = props["data"];

      const transformedData = transformData(data, 'close');

      const x = d3.scalePoint().range([0, width]).padding(0.5);
      const y = d3
        .scaleLinear()
        .rangeRound([height - marginBottom - marginTop, marginTop]);
      const yRsi = d3
        .scaleLinear()
        .rangeRound([height - marginBottom - marginTop, marginTop]);

      x.domain(data.map((d) => d.datetime.toString()));
      y.domain([
        d3.min(transformedData, (d) => d.close),
        d3.max(transformedData, (d) => d.close),
      ] as [number, number]);
      yRsi.domain([0, 100]); // RSI typically ranges from 0 to 100

      createMainChart(
        svg,
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

      createIndicatorChart(
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
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    data: HistoricalData[],
    innerWidth: number,
    innerHeight: number,
    marginLeft: number,
    marginTop: number,
    marginRight: number,
    marginBottom: number,
    x: d3.ScalePoint<string>,
    y: d3.ScaleLinear<number, number, never>
  ) => {
    const g = svg
      .append("g")
      .attr("transform", `translate(${marginLeft},${marginTop})`);

    // You can't directly draw a line using scalePoint, so you need to connect points with line segments
    data.forEach((point, i) => {
      if (i < data.length) {
        const x1 = x(point.datetime.toString());

        if (
          x1 !== undefined &&
          ["06:30", "13:00"].includes(
            d3.timeFormat("%H:%M")(new Date(point.datetime))
          )
        ) {
          g.append("line")
            .attr("x1", x1)
            .attr("x2", x1)
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "blue")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", 2.2);
        }
      }
    });

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

    // You can't directly draw a line using scalePoint, so you need to connect points with line segments
    data.forEach((point, i) => {
      if (i < data.length - 1) {
        const nextPoint = data[i + 1];
        const x1 = x(point.datetime.toString());
        const x2 = x(nextPoint.datetime.toString());
        const y1 = y(point.close);
        const y2 = y(nextPoint.close);

        if (
          x1 !== undefined &&
          x2 !== undefined &&
          y1 !== undefined &&
          y2 !== undefined
        ) {
          g.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5);
        }
      }
    });

    // RSI line
    // g.append('path')
    //     .datum(data)
    //     .attr('fill', 'none')
    //     .attr('stroke', 'orange')
    //     .attr('stroke-linejoin', 'round')
    //     .attr('stroke-linecap', 'round')
    //     .attr('stroke-width', 1.5)
    //     .attr('d', d3.line<historicalData>()
    //         .x(d => x(new Date(d.datetime)))
    //         .y(d => yRsi(d.rsi))
    //     );

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
    mainX: d3.ScalePoint<string>,
    mainY: d3.ScaleLinear<number, number, never>
  ) => {
    const x = mainX
      .domain(data.map((d) => d.datetime.toString()))
      .range([0, width])
      .padding(0.5);

    const transformedData = transformData(data, 'close');

    const y = mainY
      .copy()
      .domain([
        d3.min(transformedData, (d) => d.close),
        d3.max(transformedData, (d) => d.close),
      ] as [number, number])
      .rangeRound([height / MINIMAPHEIGHTRATIO, 0]);

    const g = svg.append("g").attr("transform", `translate(${marginLeft},0)`);

    // You can't directly draw a line using scalePoint, so you need to connect points with line segments
    data.forEach((point, i) => {
      if (i < data.length - 1) {
        const nextPoint = data[i + 1];
        const x1 = x(point.datetime.toString());
        const x2 = x(nextPoint.datetime.toString());
        const y1 = y(point.close);
        const y2 = y(nextPoint.close);

        if (
          x1 !== undefined &&
          x2 !== undefined &&
          y1 !== undefined &&
          y2 !== undefined
        ) {
          g.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5);
        }
      }
    });

    // Brush for selecting the region
    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [width, height / MINIMAPHEIGHTRATIO],
      ])
      .on("brush end", brushed);

    g.append("g").attr("class", "brush").call(brush);

    function brushed(event: d3.D3BrushEvent<unknown>) {
      const selection = event.selection as [number, number];
      if (selection) {
        const [x0, x1] = selection.map((r) => invertPointScale(x, r));
        if (x0 && x1) {
          if (mainChartRef.current) {
            const mainSvg = d3.select<SVGSVGElement, unknown>(
              mainChartRef.current
            );
            mainSvg.selectAll("*").remove();
            d3.select(indicatorChartRef.current).selectAll("*").remove();

            const filteredData = data.filter(
              (d) =>
                new Date(d.datetime) >= new Date(x.domain()[x0]) &&
                new Date(d.datetime) <= new Date(x.domain()[x1])
            );
            const newX = x
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
              mainSvg,
              filteredData,
              innerWidth,
              innerHeight,
              marginLeft,
              marginTop,
              marginRight,
              marginBottom,
              newX,
              newY
            );

            const temp = ["rsi"];
            temp.forEach((indicatorType) =>
              createIndicatorChart(
                indicatorType,
                filteredData,
                innerWidth,
                innerHeight,
                marginLeft,
                marginTop,
                marginRight,
                marginBottom,
                newX,
                y
              )
            );
          }
        }
      }
    }

    function invertPointScale(
      scale: d3.ScalePoint<string>,
      rangeValue: number
    ): number {
      const domain = scale.domain();
      const range = scale.range();
      const rangePoints = d3.range(range[0], range[1], x.step());
      const index = d3.bisect(rangePoints, rangeValue);
      return Math.max(0, Math.min(index, domain.length - 1));
    }
  };

  const createIndicatorChart = (
    indicatorType: string,
    data: HistoricalData[],
    innerWidth: number,
    innerHeight: number,
    marginLeft: number,
    marginTop: number,
    marginRight: number,
    marginBottom: number,
    x: d3.ScalePoint<string>,
    y: d3.ScaleLinear<number, number, never>
  ) => {
    const svg = d3
      .select(".indicatorChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height / MINIMAPHEIGHTRATIO + marginTop + marginBottom);

    const g = svg.append("g").attr("transform", `translate(${marginLeft}, ${marginTop/MINIMAPHEIGHTRATIO})`);

    const timeFormat = d3.timeFormat("%Y-%m-%d %H:%M");

    const rsiData = IndicatorChart(data, indicatorType);
    // console.log('rsiData: ', rsiData)

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${height / MINIMAPHEIGHTRATIO})`)
      // .call(
        // d3
          // .axisBottom(x)
          // .tickValues(x.domain().filter((_, i) => i % 20 === 0))
          // .tickFormat((d, i) => timeFormat(new Date(d)))
      // )
      // .selectAll("text")
      // .attr("y", 0)
      // .attr("x", -50)
      // .attr("transform", "rotate(-90)");

    const transformedData = transformData(rsiData, indicatorType);

    const newX = x
    .copy()
    .domain(transformedData.map((d) => d.datetime.toString()));

    const newY = y
      .copy()
      .domain([0, 100])
      // .domain([
      //   d3.min(transformedData, (d) => +d[indicatorType]),
      //   d3.max(transformedData, (d) => +d[indicatorType]),
      // ] as [number, number])
      .rangeRound([height / MINIMAPHEIGHTRATIO, 0]);
    // Y-axis
    g.append("g")
      .call(d3.axisLeft(newY))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", 0-(height/MINIMAPHEIGHTRATIO/2))
      .style('text-anchor', 'middle')
      // .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("RSI");

    // Define the arrow markers for buy and sell signals
    // svg
    //   .append("defs")
    //   .selectAll("marker")
    //   .data(["buy", "sell"])
    //   .enter()
    //   .append("marker")
    //   .attr("id", (d) => d)
    //   .attr("viewBox", "0 -5 10 10")
    //   .attr("refX", 10)
    //   .attr("refY", 0)
    //   .attr("markerWidth", 6)
    //   .attr("markerHeight", 6)
    //   .attr("orient", "auto")
    //   .append("path")
    //   .attr("fill", (d) => (d === "buy" ? "green" : "red"))
    //   .attr("d", (d) => (d === "buy" ? "M0,-5L10,0L0,5" : "M10,-5L0,0L10,5"));

    // You can't directly draw a line using scalePoint, so you need to connect points with line segments
    transformedData.forEach((point, i) => {
      // console.log('rsi: ', point.rsi)
      if (i < transformedData.length - 1) {
        const nextPoint = transformedData[i + 1];
        const x1 = newX(point.datetime.toString());
        const x2 = newX(nextPoint.datetime.toString());
        const y1 = newY(+point[indicatorType]);
        const y2 = newY(+nextPoint[indicatorType]);
        console.log('x1: ', x1)
        console.log('x2: ', x2)
        console.log('y1: ', y1)
        console.log('y2: ', y2)

        if (
          x1 !== undefined &&
          x2 !== undefined &&
          y1 !== undefined &&
          y2 !== undefined
        ) {
          g.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5);
        }
      }
    });
  };

  return (
    <>
      <svg className="chart" width={width} height={height} ref={mainChartRef} />
      <svg
        width={width}
        height={height / MINIMAPHEIGHTRATIO}
        ref={minimapRef}
      />
      <div
        className="indicatorChart"
        // width={width}
        // height={height / MINIMAPHEIGHTRATIO}
        ref={indicatorChartRef}
      />
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
  data: HistoricalData[];
}

// export interface DataPoint {
//   datetime: string;
//   close: number;
// }

export default Chart;
