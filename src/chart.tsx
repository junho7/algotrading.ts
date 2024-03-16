import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { historicalData } from "./types";

const Chart = (props: IChartProps) => {
  const [mainChartData, setMainChartData] = useState<historicalData[]>([]);

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [props, mainChartData]);
  }, [props]);

  const mainChartRef = useRef(null);
  const minimapRef = useRef(null);
  const width = props.width;
  const height = props.height;

  const draw = () => {
    if (props.data && mainChartRef.current && minimapRef.current) {
      d3.select(mainChartRef.current).selectAll("*").remove();

      const miniSvg = d3.select(minimapRef.current);
      miniSvg.selectAll("*").remove();

      const innerWidth = width - props.left - props.right;
      const innerHeight = height - props.top - props.bottom;
      const marginLeft = props.left;
      const marginTop = props.top;
      const marginRight = props.right;
      const marginBottom = props.bottom;

      const miniWidth = width - props.left - props.right;
      const miniInnerHeight = height - props.top - props.bottom;
      const miniMarginLeft = props.left;
      const miniMarginTop = props.top;
      const miniMarginRight = props.right;
      const miniMarginBottom = props.bottom;

      // const svg = d3.select(d3Container.current);
      const svg = d3
        .select(".chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
      // .append('g')
      // .attr('transform', `translate(${innerWidth / 2} ${innerHeight / 2})`);

      // Set up your SVG and D3 scales, axes, etc.
      // const margin = { top: 20, right: 20, bottom: 30, left: 50 };
      // const width = +svg.attr('width') - margin.left - margin.right;
      // const height = +svg.attr('height') - margin.top - margin.bottom;

      let data = props["data"];
      const length = data.length;
      // let data = props['data'].slice(0, 3);

      const transformedData = data.map((d) => ({
        datetime: new Date(d.datetime),
        close: +d.close,
      }));

      // const x = d3.scaleTime().rangeRound([marginLeft, width - marginLeft - marginRight]);
      // const x = d3.scaleOrdinal().range([marginLeft, width - marginLeft - marginRight]);
      // const x = d3.scaleOrdinal().range(data.map((_, i) => (width/length)*i));
      const x = d3.scalePoint().range([0, width]).padding(0.5);
      const y = d3
        .scaleLinear()
        .rangeRound([height - marginBottom - marginTop, marginTop]);
      const yRsi = d3
        .scaleLinear()
        .rangeRound([height - marginBottom - marginTop, marginTop]);

      x.domain(data.map((d) => d.datetime.toString()));
      // x.domain((d3.extent(transformedData, d => d.datetime)) as [Date, Date]);
      // x.domain([0, length]);
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
        y,
        svg
      );
    }
  };

  const createMainChart = (
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    data: historicalData[],
    innerWidth: number,
    innerHeight: number,
    marginLeft: number,
    marginTop: number,
    marginRight: number,
    marginBottom: number,
    x: d3.ScalePoint<string>,
    y: d3.ScaleLinear<number, number, never>
  ) => {
    console.log("createMainChart");
    const g = svg
      .append("g")
      // .attr("transform", `translate(${props.left},${props.top})`);
      .attr("transform", `translate(${marginLeft},${marginTop})`);
    // const timeRange = x.domain();

    //     const marketOpenStart = 6.5; // Market opens at 06:30
    // const marketCloseEnd = 13; // Market closes at 13:00

    // const isInMarketHours = (datetime: Date) => {
    //   const hours = datetime.getHours() + datetime.getMinutes() / 60;
    //   return hours >= marketOpenStart && hours <= marketCloseEnd;
    // };

    // const filteredData = data.filter(d => isInMarketHours(new Date(d.datetime)));

    // Generate tick values for every hour within the market hours across the date range
    // const tickValues = [];
    // let currentDate = new Date(timeRange[0]);
    // while (currentDate <= timeRange[1]) {
    //   for (let hour = marketOpenStart; hour <= marketCloseEnd; hour++) {
    //     const tickDate = new Date(currentDate);
    //     tickDate.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
    //     tickValues.push(tickDate);
    //   }
    //   currentDate.setDate(currentDate.getDate() + 1);
    // }

    // console.log("data: ", data);
    // let signalData = plotData['signals'];

    // const xLabel = d3.scaleTime().rangeRound([marginLeft, width - marginLeft - marginRight]).domain();
    // let currentTime = new Date(timeRange[0]);
    // let currentTime = new Date(xLabel[0]);
    // while (currentTime <= new Date(timeRange[1])){
    //   if(currentTime !== undefined && x(currentTime.toString()) !== undefined && ['06:30', '13:00'].includes(d3.timeFormat("%H:%M")(currentTime))){
    //   g.append('line')
    //     .attr('x1', x(currentTime))
    //     .attr('x2', x(currentTime))
    //     .attr('y1', 0)
    //     .attr('y2', height)
    //     .attr('stroke', 'blue')
    //     .attr('stroke-width', 1)
    //     .attr('stroke-dasharray', '2.2');
    //   } else {
    //   // g.append('line')
    //   //   .attr('x1', x(currentTime))
    //   //   .attr('x2', x(currentTime))
    //   //   .attr('y1', 0)
    //   //   .attr('y2', height)
    //   //   .attr('stroke', 'grey')
    //   //   .attr('stroke-width', 0.5)
    //   //   .attr('stroke-dasharray', '2.2');
    //   }
    //   currentTime = new Date(currentTime.getTime() + 60*1000);
    // }

    // You can't directly draw a line using scalePoint, so you need to connect points with line segments
    data.forEach((point, i) => {
      if (i < data.length) {
        // const nextPoint = data[i + 1];
        // console.log("point.datetime: ", point.datetime);
        // console.log(
        //   "point.datetime: ",
        //   d3.timeFormat("%H:%M")(new Date(point.datetime))
        // );
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

    // const transformedData = data.map((d) => ({
    //   datetime: new Date(d.datetime),
    //   close: +d.close,
    // }));

    // x.domain(data.map((d) => d.datetime.toString()));    
    // y.domain([
    //   d3.min(transformedData, (d) => d.close),
    //   d3.max(transformedData, (d) => d.close),
    // ] as [number, number]);

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(x.domain().filter((_, i) => i % 20 === 0))
          .tickFormat((d, i) => timeFormat(new Date(d)))
      )
      // .call(d3.axisBottom(x).tickFormat(timeFormat as (value: Date | { valueOf(): number; }, i: number) => string))
      // .call(d3.axisBottom(x).tickFormat(timeFormat as (value: Date | { valueOf(): number; }, i: number) => string))
      // .call(d3.axisBottom(x).tickValues(tickValues).tickFormat(timeFormat as (value: Date | { valueOf(): number; }, i: number) => string))
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

    // Close price line
    // g.append('path')
    //     .datum(data)
    //     .attr('fill', 'none')
    //     .attr('stroke', 'steelblue')
    //     .attr('stroke-linejoin', 'round')
    //     .attr('stroke-linecap', 'round')
    //     .attr('stroke-width', 1.5)
    //     .attr('d', d3.line<historicalData>()
    //         .x(d => {
    //           // console.log('datetime: ', d.datetime)
    //           // console.log('datetime: ', new Date(d.datetime))
    //           const value = x(new Date(d.datetime));
    //           if (isNaN(value)) {
    //             console.error('Invalid x value for date:', d.datetime);
    //           }
    //           return value;
    //         })
    //         .y(d => y(+d.close))
    //         // .x(d => x(new Date(d.datetime)))
    //         // .y(d => y(d.close))
    //     );

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
    data: historicalData[],
    innerWidth: number,
    innerHeight: number,
    marginLeft: number,
    marginTop: number,
    marginRight: number,
    marginBottom: number,
    mainX: d3.ScalePoint<string>,
    mainY: d3.ScaleLinear<number, number, never>,
    mainSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) => {
    // const miniSvg = d3.select(minimapRef.current);
    // miniSvg.selectAll("*").remove();
    const x = mainX.domain(data.map(d=>d.datetime.toString())).range([0, width]).padding(0.5);
    const y = d3
      .scaleLinear()
      .domain(mainY.domain())
      .rangeRound([height / 4 - marginBottom - marginTop, marginTop]);

    // const g = svg.append('g').attr('transform', `translate(${marginLeft},${marginTop})`);
    const g = svg.append("g");

    // No need for detailed axis in minimap
    // g.append('g')
    //     .attr('transform', `translate(0,${height})`)
    //     .call(d3.axisBottom(x).tickValues([]));

    // Line generator
    // const line = d3.line<DataPoint>()
    //     .x(d => x(d.datetime))
    //     .y(d => y(d.close));

    // // Draw line
    // g.append('path')
    //     .datum(data)
    //     .attr('fill', 'none')
    //     .attr('stroke', 'steelblue')
    //     .attr('stroke-width', 1)
    //     .attr('d', line);

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
        [width, height / 4],
      ])
      .on("brush end", brushed);

    g.append("g").attr("class", "brush").call(brush);

    function brushed(event: d3.D3BrushEvent<unknown>) {
      const selection = event.selection as [number, number];
      if (selection) {
        console.log('brushed selection: ', selection)
        const [x0, x1] = selection.map((r) => invertPointScale(x, r));
        console.log('brushed selection x0, x1: ', x0, x1)
        console.log('brushed selection x0: ', x.domain()[x0])
        console.log('brushed selection x1: ', x.domain()[x1])
        if (x0 && x1) {
          console.log('x.domain()', x.domain())
          // const newDomain = x0 && x1 ? [x0, x1] : x.domain();
          // const newDomain = x.domain([x0, x1]);
          // x.domain(newDomain);
          // x.domain([x0, x1]);
          if (mainChartRef.current) {
            const mainSvg = d3.select<SVGSVGElement, unknown>(
              mainChartRef.current
              );            
              mainSvg.selectAll("*").remove();
              console.log('x.domain(0)', x.domain()[x0])
              console.log('x.domain(1)', x.domain()[x1])
              console.log('data[0].datetime', data[600].datetime)
              console.log('new Date(x.domain()[x0])', new Date(x.domain()[x0]))
              console.log('x.domain(1)', new Date(data[600].datetime) >= new Date(x.domain()[x0]))

              
              
              const filteredData = data.filter(
                (d) => new Date(d.datetime) >= new Date(x.domain()[x0]) && new Date(d.datetime) <= new Date(x.domain()[x1])
                );
              const newX = x.copy().domain(filteredData.map(d => d.datetime.toString()));

              const transformedData = data.map((d) => ({
                datetime: new Date(d.datetime),
                close: +d.close,
              }));
          
              // x.domain(data.map((d) => d.datetime.toString()));    
              const newY = y.copy().domain([
                d3.min(transformedData, (d) => d.close),
                d3.max(transformedData, (d) => d.close),
              ] as [number, number]).rangeRound([height - marginBottom - marginTop, marginTop]);;


            console.log('tempData: ', filteredData)
            setMainChartData(filteredData);
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
          }
        }
      }
    }

    function invertPointScale(
      scale: d3.ScalePoint<string>,
      rangeValue: number
    // ): string | undefined {
    ): number {
      // console.log('scale: ', scale)
      // console.log('rangeValue: ', rangeValue)
      const domain = scale.domain();
      // console.log('domain: ', domain)
      const range = scale.range();
      // console.log('range: ', range) // [0, 800]
      const rangePoints = d3.range(range[0], range[1], x.step())
      console.log('index: ', rangePoints)
      // const index = d3.bisect(range, rangeValue);
      const index = d3.bisect(rangePoints, rangeValue);
      console.log('index: ', index)
      console.log('domain value: ', domain[Math.max(0, Math.min(index, domain.length - 1))])
      // return domain[Math.max(0, Math.min(index, domain.length - 1))];
      return Math.max(0, Math.min(index, domain.length - 1));
    }
  };

  return (
    <>
      <svg className="chart" width={width} height={height} ref={mainChartRef} />
      <svg ref={minimapRef} width={width} height={height / 4} />
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
  data: historicalData[];
}

export interface DataPoint {
  datetime: string;
  close: number;
}

export default Chart;
