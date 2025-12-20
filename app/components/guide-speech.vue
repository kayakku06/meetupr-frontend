<template>
    <div class="fixed right-2 sm:right-4 bottom-16 sm:bottom-20 z-50">
        <!-- ロゴを基準にする箱 -->
        <div class="relative w-[100px] sm:w-[150px]">

            <!-- 吹き出し（ロゴの左上） -->
            <div class="absolute -top-[160px] sm:-top-[220px] -left-[150px] sm:-left-[210px] w-[220px] sm:w-[306px] h-[170px] sm:h-[228px]">
                <!-- SVG -->
                <img src="/bubble.svg" class="absolute inset-0 w-full h-full z-0" />

                <!-- テキスト -->
                <div class="absolute inset-0 z-20
                 flex items-center justify-center
                 px-8 sm:px-12 pt-6 sm:pt-8 pb-12 sm:pb-16
                 text-xs sm:text-sm text-black
                 text-center leading-relaxed whitespace-pre-line">
                    {{ text }}
                </div>
            </div>

            <!-- ロゴ（右側・基準点） -->
            <img src="/meetlogo.svg" class="w-[100px] sm:w-[150px]" />
        </div>
    </div>
</template>

<script setup>
defineProps({
    text: String
})
</script>
