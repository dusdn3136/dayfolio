import React, { useRef, useState } from 'react';
import { Alert, Image, Modal, PanResponder, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '../components/T';
import * as ImagePicker from 'expo-image-picker';
import { File, Directory, Paths } from 'expo-file-system';
import { C, MOODS, WD, D, dayDiff, hasDiary, onDay, todayStr, uid } from '../constants';
import { holidayOf } from '../holidays';
import { useApp } from '../store';
import EventRow from '../components/EventRow';
import Mochi from '../components/Mochi';
import { CheckBox, Empty } from '../components/ui';
import { IconChecklist, IconChevron, IconLines, IconPen, IconPhoto, IconPlus, IconX } from '../components/Icons';

// 사진을 앱 전용 폴더에 복사해서 보관
function keepPhoto(uri) {
  try {
    const dir = new Directory(Paths.document, 'photos');
    if (!dir.exists) dir.create();
    const dest = new File(dir, `${uid()}.jpg`);
    new File(uri).copy(dest);
    return dest.uri;
  } catch (e) {
    return uri;
  }
}

const TAB_ORDER = ['ev', 'mm', 'dy'];

export default function DaySheet({ date, tab = 'ev' }) {
  const { setSheetProps, openSheet, closeSheet } = useApp();
  const n = dayDiff(date, todayStr());
  // 좌우로 밀어서 일정 · 메모 · 일기 전환
  const tabRef = useRef(tab);
  tabRef.current = tab;
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) < 60) return;
        const i = TAB_ORDER.indexOf(tabRef.current);
        const next = g.dx < 0 ? Math.min(i + 1, TAB_ORDER.length - 1) : Math.max(i - 1, 0);
        if (next !== i) setSheetProps({ tab: TAB_ORDER[next] });
      },
    })
  ).current;
  const d = D(date);
  const holi = holidayOf(date);
  return (
    <View>
      <View style={st.head}>
        <View style={{ flexShrink: 1 }}>
          <Text style={st.h3}>{`${d.getMonth() + 1}월 ${d.getDate()}일 ${WD[d.getDay()]}요일`}</Text>
          {holi ? <Text style={{ color: C.sun, fontSize: 13, fontWeight: '600', marginTop: 2 }}>{holi}</Text> : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={st.sub}>{n === 0 ? '오늘' : n > 0 ? `${n}일 후` : `${-n}일 전`}</Text>
          <Pressable onPress={closeSheet} hitSlop={10} style={st.close} accessibilityLabel="닫기">
            <IconX size={14} color={C.ink2} />
          </Pressable>
        </View>
      </View>
      <Tabs tab={tab} date={date} onChange={(t) => setSheetProps({ tab: t })} />
      <View {...pan.panHandlers} style={{ minHeight: 360 }}>
        {tab === 'ev' ? <EventsTab date={date} onAdd={() => openSheet('event', { date })} /> : null}
        {tab === 'mm' ? <MemosTab date={date} /> : null}
        {tab === 'dy' ? <DiaryTab date={date} /> : null}
      </View>
    </View>
  );
}

function Tabs({ tab, date, onChange }) {
  const { data } = useApp();
  const mc = data.memos.filter((m) => m.date === date).length;
  const items = [['ev', '일정'], ['mm', mc ? `메모 ${mc}` : '메모'], ['dy', '일기']];
  return (
    <View style={st.tabs}>
      {items.map(([k, l]) => (
        <Pressable key={k} onPress={() => onChange(k)} style={[st.tab, tab === k && st.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: tab === k }}>
          <Text style={[st.tabTx, tab === k && { color: C.ink, fontWeight: '800' }]}>{l}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function EventsTab({ date, onAdd }) {
  const { data, theme } = useApp();
  const evs = data.events
    .filter((e) => onDay(e, date))
    .sort((a, b) => ((a.kind === 'due' ? '0' : '1') + (a.time || '99')).localeCompare((b.kind === 'due' ? '0' : '1') + (b.time || '99')));
  return (
    <View>
      {evs.length ? evs.map((e) => <EventRow key={e.id} e={e} />) : <Empty>일정이 없어요</Empty>}
      <Pressable style={st.addRow} onPress={onAdd}>
        <IconPlus size={20} color={theme.a} />
        <Text style={[st.addTx, { color: theme.a }]}>일정 추가</Text>
      </Pressable>
    </View>
  );
}

function MemosTab({ date }) {
  const { data, update, openSheet, toast, theme } = useApp();
  const [drafts, setDrafts] = useState({});
  const ms = data.memos.filter((m) => m.date === date);
  const newMemo = (type) => {
    const id = uid();
    update((dr) => dr.memos.push({ id, type, title: '', date, items: [], text: '', updated: Date.now() }));
    openSheet('memo', { id, isNew: true });
  };
  return (
    <View>
      {!ms.length ? <Empty>{'이 날짜에 메모가 없어요.\n여행 짐, 준비물을 적어두고 체크해보세요.'}</Empty> : null}
      {ms.map((m) => {
        const done = m.type === 'check' ? m.items.filter((x) => x.ok).length : 0;
        return (
          <View key={m.id} style={st.memo}>
            <Pressable style={st.memoHd} onPress={() => openSheet('memo', { id: m.id })}>
              <Text numberOfLines={1} style={st.memoTitle}>{m.title || '제목 없음'}</Text>
              {m.type === 'check' ? <Text style={st.memoCnt}>{done}/{m.items.length}</Text> : null}
              <IconChevron size={16} color={C.faint} />
            </Pressable>
            {m.type === 'text' ? (
              <Pressable onPress={() => openSheet('memo', { id: m.id })}>
                <Text style={st.memoText}>{m.text || '내용 없음'}</Text>
              </Pressable>
            ) : (
              <>
                {m.items.map((x, i) => {
                  const toggle = () => {
                    update((dr) => {
                      const mm = dr.memos.find((v) => v.id === m.id);
                      mm.items[i].ok = !mm.items[i].ok;
                      mm.updated = Date.now();
                    });
                    if (!x.ok && m.items.every((y, j) => j === i || y.ok)) toast('다 챙겼어요!');
                  };
                  return (
                    <Pressable key={i} style={st.citem} onPress={toggle}>
                      <CheckBox on={x.ok} onPress={toggle} />
                      <Text style={[st.citemTx, x.ok && st.done]}>{x.t}</Text>
                    </Pressable>
                  );
                })}
                <View style={st.citem}>
                  <View style={st.addBox}><Text style={{ color: C.sub }}>+</Text></View>
                  <TextInput
                    style={st.addInput}
                    placeholder="항목 추가"
                    placeholderTextColor={C.faint}
                    value={drafts[m.id] || ''}
                    onChangeText={(t) => setDrafts((s) => ({ ...s, [m.id]: t }))}
                    returnKeyType="done"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      const t = (drafts[m.id] || '').trim();
                      if (!t) return;
                      update((dr) => {
                        const mm = dr.memos.find((v) => v.id === m.id);
                        mm.items.push({ t, ok: false });
                        mm.updated = Date.now();
                      });
                      setDrafts((s) => ({ ...s, [m.id]: '' }));
                    }}
                  />
                </View>
              </>
            )}
          </View>
        );
      })}
      <View style={st.memoAdds}>
        <Pressable style={st.memoAdd} onPress={() => newMemo('check')}>
          <IconChecklist color={theme.a} />
          <Text style={st.memoAddTx}>체크리스트</Text>
        </Pressable>
        <Pressable style={st.memoAdd} onPress={() => newMemo('text')}>
          <IconLines color={C.ink2} />
          <Text style={st.memoAddTx}>메모</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DiaryTab({ date }) {
  const { data, update, toast, theme } = useApp();
  const v = data.diary[date];
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(null);
  const [viewer, setViewer] = useState(null);

  const startEdit = () => {
    setDraft({ mood: v && v.mood != null ? v.mood : null, text: (v && v.text) || '', photos: [...((v && v.photos) || [])] });
    setEdit(true);
  };
  const addPhotos = async () => {
    const left = 4 - draft.photos.length;
    if (left <= 0) return toast('사진은 하루 4장까지예요');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return toast('사진 접근을 허용해주세요');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: left, quality: 0.7 });
    if (res.canceled) return;
    const uris = res.assets.slice(0, left).map((a) => keepPhoto(a.uri));
    setDraft((s) => ({ ...s, photos: [...s.photos, ...uris] }));
  };
  const save = () => {
    if (draft.mood == null && !draft.text.trim() && !draft.photos.length) return toast('기분이나 내용을 남겨주세요');
    update((dr) => {
      dr.diary[date] = { mood: draft.mood, text: draft.text.trim(), photos: draft.photos };
    });
    setEdit(false);
    toast('일기를 저장했어요');
  };
  const remove = () =>
    Alert.alert('일기를 삭제할까요?', '사진과 글이 함께 지워져요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          update((dr) => { delete dr.diary[date]; });
          setEdit(false);
          toast('일기를 삭제했어요');
        },
      },
    ]);

  if (!edit) {
    if (!hasDiary(v)) {
      return (
        <View style={st.cta}>
          <Text style={{ color: C.sub, fontSize: 14 }}>{date > todayStr() ? '아직 오지 않은 날이에요' : '아직 기록이 없어요'}</Text>
          <Pressable style={st.ctaBtn} onPress={startEdit}><Text style={st.ctaBtnTx}>일기 쓰기</Text></Pressable>
        </View>
      );
    }
    const m = v.mood != null ? MOODS[v.mood] : null;
    const ps = v.photos || [];
    return (
      <View>
        <View style={st.dvTop}>
          {m ? (
            <View style={st.moodPill}><Mochi mood={v.mood} size={26} /><Text style={st.moodPillTx}>{m.n}</Text></View>
          ) : <View />}
          <Pressable style={st.editBtn} onPress={startEdit} hitSlop={8}><IconPen color={C.sub} /><Text style={st.editTx}>수정</Text></Pressable>
        </View>
        {ps.length ? (
          <View style={st.dvPhotos}>
            {ps.map((p, i) => (
              <Pressable key={i} onPress={() => setViewer(p)} style={ps.length === 1 ? st.dvPhotoOne : st.dvPhoto}>
                <Image source={{ uri: p }} style={{ width: '100%', height: '100%', borderRadius: 14 }} />
              </Pressable>
            ))}
          </View>
        ) : null}
        {v.text ? <Text style={st.dvText}>{v.text}</Text> : <Text style={{ color: C.faint }}>글 없이 기록한 날이에요</Text>}
        <Modal visible={!!viewer} transparent animationType="fade" onRequestClose={() => setViewer(null)}>
          <Pressable style={st.viewer} onPress={() => setViewer(null)}>
            {viewer ? <Image source={{ uri: viewer }} style={{ width: '100%', height: '80%' }} resizeMode="contain" /> : null}
          </Pressable>
        </Modal>
      </View>
    );
  }

  return (
    <View>
      <View style={st.moods}>
        {MOODS.map((m, i) => {
          const on = draft.mood === i;
          return (
            <Pressable key={i} style={st.moodBtn} onPress={() => setDraft((s) => ({ ...s, mood: s.mood === i ? null : i }))}>
              <View style={on && { transform: [{ scale: 1.1 }] }}><Mochi mood={i} size={50} full dim={!on} /></View>
              <Text style={[st.moodLb, on && { color: C.ink }]}>{m.n}</Text>
            </Pressable>
          );
        })}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 14 }}>
        {draft.photos.map((p, i) => (
          <View key={i} style={st.ph}>
            <Image source={{ uri: p }} style={{ width: '100%', height: '100%', borderRadius: 14 }} />
            <Pressable style={st.phRm} onPress={() => setDraft((s) => ({ ...s, photos: s.photos.filter((_, j) => j !== i) }))} hitSlop={8}>
              <IconX size={10} color="#fff" />
            </Pressable>
          </View>
        ))}
        {draft.photos.length < 4 ? (
          <Pressable style={st.phAdd} onPress={addPhotos}>
            <IconPhoto color={C.sub} />
            <Text style={{ fontSize: 11, color: C.sub, fontWeight: '600' }}>사진 {draft.photos.length}/4</Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <TextInput
        style={st.textarea}
        multiline
        placeholder="오늘 하루는 어땠나요?"
        placeholderTextColor={C.faint}
        value={draft.text}
        onChangeText={(t) => setDraft((s) => ({ ...s, text: t }))}
        textAlignVertical="top"
      />
      <View style={st.actions}>
        {hasDiary(v) ? <Pressable style={[st.btn, st.btnDel]} onPress={remove}><Text style={{ color: C.sun, fontWeight: '700' }}>삭제</Text></Pressable> : null}
        <Pressable style={[st.btn, st.btnSec]} onPress={() => setEdit(false)}><Text style={{ color: C.ink2, fontWeight: '700', fontSize: 15.5 }}>취소</Text></Pressable>
        <Pressable style={[st.btn, { flex: 1, backgroundColor: C.ink }]} onPress={save}><Text style={{ color: '#fff', fontWeight: '700', fontSize: 15.5 }}>저장</Text></Pressable>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' },
  h3: { fontSize: 21, fontWeight: '800', letterSpacing: -0.8, color: C.ink },
  sub: { fontSize: 13, color: C.sub, fontWeight: '600' },
  tabs: { flexDirection: 'row', backgroundColor: C.soft, borderRadius: 14, padding: 4, marginTop: 4, marginBottom: 8 },
  tab: { flex: 1, height: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  tabTx: { fontSize: 16, fontWeight: '700', color: C.sub },
  addRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, marginTop: 10, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: C.faint },
  addTx: { fontSize: 15, fontWeight: '700' },
  memo: { borderWidth: 1, borderColor: C.line, borderRadius: 16, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, marginTop: 12 },
  memoHd: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  memoTitle: { flex: 1, fontSize: 15.5, fontWeight: '800', color: C.ink },
  memoCnt: { fontSize: 12.5, color: C.sub, fontWeight: '700' },
  memoText: { fontSize: 14.5, lineHeight: 23, color: C.ink2, paddingBottom: 8 },
  citem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  citemTx: { flex: 1, fontSize: 15, color: C.ink },
  done: { color: C.faint, textDecorationLine: 'line-through' },
  addBox: { width: 24, height: 24, borderRadius: 8, borderWidth: 1.8, borderStyle: 'dashed', borderColor: C.faint, alignItems: 'center', justifyContent: 'center' },
  addInput: { flex: 1, fontSize: 15, color: C.ink, paddingVertical: 4 },
  memoAdds: { flexDirection: 'row', gap: 8, marginTop: 14 },
  memoAdd: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: C.faint, borderRadius: 14, paddingVertical: 13 },
  memoAddTx: { fontSize: 14, fontWeight: '700', color: C.ink2 },
  cta: { alignItems: 'center', gap: 10, paddingTop: 30, paddingBottom: 10 },
  ctaBtn: { backgroundColor: C.ink, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 22 },
  ctaBtnTx: { color: '#fff', fontSize: 15, fontWeight: '700' },
  dvTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 14 },
  moodPill: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 6, paddingLeft: 7, paddingRight: 12, borderRadius: 20, backgroundColor: C.soft },
  moodSq: { width: 20, height: 20, borderRadius: 7 },
  moodPillTx: { fontSize: 14, fontWeight: '700', color: C.ink },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editTx: { fontSize: 14, fontWeight: '600', color: C.sub },
  dvPhotos: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  dvPhoto: { width: '48.8%', aspectRatio: 1 },
  dvPhotoOne: { width: '100%', aspectRatio: 4 / 3 },
  dvText: { fontSize: 16, lineHeight: 29, color: C.ink2 },
  viewer: { flex: 1, backgroundColor: 'rgba(0,0,0,.92)', alignItems: 'center', justifyContent: 'center' },
  moods: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, marginBottom: 16 },
  moodBtn: { alignItems: 'center', gap: 6, width: 62, paddingTop: 6 },
  moodBig: { width: 38, height: 38, borderRadius: 14 },
  moodLb: { fontSize: 12, color: C.sub, fontWeight: '600' },
  ph: { width: 80, height: 80 },
  phRm: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,.55)', alignItems: 'center', justifyContent: 'center' },
  phAdd: { width: 80, height: 80, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.faint, alignItems: 'center', justifyContent: 'center', gap: 4 },
  textarea: { minHeight: 150, backgroundColor: C.soft, borderRadius: 14, padding: 14, fontSize: 15.5, lineHeight: 26, color: C.ink },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  btn: { paddingVertical: 15, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnSec: { backgroundColor: C.soft, width: 96 },
  btnDel: { borderWidth: 1, borderColor: C.line, width: 80 },
});
