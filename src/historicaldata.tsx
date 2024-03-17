import React, { useState } from "react";
import { loadData, backtest } from "./ApiService";
import { historicalData, FormData } from "./types";
import Chart from "./chart";

const HistoricalData: React.FC = () => {
  const today_date: Date = new Date();
  const today_date_formatted =
    today_date.getFullYear() +
    "-" +
    ("0" + (today_date.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + today_date.getDate()).slice(-2);

  const [formData, setFormData] = useState<FormData>({
    ticker: "AAPL",
    endDate: today_date_formatted,
    duration: "1 D",
    timeAggregation: "MINUTES_ONE",
  });
  const [historicalData, setHistoricalData] = useState<historicalData[]>([
    {
      datetime: new Date(),
      tzname: "",
      ticker: "",
      open: 0,
      high: 0,
      low: 0,
      close: 0,
      diff: 0,
      volume: 0,
      wap: 0,
      count: 0,
      signal: "",
    },
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log("value: ", value);
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data submitted:", formData);
    const result = await loadData(formData);
    console.log("result: ", result);
    if (result === "SUCCESS") {
      console.log("SUCCESS");
    } else {
      console.log("failed");
    }
  };

  const handleBacktest = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await backtest(formData);
    setHistoricalData(result);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          Ticker:
          <input
            type="text"
            name="ticker"
            value={formData.ticker.toUpperCase()}
            onChange={handleChange}
          />
        </label>
        <label>
          To Date:
          <input
            type="date"
            name="toDate"
            value={formData.endDate}
            onChange={handleChange}
          />
        </label>
        <label>
          Duration(Day):
          <input
            name="duration"
            value={formData.duration}
            type="number"
            min="1"
            step="1"
            onChange={handleChange}
          />
        </label>
        <label>
          Time Aggregation:
          <select
            name="timeAggregation"
            value={formData.timeAggregation}
            onChange={handleChange}
          >
            <option value="SECONDS_THIRTY">30 Secs</option>
            <option value="MINUTES_ONE">1 Minute</option>
            <option value="HOURS_ONE">1 Hour</option>
            <option value="DAYS_ONE">1 Day</option>
            <option value="WEEKS_ONE">1 Week</option>
            <option value="MONTHS_ONE">1 Month</option>
          </select>
        </label>
        <button type="submit">Load Data</button>
        <button onClick={handleBacktest}>backtest</button>
      </form>
      <Chart
        data={historicalData}
        left={50}
        top={50}
        right={50}
        bottom={100}
        width={800}
        height={800}
      />
    </>
  );
};

export default HistoricalData;
