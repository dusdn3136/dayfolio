import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './T';
import { C, MOODS, dayDiff, range, todayStr, ymd } from '../constants';
import { catOf, useApp } from '../store';
import { IconMemoBadge } from './Icons';
import Mochi from './Mochi';
import { holidayOf } from '../holidays';

const LANE_TOP = 32;
const LANE_H = 19;
const MIN_WEEK_H = 92;

// height: 달력 전체에 쓸 수 있는 높이 (주 수로 나눠서 칸을 꽉 채움)
export default function MonthGrid({ year, month, onPressDay, height }) {
  const { data, theme } = useApp();
  const today = todayStr();

  const nWeeks = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    return Math.ceil((first + new Date(year, month + 1, 0).getDate()) / 7);
  }, [year, month]);
  const weekH = Math.max(MIN_WEEK_H, height ? Math.floor(height / nWeeks) : MIN_WEEK_H);
  // 칸 안에 들어가는 줄 수 (넘치면 마지막 줄은 "+n" 자리로 씀)
  const lanesAvail = Math.max(2, Math.floor((weekH - LANE_TOP - 4) / LANE_H));

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
        .concat(
          days
            .map((dd, c) => ({ c, name: holidayOf(ymd(dd)) }))
            .filter((h) => h.name)
            .map((h) => ({ e: { id: 'holi-' + h.c, title: h.name }, sc: h.c, ec: h.c, len: 1, holi: true }))
        )
        .sort(
          (x, y) =>
            (y.holi || false) - (x.holi || false) ||
            y.multi - x.multi ||
            y.len - x.len ||
            x.sc - y.sc ||
            (y.e.kind === 'due') - (x.e.kind === 'due') ||
            (x.e.time || '99').localeCompare(y.e.time || '99')
        );
      const occ = [];
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
      });
      // 날짜별로 넘치는지 보고, 넘치는 날만 마지막 줄을 "+n"으로 바꿈
      const perDay = Array(7).fill(0);
      items.forEach((it) => { for (let c = it.sc; c <= it.ec; c++) perDay[c] = Math.max(perDay[c], it.lane + 1); });
      const limit = perDay.map((n) => (n > lanesAvail ? lanesAvail - 1 : lanesAvail));
      const hidden = Array(7).fill(0);
      const shown = [];
      items.forEach((it) => {
        let ok = true;
        for (let c = it.sc; c <= it.ec; c++) if (it.lane >= limit[c]) ok = false;
        if (ok) shown.push(it);
        else for (let c = it.sc; c <= it.ec; c++) hidden[c]++;
      });
      out.push({ days, items: shown, hidden, limit });
    }
    return out;
  }, [data.events, year, month, lanesAvail]);

  return (
    <View style={{ paddingHorizontal: 8 }}>
      {weeks.map((wk, wi) => (
        <View key={wi} style={[st.week, { height: weekH }]}>
          <View style={st.cells}>
            {wk.days.map((d, i) => {
              const s = ymd(d);
              const dy = data.diary[s];
              const out = d.getMonth() !== month;
              const isToday = s === today;
              const memos = data.memos.filter((m) => m.date === s);
              const memoItems = memos.flatMap((m) => (m.type === 'check' ? m.items : []));
              const memoLeft = memoItems.some((x) => !x.ok);
              const hasMood = dy && dy.mood != null;
              return (
                <Pressable key={s} style={[st.cell, out && { opacity: 0.3 }]} onPress={() => onPressDay(s)} accessibilityLabel={`${d.getMonth() + 1}월 ${d.getDate()}일`}>
                  <View style={[st.num, isToday && { backgroundColor: theme.a }]}>
                    <Text style={[st.numTx, (d.getDay() === 0 || holidayOf(s)) && { color: C.sun }, isToday && { color: '#fff', fontWeight: '800' }]}>{d.getDate()}</Text>
                  </View>
                  {hasMood ? <View style={st.mochi}><Mochi mood={dy.mood} size={18} /></View> : null}
                  {memos.length && !hasMood ? (
                    <View style={st.memoMark}>
                      <IconMemoBadge color={memoLeft ? theme.a : C.faint} done={memoItems.length > 0 && !memoLeft} />
                    </View>
                  ) : null}
                  {wk.hidden[i] ? (
                    <Text style={[st.more, { top: LANE_TOP + wk.limit[i] * LANE_H }]}>+{wk.hidden[i]}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          {wk.items.map((it) => {
            if (it.holi) {
              return (
                <View key={it.e.id + '-' + wi} pointerEvents="none" style={[st.barWrap, { left: `${(it.sc / 7) * 100}%`, width: `${100 / 7}%`, top: LANE_TOP + it.lane * LANE_H, justifyContent: 'center', paddingLeft: 5 }]}>
                  <Text numberOfLines={1} ellipsizeMode="clip" style={st.holiTx}>{it.e.title}</Text>
                </View>
              );
            }
            const col = catOf(data, it.e.cat).c;
            const left = `${(it.sc / 7) * 100}%`;
            const width = `${(it.len / 7) * 100}%`;
            const top = LANE_TOP + it.lane * LANE_H;
            const due = it.e.kind === 'due';
            return (
              <View key={it.e.id + '-' + wi} pointerEvents="none" style={[st.barWrap, { left, width, top }]}>
                <View
                  style={[
                    st.pill,
                    { marginLeft: it.cl ? 0 : 2, marginRight: it.cr ? 0 : 2 },
                    due ? { backgroundColor: '#fff', borderWidth: 1, borderColor: col } : { backgroundColor: col + '2e' },
                    it.cl && { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
                    it.cr && { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
                    it.e.done && { opacity: 0.4 },
                  ]}
                >
                  <Text numberOfLines={1} ellipsizeMode="clip" style={[st.pillTx, due && { fontWeight: '700' }, it.e.done && { textDecorationLine: 'line-through' }]}>
                    {it.e.title}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  week: { borderTopWidth: 1, borderTopColor: C.line },
  cells: { flexDirection: 'row', height: '100%' },
  cell: { flex: 1 },
  num: { position: 'absolute', top: 5, left: 4, minWidth: 22, height: 22, paddingHorizontal: 3, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  numTx: { fontSize: 13, fontWeight: '600', color: C.ink2 },
  mochi: { position: 'absolute', top: 5, right: 2 },
  memoMark: { position: 'absolute', top: 9, right: 5 },
  more: { position: 'absolute', left: 6, fontSize: 10, lineHeight: 16, color: C.sub, fontWeight: '700' },
  barWrap: { position: 'absolute', height: 17 },
  pill: { flex: 1, borderRadius: 5, justifyContent: 'center', paddingHorizontal: 4, overflow: 'hidden' },
  holiTx: { fontSize: 10.5, fontWeight: '600', color: C.sun, letterSpacing: -0.5 },
  pillTx: { fontSize: 10.5, fontWeight: '600', color: C.ink, letterSpacing: -0.5 },
});
