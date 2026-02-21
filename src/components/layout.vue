<script setup lang="ts">
const navItems = computed(() => [
  {
    path: '/',
    label: 'About',
    icon: [],
    visible: () => !isMobile.value,
  },
  {
    path: '/posts',
    label: 'Posts',
    icon: ['i-ri:article-line', 'i-ri:article-fill'],
  },
  {
    path: '/projects',
    label: 'Projects',
    icon: ['i-ri:lightbulb-line', 'i-ri:lightbulb-fill'],
  },
].filter(item => typeof item.visible === 'function' ? item.visible() : true))

const NAV_TEXT = [
  'no-underline',
  'text-gray-500',
  'dark:text-gray-400',
  'hover:text-gray-900',
  'dark:hover:text-gray-100',
  'transition-colors',
]
</script>

<template>
  <div mx-auto flex flex-col max-w-160 min-h-screen w-full>
    <header p-6 bg-background flex w-full items-center top-0 justify-between sticky z-100>
      <RouterLink
        to="/"
        text-xl text-foreground font-mono font-semibold
      >
        octohash
      </RouterLink>

      <nav flex gap-4 items-center>
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          text-sm relative
          :class="NAV_TEXT"
        >
          <template v-if="isMobile">
            <div
              text-lg transition-all
              :class="[item.icon[0], `hover:${item.icon[1]}`]"
            />
          </template>
          <template v-else>
            {{ item.label }}
          </template>
        </RouterLink>
        <Github :class="NAV_TEXT" />
        <Twitter :class="NAV_TEXT" />
        <Bluesky :class="NAV_TEXT" />
        <DarkToggle :class="NAV_TEXT" />
      </nav>
    </header>

    <main p-6 flex-1 w-full lg:p-8>
      <slot />
    </main>

    <Footer />
  </div>
</template>
