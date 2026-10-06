// src/components/common/ThemeWrapper.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * ThemeWrapper - A utility component to help convert components to use theme
 * This is just a helper, not required for all components
 */
export const withTheme = (Component) => {
  return (props) => {
    const { theme } = useTheme();
    return <Component {...props} theme={theme} />;
  };
};

export const ThemedView = ({ style, children, ...props }) => {
  const { theme } = useTheme();
  return (
    <View style={[{ backgroundColor: theme.colors.background }, style]} {...props}>
      {children}
    </View>
  );
};

export const ThemedText = ({ style, children, color = 'textPrimary', ...props }) => {
  const { theme } = useTheme();
  return (
    <Text style={[{ color: theme.colors[color] }, style]} {...props}>
      {children}
    </Text>
  );
};

export default {
  withTheme,
  ThemedView,
  ThemedText,
};