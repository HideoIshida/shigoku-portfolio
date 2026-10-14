# 写真ポートフォリオサイト

HTML / CSS / JavaScript だけの静的サイトです（ビルド不要）。GitHub Pages でそのまま公開できます。

```
index.html        ページ本体（文章・About・Services・Contact はここを編集）
assets/style.css  デザイン（色は先頭の :root）
assets/app.js     Topの演出・絞り込み・もっと見る・拡大表示
data/works.js     ★ 作品の一覧（写真を足す／Topの6枚を変えるのはここ）
images/profile.webp プロフィール写真（About）
images/works/     作品（拡大用）　images/works/thumb/ 一覧用の小さい版
tools/optimize.py 写真を変換して works.js 用の行を出力
originals/        元データ置き場（.gitignore 済み）
```

## 写真を追加する
1. 元データを `originals/` に置く
2. `python tools/optimize.py originals/DSC0001.jpg nature_forest`（初回のみ `pip install pillow`）
   名前の前半がカテゴリー（`nature` / `event` / `space` / `portrait`）
3. 表示された1行を `data/works.js` に貼る（上にあるほど先に表示）。`title` / `place` / `alt` を書き換える
4. `git add . && git commit -m "add photo" && git push`

## 撮影年について
`optimize.py` は、元データのEXIF（撮影日時）から撮影年を自動で `year` に入れます。
EXIFが無い写真（書き出し時にメタデータを削除したものなど）は `20XX` になるので、
`python tools/optimize.py originals/x.jpg nature_forest 2025` のように第3引数で指定するか、`works.js` の `year` を直接書き換えてください。
Lightroom などで元データから書き出す場合は、メタデータを「すべて含める」にしておくと自動取得できます。

## 位置情報（将来の地図表示用）
座標は画像ではなく `data/works.js` の `lat` / `lng` に持たせます。変換後の画像（webp）にEXIFは含まれないので、
画像を保存されても撮影場所は分かりません。`optimize.py` が元データのGPSを読み、自動で `lat` / `lng` を入れます。

- 既定は小数2桁（約1km）に丸めます。`--precision 3`（約100m）、`--precision 4`（約10m）で変更
- EXIFにGPSが無い写真: Googleマップで場所を右クリック → 座標をコピーし `--latlng "35.6586, 139.7454"` で指定
- 地図に出したくない写真（自然写真の貴重な場所など）: `--no-map` を付ける、または `lat` / `lng` を書かない
- 現在の `works.js` で座標が入っているのは `portrait_dj-1`（元データのGPSから、小数2桁）のみ

## Topの6枚を変える
`data/works.js` で、Topに出したい作品の `top` に 1〜6 を付けます（他は 0）。数字の順に、スクロールで重なって出てきます。
1枚目にはキャッチコピーとコンセプト文が載ります（文は `index.html` の `<template id="tpl-first">`）。
写真の切り取り位置は `pos`（例 `"30% 50%"`）で調整できます。スマホで被写体が切れるときに変えてください。

## よく変える場所
- **プロフィール写真**: `images/profile.webp` を差し替え。切り取り位置は `assets/style.css` の `.about .prof` の `object-position`
- 最初に見せる枚数: `assets/app.js` 先頭の `LIMIT` と `STEP`
- 写真が1枚もないカテゴリーのボタンは、自動で非表示になります（写真を追加すると表示されます）
- カテゴリー名の変更・追加: `index.html` のフィルターボタン（`data-f`）、`app.js` の `NAMES`、`works.js` の `cat` を揃える
- 使用機材・受賞歴・プロフィール: `index.html` の About 内

## ローカルで確認
`index.html` をブラウザで開く。表示がおかしいときは `python -m http.server 8000` → http://localhost:8000

## GitHub Pages で公開
リポジトリへ push → Settings → Pages → Branch を `main` / `/ (root)` にして Save → 数分後に `https://<ユーザー名>.github.io/<リポジトリ名>/`

## お問い合わせフォーム
現状は画面上の動作のみ。Formspree などを使う場合は `<form id="f">` に `action` と `method="post"` を設定し、`app.js` 末尾のsubmit処理を削除してください。

## 注意
`title` / `place`、プロフィール、料金、メールアドレスはダミーです。`originals/` はGitHubに上げないでください。
