# MeetUpr Frontend

Nuxt 4ベースのフロントエンドアプリケーション

## Auth0認証設定

このプロジェクトではAuth0を使用した認証機能を実装しています。

### 環境変数の設定

プロジェクトルートに`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CONNECTION=Username-Password-Authentication  # オプション: 接続名（デフォルト: Username-Password-Authentication）
AUTH0_AUDIENCE=your-auth0-api-audience  # オプション: APIを使用する場合のみ必要
```

**必須の環境変数:**
- `AUTH0_DOMAIN`: Auth0ドメイン（例: `your-tenant.auth0.com`）
- `AUTH0_CLIENT_ID`: Auth0アプリケーションのClient ID

**オプションの環境変数:**
- `AUTH0_CONNECTION`: Auth0の接続名（デフォルト: `Username-Password-Authentication`）
  - 接続名の確認方法: Auth0 Dashboard → Authentication → Database → 接続をクリック → 接続名を確認
- `AUTH0_AUDIENCE`: API Audience（バックエンドAPIと連携する場合のみ必要）

### Auth0の設定手順

このプロジェクトでは、**Authorization Code Flow with PKCE**を使用してAuth0認証を実装しています。これはAuth0が推奨する安全な認証方法です。

1. [Auth0 Dashboard](https://manage.auth0.com/)にログイン
2. 新しいアプリケーションを作成（**Single Page Application (SPA)**タイプを選択）
   - **注意**: Authorization Code Flow with PKCEを使用するため、SPAタイプで問題ありません
3. アプリケーション設定から以下を取得：
   - **Domain**: アプリケーション設定ページの上部に表示
   - **Client ID**: アプリケーション設定ページに表示
4. **Allowed Callback URLs**に以下を追加：
   - `http://localhost:3000`
   - 本番環境のURL（例: `https://your-domain.com`）
5. **Allowed Logout URLs**に以下を追加：
   - `http://localhost:3000`
   - 本番環境のURL（例: `https://your-domain.com`）
6. **Allowed Web Origins**に以下を追加（推奨）：
   - `http://localhost:3000`
   - 本番環境のURL（例: `https://your-domain.com`）
7. **デフォルト接続（Database Connection）を確認・作成**：
   - Auth0 Dashboard → Authentication → Database
   - 「Username-Password-Authentication」接続が存在し、有効になっていることを確認
   - 存在しない場合：
     - 「Create Database Connection」をクリック
     - 「Username-Password-Authentication」を選択
     - 「Create」をクリック
   - 接続名が異なる場合は、`.env`ファイルの`AUTH0_CONNECTION`に正しい接続名を設定
8. **接続をアプリケーションに有効化**（重要）：
   - Auth0 Dashboard → Applications → あなたのアプリケーション → **Connections** タブ
   - 「Username-Password-Authentication」（または設定した接続名）にチェックを入れる
   - **「Save」をクリックして保存**

### 認証フローの説明

1. **ログイン**:
   - ユーザーがカスタムフォームにメールアドレスとパスワードを入力
   - バリデーション後、Auth0のログインページにリダイレクト
   - Auth0で認証が完了すると、元のページに戻る

2. **新規登録**:
   - ユーザーがカスタムフォームにメールアドレスとパスワードを入力
   - バリデーション後、Auth0のサインアップページにリダイレクト
   - Auth0で新規登録が完了すると、プロフィール設定ページに移動

### API Audienceの設定（オプション）

バックエンドAPIと連携する場合のみ必要です：

1. Auth0 Dashboardで「APIs」メニューを開く
2. 新しいAPIを作成（または既存のAPIを選択）
3. **Identifier**（Audience）をコピーして`.env`の`AUTH0_AUDIENCE`に設定

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
