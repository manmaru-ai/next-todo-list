# NotiTask - ゲーミフィケーションで楽しく続けるタスク管理アプリ

## 📝 概要

NotiTaskは、タスク管理をゲーム感覚で楽しめるウェブアプリケーションです。従来のTodoアプリの機能に加え、ゲーミフィケーション要素を取り入れることで、タスク管理のモチベーション維持を実現しています。

**開発期間**: 20時間

## ✨ 主な機能

### 1. 直感的なタスク管理
- タスクの作成・編集・削除
- ステータス管理（未着手・進行中・完了）
- 優先度設定（高・中・低）
- タグによる分類
- 期限設定と期限通知

### 2. 効率的な整理・検索機能
- タスクの検索（タイトル、説明、タグ）
- ステータス別タブ表示
- 優先度・期限によるソート
- マルチフィルター機能

### 3. ゲーミフィケーション要素
- タスク完了でポイント獲得
  - 基本ポイント: 100pt
  - 優先度ボーナス: 高(+50pt)、中(+30pt)、低(+10pt)
- レベルアップシステム
- ポイント履歴の可視化
- タスク開始時のボーナスポイント(+10pt)

## 💡 工夫した点

### 1. UI/UXの改善
- ステータスの視覚化
  - 完了タスク: 緑色のボーダーと薄い背景
  - 進行中タスク: 青色のボーダー
  - 未着手タスク: デフォルトのボーダー
- ステータスドットによる直感的な状態把握
- レスポンシブデザインの実装

### 2. モチベーション維持の工夫
- 細かな行動へのポイント付与
- 期限切れ防止のための通知システム
- レベルシステムによる継続的な目標設定

### 3. 使いやすさの向上
- ドラッグ&ドロップなしでの簡単なステータス変更
- マルチフィルターによる柔軟な絞り込み
- タスク情報の一覧性の確保

## 🛠️ 使用技術

### フロントエンド
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/ui (UIコンポーネント)
- Lucide Icons

### 状態管理・データ永続化
- React Hooks
- LocalStorage

### 開発ツール
- Cursor

## 📚 今後の展望

1. データの永続化
   - バックエンド実装
   - ユーザー認証の追加

2. 機能の拡張
   - チーム機能の追加
   - 定期タスクの設定
   - カレンダー表示の実装

3. ゲーミフィケーションの強化
   - 実績システムの追加
   - デイリー/ウィークリーチャレンジ
   - ランキング機能

## 🚀 セットアップ方法

```bash
# リポジトリのクローン
git clone https://github.com/manmaru-ai/next-todo-list.git

# パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 💭 着想と経緯

従来のTodoアプリは機能的であっても、継続的な利用のモチベーションを維持することが難しいという課題がありました。この課題に対して、ゲーミフィケーションという解決策を採用しました。

特に注力したのは、タスクの状態を視覚的に分かりやすくすることです。色による状態の区別や、シンプルなステータス管理により、ユーザーが直感的にタスクの状態を把握できるようにしました。

## 開発履歴

- 2024年10月24日：プロジェクト開始

## ライセンス

MIT License

Copyright (c) 2024 manmaru-ai

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

また、細かな行動（タスクの開始や進捗更新）にもポイントを付与することで、小さな成功体験を積み重ねられるように工夫しました。
