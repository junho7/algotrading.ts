// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { formReducer, chartDataReducer } from "./reducer";

export const store = configureStore({
  reducer: {
    form: formReducer,
    chart: chartDataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
