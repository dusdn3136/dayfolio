import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { C, dLabel, md, todayStr, uid } from '../constants';
import { useApp } from '../store';
import { Chips, DateField, SheetTop } from '../components/ui';

export default function EventForm({ id, date }) {
  const { data, update, closeSheet, openSheet, toast, theme } = useApp();
  const orig = id ? data.events.find((e) => e.id === id) : null;
  const base = date || todayStr();
  const [title, setTitle] = useState(orig ? orig.title : '');
  const [kind, setKind] = useState(orig ? orig.kind : 'event');
  const [evDate, setEvDate] = useState(orig && orig.kind === 'event' ? orig.date : base);
  const [allDay, setAllDay] = useState(!(orig && orig.time));
  const [time, setTime] = useState((orig && orig.time) || '09:00');
  const [due, setDue] = useState(orig && orig.kind === 'due' ? orig.date : base);
  const [useRange, setUseRange] = useState(!!(orig && orig.start));
  const [start, setStart] = useState((orig && orig.start) || base);
  const [cat, setCat] = useState(orig ? orig.cat : data.cats[0] && data.cats[0].k);
  const [note, setNote] = useState((orig && orig.note) || '');

  if (id && !orig) return null;
  const cats = data.cats;
  const catValue = cats.find((c) => c.k === cat) ? cat : cats[0] && cats[0].k;

  const save = () => {
    const t = title.trim();
    if (!t) return toast('제목을 입력해주세요');
    let patch;
    if (kind === 'event') patch = { kind, date: evDate, time: allDay ? '' : time, start: '' };
    else {
      if (useRange && start > due) return toast('시작일이 마감일보다 늦어요');
      patch = { kind, date: due, start: useRange ? start : '', time: '' };
    }
    Object.assign(patch, { title: t, cat: catValue, note: note.trim() });
    update((dr) => {
      if (id) Object.assign(dr.events.find((e) => e.id === id), patch);
      else dr.events.push({ id: uid(), done: false, ...patch });
    });
    closeSheet();
    toast(id ? '수정했어요' : '추가했어요');
  };

  const remove = () =>
    Alert.alert(kind === 'event' ? '이 일정을 삭제할까요?' : '이 기한을 삭제할까요?', '', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          update((dr) => { dr.events = dr.events.filter((e) => e.id !== id); });
          closeSheet();
          toast('삭제했어요');
        },
      },
    ]);

  const hint = useRange && start < due ? `${md(start)}부터 ${md(due)}까지 달력에 막대로 표시되고, 마감 기준 ${dLabel(due)}로 알려드려요.` : `${md(due)} 마감 · 오늘 기준 ${dLabel(due)}예요.`;
  const sw = { trackColor: { true: theme.a, false: '#dcdce0' }, thumbColor: '#fff', ios_backgroundColor: '#dcdce0' };

  return (
    <View>
      <SheetTop left="취소" onLeft={closeSheet} title={id ? (kind === 'event' ? '일정 수정' : '기한 수정') : kind === 'event' ? '새 일정' : '새 기한'} right="저장" onRight={save} rightColor={theme.a} />
      <TextInput style={st.title} placeholder="제목을 입력하세요" placeholderTextColor={C.faint} value={title} onChangeText={setTitle} maxLength={40} autoFocus={!id} returnKeyType="done" />
      <View style={st.types}>
        {[['event', '일정', '정해진 날 · 시간에'], ['due', '기한', '마감일까지 D-day로']].map(([k, n, d]) => (
          <Pressable key={k} onPress={() => setKind(k)} style={[st.type, kind === k && { borderColor: theme.a, backgroundColor: theme.s }]}>
            <Text style={[st.typeN, kind === k && { color: theme.a }]}>{n}</Text>
            <Text style={st.typeD}>{d}</Text>
          </Pressable>
        ))}
      </View>

      {kind === 'event' ? (
        <View style={st.group}>
          <Row label="날짜"><DateField value={evDate} onChange={setEvDate} /></Row>
          <Row label="하루 종일" sep><Switch value={allDay} onValueChange={setAllDay} {...sw} /></Row>
          {!allDay ? <Row label="시간" sep><DateField mode="time" value={time} onChange={setTime} /></Row> : null}
        </View>
      ) : (
        <>
          <View style={st.group}>
            <Row label="마감일"><DateField value={due} onChange={setDue} /></Row>
            <Row label="기간으로 설정" sep><Switch value={useRange} onValueChange={setUseRange} {...sw} /></Row>
            {useRange ? <Row label="시작일" sep><DateField value={start} onChange={setStart} /></Row> : null}
          </View>
          <Text style={st.hint}>{hint}</Text>
        </>
      )}

      <View style={st.glabel}>
        <Text style={st.glabelTx}>분류</Text>
        <Pressable onPress={() => openSheet('cats')} hitSlop={8}><Text style={[st.glabelTx, { color: theme.a }]}>분류 편집</Text></Pressable>
      </View>
      <View style={st.group}><Chips items={cats} value={catValue} onChange={setCat} /></View>

      <View style={st.glabel}><Text style={st.glabelTx}>메모</Text></View>
      <View style={st.group}>
        <TextInput style={st.note} multiline placeholder="장소, 준비물 등 (선택)" placeholderTextColor={C.faint} value={note} onChangeText={setNote} textAlignVertical="top" />
      </View>
      {id ? (
        <Pressable onPress={remove} style={{ paddingVertical: 12 }}>
          <Text style={st.del}>{kind === 'event' ? '이 일정 삭제' : '이 기한 삭제'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Row({ label, children, sep }) {
  return (
    <View style={[st.row, sep && { borderTopWidth: 1, borderTopColor: C.sep }]}>
      <Text style={st.rowLb}>{label}</Text>
      {children}
    </View>
  );
}

const st = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.6, color: C.ink, paddingTop: 6, paddingBottom: 16 },
  types: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  type: { flex: 1, borderWidth: 1.5, borderColor: C.line, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14 },
  typeN: { fontSize: 15, fontWeight: '800', color: C.ink },
  typeD: { fontSize: 12, color: C.sub, marginTop: 2, fontWeight: '500' },
  group: { backgroundColor: C.soft, borderRadius: 16, marginBottom: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, minHeight: 52, gap: 12 },
  rowLb: { fontSize: 15.5, fontWeight: '600', color: C.ink },
  hint: { fontSize: 12.5, color: C.sub, marginTop: -12, marginBottom: 20, marginHorizontal: 6, lineHeight: 19 },
  glabel: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 4, marginBottom: 8 },
  glabelTx: { fontSize: 13, color: C.sub, fontWeight: '700' },
  note: { minHeight: 80, padding: 14, fontSize: 15, color: C.ink },
  del: { color: C.sun, fontSize: 15, fontWeight: '700', textAlign: 'center' },
});
