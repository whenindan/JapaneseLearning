// Bài 1 (第１課) — follows the NKDV slide decks; extracted source in docs/source-lesson1.md.
export const LESSON = { no: 1, total: 50, title: 'はじめまして', sub: 'Chào hỏi · Giới thiệu bản thân', mark: '初' };
/** Locked lessons previewed in the home carousel */
export const UPCOMING = [{ no: 2, title: 'これは ほんです' }, { no: 3, title: 'ここは きょうしつです' }];

export type GrammarPoint = { id: string; tab: string; pattern: string; meaning: string; examples: [string, string][]; tip: string };
export const GRAMMAR: GrammarPoint[] = [
  { id: '1.1', tab: 'は', pattern: 'N1 は N2 です', meaning: 'N1 là N2 — nói về thông tin của N1. N1 là chủ ngữ (chủ đề của câu); N2 là vị ngữ: tên, quốc tịch, tuổi, nghề nghiệp… です đứng cuối câu khẳng định, thể hiện sự lịch sự với người nghe.',
    examples: [['わたしは ミンです。', 'Tôi là Minh.'], ['わたしは がくせいです。', 'Tôi là học sinh.'], ['わたしは ベトナムじんです。', 'Tôi là người Việt Nam.'], ['ナムさんは 18さいです。', 'Nam 18 tuổi.']],
    tip: 'は là trợ từ, đọc là “わ” (wa) chứ không phải “ha”. Dịch: thì, là, ở.' },
  { id: '1.2', tab: 'じゃ ありません', pattern: 'N1 は N2 じゃ ありません', meaning: 'Câu phủ định: N1 không phải là N2.',
    examples: [['わたしは がくせいじゃ ありません。', 'Tôi không phải là học sinh.'], ['たなかさんは ベトナムじんじゃ ありません。', 'Chị Tanaka không phải là người Việt Nam.']], tip: 'Trang trọng hơn: では ありません (では đọc là “dewa”).' },
  { id: '1.3', tab: 'か', pattern: 'N1 は N2 ですか', meaning: 'Câu hỏi xác nhận thông tin: thêm か vào cuối câu, lên giọng ở cuối. Trả lời bằng はい (có) hoặc いいえ (không).',
    examples: [['ナムさんは にほんじんですか。', 'Nam là người Nhật phải không?'], ['いいえ、にほんじんじゃ ありません。', 'Không, không phải người Nhật.'], ['はい、ベトナムじんです。', 'Vâng, là người Việt Nam.']], tip: 'Câu hỏi tiếng Nhật không cần dấu “?” — か đã là dấu hỏi.' },
  { id: '1.4', tab: 'も', pattern: 'N1 も N2 です', meaning: 'も = “cũng”. Dùng thay は khi vị ngữ giống với câu trước.',
    examples: [['わたしは がくせいです。', 'Tôi là học sinh.'], ['ナムさんも がくせいです。', 'Nam cũng là học sinh.']], tip: 'も thay thế は, không dùng cùng は.' },
  { id: '1.5', tab: 'の', pattern: 'N1 の N2', meaning: 'の = “của”. N1 là nơi/tổ chức mà N2 thuộc về.',
    examples: [['わたしは NKDVの がくせいです。', 'Tôi là học sinh của NKDV.'], ['チャンさんは ぎんこうの しゃいんです。', 'Trang là nhân viên của ngân hàng.']], tip: 'しゃいん luôn đi kèm tên công ty/tổ chức: ～の しゃいん.' },
];

export type Word = { kana: string; kanji?: string; vi: string; pos: string; emoji: string };
export const VOCAB: Word[] = [
  { kana: 'わたし', kanji: '私', vi: 'tôi', pos: 'Đại từ', emoji: '🙋' },
  { kana: 'あなた', vi: 'bạn, anh/chị, ông/bà', pos: 'Đại từ', emoji: '👉' },
  { kana: 'あのひと', kanji: 'あの人', vi: 'người kia', pos: 'Đại từ', emoji: '🧑' },
  { kana: 'あのかた', kanji: 'あの方', vi: 'vị kia (lịch sự của あのひと)', pos: 'Đại từ', emoji: '🤵' },
  { kana: 'だれ', vi: 'ai', pos: 'Nghi vấn', emoji: '❓' },
  { kana: 'どなた', vi: 'vị nào (lịch sự của だれ)', pos: 'Nghi vấn', emoji: '🎩' },
  { kana: '～さん', vi: 'anh, chị, ông, bà… (sau tên)', pos: 'Hậu tố', emoji: '🙇' },
  { kana: '～ちゃん', vi: 'bé… (hậu tố thân mật cho trẻ em)', pos: 'Hậu tố', emoji: '🧒' },
  { kana: '～じん', kanji: '～人', vi: 'người nước… (VD: ベトナムじん)', pos: 'Hậu tố', emoji: '🌏' },
  { kana: '～さい', vi: '… tuổi', pos: 'Hậu tố', emoji: '🎂' },
  { kana: 'にほん', kanji: '日本', vi: 'Nhật Bản', pos: 'Quốc gia', emoji: '🇯🇵' },
  { kana: 'ベトナム', vi: 'Việt Nam', pos: 'Quốc gia', emoji: '🇻🇳' },
  { kana: 'アメリカ', vi: 'Mỹ', pos: 'Quốc gia', emoji: '🇺🇸' },
  { kana: 'イギリス', vi: 'Anh', pos: 'Quốc gia', emoji: '🇬🇧' },
  { kana: 'インド', vi: 'Ấn Độ', pos: 'Quốc gia', emoji: '🇮🇳' },
  { kana: 'インドネシア', vi: 'Indonesia', pos: 'Quốc gia', emoji: '🇮🇩' },
  { kana: 'かんこく', kanji: '韓国', vi: 'Hàn Quốc', pos: 'Quốc gia', emoji: '🇰🇷' },
  { kana: 'タイ', vi: 'Thái Lan', pos: 'Quốc gia', emoji: '🇹🇭' },
  { kana: 'ちゅうごく', kanji: '中国', vi: 'Trung Quốc', pos: 'Quốc gia', emoji: '🇨🇳' },
  { kana: 'ドイツ', vi: 'Đức', pos: 'Quốc gia', emoji: '🇩🇪' },
  { kana: 'フランス', vi: 'Pháp', pos: 'Quốc gia', emoji: '🇫🇷' },
  { kana: 'ブラジル', vi: 'Brazil', pos: 'Quốc gia', emoji: '🇧🇷' },
  { kana: 'せんせい', kanji: '先生', vi: 'thầy/cô (gọi giáo viên, bác sĩ khi nói chuyện trực tiếp)', pos: 'Danh từ', emoji: '👩‍🏫' },
  { kana: 'きょうし', kanji: '教師', vi: 'giáo viên (khi giới thiệu nghề nghiệp)', pos: 'Danh từ', emoji: '📚' },
  { kana: 'がくせい', kanji: '学生', vi: 'học sinh', pos: 'Danh từ', emoji: '🎓' },
  { kana: 'かいしゃいん', kanji: '会社員', vi: 'nhân viên công ty (khi giới thiệu nghề nghiệp)', pos: 'Danh từ', emoji: '💼' },
  { kana: 'しゃいん', kanji: '社員', vi: 'nhân viên (luôn kèm tên công ty: ～の しゃいん)', pos: 'Danh từ', emoji: '🪪' },
  { kana: 'ぎんこういん', kanji: '銀行員', vi: 'nhân viên ngân hàng', pos: 'Danh từ', emoji: '🏦' },
  { kana: 'いしゃ', kanji: '医者', vi: 'bác sĩ', pos: 'Danh từ', emoji: '🩺' },
  { kana: 'けんきゅうしゃ', kanji: '研究者', vi: 'nhà nghiên cứu', pos: 'Danh từ', emoji: '🔬' },
  { kana: 'だいがく', kanji: '大学', vi: 'trường đại học', pos: 'Danh từ', emoji: '🏫' },
  { kana: 'びょういん', kanji: '病院', vi: 'bệnh viện', pos: 'Danh từ', emoji: '🏥' },
  { kana: 'はい', vi: 'có, vâng', pos: 'Đáp', emoji: '✅' },
  { kana: 'いいえ', vi: 'không', pos: 'Đáp', emoji: '🙅' },
  { kana: 'しつれいですが', vi: 'xin lỗi… (trước khi hỏi)', pos: 'Mẫu câu', emoji: '🙏' },
  { kana: 'おなまえは？', vi: 'tên bạn là gì?', pos: 'Mẫu câu', emoji: '📛' },
  { kana: 'はじめまして', vi: 'rất vui được gặp bạn (lần đầu gặp mặt)', pos: 'Chào hỏi', emoji: '🤝' },
  { kana: 'どうぞ よろしく おねがいします', vi: 'rất mong nhận được sự giúp đỡ', pos: 'Chào hỏi', emoji: '🙇‍♀️' },
  { kana: '～から きました', vi: 'tôi đến từ… (VD: ベトナムから きました)', pos: 'Mẫu câu', emoji: '✈️' },
  { kana: 'こちらは ～さんです', vi: 'đây là anh/chị/ông/bà…', pos: 'Mẫu câu', emoji: '🫱' },
];

/** `d`: one SVG path per stroke, in stroke order, on a 109×109 box — from KanjiVG (CC BY-SA 3.0, kanjivg.tagaini.net) */
export type KanjiItem = { ch: string; han: string; on: string; kun: string; words: [string, string, string][]; d: string[] };
export const KANJI: KanjiItem[] = [
  { ch: '日', han: 'NHẬT', on: 'ニチ・ジツ', kun: 'ひ・か',
    words: [['日よう日', 'にちようび', 'chủ nhật'], ['日', 'ひ', 'mặt trời, ngày'], ['10日', 'とおか', 'mùng 10'], ['19日', 'じゅうくにち', 'ngày 19'], ['日本', 'にほん', 'Nhật Bản'], ['日本人', 'にほんじん', 'người Nhật']],
    d: ['M31.5,24.5c1.12,1.12,1.74,2.75,1.74,4.75c0,1.6-0.16,38.11-0.09,53.5c0.02,3.82,0.05,6.35,0.09,6.75', 'M33.48,26c0.8-0.05,37.67-3.01,40.77-3.25c3.19-0.25,5,1.75,5,4.25c0,4-0.22,40.84-0.23,56c0,3.48,0,5.72,0,6', 'M34.22,55.25c7.78-0.5,35.9-2.5,44.06-2.75', 'M34.23,86.5c10.52-0.75,34.15-2.12,43.81-2.25'] },
  { ch: '月', han: 'NGUYỆT', on: 'ゲツ・ガツ', kun: 'つき',
    words: [['月よう日', 'げつようび', 'thứ hai'], ['月', 'つき', 'mặt trăng'], ['4月', 'しがつ', 'tháng 4'], ['7月', 'しちがつ', 'tháng 7']],
    d: ['M34.25,16.25c1,1,1.48,2.38,1.5,4c0.38,33.62,2.38,59.38-11,73.25', 'M36.25,19c4.12-0.62,31.49-4.78,33.25-5c4-0.5,5.5,1.12,5.5,4.75c0,2.76-0.5,49.25-0.5,69.5c0,13-6.25,4-8.75,1.75', 'M37.25,38c10.25-1.5,27.25-3.75,36.25-4.5', 'M37,58.25c8.75-1.12,27-3.5,36.25-4'] },
  { ch: '火', han: 'HỎA', on: 'カ', kun: 'ひ・ほ',
    words: [['火よう日', 'かようび', 'thứ ba'], ['火', 'ひ', 'lửa']],
    d: ['M24.25,34c3.27,3.33,8.5,13,9.5,17.75', 'M83,27.25c0.5,1.38,0.22,2.74-0.5,4.25c-2.38,5-7.5,12.12-12.75,17.25', 'M52.5,14.25c1,1.25,1.5,3.12,1.5,5C54,69,39.62,80,21,91.5', 'M52.75,50c12.49,14.06,25.01,28.42,33.62,36.13c2.7,2.42,4.9,4.02,8.38,4.87'] },
  { ch: '水', han: 'THỦY', on: 'スイ', kun: 'みず',
    words: [['水よう日', 'すいようび', 'thứ tư'], ['水', 'みず', 'nước']],
    d: ['M52.77,15.08c1.08,1.08,1.67,2.49,1.76,5.52c0.4,14.55-0.26,62.16-0.26,67.12c0,9.78-7.52,0.03-9.02-1.22', 'M17.5,45.75c1.75,0.62,3.73,0.43,5.25,0C25.88,44.88,36.09,41,38.59,40s4.47,1.24,3.75,3.5C39,54,28.25,69,19,74.75', 'M81.22,27.5c-0.22,1.25-0.72,2.25-1.52,2.97c-5.64,5.1-12.45,9.78-22.45,13.78', 'M57,46c8.82,10.73,19.23,21.46,28.42,27.42c2.16,1.4,4.52,3,7.08,3.58'] },
  { ch: '木', han: 'MỘC', on: 'モク・ボク', kun: 'き・こ',
    words: [['木よう日', 'もくようび', 'thứ năm'], ['木', 'き', 'cây']],
    d: ['M19.5,39.86c2.45,0.57,5.23,0.8,8.04,0.57C40.75,39.38,63,36.5,79.78,36.15c2.8-0.06,4.54,0.1,7.34,0.5', 'M51.75,10.5c1.19,1.19,2,3,2,5c0,8.65,0,55.15-0.14,74.75c-0.03,4.19-0.07,7.15-0.11,8.25', 'M50.75,39.5c0,1.12-0.61,2.44-1.42,3.95C41.75,57.5,26.7,73.93,15.75,80.25', 'M54.5,39c4.62,6,23,25.75,31.76,34.61c2.27,2.29,4.61,4.39,7.49,5.64'] },
  { ch: '金', han: 'KIM', on: 'キン・コン', kun: 'かね・かな',
    words: [['金よう日', 'きんようび', 'thứ sáu'], ['お金', 'おかね', 'tiền']],
    d: ['M51.75,11.88c0.25,1.52-0.22,3.57-0.8,4.84C47.73,23.79,33.13,47.1,14.5,58', 'M52.25,18.25c9.5,7.5,34.14,30.88,37.21,32.67c3.12,1.82,4.14,2.66,5.54,2.83', 'M34.02,47.08c1.69,0.65,3.85,0.36,5.6,0.21c6.91-0.6,14.33-1.69,23.99-2.64c2.07-0.2,4.1-0.4,6.15,0.12', 'M30.18,64.96c1.95,0.67,4.47,0.31,6.47,0.12c9.24-0.87,17.42-1.58,31.35-2.53c2.3-0.16,4.68-0.36,6.96,0.08', 'M51.47,48.82c0.89,0.85,0.89,3.76,0.89,4.43c0,3.64,0.27,38.71,0.22,39.82', 'M31,74.75c3.25,3,7.48,9.27,8.5,12', 'M73.01,72.11c0.24,1.14,0.11,2.46-0.54,3.51C70.38,79,66.44,83.22,63,86', 'M18.5,94.86c2.88,1.01,6.41,0.4,9.37,0.15c16.55-1.42,32.95-2.12,51.51-3c3.13-0.15,6.32-0.27,9.38,0.59'] },
  { ch: '土', han: 'THỔ', on: 'ト・ド', kun: 'つち',
    words: [['土よう日', 'どようび', 'thứ bảy'], ['土', 'つち', 'đất']],
    d: ['M26.63,50.89c1.63,0.4,4.64,0.6,6.26,0.4C43.5,50,62.12,48,75.66,46.92c2.71-0.22,4.36,0.19,5.72,0.39', 'M52.17,17.37c1.17,1.17,2.02,3.13,2.02,4.64c0,10.25,0.14,61.06,0.14,63.36', 'M15.38,87.73c2.12,0.54,6.01,0.73,8.12,0.54C46,86.25,69,84.62,90.34,83.79c3.53-0.14,5.65,0.26,7.41,0.53'] },
  { ch: '山', han: 'SƠN', on: 'サン', kun: 'やま',
    words: [['山', 'やま', 'núi'], ['火山', 'かざん', 'núi lửa']],
    d: ['M52.49,15.5c1.38,1.38,2.26,3.5,2.26,5.75c0,0.75-0.22,58.3-0.25,59.25', 'M21.49,54.5c0.88,0.88,1.39,2.25,1.26,3.75c-0.58,6.99-1,16-2.5,23c-0.7,3.26,0.11,4,2,3.75c17-2.25,47.12-5.12,65.5-6', 'M89.24,49c0.94,0.94,1.64,2.38,1.51,4.25c-0.25,3.68-1.83,20.3-2.55,28.77c-0.22,2.64-0.39,4.51-0.45,4.98'] },
  { ch: '川', han: 'XUYÊN', on: 'セン', kun: 'かわ',
    words: [['川', 'かわ', 'sông'], ['山川さん', 'やまかわさん', 'anh/chị Yamakawa']],
    d: ['M27.22,25.68c0.91,1.57,1.18,3.45,1.19,5.37C28.5,43.5,28.5,69,17.39,84.15', 'M53.75,23.63c0.94,0.94,1.41,2.37,1.41,3.9c0,0.58-0.01,28.48-0.08,41.71c-0.02,3.31-0.04,5.74-0.06,6.63', 'M85.56,15.63c1.09,1.09,1.76,2.62,1.76,4.25c0,0.74,0.23,46.86,0.09,66.12c-0.03,4.31-0.06,7.61-0.09,8.63'] },
  { ch: '田', han: 'ĐIỀN', on: 'デン', kun: 'た',
    words: [['田', 'た', 'ruộng'], ['山田さん', 'やまださん', 'anh/chị Yamada'], ['田中さん', 'たなかさん', 'anh/chị Tanaka'], ['本田さん', 'ほんださん', 'anh/chị Honda']],
    d: ['M18.25,27.48c1.2,1.2,2.11,2.68,2.28,3.95C22,42.25,23.52,62.11,24.81,80c0.17,2.4,0.34,3.75,0.49,6', 'M20.85,29.29c8.52-0.54,50.04-3.17,61.58-4.05c4.84-0.37,7.32,2.01,7.04,5.63c-0.69,8.8-2.83,30.69-3.99,46.64c-0.18,2.44-0.34,4.75-0.47,6.86', 'M53.25,29c0.88,0.88,1.19,2.12,1.19,3.5c0,9.52,0.31,46.37,0.31,47.25', 'M24,55.5c5.75-0.5,55.12-3.25,62.5-3.5', 'M25.98,83.07c14.77-0.82,39.39-2.07,58.18-2.83'] },
];

/** Can-do of the lesson: a simple self-introduction (slide "Xin chào, mình là Minh") */
export const LISTENING = {
  emoji: '🤝',
  caption: 'Khánh tự giới thiệu',
  audioText: 'はじめまして。わたしは カインです。19さいです。がくせいです。ベトナムじんです。どうぞ よろしく おねがいします。',
  passage: ['はじめまして。', 'わたしは カインです。', '19さいです。', 'がくせいです。', 'ベトナムじんです。', 'どうぞ よろしく おねがいします。'],
  vi: 'Rất vui được gặp bạn. Mình là Khánh. Mình 19 tuổi. Mình là học sinh. Mình là người Việt Nam. Rất mong nhận được sự giúp đỡ.',
  questions: [
    { q: 'カインさんは なんさいですか。', opts: ['18さい', '19さい', '20さい'], a: 1 },
    { q: 'カインさんは がくせいですか。', opts: ['はい、がくせいです', 'いいえ、きょうしです', 'いいえ、かいしゃいんです'], a: 0 },
    { q: 'カインさんは なにじんですか。', opts: ['にほんじん', 'タイじん', 'ベトナムじん'], a: 2 },
  ],
};

export type Ex =
  | { t: 'fill'; pre: string; opts: string[]; a: string; post: string; vi: string; why: string }
  | { t: 'error'; parts: string[]; wrong: number; from: string; to: string; vi: string; why: string }
  | { t: 'order'; words: string[]; vi: string }
  | { t: 'match'; pairs: [string, string][] }
  | { t: 'picture'; emoji: string; opts: string[]; a: string; vi: string }
  | { t: 'type'; vi: string; ok: string[]; why: string }
  | { t: 'kanji'; k: string; opts: string[]; a: string; vi: string }
  /** Write kanji `k` (must be in KANJI) from memory, graded stroke by stroke */
  | { t: 'write'; k: string; vi: string };

export const EX_GRAMMAR: Ex[] = [
  { t: 'fill', pre: 'わたし', opts: ['は', 'を', 'が', 'の'], a: 'は', post: 'ミンです。', vi: 'Tôi là Minh.', why: 'は là trợ từ chủ đề (đọc “wa”).' },
  { t: 'fill', pre: 'わたしは がくせい', opts: ['じゃ ありません', 'です', 'ですか', 'も'], a: 'じゃ ありません', post: '。', vi: 'Tôi không phải là học sinh.', why: 'Phủ định: N じゃ ありません.' },
  { t: 'fill', pre: 'たなかさんは にほんじん', opts: ['ですか', 'です', 'の', 'も'], a: 'ですか', post: '。', vi: 'Chị Tanaka là người Nhật phải không?', why: 'Thêm か vào cuối câu để hỏi.' },
  { t: 'fill', pre: 'わたしは がくせいです。ナムさん', opts: ['も', 'は', 'の', 'か'], a: 'も', post: 'がくせいです。', vi: 'Tôi là học sinh. Nam cũng là học sinh.', why: 'も nghĩa là “cũng”.' },
  { t: 'fill', pre: 'わたしは NKDV', opts: ['の', 'は', 'も', 'を'], a: 'の', post: 'がくせいです。', vi: 'Tôi là học sinh của NKDV.', why: 'の = “của”, nối hai danh từ.' },
  { t: 'error', parts: ['わたし', 'を', 'きょうし', 'です'], wrong: 1, from: 'を', to: 'は', vi: 'Tôi là giáo viên.', why: 'Chủ đề của câu dùng は.' },
  { t: 'error', parts: ['わたし', 'は', 'NKDV', 'を がくせいです'], wrong: 3, from: 'を', to: 'の', vi: 'Tôi là học sinh của NKDV.', why: '“Của” (thuộc về) dùng の.' },
  { t: 'order', words: ['わたしは', 'ミン', 'です'], vi: 'Tôi là Minh.' },
  { t: 'order', words: ['ホアさんは', '28さい', 'です'], vi: 'Hoa 28 tuổi.' },
  { t: 'order', words: ['わたしは', 'がくせい', 'じゃ', 'ありません'], vi: 'Tôi không phải là học sinh.' },
  { t: 'order', words: ['ナムさんは', 'にほんじん', 'ですか'], vi: 'Nam là người Nhật phải không?' },
];
export const EX_VOCAB: Ex[] = [
  { t: 'match', pairs: [['わたし', 'tôi'], ['がくせい', 'học sinh'], ['いしゃ', 'bác sĩ'], ['ぎんこういん', 'nhân viên ngân hàng'], ['だれ', 'ai']] },
  { t: 'picture', emoji: '🏥', opts: ['びょういん', 'だいがく', 'いしゃ', 'ぎんこういん'], a: 'びょういん', vi: 'bệnh viện' },
  { t: 'picture', emoji: '🔬', opts: ['がくせい', 'けんきゅうしゃ', 'かいしゃいん', 'いしゃ'], a: 'けんきゅうしゃ', vi: 'nhà nghiên cứu' },
  { t: 'picture', emoji: '🇯🇵', opts: ['ちゅうごく', 'かんこく', 'にほん', 'ベトナム'], a: 'にほん', vi: 'Nhật Bản' },
  { t: 'picture', emoji: '🏫', opts: ['びょういん', 'かいしゃいん', 'だいがく', 'いしゃ'], a: 'だいがく', vi: 'trường đại học' },
  { t: 'type', vi: 'Học sinh', ok: ['がくせい', '学生'], why: 'がくせい (学生).' },
  { t: 'type', vi: 'Người Việt Nam', ok: ['ベトナムじん', 'ベトナム人'], why: 'Tên nước + じん: ベトナムじん.' },
  { t: 'type', vi: 'Rất vui được gặp bạn (lần đầu gặp mặt)', ok: ['はじめまして', 'はじめまして。'], why: 'はじめまして.' },
];
export const EX_KANJI: Ex[] = [
  { t: 'kanji', k: '日本', opts: ['にほん', 'ひほん', 'にちほん', 'じつほん'], a: 'にほん', vi: 'Nhật Bản' },
  { t: 'kanji', k: '月よう日', opts: ['がつようび', 'げつようび', 'つきようび', 'げつようひ'], a: 'げつようび', vi: 'thứ hai' },
  { t: 'kanji', k: '水', opts: ['みず', 'みす', 'むず', 'みじ'], a: 'みず', vi: 'nước' },
  { t: 'kanji', k: '山田さん', opts: ['さんでんさん', 'やまたさん', 'やまださん', 'やまでんさん'], a: 'やまださん', vi: 'anh/chị Yamada' },
  { t: 'kanji', k: '4月', opts: ['よんがつ', 'しがつ', 'よつき', 'しげつ'], a: 'しがつ', vi: 'tháng 4' },
  { t: 'write', k: '日', vi: 'mặt trời, ngày' },
  { t: 'write', k: '山', vi: 'núi' },
  { t: 'write', k: '木', vi: 'cây' },
];
export const EX_TEST: Ex[] = [
  ...EX_GRAMMAR.filter(e => e.t === 'fill' || e.t === 'order'),
  ...EX_VOCAB.filter(e => e.t === 'picture' || e.t === 'type'),
  ...EX_KANJI.slice(0, 3),
];
