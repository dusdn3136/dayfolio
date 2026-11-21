import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './T';
import { C, todayStr, ymd } from '../constants';
import { holidayOf } from '../holidays';
import { IconChevron } from './Icons';

// 날짜 고르기 달력
// 한 번 누르면 그날 하루, 다른 날을 한 번 더 누르면 그 사이가 기간으로 잡힘
export default function RangeCalendar({ start, end, onChange, accent, soft }) {
  const init = start ? new Date(start.slice(0, 4), Number(start.slice(5, 7)) - 1, 1) : new Date();
  const [ym, setYm] = useState({ y: init.getFullYear(), m: init.getMonth() });
  const picking = useRef(false); // 첫 날을 고른 뒤 두 번째 날을 기다리는 중
  const today = todayStr();
  const hasRange = !!end && end !== start;

  const first = new Date(ym.y, ym.m, 1).getDay();
  const nDays = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells = [...Array(Math.ceil((first + nDays) / 7) * 7)].map((_, i) => {
    const day = i - first + 1;
    return day >= 1 && day <= nDays ? ymd(new Date(ym.y, ym.m, day)) : null;
  });
  const move = (n) => setYm(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });

  const tap = (s) => {
    if (picking.current && start && s !== start) {
      // 두 번째로 누른 날 → 기간
      const [a, b] = s < start ? [s, start] : [start, s];
      onChange(a, b);
      picking.current = false;
    } else {
      // 첫 번째로 누른 날 → 하루
      onChange(s, '');
      picking.current = true;
    }
  };

  return (
    <View style={st.wrap}>
      <View style={st.head}>
        <Pressable onPress={() => move(-1)} hitSlop={10} style={st.arw} accessibilityLabel="이전 달"><IconChevron dir="left" color={C.ink2} /></Pressable>
        <Text style={st.title}>{ym.y}년 {ym.m + 1}월</Text>
        <Pressable onPress={() => move(1)} hitSlop={10} style={st.arw} accessibilityLabel="다음 달"><IconChevron color={C.ink2} /></Pressable>
      </View>
      <View style={st.row}>
        {'일월화수목금토'.split('').map((w, i) => (
          <Text key={w} style={[st.dow, i === 0 && { color: C.sun }]}>{w}</Text>
        ))}
      </View>
      <View style={st.grid}>
        {cells.map((s, i) => {
          if (!s) return <View key={i} style={st.cell} />;
          const isStart = s === start;
          const isEnd = hasRange && s === end;
          const inside = hasRange && s > start && s < end;
          const edge = isStart || isEnd;
          const red = i % 7 === 0 || holidayOf(s);
          return (
            <Pressable key={i} style={st.cell} onPress={() => tap(s)} accessibilityLabel={s}>
              {hasRange && (inside || edge) ? (
                <View
                  style={[
                    st.band,
                    { backgroundColor: soft },
                    isStart && { left: '50%' },
                    isEnd && { right: '50%' },
                  ]}
                />
              ) : null}
              <View style={[st.dot, edge && { backgroundColor: accent }]}>
                <Text style={[st.num, red && { color: C.sun }, s === today && !edge && { color: accent, fontWeight: '800' }, edge && { color: '#fff', fontWeight: '800' }]}>
                  {Number(s.slice(8))}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Text style={st.hint}>{hasRange ? '다른 날을 누르면 다시 하루로 고를 수 있어요' : '다른 날을 한 번 더 누르면 기간으로 정해져요'}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { paddingHorizontal: 10, paddingBottom: 12, paddingTop: 4 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 6 },
  arw: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 16, fontWeight: '700', color: C.ink },
  row: { flexDirection: 'row' },
  dow: { flex: 1, textAlign: 'center', fontSize: 12, color: C.sub, fontWeight: '600', paddingVertical: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, height: 42, alignItems: 'center', justifyContent: 'center' },
  band: { position: 'absolute', left: 0, right: 0, top: 4, bottom: 4 },
  dot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  num: { fontSize: 15, fontWeight: '500', color: C.ink },
  hint: { fontSize: 12, color: C.sub, textAlign: 'center', marginTop: 6 },
});
