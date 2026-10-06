import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  MapPin,
  Navigation,
  X,
  CheckCircle,
  AlertTriangle,
  Briefcase,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Fonts } from '../../utils/GlobalText';

const RemoteLocationModal = ({
  visible,
  onClose,
  onConfirm,
  locationData,
  loading = false,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const C = theme.colors;

  const slideAnim = useRef(new Animated.Value(hp('100%'))).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: hp('100%'),
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const formatCoord = val => {
    if (val === null || val === undefined) return '—';
    return parseFloat(val).toFixed(6);
  };

  const formatDistance = dist => {
    if (!dist && dist !== 0) return '—';
    if (dist >= 1000) return `${(dist / 1000).toFixed(1)} km`;
    return `${Math.round(dist)} m`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Animated.View
        style={[styles.overlay, { backgroundColor: C.overlayBg, opacity: fadeAnim }]}
      />

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheetContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: C.background,
              borderColor: C.border,
            },
          ]}
        >
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: C.border }]} />

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: C.border }]}>
            <View
              style={[
                styles.headerIconWrap,
                { backgroundColor: C.warning + '20' },
              ]}
            >
              <Briefcase size={wp('5%')} color={C.warning} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.headerTitle, { color: C.textPrimary }]}>
                {t?.remoteLocation?.title || 'Remote Punch-In'}
              </Text>
              <Text style={[styles.headerSubtitle, { color: C.textSecondary }]}>
                {t?.remoteLocation?.subtitle || 'You are outside the office zone'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.closeBtn,
                { backgroundColor: C.surface, borderColor: C.border },
              ]}
              onPress={onClose}
              disabled={loading}
            >
              <X size={wp('4%')} color={C.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Warning banner */}
            <View
              style={[
                styles.warningBanner,
                {
                  backgroundColor: C.warning + '12',
                  borderColor: C.warning + '40',
                },
              ]}
            >
              <AlertTriangle size={wp('4%')} color={C.warning} />
              <Text style={[styles.warningText, { color: C.warning }]}>
                {t?.remoteLocation?.warningText ||
                  'You are punching in from a location outside the office geofence. This will be recorded.'}
              </Text>
            </View>

            {/* Location card */}
            <View
              style={[
                styles.locationCard,
                {
                  backgroundColor: C.surface,
                  borderColor: C.border,
                },
              ]}
            >
              {/* Card header */}
              <View style={styles.locationCardHeader}>
                <View
                  style={[
                    styles.locationIconCircle,
                    { backgroundColor: C.primary + '20' },
                  ]}
                >
                  <MapPin size={wp('5%')} color={C.primary} />
                </View>
                <Text style={[styles.locationCardTitle, { color: C.textPrimary }]}>
                  {t?.remoteLocation?.yourLocation || 'Your Current Location'}
                </Text>
              </View>

              {/* Address */}
              {locationData?.address ? (
                <View
                  style={[
                    styles.addressRow,
                    { backgroundColor: C.background, borderColor: C.border },
                  ]}
                >
                  <Navigation size={wp('3.5%')} color={C.textSecondary} />
                  <Text
                    style={[styles.addressText, { color: C.textPrimary }]}
                    numberOfLines={3}
                  >
                    {locationData.address}
                  </Text>
                </View>
              ) : null}

              {/* Coordinates grid */}
              <View style={styles.coordsGrid}>
                <View
                  style={[
                    styles.coordCell,
                    {
                      backgroundColor: C.background,
                      borderColor: C.border,
                    },
                  ]}
                >
                  <Text style={[styles.coordLabel, { color: C.textSecondary }]}>
                    {t?.remoteLocation?.latitude || 'Latitude'}
                  </Text>
                  <Text style={[styles.coordValue, { color: C.textPrimary }]}>
                    {formatCoord(locationData?.latitude)}°
                  </Text>
                </View>

                <View
                  style={[
                    styles.coordCell,
                    {
                      backgroundColor: C.background,
                      borderColor: C.border,
                    },
                  ]}
                >
                  <Text style={[styles.coordLabel, { color: C.textSecondary }]}>
                    {t?.remoteLocation?.longitude || 'Longitude'}
                  </Text>
                  <Text style={[styles.coordValue, { color: C.textPrimary }]}>
                    {formatCoord(locationData?.longitude)}°
                  </Text>
                </View>
              </View>

              {/* Distance from office */}
              {locationData?.distance !== null &&
                locationData?.distance !== undefined && (
                  <View
                    style={[
                      styles.distanceRow,
                      {
                        backgroundColor: C.error + '10',
                        borderColor: C.error + '30',
                      },
                    ]}
                  >
                    <MapPin size={wp('3.5%')} color={C.error} />
                    <Text style={[styles.distanceLabel, { color: C.error }]}>
                      {t?.remoteLocation?.distanceFromOffice ||
                        'Distance from office'}
                      :{'  '}
                      <Text style={styles.distanceValue}>
                        {formatDistance(locationData.distance)}
                      </Text>
                    </Text>
                  </View>
                )}
            </View>

            {/* Confirmation question */}
            <Text
              style={[styles.confirmQuestion, { color: C.textPrimary }]}
            >
              {t?.remoteLocation?.confirmQuestion ||
                'Do you want to punch in from this location?'}
            </Text>

            <Text
              style={[styles.confirmNote, { color: C.textSecondary }]}
            >
              {t?.remoteLocation?.confirmNote ||
                'Your manager will be able to see this remote punch-in location in your attendance records.'}
            </Text>
          </ScrollView>

          {/* Action buttons */}
          <View
            style={[styles.actions, { borderTopColor: C.border }]}
          >
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                { backgroundColor: C.surface, borderColor: C.border },
              ]}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <X size={wp('4%')} color={C.textSecondary} />
              <Text style={[styles.cancelBtnText, { color: C.textSecondary }]}>
                {t?.buttons?.cancel || 'Cancel'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: loading ? C.disabled : C.primary },
              ]}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.8}
            >
              <CheckCircle size={wp('4%')} color={C.textDark} />
              <Text style={[styles.confirmBtnText, { color: C.textDark }]}>
                {loading
                  ? t?.attendance?.processing || 'Processing...'
                  : t?.remoteLocation?.confirmBtn || 'Yes, Punch In Here'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: wp('6%'),
    borderTopRightRadius: wp('6%'),
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: hp('85%'),
    paddingBottom: Platform.OS === 'ios' ? hp('4%') : hp('2.5%'),
    overflow: 'hidden',
  },

  handle: {
    width: wp('10%'),
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: hp('1.2%'),
    marginBottom: hp('0.5%'),
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.8%'),
    borderBottomWidth: 1,
    gap: wp('3%'),
  },
  headerIconWrap: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: wp('4%'),
    fontFamily: Fonts.bold,
    lineHeight: wp('5.5%'),
  },
  headerSubtitle: {
    fontSize: wp('2.8%'),
    fontFamily: Fonts.regular,
    marginTop: 1,
  },
  closeBtn: {
    width: wp('8.5%'),
    height: wp('8.5%'),
    borderRadius: wp('2.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  // Scroll content
  scrollContent: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('1%'),
    gap: hp('1.5%'),
  },

  // Warning banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp('2.5%'),
    padding: wp('3.5%'),
    borderRadius: wp('3%'),
    borderWidth: 1,
  },
  warningText: {
    flex: 1,
    fontSize: wp('3%'),
    fontFamily: Fonts.medium,
    lineHeight: hp('2.4%'),
  },

  // Location card
  locationCard: {
    borderRadius: wp('4%'),
    borderWidth: 1,
    padding: wp('4%'),
    gap: hp('1.5%'),
  },
  locationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2.5%'),
  },
  locationIconCircle: {
    width: wp('9%'),
    height: wp('9%'),
    borderRadius: wp('2.5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCardTitle: {
    fontSize: wp('3.5%'),
    fontFamily: Fonts.bold,
  },

  // Address
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp('2%'),
    padding: wp('3%'),
    borderRadius: wp('2.5%'),
    borderWidth: 1,
  },
  addressText: {
    flex: 1,
    fontSize: wp('3%'),
    fontFamily: Fonts.regular,
    lineHeight: hp('2.5%'),
  },

  // Coordinates
  coordsGrid: {
    flexDirection: 'row',
    gap: wp('2.5%'),
  },
  coordCell: {
    flex: 1,
    padding: wp('3%'),
    borderRadius: wp('2.5%'),
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  coordLabel: {
    fontSize: wp('2.4%'),
    fontFamily: Fonts.medium,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  coordValue: {
    fontSize: wp('3.2%'),
    fontFamily: Fonts.bold,
    letterSpacing: 0.3,
  },

  // Distance
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    padding: wp('2.5%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
  },
  distanceLabel: {
    fontSize: wp('3%'),
    fontFamily: Fonts.medium,
  },
  distanceValue: {
    fontFamily: Fonts.bold,
  },

  // Confirmation
  confirmQuestion: {
    fontSize: wp('3.8%'),
    fontFamily: Fonts.bold,
    textAlign: 'center',
    marginTop: hp('0.5%'),
    lineHeight: hp('3%'),
  },
  confirmNote: {
    fontSize: wp('2.8%'),
    fontFamily: Fonts.regular,
    textAlign: 'center',
    lineHeight: hp('2.3%'),
    paddingHorizontal: wp('3%'),
    marginBottom: hp('0.5%'),
  },

  // Actions
  actions: {
    flexDirection: 'row',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('1.5%'),
    gap: wp('3%'),
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('2%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('3%'),
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: wp('3.5%'),
    fontFamily: Fonts.medium,
  },
  confirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('2%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('3%'),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  confirmBtnText: {
    fontSize: wp('3.5%'),
    fontFamily: Fonts.bold,
  },
});

export default RemoteLocationModal;