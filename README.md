# THE MENKO

スマホ縦持ち向けの、工作 × メンコアクション。説明を短く、指で押しやすい大きな文字とボタンで構成しています。

## 遊ぶ

**[ブラウザで遊ぶ](https://cadmium2525.github.io/THE_MENKO/)** — スマートフォンでは縦持ちで開いてください。

`npm run build` で作成される `THE-MENKO.html` は、ブラウザで開くだけで遊べる自己完結版です。音声も内蔵しており、ネット接続は不要です。

開発版は Node.js で `npm start` を実行し、`http://localhost:5173` を開きます。同じWi-Fiのスマートフォンからは、このPCのLANアドレスのポート5173に接続してください。接続できない場合は公開版を利用してください。

- 紙を切る：厚みを調整し「一発カット」。刃の往復・長押しでも切断。
- 外形：丸・四角・星・いびつ、または指で閉じた輪郭を描く。
- 表裏：色と太さを選んで描画。消しゴム、戻す、おまかせ、白紙に対応。
- 無双：盤面で狙いを決めて指を離す。連戦で対象数が増え、500枚を超える。
- 対決：CPU3段階／同じ端末の2人交互プレイ。1〜3本先取。
- PC：矢印キーで狙い、EnterまたはSpaceで発射。
- 設定：音量、消音、揺れ軽減、振動。初回の音はOFF。

名前・設計・表裏の絵・ベスト記録はlocalStorageに保存します。ブラウザ、公開先URL、HTMLファイルの場所を変えると別の保存領域になります。プライベートブラウズや容量不足では保存できないことがあります。

## 構成

- `src/model.js`：輪郭検証、性能、無双の連鎖、対決判定。描画から独立。
- `src/render.js`：Canvas描画。紙、メンコ、工作机、路地、風圧の演出。
- `src/app.js`：画面遷移、入力、保存、対戦進行。
- `src/audio.js`：ユーザー操作後の音声再生とミュート。
- `audio-source/`：かなでる用の楽曲・効果音JSON。
- `assets/audio/`：生成済みWAV。再生成なしで遊べます。
- `tests/model.test.mjs`：大量盤面、二重加算防止、輪郭、バランス、対決。

厳密な剛体物理ではなく、形状・重量・重心の偏り・着弾距離による軽量なゲーム用判定です。大量盤面は最大176グループで判定・描画し、グループごとの枚数をスコアに加算します。ゲームルールに500枚上限はありません。4種類の盤面に、それぞれ薄い大型／厚い小型／精密小型／星形の得意条件があります。

## 音源

ユーザー指定の [cadmium2525/mp4mp3](https://github.com/cadmium2525/mp4mp3) の「かなでる」エンジンで作成しました。琴・マリンバ・ベース・打楽器のオリジナルBGMと、impact/page/pop/success/tapを調整したSEです。素材の外部通信、課金API、サーバー処理はありません。

再生成する場合：

```sh
git clone --depth 1 https://github.com/cadmium2525/mp4mp3.git tools/mp4mp3
npm run audio
npm run build
```

元リポジトリのエンジンコードは配信物に含めていません。出典・コミットは `audio-source/PROVENANCE.md` に記録しています。

## 検証

```sh
npm test
npm run build
```

Playwrightの操作テストは `scripts/playtest.mjs` と `scripts/edge-cases.mjs`。PlaywrightとEdgeが必要です。通常はプロジェクトにインストールしたPlaywrightを読み込みます。共用ランタイムを使う場合は `PLAYWRIGHT_PACKAGE_JSON` にそのPlaywrightのpackage.jsonの絶対パスを指定できます。公開版を検証する場合は `MENKO_TEST_URL` に公開URLを指定してください。

## GitHub Pages

公開リポジトリは [cadmium2525/THE_MENKO](https://github.com/cadmium2525/THE_MENKO) です。Pagesの配信元は `main` ブランチの `/(root)`。ビルド不要のため、ソース更新をpushするとGitHub Pagesに反映されます。

別の配信環境では `npm run build` が出力する `dist/` の内容を配置してください。相対パスで動くため、サブディレクトリ配信に対応しています。

画像生成は使わず、編集できるメンコと背景をCanvasで直接描画しています。スマートフォン実機でのSafari検証は未実施です。
