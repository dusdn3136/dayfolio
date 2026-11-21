import React, { useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/T';
import { C, MOODS, dLabel, dayDiff, hasDiary, md, todayStr } from '../constants';
import { useApp } from '../store';
import MonthGrid from '../components/MonthGrid';
import { IconPen } from '../components/Icons';
import Mochi from '../components/Mochi';

export default function CalendarScreen({ year, month, onMove }) {
  const { data, theme, openSheet } = useApp();
  // 달력을 좌우로 밀어서 이전 달 / 다음 달
  const slide = useRef(new Animated.Value(0)).current;
  const moveRef = useRef(onMove);
  moveRef.current = onMove;
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 18 && Math.abs(g.dx) > Math.abs(g.dy) * 1.8,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => slide.setValue(g.dx * 0.6),
      onPanResponderRelease: (_, g) => {
        const W = Dimensions.get('window').width;
        if (Math.abs(g.dx) > 60 || Math.abs(g.vx) > 0.5) {
          const dir = g.dx < 0 ? 1 : -1;
          Animated.timing(slide, { toValue: -dir * W * 0.5, duration: 120, useNativeDriver: true }).start(() => {
            moveRef.current && moveRef.current(dir);
            slide.setValue(dir * W * 0.5);
            Animated.timing(slide, { toValue: 0, duration: 160, useNativeDriver: true }).start();
          });
        } else {
          Animated.spring(slide, { toValue: 0, useNativeDriver: true }).start();
        }
      },
      onPanResponderTerminate: () => Animated.spring(slide, { toValue: 0, useNativeDriver: true }).start(),
    })
  ).current;
  const fade = slide.interpolate({ inputRange: [-300, 0, 300], outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
  const today = todayStr();
  const [viewH, setViewH] = useState(0);
  const [topH, setTopH] = useState(0);
  // 달력이 화면 아래 끝까지 딱 차게 (아래 '다가오는 기한'이 어중간하게 걸쳐 보이지 않도록)
  const gridH = viewH && topH ? viewH - topH - 2 : 0;
  const v = data.diary[today];
  const m = v && v.mood != null ? MOODS[v.mood] : null;
  const dues = data.events.filter((e) => e.kind === 'due' && !e.done && e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const todos = data.memos
    .filter((x) => x.type === 'check' && x.date >= today && x.items.some((i) => !i.ok))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }} onLayout={(e) => setViewH(e.nativeEvent.layout.height)}>
      <View onLayout={(e) => setTopH(e.nativeEvent.layout.height)}>
      <Pressable style={[st.todayCard, { backgroundColor: theme.s }]} onPress={() => openSheet('day', { date: today, tab: 'dy' })}>
        <View style={st.todayIc}>{m ? <Mochi mood={v.mood} size={32} /> : <IconPen color={theme.a} />}</View>
        <View style={{ flex: 1 }}>
          <Text style={[st.todayL, { color: theme.a }]}>오늘의 기록{m ? ` · ${m.n}` : ''}</Text>
          <Text numberOfLines={1} style={st.todayS}>
            {hasDiary(v) ? (v.text || '사진으로 남긴 하루').split('\n')[0] : '오늘 하루는 어땠나요? 한 줄 남겨보세요'}
          </Text>
        </View>
      </Pressable>

      {dues.length || todos.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: -10, marginBottom: 14 }} contentContainerStyle={st.chipsRow}>
          {dues.map((e) => (
            <Pressable key={e.id} style={st.chip} onPress={() => openSheet('event', { id: e.id })}>
              <Text style={[st.chipD, { color: dayDiff(e.date, today) > 7 ? C.sub : theme.a }]}>{dLabel(e.date)}</Text>
              <Text numberOfLines={1} style={st.chipTx}>{e.title}</Text>
            </Pressable>
          ))}
          {todos.map((x) => (
            <Pressable key={x.id} style={st.chip} onPress={() => openSheet('day', { date: x.date, tab: 'mm' })}>
              <Text style={[st.chipD, { color: theme.a }]}>{x.items.filter((i) => !i.ok).length}개</Text>
              <Text numberOfLines={1} style={st.chipTx}>{x.title || '챙길 것'}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View style={st.dow}>
        {'일월화수목금토'.split('').map((w, i) => (
          <Text key={w} style={[st.dowTx, i === 0 && { color: C.sun }]}>{w}</Text>
        ))}
      </View>
      </View>
      <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX: slide }], opacity: fade }}>
        <MonthGrid year={year} month={month} height={gridH} onPressDay={(s) => openSheet('day', { date: s, tab: 'ev' })} />
      </Animated.View>

    </ScrollView>
  );
}

const st = StyleSheet.create({
  todayCard: { marginHorizontal: 14, marginTop: 4, marginBottom: 22, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  todayIc: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  todayL: { fontSize: 12, fontWeight: '700' },
  todayS: { fontSize: 14.5, fontWeight: '500', marginTop: 2, color: C.ink2 },
  dow: { flexDirection: 'row', paddingHorizontal: 8, paddingBottom: 8 },
  dowTx: { flex: 1, fontSize: 11, color: C.sub, fontWeight: '600', paddingLeft: 6 },
  chipsRow: { gap: 6, paddingHorizontal: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12, maxWidth: 200 },
  chipD: { fontSize: 12.5, fontWeight: '800' },
  chipTx: { fontSize: 12.5, fontWeight: '700', color: C.ink2, flexShrink: 1 },
});
