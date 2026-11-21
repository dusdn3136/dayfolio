# Dayfolio: 하루 기록 다이어리

React Native (Expo) 앱이에요.

## 처음 실행하기 (맥)

1. Node.js LTS 설치: https://nodejs.org
2. 폰에 **Expo Go** 앱 설치 (앱스토어 / 플레이스토어)
3. 터미널을 열고 이 폴더로 이동한 뒤 아래를 차례로 입력:

```bash
npm install
npx expo install --fix
npx expo start
```

4. 화면에 QR 코드가 뜨면
   - 아이폰: 기본 카메라 앱으로 QR 찍기
   - 안드로이드: Expo Go 앱에서 QR 스캔
   (컴퓨터와 폰이 같은 와이파이에 있어야 해요)

## 폴더 구조

- `App.js` : 화면 틀, 아래 탭, 시트(아래서 올라오는 창)
- `src/screens/` : 캘린더 · 일기장 · 설정 화면
- `src/sheets/` : 날짜 상세, 일정 입력, 분류 편집, 메모, 테마 색
- `src/components/` : 달력, 아이콘, 공통 부품
- `src/report.js` : 월간 기분 리포트 계산
- `src/store.js` : 데이터 저장 (폰 안에만 저장)

## 다음에 할 일

- 애드몹 광고 연결 (개발용 빌드 필요)
- 개인정보처리방침 주소를 `src/screens/SettingsScreen.js`의 `PRIVACY_URL`에 넣기
- 2차 업데이트: 로그인 + 친구 공유 캘린더
