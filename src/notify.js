import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { range } from './constants';

// 일정 알림 — 서버 없이 폰 안에서 예약되는 로컬 알림
// remind: 'none' | 'day' (당일 아침 9시) | 'before' (하루 전 아침 9시)
export const REMIND = [
  { k: 'none', n: '알림 없음' },
  { k: 'day', n: '당일 아침 9시' },
  { k: 'before', n: '하루 전 아침 9시' },
];
export const DEFAULT_REMIND = 'day';

const HOUR = 9;
const MAX = 60; // 아이폰은 예약 알림을 64개까지만 허용

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

function at9(dateStr, minusDays = 0) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d - minusDays, HOUR, 0, 0);
}

// 일정이 바뀔 때마다 예약 알림을 전부 다시 맞춤
export async function syncReminders(events) {
  try {
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    const now = Date.now();
    const list = [];
    events.forEach((e) => {
      const r = e.remind || 'none';
      if (r === 'none' || e.done) return;
      const [a, b] = range(e);
      const ranged = a !== b;
      const target = ranged ? b : a; // 기간 일정은 끝나는 날 기준
      const when = at9(target, r === 'before' ? 1 : 0);
      if (when.getTime() <= now) return;
      let body;
      if (ranged) body = r === 'before' ? '내일이 마감이에요' : '오늘이 마감이에요';
      else body = (r === 'before' ? '내일 일정이 있어요' : '오늘 일정이 있어요') + (e.time ? ` · ${e.time}` : '');
      list.push({ when, title: e.title, body });
    });
    list.sort((x, y) => x.when - y.when);
    for (const n of list.slice(0, MAX)) {
      await Notifications.scheduleNotificationAsync({
        content: { title: n.title, body: n.body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: n.when, channelId: 'default' },
      });
    }
  } catch (e) {}
}
