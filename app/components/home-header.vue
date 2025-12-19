<template>
  <header class="talk-header">
    <div class="top">
      <span class="title">トーク</span>
    </div>

    <div class="divider"></div>
  </header>
</template>

<style scoped>
.talk-header {
  padding: 10px 12px 0;
}

/* 上段：タイトル中央寄せ */
.top {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* タイトル文字 */
.title {
  font-size: 16px;
  font-weight: 500;
  color: #4b3b2b;
  letter-spacing: 0.05em;
}

/* 緑の線 */
.divider {
  margin-top: 8px;
  height: 2px;
  background: #2ab79f;
  border-radius: 2px;
}
</style>
