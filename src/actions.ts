// actions.ts
import * as actionTypes from './actionTypes';
import { UserFormData } from "./types";

export function updateInput(input: UserFormData) {
  return { type: actionTypes.UPDATE_INPUT, payload: input };
}
