# 検索APIでアバター画像を返す実装ガイド

## 📋 概要

検索API (`POST /api/v1/search/users`) のレスポンスに`avatar_url`フィールドを追加するための実装ガイドです。

---

## 📸 画像の保存場所

### Supabase Storage

- **バケット名**: `avatars`
- **パス形式**: `{user_id}/{filename}-{timestamp}.{ext}`
- **例**: `auth0|1234567890/user-avatar-1703123456789.png`

### データベース

- **テーブル**: `profiles`
- **カラム**: `avatar_url`
- **値**: Supabase Storageの公開URL
- **例**: `https://{project_id}.supabase.co/storage/v1/object/public/avatars/{user_id}/{filename}`

---

## 🔧 バックエンド実装方法

### 1. データベースクエリに`avatar_url`を含める

検索APIの実装で、`profiles`テーブルからデータを取得する際に、`avatar_url`カラムも含めるようにします。

#### Go (Echo) の例

```go
// 検索クエリを実行する際に、avatar_urlも取得
query := `
    SELECT 
        u.id as user_id,
        u.username,
        p.comment,
        p.residence,
        p.avatar_url,  // ← これを追加
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
    p.avatar_url,  -- ← これを追加
    p.interests
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE ...
```

### 2. レスポンスに`avatar_url`を含める

検索結果を返す際に、`avatar_url`フィールドを含めます。

#### Go (Echo) の例

```go
type SearchUserResult struct {
    UserID    string   `json:"user_id"`
    Username  string   `json:"username"`
    Comment   string   `json:"comment"`
    Residence string   `json:"residence"`
    AvatarURL *string  `json:"avatar_url"`  // ← これを追加（NULLの可能性があるためポインタ型）
    Interests []Interest `json:"interests"`
}

// レスポンスを構築
result := SearchUserResult{
    UserID:    user.ID,
    Username:  user.Username,
    Comment:   profile.Comment,
    Residence: profile.Residence,
    AvatarURL: profile.AvatarURL,  // ← これを追加
    Interests: interests,
}
```

### 3. NULL値の処理

`avatar_url`がNULLの場合でも、レスポンスに含めるようにします（`null`として返す）。

```go
// avatar_urlがNULLの場合
avatarURL := profile.AvatarURL
if avatarURL == nil {
    avatarURL = nil  // または空文字列 "" を返す
}
```

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
    "avatar_url": "https://xxxxx.supabase.co/storage/v1/object/public/avatars/auth0|1234567890/user-avatar-1703123456789.png",
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
    "comment": "よろしく！",
    "residence": "JP",
    "avatar_url": null,  // ← 画像が登録されていない場合はnull
    "interests": [
      {
        "id": 3,
        "name": "音楽"
      }
    ]
  }
]
```

---

## ⚠️ 重要な注意事項

### 1. `avatar_url`は常に含める

- 画像が登録されていない場合でも、`avatar_url: null`として返してください
- フロントエンド側で画像がない場合のデフォルト表示を処理します

### 2. パフォーマンス

- `avatar_url`は文字列（URL）なので、追加してもパフォーマンスへの影響は最小限です
- ただし、大量のユーザーを返す場合は、必要に応じてページネーションを検討してください

### 3. セキュリティ

- Supabase Storageの公開URLは、バケットが`public`に設定されている場合のみアクセス可能です
- バケットの設定を確認してください

---

## 🔍 実装チェックリスト

- [ ] データベースクエリに`p.avatar_url`を追加
- [ ] レスポンス構造体に`AvatarURL`フィールドを追加
- [ ] NULL値の場合も`null`として返す
- [ ] テストで画像あり/なしの両方のケースを確認
- [ ] フロントエンド側で画像が正しく表示されることを確認

---

## 📝 参考: フロントエンド側の実装

フロントエンド側では、以下のように画像を表示します：

```vue
<img 
  v-if="user.avatar_url" 
  :src="user.avatar_url" 
  :alt="user.username" 
  class="w-16 h-16 rounded-full object-cover"
/>
<div v-else class="w-16 h-16 rounded-full bg-gray-300">
  <!-- デフォルトアイコン -->
</div>
```

---

## 🐛 トラブルシューティング

### 画像が表示されない場合

1. **Supabase Storageのバケット設定を確認**
   - バケットが`public`に設定されているか
   - CORS設定が正しいか

2. **URLの形式を確認**
   - URLが正しい形式か（`https://{project_id}.supabase.co/storage/v1/object/public/avatars/...`）
   - パスに特殊文字が含まれていないか

3. **データベースの値を確認**
   - `profiles.avatar_url`に正しいURLが保存されているか
   - NULLでないか

---

## 📚 関連ドキュメント

- [Supabase Storage ドキュメント](https://supabase.com/docs/guides/storage)
- [BACKEND_ISSUE_REPORT.md](../BACKEND_ISSUE_REPORT.md) - 検索APIの仕様
