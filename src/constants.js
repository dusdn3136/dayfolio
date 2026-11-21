export const C = {
  bg: '#ffffff',
  ink: '#1c1c1e',
  ink2: '#3a3a3c',
  sub: '#8e8e93',
  faint: '#c7c7cc',
  line: '#efeff1',
  soft: '#f5f5f7',
  sep: '#e6e6ea',
  sun: '#ef4b4b',
};

export const MOODS = [
  { n: '최고', c: '#ffbf3c' },
  { n: '좋음', c: '#4fcf8e' },
  { n: '보통', c: '#c9c9ce' },
  { n: '우울', c: '#6f9ff5' },
  { n: '화남', c: '#ff6f6f' },
];
export const SCORE = [5, 4, 3, 2, 1];

export const PALETTE = ['#6aa8f0', '#f58fb0', '#4cc9a0', '#a993f2', '#f5bf55', '#ff9a76', '#5cc6d6', '#a3a3ab'];

export const THEMES = [
  { k: 'sky', n: '하늘', a: '#4fa8e8', s: '#eaf5fd' },
  { k: 'mint', n: '민트', a: '#34c3a0', s: '#e5f8f2' },
  { k: 'lav', n: '라벤더', a: '#9a8af0', s: '#f1effe' },
  { k: 'pink', n: '벚꽃', a: '#f48ba6', s: '#fdedf2' },
  { k: 'butter', n: '버터', a: '#f2b84b', s: '#fdf5e3' },
  { k: 'coral', n: '코랄', a: '#ff6b3d', s: '#fff1eb' },
];

export const DEFAULT_CATS = [
  { k: 'work', n: '회사', c: '#6aa8f0' },
  { k: 'meet', n: '약속', c: '#f58fb0' },
  { k: 'me', n: '개인', c: '#4cc9a0' },
  { k: 'etc', n: '기타', c: '#f5bf55' },
];

export const WD = '일월화수목금토';

export const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const D = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const todayStr = () => ymd(new Date());
export const dayDiff = (a, b) => Math.round((D(a) - D(b)) / 864e5);
export const dLabel = (s) => {
  const n = dayDiff(s, todayStr());
  return n === 0 ? 'D-DAY' : n > 0 ? `D-${n}` : `D+${-n}`;
};
export const md = (s) => {
  const d = D(s);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WD[d.getDay()]})`;
};
export const mdShort = (s) => {
  const d = D(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

// 기한(기간) 일정의 시작~끝 범위
export const range = (e) => (e.kind === 'due' && e.start && e.start < e.date ? [e.start, e.date] : [e.date, e.date]);
export const onDay = (e, s) => {
  const [a, b] = range(e);
  return a <= s && s <= b;
};
export const hasDiary = (v) => !!(v && (v.text || v.mood != null || (v.photos && v.photos.length)));
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
