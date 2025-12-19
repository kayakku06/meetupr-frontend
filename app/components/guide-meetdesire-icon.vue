<template>
  <div class="minimized-box">
    <svg viewBox="0 0 24 24" class="icon-white-face">
      <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="none"/>
      <path d="M8 9h.01M16 9h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <path d="M7 13.5 Q12 19 17 13.5 Z" fill="white" stroke="none"/>
    </svg>
  </div>
</template>

<style scoped>
.minimized-box {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  background-color: #2ab79f; /* 緑色の背景 */
  z-index: 50;
}
.icon-white-face {
  width: 30px;
  height: 30px;
}
</style>
