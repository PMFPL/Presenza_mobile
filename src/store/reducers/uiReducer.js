// Action Types
export const UI_SET_ALERT = 'UI_SET_ALERT';
export const UI_HIDE_ALERT = 'UI_HIDE_ALERT';
export const UI_SET_LOADING = 'UI_SET_LOADING';

const initialState = {
  alert: {
    visible: false,
    message: '',
    type: 'success',
  },
  loading: false,
};

const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case UI_SET_ALERT:
      return {
        ...state,
        alert: {
          visible: true,
          message: action.payload.message,
          type: action.payload.type,
        },
      };
      
    case UI_HIDE_ALERT:
      return {
        ...state,
        alert: {
          ...state.alert,
          visible: false,
        },
      };
      
    case UI_SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
      
    default:
      return state;
  }
};

export default uiReducer;