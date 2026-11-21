import React, { useRef } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './T';

// 왼쪽으로 밀면 오른쪽에 버튼들이 나오는 줄
// actions: [{ label, color, onPress }]
export default function SwipeRow({ actions, children, onPress }) {
  const BTN = 64;
  const OPEN = -(actions.length * (BTN + 8) + 4);
  const x = useRef(new Animated.Value(0)).current;
  const opened = useRef(false);
  const snap = (to) => {
    opened.current = to !== 0;
    Animated.spring(x, { toValue: to, useNativeDriver: true, bounciness: 0 }).start();
  };
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.8 && (g.dx < 0 || opened.current),
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => x.setValue(Math.max(OPEN * 1.3, Math.min(0, (opened.current ? OPEN : 0) + g.dx))),
      onPanResponderRelease: (_, g) => snap((opened.current ? OPEN : 0) + g.dx < OPEN / 2 ? OPEN : 0),
      onPanResponderTerminate: () => snap(opened.current ? OPEN : 0),
    })
  ).current;
  return (
    <View style={st.wrap}>
      <View style={st.btns}>
        {actions.map((a) => (
          <Pressable key={a.label} style={[st.btn, { width: BTN, backgroundColor: a.color }]} onPress={() => { snap(0); a.onPress(); }}>
            <Text style={st.btnTx}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
      <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX: x }], backgroundColor: '#fff' }}>
        <Pressable onPress={() => (opened.current ? snap(0) : onPress && onPress())}>{children}</Pressable>
      </Animated.View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  btns: { position: 'absolute', right: 0, top: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: { height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnTx: { color: '#fff', fontSize: 13.5, fontWeight: '700' },
});
