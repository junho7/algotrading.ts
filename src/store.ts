// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { formReducer, chartDataReducer } from "./reducer";

export const store = configureStore({
  reducer: {
    form: formReducer,
    chart: chartDataReducer,
  },
});

// export const chartDataStore = configureStore({
//   reducer: {
//   },
// });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// export type ChartDataState = ReturnType<typeof chartDataStore.getState>;
// export type ChartDispatch = typeof chartDataStore.dispatch;

// export default store;
