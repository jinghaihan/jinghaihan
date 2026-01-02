import type { ProjectCategory } from '@/types'

export const OSS_PROJECTS: ProjectCategory[] = [
  {
    name: 'Vue Ecosystem',
    icon: 'i-ri:vuejs-fill',
    projects: [
      {
        name: 'vue-stream-markdown',
        description: 'Streaming markdown output, Useful for text streams like LLM outputs',
        icon: 'i-ri:markdown-line',
        pinned: true,
      },
      {
        name: 'vue-color-palette',
        description: 'Color picker with linear/radial gradient support',
        icon: 'i-tdesign:fill-color',
        pinned: true,
      },
    ],
  },
  {
    name: 'Command Line Interface',
    icon: 'i-tabler:terminal-2',
    projects: [
      {
        name: 'pncat',
        description: 'Enhanced catalogs feature with PNPM, Yarn, Bun and Vlt support',
        icon: 'i-tabler:brand-pnpm',
        pinned: true,
      },
      {
        name: 'vsxpub',
        description: 'A CLI tool to publish VS Code extensions to Marketplace, OpenVSX, and GitHub Releases',
        icon: 'i-tabler:world-upload',
        pinned: true,
      },
      {
        name: 'termsnap',
        description: '📸 Creates beautiful screenshots, videos, and GIFs based on terminal command output',
        icon: 'i-ri:screenshot-fill',
        pinned: true,
      },
      {
        name: 'turnpress',
        description: 'Markdown, Docx to VitePress converter, powered by pandoc and turndown',
        icon: 'i-simple-icons:vitepress',
      },
      {
        name: 'gh-secrets-sync',
        description: '🔐 CLI tool to batch sync GitHub Actions secrets across multiple repositories',
        icon: 'i-tabler:lock-cog',
      },
      {
        name: 'gh-contrib-export',
        description: 'A CLI to export GitHub contributions and publish to a GitHub Gist',
        icon: 'i-tabler:git-pull-request',
      },
      {
        name: 'code-finder',
        description: 'CLI to detect codespaces and update IDE opened histories',
        icon: 'i-lucide:search-code',
      },
      {
        name: 'dep-finder',
        description: 'A CLI tool for discovering dependency usage across multiple repositories',
        icon: 'i-tabler:package',
      },
      {
        name: 'vsix-downloader',
        description: 'A CLI to Fetch Vsix Files from Visual Studio Marketplace',
        icon: 'i-vscode-icons:file-type-vsix',
      },
      {
        name: 'vscterm-palette',
        description: '🎨 CLI tool to convert VSCode themes to terminal color schemes',
        icon: 'i-tabler:color-swatch',
      },
      {
        name: 'unocss-webcomponent-helper',
        description: 'An agnostic UnoCSS generator that creates isolated styles for each component',
        icon: 'i-logos:unocss',
      },
      {
        name: 'gitlab-repo-inspector',
        description: 'A tool to scan GitLab groups and subgroups, list all repositories, detect monorepos, and fetch the latest tag',
        icon: 'i-tabler:brand-gitlab',
      },
      {
        name: 'rayext',
        description: 'A decentralized extension manager for Raycast',
        icon: 'i-simple-icons:raycast',
      },
      {
        name: 'audmux',
        description: '🎧 Extract and remux audio streams from online video sources.',
        icon: 'i-ri:bilibili-line',
      },
    ],
  },
  {
    name: 'VS Code',
    icon: 'i-tabler:brand-vscode',
    projects: [
      {
        name: 'vscode-crosside-sync',
        description: 'Extension that synchronizes settings, keybindings and extensions across VSCode and its forks',
        icon: 'i-material-symbols-light:directory-sync',
        pinned: true,
      },
      {
        name: 'vscode-crosside-code-finder',
        description: 'Syncs recent projects across VSCode and its forks, with Codespaces detection',
        icon: 'i-lucide:search-code',
      },
      {
        name: 'vscode-auto-chat-blocker',
        description: 'Extension to prevent Cursor AI chat from opening automatically on launch',
        icon: 'i-akar-icons:chat-error',
      },
      {
        name: 'vscode-zen-tabs',
        description: 'A VSCode extension for managing tabs with zen-like focus — clean idle tabs, and choose where new tabs open',
        icon: 'i-fluent:tabs-16-regular',
      },
      {
        name: 'vscode-reactive-theme-settings',
        description: 'Reacts to theme changes and automatically applies related settings like icon themes',
        icon: 'i-line-md:light-dark',
      },
      {
        name: 'vscode-power-mode-plus',
        description: 'Your code is powerful, unleash it!',
        icon: 'i-ri:sparkling-2-line',
      },
    ],
  },
  {
    name: 'Raycast',
    icon: 'i-simple-icons:raycast',
    projects: [

      {
        name: 'raycast-code-finder',
        description: 'Merge recent projects across VSCode and its forks',
        icon: 'i-lucide:search-code',
      },
      {
        name: 'raycast-clash',
        description: 'Monitor your Clash with Raycast',
        icon: '',
      },
    ],
  },
  {
    name: 'Utilities',
    icon: 'i-tabler:plug',
    projects: [
      {
        name: 'treechop',
        description: '🌳 A lightweight TypeScript utility library for working with tree data structures, providing common operations',
        icon: 'i-ph:tree-bold',
      },
    ],
  },
  {
    name: 'Game',
    icon: 'i-tabler:device-gamepad-2',
    projects: [
      {
        name: 'mhrise-cheat-generator',
        description: 'Cheat generator for Monster Hunter Rise: Sunbreak (Switch)',
        icon: '',
      },
    ],
  },
]
