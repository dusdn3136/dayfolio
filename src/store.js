import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CATS, THEMES } from './constants';

const KEY = 'dayfolio-data-v1';

export const emptyData = (theme = 'sky') => ({
  events: [],
  diary: {},
  memos: [],
  cats: DEFAULT_CATS.map((c) => ({ ...c })),
  theme,
});

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }) {
  const [data, setData] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);

  // 처음 실행 시 폰 저장소에서 불러오기
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((s) => setData(s ? { ...emptyData(), ...JSON.parse(s) } : emptyData()))
      .catch(() => setData(emptyData()));
  }, []);

  // 바뀔 때마다 저장
  useEffect(() => {
    if (data) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data]);

  // fn(draft) 안에서 draft를 직접 고치면 됨
  const update = useCallback((fn) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      fn(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => setData((prev) => emptyData(prev ? prev.theme : 'sky')), []);

  const openSheet = useCallback((type, props = {}) => setSheets((s) => [...s, { type, props }]), []);
  const closeSheet = useCallback(() => setSheets((s) => s.slice(0, -1)), []);
  const closeAllSheets = useCallback(() => setSheets([]), []);
  const setSheetProps = useCallback(
    (patch) => setSheets((s) => (s.length ? [...s.slice(0, -1), { ...s[s.length - 1], props: { ...s[s.length - 1].props, ...patch } }] : s)),
    []
  );

  const toast = useCallback((m) => {
    setToastMsg(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 1800);
  }, []);

  const theme = useMemo(() => THEMES.find((t) => t.k === (data && data.theme)) || THEMES[0], [data]);

  const value = { data, update, reset, theme, sheets, openSheet, closeSheet, closeAllSheets, setSheetProps, toast, toastMsg };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const catOf = (data, k) =>
  data.cats.find((c) => c.k === k) || data.cats[data.cats.length - 1] || { k: 'x', n: '분류 없음', c: '#a3a3ab' };
