# Google OAuth セットアップガイド

## エラー「Missing required parameter: client_id」の解決方法

### 1. フロントエンドサーバーを再起動

`.env.local` ファイルを作成・更新した後は、Next.js サーバーを再起動する必要があります。

```bash
# 現在実行中のフロントエンドサーバーを停止 (Ctrl+C)
# その後、再度起動
cd frontend
npm run dev
```

### 2. Google Cloud Console の設定確認

#### Step 1: OAuth 同意画面の設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 左メニューから「APIとサービス」→「OAuth 同意画面」を選択
3. 「User Type」を選択:
   - **外部**: テスト中は誰でもアクセス可能
   - 内部: Google Workspace ユーザーのみ
4. アプリケーション名を入力: `Twitter Clone` など
5. ユーザーサポートメール: あなたのメールアドレス
6. 承認済みドメイン（オプション）
7. デベロッパーの連絡先情報: あなたのメールアドレス
8. 「保存して次へ」をクリック
9. スコープ（Scopes）: デフォルトのままで OK
10. テストユーザー: あなたのメールアドレスを追加（外部の場合）
11. 「保存して次へ」→「ダッシュボードに戻る」

#### Step 2: OAuth クライアント ID の作成/確認

1. 左メニューから「認証情報」を選択
2. 「認証情報を作成」→「OAuth クライアント ID」をクリック
3. アプリケーションの種類: **ウェブアプリケーション**
4. 名前: `Twitter Clone Web Client` など
5. **承認済みの JavaScript 生成元**に以下を追加:
   ```
   http://localhost:3000
   ```
6. **承認済みのリダイレクト URI**に以下を追加:
   ```
   http://localhost:3000
   ```
7. 「作成」をクリック
8. クライアント ID が表示されるのでコピー

#### Step 3: クライアント ID の確認

現在の設定:
```
23293610027-d9ag06q3hkeu3cidlhbnd91vnure45o3.apps.googleusercontent.com
```

この形式が正しいかGoogle Cloud Consoleで確認してください。

### 3. 環境変数の確認

#### backend/.env
```bash
GOOGLE_CLIENT_ID=23293610027-d9ag06q3hkeu3cidlhbnd91vnure45o3.apps.googleusercontent.com
JWT_SECRET=your-secret-key-change-in-production
```

#### frontend/.env.local
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=23293610027-d9ag06q3hkeu3cidlhbnd91vnure45o3.apps.googleusercontent.com
```

### 4. ブラウザのキャッシュをクリア

Google Sign-In ボタンのキャッシュが残っている場合があります:

1. Chrome/Edge: `Ctrl+Shift+Delete` (Mac: `Cmd+Shift+Delete`)
2. 「キャッシュされた画像とファイル」を選択
3. 「データを削除」をクリック
4. ページを再読み込み

### 5. 開発者ツールでの確認

1. ブラウザで `http://localhost:3000/login` を開く
2. F12 キーで開発者ツールを開く
3. Console タブで以下を確認:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
   ```
   クライアント ID が正しく表示されるか確認

### トラブルシューティング

#### エラー: "Missing required parameter: client_id"

**原因**: フロントエンドの環境変数が読み込まれていない

**解決策**:
1. `frontend/.env.local` ファイルが存在することを確認
2. ファイル名が正確に `.env.local` であることを確認（`.env.local.example` ではない）
3. フロントエンドサーバーを再起動
4. ブラウザのキャッシュをクリア

#### エラー: "Error 400: redirect_uri_mismatch"

**原因**: Google Cloud Console の承認済み URI が一致していない

**解決策**:
1. Google Cloud Console で承認済み JavaScript 生成元に `http://localhost:3000` を追加
2. 承認済みリダイレクト URI に `http://localhost:3000` を追加

#### エラー: "Access blocked: This app's request is invalid"

**原因**: OAuth 同意画面が正しく設定されていない

**解決策**:
1. OAuth 同意画面を完了させる
2. テストユーザーにあなたのメールアドレスを追加（外部アプリの場合）

### 6. 動作確認

1. バックエンドサーバーが起動していることを確認: `http://localhost:4000`
2. フロントエンドサーバーを再起動: `cd frontend && npm run dev`
3. `http://localhost:3000/login` にアクセス
4. Google Sign-In ボタンが表示されることを確認
5. Google ボタンをクリックしてログイン
