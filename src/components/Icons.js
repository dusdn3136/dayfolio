import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const base = (size, color, sw = 2) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' });

export const IconCalendar = ({ size = 24, color }) => (
  <Svg {...base(size, color)}>
    <Rect x="3.5" y="5" width="17" height="15.5" rx="3.5" />
    <Path d="M3.5 10h17M8 3v4M16 3v4" />
  </Svg>
);
export const IconBook = ({ size = 24, color }) => (
  <Svg {...base(size, color)}>
    <Path d="M6.5 3.5h10.5a2 2 0 0 1 2 2v15h-12A2.5 2.5 0 0 1 4.5 18V5.5a2 2 0 0 1 2-2z" />
    <Path d="M9 8.5h6M9 12h4" />
  </Svg>
);
export const IconGear = ({ size = 24, color }) => (
  <Svg {...base(size, color)}>
    <Circle cx="12" cy="12" r="3" />
    <Path d="M12 2.8l1.6 2.3 2.8-.4.9 2.7 2.6 1.1-.5 2.8 1.8 2.2-1.8 2.2.5 2.8-2.6 1.1-.9 2.7-2.8-.4L12 21.2l-1.6-2.3-2.8.4-.9-2.7-2.6-1.1.5-2.8L2.8 12l1.8-2.2-.5-2.8 2.6-1.1.9-2.7 2.8.4z" />
  </Svg>
);
export const IconPlus = ({ size = 24, color, sw = 2.6 }) => (
  <Svg {...base(size, color, sw)}>
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);
export const IconChevron = ({ size = 18, color, dir = 'right' }) => (
  <Svg {...base(size, color, 2.2)}>
    <Path d={dir === 'right' ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
  </Svg>
);
export const IconCheck = ({ size = 13, color = '#fff' }) => (
  <Svg {...base(size, color, 3.2)}>
    <Path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const IconX = ({ size = 14, color }) => (
  <Svg {...base(size, color, 2.4)}>
    <Path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
export const IconPen = ({ size = 16, color }) => (
  <Svg {...base(size, color)}>
    <Path d="M4 20h4L19 9l-4-4L4 16z" />
  </Svg>
);
export const IconPhoto = ({ size = 24, color }) => (
  <Svg {...base(size, color, 1.8)}>
    <Rect x="3.5" y="5" width="17" height="14" rx="3" />
    <Circle cx="9" cy="10" r="1.6" />
    <Path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5" />
  </Svg>
);
export const IconTrash = ({ size = 20, color }) => (
  <Svg {...base(size, color)}>
    <Path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" />
  </Svg>
);
export const IconChecklist = ({ size = 18, color }) => (
  <Svg {...base(size, color, 2.2)}>
    <Rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    <Path d="M8 12l3 3 5-6" />
  </Svg>
);
export const IconLines = ({ size = 18, color }) => (
  <Svg {...base(size, color, 2.2)}>
    <Path d="M8 9h8M8 13h8M8 17h5" />
  </Svg>
);
export const IconMemoBadge = ({ size = 13, color, done }) => (
  <Svg {...base(size, color, 2.6)}>
    <Rect x="3" y="3" width="18" height="18" rx="5" />
    <Path d={done ? 'M8 12l3 3 5-6' : 'M8 10h8M8 14h5'} />
  </Svg>
);
const insPaths = {
  up: 'M4 16l5-5 4 4 7-7M15 8h5v5',
  down: 'M4 8l5 5 4-4 7 7M15 16h5v-5',
  heart: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
  cloud: 'M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 8.5z',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4',
  fire: 'M12 21c-3.5 0-6-2.4-6-5.6 0-3.5 3-5.4 3.5-8.9 2 1.3 3 3 3 4.8 1-.6 1.8-1.7 2-3 2 1.8 3.5 4.3 3.5 7.1 0 3.2-2.5 5.6-6 5.6z',
};
export const IconInsight = ({ name, size = 17, color }) => (
  <Svg {...base(size, color, 2.2)}>
    <Path d={insPaths[name]} />
  </Svg>
);
