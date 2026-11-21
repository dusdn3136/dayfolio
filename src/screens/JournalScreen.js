import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/T';
import { C, D, MOODS, WD, hasDiary, pad } from '../constants';
import { catOf, useApp } from '../store';
import { buildReport } from '../report';
import { IconInsight } from '../components/Icons';
import Mochi from '../components/Mochi';
import { Empty } from '../components/ui';

export default function JournalScreen({ year, month }) {
  const { data, theme, openSheet } = useApp();
  const pre = `${year}-${pad(month + 1)}`;
  const r = buildReport(data, year, month);
  const first = new Date(year, month, 1).getDay();
  const last = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...[...Array(last)].map((_, i) => data.diary[`${pre}-${pad(i + 1)}`])];
  const keys = Object.keys(data.diary).filter((k) => k.startsWith(pre) && hasDiary(data.diary[k])).sort().reverse();
  const rate = r.evTotal ? Math.round((r.evDone / r.evTotal) * 100) : 0;

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 120 }}>
      <View style={[st.rep, { backgroundColor: theme.s }]}>
        <Text style={[st.lab, { color: theme.a }]}>{month + 1}월 리포트</Text>
        <Text style={st.h2}>{r.moodDays < 3 ? '아직 리포트를 만들기엔\n기록이 조금 부족해요' : r.title}</Text>
        {r.moodDays >= 3 ? <Text style={st.sub}>{r.sub}</Text> : null}
        <View style={st.grid}>
          {cells.map((v, i) => (
            <View key={i} style={st.gridCellWrap}>
              <View style={[st.gridCell, { backgroundColor: v === null ? 'transparent' : v && v.mood != null ? MOODS[v.mood].c : 'rgba(255,255,255,.75)' }]} />
            </View>
          ))}
        </View>
        {r.moodDays < 3 ? (
          <View style={st.lock}>
            <Text style={st.lockTx}>기분을 3일 이상 남기면 이번 달 기분 흐름과 나를 기분 좋게 한 것들을 정리해드려요.</Text>
            <View style={st.lockBar}><View style={{ width: `${(r.moodDays / 3) * 100}%`, height: '100%', backgroundColor: theme.a }} /></View>
          </View>
        ) : null}
        <View style={st.nums}>
          {[[`${r.days}일`, '기록한 날'], [`${rate}%`, '지난 일정 완료'], [`${r.photos}장`, '남긴 사진']].map(([b, l], i) => (
            <View key={l} style={[st.num, i > 0 && { borderLeftWidth: 1, borderLeftColor: C.line }]}>
              <Text style={st.numB}>{b}</Text>
              <Text style={st.numL}>{l}</Text>
            </View>
          ))}
        </View>
        {r.moodDays >= 3
          ? r.ins.slice(0, 4).map((x) => {
              const col = x.cat ? catOf(data, x.cat).c : theme.a;
              return (
                <View key={x.k} style={st.ins}>
                  <View style={[st.insIc, { backgroundColor: x.cat ? col + '2e' : theme.s }]}><IconInsight name={x.ic} color={col} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.insK}>{x.k}</Text>
                    <Text style={st.insV}>{x.v}</Text>
                  </View>
                </View>
              );
            })
          : null}
      </View>

      {keys.length ? null : <Empty>이 달에 쓴 일기가 없어요</Empty>}
      {keys.map((k) => {
        const v = data.diary[k];
        const d = D(k);
        return (
          <Pressable key={k} style={st.entry} onPress={() => openSheet('day', { date: k, tab: 'dy' })}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={st.eTop}>
                {v.mood != null ? <Mochi mood={v.mood} size={24} /> : <View style={[st.eMood, { backgroundColor: C.line }]} />}
                <Text style={st.eDate}>{d.getMonth() + 1}월 {d.getDate()}일 <Text style={st.eWd}>{WD[d.getDay()]}요일</Text></Text>
              </View>
              {v.text ? <Text numberOfLines={2} style={st.eText}>{v.text}</Text> : null}
            </View>
            {v.photos && v.photos.length ? <Image source={{ uri: v.photos[0] }} style={st.eThumb} /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  rep: { borderRadius: 22, padding: 18, marginBottom: 10 },
  lab: { fontSize: 12.5, fontWeight: '800' },
  h2: { fontSize: 21, fontWeight: '800', letterSpacing: -0.8, marginTop: 6, marginBottom: 4, lineHeight: 28, color: C.ink },
  sub: { fontSize: 13.5, color: C.ink2, lineHeight: 21 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, marginHorizontal: -2 },
  gridCellWrap: { width: `${100 / 7}%`, padding: 2 },
  gridCell: { height: 20, borderRadius: 6 },
  lock: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginTop: 12 },
  lockTx: { fontSize: 13.5, color: C.ink2, lineHeight: 21 },
  lockBar: { height: 6, borderRadius: 6, backgroundColor: C.soft, marginTop: 10, overflow: 'hidden' },
  nums: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginTop: 14 },
  num: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  numB: { fontSize: 19, fontWeight: '800', color: C.ink },
  numL: { fontSize: 11.5, color: C.sub, fontWeight: '600', marginTop: 2 },
  ins: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 13, paddingHorizontal: 14, marginTop: 8 },
  insIc: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  insK: { fontSize: 12, color: C.sub, fontWeight: '700' },
  insV: { fontSize: 14.5, fontWeight: '600', marginTop: 1, lineHeight: 21, color: C.ink },
  entry: { flexDirection: 'row', gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  eTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  eMood: { width: 12, height: 12, borderRadius: 4 },
  eDate: { fontSize: 15, fontWeight: '700', color: C.ink },
  eWd: { fontSize: 12, color: C.sub, fontWeight: '500' },
  eText: { fontSize: 14.5, lineHeight: 23, color: C.ink2 },
  eThumb: { width: 64, height: 64, borderRadius: 12 },
});
