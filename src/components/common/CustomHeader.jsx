// src/components/common/CustomHeader.jsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Hand, Icon, Power } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Fonts } from '../../utils/GlobalText';
import logo from '../../assets/logo.png';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/actions/authActions';

const CustomHeader = ({
  title,
  showBack = false,
  onMenuPress,
  rightComponent,
  backgroundColor,

  // 👇 ADD THESE
  userName,
  greeting,
  date,
  showProfile = false,
  onProfilePress,
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const C = theme.colors;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t.buttons.logout,
      t.alerts.logoutConfirm,
      [
        { text: t.buttons.cancel, style: 'cancel' },
        {
          text: t.buttons.logout,
          onPress: async () => await dispatch(logout()),
          style: 'destructive',
        },
      ],
      { cancelable: true },
    );
  };

  // ✅ FIX: Truncate name to 10 characters max
  const getDisplayName = name => {
    if (!name) return 'User';
    // Get first name only
    const firstName = name.split(' ')[0];
    // If first name is 10 chars or less, show it fully
    if (firstName.length <= 10) {
      return firstName;
    }
    // If longer than 10, truncate with ellipsis
    return firstName.substring(0, 10) + '...';
  };

  const displayName = getDisplayName(userName);

  return (
    <>
      <StatusBar
        barStyle={C.statusBar}
        backgroundColor={backgroundColor || C.headerBg}
      />
      <View
        style={[
          styles.container,
          { backgroundColor: backgroundColor || C.headerBg },
        ]}
      >
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
              <ArrowLeft size={wp('5%')} color={C.textPrimary} />
            </TouchableOpacity>
          ) : (
            // ✅ FIX: Show truncated name here
            <View style={styles.greetingSection}>
              <Text style={[styles.greeting, { color: C.textSecondary }]}>
                {greeting || 'Hello,'}
              </Text>
              <Text
                style={[styles.name, { color: C.textPrimary }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {displayName}
              </Text>
              <Text
                style={[styles.date, { color: C.textSecondary }]}
                numberOfLines={1}
              >
                {date}
              </Text>
            </View>
          )}
        </View>

        {/* Center Section (Optional Title) */}
        {title && title !== 'Home' && (
          <View style={styles.centerSection}>
            <Text style={[styles.title, { color: C.textPrimary }]}>
              {title}
            </Text>
          </View>
        )}

        {/* Right Section */}
        <View style={styles.rightSection}>
          {/* <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <Power size={wp('5.5%')} color={C.error} />
          </TouchableOpacity> */}
          {showProfile && (
            <TouchableOpacity
              style={[styles.avatar, { backgroundColor: C.primary }]}
              onPress={onProfilePress}
            >
              <Text style={[styles.avatarText, { color: C.textDark }]}>
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </TouchableOpacity>
          )}

          {rightComponent}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingTop: Platform.OS === 'ios' ? hp('6%') : hp('5%'),
    paddingBottom: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
    minWidth: 0, // ✅ Important for text truncation
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    paddingVertical: hp('0.5%'),
    paddingTop: hp('1%'),
    paddingHorizontal: wp('2%'),
  },
  logo: {
    width: wp('5%'),
    height: wp('5%'),
    borderRadius: wp('50%'),
    borderWidth: 1,
    resizeMode: 'cover',
  },
  greetingSection: {
    minWidth: 0, // ✅ Important for text truncation
  },
  title: {
    fontSize: wp('4.5%'),
    fontFamily: Fonts.medium,
  },
  iconButton: {
    padding: wp('2%'),
    paddingRight: wp('4%'),
  },
  greeting: {
    fontSize: wp('3.2%'),
    fontFamily: Fonts.regular,
  },

  name: {
    fontSize: wp('4.5%'), // ✅ Reduced from 5% for better fit
    fontFamily: Fonts.bold,
    marginTop: hp('0.3%'),
    maxWidth: wp('40%'), // ✅ Constrain width
  },

  date: {
    fontSize: wp('2.8%'),
    fontFamily: Fonts.regular,
    marginTop: hp('0.3%'),
    maxWidth: wp('40%'), // ✅ Constrain width
  },

  avatar: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: wp('4%'),
    fontFamily: Fonts.bold,
  },
});

export default CustomHeader;
