import type { Ref } from 'vue'
import { ref, watch } from 'vue'

const EMPTY_HTML = '<article class="prose prose-sm max-w-none p-4"><p>该节点暂无专题内容。</p></article>'
const ERROR_HTML = '<article class="prose prose-sm max-w-none p-4"><p>节点内容加载失败。</p></article>'

export function useNodeTopicContent(nodeId: Ref<string>) {
  const html = ref(EMPTY_HTML)
  const loading = ref(false)
  const error = ref('')
  let requestToken = 0

  watch(nodeId, async (id) => {
    requestToken += 1
    const currentToken = requestToken

    if (!id) {
      loading.value = false
      error.value = ''
      html.value = EMPTY_HTML
      return
    }

    loading.value = true
    error.value = ''

    try {
      const response = await fetch(`/web-pipeline/node-content/${id}`)
      if (!response.ok)
        throw new Error(`Failed to load node content: ${response.status}`)

      const nextHtml = (await response.text()).trim()
      if (currentToken !== requestToken)
        return

      html.value = nextHtml || EMPTY_HTML
    }
    catch (reason) {
      if (currentToken !== requestToken)
        return

      error.value = reason instanceof Error ? reason.message : String(reason)
      html.value = ERROR_HTML
    }
    finally {
      if (currentToken === requestToken)
        loading.value = false
    }
  }, { immediate: true })

  return {
    html,
    loading,
    error,
  }
}
