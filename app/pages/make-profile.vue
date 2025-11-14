<template>
    <div class="max-w-[420px] mx-auto bg-white border rounded-xl shadow-md overflow-hidden">
        <header class="bg-[#4a90e2] text-white py-3 text-center font-bold text-base">
            プロフィール設定画面
        </header>

        <main class="bg-[#FFF5C9] px-5 py-4">
            <nav class="flex items-center mb-6">
                <span class="text-3xl font-bold text-gray-700 pr-4 cursor-pointer">‹</span>
                <h1 class="text-lg font-bold flex-1 text-center pr-7">プロフィール登録</h1>
            </nav>

            <div class="flex justify-center mb-6">
                <div class="w-[110px] h-[110px] rounded-full bg-gray-100 flex items-center justify-center relative border border-gray-200 cursor-pointer">
                    <div class="text-gray-500">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                                stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="#888"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div class="absolute -bottom-1 -right-1 bg-[#4a90e2] text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold border-2 border-white">+</div>
                </div>
            </div>

            <form @submit.prevent="registerProfile" class="flex flex-col gap-5">

                <div>
                    <label class="text-sm font-semibold text-gray-800 mb-1 block" for="faculty">学部</label>
                    <select id="faculty" v-model="form.faculty" class="w-full px-3 py-3 rounded-md text-base bg-white border-[3px] border-[#FEBC6E] box-border">
                        <option value="" disabled selected></option>
                        <option value="engineering">工学部</option>
                        <option value="economics">経済学部</option>
                        <option value="literature">文学部</option>
                    </select>
                </div>

                <div>
                    <label class="text-sm font-semibold text-gray-800 mb-1 block">性別</label>
                    <div class="flex gap-5 items-center mt-1">
                        <label class="flex items-center gap-2 text-base"><input type="radio" v-model="form.gender" value="male" class="mr-1"> 男性</label>
                        <label class="flex items-center gap-2 text-base"><input type="radio" v-model="form.gender" value="female" class="mr-1"> 女性</label>
                        <label class="flex items-center gap-2 text-base"><input type="radio" v-model="form.gender" value="other" class="mr-1"> その他</label>
                    </div>
                </div>

                <div>
                    <label class="text-sm font-semibold text-gray-800 mb-1 block" for="origin">出身</label>
                    <input type="text" id="origin" v-model="form.origin" class="w-full px-3 py-3 rounded-md text-base bg-white border-[3px] border-[#FEBC6E] box-border">
                </div>

                <div>
                    <label class="text-sm font-semibold text-gray-800 mb-1 block">言語</label>
                    <div class="flex flex-col gap-2">
                        <select v-model="form.langNative" class="w-full px-3 py-3 rounded-md text-base bg-white border-[3px] border-[#FEBC6E] box-border">
                            <option value="native">ネイティブ</option>
                        </select>
                        <select v-model="form.langSpoken" class="w-full px-3 py-3 rounded-md text-base bg-white border-[3px] border-[#FEBC6E] box-border">
                            <option value="">話せる言語</option>
                            <option value="en">英語</option>
                            <option value="cn">中国語</option>
                        </select>
                        <select v-model="form.langLearning" class="w-full px-3 py-3 rounded-md text-base bg-white border-[3px] border-[#FEBC6E] box-border">
                            <option value="">学びたい言語</option>
                            <option value="fr">フランス語</option>
                            <option value="es">スペイン語</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="text-sm font-semibold text-gray-800 mb-1 block">趣味</label>
                    <div class="flex flex-wrap gap-2 p-2 border-[3px] border-[#FEBC6E] rounded-md bg-white min-h-[46px] box-border">
                        <span v-if="form.hobbies.length === 0" class="text-gray-400 text-base leading-6">下の選択肢から趣味を選んでください</span>
                        <button v-for="hobby in form.hobbies" :key="hobby" type="button" @click="removeHobby(hobby)" class="bg-[#fceb96] text-gray-800 border border-[#FEBC6E] rounded-md px-3 py-1 text-sm">
                            {{ hobby }} <span class="ml-1 font-bold opacity-70">×</span>
                        </button>
                    </div>
                </div>

                <div>
                    <label class="text-sm font-semibold text-gray-800 mb-1 block">既存の選択肢</label>
                    <div class="bg-white p-3 border-[3px] border-[#FEBC6E] rounded-md">
                        <div class="flex gap-4 pb-3 border-b border-[#FEBC6E] mb-3">
                            <span v-for="category in choiceCategories" :key="category.name" @click="activeTab = category.name" :class="activeTab === category.name ? 'text-[#4a90e2] font-bold border-b-2 border-[#4a90e2]' : 'text-gray-600 font-medium'">
                                {{ category.name }}
                            </span>
                        </div>
                        <div v-for="category in choiceCategories" :key="category.name" v-show="activeTab === category.name" class="flex flex-wrap gap-2">
                            <button v-for="tag in category.tags" :key="tag" type="button" @click="toggleHobby(tag)" :disabled="false" :class="form.hobbies.includes(tag) ? 'bg-[#fceb96] text-gray-400 border border-[#FEBC6E] rounded-md px-3 py-1 text-sm line-through cursor-not-allowed' : 'bg-white border border-[#FEBC6E] rounded-sm px-3 py-1 text-sm cursor-pointer hover:bg-gray-100'">
                                {{ tag }}
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="text-sm font-semibold text-gray-800 mb-1 block" for="bio">一言 (50文字以内)</label>
                    <textarea id="bio" v-model="form.bio" rows="3" class="w-full px-3 py-3 rounded-md text-base bg-white border-[3px] border-[#FEBC6E] box-border resize-y min-h-[60px]"></textarea>
                </div>

                <div class="text-center mt-2">
                    <button type="submit" class="bg-[#5a9a94] text-white py-3 px-10 rounded-md font-bold w-full max-w-[250px] mx-auto transition hover:bg-[#4a8079]">登録</button>
                </div>

            </form>
        </main>
    </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

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