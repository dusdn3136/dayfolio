import React from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

// 기분 모찌 캐릭터 (0 최고 · 1 좋음 · 2 보통 · 3 우울 · 4 화남)
// full: 팔과 주변 장식까지 그린 큰 버전 / 아니면 달력용 얼굴만 있는 작은 버전

const K = '#3d3330';
export const MOCHI = [
  { f: '#ffe7a0', s: '#e6c56c' },
  { f: '#d2efdc', s: '#8dc6a0' },
  { f: '#efeae5', s: '#c2b8af' },
  { f: '#d6e6fb', s: '#8eb2e0' },
  { f: '#fcd4cb', s: '#e39d90' },
];

const SPARK = 'l.55 1.2 1.2.55-1.2.55-.55 1.2-.55-1.2-1.2-.55 1.2-.55z';

function Eyes({ y = 15.4 }) {
  return (
    <G>
      <Ellipse cx="8.9" cy={y} rx="0.9" ry="1.1" fill={K} />
      <Ellipse cx="15.1" cy={y} rx="0.9" ry="1.1" fill={K} />
    </G>
  );
}

const LN = { stroke: K, strokeLinecap: 'round', fill: 'none' };

function Face({ mood }) {
  switch (mood) {
    case 0:
      return (
        <G>
          <Path d="M7.9 15.6 Q8.9 14.2 9.9 15.6 M14.1 15.6 Q15.1 14.2 16.1 15.6" {...LN} strokeWidth={0.75} />
          <Path d="M10.7 16.7 Q12 18.6 13.3 16.7Z" fill="#ef8a8a" stroke={K} strokeWidth={0.5} strokeLinejoin="round" />
        </G>
      );
    case 1:
      return (
        <G>
          <Eyes />
          <Path d="M10.9 17 Q12 18 13.1 17" {...LN} strokeWidth={0.6} />
        </G>
      );
    case 2:
      return (
        <G>
          <Eyes />
          <Path d="M11 17.4 h2" {...LN} strokeWidth={0.6} />
        </G>
      );
    case 3:
      return (
        <G>
          <Path d="M8 15 q.9.3 1.8 1 M16 15 q-.9.3-1.8 1" {...LN} strokeWidth={0.75} />
          <Path d="M11 17.9 Q12 17 13 17.9" {...LN} strokeWidth={0.6} />
          <Path d="M8.6 16.9 q.5.8 0 1.2 q-.5-.4 0-1.2z" fill="#9fd0ff" />
        </G>
      );
    default:
      return (
        <G>
          <Path d="M7.8 13.9 l1.9 .8 M16.2 13.9 l-1.9 .8" {...LN} strokeWidth={0.75} />
          <Eyes y={15.9} />
          <Path d="M11 18 Q12 17.1 13 18" {...LN} strokeWidth={0.6} />
        </G>
      );
  }
}

function Deco({ mood }) {
  switch (mood) {
    case 0:
      return <Path d={`M2.2 6 ${SPARK} M21.6 4.5 l.6 1.3 1.3.6-1.3.6-.6 1.3-.6-1.3-1.3-.6 1.3-.6z M1.4 11.6 l.35.8.8.35-.8.35-.35.8-.35-.8-.8-.35.8-.35z`} fill="#f4cf4a" />;
    case 1:
      return <Path d="M20.4 4.2 c.9-1.5 3.1-.7 2.4.9 l-2.4 2.3 -2.4-2.3 c-.7-1.6 1.5-2.4 2.4-.9z" fill="#a8dcb8" stroke="#72b98d" strokeWidth={0.5} />;
    case 3:
      return (
        <G>
          <Path d="M18 4.6 a1.6 1.6 0 0 1 3-.6 a1.3 1.3 0 0 1 1 2.4 h-3.8 a1.1 1.1 0 0 1-.2-1.8z" fill="#cfe2fb" stroke="#6f9ed9" strokeWidth={0.5} />
          <Path d="M19 7.4 v.8 M20.3 7.4 v1 M21.5 7.4 v.8" stroke="#6f9ed9" strokeWidth={0.5} strokeLinecap="round" />
        </G>
      );
    case 4:
      return <Path d="M19.2 6.6 q-1.4-.3-.9-1.7 q.1-1.4 1.6-1.1 q.9-1.1 2-.1 q1.4.2 1 1.6 q.5 1.4-1 1.5 l-.9 1.4 .1-1.3z" fill="none" stroke="#d8877a" strokeWidth={0.55} strokeLinejoin="round" />;
    default:
      return null;
  }
}

export default function Mochi({ mood, size = 24, full = false, dim = false }) {
  if (mood == null || !MOCHI[mood]) return null;
  const c = MOCHI[mood];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity: dim ? 0.5 : 1, overflow: 'visible' }}>
      <Path d="M2 20.6 C2 12.2 6.4 7.4 12 7.4 C17.6 7.4 22 12.2 22 20.6 Q22 22.4 20.2 22.4 H3.8 Q2 22.4 2 20.6Z" fill={c.f} stroke={c.s} strokeWidth={0.6} />
      <Ellipse cx="6.4" cy="17.6" rx="1.7" ry="1.05" fill="#f7a8b0" opacity={0.6} />
      <Ellipse cx="17.6" cy="17.6" rx="1.7" ry="1.05" fill="#f7a8b0" opacity={0.6} />
      <Face mood={mood} />
      {full ? (
        <G>
          <Path d="M6.8 21.4 q.1-1.9 1.9-1.8 M17.2 21.4 q-.1-1.9-1.9-1.8" stroke={c.s} strokeWidth={0.6} fill="none" strokeLinecap="round" />
          <Deco mood={mood} />
        </G>
      ) : null}
    </Svg>
  );
}
