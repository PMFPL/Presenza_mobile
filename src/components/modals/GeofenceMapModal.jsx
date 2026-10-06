/**
 * GeofenceMapModal.jsx
 * No map library needed — pure GPS + distance check.
 * Only dependency: react-native-geolocation-service
 *
 * Usage:
 *   <GeofenceMapModal
 *     visible={mapVisible}
 *     onClose={() => setMapVisible(false)}
 *     onStatusChange={(isInside, distance, coords, address) => { ... }}
 *   />
 *
 * onStatusChange now passes 4 arguments:
 *   isInside  {boolean}
 *   distance  {number}   — metres from office
 *   coords    {{ latitude, longitude }}
 *   address   {string}   — reverse-geocoded address (may be null)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Geolocation from 'react-native-geolocation-service';
import {
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Navigation,
  RefreshCw,
  Wifi,
  Briefcase,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Fonts } from '../../utils/GlobalText';
import { checkAndRequestLocationPermission, getAddressFromCoords } from '../../utils/utils';

// ─────────────────────────────────────────────────
// 🔧 CONFIGURE YOUR OFFICE HERE
// ─────────────────────────────────────────────────
const OFFICE_CONFIG = {
  name: 'Head Office',
  latitude: 30.737875,
  longitude: 76.775631,
  radiusMeters: 100,
};
// ─────────────────────────────────────────────────

const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getBearing = userCoords => {
  if (!userCoords) return null;
  const dLon = OFFICE_CONFIG.longitude - userCoords.longitude;
  const y =
    Math.sin((dLon * Math.PI) / 180) *
    Math.cos((OFFICE_CONFIG.latitude * Math.PI) / 180);
  const x =
    Math.cos((userCoords.latitude * Math.PI) / 180) *
      Math.sin((OFFICE_CONFIG.latitude * Math.PI) / 180) -
    Math.sin((userCoords.latitude * Math.PI) / 180) *
      Math.cos((OFFICE_CONFIG.latitude * Math.PI) / 180) *
      Math.cos((dLon * Math.PI) / 180);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(((bearing + 360) % 360) / 45) % 8];
};

const GeofenceMapModal = ({
  visible,
  onClose,
  onStatusChange,
  isSalesTeam = false,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const C = theme.colors;

  const slideAnim = useRef(new Animated.Value(hp('100%'))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef(null);

  const [userCoords, setUserCoords] = useState(null);
  const [distanceMeters, setDistanceMeters] = useState(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [resolvedAddress, setResolvedAddress] = useState(null);

  // ── Slide in/out ─────────────────────────────────
  useEffect(() => {
    if (visible) {
      setIsInsideGeofence(null);
      setDistanceMeters(null);
      setLocationError(null);
      setUserCoords(null);
      setAccuracy(null);
      setResolvedAddress(null);
      progressAnim.setValue(0);
      fadeAnim.setValue(0);

      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start();
      fetchLocation();
    } else {
      Animated.timing(slideAnim, {
        toValue: hp('100%'),
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // ── Pulse while locating ──────────────────────────
  useEffect(() => {
    if (isLocating) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 750,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.current.start();
      Animated.timing(progressAnim, {
        toValue: 0.8,
        duration: 13000,
        useNativeDriver: false,
      }).start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
  }, [isLocating]);

  // ── Fade in result ────────────────────────────────
  useEffect(() => {
    if (isInsideGeofence !== null) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isInsideGeofence]);

  // ── Fetch GPS ─────────────────────────────────────
// In GeofenceMapModal.jsx, replace the fetchLocation function with this:

const fetchLocation = useCallback(async () => {
  setIsLocating(true);
  setLocationError(null);
  setIsInsideGeofence(null);
  setDistanceMeters(null);
  setResolvedAddress(null);
  progressAnim.setValue(0);
  fadeAnim.setValue(0);

  // Check and request permission first using the new utility
  const hasPermission = await checkAndRequestLocationPermission();
  if (!hasPermission) {
    setIsLocating(false);
    setLocationError(
      t.attendance.locationPermissionDenied ||
        'Location permission denied. Please enable in Settings.'
    );
    return;
  }

  Geolocation.getCurrentPosition(
    async position => {
      const { latitude, longitude, accuracy: acc } = position.coords;
      console.log("position:", position);
      const coords = { latitude, longitude };
      setUserCoords(coords);
      setAccuracy(Math.round(acc));
      setIsLocating(false);

      const dist = getDistanceMeters(
        latitude,
        longitude,
        OFFICE_CONFIG.latitude,
        OFFICE_CONFIG.longitude,
      );
      const inside = dist <= OFFICE_CONFIG.radiusMeters;
      setDistanceMeters(Math.round(dist));
      setIsInsideGeofence(inside);

      // Try to resolve address for remote modal
      let address = null;
      try {
        address = await getAddressFromCoords(latitude, longitude);
        console.log("address: ", address);
        setResolvedAddress(address);
      } catch (_) {
        // address stays null — coords will still be shown
      }

      // Pass all 4 values back to parent
      onStatusChange?.(inside, Math.round(dist), coords, address);
    },
    error => {
      setIsLocating(false);
      let errorMsg;
      switch (error.code) {
        case 1:
          errorMsg = t.attendance.locationPermissionDenied ||
            'Location permission denied. Please enable in Settings.';
          break;
        case 2:
          errorMsg = t.attendance.gpsUnavailable ||
            'GPS signal unavailable. Please check device settings.';
          break;
        case 3:
          errorMsg = t.attendance.locationTimeout ||
            'Location request timed out. Please try again.';
          break;
        default:
          errorMsg = t.attendance.locationError ||
            'Failed to get location. Please try again.';
      }
      setLocationError(errorMsg);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 3000,
      forceRequestLocation: true,
      forceLocationManager: false,
      showLocationDialog: true,
    },
  );
}, [t, onStatusChange]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const statusColor =
    isInsideGeofence === true
      ? C.success
      : isInsideGeofence === false
      ? isSalesTeam
        ? C.warning
        : C.error
      : C.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: C.overlayBg }]}>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: C.background,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle bar */}
          <View style={[styles.handle, { backgroundColor: C.border }]} />

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: C.border }]}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIcon,
                  { backgroundColor: C.primary + '20' },
                ]}
              >
                <Building2 size={wp('4.5%')} color={C.primary} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: C.textPrimary }]}>
                  {t.geofence.headOffice}
                </Text>
                <Text style={[styles.headerSub, { color: C.textSecondary }]}>
                  {t.geofence.radiusLabel} · {OFFICE_CONFIG.radiusMeters}m{' '}
                  {t.geofence.radius}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                {
                  backgroundColor: C.surface,
                  borderColor: C.border,
                },
              ]}
            >
              <X size={wp('4%')} color={C.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={[styles.progressTrack, { backgroundColor: C.border }]}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth, backgroundColor: statusColor },
              ]}
            />
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* ── Loading ── */}
            {isLocating && (
              <View style={styles.loadingWrap}>
                <Animated.View
                  style={[
                    styles.pulseRing,
                    {
                      backgroundColor: C.primary + '15',
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                />
                <View
                  style={[
                    styles.locatingIconWrap,
                    {
                      backgroundColor: C.primary + '20',
                      borderColor: C.primary + '40',
                    },
                  ]}
                >
                  <Navigation size={wp('7%')} color={C.primary} />
                </View>
                <Text style={[styles.loadingTitle, { color: C.textPrimary }]}>
                  {t.attendance.getLocation}
                </Text>
                <Text
                  style={[styles.loadingSubtitle, { color: C.textSecondary }]}
                >
                  {t.attendance.usingGps}
                </Text>
                <ActivityIndicator
                  color={C.primary}
                  size="small"
                  style={{ marginTop: hp('1%') }}
                />
              </View>
            )}

            {/* ── Error ── */}
            {!isLocating && locationError && (
              <View style={styles.errorWrap}>
                <View
                  style={[
                    styles.errorIconWrap,
                    { backgroundColor: C.error + '15' },
                  ]}
                >
                  <MapPin size={wp('7%')} color={C.error} />
                </View>
                <Text style={[styles.errorTitle, { color: C.textPrimary }]}>
                  {t.attendance.locationError}
                </Text>
                <Text style={[styles.errorMsg, { color: C.textSecondary }]}>
                  {locationError}
                </Text>
                <TouchableOpacity
                  style={[styles.retryBtn, { backgroundColor: C.primary }]}
                  onPress={fetchLocation}
                >
                  <RefreshCw size={wp('3.8%')} color={C.textDark} />
                  <Text style={[styles.retryText, { color: C.textDark }]}>
                    {t.attendance.tryAgain}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Result ── */}
            {!isLocating && isInsideGeofence !== null && (
              <Animated.View style={[styles.resultWrap, { opacity: fadeAnim }]}>
                {/* Status circle */}
                <View
                  style={[
                    styles.statusCircle,
                    {
                      borderColor: statusColor + '35',
                      backgroundColor: statusColor + '12',
                    },
                  ]}
                >
                  {isInsideGeofence ? (
                    <CheckCircle2 size={wp('14%')} color={statusColor} />
                  ) : isSalesTeam ? (
                    <Briefcase size={wp('14%')} color={statusColor} />
                  ) : (
                    <AlertCircle size={wp('14%')} color={statusColor} />
                  )}
                </View>

                <Text style={[styles.statusTitle, { color: statusColor }]}>
                  {isInsideGeofence
                    ? t.attendance.insideGeofenceStatus
                    : isSalesTeam
                    ? t?.remoteLocation?.remoteLocation || 'Remote Location'
                    : t.attendance.outsideGeofenceStatus}
                </Text>
                <Text
                  style={[styles.statusSubtitle, { color: C.textSecondary }]}
                >
                  {isInsideGeofence
                    ? t.attendance.insideMsg
                    : isSalesTeam
                    ? t?.remoteLocation?.salesMapSubtitle ||
                      'You can punch in from this remote location. Your location will be recorded.'
                    : t.attendance.outsideMsg}
                </Text>

                {/* Stats row */}
                <View
                  style={[
                    styles.statsRow,
                    {
                      backgroundColor: C.surface,
                      borderColor: C.border,
                    },
                  ]}
                >
                  <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: C.textPrimary }]}>
                      {distanceMeters >= 1000
                        ? `${(distanceMeters / 1000).toFixed(1)}km`
                        : `${distanceMeters}m`}
                    </Text>
                    <Text
                      style={[styles.statLabel, { color: C.textSecondary }]}
                    >
                      {t.attendance.distance}
                    </Text>
                  </View>
                  <View
                    style={[styles.statDivider, { backgroundColor: C.border }]}
                  />
                  <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: C.textPrimary }]}>
                      {OFFICE_CONFIG.radiusMeters}m
                    </Text>
                    <Text
                      style={[styles.statLabel, { color: C.textSecondary }]}
                    >
                      {t.attendance.zoneRadius}
                    </Text>
                  </View>
                  <View
                    style={[styles.statDivider, { backgroundColor: C.border }]}
                  />
                  <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: C.textPrimary }]}>
                      {getBearing(userCoords) || '—'}
                    </Text>
                    <Text
                      style={[styles.statLabel, { color: C.textSecondary }]}
                    >
                      {t.attendance.direction}
                    </Text>
                  </View>
                </View>

                {/* GPS accuracy */}
                {accuracy !== null && (
                  <View
                    style={[
                      styles.accuracyChip,
                      {
                        backgroundColor: C.surface,
                        borderColor: C.border,
                      },
                    ]}
                  >
                    <Wifi size={wp('3%')} color={C.textSecondary} />
                    <Text
                      style={[styles.accuracyText, { color: C.textSecondary }]}
                    >
                      {t.attendance.gpsAccuracy} ±{accuracy}m
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            {!isLocating && (
              <TouchableOpacity
                style={[
                  styles.refreshBtn,
                  {
                    backgroundColor: C.surface,
                    borderColor: C.border,
                  },
                ]}
                onPress={fetchLocation}
              >
                <RefreshCw size={wp('4%')} color={C.textSecondary} />
                <Text style={[styles.refreshText, { color: C.textSecondary }]}>
                  {t.attendance.refreshLocation}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.doneBtn,
                { backgroundColor: C.primary },
                isInsideGeofence === true && { backgroundColor: C.success },
                isInsideGeofence === false &&
                  !isSalesTeam && { backgroundColor: C.surface },
                isInsideGeofence === false &&
                  isSalesTeam && { backgroundColor: C.warning },
              ]}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.doneBtnText,
                  { color: C.textDark },
                  isInsideGeofence === true && { color: '#fff' },
                  isInsideGeofence === false &&
                    isSalesTeam && { color: C.textDark },
                ]}
              >
                {isInsideGeofence === true
                  ? t.attendance.proceedToPunchIn
                  : isInsideGeofence === false && isSalesTeam
                  ? t?.remoteLocation?.proceedRemote || 'Proceed to Punch In'
                  : t.attendance.close}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: wp('6%'),
    borderTopRightRadius: wp('6%'),
    overflow: 'hidden',
    paddingBottom: Platform.OS === 'ios' ? hp('4%') : hp('2.5%'),
  },
  handle: {
    width: wp('10%'),
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: hp('1.2%'),
    marginBottom: hp('0.8%'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('3%'),
  },
  headerIcon: {
    width: wp('9%'),
    height: wp('9%'),
    borderRadius: wp('2.5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: wp('3.8%'),
    fontFamily: Fonts.bold,
  },
  headerSub: {
    fontSize: wp('2.8%'),
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  closeBtn: {
    width: wp('9%'),
    height: wp('9%'),
    borderRadius: wp('2.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  progressTrack: {
    height: 2,
  },
  progressFill: {
    height: 2,
    borderRadius: 1,
  },
  body: {
    minHeight: hp('30%'),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('3%'),
  },
  loadingWrap: {
    alignItems: 'center',
    gap: hp('1%'),
  },
  pulseRing: {
    position: 'absolute',
    width: wp('22%'),
    height: wp('22%'),
    borderRadius: wp('11%'),
    top: -wp('3%'),
  },
  locatingIconWrap: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: hp('0.5%'),
  },
  loadingTitle: {
    fontSize: wp('4%'),
    fontFamily: Fonts.bold,
    marginTop: hp('0.5%'),
  },
  loadingSubtitle: {
    fontSize: wp('3%'),
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
  errorWrap: {
    alignItems: 'center',
    gap: hp('1%'),
  },
  errorIconWrap: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  errorTitle: {
    fontSize: wp('4%'),
    fontFamily: Fonts.bold,
  },
  errorMsg: {
    fontSize: wp('3%'),
    fontFamily: Fonts.regular,
    textAlign: 'center',
    lineHeight: hp('2.5%'),
    paddingHorizontal: wp('3%'),
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('2.5%'),
    gap: wp('2%'),
    marginTop: hp('0.5%'),
  },
  retryText: {
    fontSize: wp('3.5%'),
    fontFamily: Fonts.medium,
  },
  resultWrap: {
    alignItems: 'center',
    gap: hp('1.2%'),
    width: '100%',
  },
  statusCircle: {
    width: wp('28%'),
    height: wp('28%'),
    borderRadius: wp('14%'),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  statusTitle: {
    fontSize: wp('5%'),
    fontFamily: Fonts.bold,
  },
  statusSubtitle: {
    fontSize: wp('3.2%'),
    fontFamily: Fonts.regular,
    textAlign: 'center',
    lineHeight: hp('2.4%'),
    paddingHorizontal: wp('4%'),
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp('3.5%'),
    borderWidth: 1,
    width: '100%',
    marginTop: hp('0.5%'),
    paddingVertical: hp('1.8%'),
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: wp('4.5%'),
    fontFamily: Fonts.bold,
  },
  statLabel: {
    fontSize: wp('2.6%'),
    fontFamily: Fonts.regular,
  },
  statDivider: {
    width: 1,
    height: hp('4%'),
  },
  accuracyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.6%'),
    borderRadius: 20,
    borderWidth: 1,
  },
  accuracyText: {
    fontSize: wp('2.8%'),
    fontFamily: Fonts.regular,
  },
  actions: {
    paddingHorizontal: wp('5%'),
    gap: hp('1%'),
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('2%'),
    paddingVertical: hp('1.3%'),
    borderRadius: wp('3%'),
    borderWidth: 1,
  },
  refreshText: {
    fontSize: wp('3.3%'),
    fontFamily: Fonts.medium,
  },
  doneBtn: {
    paddingVertical: hp('1.6%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: wp('3.8%'),
    fontFamily: Fonts.bold,
  },
});

export default GeofenceMapModal;
