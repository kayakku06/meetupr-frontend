<template>
  <div class="page">
    <header class="header"></header>

    <main class="card">
      <div class="profile-row">
        <div class="avatar">
          <svg viewBox="0 0 64 64" class="avatar-svg" aria-hidden><circle cx="32" cy="24" r="12" fill="none" stroke="#6aaea0" stroke-width="2"/><path d="M10 54c4-10 18-14 22-14s18 4 22 14" fill="none" stroke="#6aaea0" stroke-width="2"/></svg>
        </div>

        <div class="meta">
          <h2 class="name">{{ user.name }}</h2>
          <button class="message-btn" @click="sendMessage">
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm4 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h12v14z" fill="#fff"/></svg>
            メッセージ
          </button>
        </div>
      </div>

      <div class="info">
        <label class="field">
          <div class="field-label">学部</div>
          <div class="display-value">{{ user.department }}</div>
        </label>

        <fieldset class="field">
          <legend class="field-label">性別</legend>
          <div class="radio-display">
            <span class="radio-item" v-for="g in ['男性', '女性', 'その他']" :key="g">
              <input type="radio" :checked="user.gender === g" disabled />
              {{ g }}
            </span>
          </div>
        </fieldset>

        <label class="field">
          <div class="field-label">出身</div>
          <div class="display-value">{{ user.origin }}</div>
        </label>

        <div class="field">
          <div class="field-label">言語</div>
          <div class="chip-row">
            <span class="chip readonly" v-for="(l, i) in user.languages" :key="i">{{ l }}</span>
          </div>
        </div>

        <div class="field">
          <div class="field-label">趣味</div>
          <div class="chip-row">
            <span class="chip readonly" v-for="(h, i) in user.hobbies" :key="i">{{ h }}</span>
          </div>
        </div>

        <label class="field">
          <div class="field-label">一言（50文字以内）</div>
          <div class="display-value textarea-view">{{ user.bio }}</div>
        </label>
      </div>
    </main>

    <nav class="bottom-nav" aria-hidden>
      <button class="nav-item">
        <svg width="22" height="22" viewBox="0 0 24 24"><path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z" fill="#fff"/></svg>
      </button>
      <button class="nav-item">
        <svg width="22" height="22" viewBox="0 0 24 24"><path d="M21 6.5a2.5 2.5 0 0 1-2.5 2.5H8l-5 5V4A2 2 0 0 1 5 2h14.5A2.5 2.5 0 0 1 21 6.5z" fill="#fff"/></svg>
      </button>
      <button class="nav-item">
        <svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 4.9V22h16v-3.1c0-2.7-3.6-4.9-8-4.9z" fill="#fff"/></svg>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const user = ref({
  name: 'ユーザー1',
  department: '情報理工学部',
  gender: 'その他',
  origin: '日本',
  languages: ['日本語', '日本語、英語', '韓国語、フランス語'],
  hobbies: ['料理', '野球'],
  bio: 'よろしくお願いします！！'
})

function sendMessage() {
  alert(`${user.value.name} さんにメッセージを送信しますか？`)
  // 実際はメッセージ画面に遷移
}
</script>

<style scoped>
.page { min-height:100vh; background:#fffbe1; padding-bottom:72px; font-family: "Noto Sans JP", sans-serif; }
.header { height:36px; background:transparent; }
.card { max-width:420px; margin: 8px auto; background:transparent; padding:20px; }
.profile-row { display:flex; gap:12px; align-items:center; margin-bottom:12px; }
.avatar { width:72px; height:72px; border-radius:50%; background:#fff3d6; display:flex; align-items:center; justify-content:center; border:2px solid #e9d6b6; }
.avatar-svg { width:44px; height:44px; }
.meta { flex:1; }
.name { margin:0 0 8px 0; font-size:18px; color:#2f5f56; }
.message-btn { background:#3aa79a; color:#fff; border:none; padding:6px 10px; border-radius:14px; display:inline-flex; gap:6px; align-items:center; font-size:13px; cursor:pointer; }

.info { display:flex; flex-direction:column; gap:12px; }
.field { display:flex; flex-direction:column; gap:8px; }
.field-label { font-size:13px; color:#6a5a3b; margin-bottom:4px; }
.display-value { padding:8px 10px; background:#fff; border:2px solid #f39a5e; border-radius:6px; font-size:14px; color:#4b3b2b; min-height:20px; }
.textarea-view { min-height:60px; white-space:pre-wrap; word-break:break-word; }

.radio-display { display:flex; gap:12px; }
.radio-item { display:flex; align-items:center; gap:4px; font-size:14px; color:#4b3b2b; }

.chip-row { display:flex; gap:8px; flex-wrap:wrap; }
.chip { background:#fff; border:2px solid #f39a5e; padding:6px 10px; border-radius:16px; font-size:13px; color:#4b3b2b; }
.chip.readonly { cursor:default; }

.bottom-nav { position:fixed; left:0; right:0; bottom:0; height:56px; background:#f7a85e; display:flex; justify-content:space-around; align-items:center; box-shadow:0 -2px 6px rgba(0,0,0,0.08); }
.nav-item { background:transparent; border:none; width:56px; height:56px; display:flex; align-items:center; justify-content:center; border-radius:50%; color:#fff; cursor:pointer; }
</style>