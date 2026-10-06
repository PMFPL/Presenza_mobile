import {
  checkAndRequestLocationPermission,
  getCurrentLocation,
} from '../../utils/utils';
import { getAddressFromCoords } from '../../utils/utils';
import { launchCamera } from 'react-native-image-picker';
import { requestCameraPermission } from '../../utils/utils';
import apiService from '../../services/apiService';
import * as types from './types';
import { logout, setAlert } from './authActions';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import ImageResizer from 'react-native-image-resizer';
import { showToast } from '../../components/common/ToastProvider';

// ==================== HELPER FUNCTIONS ====================

const compressImage = async uri => {
  try {
    console.log('🖼️ Compressing image...');
    const response = await ImageResizer.createResizedImage(
      uri,
      1024,
      1024,
      'JPEG',
      70,
      0,
      undefined,
      false,
      { mode: 'contain', onlyScaleDown: true },
    );
    console.log('✅ Image compressed:', response.uri);
    return response;
  } catch (error) {
    console.log('❌ Image compression failed, using original:', error);
    return { uri };
  }
};

const checkNetworkWithRetry = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) throw new Error('NO_INTERNET');

      if (netInfo.isInternetReachable === false) {
        if (Platform.OS === 'android') {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            await fetch('https://www.google.com', {
              method: 'HEAD',
              signal: controller.signal,
              mode: 'no-cors',
            });
            clearTimeout(timeoutId);
            return true;
          } catch {
            if (i === retries - 1) throw new Error('NO_INTERNET_REACHABLE');
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
        } else {
          if (i === retries - 1) throw new Error('NO_INTERNET_REACHABLE');
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
      }
      return true;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
};

const getLocationWithTimeout = async (timeout = 15000) => {
  const location = await Promise.race([
    getCurrentLocation(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('LOCATION_TIMEOUT')), timeout),
    ),
  ]);
  return location;
};

const openCameraWithTimeout = async (options, timeout = 30000) => {
  return Promise.race([
    launchCamera(options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('CAMERA_TIMEOUT')), timeout),
    ),
  ]);
};

// ==================== PUNCH IN ====================
export const punchIn = () => async dispatch => {
  try {
    console.log('📝 PUNCH IN: Starting...');
    dispatch({ type: types.PUNCH_IN_REQUEST });

    await checkNetworkWithRetry();

    const hasLocationPermission = await checkAndRequestLocationPermission();
    if (!hasLocationPermission) {
      showToast('Location permission is required for attendance', 'error');
      dispatch({
        type: types.PUNCH_IN_FAIL,
        payload: 'Location permission denied',
      });
      return { success: false, error: 'LOCATION_PERMISSION_DENIED' };
    }

    const location = await getLocationWithTimeout();
    const { latitude, longitude } = location;

    let address = `${latitude}, ${longitude}`;
    try {
      address = await getAddressFromCoords(latitude, longitude);
    } catch (e) {
      console.log('⚠️ Address fetch failed, using coords');
    }

    const hasCameraPermission = await requestCameraPermission();
    if (!hasCameraPermission) {
      showToast('Camera permission is required', 'error');
      dispatch({
        type: types.PUNCH_IN_FAIL,
        payload: 'Camera permission denied',
      });
      return { success: false, error: 'CAMERA_PERMISSION_DENIED' };
    }

    const cameraResult = await openCameraWithTimeout({
      mediaType: 'photo',
      cameraType: 'front',
      quality: 0.7,
      saveToPhotos: false,
      includeBase64: false,
    });

    // 🔥 FIX: Handle camera cancel - just return without error
    if (cameraResult.didCancel) {
      console.log('📸 Camera cancelled by user');
      dispatch({ type: types.PUNCH_IN_CANCEL }); // Add this action type
      return { success: false, cancelled: true }; // Return cancelled flag
    }

    if (!cameraResult.assets || cameraResult.assets.length === 0) {
      console.log('📸 No image captured');
      dispatch({ type: types.PUNCH_IN_FAIL, payload: 'No image captured' });
      return { success: false, error: 'NO_IMAGE' };
    }

    const photo = cameraResult.assets[0];
    const compressedImage = await compressImage(photo.uri);

    const formData = new FormData();
    formData.append('latitude', String(latitude));
    formData.append('longitude', String(longitude));
    formData.append('address', address);
    formData.append('timestamp', String(Date.now()));
    formData.append(
      'deviceInfo',
      JSON.stringify({
        platform: Platform.OS,
        version: Platform.Version,
      }),
    );

    let fileUri = compressedImage.uri;
    if (Platform.OS === 'android' && !fileUri.startsWith('file://')) {
      fileUri = 'file://' + fileUri;
    }

    formData.append('image', {
      uri: fileUri,
      type: photo.type || 'image/jpeg',
      name: photo.fileName || `selfie_${Date.now()}.jpg`,
    });

    console.log('🌐 POST /attendance/punch-in');
    const response = await apiService.upload('/attendance/punch-in', formData);

    console.log('📡 Response status:', response.status);

    dispatch({
      type: types.PUNCH_IN_SUCCESS,
      payload: response.data?.data || response.data,
    });

    showToast('Attendance marked successfully!', 'success');
    await dispatch(getAttendanceHistory());

    return { success: true, data: response.data?.data };
  } catch (error) {
    console.log('❌ Punch in error:', error.message);

    let errorMessage = 'Something went wrong';
    // let errorType = 'UNKNOWN_ERROR';

    // 🔥 FIX: Don't show toast for camera cancel
    if (error.message === 'CAMERA_CANCELLED') {
      dispatch({ type: types.PUNCH_IN_FAIL, payload: 'Camera cancelled' });
      return { success: false, cancelled: true };
    }

    if (error.response?.status === 409) {
      errorMessage = 'Already punched in today!';
      // errorType = 'ALREADY_PUNCHED_IN';
      showToast(errorMessage, 'info');
    } else if (error.message === 'NO_INTERNET') {
      errorMessage = 'No internet connection';
      // errorType = 'NO_INTERNET';
      showToast(errorMessage, 'error');
    } else if (error.message === 'LOCATION_TIMEOUT') {
      errorMessage = 'Location timeout. Please enable GPS.';
      // errorType = 'LOCATION_TIMEOUT';
      showToast(errorMessage, 'error');
    } else if (error.message === 'CAMERA_TIMEOUT') {
      errorMessage = 'Camera not responding. Please restart app.';
      // errorType = 'CAMERA_TIMEOUT';
      showToast(errorMessage, 'error');
    } else if (!error.response) {
      errorMessage = 'Network error, please try again';
      showToast(errorMessage, 'error');
    } else {
      errorMessage = error.response?.data?.message || 'Punch in failed';
      showToast(errorMessage, 'error');
    }

    dispatch({
      type: types.PUNCH_IN_FAIL,
      payload: errorMessage,
    });

    return { success: false, message: errorMessage };
  }
};

// ==================== PUNCH OUT ====================
export const punchOut = () => async dispatch => {
  let formData = null; // ✅ Initialize outside try-catch for cleanup

  try {
    console.log('📝 PUNCH OUT: Starting...');
    dispatch({ type: types.PUNCH_OUT_REQUEST });

    // ✅ FIX: Wrap network check in try-catch
    try {
      await checkNetworkWithRetry();
    } catch (error) {
      console.log('❌ Network check failed:', error.message);
      dispatch({
        type: types.PUNCH_OUT_FAIL,
        payload: 'No internet connection',
      });
      showToast(
        'No internet connection. Please check your connection.',
        'error',
      );
      return { success: false, error: 'NO_INTERNET' };
    }

    // ✅ FIX: Wrap location in try-catch
    let latitude, longitude, address;
    try {
      const hasLocationPermission = await checkAndRequestLocationPermission();
      if (!hasLocationPermission) {
        console.log('❌ Location permission denied');
        dispatch({
          type: types.PUNCH_OUT_FAIL,
          payload: 'Location permission denied',
        });
        showToast('Location permission is required for punch out', 'error');
        return { success: false, error: 'LOCATION_PERMISSION_DENIED' };
      }

      const location = await getLocationWithTimeout();
      latitude = location.latitude;
      longitude = location.longitude;

      address = `${latitude}, ${longitude}`;
      try {
        const fetchedAddress = await getAddressFromCoords(latitude, longitude);
        address = fetchedAddress;
      } catch (e) {
        console.log('⚠️ Address fetch failed, using coords');
      }
    } catch (error) {
      console.log('❌ Location error:', error.message);
      dispatch({ type: types.PUNCH_OUT_FAIL, payload: error.message });

      // Show specific error message
      if (error.message === 'LOCATION_TIMEOUT') {
        showToast(
          'Location timeout. Please enable GPS and try again.',
          'error',
        );
      } else {
        showToast('Failed to get location. Please try again.', 'error');
      }
      return { success: false, error: error.message };
    }

    // ✅ FIX: Wrap camera in try-catch
    let photo, compressedImage;
    try {
      const hasCameraPermission = await requestCameraPermission();
      if (!hasCameraPermission) {
        console.log('❌ Camera permission denied');
        dispatch({
          type: types.PUNCH_OUT_FAIL,
          payload: 'Camera permission denied',
        });
        showToast('Camera permission is required for punch out', 'error');
        return { success: false, error: 'CAMERA_PERMISSION_DENIED' };
      }

      const cameraResult = await openCameraWithTimeout({
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.7,
        saveToPhotos: false,
        includeBase64: false,
      });

      // ✅ FIX: Handle camera cancel properly
      if (cameraResult.didCancel) {
        console.log('📸 Camera cancelled by user');
        dispatch({ type: types.PUNCH_OUT_CANCEL });
        return { success: false, cancelled: true };
      }

      if (!cameraResult.assets || cameraResult.assets.length === 0) {
        console.log('📸 No image captured');
        dispatch({ type: types.PUNCH_OUT_FAIL, payload: 'No image captured' });
        showToast('No photo captured. Please try again.', 'error');
        return { success: false, error: 'NO_IMAGE' };
      }

      photo = cameraResult.assets[0];

      // ✅ FIX: Wrap image compression in try-catch
      try {
        compressedImage = await compressImage(photo.uri);
      } catch (error) {
        console.log('❌ Image compression failed:', error.message);
        showToast('Failed to process image. Please try again.', 'error');
        dispatch({
          type: types.PUNCH_OUT_FAIL,
          payload: 'Image compression failed',
        });
        return { success: false, error: 'IMAGE_COMPRESSION_FAILED' };
      }
    } catch (error) {
      console.log('❌ Camera error:', error.message);
      dispatch({ type: types.PUNCH_OUT_FAIL, payload: error.message });

      if (error.message === 'CAMERA_TIMEOUT') {
        showToast('Camera not responding. Please restart the app.', 'error');
      } else {
        showToast('Camera error. Please try again.', 'error');
      }
      return { success: false, error: error.message };
    }

    // ✅ FIX: Prepare FormData with error handling
    try {
      formData = new FormData();
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
      formData.append('address', address);
      formData.append('timestamp', String(Date.now()));

      let fileUri = compressedImage.uri;
      if (Platform.OS === 'android' && !fileUri.startsWith('file://')) {
        fileUri = 'file://' + fileUri;
      }

      formData.append('image', {
        uri: fileUri,
        type: photo.type || 'image/jpeg',
        name: photo.fileName || `selfie_${Date.now()}.jpg`,
      });
    } catch (error) {
      console.log('❌ FormData preparation failed:', error.message);
      dispatch({
        type: types.PUNCH_OUT_FAIL,
        payload: 'Failed to prepare data',
      });
      showToast('Failed to prepare punch out data. Please try again.', 'error');
      return { success: false, error: 'FORMDATA_ERROR' };
    }

    // ✅ FIX: API call with comprehensive error handling
    console.log('🌐 POST /attendance/punch-out');
    const response = await apiService.upload('/attendance/punch-out', formData);

    console.log('📡 Response status:', response.status);

    // ✅ FIX: Handle all response statuses properly
    if (response.status === 400) {
      const msg = response.data?.message || 'Not punched in yet';
      console.log('⚠️ 400 Bad Request:', msg);
      showToast(msg, 'error');
      dispatch({ type: types.PUNCH_OUT_FAIL, payload: msg });
      return { success: false, error: 'NOT_PUNCHED_IN', message: msg };
    }

    if (response.status === 401) {
      console.log('⚠️ 401 Unauthorized - Session expired');
      dispatch({ type: types.PUNCH_OUT_FAIL, payload: 'Session expired' });
      await dispatch(logout());
      showToast('Session expired. Please log in again.', 'error');
      return { success: false, error: 'SESSION_EXPIRED' };
    }

    if (response.status === 403) {
      const msg = response.data?.message || 'Not allowed';
      console.log('⚠️ 403 Forbidden:', msg);
      showToast(msg, 'error');
      dispatch({ type: types.PUNCH_OUT_FAIL, payload: msg });
      return { success: false, error: 'FORBIDDEN', message: msg };
    }

    if (response.status === 409) {
      const msg = response.data?.message || 'Conflict - Already punched out';
      console.log('⚠️ 409 Conflict:', msg);
      showToast(msg, 'info');
      dispatch({ type: types.PUNCH_OUT_FAIL, payload: msg });
      return { success: false, error: 'ALREADY_PUNCHED_OUT', message: msg };
    }

    if (response.status === 500) {
      console.log('⚠️ 500 Server Error');
      showToast('Server error. Please try again later.', 'error');
      dispatch({ type: types.PUNCH_OUT_FAIL, payload: 'Server error' });
      return { success: false, error: 'SERVER_ERROR' };
    }

    if (response.status !== 200 && response.status !== 201) {
      const msg = response.data?.message || `HTTP ${response.status} error`;
      console.log('⚠️ Unexpected status:', response.status, msg);
      showToast(msg, 'error');
      dispatch({ type: types.PUNCH_OUT_FAIL, payload: msg });
      return { success: false, error: 'HTTP_ERROR', message: msg };
    }

    // ✅ FIX: Verify response data
    if (!response.data) {
      console.log('⚠️ No response data received');
      showToast('Invalid response from server. Please try again.', 'error');
      dispatch({ type: types.PUNCH_OUT_FAIL, payload: 'No response data' });
      return { success: false, error: 'NO_RESPONSE_DATA' };
    }

    if (response.data?.success === false) {
      const msg = response.data?.message || 'Punch out failed';
      console.log('❌ Response success: false -', msg);
      showToast(msg, 'error');
      dispatch({ type: types.PUNCH_OUT_FAIL, payload: msg });
      return { success: false, error: 'RESPONSE_ERROR', message: msg };
    }

    // ✅ SUCCESS
    console.log('✅ Punch out successful');
    dispatch({
      type: types.PUNCH_OUT_SUCCESS,
      payload: response.data?.data || response.data,
    });
    showToast('Punch out successful!', 'success');

    // ✅ Refresh attendance history
    try {
      await dispatch(getAttendanceHistory());
    } catch (e) {
      console.log('⚠️ Failed to refresh history after punch out:', e.message);
    }

    return { success: true, data: response.data?.data };
  } catch (error) {
    console.log('❌ Punch out error:', error);
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);

    let errorMessage = 'Punch out failed. Please try again.';

    // ✅ FIX: Comprehensive error handling
    if (!error) {
      errorMessage = 'Unknown error occurred';
    } else if (error.message === 'NO_INTERNET') {
      errorMessage = 'No internet connection';
    } else if (error.message === 'LOCATION_TIMEOUT') {
      errorMessage = 'Location timeout. Please enable GPS.';
    } else if (error.message === 'CAMERA_TIMEOUT') {
      errorMessage = 'Camera not responding. Please restart the app.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please check your connection.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Cannot reach server. Check your internet.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.message || 'Invalid request';
    } else if (error.response?.status === 401) {
      errorMessage = 'Session expired. Please log in again.';
    } else if (error.response?.status === 409) {
      errorMessage = error.response?.data?.message || 'Already punched out';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.log('📢 Error message to show:', errorMessage);

    dispatch({
      type: types.PUNCH_OUT_FAIL,
      payload: errorMessage,
    });

    showToast(errorMessage, 'error');

    return {
      success: false,
      error: error.message || 'UNKNOWN_ERROR',
      message: errorMessage,
    };
  }
};

// ==================== GET ATTENDANCE HISTORY ====================
export const getAttendanceHistory =
  (params = {}) =>
  async dispatch => {
    try {
      console.log('📊 Fetching attendance history...');
      dispatch({ type: types.ATTENDANCE_HISTORY_REQUEST });

      const queryParams = new URLSearchParams();
      if (params.month) queryParams.append('month', params.month);
      if (params.year) queryParams.append('year', params.year);
      if (params.limit) queryParams.append('limit', params.limit);

      const queryString = queryParams.toString();
      const endpoint = `/attendance/history${
        queryString ? `?${queryString}` : ''
      }`;

      const response = await apiService.get(endpoint);

      if (response.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch history');
      }

      const historyData = response.data?.data || [];
      console.log('✅ History fetched:', historyData, 'records');

      dispatch({
        type: types.ATTENDANCE_HISTORY_SUCCESS,
        payload: historyData,
      });
      return { success: true, data: historyData };
    } catch (error) {
      console.log('❌ Get history error:', error.message);

      // Check for session expiry
      if (error.message === 'SESSION_EXPIRED' || error.isSessionExpired) {
        console.log('🔐 Session expired, logging out...');
        await dispatch(logout());
        showToast('Session expired. Please log in again.', 'error');
        return { success: false, error: 'SESSION_EXPIRED' };
      }

      dispatch({
        type: types.ATTENDANCE_HISTORY_FAIL,
        payload: error.message || 'Failed to fetch history',
      });
      return { success: false, error: error.message };
    }
  };

// ==================== GET TODAY'S ATTENDANCE ====================
export const getTodayAttendance = () => async dispatch => {
  try {
    console.log("📊 Fetching today's attendance...");
    dispatch({ type: types.TODAY_ATTENDANCE_REQUEST });

    const response = await apiService.get('/attendance/today');

    console.log('📡 Response status:', response.status);

    if (response.status !== 200) {
      throw new Error(
        response.data?.message || "Failed to fetch today's attendance",
      );
    }

    const attendanceData = response.data?.data || null;
    console.log("✅ Today's attendance fetched");

    dispatch({ type: types.TODAY_ATTENDANCE_SUCCESS, payload: attendanceData });
    return { success: true, data: attendanceData };
  } catch (error) {
    console.log('❌ Get today attendance error:', error.message);
    dispatch({
      type: types.TODAY_ATTENDANCE_FAIL,
      payload: error.message || "Failed to fetch today's attendance",
    });
    return { success: false, error: error.message };
  }
};

// ==================== GET ATTENDANCE STATS ====================
export const getAttendanceStats =
  (period = 'month') =>
  async dispatch => {
    try {
      console.log(`📊 Fetching attendance stats for ${period}...`);
      dispatch({ type: types.ATTENDANCE_STATS_REQUEST });

      const response = await apiService.get(
        `/attendance/stats?period=${period}`,
      );

      if (response.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch stats');
      }

      dispatch({
        type: types.ATTENDANCE_STATS_SUCCESS,
        payload: response.data?.data,
      });
      return { success: true, data: response.data?.data };
    } catch (error) {
      console.log('❌ Get stats error:', error.message);
      dispatch({ type: types.ATTENDANCE_STATS_FAIL, payload: error.message });
      return { success: false };
    }
  };

// ==================== CLEAR ATTENDANCE STATE ====================
export const clearAttendanceState = () => ({
  type: types.CLEAR_ATTENDANCE_STATE,
});

// ==================== BREAK IN ====================
export const breakIn = (breakType, remarks) => async (dispatch, getState) => {
  try {
    console.log('☕ BREAK IN: Starting...');
    dispatch({ type: 'BREAK_IN_REQUEST' });

    console.log('🌐 POST /attendance/break-in', { breakType, remarks });
    const response = await apiService.post('/attendance/break-in', {
      breakType: breakType || 'LUNCH',
      remarks: remarks || 'Break started',
    });

    console.log('📡 Response status:', response.status);

    if (response.status === 400) {
      const msg = response.data?.message || '';
      if (msg.toLowerCase().includes('already on a break')) {
        showToast('You are already on a break!', 'error');
        return { success: false, error: 'ALREADY_ON_BREAK' };
      }
      if (msg.toLowerCase().includes('not punched in')) {
        showToast('Please punch in first!', 'error');
        return { success: false, error: 'NOT_PUNCHED_IN' };
      }
      showToast(msg || 'Break in failed', 'error');
      return { success: false, error: 'BAD_REQUEST', message: msg };
    }

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(response.data?.message || 'Break in failed');
    }

    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Break in failed');
    }

    console.log('✅ Break in successful');
    dispatch({
      type: 'BREAK_IN_SUCCESS',
      payload: response.data?.data || response.data,
    });
    showToast('Break started!', 'success');
    await dispatch(getAttendanceHistory());

    return { success: true, data: response.data?.data };
  } catch (error) {
    console.log('❌ Break in error:', error.message);

    const msg = error.response?.data?.message || error.message;

    dispatch({ type: 'BREAK_IN_FAIL', payload: msg });

    if (
      !msg?.toLowerCase().includes('already on a break') &&
      !msg?.toLowerCase().includes('not punched in')
    ) {
      showToast(msg || 'Failed to start break', 'error');
    }

    return { success: false, message: msg };
  }
};

// ==================== BREAK OUT ====================
export const breakOut = (breakType, remarks) => async (dispatch, getState) => {
  try {
    console.log('☕ BREAK OUT: Starting...');
    dispatch({ type: 'BREAK_OUT_REQUEST' });

    console.log('🌐 POST /attendance/break-out', { breakType, remarks });
    const response = await apiService.post('/attendance/break-out', {
      breakType: breakType || 'LUNCH',
      remarks: remarks || 'Break ended',
    });

    console.log('📡 Response status:', response.status);

    if (response.status === 400) {
      const msg = response.data?.message || '';
      if (msg.toLowerCase().includes('not on a break')) {
        showToast('You are not on a break!', 'error');
        return { success: false, error: 'NOT_ON_BREAK' };
      }
      showToast(msg || 'Break out failed', 'error');
      return { success: false, error: 'BAD_REQUEST', message: msg };
    }

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(response.data?.message || 'Break out failed');
    }

    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Break out failed');
    }

    console.log('✅ Break out successful');
    dispatch({
      type: 'BREAK_OUT_SUCCESS',
      payload: response.data?.data || response.data,
    });
    showToast('Break ended!', 'success');
    await dispatch(getAttendanceHistory());

    return { success: true, data: response.data?.data };
  } catch (error) {
    console.log('❌ Break out error:', error.message);

    const msg = error.response?.data?.message || error.message;

    dispatch({ type: 'BREAK_OUT_FAIL', payload: msg });

    if (!msg?.toLowerCase().includes('not on a break')) {
      showToast(msg || 'Failed to end break', 'error');
    }

    return { success: false, message: msg };
  }
};
