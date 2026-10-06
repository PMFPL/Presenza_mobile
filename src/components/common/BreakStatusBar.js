// src/components/common/BreakStatusBar.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Coffee, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Fonts } from '../../utils/GlobalText';

const BreakStatusBar = ({ breakType, breakStartTime, onEndBreak, loading }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const C = theme.colors;
  const [breakDuration, setBreakDuration] = useState('00:00');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!breakStartTime) return;
    
    // Small delay to show loading state
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!breakStartTime || isInitialLoad) return;

    const interval = setInterval(() => {
      const now = new Date();
      const breakStart = new Date(breakStartTime);
      const breakDiffMs = now - breakStart;
      
      const hours = Math.floor(breakDiffMs / 3600000);
      const mins = Math.floor((breakDiffMs % 3600000) / 60000);
      const secs = Math.floor((breakDiffMs % 60000) / 1000);
      
      if (hours > 0) {
        setBreakDuration(
          `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        );
      } else {
        setBreakDuration(
          `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [breakStartTime, isInitialLoad]);

  const getBreakLabel = (type) => {
    const labels = {
      'LUNCH': t.breaks.lunch,
      'TEA': t.breaks.tea,
      'COFFEE': t.breaks.coffee,
      'PERSONAL': t.breaks.personal,
      'OTHER': t.breaks.other,
    };
    return labels[type] || t.breaks.breakType;
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: C.surface,
      borderColor: C.warning,
    }]}>
      <View style={styles.content}>
        <Coffee size={wp('5%')} color={C.warning} />
        <View style={styles.textContainer}>
          <Text style={[styles.breakTitle, { color: C.textPrimary }]}>
            {getBreakLabel(breakType)}
          </Text>
          {isInitialLoad ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.breakTimer, { color: C.warning }]}>00:00</Text>
              <View style={[styles.loadingDot, { backgroundColor: C.warning }]} />
              <View style={[styles.loadingDot, { backgroundColor: C.warning, opacity: 0.6 }]} />
              <View style={[styles.loadingDot, { backgroundColor: C.warning, opacity: 0.3 }]} />
            </View>
          ) : (
            <Text style={[styles.breakTimer, { color: C.warning }]}>
              {breakDuration}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.endButton, { 
            backgroundColor: C.warning,
          }, (loading || isInitialLoad) && styles.disabledButton]}
          onPress={onEndBreak}
          disabled={loading || isInitialLoad}
        >
          <Text style={[styles.endButtonText, { color: C.textDark }]}>
            {t.breaks.endBreak}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: wp('0%'),
    marginTop: hp('1%'),
    borderRadius: wp('3%'),
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('3%'),
    gap: wp('3%'),
  },
  textContainer: {
    flex: 1,
  },
  breakTitle: {
    fontSize: wp('3.2%'),
    fontFamily: Fonts.medium,
  },
  breakTimer: {
    fontSize: wp('4%'),
    fontFamily: Fonts.bold,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
  },
  loadingDot: {
    width: wp('1%'),
    height: wp('1%'),
    borderRadius: wp('0.5%'),
    marginLeft: wp('0.5%'),
  },
  endButton: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
  },
  endButtonText: {
    fontSize: wp('3%'),
    fontFamily: Fonts.medium,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default BreakStatusBar;