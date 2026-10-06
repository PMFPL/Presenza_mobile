/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { AuthProvider } from './src/context/AuthContext';

import App from './App';
import { name as appName } from './app.json';
const Root = () => (
  <SafeAreaProvider>
    {/* <AuthProvider> */}
      <App />
    {/* </AuthProvider> */}
  </SafeAreaProvider>
);

AppRegistry.registerComponent(appName, () => Root);
