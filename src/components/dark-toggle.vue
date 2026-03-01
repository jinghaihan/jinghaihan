<template>
  <div cursor-pointer>
    <div
      i-ri:sun-line hover:i-ri:sun-fill dark:i-ri:moon-line hover:dark:i-ri:moon-fill
      @click="toggleDark"
    />
  </div>
</template>
