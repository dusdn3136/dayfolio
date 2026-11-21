import { File, Directory, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { pad, uid } from './constants';

// 백업 파일 하나에 기록 + 사진을 모두 담는다 (서버 없이 카톡·구글드라이브 등으로 옮길 수 있게)

const toBase64 = async (uri) => {
  try {
    const r = new File(uri).base64();
    return typeof r === 'string' ? r : await r;
  } catch (e) {
    return null;
  }
};

const b64ToBytes = (b64) => {
  const bin = global.atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

export async function exportBackup(data) {
  const photos = {};
  for (const v of Object.values(data.diary)) {
    for (const uri of v.photos || []) {
      if (!photos[uri]) {
        const b = await toBase64(uri);
        if (b) photos[uri] = b;
      }
    }
  }
  const d = new Date();
  const name = `dayfolio-백업-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.json`;
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify({ app: 'dayfolio', v: 1, savedAt: d.toISOString(), data, photos }));
  if (!(await Sharing.isAvailableAsync())) throw new Error('공유 기능을 쓸 수 없어요');
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Dayfolio 백업 파일 저장' });
}

// 백업 파일을 골라서 읽은 뒤, 새 데이터를 돌려준다 (적용은 부르는 쪽에서)
export async function pickBackup() {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true });
  if (res.canceled || !res.assets || !res.assets[0]) return null;
  const raw = new File(res.assets[0].uri).text();
  const text = typeof raw === 'string' ? raw : await raw;
  const json = JSON.parse(text);
  if (json.app !== 'dayfolio' || !json.data) throw new Error('Dayfolio 백업 파일이 아니에요');

  // 사진을 이 폰의 앱 폴더에 다시 저장하고 주소를 바꿔준다
  const dir = new Directory(Paths.document, 'photos');
  if (!dir.exists) dir.create();
  const map = {};
  for (const [oldUri, b64] of Object.entries(json.photos || {})) {
    try {
      const f = new File(dir, `${uid()}.jpg`);
      f.create();
      f.write(b64ToBytes(b64));
      map[oldUri] = f.uri;
    } catch (e) {}
  }
  const data = json.data;
  Object.values(data.diary || {}).forEach((v) => {
    v.photos = (v.photos || []).map((u) => map[u]).filter(Boolean);
  });
  return { data, savedAt: json.savedAt };
}
