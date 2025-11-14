# MeetUpr Frontend

Nuxt 4ベースのフロントエンドアプリケーション

## Auth0認証設定

このプロジェクトではAuth0を使用した認証機能を実装しています。

### 環境変数の設定

プロジェクトルートに`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_AUDIENCE=your-auth0-api-audience  # オプション: APIを使用する場合のみ必要
```

**必須の環境変数:**
- `AUTH0_DOMAIN`: Auth0ドメイン（例: `your-tenant.auth0.com`）
- `AUTH0_CLIENT_ID`: Auth0アプリケーションのClient ID
- `AUTH0_CLIENT_SECRET`: Auth0アプリケーションのClient Secret（新規登録機能に必要）

**オプションの環境変数:**
- `AUTH0_AUDIENCE`: API Audience（バックエンドAPIと連携する場合のみ必要）

### Auth0の設定手順

1. [Auth0 Dashboard](https://manage.auth0.com/)にログイン
2. 新しいアプリケーションを作成（**Regular Web Application**タイプを選択）
   - **重要**: カスタムフォームからログインするには、SPAではなくRegular Web Applicationが必要です
3. アプリケーション設定から以下を取得：
   - **Domain**: アプリケーション設定ページの上部に表示
   - **Client ID**: アプリケーション設定ページに表示
   - **Client Secret**: アプリケーション設定ページの「Show」ボタンをクリックして表示（必須）
4. **Allowed Callback URLs**に`http://localhost:3000`を追加
5. **Allowed Logout URLs**に`http://localhost:3000`を追加
6. **Allowed Web Origins**に`http://localhost:3000`を追加（推奨）
7. **Resource Owner Password Grant**を有効化（ログイン機能に必要）：
   - Auth0 Dashboard → Applications → あなたのアプリケーション → Settings
   - 「Advanced Settings」を開く
   - 「Grant Types」タブで「Password」にチェックを入れる
   - 「Save Changes」をクリック
8. **デフォルト接続（Database Connection）を確認**：
   - Auth0 Dashboard → Authentication → Database
   - 「Username-Password-Authentication」接続が存在し、有効になっていることを確認
   - 存在しない場合は、新規作成するか、既存の接続名を確認してコード内の接続名を更新

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
