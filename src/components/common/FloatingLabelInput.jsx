import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Animated, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Fonts } from '../../utils/GlobalText';
import { useTheme } from '../../context/ThemeContext';

const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  onFocus,
  onBlur,
  keyboardType,
  autoCapitalize, // Add this prop
  maxLength,
  placeholder,
  placeholderTextColor,
  secureTextEntry,
  editable = true,
  style,
  ...props
}) => {

  const { theme } = useTheme();
  const C = theme.colors;

  const [isFocused, setIsFocused] = useState(false);
  const floatingAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(floatingAnim, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute',
    left: wp('4%'),
    top: floatingAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [hp('2.2%'), -hp('1.2%')],
    }),
    fontSize: floatingAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [wp('3.8%'), wp('3%')],
    }),
    color: floatingAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [C.textSecondary, isFocused ? C.primary : C.textSecondary],
    }),
    backgroundColor: C.background,
    paddingHorizontal: wp('1.5%'),
    zIndex: 10,
    fontFamily: Fonts.medium,
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.Text style={labelStyle}>
        {label}
      </Animated.Text>

      <TextInput
        style={[
          styles.input,
          {
            borderColor: isFocused ? C.primary : C.border,
            backgroundColor: C.background,
            color: C.textPrimary,
          },
          !editable && { backgroundColor: C.disabled },
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize} // Pass through the prop
        maxLength={maxLength}
        placeholder={isFocused ? placeholder : ''}
        placeholderTextColor={placeholderTextColor || C.textSecondary}
        secureTextEntry={secureTextEntry}
        editable={editable}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: hp('2.5%'),
    position: 'relative',
  },

  input: {
    height: hp('7%'),
    borderWidth: 1.5,
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    fontSize: wp('3.8%'),
    fontFamily: Fonts.light,
  },
});

export default FloatingLabelInput;