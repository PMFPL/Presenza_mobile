import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Fingerprint, Key, ScanFace } from 'lucide-react-native';
import { Colors, Fonts } from '../../utils/GlobalText';
import { biometricLogin } from '../../store/actions/authActions';

const BiometricPrompt = ({
  visible,
  onSuccess,
  onFailure,
  onPassword,
  deviceSecurity = 'NONE',
  biometricAvailable = false,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleBiometric = async () => {
    if (!biometricAvailable) {
      onFailure();
      return;
    }

    setLoading(true);
    const success = await dispatch(biometricLogin());
    setLoading(false);

    if (success) {
      onSuccess();
    } else {
      onFailure();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onFailure}
      statusBarTranslucent={true}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.overlay}>
          {/* Background Elements - Login page wala exact background */}
          <View style={styles.topShadow} />
          <View style={styles.bottomShadow} />
          <View style={styles.contentContainer}>
            <View style={styles.container}>
              <View style={styles.iconContainer}>
                {Platform.OS === 'ios' ? (
                  <ScanFace size={wp('10%')} color={Colors.primary} />
                ) : (
                  <Fingerprint size={wp('15%')} color={Colors.primary} />
                )}
              </View>

              <Text style={styles.title}>Quick Login</Text>
              <Text style={styles.subtitle}>
                {biometricAvailable
                  ? 'Use biometric to login quickly'
                  : 'Authenticate to continue'}
              </Text>

              {biometricAvailable && (
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometric}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.background} size="small" />
                  ) : (
                    <>
                      <Fingerprint size={wp('5%')} color={Colors.background} />
                      <Text style={styles.buttonText}>Use Biometric</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* <TouchableOpacity style={styles.passwordButton} onPress={onPassword}>
            <Key size={wp('4%')} color={Colors.textSecondary} />
            <Text style={styles.passwordText}>
              {deviceSecurity === 'PIN' ? 'Use PIN' : 'Use Password'}
            </Text>
          </TouchableOpacity> */}

              <TouchableOpacity onPress={onFailure}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#1C2541', // Login page ka exact background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Background shadows - exactly like login page
  topShadow: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#0b1425',
    opacity: 0.9,
    width: '90%',
    height: 310,
    borderBottomLeftRadius: 100,
  },
  bottomShadow: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    backgroundColor: '#FFD700',
    opacity: 0.5,
    width: 300,
    height: 300,
    borderTopRightRadius: '100%',
  },
  container: {
    width: wp('80%'),
    backgroundColor: Colors.surface,
    borderRadius: wp('10%'),
    padding: wp('6%'),
    alignItems: 'center',
    borderColor: Colors.border,
    zIndex: 10,

    // 👇 Shadow - right bottom
    shadowColor: Colors.shadow,
    shadowOffset: { width: wp('1%'), height: hp('1%') },
    shadowOpacity: 0.3,
    shadowRadius: wp('10%'),
    elevation: 8,

    // 👇 IMPORTANT: Yeh ensure karega shadow bahar dikhe
    overflow: 'visible', // Add this line
  },
  iconContainer: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  title: {
    fontSize: wp('6%'),
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
    marginBottom: hp('1%'),
  },
  subtitle: {
    fontSize: wp('3.5%'),
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: hp('3%'),
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
    borderRadius: wp('2%'),
    width: '100%',
    gap: wp('2%'),
    marginBottom: hp('1.5%'),
  },
  buttonText: {
    color: Colors.background,
    fontSize: wp('4%'),
    fontFamily: Fonts.medium,
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.5%'),
    gap: wp('2%'),
    marginBottom: hp('1%'),
  },
  passwordText: {
    color: Colors.textSecondary,
    fontSize: wp('3.5%'),
    fontFamily: Fonts.light,
  },
  cancelText: {
    color: Colors.error,
    fontSize: wp('3.5%'),
    fontFamily: Fonts.light,
  },
  overlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: '#1C2541',
},
contentContainer: {
  ...StyleSheet.absoluteFillObject,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
},
});

export default BiometricPrompt;
