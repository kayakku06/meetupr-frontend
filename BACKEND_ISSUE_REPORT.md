# バックエンド検索API エラー報告

## 概要
`POST /api/v1/search/users` エンドポイントで500エラーが発生しています。

## エラー詳細

### エラーメッセージ
```
Failed to search users: unexpected end of JSON input
```

### ステータスコード
- **500 Internal Server Error**

### 発生タイミング
- 言語または国のフィルターを選択して検索を実行した際

---

## フロントエンドからのリクエスト

### エンドポイント
```
POST http://localhost:8080/api/v1/search/users
```

### リクエストヘッダー
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### リクエストボディの形式
```json
{
  "languages": ["日本語", "英語"],
  "countries": ["CN", "US"]
}
```

**注意**: 
- `languages` は日本語の言語名（例: "日本語", "英語"）を配列で送信
- `countries` は**英語の国コード（ISO 3166-1 alpha-2）**を配列で送信（例: "CN"（中国）, "US"（アメリカ）, "JP"（日本））
- `languages` と `countries` は常に配列として送信されます
- 空の場合は空配列 `[]` が送信されます
- 例: `{"languages": [], "countries": ["CN"]}`

### 実際のリクエスト例

**ケース1: 言語のみ選択**
```json
{
  "languages": ["日本語"],
  "countries": []
}
```

**ケース2: 国のみ選択**
```json
{
  "languages": [],
  "countries": ["CN"]
}
```

**ケース3: 両方選択**
```json
{
  "languages": ["日本語", "英語"],
  "countries": ["CN", "US"]
}
```

---

## 期待されるレスポンス

### 成功時 (200 OK)
```json
[
  {
    "user_id": "auth0|1234567890",
    "username": "testuser",
    "comment": "こんにちは！",
    "residence": "CN",
    "avatar_url": "https://example.com/avatar.jpg",
    "interests": [
      {
        "id": 1,
        "name": "プログラミング"
      },
      {
        "id": 2,
        "name": "読書"
      }
    ]
  }
]
```

**重要**: 
- **`residence`フィールドは常に含まれる必要があります**（言語のみで検索した場合でも）
- `residence`は英語の国コード（ISO 3166-1 alpha-2）形式で返してください（例: "CN", "US", "JP"）
- フロントエンドで国旗を表示するために必要です
- `residence`が`null`の場合は`null`を返してください（フロントエンドで適切に処理します）

### エラー時
- **401 Unauthorized**: 認証エラー
- **400 Bad Request**: リクエスト形式が不正
- **500 Internal Server Error**: サーバー内部エラー（現在発生中）

---

## 問題の可能性

`unexpected end of JSON input` エラーは通常、以下の場合に発生します：

1. **空のレスポンスをJSONとしてパースしようとしている**
   - バックエンドが空のレスポンスを返している
   - エラーハンドリングでJSONを返す前に処理が終了している

2. **不完全なJSONレスポンス**
   - レスポンスの途中で処理が中断されている
   - エラーメッセージを返す際にJSON形式が不完全

3. **データベースクエリのエラー**
   - データベース接続エラー
   - SQLクエリの構文エラー
   - データ型の不一致

---

## 確認してほしいこと

1. **バックエンドのログを確認**
   - `/api/v1/search/users` エンドポイントの実装を確認
   - エラーが発生している具体的な行を特定

2. **リクエストボディのパース**
   - `languages` と `countries` が正しく受け取れているか
   - 空配列の処理が正しいか

3. **レスポンスの返却**
   - エラー発生時に適切なJSON形式でエラーメッセージを返しているか
   - 空のレスポンスを返していないか

4. **データベースクエリ**
   - 検索クエリが正しく実行されているか
   - エラーが発生していないか

---

## フロントエンド側の実装

フロントエンド側では以下の形式でリクエストを送信しています：

```javascript
// 国名を国コードに変換（データベースでは英語の国コードで管理）
const countryCodes = [];
for (const country of selectedCountries.value) {
    const code = normalizeCountryCode(country); // 日本語の国名を英語の国コードに変換
    if (code) {
        countryCodes.push(code);
    }
}

const requestBody = {
    languages: selectedLanguages.value.length > 0 ? selectedLanguages.value : [],
    countries: countryCodes.length > 0 ? countryCodes : []
};

const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/search/users`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: requestBody
});
```

---

## 参考: API仕様書

検索APIの仕様は以下の通りです（フロントエンド向けAPI仕様書より）：

- **エンドポイント**: `POST /api/v1/search/users`
- **認証**: JWTトークン必須
- **リクエストボディ**:
  ```json
  {
    "languages": ["日本語", "英語"],
    "countries": ["CN", "US"]
  }
  ```
  - `languages`: 日本語の言語名（例: "日本語", "英語"）
  - `countries`: 英語の国コード（ISO 3166-1 alpha-2）（例: "CN"（中国）, "US"（アメリカ）, "JP"（日本））
- **レスポンス**: ユーザー配列（上記の期待されるレスポンス参照）

---

## 次のステップ

1. バックエンドのログを確認して、エラーが発生している箇所を特定
2. エラーハンドリングを確認して、適切なJSON形式でエラーメッセージを返すように修正
3. データベースクエリを確認して、正しく実行されているか確認
4. 修正後、再度テストを実施

---

## 連絡先・質問

フロントエンド側で追加の情報が必要な場合は、お知らせください。
ブラウザのコンソールログに詳細なリクエスト情報が出力されているので、必要に応じて共有できます。
