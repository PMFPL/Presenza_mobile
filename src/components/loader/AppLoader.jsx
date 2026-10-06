import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Fonts } from '../../utils/GlobalText';
import logo from '../../assets/logo.png';
import { getEmployeeProfile } from '../../store/actions/employeeActions';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';

const AppLoader = ({ visible = true }) => {
  const { theme } = useTheme();
  const C = theme.colors;

  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(hp('5%'))).current;

  const { profile, loading, error } = useSelector(
    state => state.employeeProfile,
  );

  useEffect(() => {
    if (visible) {
      fetchProfile();
    }
  }, [visible]);

  const fetchProfile = async () => {
    const result = await dispatch(getEmployeeProfile());
    if (!result.success) {
      console.log(result.error);
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();

      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      );

      setTimeout(() => {
        pulseAnimation.start();
      }, 800);

      return () => pulseAnimation.stop();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={[styles.container, { backgroundColor: C.background }]}>
        {/* Background Elements */}
        <View style={[styles.topShadow, { backgroundColor: C.topShadow }]} />
        <View
          style={[
            styles.bottomShadow,
            { backgroundColor: C.primary, opacity: 0.5 },
          ]}
        />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                backgroundColor: C.surface,
                shadowColor: C.primary,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Image source={logo} style={styles.logo} />
          </Animated.View>

          <Text style={[styles.appName, { color: C.primary }]}>PRESENZA</Text>

          <Text style={[styles.tagline, { color: C.textSecondary }]}>
            Employee Attendance System
          </Text>

          <ActivityIndicator
            size="large"
            color={C.primary}
            style={{ marginTop: hp('2%') }}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topShadow: {
    position: 'absolute',
    top: -hp('1%'),
    right: -wp('2%'),
    opacity: 0.9,
    width: wp('90%'),
    height: hp('35%'),
    borderBottomLeftRadius: wp('25%'),
  },
  bottomShadow: {
    position: 'absolute',
    bottom: -hp('1%'),
    left: -wp('2%'),
    width: wp('75%'),
    height: hp('35%'),
    borderTopRightRadius: wp('50%'),
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('7%'),
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: hp('0.5%') },
    shadowOpacity: 0.3,
    shadowRadius: wp('2.5%'),
    elevation: 8,
    marginBottom: hp('3%'),
  },
  logo: {
    width: wp('25%'),
    height: wp('25%'),
    borderRadius: wp('6%'),
    resizeMode: 'cover',
  },
  appName: {
    fontSize: wp('8%'),
    fontFamily: Fonts.medium,
    letterSpacing: wp('0.5%'),
    marginBottom: hp('1%'),
  },
  tagline: {
    fontSize: wp('3.5%'),
    fontFamily: Fonts.light,
    letterSpacing: wp('0.1%'),
    marginBottom: hp('4%'),
  },
});

export default AppLoader;