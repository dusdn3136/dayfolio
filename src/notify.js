import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { onDay, range, sortDayEvents, ymd } from './constants';

// 매일 알림 — 정해진 시간에 그날 일정을 한 번에 알려줌 (서버 없이 폰 안에서 예약)
export const DEFAULT_NOTIFY = { on: true, time: '09:00' };
const DAYS_AHEAD = 30; // 앞으로 30일치를 미리 예약해두고, 일정이 바뀔 때마다 다시 맞춤

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
} catch (e) {}

// 알림 권한 요청 (처음 한 번만 물어봄)
export async function ensurePermission() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', { name: '일정 알림', importance: Notifications.AndroidImportance.HIGH });
    }
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    if (!cur.canAskAgain) return false;
    const res = await Notifications.requestPermissionsAsync();
    return res.granted;
  } catch (e) {
    return false;
  }
}

function digest(events, day) {
  const evs = sortDayEvents(events.filter((e) => !e.done && onDay(e, day)));
  if (!evs.length) return null;
  // 한 줄에 일정 하나씩, 최대 3개 (넘치면 세 번째 줄 끝에 "외 N개")
  const MAX = 3;
  const lines = evs.map((e) => {
    const [a, b] = range(e);
    if (a !== b && b === day) return `${e.title} · 오늘 마감`;
    return e.time ? `[${e.time}] ${e.title}` : e.title;
  });
  const shown = lines.slice(0, MAX);
  const rest = lines.length - MAX;
  if (rest > 0) {
    const last = shown[MAX - 1];
    const cut = last.length > 16 ? last.slice(0, 15) + '…' : last;
    shown[MAX - 1] = `${cut}  외 ${rest}개`;
  }
  const body = shown.map((l) => `• ${l}`).join('\n');
  // 아이폰은 제목 자리에 앱 이름 + 개수, 갤럭시는 위에 앱 이름이 자동으로 붙어서 TODAY + 개수
  const title = Platform.OS === 'ios' ? `Dayfolio (${evs.length})` : `TODAY (${evs.length})`;
  return { title, body };
}

export async function syncReminders(data) {
  try {
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    const cfg = { ...DEFAULT_NOTIFY, ...(data.notify || {}) };
    if (!cfg.on) return;
    const [hh, mm] = cfg.time.split(':').map(Number);
    const now = new Date();
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hh, mm, 0);
      if (d.getTime() <= now.getTime()) continue;
      const msg = digest(data.events, ymd(d));
      if (!msg) continue; // 일정 없는 날은 알림 안 보냄
      await Notifications.scheduleNotificationAsync({
        content: msg,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: d, channelId: 'default' },
      });
    }
  } catch (e) {}
}
