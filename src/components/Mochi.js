import React from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

// 업그레이드된 기분 모찌 캐릭터 (0 최고 · 1 좋음 · 2 보통 · 3 우울 · 4 화남)
// 기존 props(mood, size, full, dim)와 MOCHI export를 그대로 유지해서 바로 교체 가능합니다.

const K = '#3d3330';

export const MOCHI = [
  { f: '#ffe38e', s: '#eab949', b: '#ff9eb5' }, // 0 최고 (버터 옐로우)
  { f: '#ccefd9', s: '#7bc496', b: '#ff9eb5' }, // 1 좋음 (말랑 민트)
  { f: '#eee9e4', s: '#bdb3aa', b: '#f2b8b5' }, // 2 보통 (포근 크림)
  { f: '#cfe2fc', s: '#7fa8df', b: '#f2a8b8' }, // 3 우울 (파스텔 블루)
  { f: '#fccbc2', s: '#e2887a', b: '#ff8da1' }, // 4 화남 (피치 코랄)
];

const LN = { stroke: K, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };

function Cheeks({ color, y = 18.2 }) {
  return (
    <G opacity={0.65}>
      <Ellipse cx={10.2} cy={y} rx={2.2} ry={1.35} fill={color} />
      <Ellipse cx={21.8} cy={y} rx={2.2} ry={1.35} fill={color} />
    </G>
  );
}

function Face({ mood, cheek }) {
  switch (mood) {
    case 0: // 최고: 반달 웃는 눈 + 활짝 웃는 입 + 볼터치
      return (
        <G>
          <Cheeks color={cheek} y={18.3} />
          <Path d="M10.2 15.8q1.4-2 2.8 0" {...LN} strokeWidth={1.65} />
          <Path d="M19 15.8q1.4-2 2.8 0" {...LN} strokeWidth={1.65} />
          <Path d="M13.6 17.8q2.4 3.4 4.8 0Z" fill="#ff7f7f" stroke={K} strokeWidth={1.3} strokeLinejoin="round" />
        </G>
      );
    case 1: // 좋음: 반짝 하이라이트 동글눈 + 다정한 미소
      return (
        <G>
          <Cheeks color={cheek} y={18.2} />
          <Circle cx={11.8} cy={15.6} r={1.45} fill={K} />
          <Circle cx={20.2} cy={15.6} r={1.45} fill={K} />
          <Circle cx={11.3} cy={15.1} r={0.5} fill="#fff" />
          <Circle cx={19.7} cy={15.1} r={0.5} fill="#fff" />
          <Path d="M14 18.3q2 1.8 4 0" {...LN} strokeWidth={1.55} />
        </G>
      );
    case 2: // 보통: 멍~한 점눈 + 일자 입
      return (
        <G>
          <Cheeks color={cheek} y={18.3} />
          <Circle cx={11.8} cy={15.8} r={1.3} fill={K} />
          <Circle cx={20.2} cy={15.8} r={1.3} fill={K} />
          <Path d="M14.3 18.5h3.4" {...LN} strokeWidth={1.55} />
        </G>
      );
    case 3: // 우울: 처진 눈썹 + 울먹이는 눈 + 큰 눈물방울
      return (
        <G>
          <Cheeks color={cheek} y={18.4} />
          <Path d="M10.2 13.8l2.5-.8" {...LN} strokeWidth={1.25} />
          <Path d="M21.8 13.8l-2.5-.8" {...LN} strokeWidth={1.25} />
          <Circle cx={11.8} cy={16} r={1.35} fill={K} />
          <Circle cx={20.2} cy={16} r={1.35} fill={K} />
          <Circle cx={11.4} cy={15.5} r={0.45} fill="#fff" />
          <Circle cx={19.8} cy={15.5} r={0.45} fill="#fff" />
          <Path d="M14.3 19.6q1.7-1.4 3.4 0" {...LN} strokeWidth={1.45} />
          <Path d="M21.4 17.4c0 0 1.7 2 1.7 3.1a1.7 1.7 0 0 1-3.4 0c0-1.1 1.7-3.1 1.7-3.1Z" fill="#82b8ff" stroke="#538fe0" strokeWidth={0.8} />
        </G>
      );
    default: // 화남: 찌푸린 눈썹 + 볼 빵빵 삐죽 입
      return (
        <G>
          <Cheeks color={cheek} y={18.2} />
          <Path d="M10.2 13.4l2.8 1.2" {...LN} strokeWidth={1.45} />
          <Path d="M21.8 13.4l-2.8 1.2" {...LN} strokeWidth={1.45} />
          <Circle cx={11.8} cy={16} r={1.35} fill={K} />
          <Circle cx={20.2} cy={16} r={1.35} fill={K} />
          <Path d="M14.2 19.6q1.8-1.6 3.6 0" {...LN} strokeWidth={1.55} />
        </G>
      );
  }
}

function Deco({ mood }) {
  switch (mood) {
    case 0: // 양옆 반짝이 스파클
      return (
        <G fill="#ffb703">
          <Path d="M4.5 7.2l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" />
          <Path d="M27.2 5.8l.6 1.3 1.3.6-1.3.6-.6 1.3-.6-1.3-1.3-.6 1.3-.6z" />
        </G>
      );
    case 1: // 머리 위 작은 하트
      return (
        <Path
          d="M25.5 7.6c-.8-.9-2.2-.3-2.2.9 0 1.2 2.2 2.5 2.2 2.5s2.2-1.3 2.2-2.5c0-1.2-1.4-1.8-2.2-.9Z"
          fill="#ff8fab"
        />
      );
    case 3: // 머리 위 작은 먹구름과 빗방울
      return (
        <G>
          <Path
            d="M22.5 6.8a1.9 1.9 0 0 1 3.6-.4 1.5 1.5 0 0 1 .4 2.9h-4.1a1.4 1.4 0 0 1 .1-2.5Z"
            fill="#9ec0f0"
          />
          <Path d="M23.3 10.6v1.1M25.3 10.8v1.1" stroke="#7ea9e6" strokeWidth={1.2} strokeLinecap="round" />
        </G>
      );
    case 4: // 오른쪽 위 빠직 마크
      return (
        <G stroke="#e85d5d" strokeWidth={1.35} strokeLinecap="round" fill="none">
          <Path d="M24.6 5.8q1 1.1 2.1.3M27.1 7.6q-1.1 1-.3 2.1M24.2 8.7q1.1-1 .3-2.1" />
        </G>
      );
    default:
      return null;
  }
}

export default function Mochi({ mood, size = 24, full = false, dim = false }) {
  if (mood == null || !MOCHI[mood]) return null;
  const c = MOCHI[mood];

  // 말랑한 찹쌀떡 실루엣
  const bodyPath = 'M6.2 18.5C6.2 11.4 10.3 7.4 16 7.4s9.8 4 9.8 11.1c0 4.8-3.4 6.8-9.8 6.8s-9.8-2-9.8-6.8Z';

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" opacity={dim ? 0.35 : 1}>
      {/* 모찌 몸통 */}
      <Path d={bodyPath} fill={c.f} stroke={c.s} strokeWidth={1.55} strokeLinejoin="round" />

      {/* 윗부분 말랑한 하이라이트 광택 */}
      <Ellipse cx={12.4} cy={10.8} rx={3.1} ry={1.3} transform="rotate(-18 12.4 10.8)" fill="#ffffff" opacity={0.55} />

      {/* 표정 */}
      <Face mood={mood} cheek={c.b} />

      {/* full 모드: 팔 + 기분별 장식 */}
      {full ? (
        <G>
          {mood === 0 ? (
            // 최고일 땐 만세 팔
            <G>
              <Path d="M7.2 16.5q-2.4-2.2-1.6-4.2" stroke={c.s} strokeWidth={2.2} strokeLinecap="round" fill="none" />
              <Path d="M24.8 16.5q2.4-2.2 1.6-4.2" stroke={c.s} strokeWidth={2.2} strokeLinecap="round" fill="none" />
            </G>
          ) : mood === 4 ? (
            // 화날 땐 팔짱/주먹 쥔 짧은 팔
            <G>
              <Path d="M7.8 18.8q-2 .8-1.4 2.3" stroke={c.s} strokeWidth={2.2} strokeLinecap="round" fill="none" />
              <Path d="M24.2 18.8q2 .8 1.4 2.3" stroke={c.s} strokeWidth={2.2} strokeLinecap="round" fill="none" />
            </G>
          ) : (
            // 기본 짧은 모찌 팔
            <G>
              <Path d="M7 18.6q-2 1-1.3 2.4" stroke={c.s} strokeWidth={2.1} strokeLinecap="round" fill="none" />
              <Path d="M25 18.6q2 1 1.3 2.4" stroke={c.s} strokeWidth={2.1} strokeLinecap="round" fill="none" />
            </G>
          )}
          <Deco mood={mood} />
        </G>
      ) : null}
    </Svg>
  );
}
