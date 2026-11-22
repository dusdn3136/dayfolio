// 우리 앱은 서버 푸시 없이 폰 안에서 예약하는 알림만 쓴다.
// expo-notifications가 넣는 푸시 권한(aps-environment)을 빼서
// 무료 애플 계정으로도 아이폰에 직접 설치할 수 있게 한다.
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = function withoutPush(config) {
  return withEntitlementsPlist(config, (c) => {
    delete c.modResults['aps-environment'];
    return c;
  });
};
