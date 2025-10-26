# Twitter Clone

Hono と Next.js で構築された Twitter クローンアプリケーション

## 機能

- ユーザー認証（サインアップ・ログイン）
- **Google OAuth 認証**
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
- google-auth-library - Google OAuth 認証
- Zod - バリデーション

### フロントエンド
- Next.js 14 - React フレームワーク
- TypeScript
- Tailwind CSS - スタイリング
- @react-oauth/google - Google Sign-In ボタン
- Axios - HTTP クライアント
- date-fns - 日付フォーマット

## 前提条件

このプロジェクトは **Bun** を使用しています。

### Bun のインストール

まだインストールしていない場合は、以下のコマンドでインストールしてください：

#### macOS / Linux
```bash
curl -fsSL https://bun.sh/install | bash
```

#### Windows (PowerShell)
```powershell
powershell -c "irm bun.sh/install.ps1|iex"
```

インストール後、バージョンを確認：
```bash
bun --version
```

## セットアップ

### 1. Google OAuth の設定

Google Sign-In を使用するには、Google Cloud Console で OAuth 2.0 クライアント ID を作成する必要があります。

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. 「API とサービス」→「認証情報」に移動
4. 「認証情報を作成」→「OAuth クライアント ID」を選択
5. アプリケーションの種類: 「ウェブアプリケーション」を選択
6. 承認済みの JavaScript 生成元に追加:
   - `http://localhost:3000`
7. 承認済みのリダイレクト URI に追加:
   - `http://localhost:3000`
8. 作成後、クライアント ID をコピー

### 2. 環境変数の設定

#### バックエンド

`backend/.env` ファイルを作成:

```bash
# backend/.env
GOOGLE_CLIENT_ID=あなたのGoogle-Client-ID.apps.googleusercontent.com
JWT_SECRET=your-secret-key-change-in-production
```

#### フロントエンド

`frontend/.env.local` ファイルを作成:

```bash
# frontend/.env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=あなたのGoogle-Client-ID.apps.googleusercontent.com
```

### 3. バックエンドの起動

```bash
cd backend
bun install
bun run db:generate  # データベーススキーマの生成
bun run db:migrate   # マイグレーション実行
bun run dev          # 開発サーバー起動（ポート: 4000）
```

### 4. フロントエンドの起動

別のターミナルで:

```bash
cd frontend
bun install
bun run dev  # 開発サーバー起動（ポート: 3000）
```

## 使い方

1. ブラウザで http://localhost:3000 を開く
2. 以下のいずれかの方法でアカウントを作成:
   - **Google でサインイン**: Google ボタンをクリックして即座にログイン
   - 通常のサインアップ: メールアドレスとパスワードでアカウント作成
3. ログイン後、タイムラインが表示される
4. ツイートを投稿したり、他のユーザーをフォローしたりできます

## API エンドポイント

### 認証
- `POST /api/auth/signup` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `POST /api/auth/google` - Google OAuth 認証

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

- バックエンド: `bun run dev` でホットリロード対応の開発サーバーが起動します
- フロントエンド: `bun run dev` でホットリロード対応の開発サーバーが起動します
- データベース: `bun run db:studio` で Drizzle Studio を起動してデータを確認できます

## Bun vs npm/yarn

Bunを使用する利点:
- ⚡️ **高速**: npm/yarn より大幅に高速なインストールと実行速度
- 🎯 **TypeScript ネイティブサポート**: tsx/ts-node 不要
- 📦 **オールインワン**: パッケージマネージャー + ランタイム + テストランナー
- 🔄 **互換性**: npm/yarn のパッケージがそのまま使用可能

### コマンド対応表

| npm | Bun |
|-----|-----|
| `npm install` | `bun install` |
| `npm run dev` | `bun run dev` または `bun dev` |
| `npm run build` | `bun run build` |
| `node script.js` | `bun script.js` |
