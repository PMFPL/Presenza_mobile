import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const StatusIndicator = ({ status }) => {
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const isActive = status === 'PRESENT';
  const color = isActive ? '#4CAF50' : 'red';

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.4,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.wrapper}>
      {/* Pulse ring */}
      <Animated.View
        style={[
          styles.pulse,
          {
            backgroundColor: color,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />

      {/* Solid dot */}
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
};

export default StatusIndicator;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 20,
  },

  dot: {
    width: 15,
    height: 15,
    borderRadius: 50,
  },
});
