// src/redux/actions/leaveActions.js

import apiService from "../../services/apiService";
import {
  APPLY_LEAVE_REQUEST,
  APPLY_LEAVE_SUCCESS,
  APPLY_LEAVE_FAIL,
  FETCH_LEAVES_REQUEST,
  FETCH_LEAVES_SUCCESS,
  FETCH_LEAVES_FAIL,
} from "./types";

export const applyLeave = payload => async dispatch => {
  try {
    console.log('📝 Applying leave...', payload);

    dispatch({ type: APPLY_LEAVE_REQUEST });

    const response = await apiService.post('/leave', payload);

    console.log('📡 Response status:', response.status);

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(response.data?.message || 'Failed to apply leave');
    }

    const leaveData = response.data?.data || response.data;

    console.log('✅ Leave applied successfully:', leaveData);

    dispatch({
      type: APPLY_LEAVE_SUCCESS,
      payload: leaveData,
    });

    return {
      success: true,
      data: leaveData,
    };
  } catch (error) {
    console.log('❌ Apply leave error:', error.message);

    dispatch({
      type: APPLY_LEAVE_FAIL,
      payload: error.response?.data?.message || error.message || 'Failed to apply leave',
    });

    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const fetchLeaves = () => async dispatch => {
  try {
    console.log('📝 Fetching leaves...');
    
    dispatch({ type: FETCH_LEAVES_REQUEST });

    const response = await apiService.get('/leave');

    console.log('📡 Response status:', response.status);
    console.log('📡 Response data:', response.data);

    // Check for successful status (200, 201, etc.)
    if (response.status >= 200 && response.status < 300) {
      // Success case
      let leavesData = [];
      
      // Handle different response structures
      if (response.data?.data && Array.isArray(response.data.data)) {
        leavesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        leavesData = response.data;
      } else if (response.data?.success === true && response.data?.data) {
        leavesData = response.data.data;
      }

      console.log("✅ Fetched leaves data:", leavesData.length, "leaves");

      dispatch({
        type: FETCH_LEAVES_SUCCESS,
        payload: leavesData,
      });

      return { 
        success: true, 
        data: leavesData 
      };
    } else {
      // Non-success status
      throw new Error(response.data?.message || 'Failed to fetch leaves');
    }
    
  } catch (error) {
    console.log('❌ Fetch leaves error:', error.message);
    
    dispatch({
      type: FETCH_LEAVES_FAIL,
      payload: error.response?.data?.message || error.message || 'Failed to fetch leaves',
    });
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};