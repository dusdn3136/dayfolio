import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/T';
import Constants from 'expo-constants';
import { C } from '../constants';
import { useApp } from '../store';
import { IconChevron } from '../components/Icons';
import { DateField, Toggle } from '../components/ui';
import { DEFAULT_NOTIFY, ensurePermission } from '../notify';

// TODO: 출시 전에 개인정보처리방침 페이지 주소로 바꾸기
const PRIVACY_URL = 'https://dusdn3136.github.io/dayfolio/privacy.html';

export default function SettingsScreen() {
  const { data, update, theme, openSheet, reset, toast } = useApp();
  const notify = { ...DEFAULT_NOTIFY, ...(data.notify || {}) };
  const setNotify = (patch) => update((dr) => { dr.notify = { ...notify, ...patch }; });
  const toggleNotify = async (on) => {
    if (on && !(await ensurePermission())) {
      toast('폰 설정에서 Dayfolio 알림을 허용해주세요');
      return;
    }
    setNotify({ on });
  };
  const version = (Constants.expoConfig && Constants.expoConfig.version) || '1.0.0';
  const confirmReset = () =>
    Alert.alert('모든 데이터를 지울까요?', '일정, 일기, 사진, 메모가 전부 지워지고 되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      { text: '지우기', style: 'destructive', onPress: () => { reset(); toast('깨끗하게 지웠어요'); } },
    ]);
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 120 }}>
      <View style={st.group}>
        <Row label="테마 색" value={theme.n} dot={theme.a} onPress={() => openSheet('theme')} />
        <Row label="분류 관리" value={`${data.cats.length}개`} onPress={() => openSheet('cats')} sep />
      </View>
      <View style={st.group}>
        <View style={st.row}>
          <Text style={st.label}>매일 일정 알림</Text>
          <Toggle value={notify.on} onChange={toggleNotify} color={theme.a} />
        </View>
        {notify.on ? (
          <View style={[st.row, { borderTopWidth: 1, borderTopColor: C.sep }]}>
            <Text style={st.label}>알림 시간</Text>
            <DateField mode="time" value={notify.time} onChange={(t) => setNotify({ time: t })} />
          </View>
        ) : null}
      </View>
      <Text style={st.note}>일정이 있는 날만, 정한 시간에 그날 일정을 한 번에 알려드려요.</Text>
      <View style={st.group}>
        <Row label="개인정보처리방침" onPress={() => (PRIVACY_URL ? Linking.openURL(PRIVACY_URL) : toast('준비 중이에요'))} />
        <Row label="버전" value={version} sep noArrow />
      </View>
      <View style={st.group}>
        <Pressable style={st.row} onPress={confirmReset}>
          <Text style={[st.label, { color: C.sun }]}>모든 데이터 지우기</Text>
        </Pressable>
      </View>
      <Text style={st.foot}>모든 기록은 이 폰에만 저장돼요. 앱을 지우면 기록도 함께 사라져요.</Text>
    </ScrollView>
  );
}

function Row({ label, value, onPress, sep, noArrow, dot }) {
  return (
    <Pressable style={[st.row, sep && { borderTopWidth: 1, borderTopColor: C.sep }]} onPress={onPress} disabled={!onPress}>
      {dot ? <View style={[st.dot, { backgroundColor: dot }]} /> : null}
      <Text style={st.label}>{label}</Text>
      {value ? <Text style={st.value}>{value}</Text> : null}
      {!noArrow ? <IconChevron size={16} color={C.faint} /> : null}
    </Pressable>
  );
}

const st = StyleSheet.create({
  group: { backgroundColor: C.soft, borderRadius: 18, marginBottom: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, minHeight: 56 },
  dot: { width: 18, height: 18, borderRadius: 9 },
  label: { flex: 1, fontSize: 15.5, fontWeight: '600', color: C.ink },
  value: { fontSize: 14, color: C.sub, fontWeight: '500' },
  note: { fontSize: 12.5, color: C.sub, marginTop: -6, marginBottom: 14, marginHorizontal: 6 },
  foot: { fontSize: 12.5, color: C.sub, textAlign: 'center', marginTop: 6, lineHeight: 19 },
});
