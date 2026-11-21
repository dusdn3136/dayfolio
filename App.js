import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, KeyboardAvoidingView, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, View, Keyboard } from 'react-native';
import { FONTS, Text } from './src/components/T';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/store';
import { C, todayStr } from './src/constants';
import CalendarScreen from './src/screens/CalendarScreen';
import JournalScreen from './src/screens/JournalScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DaySheet from './src/sheets/DaySheet';
import EventForm from './src/sheets/EventForm';
import { CategorySheet, MemoSheet, MonthPickerSheet, ThemeSheet } from './src/sheets/MiscSheets';
import { IconBook, IconCalendar, IconChevron, IconGear, IconPlus } from './src/components/Icons';

export default function App() {
  const [fontsLoaded, fontError] = useFonts(FONTS);
  // 글꼴을 불러오는 짧은 순간은 빈 화면, 실패하면 기본 글꼴로라도 실행
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Main />
      </AppProvider>
    </SafeAreaProvider>
  );
}

function Main() {
  const { data, theme, openSheet, sheets, toastMsg } = useApp();
  const now = new Date();
  const [tab, setTab] = useState('cal');
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });

  if (!data) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  const move = (n) => setYm(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const goToday = () => setYm({ y: now.getFullYear(), m: now.getMonth() });
  const showNav = tab !== 'set';
  const title = tab === 'set' ? '설정' : tab === 'jr' ? '일기장' : `${ym.m + 1}월`;

  return (
    <SafeAreaView style={st.root} edges={['top']}>
      <View style={st.header}>
        <Pressable
          disabled={!showNav}
          onPress={() => openSheet('month', { y: ym.y, m: ym.m, onPick: (y, m) => setYm({ y, m }) })}
          style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}
          accessibilityLabel="년도와 월 고르기"
        >
          <Text style={st.h1}>{title}</Text>
          {tab === 'cal' ? <Text style={st.yr}>{ym.y} ▾</Text> : null}
          {tab === 'jr' ? <Text style={st.yr}>{ym.y}년 {ym.m + 1}월 ▾</Text> : null}
        </Pressable>
        {showNav ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable style={st.tbtn} onPress={goToday}><Text style={st.tbtnTx}>오늘</Text></Pressable>
            <Pressable style={st.arw} onPress={() => move(-1)} hitSlop={6} accessibilityLabel="이전 달"><IconChevron dir="left" color={C.ink2} /></Pressable>
            <Pressable style={st.arw} onPress={() => move(1)} hitSlop={6} accessibilityLabel="다음 달"><IconChevron color={C.ink2} /></Pressable>
          </View>
        ) : null}
      </View>

      <View style={{ flex: 1 }}>
        {tab === 'cal' ? <CalendarScreen year={ym.y} month={ym.m} onMove={move} /> : null}
        {tab === 'jr' ? <JournalScreen year={ym.y} month={ym.m} /> : null}
        {tab === 'set' ? <SettingsScreen /> : null}
      </View>

      {tab === 'cal' ? (
        <Fab
          accent={theme.a}
          label="일정 추가"
          onPress={() => {
            const isThisMonth = ym.y === now.getFullYear() && ym.m === now.getMonth();
            const date = isThisMonth ? todayStr() : `${ym.y}-${String(ym.m + 1).padStart(2, '0')}-01`;
            openSheet('event', { date });
          }}
        />
      ) : null}
      <TabBar
        tab={tab}
        setTab={(k) => {
          // 이미 보고 있는 캘린더·일기장 탭을 한 번 더 누르면 이번 달로 돌아옴
          if (k === tab && k !== 'set') goToday();
          setTab(k);
        }}
      />

      <SheetHost />
      {toastMsg ? (
        <View pointerEvents="none" style={st.toastWrap}>
          <View style={st.toast}><Text style={st.toastTx}>{toastMsg}</Text></View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

// 오른쪽 아래 떠 있는 + 버튼
function Fab({ accent, onPress, label }) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      style={[st.fab, { backgroundColor: accent, shadowColor: accent, bottom: 64 + Math.max(insets.bottom, 10) + 16 }]}
    >
      <IconPlus color="#fff" />
    </Pressable>
  );
}

function TabBar({ tab, setTab }) {
  const insets = useSafeAreaInsets();
  const item = (k, label, Icon) => {
    const on = tab === k;
    return (
      <Pressable key={k} style={st.tabItem} onPress={() => setTab(k)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
        <Icon color={on ? C.ink : '#b0b0b5'} />
        <Text style={[st.tabTx, on && { color: C.ink }]}>{label}</Text>
      </Pressable>
    );
  };
  return (
    <View style={[st.tabbar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {item('cal', '캘린더', IconCalendar)}
      {item('jr', '일기장', IconBook)}
      {item('set', '설정', IconGear)}
    </View>
  );
}

const SHEETS = { day: DaySheet, event: EventForm, cats: CategorySheet, memo: MemoSheet, theme: ThemeSheet, month: MonthPickerSheet };
const HEIGHT = { day: '78%', event: '78%', memo: '78%' };

// 한 번에 맨 위 시트 하나만 보여주고, 닫으면 아래 시트로 돌아간다
function SheetHost() {
  const { sheets, closeSheet } = useApp();
  const insets = useSafeAreaInsets();
  const last = sheets.length - 1;
  const top = sheets[last];
  // 손잡이를 아래로 끌어내리면 닫힘
  const dragY = useRef(new Animated.Value(0)).current;
  const closeRef = useRef(closeSheet);
  closeRef.current = closeSheet;
  useEffect(() => { dragY.setValue(0); }, [sheets.length]);
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 4,
      onPanResponderMove: (_, g) => dragY.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 90 || g.vy > 1.2) {
          Animated.timing(dragY, { toValue: 800, duration: 160, useNativeDriver: true }).start(() => { closeRef.current(); dragY.setValue(0); });
        } else {
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;
  return (
    <Modal visible={!!top} transparent animationType="slide" onRequestClose={closeSheet} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={st.dim} onPress={closeSheet} accessibilityLabel="닫기" />
        <Animated.View style={[st.sheet, top && HEIGHT[top.type] && { height: HEIGHT[top.type] }, { paddingBottom: Math.max(insets.bottom, 16), transform: [{ translateY: dragY }] }]}>
          <View {...pan.panHandlers} style={st.grabArea} accessibilityLabel="아래로 끌어서 닫기">
            <View style={st.grab} />
          </View>
          {/* 빈 곳을 누르면 키보드가 내려가게 */}
          <Pressable style={{ flexShrink: 1, flexGrow: 1 }} onPress={Keyboard.dismiss} accessible={false}>
          {/* 아래 시트는 숨겨만 두고 살아있게 해서, 돌아왔을 때 입력하던 내용이 남아있게 한다 */}
          {sheets.map((sh, i) => {
            const Comp = SHEETS[sh.type];
            return (
              <ScrollView
                key={i}
                style={i === last ? { flexGrow: 0, flexShrink: 1 } : { display: 'none' }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
              >
                <Comp {...sh.props} />
              </ScrollView>
            );
          })}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 58 },
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -1, color: C.ink },
  yr: { fontSize: 13, color: C.sub, fontWeight: '600' },
  tbtn: { borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 11, marginRight: 6 },
  tbtnTx: { fontSize: 13, fontWeight: '600', color: C.ink },
  arw: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  tabbar: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: '#fff' },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 },
  tabTx: { fontSize: 10.5, fontWeight: '600', color: '#b0b0b5' },
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  dim: { flex: 1, backgroundColor: 'rgba(0,0,0,.3)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: '92%' },
  grabArea: { paddingTop: 10, paddingBottom: 14, alignItems: 'center' },
  grab: { width: 44, height: 5, borderRadius: 5, backgroundColor: '#d6d6db' },
  toastWrap: { position: 'absolute', left: 0, right: 0, bottom: 110, alignItems: 'center' },
  toast: { backgroundColor: 'rgba(30,30,30,.92)', borderRadius: 14, paddingVertical: 11, paddingHorizontal: 18 },
  toastTx: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
