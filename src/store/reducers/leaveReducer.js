// src/redux/reducers/leaveReducer.js

import {
  APPLY_LEAVE_REQUEST,
  APPLY_LEAVE_SUCCESS,
  APPLY_LEAVE_FAIL,
  FETCH_LEAVES_REQUEST,
  FETCH_LEAVES_SUCCESS,
  FETCH_LEAVES_FAIL,
} from "../actions/types";

const initialState = {
  loading: false,
  leaveData: null,
  leaves: [],
  fetchingLeaves: false,
  error: null,
};

const leaveReducer = (state = initialState, action) => {
  switch (action.type) {
    case APPLY_LEAVE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case APPLY_LEAVE_SUCCESS:
      return {
        ...state,
        loading: false,
        leaveData: action.payload,
      };

    case APPLY_LEAVE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case FETCH_LEAVES_REQUEST:
      return {
        ...state,
        fetchingLeaves: true,
        error: null,
      };

    case FETCH_LEAVES_SUCCESS:
      return {
        ...state,
        fetchingLeaves: false,
        leaves: action.payload,
      };

    case FETCH_LEAVES_FAIL:
      return {
        ...state,
        fetchingLeaves: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default leaveReducer;