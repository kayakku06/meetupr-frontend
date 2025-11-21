# MeetUP +R Frontend

OIC（立命館大学大阪いばらきキャンパス）の学生間、特に留学生と日本人学生の交流を促進するコミュニティアプリのフロントエンドアプリケーション。

## 📋 プロジェクト概要

**MeetUP +R**は、共通の趣味や言語を通じて、自然な出会いや会話のきっかけを作り出すコミュニティアプリです。

### 主な目的

- 留学生が日本人と関わる機会を増やす
- 言語学習や文化交流を促進する
- 学内コミュニティの国際的つながりを強化する

### 主要機能

- 🔐 **認証機能**: Auth0を使用したOIC学生限定の認証
- 👤 **プロフィール管理**: 趣味・言語・学部などのプロフィール登録・編集
- 🔍 **検索機能**: 趣味・興味ベースでユーザーを検索
- 💬 **チャット機能**: WebSocketによるリアルタイムテキストチャット
- 🤝 **匿名「会いたい」ボタン**: 相互マッチ時のみ通知

詳細な機能要件については、[プロダクト要件定義書](./docs/REQUIREMENTS.md)を参照してください。

## 🛠️ 技術スタック

- **フレームワーク**: [Nuxt 4](https://nuxt.com/)
- **言語**: TypeScript
- **UI**: Vue 3 + Tailwind CSS
- **認証**: Auth0
- **データベース**: Supabase
- **デプロイ**: Vercel（予定）

## 📦 セットアップ

### 前提条件

- Node.js 18以上
- npm / pnpm / yarn / bun

### インストール

```bash
# 依存関係のインストール
npm install
# または
pnpm install
# または
yarn install
# または
bun install
```

### 環境変数の設定

プロジェクトルートに`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
# Auth0設定（必須）
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id

# Auth0設定（オプション）
AUTH0_CONNECTION=Username-Password-Authentication
AUTH0_AUDIENCE=your-auth0-api-audience

# Supabase設定（サーバーサイド）
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

**必須の環境変数:**
- `AUTH0_DOMAIN`: Auth0ドメイン
- `AUTH0_CLIENT_ID`: Auth0アプリケーションのClient ID

**オプションの環境変数:**
- `AUTH0_CONNECTION`: Auth0の接続名（デフォルト: `Username-Password-Authentication`）
- `AUTH0_AUDIENCE`: API Audience（バックエンドAPIと連携する場合のみ必要）
- `SUPABASE_URL`: SupabaseプロジェクトのURL
- `SUPABASE_SERVICE_ROLE_KEY`: SupabaseのService Role Key

## 🚀 開発サーバーの起動

```bash
# 開発サーバーを起動（http://localhost:3000）
npm run dev
# または
pnpm dev
# または
yarn dev
# または
bun run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

## 🔐 Auth0認証設定

このプロジェクトではAuth0を使用した認証機能を実装しています。

### Auth0の設定手順

1. [Auth0 Dashboard](https://manage.auth0.com/)にログイン
2. 新しいアプリケーションを作成（**Single Page Application (SPA)**タイプを選択）
3. アプリケーション設定から以下を取得：
   - **Domain**: アプリケーション設定ページの上部に表示
   - **Client ID**: アプリケーション設定ページに表示
4. **Allowed Callback URLs**に以下を追加：
   - `http://localhost:3000`
   - 本番環境のURL
5. **Allowed Logout URLs**に以下を追加：
   - `http://localhost:3000`
   - 本番環境のURL
6. **Allowed Web Origins**に以下を追加：
   - `http://localhost:3000`
   - 本番環境のURL
7. **デフォルト接続（Database Connection）を確認・作成**：
   - Auth0 Dashboard → Authentication → Database
   - 「Username-Password-Authentication」接続が存在し、有効になっていることを確認
8. **接続をアプリケーションに有効化**：
   - Auth0 Dashboard → Applications → あなたのアプリケーション → **Connections** タブ
   - 「Username-Password-Authentication」にチェックを入れる
   - **「Save」をクリックして保存**

詳細な認証フローの説明については、READMEの「認証フローの説明」セクションを参照してください。

## 📁 プロジェクト構造

```
meetupr-frontend/
├── app/                    # アプリケーションのメインコード
│   ├── components/         # Vueコンポーネント
│   ├── composables/        # コンポーザブル（useAuth, useChat等）
│   ├── middleware/         # ミドルウェア（認証等）
│   ├── pages/              # ページコンポーネント
│   └── plugins/            # プラグイン（Auth0等）
├── server/                 # サーバーサイドAPI
│   └── api/                # APIエンドポイント
├── docs/                   # ドキュメント
│   ├── REQUIREMENTS.md     # プロダクト要件定義書
│   ├── API_SPECIFICATION.md # API仕様書
│   ├── DATABASE.md         # データベース設計書
│   └── FRONTEND_WEBSOCKET_IMPLEMENTATION.md # WebSocket実装ガイド
├── public/                 # 静的ファイル
└── .github/                # GitHub設定
    └── templates/          # PRテンプレート等
```

## 📚 ドキュメント

- [プロダクト要件定義書](./docs/REQUIREMENTS.md)
- [API仕様書](./docs/API_SPECIFICATION.md)
- [データベース設計書](./docs/DATABASE.md)
- [WebSocket実装ガイド](./docs/FRONTEND_WEBSOCKET_IMPLEMENTATION.md)

## 🏗️ ビルド

### 本番用ビルド

```bash
npm run build
# または
pnpm build
# または
yarn build
# または
bun run build
```

### 本番ビルドのプレビュー

```bash
npm run preview
# または
pnpm preview
# または
yarn preview
# または
bun run preview
```

## 🚢 デプロイ

本番環境へのデプロイについては、[Nuxtのデプロイメントドキュメント](https://nuxt.com/docs/getting-started/deployment)を参照してください。

このプロジェクトは**Vercel**へのデプロイを想定しています。

## 👥 開発体制

- **フロントエンド**: 秋田／ゆいちゃん／ゆいゆい／みきちゃん
- **バックエンド**: さめ／よーた

## 📝 ライセンス

このプロジェクトはプライベートプロジェクトです。

## 🤝 コントリビューション

このプロジェクトはOICの学生向けのプロジェクトです。コントリビューションについては、プロジェクトメンテナーにご連絡ください。

---

**開発期間**: 2025年10月〜2025年12月
