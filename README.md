# Twitter Clone

Hono と Next.js で構築された Twitter クローンアプリケーション

## 機能

- ユーザー認証（サインアップ・ログイン）
- ツイートの作成・削除
- ツイートへのいいね・いいね解除
- ユーザーのフォロー・アンフォロー
- タイムライン（フォローしているユーザーのツイート表示）
- ユーザープロフィールページ

## 技術スタック

### バックエンド
- Hono - 高速な Web フレームワーク
- Drizzle ORM - TypeScript ORM
- SQLite - データベース
- bcrypt - パスワードハッシュ化
- JWT - 認証トークン
- Zod - バリデーション

### フロントエンド
- Next.js 14 - React フレームワーク
- TypeScript
- Tailwind CSS - スタイリング
- Axios - HTTP クライアント
- date-fns - 日付フォーマット

## セットアップ

### 1. バックエンドの起動

```bash
cd backend
npm install
npm run db:generate  # データベーススキーマの生成
npm run db:migrate   # マイグレーション実行
npm run dev          # 開発サーバー起動（ポート: 4000）
```

### 2. フロントエンドの起動

別のターミナルで:

```bash
cd frontend
npm install
npm run dev  # 開発サーバー起動（ポート: 3000）
```

## 使い方

1. ブラウザで http://localhost:3000 を開く
2. サインアップページでアカウントを作成
3. ログイン後、タイムラインが表示される
4. ツイートを投稿したり、他のユーザーをフォローしたりできます

## API エンドポイント

### 認証
- `POST /api/auth/signup` - ユーザー登録
- `POST /api/auth/login` - ログイン

### ユーザー
- `GET /api/users/me` - 現在のユーザー情報取得
- `GET /api/users/:username` - ユーザープロフィール取得
- `GET /api/users/:username/tweets` - ユーザーのツイート取得
- `POST /api/users/:username/follow` - ユーザーをフォロー
- `DELETE /api/users/:username/follow` - ユーザーをアンフォロー

### ツイート
- `GET /api/tweets/timeline` - タイムライン取得
- `POST /api/tweets` - ツイート作成
- `GET /api/tweets/:id` - ツイート取得
- `DELETE /api/tweets/:id` - ツイート削除
- `POST /api/tweets/:id/like` - ツイートにいいね
- `DELETE /api/tweets/:id/like` - ツイートのいいねを解除

## プロジェクト構造

```
.
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts      # データベーススキーマ
│   │   │   ├── index.ts       # DB接続
│   │   │   └── migrate.ts     # マイグレーションスクリプト
│   │   ├── routes/
│   │   │   ├── auth.ts        # 認証ルート
│   │   │   ├── tweets.ts      # ツイートルート
│   │   │   └── users.ts       # ユーザールート
│   │   ├── middleware/
│   │   │   └── auth.ts        # 認証ミドルウェア
│   │   ├── utils/
│   │   │   └── auth.ts        # 認証ユーティリティ
│   │   └── index.ts           # エントリーポイント
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx     # レイアウト
    │   │   ├── page.tsx       # ホームページ
    │   │   ├── login/         # ログインページ
    │   │   ├── signup/        # サインアップページ
    │   │   └── [username]/    # ユーザープロフィールページ
    │   ├── components/
    │   │   ├── Navbar.tsx     # ナビゲーションバー
    │   │   ├── TweetCard.tsx  # ツイートカード
    │   │   └── TweetComposer.tsx  # ツイート作成フォーム
    │   ├── contexts/
    │   │   └── AuthContext.tsx    # 認証コンテキスト
    │   ├── lib/
    │   │   └── api.ts         # API クライアント
    │   └── types/
    │       └── index.ts       # 型定義
    ├── package.json
    └── tsconfig.json
```

## 開発

- バックエンド: `npm run dev` でホットリロード対応の開発サーバーが起動します
- フロントエンド: `npm run dev` でホットリロード対応の開発サーバーが起動します
- データベース: `npm run db:studio` で Drizzle Studio を起動してデータを確認できます
