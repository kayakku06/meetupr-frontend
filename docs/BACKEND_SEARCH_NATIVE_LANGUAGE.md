# 検索APIにネイティブ言語フィールドを含める実装ガイド

## 📋 概要

検索API (`POST /api/v1/search/users`) のレスポンスに `native_language` フィールドを追加するための実装ガイドです。

フロントエンド側で言語検索時に、ネイティブ言語でフィルタリングするために必要です。

---

## 🎯 要件

### 必須フィールド

検索APIのレスポンスに以下のフィールドを含める必要があります：

- **`native_language`** (必須): ユーザーのネイティブ言語を言語コード（例: `"ja"`, `"en"`, `"ko"`）で返す

### データ形式

- **言語コード**: ISO 639-1 の2文字コード（小文字）
  - 例: `"ja"` (日本語), `"en"` (英語), `"ko"` (韓国語), `"zh"` (中国語), `"vi"` (ベトナム語)
- **NULL値**: ネイティブ言語が設定されていない場合は `null` を返す

---

## 📤 期待されるレスポンス形式

### 成功時 (200 OK)

```json
[
  {
    "user_id": "auth0|1234567890",
    "username": "testuser",
    "comment": "こんにちは！",
    "residence": "CN",
    "avatar_url": "https://example.com/avatar.jpg",
    "native_language": "ja",
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
  },
  {
    "user_id": "auth0|0987654321",
    "username": "anotheruser",
    "comment": "Hello!",
    "residence": "US",
    "avatar_url": null,
    "native_language": "en",
    "interests": [
      {
        "id": 3,
        "name": "音楽"
      }
    ]
  },
  {
    "user_id": "auth0|1111111111",
    "username": "user3",
    "comment": "안녕하세요!",
    "residence": "KR",
    "avatar_url": null,
    "native_language": "ko",
    "interests": []
  }
]
```

**重要**: 
- **`native_language`フィールドは常に含まれる必要があります**（言語検索でない場合でも）
- `native_language`は言語コード（例: `"ja"`, `"en"`, `"ko"`）で返してください
- `native_language`が`null`の場合は`null`を返してください（フロントエンドで適切に処理します）

---

## 🔧 バックエンド実装方法

### 1. データベースクエリに`native_language`を含める

検索APIの実装で、`profiles`テーブルからデータを取得する際に、`native_language`カラムも含めるようにします。

#### Go (Echo) の例

```go
// 検索クエリを実行する際に、native_languageも取得
query := `
    SELECT 
        u.id as user_id,
        u.username,
        p.comment,
        p.residence,
        p.avatar_url,
        p.native_language,  // ← これを追加
        p.interests
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE ...
`
```

#### SQLクエリの例

```sql
SELECT 
    u.id as user_id,
    u.username,
    p.comment,
    p.residence,
    p.avatar_url,
    p.native_language,  -- ← これを追加
    p.interests
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE ...
```

### 2. レスポンスに`native_language`を含める

検索結果を返す際に、`native_language`フィールドを含めます。

#### Go (Echo) の例

```go
type SearchUserResult struct {
    UserID         string   `json:"user_id"`
    Username       string   `json:"username"`
    Comment        string   `json:"comment"`
    Residence      string   `json:"residence"`
    AvatarURL      *string  `json:"avatar_url"`
    NativeLanguage *string  `json:"native_language"`  // ← これを追加（NULLの可能性があるためポインタ型）
    Interests      []Interest `json:"interests"`
}

// レスポンスを構築
result := SearchUserResult{
    UserID:         user.ID,
    Username:       user.Username,
    Comment:        profile.Comment,
    Residence:      profile.Residence,
    AvatarURL:      profile.AvatarURL,
    NativeLanguage: profile.NativeLanguage,  // ← これを追加
    Interests:      interests,
}
```

### 3. NULL値の処理

`native_language`がNULLの場合でも、レスポンスに含めるようにします（`null`として返す）。

```go
// native_languageがNULLの場合
nativeLanguage := profile.NativeLanguage
if nativeLanguage == nil {
    nativeLanguage = nil  // nullとして返す
}
```

---

## 🔍 フロントエンド側の動作

### 言語検索時のフィルタリング

フロントエンド側では、言語検索時に以下のようにフィルタリングを行います：

1. ユーザーが言語（例: "日本語"）を選択
2. フロントエンドが言語名を言語コード（例: `"ja"`）に変換
3. APIリクエストに言語コードを含める: `{"languages": ["ja"], "countries": []}`
4. バックエンドからレスポンスを受け取る
5. **各ユーザーの`native_language`がリクエストの言語コードと一致するかチェック**
6. 一致するユーザーのみを表示

### フィルタリングロジック

```javascript
// 言語検索の場合、ネイティブ言語でフィルタリング
if (languageCodes.length > 0) {
    results = results.filter(user => {
        if (user.native_language) {
            const userNativeLang = String(user.native_language).toLowerCase().trim();
            return languageCodes.some(langCode => 
                userNativeLang === langCode.toLowerCase().trim()
            );
        }
        // native_languageがない場合は除外
        return false;
    });
}
```

---

## ⚠️ 重要な注意事項

### 1. `native_language`は常に含める

- 言語検索でない場合でも、`native_language`フィールドを含めてください
- フロントエンド側で言語検索時にフィルタリングするために必要です

### 2. 言語コードの形式

- **必ず小文字の2文字コード**を使用してください（例: `"ja"`, `"en"`, `"ko"`）
- 日本語名（例: `"日本語"`）ではなく、言語コード（例: `"ja"`）を返してください
- データベースに保存されている形式をそのまま返すか、必要に応じて変換してください

### 3. 対応する言語コード

フロントエンド側で対応している言語コード：

- `ja` - 日本語
- `en` - 英語
- `ko` - 韓国語
- `zh` - 中国語
- `fr` - フランス語
- `es` - スペイン語
- `vi` - ベトナム語
- `id` - インドネシア語
- `th` - タイ語
- `hi` - ヒンディー語
- `bn` - ベンガル語
- `pa` - パンジャブ語
- `de` - ドイツ語
- `pt` - ポルトガル語
- `ru` - ロシア語
- `ar` - アラビア語

---

## 🧪 テスト方法

### 1. 言語検索のテスト

以下のリクエストでテストしてください：

```bash
POST /api/v1/search/users
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "languages": ["ja"],
  "countries": []
}
```

**期待される動作**:
- レスポンスの各ユーザーに `native_language` フィールドが含まれている
- `native_language` が `"ja"` のユーザーのみが返される（フロントエンド側でフィルタリング）

### 2. レスポンスの確認

レスポンスに以下のフィールドが含まれているか確認：

- ✅ `user_id`
- ✅ `username`
- ✅ `comment`
- ✅ `residence`
- ✅ `avatar_url`
- ✅ **`native_language`** ← これが重要
- ✅ `interests`

### 3. デバッグ方法

フロントエンド側のブラウザコンソールで以下のログを確認：

```
[search] Response sample user (all fields): {...}
[search] Filtering by native language. Language codes: ["ja"]
[search] User testuser: native_language="ja", matches=true
[search] Filtered results: X users (from Y total)
```

`native_language` が含まれていない場合、以下の警告が表示されます：

```
[search] User username has no native_language field - excluding from results
```

---

## 📝 チェックリスト

実装時に以下の項目を確認してください：

- [ ] データベースクエリに `p.native_language` を含めた
- [ ] レスポンス構造体に `NativeLanguage` フィールドを追加した
- [ ] レスポンス構築時に `native_language` を含めた
- [ ] NULL値の処理を実装した（`null`として返す）
- [ ] 言語コードが小文字の2文字コードであることを確認した
- [ ] テストを実施して、レスポンスに `native_language` が含まれていることを確認した

---

## 🔗 関連ドキュメント

- [検索API エラー報告](./BACKEND_ISSUE_REPORT.md)
- [検索API アバター実装ガイド](./BACKEND_SEARCH_AVATAR_IMPLEMENTATION.md)
- [API仕様書](./API_SPECIFICATION.md)

---

## 📞 連絡先・質問

フロントエンド側で追加の情報が必要な場合は、お知らせください。
ブラウザのコンソールログに詳細なリクエスト情報が出力されているので、必要に応じて共有できます。
