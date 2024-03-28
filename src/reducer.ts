// reducer.ts
import * as actionTypes from "./actionTypes";
import { HistoricalData, UserFormData } from "./types";

interface FormState {
  input: UserFormData;
}
interface ChartDataState {
  data: HistoricalData[];
  selection: [number, number];
}

const today_date: Date = new Date();
const today_date_formatted =
  today_date.getFullYear() +
  "-" +
  ("0" + (today_date.getMonth() + 1)).slice(-2) +
  "-" +
  ("0" + today_date.getDate()).slice(-2);

const initialFormState: FormState = {
  input: {
    ticker: "SPY",
    endDate: today_date_formatted,
    duration: 1,
    timeAggregation: "MINUTES_ONE",
  },
};

const initialChartState: ChartDataState = {
  data: [
    {
      datetime: (new Date()).toString(),
      tzname: "",
      ticker: "SPY",
      open: 0,
      high: 0,
      low: 0,
      close: 0,
      diff: 0,
      volume: 0,
      wap: 0,
      count: 0,
      signal: "",
      rsi: 0,
      macd: {
        macdLine: 0,
        signalLine: 0,
        histogram: 0
      }
    },
  ],
  selection: [-1, -1]
};

export function formReducer(state: FormState = initialFormState, action: any): FormState {
  switch (action.type) {
    case actionTypes.UPDATE_INPUT:
      return {
        ...state,
        input: {
          ...state.input,
          ...action.payload,
        }
        
      };
    default:
      return state;
  }
}

export function chartDataReducer(
  state = initialChartState,
  action: any
): ChartDataState {
  switch (action.type) {
    case actionTypes.UPDATE_CHARTDATA:
      return {
        ...state,
        data: action.payload,
      };
    case actionTypes.UPDATE_MINIMAPSELECTION:
      return {
        ...state,
        selection: action.payload,
      };
    default:
      return state;
  }
}
