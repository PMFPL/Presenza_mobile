import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Colors, Fonts } from '../../utils/GlobalText';

const PrimaryButton = ({
  onPress,
  loading,
  disabled,
  title,
  style,
  textStyle,
  variant = 'primary', // primary, secondary, outline
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'outline':
        return styles.buttonOutline;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.textOutline;
      default:
        return styles.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? Colors.primary : Colors.background} 
          size="small" 
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: hp('7%'),
    borderRadius: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: hp('0.5%') },
    shadowOpacity: 0.3,
    shadowRadius: wp('2%'),
    elevation: 6,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowOpacity: 0,
  },
  buttonDisabled: {
    backgroundColor: Colors.disabled,
    shadowOpacity: 0.1,
  },
  textPrimary: {
    color: Colors.textDark,
    fontSize: wp('4.2%'),
    fontFamily: Fonts.medium,
    letterSpacing: wp('0.2%'),
  },
  textOutline: {
    color: Colors.primary,
    fontSize: wp('4.2%'),
    fontFamily: Fonts.medium,
    letterSpacing: wp('0.2%'),
  },
});

export default PrimaryButton;