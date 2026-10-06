import * as types from '../actions/types';

const initialState = {
  loading: false,
  profile: [],
  error: null,
};

export const employeeProfileReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.EMPLOYEE_PROFILE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.EMPLOYEE_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        profile: action.payload,
      };

    case types.EMPLOYEE_PROFILE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};