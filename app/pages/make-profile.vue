<template>
    <div class="profile-screen">
        <header class="screen-header">
            プロフィール設定画面
        </header>

        <main class="screen-body">
            <nav class="profile-nav">
                <span class="back-arrow">‹</span>
                <h1 class="profile-title">プロフィール登録</h1>
            </nav>

            <div class="profile-picture">
                <div class="picture-container">
                    <div class="user-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                                stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="#888"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div class="add-icon">+</div>
                </div>
            </div>

            <form @submit.prevent="registerProfile" class="profile-form">

                <div class="form-group">
                    <label for="faculty">学部</label>
                    <select id="faculty" v-model="form.faculty">
                        <option value="" disabled selected></option>
                        <option value="engineering">工学部</option>
                        <option value="economics">経済学部</option>
                        <option value="literature">文学部</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>性別</label>
                    <div class="radio-group">
                        <label>
                            <input type="radio" v-model="form.gender" value="male"> 男性
                        </label>
                        <label>
                            <input type="radio" v-model="form.gender" value="female"> 女性
                        </label>
                        <label>
                            <input type="radio" v-model="form.gender" value="other"> その他
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label for="origin">出身</label>
                    <input type="text" id="origin" v-model="form.origin">
                </div>

                <div class="form-group">
                    <label>言語</label>
                    <div class="language-selects">
                        <select v-model="form.langNative">
                            <option value="native">ネイティブ</option>
                        </select>
                        <select v-model="form.langSpoken">
                            <option value="">話せる言語</option>
                            <option value="en">英語</option>
                            <option value="cn">中国語</option>
                        </select>
                        <select v-model="form.langLearning">
                            <option value="">学びたい言語</option>
                            <option value="fr">フランス語</option>
                            <option value="es">スペイン語</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>趣味</label>
                    <div class="hobby-tags-container">
                        <span v-if="form.hobbies.length === 0" class="placeholder">
                            下の選択肢から趣味を選んでください
                        </span>
                        <button v-for="hobby in form.hobbies" :key="hobby" type="button" class="tag-button selected"
                            @click="removeHobby(hobby)">
                            {{ hobby }} <span>×</span>
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label>既存の選択肢</label>
                    <div class="choices-container">
                        <div class="tabs">
                            <span v-for="category in choiceCategories" :key="category.name"
                                :class="{ active: activeTab === category.name }" @click="activeTab = category.name">
                                {{ category.name }}
                            </span>
                        </div>
                        <div v-for="category in choiceCategories" :key="category.name"
                            v-show="activeTab === category.name" class="tags">
                            <button v-for="tag in category.tags" :key="tag" type="button" class="tag-button"
                                @click="toggleHobby(tag)" :disabled="false"
                                :class="{ 'is-selected': form.hobbies.includes(tag) }">
                                {{ tag }}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="bio">一言 (50文字以内)</label>
                    <textarea id="bio" v-model="form.bio" rows="3"></textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="submit-btn">登録</button>
                </div>

            </form>
        </main>
    </div>
</template>

<script setup>
import { ref } from 'vue';

// フォームデータをrefで管理
const form = ref({
    faculty: '',
    gender: null,
    origin: '',
    langNative: 'native',
    langSpoken: '',
    langLearning: '',
    hobbies: ['野球'], // ★ hobby を hobbies (配列) に変更
    bio: '',
});

// ★ 既存の選択肢のデータ（サンプル）
const choiceCategories = ref([
    {
        name: 'スポーツ',
        tags: ['野球', 'サッカー', 'バスケ', 'テニス', 'ゴルフ']
    },
    {
        name: '音楽',
        tags: ['J-POP', 'ロック', 'クラシック', 'ジャズ', 'K-POP']
    },
    {
        name: '食べ物',
        tags: ['寿司', 'ラーメン', '焼肉', 'イタリアン', '中華']
    },
    {
        name: '国',
        tags: ['日本', '中国', '韓国', 'アメリカ', 'イギリス']
    },
]);

// ★ 現在選択されているタブ
const activeTab = ref(choiceCategories.value[0].name); // 初期タブを「スポーツ」に

const toggleHobby = (hobbyName) => {
    if (form.value.hobbies.includes(hobbyName)) {
        // 既に含まれていれば削除
        removeHobby(hobbyName);
    } else {
        // 含まれていなければ追加
        addHobby(hobbyName);
    }
};
// ★ 趣味追加ロジック
const addHobby = (hobbyToAdd) => {
    // 既に趣味に追加されていない場合のみ追加
    if (!form.value.hobbies.includes(hobbyToAdd)) {
        form.value.hobbies.push(hobbyToAdd);
    }
};

// ★ 趣味削除ロジック
const removeHobby = (hobbyToRemove) => {
    form.value.hobbies = form.value.hobbies.filter(hobby => hobby !== hobbyToRemove);
};

// フォーム送信時の処理
const registerProfile = () => {
    console.log('フォームが送信されました:', form.value);
    // ここでAPIリクエストなどを実行
};
</script>