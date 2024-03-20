// reducer.ts
import * as actionTypes from './actionTypes';
import { UserFormData } from './types'

interface FormState {
  input: UserFormData;
}

const today_date: Date = new Date();
const today_date_formatted =
  today_date.getFullYear() +
  "-" +
  ("0" + (today_date.getMonth() + 1)).slice(-2) +
  "-" +
  ("0" + today_date.getDate()).slice(-2);

const initialState: FormState = {
  input: {
    ticker: 'SPY',
    endDate: today_date_formatted,
    duration: '1 D',
    timeAggregation: 'MINUTES_ONE'
  },
};

function formReducer(state = initialState, action: any): FormState {
  switch (action.type) {
    case actionTypes.UPDATE_INPUT:
      return {
        ...state,
        input: action.payload,
      };
    default:
      return state;
  }
}

export default formReducer;
