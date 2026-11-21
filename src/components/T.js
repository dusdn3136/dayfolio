import React, { forwardRef } from 'react';
import { StyleSheet, Text as RNText, TextInput as RNTextInput } from 'react-native';

// 앱 전체 글꼴: 스위트(SUITE, SIL 오픈 폰트 라이선스)
// 안드로이드는 굵기(fontWeight)만으로 글꼴 파일을 못 고르기 때문에 굵기별 글꼴 이름으로 바꿔줌
export const FONTS = {
  'SUITE-Regular': require('../../assets/fonts/SUITE-Regular.otf'),
  'SUITE-Medium': require('../../assets/fonts/SUITE-Medium.otf'),
  'SUITE-SemiBold': require('../../assets/fonts/SUITE-SemiBold.otf'),
  'SUITE-Bold': require('../../assets/fonts/SUITE-Bold.otf'),
  'SUITE-ExtraBold': require('../../assets/fonts/SUITE-ExtraBold.otf'),
};

const BY_WEIGHT = {
  normal: 'SUITE-Regular',
  100: 'SUITE-Regular',
  200: 'SUITE-Regular',
  300: 'SUITE-Regular',
  400: 'SUITE-Regular',
  500: 'SUITE-Medium',
  600: 'SUITE-SemiBold',
  bold: 'SUITE-Bold',
  700: 'SUITE-Bold',
  800: 'SUITE-ExtraBold',
  900: 'SUITE-ExtraBold',
};

function withFont(style) {
  const flat = StyleSheet.flatten(style) || {};
  if (flat.fontFamily) return style;
  return [style, { fontFamily: BY_WEIGHT[String(flat.fontWeight || 400)] || 'SUITE-Regular', fontWeight: 'normal' }];
}

export const Text = forwardRef(function Text(props, ref) {
  return <RNText ref={ref} {...props} style={withFont(props.style)} />;
});

export const TextInput = forwardRef(function TextInput(props, ref) {
  return <RNTextInput ref={ref} {...props} style={withFont(props.style)} />;
});
