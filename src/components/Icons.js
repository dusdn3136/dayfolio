import React from 'react';
import { Text, View } from 'react-native';

// 별도 그림 패키지 없이 기본 View/Text로만 그린 아이콘 (어떤 환경에서도 실행되도록)

const Glyph = ({ ch, size, color, weight = '600', scale = 1 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color, fontSize: size * scale, lineHeight: size * scale * 1.1, fontWeight: weight, textAlign: 'center' }} allowFontScaling={false}>
      {ch}
    </Text>
  </View>
);

const Box = ({ size, children }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
);

export const IconCalendar = ({ size = 24, color }) => {
  const w = size * 0.74;
  return (
    <Box size={size}>
      <View style={{ width: w, height: w * 0.92, borderWidth: 2, borderColor: color, borderRadius: size * 0.16, overflow: 'hidden' }}>
        <View style={{ height: w * 0.22, backgroundColor: color }} />
      </View>
    </Box>
  );
};

export const IconBook = ({ size = 24, color }) => {
  const w = size * 0.62;
  return (
    <Box size={size}>
      <View style={{ width: w, height: size * 0.76, borderWidth: 2, borderColor: color, borderRadius: size * 0.1, paddingTop: size * 0.16, paddingHorizontal: size * 0.1, gap: size * 0.1 }}>
        <View style={{ height: 2, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ height: 2, width: '65%', backgroundColor: color, borderRadius: 1 }} />
      </View>
    </Box>
  );
};

export const IconGear = ({ size = 24, color }) => {
  const r = size * 0.66;
  return (
    <Box size={size}>
      <View style={{ width: r, height: r, borderRadius: r / 2, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: r * 0.34, height: r * 0.34, borderRadius: r, backgroundColor: color }} />
      </View>
    </Box>
  );
};

export const IconPlus = ({ size = 24, color, sw = 2.6 }) => (
  <Box size={size}>
    <View style={{ position: 'absolute', width: size * 0.6, height: sw, borderRadius: sw, backgroundColor: color }} />
    <View style={{ position: 'absolute', width: sw, height: size * 0.6, borderRadius: sw, backgroundColor: color }} />
  </Box>
);

export const IconChevron = ({ size = 18, color, dir = 'right' }) => <Glyph ch={dir === 'right' ? '›' : '‹'} size={size} color={color} scale={1.35} weight="500" />;

export const IconCheck = ({ size = 13, color = '#fff' }) => <Glyph ch="✓" size={size} color={color} scale={1} weight="800" />;

export const IconX = ({ size = 14, color }) => <Glyph ch="✕" size={size} color={color} scale={0.95} weight="600" />;

export const IconPen = ({ size = 16, color }) => <Glyph ch="✎" size={size} color={color} scale={1.05} />;

export const IconPhoto = ({ size = 24, color }) => {
  const w = size * 0.78;
  return (
    <Box size={size}>
      <View style={{ width: w, height: w * 0.8, borderWidth: 1.8, borderColor: color, borderRadius: size * 0.14, padding: size * 0.1 }}>
        <View style={{ width: size * 0.16, height: size * 0.16, borderRadius: size, backgroundColor: color }} />
      </View>
    </Box>
  );
};

export const IconTrash = ({ size = 20, color }) => (
  <Box size={size}>
    <View style={{ width: size * 0.7, height: 2, backgroundColor: color, borderRadius: 1, marginBottom: 2 }} />
    <View style={{ width: size * 0.5, height: size * 0.55, borderWidth: 2, borderTopWidth: 0, borderColor: color, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }} />
  </Box>
);

export const IconChecklist = ({ size = 18, color }) => (
  <Box size={size}>
    <View style={{ width: size * 0.86, height: size * 0.86, borderWidth: 2, borderColor: color, borderRadius: size * 0.24, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color, fontSize: size * 0.6, fontWeight: '800', lineHeight: size * 0.7 }} allowFontScaling={false}>✓</Text>
    </View>
  </Box>
);

export const IconLines = ({ size = 18, color }) => (
  <Box size={size}>
    <View style={{ gap: size * 0.14 }}>
      <View style={{ width: size * 0.6, height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: size * 0.6, height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: size * 0.38, height: 2, backgroundColor: color, borderRadius: 1 }} />
    </View>
  </Box>
);

export const IconMemoBadge = ({ size = 13, color, done }) => (
  <View style={{ width: size, height: size, borderWidth: 1.8, borderColor: color, borderRadius: size * 0.3, alignItems: 'center', justifyContent: 'center' }}>
    {done ? (
      <Text style={{ color, fontSize: size * 0.62, fontWeight: '800', lineHeight: size * 0.72 }} allowFontScaling={false}>✓</Text>
    ) : (
      <View style={{ gap: 1.5 }}>
        <View style={{ width: size * 0.45, height: 1.6, backgroundColor: color }} />
        <View style={{ width: size * 0.3, height: 1.6, backgroundColor: color }} />
      </View>
    )}
  </View>
);

const insGlyph = { up: '↗', down: '↘', heart: '♥︎', cloud: '☁︎', sun: '☀︎', fire: '✦' };
export const IconInsight = ({ name, size = 17, color }) => <Glyph ch={insGlyph[name] || '•'} size={size} color={color} scale={1} weight="700" />;
