import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C, D, WD, dLabel, dayDiff, mdShort, todayStr } from '../constants';
import { catOf, useApp } from '../store';
import { CheckBox } from './ui';

export default function EventRow({ e, withDate }) {
  const { data, update, openSheet, toast, theme } = useApp();
  const cat = catOf(data, e.cat);
  const far = dayDiff(e.date, todayStr()) > 7;
  const d = D(e.date);
  return (
    <Pressable style={st.row} onPress={() => openSheet('event', { id: e.id })}>
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
  );
}

const st = StyleSheet.create({
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
