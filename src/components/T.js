import React, { forwardRef } from 'react';
import { StyleSheet, Text as RNText, TextInput as RNTextInput } from 'react-native';

// 앱 전체 글꼴: 프리텐다드
// 안드로이드는 굵기(fontWeight)만으로 글꼴 파일을 못 고르기 때문에 굵기별 글꼴 이름으로 바꿔줌
export const FONTS = {
  'Pretendard-Regular': require('pretendard/dist/public/static/Pretendard-Regular.otf'),
  'Pretendard-Medium': require('pretendard/dist/public/static/Pretendard-Medium.otf'),
  'Pretendard-SemiBold': require('pretendard/dist/public/static/Pretendard-SemiBold.otf'),
  'Pretendard-Bold': require('pretendard/dist/public/static/Pretendard-Bold.otf'),
  'Pretendard-ExtraBold': require('pretendard/dist/public/static/Pretendard-ExtraBold.otf'),
};

const BY_WEIGHT = {
  normal: 'Pretendard-Regular',
  100: 'Pretendard-Regular',
  200: 'Pretendard-Regular',
  300: 'Pretendard-Regular',
  400: 'Pretendard-Regular',
  500: 'Pretendard-Medium',
  600: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  700: 'Pretendard-Bold',
  800: 'Pretendard-ExtraBold',
  900: 'Pretendard-ExtraBold',
};

function withFont(style) {
  const flat = StyleSheet.flatten(style) || {};
  if (flat.fontFamily) return style;
  return [style, { fontFamily: BY_WEIGHT[String(flat.fontWeight || 400)] || 'Pretendard-Regular', fontWeight: 'normal' }];
}

export const Text = forwardRef(function Text(props, ref) {
  return <RNText ref={ref} {...props} style={withFont(props.style)} />;
});

export const TextInput = forwardRef(function TextInput(props, ref) {
  return <RNTextInput ref={ref} {...props} style={withFont(props.style)} />;
});
