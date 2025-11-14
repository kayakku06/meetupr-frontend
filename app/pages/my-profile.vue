<template>
  <div class="page">
    <header class="header"></header>

    <main class="card">
      <div class="profile-row">
        <div class="avatar">
          <svg viewBox="0 0 64 64" class="avatar-svg" aria-hidden><circle cx="32" cy="24" r="12" fill="none" stroke="#6aaea0" stroke-width="2"/><path d="M10 54c4-10 18-14 22-14s18 4 22 14" fill="none" stroke="#6aaea0" stroke-width="2"/></svg>
        </div>

        <div class="meta">
          <h2 class="name">{{ form.name || 'なまえ' }}</h2>
          <button class="edit-btn" @click="toggleEdit">
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#fff"/></svg>
            プロフィール編集
          </button>
        </div>
      </div>

      <form class="form" @submit.prevent>
        <label class="field">
          <div class="field-label">学部</div>
          <input :disabled="!editing" v-model="form.department" class="input" placeholder="例：情報理工学部" />
        </label>

        <fieldset class="field">
          <legend class="field-label">性別</legend>
          <label class="radio"><input type="radio" :disabled="!editing" value="男性" v-model="form.gender" /> 男性</label>
          <label class="radio"><input type="radio" :disabled="!editing" value="女性" v-model="form.gender" /> 女性</label>
          <label class="radio"><input type="radio" :disabled="!editing" value="その他" v-model="form.gender" /> その他</label>
        </fieldset>

        <label class="field">
          <div class="field-label">出身</div>
          <input :disabled="!editing" v-model="form.origin" class="input" placeholder="例：日本" />
        </label>

        <div class="field">
          <div class="field-label">言語</div>
          <div class="chip-row">
            <button type="button" class="chip" v-for="(l, i) in form.languages" :key="i" @click="removeLanguage(i)" v-if="editing">
              {{ l }} ×
            </button>
            <span class="chip readonly" v-for="(l, i) in form.languages" :key="'r'+i" v-if="!editing">{{ l }}</span>
          </div>

          <div class="add-row" v-if="editing">
            <input v-model="newLanguage" class="input small" placeholder="言語を入力してEnter" @keyup.enter="addLanguage" />
            <button type="button" class="btn" @click="addLanguage">追加</button>
          </div>
        </div>

        <div class="field">
          <div class="field-label">趣味</div>
          <div class="chip-row">
            <button type="button" class="chip" v-for="(h, i) in form.hobbies" :key="i" @click="removeHobby(i)" v-if="editing">{{ h }} ×</button>
            <span class="chip readonly" v-for="(h, i) in form.hobbies" :key="'rh'+i" v-if="!editing">{{ h }}</span>
          </div>
          <div class="add-row" v-if="editing">
            <input v-model="newHobby" class="input small" placeholder="趣味を入力してEnter" @keyup.enter="addHobby" />
            <button type="button" class="btn" @click="addHobby">追加</button>
          </div>
        </div>

        <label class="field">
          <div class="field-label">一言（50文字以内）</div>
          <textarea :disabled="!editing" v-model="form.bio" class="textarea" maxlength="50" placeholder="よろしくお願いします！！"></textarea>
          <div class="char-count">{{ form.bio.length }}/50</div>
        </label>

        <div class="actions" v-if="editing">
          <button type="button" class="save" @click="save">保存</button>
          <button type="button" class="cancel" @click="cancel">キャンセル</button>
        </div>
      </form>
    </main>

    <nav class="bottom-nav" aria-hidden>
      <button class="nav-item">
        <svg width="22" height="22" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="#fff"/></svg>
      </button>
      <button class="nav-item">
        <svg width="22" height="22" viewBox="0 0 24 24"><path d="M21 6.5a2.5 2.5 0 0 1-2.5 2.5H8l-5 5V4A2 2 0 0 1 5 2h14.5A2.5 2.5 0 0 1 21 6.5z" fill="#fff"/></svg>
      </button>
      <button class="nav-item active">
        <svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 4.9V22h16v-3.1c0-2.7-3.6-4.9-8-4.9z" fill="#fff"/></svg>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const editing = ref(false)

const form = ref({
  name: 'なまえ',
  department: '情報理工学部',
  gender: 'その他',
  origin: '日本',
  languages: ['日本語', '日本語、英語', '韓国語、フランス語'],
  hobbies: ['料理', '野球'],
  bio: 'よろしくお願いします！！'
})

const newLanguage = ref('')
const newHobby = ref('')

function toggleEdit() {
  editing.value = !editing.value
}

function addLanguage() {
  const v = newLanguage.value.trim()
  if (v) {
    form.value.languages.push(v)
    newLanguage.value = ''
  }
}

function removeLanguage(i) {
  form.value.languages.splice(i, 1)
}

function addHobby() {
  const v = newHobby.value.trim()
  if (v) {
    form.value.hobbies.push(v)
    newHobby.value = ''
  }
}

function removeHobby(i) {
  form.value.hobbies.splice(i, 1)
}

function save() {
  // 実際は API 呼び出しをここに入れる
  editing.value = false
  alert('保存しました（サンプル）')
}

const original = JSON.parse(JSON.stringify(form.value))
function cancel() {
  Object.assign(form.value, JSON.parse(JSON.stringify(original)))
  editing.value = false
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
.edit-btn { background:#3aa79a; color:#fff; border:none; padding:6px 10px; border-radius:14px; display:inline-flex; gap:6px; align-items:center; font-size:13px; cursor:pointer; }
.form { display:flex; flex-direction:column; gap:12px; }
.field { display:flex; flex-direction:column; gap:8px; }
.field-label { font-size:13px; color:#6a5a3b; margin-bottom:4px; }
.input, .textarea { border:2px solid #f39a5e; padding:8px 10px; border-radius:6px; background:#fff; font-size:14px; outline:none; }
.input.small { width:70%; display:inline-block; }
.textarea { min-height:64px; resize:none; }
.radio { display:inline-flex; align-items:center; gap:6px; margin-right:10px; font-size:14px; color:#4b3b2b; }
.chip-row { display:flex; gap:8px; flex-wrap:wrap; }
.chip { background:#fff; border:2px solid #f39a5e; padding:6px 10px; border-radius:16px; cursor:pointer; font-size:13px; color:#4b3b2b; }
.chip.readonly { cursor:default; }
.add-row { display:flex; gap:8px; align-items:center; margin-top:6px; }
.btn { background:#f3a86a; color:#fff; border:none; padding:6px 10px; border-radius:8px; cursor:pointer; }
.actions { display:flex; gap:8px; margin-top:6px; }
.save { background:#3aa79a; color:#fff; border:none; padding:8px 14px; border-radius:8px; cursor:pointer; }
.cancel { background:#ddd; border:none; padding:8px 14px; border-radius:8px; cursor:pointer; }
.char-count { font-size:12px; color:#7a6a55; text-align:right; margin-top:4px; }

.bottom-nav { position:fixed; left:0; right:0; bottom:0; height:56px; background:#f7a85e; display:flex; justify-content:space-around; align-items:center; box-shadow:0 -2px 6px rgba(0,0,0,0.08); }
.nav-item { background:transparent; border:none; width:56px; height:56px; display:flex; align-items:center; justify-content:center; border-radius:50%; color:#fff; }
.nav-item.active { background:transparent; box-shadow: inset 0 0 0 2px rgba(255,255,255,0.12); }
</style>