---
title: 一个懒人程序员的自我修养 - octohash
display: 一个懒人程序员的自我修养
date: 2026-01-10
duration: 10min
lang: zh-CN
---

[[toc]]

2025 年我写了很多代码，只为一件事：**让我能更懒一点。**

## 依赖管理

我的 Monorepo 里，`package.json` 散落着版本不一的依赖，这不只是看着不舒服的问题，确实埋下了版本不一致的隐患。

[PNPM catalogs](https://pnpm.io/catalogs) 能解决这个问题，它可以在 `pnpm-workspace.yaml` 里集中管理依赖版本，然后在各个 `package.json` 里通过 `catalog:category` 引用。

不久我又刷到 {@antfu|Anthony Fu} 写的 [Categorize Your Dependencies](https://antfu.me/posts/categorize-deps)，里面提到了依赖分类的想法。我想遵循这个实践，不过手动把项目迁移到具名 `catalog:` 对我来说有亿点点累。

### 自动迁移

2025 年 5 月，我决定在实际项目里试试 catalogs。PNPM 官方其实提供了一个迁移工具 `pnpx codemod pnpm/catalog`，但它只能把所有依赖迁移到默认的 catalog。如果我想按功能划分依赖，就得：

1. 在 `pnpm-workspace.yaml` 里手动创建分类；
2. 把每个依赖的版本号复制粘贴过去；
3. 再到 `package.json` 里把版本号替换成 `catalog:category` 格式；
4. 再来一次又一次...

于是我写了 [pncat](https://github.com/jinghaihan/pncat)，实现了几个核心命令：

- <code important-text-lime>detect</code>: 扫描项目，找出可以迁移到 catalog 的依赖
- <code important-text-purple>migrate</code>: 按规则自动分类并迁移
- <code important-text-orange>add/remove</code>: 安装或删除依赖时，自动更新 catalog
- <code important-text-cyan>clean</code>: 清理 catalog 里已不再使用的依赖
- <code important-text-amber>revert</code>: 把 catalog 配置还原成普通版本号

当然，分类没有标准答案。同一个依赖在不同类型的仓库中意图不同，往往适合不同的 `catalog:`，所以我实现了一套容易继承和扩展的规则系统。

```ts
import { defineConfig, mergeCatalogRules } from 'pncat'

export default defineConfig({
  catalogRules: mergeCatalogRules([
    {
      name: 'cli',
      match: [/pncat/],
    }
  ]),
})
```

**副作用**：因为要给 `pncat` 更新 README 截图，我开发了 [termsnap](https://github.com/jinghaihan/termsnap) 自动给终端截图、录屏。

### 包管理器支持

到了下半年，[Bun](https://bun.com/docs/pm/catalogs) 和 [Yarn](https://yarnpkg.com/features/catalogs) 也支持了 `catalogs:`。概念基本与 PNPM 相同，我就让 [pncat](https://github.com/jinghaihan/pncat) 也支持了它们。

我还给 2 个我很喜欢的工具提了 PR：

- 我通常用 [taze](https://github.com/antfu-collective/taze) 做依赖升级，给它加了 [Yarn Catalog](https://github.com/antfu-collective/taze/pull/218) 支持。
- 我很喜欢 [PNPM Catalog Lens](https://github.com/antfu/vscode-pnpm-catalog-lens) 这个插件，给它加了 [Bun Catalog](https://github.com/antfu/vscode-pnpm-catalog-lens/pull/25) 支持，还帮它 [rebrand](https://github.com/antfu/vscode-pnpm-catalog-lens/pull/27) 成了 [Catalog Lens](https://marketplace.visualstudio.com/items?itemName=antfu.pnpm-catalog-lens)。

## IDE

我把主力编辑器换成了 Cursor，因为它聪明。但用着用着发现新问题：插件装不了、配置对不上、还总是按着你的头让人用它的 AI 功能。

### 插件发布

由于 VS Code 的 [License](https://code.visualstudio.com/license) 限制，Cursor 不能直接从 Visual Studio Marketplace 下载插件。插件作者一个个去 Open VSX 同步很耗费精力，所以我开发了 [vsxpub](https://github.com/jinghaihan/vsxpub)，能在 CI 里把插件发到 Visual Studio Marketplace、Open VSX 和 GitHub Release。

不过 CI 执行时需要获取不同平台的 Token，给所有 VS Code 仓库配置 secrets 也是有亿点点麻烦。于是我又写了 [gh-secrets-sync](https://github.com/jinghaihan/gh-secrets-sync)，能从一个中心库同步 secrets 到其他仓库。

非常幸运的是，得到了不少仓库的采纳（其实只有两个作者🤣）：

- [vscode-pnpm-catalog-lens](https://github.com/antfu/vscode-pnpm-catalog-lens/pull/21)
- [vscode-file-nesting-config](https://github.com/antfu/vscode-file-nesting-config/pull/295)
- [vscode-iconify](https://github.com/antfu/vscode-iconify/pull/110)
- [vscode-theme-vitesse](https://github.com/antfu/vscode-theme-vitesse/pull/40)
- [vscode-icons-carbon](https://github.com/antfu/vscode-icons-carbon/pull/15)
- [vscode-eslint-codemod](https://github.com/kvoon3/vscode-eslint-codemod/pull/2)
- [...](/projects/contributions)

### 开发体验

我通常用 [vscode-ext-gen](https://github.com/antfu/vscode-ext-gen) 来提升 VS Code 插件的开发体验，它会自动根据 `package.json` 生成常量和 README。

当我准备 Fork 一个很有趣的插件 [vscode-power-mode](https://github.com/hoovercj/vscode-power-mode) 时，我发现 Array 类型的 `configuration` 不支持。于是我给 vscode-ext-gen 提了 [PR](https://github.com/antfu/vscode-ext-gen/pull/28) 加上了 Array 配置支持，顺便还支持了 [i18n](https://github.com/antfu/vscode-ext-gen/pull/29)。

### 工作流优化

很长一段时间我同时用着 VS Code 和 Cursor，两个编辑器的配置老是需要手动同步。于是我写了 [vscode-crosside-sync](https://github.com/jinghaihan/vscode-crosside-sync) 来自动同步多个 VS Code Forks 之间的配置。

不过众所周知的原因，有些插件在 Cursor 里没法直接下载。我又写了 [vsix-downloader](https://github.com/jinghaihan/vsix-downloader)，基于它完善了插件同步的实现。

Cursor 最让我难受的是，它第一次打开项目时会强制打开 Chat 界面。我不觉得上来就和 LLM 聊天是个好的开发方式，我为此写了 [vscode-auto-chat-blocker](https://github.com/jinghaihan/vscode-auto-chat-blocker)，总共 15 行代码，但 Cursor 就是不愿意给一个简单的 Toggle。

我通常用 [Raycast](https://www.raycast.com/) 的插件来打开项目，但因为我同时用 VS Code 和 Cursor，所以写了 [raycast-code-finder](https://github.com/jinghaihan/raycast-code-finder) 合并 VS Code Base IDE 的历史打开记录。值得一提的是，它也有 [VS Code](https://github.com/jinghaihan/vscode-crosside-code-finder) 插件版本。为了更方便地同步历史记录，我还做了个 [CLI](https://github.com/jinghaihan/code-finder) 版本，支持扫描指定目录并添加到 IDE 的 SQLite 文件中。

后来我对 Raycast 把插件中心化管理到一个[仓库](https://github.com/raycast/extensions)感到异常的迷惑，于是写了 [rayext](https://github.com/jinghaihan/rayext) ，一个去中心化的 Raycast 包管理器。

我还给 [ni](https://github.com/antfu-collective/ni) 提了个 [PR](https://github.com/antfu-collective/ni/pull/290)，让 `nr` 命令能更好地支持 monorepo。

## 开发

我的公司团队今年主要在做智能体方向，问答过程中的 Markdown 渲染有一些自定义要求。我学习了 [streamdown](https://github.com/vercel/streamdown) 的 AST 解析方式后，写了 [vue-stream-markdown](https://github.com/jinghaihan/vue-stream-markdown)。它支持流式渲染、代码高亮、Mermaid 图表等功能，而且能够满足各种定制化刁难。

开发组件库时遇到一个问题：[tsdown](https://github.com/rolldown/tsdown) 之类的 bundler 不会自动给 SFC 写法的 Vue 组件引入自己的 CSS。通常我需要手动把 CSS 合并到一个文件里，但这样开发体验不太好。我希望开发时能用 SFC 写法，构建时再合并样式，于是我把 Vite 的 CSS Code Splitting 搬到了 [tsdown](https://github.com/rolldown/tsdown/pull/654)。

## 最后

其实还有很多没列出来的[小玩具](/projects/contributions)。

感谢 {@antfu|Anthony Fu} 和 {@sxzz|Kevin Deng} 对我的一次又一次耐心指导。

另外，追星成功！

<div class="rounded-lg overflow-clip max-w-100">
  <img class="w-full" src="/images/coding-for-laziness.png" data-zoomable />
</div>
