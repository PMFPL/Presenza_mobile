// src/components/Login/WelcomeText.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Fonts } from '../../utils/GlobalText';

const WelcomeText = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const C = theme.colors;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: C.textPrimary }]}>
        {t.login.title}
      </Text>
      <Text style={[styles.subtitle, { color: C.textSecondary }]}>
        {t.login.subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: hp('5%'),
  },
  title: {
    fontSize: wp('7%'),
    fontFamily: Fonts.medium,
    marginBottom: hp('1%'),
  },
  subtitle: {
    fontSize: wp('3.5%'),
    fontFamily: Fonts.light,
    textAlign: 'center',
    lineHeight: hp('2.5%'),
    paddingHorizontal: wp('5%'),
  },
});

export default WelcomeText;