import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { C, MOODS, dayDiff, range, todayStr, ymd } from '../constants';
import { catOf, useApp } from '../store';
import { IconMemoBadge } from './Icons';
import Mochi from './Mochi';

const LANE_TOP = 31;
const LANE_H = 17;
const MAX_LANES = 3;
const WEEK_H = 98;

export default function MonthGrid({ year, month, onPressDay }) {
  const { data, theme } = useApp();
  const today = todayStr();

  const weeks = useMemo(() => {
    const first = new Date(year, month, 1);
    const ws = new Date(year, month, 1 - first.getDay());
    const out = [];
    for (let w = 0; w < 6; w++) {
      const days = [...Array(7)].map((_, i) => new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + w * 7 + i));
      if (w === 5 && days[0].getMonth() !== month) break;
      const s0 = ymd(days[0]);
      const s6 = ymd(days[6]);
      // 이번 주에 걸치는 일정들을 줄(lane)에 배치
      const items = data.events
        .filter((e) => {
          const [a, b] = range(e);
          return a <= s6 && b >= s0;
        })
        .map((e) => {
          const [a, b] = range(e);
          const sc = Math.max(0, dayDiff(a, s0));
          const ec = Math.min(6, dayDiff(b, s0));
          return { e, sc, ec, len: ec - sc + 1, multi: a !== b, cl: a < s0, cr: b > s6 };
        })
        .sort(
          (x, y) =>
            y.multi - x.multi ||
            y.len - x.len ||
            x.sc - y.sc ||
            (y.e.kind === 'due') - (x.e.kind === 'due') ||
            (x.e.time || '99').localeCompare(y.e.time || '99')
        );
      const occ = [];
      const hidden = Array(7).fill(0);
      items.forEach((it) => {
        let lane = 0;
        for (;; lane++) {
          occ[lane] = occ[lane] || Array(7).fill(false);
          let ok = true;
          for (let c = it.sc; c <= it.ec; c++) if (occ[lane][c]) { ok = false; break; }
          if (ok) break;
        }
        for (let c = it.sc; c <= it.ec; c++) occ[lane][c] = true;
        it.lane = lane;
        if (lane >= MAX_LANES) for (let c = it.sc; c <= it.ec; c++) hidden[c]++;
      });
      out.push({ days, items: items.filter((it) => it.lane < MAX_LANES), hidden });
    }
    return out;
  }, [data.events, year, month]);

  return (
    <View style={{ paddingHorizontal: 8 }}>
      {weeks.map((wk, wi) => (
        <View key={wi} style={st.week}>
          <View style={st.cells}>
            {wk.days.map((d, i) => {
              const s = ymd(d);
              const dy = data.diary[s];
              const out = d.getMonth() !== month;
              const isToday = s === today;
              const memos = data.memos.filter((m) => m.date === s);
              const memoItems = memos.flatMap((m) => (m.type === 'check' ? m.items : []));
              const memoLeft = memoItems.some((x) => !x.ok);
              const photo = dy && dy.photos && dy.photos[0];
              return (
                <Pressable key={s} style={[st.cell, out && { opacity: 0.3 }]} onPress={() => onPressDay(s)} accessibilityLabel={`${d.getMonth() + 1}월 ${d.getDate()}일`}>
                  <View style={[st.num, isToday && { backgroundColor: theme.a }]}>
                    <Text style={[st.numTx, d.getDay() === 0 && { color: C.sun }, isToday && { color: '#fff', fontWeight: '800' }]}>{d.getDate()}</Text>
                  </View>
                  {dy && dy.mood != null ? <View style={st.mochi}><Mochi mood={dy.mood} size={19} /></View> : null}
                  {memos.length ? (
                    <View style={[st.memoMark, { right: dy && dy.mood != null ? 23 : 5 }]}>
                      <IconMemoBadge color={memoLeft ? theme.a : C.faint} done={memoItems.length > 0 && !memoLeft} />
                    </View>
                  ) : null}
                  {photo ? <Image source={{ uri: photo }} style={st.photo} /> : null}
                  {wk.hidden[i] ? <Text style={st.more}>+{wk.hidden[i]}</Text> : null}
                </Pressable>
              );
            })}
          </View>
          {wk.items.map((it) => {
            const col = catOf(data, it.e.cat).c;
            const left = `${(it.sc / 7) * 100}%`;
            const width = `${(it.len / 7) * 100}%`;
            const top = LANE_TOP + it.lane * LANE_H;
            if (it.multi) {
              return (
                <View key={it.e.id + '-' + wi} pointerEvents="none" style={[st.barWrap, { left, width, top }]}>
                  <View
                    style={[
                      st.multi,
                      { backgroundColor: col + '38', marginLeft: it.cl ? 0 : 2, marginRight: it.cr ? 0 : 2 },
                      !it.cl && { borderLeftWidth: 3, borderLeftColor: col },
                      it.cl && { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
                      it.cr && { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
                      it.e.done && { opacity: 0.45 },
                    ]}
                  >
                    <Text numberOfLines={1} ellipsizeMode="clip" style={st.multiTx}>{it.e.title}</Text>
                  </View>
                </View>
              );
            }
            return (
              <View key={it.e.id + '-' + wi} pointerEvents="none" style={[st.barWrap, st.single, { left, width, top }]}>
                <View style={[st.dot, { backgroundColor: col }, it.e.kind === 'due' && { borderRadius: 1.5, width: 6, height: 6 }]} />
                <Text numberOfLines={1} ellipsizeMode="clip" style={[st.singleTx, it.e.kind === 'due' && { fontWeight: '700' }, it.e.done && { color: C.faint, textDecorationLine: 'line-through' }]}>
                  {it.e.title}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  week: { height: WEEK_H, borderTopWidth: 1, borderTopColor: C.line },
  cells: { flexDirection: 'row', height: '100%' },
  cell: { flex: 1 },
  num: { position: 'absolute', top: 5, left: 4, minWidth: 22, height: 22, paddingHorizontal: 3, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  numTx: { fontSize: 13, fontWeight: '600', color: C.ink2 },
  photo: { position: 'absolute', bottom: 5, right: 4, width: 16, height: 16, borderRadius: 5 },
  mochi: { position: 'absolute', top: 3, right: 2 },
  memoMark: { position: 'absolute', top: 8 },
  moodBar: { position: 'absolute', left: 5, right: 5, bottom: 4, height: 3, borderRadius: 3 },
  more: { position: 'absolute', bottom: 9, left: 7, fontSize: 10, color: C.sub, fontWeight: '700' },
  barWrap: { position: 'absolute', height: 16 },
  multi: { flex: 1, borderRadius: 4, justifyContent: 'center', paddingHorizontal: 5 },
  multiTx: { fontSize: 10.5, fontWeight: '600', color: C.ink, letterSpacing: -0.5 },
  single: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingLeft: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  singleTx: { flex: 1, fontSize: 10.5, fontWeight: '500', color: C.ink2, letterSpacing: -0.6 },
});
