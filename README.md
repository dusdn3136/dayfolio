# Dayfolio: 하루 기록 다이어리

일정 · 메모 · 일기를 한 달력에서 관리하고, 그날 기분을 캐릭터 **몽글이**로 기록하는 다이어리 앱이에요.
React Native(Expo)로 만들었고, 모든 기록은 폰 안에만 저장돼요(서버 없음).

- 앱 고유 ID: `com.ywoo3136.dayfolio`
- 개인정보처리방침: https://dusdn3136.github.io/dayfolio/privacy.html
- 변경 기록: [CHANGELOG.md](CHANGELOG.md)

---

## 주요 기능

### 캘린더
- 월간 달력에 일정이 파스텔 알약 모양으로 표시 (칸이 좁으면 단어 단위로 깔끔하게 자름)
- 일정이 넘치면 마지막 줄에 `+n`
- 날짜 하나 고르면 하루 일정, 두 번 고르면 기간 일정(막대 + 끝나는 날 기준 D-day)
- 대한민국 공휴일·대체공휴일 표시 (2025~2027년 정확, 그 밖의 해는 날짜 고정 공휴일만)
- 오늘의 기록 카드, 그 아래 기간 일정 D-day 칩
- 좌우로 밀어서 달 넘기기, 제목(년·월) 눌러서 년·월 고르기
- 캘린더 탭을 한 번 더 누르면 이번 달로 돌아오기

### 날짜 창 (달력에서 날짜 누르기)
- 일정 / 메모 / 일기 탭 (빈 곳을 좌우로 밀어서 전환)
- 일정: 체크로 완료, 왼쪽으로 밀어서 삭제
- 메모: 체크리스트(짐 챙기기 등)와 일반 메모, 카드에서 바로 체크·항목 추가·삭제
- 일기: 몽글이 기분 5단계 + 글 + 사진 최대 4장, 수정·삭제 버튼
- 미래 날짜에는 일기를 쓸 수 없음

### 일기장
- 월간 기분 리포트 (기분 3일 이상 기록 시): 한 달 제목, 기분 색 표, 기록한 날·일정 완료율·사진 수, 분석 문장
  - 반복되는 일정(예: 필라테스)과 그날 기분을 비교해서 "기분을 올려준 것" 찾기
- 일기 목록: 왼쪽으로 밀어서 수정·삭제

### 설정
- 테마 색 6가지, 분류(카테고리) 관리
- 매일 일정 알림 켜기/끄기, 알림 시간 (기본 아침 9시, 일정 있는 날만)
- 개인정보처리방침, 모든 데이터 지우기

### 디자인
- 글꼴: 스위트(SUITE, SIL 오픈 폰트 라이선스, `assets/fonts`)
- 캐릭터: 몽글이 (최고 · 좋음 · 보통 · 우울 · 화남)
- 앱 아이콘: 오늘 한 칸 + 흰 몽글이

---

## 실행하기

### Expo Go로 미리보기 (맥 또는 윈도우)
```
npm install
npx expo install --fix
npx expo start          # 같은 와이파이일 때
npx expo start --tunnel # 다른 네트워크일 때
```
폰의 Expo Go로 QR을 찍어요. 코드를 고친 뒤 터미널에서 `r`을 누르면 새로고침돼요.
(Expo Go에서는 알림이 제대로 안 올 수 있어요.)

### 내 아이폰에 진짜 앱으로 설치 (맥, 무료 애플 계정)
처음 한 번만:
1. 최신 macOS, 최신 Xcode 설치
2. Xcode → Settings → Apple Accounts에서 애플 계정 로그인
3. 아이폰을 케이블로 연결하고 "신뢰", 설정 → 개인정보 보호 및 보안 → 개발자 모드 켜기
4. `ios/Dayfolio.xcworkspace`를 Xcode로 열고 Signing & Capabilities에서
   - Automatically manage signing 체크, Team: Personal Team
   - Bundle Identifier: `com.ywoo3136.dayfolio`

설치(그리고 **7일마다 다시**):
```
cd ~/Downloads/dayfolio-main
npx expo run:ios --device --configuration Release
```
설치 후 아이폰 설정 → 일반 → VPN 및 기기 관리에서 내 계정 "신뢰".
다시 설치해도 기록은 그대로 남아요. 개발자 모드는 켜둬야 앱이 열려요.

코드를 새로 받을 때는 `src`, `App.js`, `app.json`, `plugins`만 덮어쓰고 **`ios` 폴더는 그대로** 둬요(서명 설정 유지).

### 안드로이드 출시용 파일 (.aab)
```
npx eas-cli login
npx eas-cli build -p android --profile production
```
설정은 `eas.json`에 있어요.

---

## 폴더 구조

```
App.js                  화면 틀(헤더·탭바·아래에서 올라오는 창), 글꼴 불러오기
app.json                앱 이름·아이콘·고유 ID·권한 설정
plugins/withoutPush.js  무료 애플 계정 설치용 (서버 푸시 권한 제거, 로컬 알림만 사용)
docs/privacy.html       개인정보처리방침 (깃허브 페이지)
assets/                 아이콘, 스플래시, 글꼴
src/
  store.js              데이터 저장(폰 안, AsyncStorage), 창 열기/닫기
  constants.js          색상, 테마, 기분 목록, 날짜 계산
  holidays.js           공휴일 표 (매년 다음 해 공휴일 추가 필요)
  notify.js             매일 일정 알림 예약
  report.js             월간 기분 리포트 계산
  screens/              캘린더 · 일기장 · 설정 화면
  sheets/               날짜 창, 일정 추가, 메모·분류·테마·년월 고르기 창
  components/           달력, 몽글이, 글꼴(T.js), 스위치, 밀어서 버튼 등
```

## 해마다 할 일
- **공휴일 추가:** 매년 6월쯤 다음 해 공휴일(설날·추석·대체공휴일)이 발표되면 `src/holidays.js`의 표에 추가

## 앞으로 할 일
- 구글 플레이 비공개 테스트 → 정식 출시
- 광고(AdMob) 배너
- 로그인(카카오·구글) + 기록 백업·동기화 + 공유 캘린더
- 아이폰 앱스토어 출시
