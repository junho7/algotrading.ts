import React from "react";
import { backtest } from "./ApiService";
import { UserFormData } from "./types";
import Chart from "./chart";
import { useToast } from "./ToastContext";
import { useSelector, useDispatch } from "react-redux";
import { updateChartData, updateInput } from "./actions";
import { RootState } from "./store";

const Backtest: React.FC = () => {
  const formData = useSelector((state: RootState) => state.form?.input);  
  const dispatch = useDispatch();

  const { showToast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if(name === 'toDate'){
      value.toString();
    }
    const updatedFormData: UserFormData = { ...formData, [name]: value };
    dispatch(updateInput(updatedFormData));
  };

  const handleBacktest = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await backtest(formData);
    dispatch(updateChartData([...result]));
    showToast("Success!");
  };

  return (
    <>
      <form onSubmit={handleBacktest}>
        <label>
          Ticker:
          <input
            type="text"
            name="ticker"
            value={formData?.ticker?.toUpperCase() || ''}
            onChange={handleChange}
          />
        </label>
        <label>
          To Date:
          <input
            type="date"
            name="toDate"
            value={formData?.endDate || ''}
            onChange={handleChange}
          />
        </label>
        <label>
          Duration(Day):
          <input
            name="duration"
            value={formData?.duration || ''}
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
            value={formData?.timeAggregation || ''}
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
        <button type="submit">backtest</button>
      </form>
      <Chart
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

export default Backtest;
