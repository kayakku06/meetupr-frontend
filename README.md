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
- 👤 **プロフィール管理**: 趣味・言語・学部・性別・出身地・アバター画像などのプロフィール登録・編集
- 🔍 **検索機能**: 言語・国・興味ベースでユーザーを検索（ネイティブ言語によるフィルタリング対応）
- 💬 **チャット機能**: WebSocketによるリアルタイムテキストチャット
- 🌐 **多言語対応**: 日本語・英語のUI切り替え機能
- 📊 **会いたい度インジケーター**: チャット中の会いたい度を1-5で設定・表示（Supabaseと同期）
- 🤝 **匿名「会いたい」ボタン**: 相互マッチ時のみ通知
- 🔄 **リアルタイム翻訳**: チャット内のメッセージを日本語⇔英語に自動翻訳

詳細な機能要件については、[プロダクト要件定義書](./docs/REQUIREMENTS.md)を参照してください。

## 🛠️ 技術スタック

- **フレームワーク**: [Nuxt 4](https://nuxt.com/)
- **言語**: TypeScript
- **UI**: Vue 3 + Tailwind CSS
- **認証**: Auth0
- **データベース**: Supabase (PostgreSQL)
- **リアルタイム通信**: WebSocket
- **アイコン**: Lucide Vue Next
- **国旗表示**: Flag Icons
- **PWA対応**: @vite-pwa/nuxt
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

# バックエンドAPI設定（オプション）
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080
NUXT_PUBLIC_WS_HOST=localhost:8080
```

**必須の環境変数:**
- `AUTH0_DOMAIN`: Auth0ドメイン
- `AUTH0_CLIENT_ID`: Auth0アプリケーションのClient ID
- `SUPABASE_URL`: SupabaseプロジェクトのURL
- `SUPABASE_SERVICE_ROLE_KEY`: SupabaseのService Role Key

**オプションの環境変数:**
- `AUTH0_CONNECTION`: Auth0の接続名（デフォルト: `Username-Password-Authentication`）
- `AUTH0_AUDIENCE`: API Audience（バックエンドAPIと連携する場合のみ必要）
- `NUXT_PUBLIC_API_BASE_URL`: バックエンドAPIのベースURL（デフォルト: `http://localhost:8080`）
- `NUXT_PUBLIC_WS_HOST`: WebSocketホスト（デフォルト: `localhost:8080`）

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

## 📁 プロジェクト構造

```
meetupr-frontend/
├── app/                    # アプリケーションのメインコード
│   ├── components/         # Vueコンポーネント
│   │   ├── CategorySelect.vue      # カテゴリ選択コンポーネント
│   │   ├── LanguageSwitcher.vue    # 言語切り替えコンポーネント
│   │   ├── MeetDesireSlider.vue    # 会いたい度スライダー
│   │   ├── searchuser.vue          # 検索結果ユーザーカード
│   │   └── ...                     # その他のコンポーネント
│   ├── composables/        # コンポーザブル
│   │   ├── useAuth.ts              # 認証関連のロジック
│   │   ├── useChat.ts               # チャット関連のロジック
│   │   ├── useChatVerification.ts  # チャット認証検証
│   │   └── useLocale.ts            # 多言語対応ロジック
│   ├── locales/            # 多言語リソース
│   │   ├── ja.ts                   # 日本語翻訳
│   │   ├── en.ts                   # 英語翻訳
│   │   └── index.ts                # ロケール設定
│   ├── middleware/         # ミドルウェア（認証等）
│   ├── pages/              # ページコンポーネント
│   │   ├── index.vue              # ログイン/サインアップページ
│   │   ├── home.vue                # ホームページ
│   │   ├── search.vue              # 検索ページ
│   │   ├── chat/[id].vue           # チャットページ
│   │   ├── my-profile.vue          # 自分のプロフィール
│   │   ├── other-profile.vue      # 他人のプロフィール
│   │   └── ...                     # その他のページ
│   ├── plugins/            # プラグイン（Auth0等）
│   └── utils/              # ユーティリティ関数
│       ├── countryMapping.ts       # 国コードマッピング
│       ├── languageMapping.ts      # 言語コードマッピング
│       ├── genderMapping.ts        # 性別マッピング
│       └── majorMapping.ts        # 学部マッピング
├── server/                 # サーバーサイドAPI
│   └── api/                # APIエンドポイント
│       ├── auth/                   # 認証関連API
│       ├── chat/                   # チャット関連API
│       │   ├── interest.get.ts     # 会いたい度取得
│       │   └── interest.post.ts   # 会いたい度保存
│       ├── profile/                # プロフィール関連API
│       ├── translate.post.ts       # 翻訳API
│       └── users/                  # ユーザー関連API
├── docs/                   # ドキュメント
│   ├── REQUIREMENTS.md                    # プロダクト要件定義書
│   ├── API_SPECIFICATION.md              # API仕様書
│   ├── DATABASE.md                       # データベース設計書
│   ├── FRONTEND_WEBSOCKET_IMPLEMENTATION.md # WebSocket実装ガイド
│   ├── BACKEND_SEARCH_AVATAR_IMPLEMENTATION.md # 検索APIアバター実装ガイド
│   └── BACKEND_SEARCH_NATIVE_LANGUAGE.md # 検索APIネイティブ言語実装ガイド
├── public/                 # 静的ファイル
│   ├── icons/              # PWAアイコン
│   └── robots.txt          # robots.txt
└── .github/                # GitHub設定
    └── templates/          # PRテンプレート等
```

## 📚 ドキュメント

- [プロダクト要件定義書](./docs/REQUIREMENTS.md)
- [API仕様書](./docs/API_SPECIFICATION.md)
- [データベース設計書](./docs/DATABASE.md)
- [WebSocket実装ガイド](./docs/FRONTEND_WEBSOCKET_IMPLEMENTATION.md)
- [検索APIアバター実装ガイド](./docs/BACKEND_SEARCH_AVATAR_IMPLEMENTATION.md)
- [検索APIネイティブ言語実装ガイド](./docs/BACKEND_SEARCH_NATIVE_LANGUAGE.md)

## 🎯 主要機能の詳細

### 認証機能

- Auth0を使用したOIC学生限定の認証
- 学内メールアドレスによる認証
- ユーザーネームの設定
- セッション管理とリフレッシュトークン対応

### プロフィール管理

- **基本情報**: ユーザーネーム、学部、性別
- **言語情報**: ネイティブ言語、話せる言語、学びたい言語
- **興味・趣味**: 複数の興味・趣味を登録
- **出身地**: 居住歴が最も長い場所（国コードで管理）
- **自己紹介**: コメント（一言）
- **アバター画像**: Supabase Storageに保存

### 検索機能

- **言語検索**: ネイティブ言語によるフィルタリング（最大2つまで）
- **国検索**: 出身国によるフィルタリング（最大2つまで）
- **統合フィルター**: 言語と国を組み合わせて検索（合計最大4つまで）
- **多言語対応**: UIは日本語・英語で切り替え可能
- **リアルタイム検索**: フィルター変更時に自動検索

### チャット機能

- **WebSocket通信**: リアルタイムなメッセージ送受信
- **メッセージ履歴**: 過去のメッセージを自動取得
- **翻訳機能**: メッセージをタップして日本語⇔英語に翻訳
- **会いたい度インジケーター**: 1-5のスライダーで会いたい度を設定
- **会いたい度の同期**: Supabaseの`chat_interest`テーブルと同期
- **アバター表示**: 相手のアバター画像を表示
- **プロフィール遷移**: アバターをタップして相手のプロフィールを表示

### 多言語対応

- **対応言語**: 日本語、英語
- **切り替え方法**: ヘッダーまたは検索ページの言語切り替えボタン
- **ローカライズ対象**:
  - UIテキスト（ボタン、ラベル、メッセージ）
  - 言語名（日本語、英語など）
  - 国名（日本、アメリカなど）
  - 学部名（情報理工学部など）
  - 性別（男性、女性）

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

### デプロイ時の注意事項

1. **環境変数の設定**: Vercelの環境変数設定で必要な環境変数を設定
2. **Auth0設定**: 本番環境のURLをAuth0のAllowed Callback URLsに追加
3. **Supabase設定**: 本番環境のSupabaseプロジェクトを設定
4. **バックエンドAPI**: 本番環境のAPI URLを設定

## 🧪 テスト

### 開発環境でのテスト

1. **認証テスト**: ログイン・サインアップ・ログアウトの動作確認
2. **プロフィールテスト**: プロフィール作成・編集・画像アップロードの動作確認
3. **検索テスト**: 言語・国による検索フィルタリングの動作確認
4. **チャットテスト**: WebSocket接続・メッセージ送受信・翻訳機能の動作確認
5. **会いたい度テスト**: スライダー操作・Supabase同期の動作確認

## 📝 開発ガイドライン

### コミットメッセージ

コミットメッセージは英語で記述し、以下の形式に従ってください：

```
Feat: 新機能の追加
Fix: バグ修正
Docs: ドキュメントの更新
Refactor: リファクタリング
Style: コードスタイルの変更
Test: テストの追加・修正
```

### ブランチ戦略

- `main`: 本番環境用ブランチ
- `develop-v3`: 開発ブランチ
- `feature/*`: 機能追加用ブランチ
- `fix/*`: バグ修正用ブランチ

### コードスタイル

- TypeScriptの型定義を適切に使用
- Vue 3 Composition APIを使用
- Tailwind CSSでスタイリング
- コンポーネントは単一責任の原則に従う

## 🔧 トラブルシューティング

### よくある問題

1. **Auth0認証エラー**
   - `.env`ファイルの環境変数を確認
   - Auth0 Dashboardの設定を確認
   - Allowed Callback URLsに正しいURLが設定されているか確認

2. **Supabase接続エラー**
   - `SUPABASE_URL`と`SUPABASE_SERVICE_ROLE_KEY`が正しく設定されているか確認
   - Supabaseプロジェクトがアクティブか確認

3. **WebSocket接続エラー**
   - バックエンドサーバーが起動しているか確認
   - `NUXT_PUBLIC_API_BASE_URL`と`NUXT_PUBLIC_WS_HOST`が正しく設定されているか確認

4. **検索結果が表示されない**
   - ブラウザのコンソールでエラーログを確認
   - バックエンドAPIのログを確認
   - ネットワークタブでAPIリクエストを確認

## 👥 開発体制

- **フロントエンド**: 秋田／ゆいちゃん／ゆいゆい／みきちゃん
- **バックエンド**: さめ／よーた

## 📝 ライセンス

このプロジェクトはプライベートプロジェクトです。

## 🤝 コントリビューション

このプロジェクトはOICの学生向けのプロジェクトです。コントリビューションについては、プロジェクトメンテナーにご連絡ください。

## 📅 開発履歴

- **2025年10月**: プロジェクト開始、認証機能実装
- **2025年11月**: プロフィール管理、検索機能実装
- **2025年12月**: チャット機能、多言語対応、会いたい度機能実装

---

**開発期間**: 2025年10月〜2025年12月

**最終更新**: 2025年12月
