// Bài 1 — Minna no Nihongo (Vietnamese notes). Replace with slide content when available.
export const LESSON = { no: 1, total: 50, title: 'はじめまして', sub: 'Chào hỏi · Tự giới thiệu', mark: '初' };
/** Locked lessons previewed in the home carousel */
export const UPCOMING = [{ no: 2, title: 'これは ほんです' }, { no: 3, title: 'ここは きょうしつです' }];

export type GrammarPoint = { id: string; tab: string; pattern: string; meaning: string; examples: [string, string][]; tip: string };
export const GRAMMAR: GrammarPoint[] = [
  { id: '1.1', tab: 'は', pattern: 'N1 は N2 です', meaning: 'N1 là N2. は là trợ từ chủ đề, です là động từ “là” (lịch sự).',
    examples: [['わたしは マイク・ミラーです。', 'Tôi là Mike Miller.'], ['サントスさんは がくせいです。', 'Anh Santos là học sinh.']], tip: 'は khi làm trợ từ đọc là “wa”, không phải “ha”.' },
  { id: '1.2', tab: 'じゃ ありません', pattern: 'N1 は N2 じゃ ありません', meaning: 'Dạng phủ định: N1 không phải là N2.',
    examples: [['サントスさんは がくせいじゃ ありません。', 'Anh Santos không phải học sinh.'], ['わたしは せんせいじゃ ありません。', 'Tôi không phải giáo viên.']], tip: 'Trang trọng hơn: ではありません.' },
  { id: '1.3', tab: 'か', pattern: 'S + か', meaning: 'Thêm か vào cuối câu để tạo câu hỏi. Lên giọng ở cuối câu.',
    examples: [['ミラーさんは かいしゃいんですか。', 'Anh Miller là nhân viên công ty phải không?'], ['はい、かいしゃいんです。', 'Vâng, tôi là nhân viên công ty.']], tip: 'Trả lời: はい (vâng) / いいえ (không).' },
  { id: '1.4', tab: 'も', pattern: 'N1 も N2 です', meaning: 'も = “cũng”. Thay は khi thông tin giống câu trước.',
    examples: [['わたしも かいしゃいんです。', 'Tôi cũng là nhân viên công ty.'], ['ミラーさんも エンジニアですか。', 'Anh Miller cũng là kỹ sư à?']], tip: 'も thay thế は, không đi cùng は.' },
  { id: '1.5', tab: 'の', pattern: 'N1 の N2', meaning: 'の nối hai danh từ, N1 bổ nghĩa (thuộc về/thuộc tổ chức) cho N2.',
    examples: [['IMCの しゃいんです。', 'Là nhân viên của IMC.'], ['ミラーさんは にほんごの せんせいです。', 'Anh Miller là giáo viên tiếng Nhật.']], tip: 'Tương tự “của” trong tiếng Việt.' },
];

export type Word = { kana: string; kanji?: string; vi: string; pos: string; emoji: string };
export const VOCAB: Word[] = [
  { kana: 'わたし', kanji: '私', vi: 'tôi', pos: 'Đại từ', emoji: '🙋' },
  { kana: 'あなた', vi: 'bạn', pos: 'Đại từ', emoji: '🫵' },
  { kana: 'あのひと', kanji: 'あの人', vi: 'người kia', pos: 'Đại từ', emoji: '🧑' },
  { kana: 'せんせい', kanji: '先生', vi: 'giáo viên', pos: 'Danh từ', emoji: '👩‍🏫' },
  { kana: 'がくせい', kanji: '学生', vi: 'học sinh, sinh viên', pos: 'Danh từ', emoji: '🎓' },
  { kana: 'かいしゃいん', kanji: '会社員', vi: 'nhân viên công ty', pos: 'Danh từ', emoji: '💼' },
  { kana: 'ぎんこういん', kanji: '銀行員', vi: 'nhân viên ngân hàng', pos: 'Danh từ', emoji: '🏦' },
  { kana: 'いしゃ', kanji: '医者', vi: 'bác sĩ', pos: 'Danh từ', emoji: '🩺' },
  { kana: 'エンジニア', vi: 'kỹ sư', pos: 'Danh từ', emoji: '🛠️' },
  { kana: 'だいがく', kanji: '大学', vi: 'đại học', pos: 'Danh từ', emoji: '🏫' },
  { kana: 'びょういん', kanji: '病院', vi: 'bệnh viện', pos: 'Danh từ', emoji: '🏥' },
  { kana: 'だれ', vi: 'ai', pos: 'Nghi vấn', emoji: '❓' },
  { kana: 'はい', vi: 'vâng', pos: 'Đáp', emoji: '✅' },
  { kana: 'いいえ', vi: 'không', pos: 'Đáp', emoji: '🙅' },
  { kana: 'はじめまして', vi: 'rất hân hạnh được gặp', pos: 'Chào hỏi', emoji: '🤝' },
];

/** `d`: one SVG path per stroke, in stroke order, on a 109×109 box — from KanjiVG (CC BY-SA 3.0, kanjivg.tagaini.net) */
export type KanjiItem = { ch: string; han: string; on: string; kun: string; words: [string, string, string][]; d: string[] };
export const KANJI: KanjiItem[] = [
  { ch: '私', han: 'TƯ', on: 'シ', kun: 'わたし', words: [['私', 'わたし', 'tôi']],
    d: ['M45.24,13.5c0.01,1-0.5,2.25-1.43,2.99C39.75,19.75,31.75,23.88,18.75,29', 'M11.62,44.6c2.63,0.78,5.51,0.5,7.28,0.17c9.98-1.89,22.62-3.29,30.72-4.06c1.29-0.12,3.13-0.21,4.36,0.12', 'M36.08,26.66c0.95,0.95,1.41,2.84,1.41,4.69c0,3.83,0,40.18-0.04,55.4c-0.01,3.25-0.02,5.59-0.03,6.5', 'M35.93,43.47c0,1.03-0.71,2.97-1.36,4.2C29.27,57.83,21.15,69.5,10.5,77.5', 'M41,49.75c4.4,2.51,8.13,7.52,10.5,10.75', 'M73.3,31.9c0.32,1.22,0.34,2.31-0.06,3.51C68.25,50.5,59.75,65.25,52.08,78.31c-2.12,3.61-1.6,5.03,1.88,3.89C66,78.25,76.62,74.12,88.28,69.98', 'M82.81,60.54c4.45,4.37,11.49,17.97,12.61,24.77'] },
  { ch: '人', han: 'NHÂN', on: 'ジン・ニン', kun: 'ひと', words: [['人', 'ひと', 'người'], ['日本人', 'にほんじん', 'người Nhật']],
    d: ['M54.5,20c0.37,2.12,0.23,4.03-0.22,6.27C51.68,39.48,38.25,72.25,16.5,87.25', 'M46,54.25c6.12,6,25.51,22.24,35.52,29.72c3.66,2.73,6.94,4.64,11.48,5.53'] },
  { ch: '先', han: 'TIÊN', on: 'セン', kun: 'さき', words: [['先生', 'せんせい', 'giáo viên']],
    d: ['M37.51,21c0.07,0.62,0.15,1.61-0.14,2.49C35.25,29.88,31.62,37.38,24.5,45', 'M38.13,32.04c1.5,0.09,3.95-0.16,4.64-0.22c6.48-0.57,20.36-1.82,27.82-2.94c1.65-0.25,3.66-0.13,5.16,0.27', 'M52.81,12.38c1.28,1.28,2.01,3.12,2.01,4.75c0,0.75-0.05,31.92-0.07,32.87', 'M15.88,53.26c3.42,0.98,7.15,0.5,10.62,0.22c15.99-1.3,38.99-3.55,59-4.4c2.94-0.13,5.84-0.03,8.75,0.47', 'M45.18,55.68c0.32,1.45,0.15,2.48-0.15,3.85C43.24,67.65,35,86.62,20,96.38', 'M60.49,53.62c1.07,1.07,1.38,2.71,1.38,4.98c0,7.78-0.22,14.88-0.22,21.89c0,15.14,1.1,16.04,15.85,16.04c14.62,0,15.64-1.78,15.64-11.29'] },
  { ch: '学', han: 'HỌC', on: 'ガク', kun: 'まなぶ', words: [['学生', 'がくせい', 'học sinh'], ['大学', 'だいがく', 'đại học']],
    d: ['M29.5,17.25c3.5,3,6.5,7.25,7.75,9.75', 'M49,12c1.25,2,4.75,8.25,5.25,11.5', 'M75,11c0.25,1.75-0.12,2.75-0.75,4.25c-1.29,3.1-4.25,7.38-6.5,9.75', 'M21.25,33.75c-0.12,4.75-2,12.5-3.75,16.25', 'M23.5,36.5c17-1.62,42.38-5.5,60-5.75c9.5-0.13,4.12,5.12,0,9', 'M37.25,46.5c1,0.25,3.75,0.25,5.5-0.25s18.25-4,20-4s2.75,0.75,1,2.25S54.5,53.5,53,54.75', 'M50.75,55.75c4,8.75,7.18,24.67,1.75,38c-2.75,6.75-7.75,1.25-9.75-2', 'M15.75,67.75c1.75,1,4.64,1.36,7.5,1c15.88-2,44.43-6.25,61.37-5.5c2.5,0.11,4.72,0.25,6.39,1'] },
  { ch: '生', han: 'SINH', on: 'セイ・ショウ', kun: 'いきる・うまれる', words: [['学生', 'がくせい', 'học sinh'], ['先生', 'せんせい', 'giáo viên']],
    d: ['M31.26,25.89c0.36,1.36,0.35,2.65-0.05,3.79c-2.34,6.69-7.24,17.22-14.96,24.19', 'M31.13,40.67c2.37,0.33,4.03,0.07,5.64-0.12c9.5-1.1,25.15-4.12,35.35-5.83c2.51-0.42,4.86-0.73,7.38-0.33', 'M52.31,12.63c1.28,1.28,2.01,3.12,2.01,5.23c0,4.01,0,65.14,0,69.77', 'M29.38,64.03c2.64,0.67,5.38,0.31,8.04-0.02C49.45,62.51,62.16,61,72.5,59.86c2.38-0.26,4.99-0.76,7.38-0.23', 'M15.75,90.25c3.04,0.75,6.21,0.94,8.4,0.8C40.62,90,68.12,86.5,83.3,85.75c3.63-0.18,7.68,0,10.07,0.73'] },
];

export const LISTENING = {
  emoji: '🤝',
  caption: 'Mike Miller tự giới thiệu',
  audioText: 'はじめまして。わたしは マイク・ミラーです。アメリカじんです。IMCの しゃいんです。どうぞ よろしく。',
  passage: ['はじめまして。', 'わたしは マイク・ミラーです。', 'アメリカじんです。', 'IMCの しゃいんです。', 'どうぞ よろしく。'],
  vi: 'Rất hân hạnh được gặp. Tôi là Mike Miller. Tôi là người Mỹ. Tôi là nhân viên của công ty IMC. Rất mong được giúp đỡ.',
  questions: [
    { q: 'ミラーさんは なんじんですか。', opts: ['アメリカじん', 'にほんじん', 'ちゅうごくじん'], a: 0 },
    { q: 'ミラーさんの しごとは なんですか。', opts: ['せんせい', 'かいしゃいん', 'いしゃ'], a: 1 },
    { q: 'ミラーさんの かいしゃは どこですか。', opts: ['ABC', 'IMC', 'JICA'], a: 1 },
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
  { t: 'fill', pre: 'わたし', opts: ['は', 'を', 'が', 'の'], a: 'は', post: 'がくせいです。', vi: 'Tôi là học sinh.', why: 'は là trợ từ chủ đề (đọc “wa”).' },
  { t: 'fill', pre: 'ミラーさん', opts: ['も', 'は', 'の', 'か'], a: 'も', post: 'かいしゃいんです。', vi: 'Anh Miller cũng là nhân viên công ty.', why: 'も nghĩa là “cũng”.' },
  { t: 'fill', pre: 'IMC', opts: ['の', 'は', 'も', 'を'], a: 'の', post: 'しゃいんです。', vi: 'Nhân viên của IMC.', why: 'の nối hai danh từ.' },
  { t: 'fill', pre: 'サントスさんは がくせい', opts: ['じゃ ありません', 'です', 'ですか', 'でした'], a: 'じゃ ありません', post: '。', vi: 'Anh Santos không phải học sinh.', why: 'Phủ định: N じゃ ありません.' },
  { t: 'error', parts: ['わたし', 'を', 'がくせい', 'です'], wrong: 1, from: 'を', to: 'は', vi: 'Tôi là học sinh.', why: 'Chủ đề của câu dùng は.' },
  { t: 'error', parts: ['わたし', 'は', 'IMC', 'を しゃいんです'], wrong: 3, from: 'を', to: 'の', vi: 'Tôi là nhân viên của IMC.', why: 'Sở hữu/thuộc về dùng の.' },
  { t: 'order', words: ['わたしは', 'マイク・ミラー', 'です'], vi: 'Tôi là Mike Miller.' },
  { t: 'order', words: ['サントスさんは', 'がくせい', 'じゃ', 'ありません'], vi: 'Anh Santos không phải học sinh.' },
  { t: 'order', words: ['あなたも', 'せんせい', 'ですか'], vi: 'Bạn cũng là giáo viên phải không?' },
];
export const EX_VOCAB: Ex[] = [
  { t: 'match', pairs: [['わたし', 'tôi'], ['せんせい', 'giáo viên'], ['がくせい', 'học sinh'], ['いしゃ', 'bác sĩ'], ['かいしゃいん', 'nhân viên công ty']] },
  { t: 'picture', emoji: '🏥', opts: ['びょういん', 'だいがく', 'いしゃ', 'エンジニア'], a: 'びょういん', vi: 'bệnh viện' },
  { t: 'picture', emoji: '👩‍🏫', opts: ['がくせい', 'せんせい', 'ぎんこういん', 'だれ'], a: 'せんせい', vi: 'giáo viên' },
  { t: 'picture', emoji: '🏫', opts: ['びょういん', 'かいしゃいん', 'だいがく', 'いしゃ'], a: 'だいがく', vi: 'đại học' },
  { t: 'type', vi: 'Học sinh', ok: ['がくせい', '学生'], why: 'がくせい (学生).' },
  { t: 'type', vi: 'Giáo viên', ok: ['せんせい', '先生'], why: 'せんせい (先生).' },
  { t: 'type', vi: 'Vâng', ok: ['はい'], why: 'はい.' },
];
export const EX_KANJI: Ex[] = [
  { t: 'kanji', k: '学生', opts: ['がくせい', 'がくしょう', 'がっせい', 'かくせい'], a: 'がくせい', vi: 'học sinh' },
  { t: 'kanji', k: '先生', opts: ['さきせい', 'せんせい', 'せんしょう', 'ぜんせい'], a: 'せんせい', vi: 'giáo viên' },
  { t: 'kanji', k: '私', opts: ['あなた', 'わたち', 'わたし', 'われし'], a: 'わたし', vi: 'tôi' },
  { t: 'kanji', k: '大学', opts: ['だいがく', 'だいがっく', 'たいがく', 'だいかく'], a: 'だいがく', vi: 'đại học' },
  { t: 'write', k: '人', vi: 'người' },
  { t: 'write', k: '生', vi: 'sinh sống, học sinh' },
];
export const EX_TEST: Ex[] = [
  ...EX_GRAMMAR.filter(e => e.t === 'fill' || e.t === 'order'),
  ...EX_VOCAB.filter(e => e.t === 'picture' || e.t === 'type'),
  ...EX_KANJI.slice(0, 3),
];
