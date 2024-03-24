import React from "react";
import { saveData } from "./ApiService";
import { UserFormData } from "./types";
import { useToast } from "./ToastContext";
import { useSelector, useDispatch } from "react-redux";
import { updateInput } from "./actions";
import { RootState } from "./store";

const SaveHistoricalData: React.FC = () => {
  const formData = useSelector((state: RootState) => state.form?.input);
  console.log("formData: ", formData);
  const dispatch = useDispatch();

  const { showToast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log("value: ", value);
    if (name === "toDate") {
      value.toString();
    }
    const updatedFormData: UserFormData = { ...formData, [name]: value };
    dispatch(updateInput(updatedFormData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await saveData(formData);
    if (result === "SUCCESS") {
      showToast("Success!");
    } else {
      showToast("Failed!");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          Ticker:
          <input
            type="text"
            name="ticker"
            value={formData?.ticker?.toUpperCase() || ""}
            onChange={handleChange}
          />
        </label>
        <label>
          To Date:
          <input
            type="date"
            name="toDate"
            value={formData?.endDate || ""}
            onChange={handleChange}
          />
        </label>
        <label>
          Duration(Day):
          <input
            name="duration"
            value={formData?.duration || ""}
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
            value={formData?.timeAggregation || ""}
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
        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default SaveHistoricalData;
