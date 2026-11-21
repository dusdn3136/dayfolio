import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { C, D, md, pad, ymd } from '../constants';
import { IconCheck } from './Icons';
import { useApp } from '../store';

export function Chips({ items, value, onChange }) {
  return (
    <View style={s.chips}>
      {items.map((it) => {
        const on = it.k === value;
        return (
          <Pressable key={it.k} onPress={() => onChange(it.k)} style={[s.chip, on && s.chipOn]}>
            {it.c ? <View style={[s.chipDot, { backgroundColor: it.c }]} /> : null}
            <Text style={[s.chipTx, on && { color: '#fff' }]}>{it.n}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CheckBox({ on, onPress, size = 24 }) {
  const { theme } = useApp();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      style={[s.chk, { width: size, height: size }, on && { backgroundColor: theme.a, borderColor: theme.a }]}
    >
      {on ? <IconCheck /> : null}
    </Pressable>
  );
}

const toTime = (str) => {
  const d = new Date();
  const [h, m] = (str || '09:00').split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
};

// 날짜/시간 고르기 (안드로이드는 팝업, 아이폰은 작은 버튼형)
export function DateField({ value, onChange, mode = 'date' }) {
  const { theme } = useApp();
  const dateObj = mode === 'date' ? (value ? D(value) : new Date()) : toTime(value);
  const fmt = (d) => (mode === 'date' ? ymd(d) : `${pad(d.getHours())}:${pad(d.getMinutes())}`);
  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={dateObj}
        mode={mode}
        display="compact"
        locale="ko-KR"
        accentColor={theme.a}
        onChange={(e, d) => d && onChange(fmt(d))}
      />
    );
  }
  const label = mode === 'date' ? (value ? md(value) : '선택') : value || '선택';
  return (
    <Pressable
      style={s.field}
      onPress={() =>
        DateTimePickerAndroid.open({
          value: dateObj,
          mode,
          is24Hour: true,
          onChange: (e, d) => {
            if (e.type === 'set' && d) onChange(fmt(d));
          },
        })
      }
    >
      <Text style={s.fieldTx}>{label}</Text>
    </Pressable>
  );
}

export function SheetTop({ left, title, right, onLeft, onRight, rightColor }) {
  return (
    <View style={s.top}>
      <Pressable onPress={onLeft} hitSlop={10} style={{ minWidth: 44 }}>
        <Text style={s.topBtn}>{left}</Text>
      </Pressable>
      <Text style={s.topTitle}>{title}</Text>
      <Pressable onPress={onRight} hitSlop={10} style={{ minWidth: 44, alignItems: 'flex-end' }}>
        <Text style={[s.topBtn, { color: rightColor, fontWeight: '800' }]}>{right}</Text>
      </Pressable>
    </View>
  );
}

export function Empty({ children }) {
  return <Text style={s.empty}>{children}</Text>;
}

export const s = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, padding: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingVertical: 9, paddingHorizontal: 13, borderRadius: 12 },
  chipOn: { backgroundColor: C.ink },
  chipDot: { width: 9, height: 9, borderRadius: 5 },
  chipTx: { fontSize: 14, fontWeight: '600', color: C.ink },
  chk: { borderRadius: 8, borderWidth: 1.8, borderColor: C.faint, alignItems: 'center', justifyContent: 'center' },
  field: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  fieldTx: { fontSize: 15, fontWeight: '600', color: C.ink },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  topBtn: { fontSize: 16, color: C.sub, fontWeight: '500' },
  topTitle: { fontSize: 16, fontWeight: '700', color: C.ink },
  empty: { textAlign: 'center', color: C.sub, fontSize: 14, paddingVertical: 28, lineHeight: 22 },
});
