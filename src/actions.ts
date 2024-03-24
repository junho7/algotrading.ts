// actions.ts
import * as actionTypes from './actionTypes';
import { UserFormData, HistoricalData } from "./types";

export function updateInput(input: UserFormData) {
  return { type: actionTypes.UPDATE_INPUT, payload: input };
}

export function updateChartData(data: HistoricalData[]) {
  return { type: actionTypes.UPDATE_CHARTDATA, payload: data };
}

export function updateMinimapSelection(selection: [number, number]) {
  return { type: actionTypes.UPDATE_MINIMAPSELECTION, payload: selection };
}
