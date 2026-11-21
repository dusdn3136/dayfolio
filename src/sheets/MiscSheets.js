import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { C, PALETTE, THEMES, md, uid } from '../constants';
import { useApp } from '../store';
import { CheckBox, DateField, SheetTop } from '../components/ui';
import { IconPlus, IconTrash, IconX } from '../components/Icons';

// ── 분류 편집 ─────────────────────────────
export function CategorySheet() {
  const { data, update, closeSheet, toast, theme } = useApp();
  const [openPal, setOpenPal] = useState(null);
  const done = () => {
    update((dr) => dr.cats.forEach((c) => { if (!c.n.trim()) c.n = '새 분류'; }));
    closeSheet();
  };
  const removeCat = (c) => {
    if (data.cats.length <= 1) return toast('분류는 1개 이상 있어야 해요');
    const n = data.events.filter((e) => e.cat === c.k).length;
    const go = () => {
      update((dr) => {
        dr.cats = dr.cats.filter((x) => x.k !== c.k);
        const to = dr.cats[0].k;
        dr.events.forEach((e) => { if (e.cat === c.k) e.cat = to; });
      });
      if (n) toast(`일정 ${n}개를 다른 분류로 옮겼어요`);
    };
    if (!n) return go();
    Alert.alert(`'${c.n}' 분류를 삭제할까요?`, `이 분류의 일정 ${n}개는 '${data.cats.find((x) => x.k !== c.k).n}'(으)로 옮겨져요.`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: go },
    ]);
  };
  const add = () => {
    if (data.cats.length >= 12) return toast('분류는 12개까지 만들 수 있어요');
    const used = data.cats.map((c) => c.c);
    const col = PALETTE.find((p) => !used.includes(p)) || PALETTE[data.cats.length % PALETTE.length];
    update((dr) => dr.cats.push({ k: 'c' + uid(), n: '', c: col }));
  };
  return (
    <View>
      <SheetTop left="" title="분류 편집" right="완료" onRight={done} rightColor={theme.a} />
      {data.cats.map((c, i) => {
        const n = data.events.filter((e) => e.cat === c.k).length;
        return (
          <View key={c.k}>
            <View style={st.crow}>
              <Pressable style={[st.swatch, { backgroundColor: c.c }]} onPress={() => setOpenPal(openPal === c.k ? null : c.k)} accessibilityLabel="색 바꾸기" />
              <TextInput
                style={st.cinput}
                value={c.n}
                placeholder="분류 이름"
                placeholderTextColor={C.faint}
                maxLength={10}
                autoFocus={!c.n}
                onChangeText={(t) => update((dr) => { dr.cats[i].n = t; })}
              />
              <Text style={st.ccnt}>{n}개</Text>
              <Pressable onPress={() => removeCat(c)} hitSlop={8} style={{ padding: 6 }}><IconX color={C.faint} /></Pressable>
            </View>
            {openPal === c.k ? (
              <View style={st.palette}>
                {PALETTE.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => { update((dr) => { dr.cats[i].c = p; }); setOpenPal(null); }}
                    style={[st.palDot, { backgroundColor: p }, p === c.c && { borderWidth: 3, borderColor: C.ink }]}
                  />
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
      <Pressable style={st.addRow} onPress={add}>
        <IconPlus size={20} color={theme.a} />
        <Text style={[st.addTx, { color: theme.a }]}>분류 추가</Text>
      </Pressable>
    </View>
  );
}

// ── 메모 · 체크리스트 편집 ─────────────────
export function MemoSheet({ id, isNew }) {
  const { data, update, closeSheet, toast, theme } = useApp();
  const [newItem, setNewItem] = useState('');
  const m = data.memos.find((x) => x.id === id);
  if (!m) return null;
  const patch = (fn) => update((dr) => { const x = dr.memos.find((v) => v.id === id); fn(x); x.updated = Date.now(); });
  const close = () => {
    if (!m.title.trim() && !(m.items || []).length && !(m.text || '').trim()) update((dr) => { dr.memos = dr.memos.filter((v) => v.id !== id); });
    closeSheet();
  };
  const remove = () =>
    Alert.alert('메모를 삭제할까요?', '', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => { update((dr) => { dr.memos = dr.memos.filter((v) => v.id !== id); }); closeSheet(); toast('메모를 삭제했어요'); } },
    ]);
  const done = m.type === 'check' ? m.items.filter((x) => x.ok).length : 0;
  const addItem = () => {
    const t = newItem.trim();
    if (!t) return;
    patch((x) => x.items.push({ t, ok: false }));
    setNewItem('');
  };
  return (
    <View>
      <View style={st.top}>
        <Pressable onPress={close} hitSlop={10}><Text style={[st.topOk, { color: theme.a }]}>완료</Text></Pressable>
        <Text style={st.topTitle}>{m.type === 'check' ? '체크리스트' : '메모'}</Text>
        <Pressable onPress={remove} hitSlop={10}><IconTrash color={C.sun} /></Pressable>
      </View>
      <TextInput
        style={st.mTitle}
        value={m.title}
        placeholder={m.type === 'check' ? '예) 제주 여행 짐' : '제목'}
        placeholderTextColor={C.faint}
        maxLength={40}
        autoFocus={!!isNew}
        onChangeText={(t) => patch((x) => { x.title = t; })}
      />
      <View style={st.dateRow}>
        <Text style={st.dateLb}>날짜</Text>
        <DateField value={m.date} onChange={(v) => { patch((x) => { x.date = v; }); toast(`${md(v)}로 옮겼어요`); }} />
      </View>
      {m.type === 'text' ? (
        <TextInput
          style={st.mText}
          multiline
          value={m.text}
          placeholder="자유롭게 적어보세요"
          placeholderTextColor={C.faint}
          textAlignVertical="top"
          onChangeText={(t) => patch((x) => { x.text = t; })}
        />
      ) : (
        <View>
          <View style={st.prog}>
            <View style={st.progBar}><View style={[st.progFill, { width: `${m.items.length ? (done / m.items.length) * 100 : 0}%`, backgroundColor: theme.a }]} /></View>
            <Text style={st.progTx}>{done}/{m.items.length} 완료</Text>
            {done ? (
              <Pressable onPress={() => { patch((x) => x.items.forEach((y) => { y.ok = false; })); toast('체크를 모두 풀었어요'); }} hitSlop={8}>
                <Text style={[st.progTx, { color: theme.a, fontWeight: '700' }]}>모두 해제</Text>
              </Pressable>
            ) : null}
          </View>
          {m.items.map((it, i) => (
            <View key={i} style={st.citem}>
              <CheckBox on={it.ok} onPress={() => patch((x) => { x.items[i].ok = !x.items[i].ok; })} />
              <TextInput
                style={[st.citemIn, it.ok && { color: C.faint, textDecorationLine: 'line-through' }]}
                value={it.t}
                maxLength={60}
                onChangeText={(t) => patch((x) => { x.items[i].t = t; })}
              />
              <Pressable onPress={() => patch((x) => x.items.splice(i, 1))} hitSlop={8} style={{ padding: 4 }}><IconX color={C.faint} /></Pressable>
            </View>
          ))}
          <View style={[st.citem, { borderBottomWidth: 0 }]}>
            <View style={st.addBox}><Text style={{ color: C.sub }}>+</Text></View>
            <TextInput
              style={st.citemIn}
              value={newItem}
              placeholder="항목 추가 후 엔터"
              placeholderTextColor={C.faint}
              maxLength={60}
              onChangeText={setNewItem}
              onSubmitEditing={addItem}
              blurOnSubmit={false}
              returnKeyType="done"
            />
          </View>
        </View>
      )}
      <Text style={st.meta}>{m.type === 'check' ? '체크하면 바로 저장돼요' : '입력하면 바로 저장돼요'}</Text>
    </View>
  );
}

// ── 테마 색 ──────────────────────────────
export function ThemeSheet() {
  const { data, update } = useApp();
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ fontSize: 21, fontWeight: '800', color: C.ink }}>테마 색</Text>
        <Text style={{ fontSize: 13, color: C.sub, fontWeight: '600' }}>앱 전체 포인트 색이 바뀌어요</Text>
      </View>
      <View style={st.themes}>
        {THEMES.map((t) => {
          const on = (data.theme || 'sky') === t.k;
          return (
            <Pressable key={t.k} style={[st.theme, on && { borderColor: C.ink }]} onPress={() => update((dr) => { dr.theme = t.k; })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[st.tDay, { backgroundColor: t.a }]}><Text style={st.tDayTx}>21</Text></View>
                <View style={[st.tBar, { backgroundColor: t.s }]} />
                <View style={[st.tDay, { backgroundColor: t.a }]}><Text style={[st.tDayTx, { fontSize: 18 }]}>+</Text></View>
              </View>
              <Text style={st.tName}>{t.n}{on ? '  ✓' : ''}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  crow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  swatch: { width: 30, height: 30, borderRadius: 10 },
  cinput: { flex: 1, fontSize: 16, fontWeight: '600', color: C.ink },
  ccnt: { fontSize: 12, color: C.sub, fontWeight: '600' },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 8, paddingBottom: 12, paddingLeft: 42 },
  palDot: { width: 28, height: 28, borderRadius: 14 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14 },
  addTx: { fontSize: 15, fontWeight: '700' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  topOk: { fontSize: 16, fontWeight: '800' },
  topTitle: { fontSize: 16, fontWeight: '700', color: C.ink },
  mTitle: { fontSize: 22, fontWeight: '800', color: C.ink, paddingTop: 4, paddingBottom: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.soft, borderRadius: 14, paddingVertical: 8, paddingLeft: 14, paddingRight: 8, marginBottom: 14 },
  dateLb: { fontSize: 14.5, fontWeight: '600', color: C.ink2 },
  mText: { minHeight: 260, fontSize: 16, lineHeight: 26, color: C.ink },
  prog: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  progBar: { flex: 1, height: 6, borderRadius: 6, backgroundColor: C.soft, overflow: 'hidden' },
  progFill: { height: '100%' },
  progTx: { fontSize: 13, color: C.sub, fontWeight: '600' },
  citem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.line },
  citemIn: { flex: 1, fontSize: 16, color: C.ink, paddingVertical: 2 },
  addBox: { width: 24, height: 24, borderRadius: 8, borderWidth: 1.8, borderStyle: 'dashed', borderColor: C.faint, alignItems: 'center', justifyContent: 'center' },
  meta: { fontSize: 12, color: C.faint, marginTop: 12, textAlign: 'center' },
  themes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  theme: { width: '48%', borderWidth: 1.5, borderColor: C.line, borderRadius: 18, padding: 14, gap: 10 },
  tDay: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tDayTx: { color: '#fff', fontSize: 13, fontWeight: '800' },
  tBar: { flex: 1, height: 26, borderRadius: 9 },
  tName: { fontSize: 14.5, fontWeight: '700', color: C.ink },
});
