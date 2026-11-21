import React, { useRef } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './T';
import { C, D, WD, dLabel, dayDiff, mdShort, todayStr } from '../constants';
import { catOf, useApp } from '../store';
import { CheckBox } from './ui';

export default function EventRow({ e, withDate }) {
  const { data, update, openSheet, toast, theme } = useApp();
  const cat = catOf(data, e.cat);
  const far = dayDiff(e.date, todayStr()) > 7;
  const d = D(e.date);

  // 왼쪽으로 밀면 삭제 버튼, 끝까지 밀면 바로 삭제
  const OPEN = -76;
  const x = useRef(new Animated.Value(0)).current;
  const opened = useRef(false);
  const removeRef = useRef(null);
  removeRef.current = () => {
    update((dr) => { dr.events = dr.events.filter((v) => v.id !== e.id); });
    toast('삭제했어요');
  };
  const snap = (to) => {
    opened.current = to !== 0;
    Animated.spring(x, { toValue: to, useNativeDriver: true, bounciness: 0 }).start();
  };
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.8 && (g.dx < 0 || opened.current),
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        const base = opened.current ? OPEN : 0;
        x.setValue(Math.min(0, base + g.dx));
      },
      onPanResponderRelease: (_, g) => {
        const pos = (opened.current ? OPEN : 0) + g.dx;
        if (pos < -200) {
          Animated.timing(x, { toValue: -500, duration: 160, useNativeDriver: true }).start(() => removeRef.current());
        } else if (pos < OPEN / 2) snap(OPEN);
        else snap(0);
      },
      onPanResponderTerminate: () => snap(opened.current ? OPEN : 0),
    })
  ).current;

  return (
    <View style={st.wrap}>
      <View style={st.delWrap}>
        <Pressable style={st.delBtn} onPress={() => removeRef.current()} accessibilityLabel="일정 삭제">
          <Text style={st.delTx}>삭제</Text>
        </Pressable>
      </View>
      <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX: x }], backgroundColor: '#fff' }}>
    <Pressable style={st.row} onPress={() => (opened.current ? snap(0) : openSheet('event', { id: e.id }))}>
      <View style={[st.dot, { backgroundColor: cat.c }, e.kind === 'due' && { borderRadius: 3 }]} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={[st.title, e.done && st.done]}>{e.title}</Text>
        <View style={st.meta}>
          {e.kind === 'due' ? (
            <>
              <Text style={[st.badge, far ? st.badgeFar : { color: theme.a, backgroundColor: theme.s }]}>{dLabel(e.date)}</Text>
              <Text style={st.metaTx}>{e.start ? `${mdShort(e.start)} ~ ${mdShort(e.date)}` : `${mdShort(e.date)} 마감`}</Text>
            </>
          ) : (
            <Text style={st.metaTx}>
              {withDate ? `${mdShort(e.date)} (${WD[d.getDay()]}) · ` : ''}
              {e.time || '하루 종일'}
            </Text>
          )}
          <Text style={st.metaTx}>· {cat.n}</Text>
        </View>
        {e.note ? <Text numberOfLines={1} style={st.note}>{e.note.split('\n')[0]}</Text> : null}
      </View>
      <CheckBox
        on={e.done}
        onPress={() => {
          update((dr) => {
            const x = dr.events.find((v) => v.id === e.id);
            if (x) x.done = !x.done;
          });
          if (!e.done) toast('완료했어요');
        }}
      />
    </Pressable>
      </Animated.View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  delWrap: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, alignItems: 'flex-end', justifyContent: 'center' },
  delBtn: { width: 56, height: 34, borderRadius: 10, backgroundColor: '#ff6b6b', alignItems: 'center', justifyContent: 'center' },
  delTx: { color: '#fff', fontSize: 13.5, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.line },
  dot: { width: 10, height: 10, borderRadius: 5 },
  title: { fontSize: 16, fontWeight: '600', color: C.ink },
  done: { textDecorationLine: 'line-through', color: C.faint },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' },
  metaTx: { fontSize: 12.5, color: C.sub },
  badge: { fontSize: 11, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, overflow: 'hidden' },
  badgeFar: { color: '#555', backgroundColor: C.soft },
  note: { fontSize: 12.5, color: C.sub, marginTop: 4 },
});
