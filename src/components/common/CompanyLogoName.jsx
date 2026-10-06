import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import logo from '../../assets/logo.png';

function CompanyLogoName() {
  return (
    <View style={Styles.container}>
      {/* <Image style={Styles.imageContainer} source={logo} /> */}
      <Text style={Styles.companyTitle}>Presenza</Text>
    </View>
  );
}

export default CompanyLogoName;

const Styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  },
  imageContainer: {
    width: 50,
    height: 50,
    objectFit: 'cover',
  },
  companyTitle: {
    color: '#1e2f4f',
    fontSize: 36,
    fontFamily: 'Satisfy',
    letterSpacing: 0.8,
    fontWeight: '700',
    textShadowColor: '#2e9191',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
});
