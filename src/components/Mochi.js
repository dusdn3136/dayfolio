import React from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

// 기분 모찌 캐릭터 (0 최고 · 1 좋음 · 2 보통 · 3 우울 · 4 화남)
// full: 팔과 주변 장식까지 그린 큰 버전 / 아니면 달력용 얼굴만 있는 작은 버전

const K = '#4a3a33';
export const MOCHI = [
  { f: '#fde58e', s: '#c9a43a' },
  { f: '#cdeed8', s: '#72b98d' },
  { f: '#efe9e4', s: '#aaa29b' },
  { f: '#d3e4fb', s: '#6f9ed9' },
  { f: '#fbcdc4', s: '#d8877a' },
];

const SPARK = 'l.55 1.2 1.2.55-1.2.55-.55 1.2-.55-1.2-1.2-.55 1.2-.55z';

function Face({ mood }) {
  switch (mood) {
    case 0:
      return (
        <G>
          <Path d={`M8.8 11.2 ${SPARK}`} fill={K} />
          <Path d={`M15.8 11.2 ${SPARK}`} fill={K} />
          <Path d="M10.5 15.1 Q12 18.3 13.5 15.1Z" fill="#e86b6b" stroke={K} strokeWidth={0.6} strokeLinejoin="round" />
        </G>
      );
    case 1:
      return (
        <G>
          <Circle cx="9.1" cy="13.2" r="1" fill={K} />
          <Circle cx="14.9" cy="13.2" r="1" fill={K} />
          <Path d="M10.7 14.6 Q12 15.9 13.3 14.6" stroke={K} strokeWidth={0.7} fill="none" strokeLinecap="round" />
        </G>
      );
    case 2:
      return (
        <G>
          <Circle cx="9.1" cy="13.3" r="1" fill={K} />
          <Circle cx="14.9" cy="13.3" r="1" fill={K} />
          <Path d="M10.9 15.1 h2.2" stroke={K} strokeWidth={0.7} strokeLinecap="round" />
        </G>
      );
    case 3:
      return (
        <G>
          <Path d="M8.2 12.4 q.9.2 1.6 1.1 M15.8 12.4 q-.9.2-1.6 1.1" stroke={K} strokeWidth={0.9} fill="none" strokeLinecap="round" />
          <Path d="M10.8 16 Q12 15 13.2 16" stroke={K} strokeWidth={0.7} fill="none" strokeLinecap="round" />
          <Path d="M8.5 14.3 q.55.9 0 1.35 q-.55-.45 0-1.35z M15.5 14.3 q.55.9 0 1.35 q-.55-.45 0-1.35z" fill="#9fd0ff" stroke="#6f9ed9" strokeWidth={0.3} />
        </G>
      );
    default:
      return (
        <G>
          <Path d="M8 11.9 l2 .9 M16 11.9 l-2 .9" stroke={K} strokeWidth={0.9} strokeLinecap="round" />
          <Circle cx="9.3" cy="13.6" r=".95" fill={K} />
          <Circle cx="14.7" cy="13.6" r=".95" fill={K} />
          <Path d="M10.8 16 Q12 15 13.2 16" stroke={K} strokeWidth={0.7} fill="none" strokeLinecap="round" />
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
      <Path d="M3 21 C2.4 10.5 7 4.2 12 4.2 C17 4.2 21.6 10.5 21 21 Q20.9 22.4 19.4 22.4 H4.6 Q3.1 22.4 3 21Z" fill={c.f} stroke={c.s} strokeWidth={0.9} />
      <Ellipse cx="6.6" cy="15.2" rx="1.9" ry="1.3" fill="#f6a2a2" opacity={0.75} />
      <Ellipse cx="17.4" cy="15.2" rx="1.9" ry="1.3" fill="#f6a2a2" opacity={0.75} />
      <Face mood={mood} />
      {full ? (
        <G>
          <Path d="M6.8 21.2 q.1-2.3 2-2.1 M17.2 21.2 q-.1-2.3-2-2.1" stroke={c.s} strokeWidth={0.9} fill="none" strokeLinecap="round" />
          <Deco mood={mood} />
        </G>
      ) : null}
    </Svg>
  );
}
