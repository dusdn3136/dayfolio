import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';
import { Text, TextInput } from '../components/T';
import { C, D, dLabel, md, todayStr, uid, ymd } from '../constants';
import { useApp } from '../store';
import { Chips, DateField, SheetTop } from '../components/ui';
import { IconX } from '../components/Icons';

export default function EventForm({ id, date }) {
  const { data, update, closeSheet, openSheet, toast, theme } = useApp();
  const orig = id ? data.events.find((e) => e.id === id) : null;
  const base = date || todayStr();
  const [title, setTitle] = useState(orig ? orig.title : '');
  // 날짜 하나만 고르면 그날 일정, 끝나는 날까지 고르면 기간(기한, D-day 표시)
  const isRange = orig && orig.kind === 'due' && orig.start && orig.start < orig.date;
  const [startDate, setStartDate] = useState(orig ? (isRange ? orig.start : orig.date) : base);
  const [endDate, setEndDate] = useState(isRange ? orig.date : '');
  const [allDay, setAllDay] = useState(!(orig && orig.time));
  const [time, setTime] = useState((orig && orig.time) || '09:00');
  const [cat, setCat] = useState(orig ? orig.cat : data.cats[0] && data.cats[0].k);
  const [note, setNote] = useState((orig && orig.note) || '');

  if (id && !orig) return null;
  const cats = data.cats;
  const catValue = cats.find((c) => c.k === cat) ? cat : cats[0] && cats[0].k;

  const save = () => {
    const t = title.trim();
    if (!t) return toast('제목을 입력해주세요');
    let patch;
    if (endDate && endDate !== startDate) {
      if (endDate < startDate) return toast('끝나는 날이 시작일보다 빨라요');
      patch = { kind: 'due', start: startDate, date: endDate, time: '' };
    } else {
      patch = { kind: 'event', date: startDate, start: '', time: allDay ? '' : time };
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
    Alert.alert('이 일정을 삭제할까요?', '', [
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

  const ranged = !!endDate && endDate !== startDate;
  const addEnd = () => setEndDate(ymd(new Date(D(startDate).getTime() + 86400000)));
  const hint = ranged ? `${md(startDate)}부터 ${md(endDate)}까지 달력에 막대로 표시되고, 끝나는 날 기준 ${dLabel(endDate)}로 알려드려요.` : '';
  const sw = { trackColor: { true: theme.a, false: '#dcdce0' }, thumbColor: '#fff', ios_backgroundColor: '#dcdce0' };

  return (
    <View>
      <SheetTop left="취소" onLeft={closeSheet} title={id ? '일정 수정' : '새 일정'} right="저장" onRight={save} rightColor={theme.a} />
      <TextInput style={st.title} placeholder="제목을 입력하세요" placeholderTextColor={C.faint} value={title} onChangeText={setTitle} maxLength={40} autoFocus={!id} returnKeyType="done" />
      <View style={st.group}>
        <Row label={ranged ? '시작일' : '날짜'}><DateField value={startDate} onChange={setStartDate} /></Row>
        <Row label="끝나는 날" sep>
          {endDate ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <DateField value={endDate} onChange={setEndDate} />
              <Pressable onPress={() => setEndDate('')} hitSlop={10} style={st.clear} accessibilityLabel="끝나는 날 지우기">
                <IconX size={11} color={C.sub} />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={addEnd} hitSlop={8}>
              <Text style={[st.addEnd, { color: theme.a }]}>+ 기간으로 정하기</Text>
            </Pressable>
          )}
        </Row>
        {!ranged ? <Row label="하루 종일" sep><Switch value={allDay} onValueChange={setAllDay} {...sw} /></Row> : null}
        {!ranged && !allDay ? <Row label="시간" sep><DateField mode="time" value={time} onChange={setTime} /></Row> : null}
      </View>
      {hint ? <Text style={st.hint}>{hint}</Text> : null}

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
          <Text style={st.del}>이 일정 삭제</Text>
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
  addEnd: { fontSize: 15, fontWeight: '700' },
  clear: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#e6e6ea', alignItems: 'center', justifyContent: 'center' },
  del: { color: C.sun, fontSize: 15, fontWeight: '700', textAlign: 'center' },
});
