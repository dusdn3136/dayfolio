import { D, MOODS, SCORE, WD, hasDiary, pad, todayStr } from './constants';

// 이번 달 기분 리포트: AI 없이 간단한 계산으로 만든다
export function buildReport(data, y, m) {
  const pre = `${y}-${pad(m + 1)}`;
  const last = new Date(y, m + 1, 0).getDate();
  const today = todayStr();
  const days = Object.keys(data.diary).filter((k) => k.startsWith(pre) && hasDiary(data.diary[k])).sort();
  const md = days.filter((k) => data.diary[k].mood != null);
  const avg = (a) => (a.length ? a.reduce((x, k) => x + SCORE[data.diary[k].mood], 0) / a.length : 0);
  const r = { days: days.length, moodDays: md.length, avg: avg(md), ins: [] };
  r.cnt = MOODS.map((_, i) => md.filter((k) => data.diary[k].mood === i).length);
  r.photos = days.reduce((n, k) => n + (data.diary[k].photos || []).length, 0);
  const evs = data.events.filter((e) => e.date.startsWith(pre) && e.date <= today);
  r.evTotal = evs.length;
  r.evDone = evs.filter((e) => e.done).length;

  let best = 0;
  let cur = 0;
  for (let d = 1; d <= last; d++) {
    if (hasDiary(data.diary[`${pre}-${pad(d)}`])) { cur++; best = Math.max(best, cur); } else cur = 0;
  }
  r.streak = best;
  if (md.length < 3) return r;

  const a = r.avg;
  r.title =
    a >= 4.3 ? '반짝반짝 빛난 한 달이었어요'
    : a >= 3.6 ? '웃는 날이 더 많았던 한 달'
    : a >= 2.9 ? '잔잔하게 흘러간 한 달'
    : a >= 2.2 ? '조금 지쳤던 한 달, 수고 많았어요'
    : '많이 힘들었던 한 달, 토닥토닥';
  const top = r.cnt.indexOf(Math.max(...r.cnt));
  r.sub = `기분을 남긴 ${md.length}일 중 '${MOODS[top].n}'인 날이 ${r.cnt[top]}일로 가장 많았어요.`;

  // 흐름: 전반 vs 후반
  const half = Math.ceil(last / 2);
  const h1 = md.filter((k) => +k.slice(8) <= half);
  const h2 = md.filter((k) => +k.slice(8) > half);
  if (h1.length >= 2 && h2.length >= 2) {
    const d = avg(h2) - avg(h1);
    if (d >= 0.5) r.ins.push({ k: '흐름', v: '월초보다 월말로 갈수록 기분이 좋아졌어요', ic: 'up' });
    else if (d <= -0.5) r.ins.push({ k: '흐름', v: '월말로 갈수록 조금 지쳐 보여요. 쉬어가는 날도 챙겨요', ic: 'down' });
  }

  // 같은 이름으로 2번 이상 반복된 일정과 그날 기분 비교
  const norm = (t) => t.replace(/\s+/g, '').toLowerCase();
  const groups = {};
  data.events.forEach((e) => {
    if (e.kind !== 'event') return;
    const k = norm(e.title);
    if (!k) return;
    (groups[k] = groups[k] || { t: e.title.trim(), days: new Set(), cat: e.cat }).days.add(e.date);
  });
  const cand = Object.values(groups)
    .map((g) => {
      const ds = [...g.days].filter((k) => k.startsWith(pre) && data.diary[k] && data.diary[k].mood != null);
      return { ...g, ds, df: ds.length ? avg(ds) - a : 0 };
    })
    .filter((g) => g.ds.length >= 2 && g.ds.length <= md.length * 0.6);
  const up = cand.filter((g) => g.df >= 0.6).sort((x, z) => z.df - x.df || z.ds.length - x.ds.length)[0];
  const dn = cand.filter((g) => g.df <= -0.8).sort((x, z) => x.df - z.df || z.ds.length - x.ds.length)[0];
  if (up) {
    const good = up.ds.filter((k) => SCORE[data.diary[k].mood] >= 4).length / up.ds.length;
    const how = good === 1 ? '늘' : good >= 0.66 ? '대부분' : '평소보다';
    r.ins.push({ k: '기분을 올려준 것', v: `'${up.t}' 하는 날은 ${how} 기분이 좋았어요`, ic: 'heart', cat: up.cat });
  }
  if (dn) r.ins.push({ k: '쉬어가도 좋아요', v: `'${dn.t}' 있던 날은 조금 지쳐 보였어요. 그런 날엔 나를 더 챙겨줘요`, ic: 'cloud', cat: dn.cat });

  // 기분 좋은 요일
  let bw = -1;
  let bv = 0;
  [...Array(7)].forEach((_, i) => {
    const arr = md.filter((k) => D(k).getDay() === i);
    if (arr.length >= 2 && avg(arr) > bv) { bv = avg(arr); bw = i; }
  });
  if (bw >= 0 && bv > a) r.ins.push({ k: '기분 좋은 요일', v: `${WD[bw]}요일에 주로 기분이 좋았어요`, ic: 'sun' });
  if (r.streak >= 3) r.ins.push({ k: '꾸준함', v: `최대 ${r.streak}일 연속으로 기록했어요`, ic: 'fire' });
  return r;
}
