# Presenza Technical Documentation

## 1. Project Overview

`Presenza` is a React Native mobile application designed for employee attendance, leave, reimbursement, meeting, and performance management workflows. It supports authentication with OTP, biometric checks, device integrity controls, offline-aware API handling, and a modular Redux-based state management architecture.

## 2. Technology Stack

- React Native `0.83.1`
- React `19.2.0`
- Redux + Redux Thunk
- React Navigation (`@react-navigation/native`, `@react-navigation/native-stack`)
- Axios for HTTP requests
- Encrypted Storage for secure token storage
- Async Storage for local persistence
- Device and security utilities:
  - `react-native-device-info`
  - `react-native-biometrics`
  - `react-native-geolocation-service`
  - `react-native-permissions`
  - `react-native-version-check`
- Native file handling and viewer:
  - `react-native-fs`
  - `react-native-file-viewer`
- Theming and localization via React Context

## 3. Core Architecture

### 3.1 Application Entry Point

- `App.jsx`
  - Wraps the app with React Redux `Provider`, `ThemeProvider`, `LanguageProvider`, `NavigationContainer`, and `ToastProvider`.
  - Disables console logging in production by overriding `console.log`, `console.warn`, `console.info`, and `console.debug`.

### 3.2 Navigation

- `src/navigation/AppNavigator.jsx`
  - Defines two navigation stacks:
    - `AuthStack`: login flow, OTP verification, auth-related settings.
    - `AppStack`: attendance, reports, leave, reimbursement, meetings, KRA, and settings.
  - Uses `createNativeStackNavigator` for native stack transitions.
  - Includes app lifecycle and permission handling logic.

### 3.3 State Management

- `src/store/store.js`
  - Creates Redux store with middleware `redux-thunk`.
  - Uses `rootReducer` combining feature reducers.

- `src/store/reducers/rootReducer.js`
  - Combines the main reducers:
    - `auth`
    - `attendance`
    - `ui`
    - `leave`
    - `employeeProfile`
    - `kra`
    - `employees`
    - `meetings`
    - `expense`
  - Resets state when dispatching `LOGOUT` or `RESET_APP_STATE`.

### 3.4 Authentication Flow

- `src/store/actions/authActions.js`
  - Provides actions for:
    - sending OTP
    - resending OTP
    - verifying OTP
    - biometric availability and initialization
  - Uses secure storage helpers in `src/utils/keychainHelper.js`.
  - Dispatches UI toast notifications via `ToastProvider`.

## 4. API & Network Layer

### 4.1 API Service

- `src/services/apiService.js`
  - Uses Axios with a base URL from `src/utils/GlobalText.js`.
  - Adds network connectivity validation with `@react-native-community/netinfo`.
  - Adds request headers:
    - `Authorization` bearer token
    - `X-Platform`, `X-Platform-Version`, `X-Request-Time`
  - Includes response interceptor for:
    - token refresh on 401/expired token
    - queued retry behavior during refresh
    - logout handling on invalid refresh token

### 4.2 GlobalText

- `src/utils/GlobalText.js`
  - Central source for API base URL, colors, fonts, and fallback text.
  - Contains theme color defaults plus fallback English strings.

## 5. Security & Device Integrity

### 5.1 Security Guard

- `src/security/SecurityGuard.js`
  - Detects device tampering conditions such as:
    - time tampering
    - mock location
    - running on an emulator
    - remote debugger conditions
  - Performs server time validation via `https://timeapi.io/api/v1/time/current/utc`.
  - Uses `react-native-geolocation-service` and `DeviceInfo`.
  - Stores verification state with AsyncStorage to reduce false positives.
  - Provides global blocking and app exit logic.

### 5.2 Integration with App Lifecycle

- In `AppNavigator.jsx`:
  - Security initialization is prepared but currently commented out for emulator testing.
  - App state changes trigger permission revalidation and optional security guard reset.
  - The app can set a blocked state when a device compromise is detected.

## 6. Theme and Internationalization

### 6.1 Theme Context

- `src/context/ThemeContext.jsx`
  - Exposes `DarkTheme` and `LightTheme` palettes.
  - Provides theme state via React Context.
  - Persists theme preference with AsyncStorage.

### 6.2 Language Context

- `src/context/LanguageContext.jsx`
  - Provides translation strings for English (`en`).
  - Stores selected language preferences in AsyncStorage.
  - Supports runtime language switching from components.

## 7. Permissions and Device Capabilities

- `src/utils/permissions.js`
  - Likely contains functions such as:
    - `checkAllPermissionsAtStart`
    - `quickCheckPermissions`
    - `setPermissionCallbacks`
  - Used by `AppNavigator.jsx` to validate camera and location permissions.
  - Shows warning or toast notifications if required permissions are missing.

## 8. Screens and Feature Modules

### 8.1 Auth Screens

- `src/screens/auth/Login.jsx`
- `src/screens/auth/VerifyOtp.jsx`

### 8.2 Home & Attendance

- `src/screens/home/Home.jsx`
- `src/screens/home/punch/DailyPunch.jsx`
- `src/screens/home/reports/ReportsScreen.jsx`
- `src/screens/home/leave/LeaveScreen.jsx`
- `src/screens/home/reimbursement/Reimbursement.jsx`
- `src/screens/home/meetings/Meetings.jsx`
- `src/screens/home/kra/KRA.jsx`

### 8.3 Settings

- `src/screens/settings/SettingsScreen.jsx`

### 8.4 Shared Components

- `src/components/common/ToastProvider.jsx`
- `src/components/loader/AppLoader.jsx`

## 9. Project Directory Structure

- `App.jsx`
- `src/
  - `assets/`
  - `components/`
    - `common/`
    - `layout/`
    - `loader/`
    - `Login/`
    - `modals/`
    - `quickActions/`
  - `context/`
  - `hooks/`
  - `navigation/`
  - `screens/`
  - `security/`
  - `services/`
  - `store/`
    - `actions/`
    - `reducers/`
  - `utils/`
- `android/`
- `ios/`
- `__tests__/`

## 10. Development and Build Commands

- `npm install`
- `npm start` — start Metro bundler
- `npm run ios` — launch iOS simulator
- `npm run android` — launch Android emulator/device
- `npm run lint` — run ESLint
- `npm test` — run Jest tests

## 11. Platform Notes

- iOS native dependencies are managed via CocoaPods in `ios/Podfile`.
- Android dependencies are configured in `android/` Gradle files.
- The app targets mobile features: location, camera, device info, storage, and version checking.

## 12. Testing and Quality

- Jest is configured for unit/component testing.
- ESLint and Prettier are available for code formatting and linting.
- React Native fast refresh is available during development.

## 13. Recommended Extension Points

### 13.1 Add New Feature Screens

- Create new screen under `src/screens/` and register it in `AppNavigator.jsx`.
- Add reducer and actions for feature state if needed.
- Use shared components from `src/components/common`.

### 13.2 Add API Endpoints

- Extend `src/services/apiService.js` with helper methods or create a dedicated service module.
- Reuse secure storage helper methods from `src/utils/keychainHelper.js`.

### 13.3 Add Localization

- Expand `src/context/LanguageContext.jsx` with new language objects.
- Use `useLanguage()` hook to render translated strings in components.

## 14. Notes and Observations

- `src/services/apiService.js` includes robust token refresh logic and logout handling.
- `src/security/SecurityGuard.js` is designed for hardening the app against time manipulation, mock location, emulator use, and debugger attachment.
- Security guard initialization is currently intentionally disabled for emulator testing in `AppNavigator.jsx`.
- The global toast helper is exposed via `global.showToast` for cross-module use.

## 15. Getting Help and Next Steps

- For new developers, begin by exploring `App.jsx`, `src/navigation/AppNavigator.jsx`, and `src/store/actions/authActions.js`.
- Review the theme and language contexts to understand UI customization.
- Check `src/screens/` to see actual feature implementations.
- If you want to extend offline support, focus on `apiService.js` and local caching strategies.
