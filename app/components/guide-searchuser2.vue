<template>
    <div class="
    relative
    flex items-center space-x-3
    p-3
    bg-[#FFF5C9]              <!-- ★追加 -->
    border-b
    border-white
    hover:bg-gray-50
    transition
    zen-maru
  ">
        <!-- 仮アバター -->
        <div class="w-12 h-12 rounded-full -mt-6 flex items-center justify-center
             bg-gradient-to-br from-[#FEBC6E] to-[#f39a5e]
             text-white font-bold text-lg shadow">
            U
        </div>

        <div class="flex flex-col">
            <!-- 名前＋国旗（ダミー） -->
            <div class="flex items-center space-x-2">
                <span class="font-medium text-base">ユーザー名</span>
                <span class="w-6 h-4 bg-gray-300 rounded-sm"></span>
            </div>

            <!-- メッセージ -->
            <span class="text-gray-600 text-sm">
                よろしくお願いします！
            </span>

            <!-- 趣味チップ（ダミー） -->
            <div class="flex flex-wrap gap-2 mt-3">
                <span class="px-3 py-1 bg-white border-2 border-container rounded-full
                 text-xs text-[#4b3b2b]">
                    サッカー
                </span>
                <span class="px-3 py-1 bg-white border-2 border-container rounded-full
                 text-xs text-[#4b3b2b]">
                    ゲーム
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
// デザイン確認用のため script は空
</script>
