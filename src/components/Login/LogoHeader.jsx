// src/components/Login/LogoHeader.jsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../utils/GlobalText';
import logo from '../../assets/logo.png';

const LogoHeader = () => {
  const { theme } = useTheme();
  const C = theme.colors;

  return (
    <View style={styles.container}>
      <View style={[styles.logoWrapper, { 
        backgroundColor: C.surface,
        shadowColor: C.primary,
      }]}>
        <Image source={logo} style={styles.logo} />
      </View>
      <Text style={[styles.appName, { color: C.primary }]}>PRESENZA</Text>
      <Text style={[styles.subtitle, { color: C.textSecondary }]}>
        Employee Portal
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: hp('5%'),
    marginTop: hp('-5%'),
  },
  logoWrapper: {
    width: wp('25%'),
    height: wp('25%'),
    borderRadius: wp('7%'),
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: hp('0.5%') },
    shadowOpacity: 0.3,
    shadowRadius: wp('2.5%'),
    elevation: 8,
    marginBottom: hp('2%'),
  },
  logo: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('6%'),
    resizeMode: 'cover',
  },
  appName: {
    fontSize: wp('8%'),
    fontFamily: Fonts.medium,
    letterSpacing: wp('0.5%'),
    marginBottom: hp('1%'),
  },
  subtitle: {
    fontSize: wp('3.5%'),
    fontFamily: Fonts.light,
    letterSpacing: wp('1%'),
    opacity: 0.8,
  },
});

export default LogoHeader;