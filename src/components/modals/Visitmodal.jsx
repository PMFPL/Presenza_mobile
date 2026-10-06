// src/components/modals/VisitModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { X, Building2, User, FileText, MapPin } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Fonts } from '../../utils/GlobalText';

const VISIT_PURPOSES = [
  { label: 'Sales Meeting', value: 'SALES_MEETING' },
  { label: 'Follow Up', value: 'FOLLOW_UP' },
  { label: 'Demo', value: 'DEMO' },
  { label: 'Collections', value: 'COLLECTIONS' },
  { label: 'Other', value: 'OTHER' },
];

const VisitModal = ({ visible, onClose, onConfirm, loading }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const C = theme.colors;

  const [companyName, setCompanyName] = useState('');
  const [personName, setPersonName] = useState('');
  const [location, setLocation] = useState('');
  const [purpose, setPurpose] = useState('SALES_MEETING');
  const [remarks, setRemarks] = useState('');

  const handleConfirm = () => {
    if (!companyName.trim()) {
      alert('Please enter company / firm name');
      return;
    }
    if (!personName.trim()) {
      alert('Please enter contact person name');
      return;
    }
    onConfirm({ companyName, personName, location, purpose, remarks });
  };

  const handleClose = () => {
    setCompanyName('');
    setPersonName('');
    setLocation('');
    setPurpose('SALES_MEETING');
    setRemarks('');
    onClose();
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: C.inputBg,
      borderColor: C.inputBorder,
      color: C.textPrimary,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}>
      <View style={[styles.overlay, { backgroundColor: C.overlayBg }]}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: C.surfaceSolid, borderColor: C.border },
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: C.textPrimary }]}>
                Log Visit
              </Text>
              <Text style={[styles.subtitle, { color: C.textSecondary }]}>
                Register your client / firm visit
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <X size={wp('5.5%')} color={C.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Company Name */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <Building2 size={wp('3.5%')} color={C.textSecondary} />
                <Text style={[styles.label, { color: C.textSecondary }]}>
                  Company / Firm Name *
                </Text>
              </View>
              <TextInput
                style={inputStyle}
                placeholder="e.g. Acme Corp, Paul Merchants"
                placeholderTextColor={C.textSecondary}
                value={companyName}
                onChangeText={setCompanyName}
                editable={!loading}
              />
            </View>

            {/* Contact Person */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <User size={wp('3.5%')} color={C.textSecondary} />
                <Text style={[styles.label, { color: C.textSecondary }]}>
                  Contact Person *
                </Text>
              </View>
              <TextInput
                style={inputStyle}
                placeholder="Person you are meeting"
                placeholderTextColor={C.textSecondary}
                value={personName}
                onChangeText={setPersonName}
                editable={!loading}
              />
            </View>

            {/* Location */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <MapPin size={wp('3.5%')} color={C.textSecondary} />
                <Text style={[styles.label, { color: C.textSecondary }]}>
                  Location
                </Text>
              </View>
              <TextInput
                style={inputStyle}
                placeholder="City, area or address"
                placeholderTextColor={C.textSecondary}
                value={location}
                onChangeText={setLocation}
                editable={!loading}
              />
            </View>

            {/* Purpose */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <FileText size={wp('3.5%')} color={C.textSecondary} />
                <Text style={[styles.label, { color: C.textSecondary }]}>
                  Purpose of Visit
                </Text>
              </View>
              <View style={styles.purposeGrid}>
                {VISIT_PURPOSES.map(p => (
                  <TouchableOpacity
                    key={p.value}
                    style={[
                      styles.purposeChip,
                      {
                        borderColor:
                          purpose === p.value ? C.primary : C.border,
                        backgroundColor:
                          purpose === p.value
                            ? C.primary + '20'
                            : 'transparent',
                      },
                    ]}
                    onPress={() => setPurpose(p.value)}
                    disabled={loading}>
                    <Text
                      style={[
                        styles.purposeChipText,
                        {
                          color:
                            purpose === p.value ? C.primary : C.textPrimary,
                        },
                      ]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Remarks */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: C.textSecondary }]}>
                Additional Remarks
              </Text>
              <TextInput
                style={[inputStyle, styles.remarksInput]}
                placeholder="Any notes about this visit..."
                placeholderTextColor={C.textSecondary}
                value={remarks}
                onChangeText={setRemarks}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: C.border }]}
              onPress={handleClose}
              disabled={loading}>
              <Text style={[styles.cancelBtnText, { color: C.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: C.primary },
                loading && { opacity: 0.5 },
              ]}
              onPress={handleConfirm}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color={C.textDark} />
              ) : (
                <Text style={[styles.confirmBtnText, { color: C.textDark }]}>
                  Log Visit
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: wp('5%'),
    maxHeight: hp('90%'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp('2.5%'),
  },
  title: {
    fontSize: wp('5%'),
    fontFamily: Fonts.bold,
  },
  subtitle: {
    fontSize: wp('3%'),
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  fieldGroup: {
    marginBottom: hp('2%'),
  },
  fieldLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
    marginBottom: hp('0.8%'),
  },
  label: {
    fontSize: wp('3.2%'),
    fontFamily: Fonts.medium,
  },
  input: {
    borderWidth: 1,
    borderRadius: wp('3%'),
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('1.2%'),
    fontFamily: Fonts.regular,
    fontSize: wp('3.5%'),
  },
  remarksInput: {
    minHeight: hp('9%'),
  },
  purposeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp('2%'),
  },
  purposeChip: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.8%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
  },
  purposeChipText: {
    fontSize: wp('3%'),
    fontFamily: Fonts.regular,
  },
  buttons: {
    flexDirection: 'row',
    gap: wp('3%'),
    marginTop: hp('2.5%'),
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: wp('3.5%'),
    fontFamily: Fonts.medium,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: wp('3.5%'),
    fontFamily: Fonts.medium,
  },
});

export default VisitModal;